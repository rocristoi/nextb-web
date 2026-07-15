import {
  computeComfortScore,
  comfortTierFromScore,
  sortByComfortThenEta,
} from "@/lib/comfort/score";
import { serverConfig } from "./config";
import {
  calculateTramToStationDistance,
  estimateStopsAway,
  getRouteModeByRouteId,
  getShapeById,
  loadRoutesData,
  parseStationLocation,
} from "./gtfs";
import {
  buildDatasetIndexes,
  fetchMobiBusData,
  fetchMobiLiveBundle,
  fetchMobiNextArrivals,
  findDatasetEntry,
  refreshMobiBusData,
} from "./mobi";
import {
  isVehicleCompatibleWithLine,
  resolveVehicle,
} from "./resolve-vehicle";
import { getVehicleType, resolveVehicleWithAc } from "./vehicles";
import { getCityTourForLine, UNKNOWN_VEHICLE_IMAGE } from "@/lib/vehicles/imageMap";
import type { RouteShapeResponse, StationResponse, AcConfidence, ComfortTier, RouteVehicle } from "@/lib/types";
import type { MobiDatasetEntry, MobiStationArrivals, MobiVehicleFeedEntry } from "./mobi-types";
import {
  assignFollowerEtas,
  sanitizeLeadEta,
} from "./data-quality";
import {
  getShapeProximity,
  ROUTE_SHAPE_PROXIMITY_METERS,
  shapeEndpointDistance,
} from "./route-shape-proximity";
import { ro } from "@/lib/i18n";

const STALE_DATA_WAIT_MS = 5000;

const isTimestampRecent = (timestamp: number) => {
  const now = new Date();
  const givenTime = new Date(timestamp * 1000);
  const diffInSeconds = (now.getTime() - givenTime.getTime()) / 1000;
  return diffInSeconds <= serverConfig.lineCheckCooldown();
};

type StationVehicleEntry = {
  id: number | null;
  distance: number;
  position: [number, number];
  plate: string;
  on_board: number | null;
  ac?: boolean;
  acConfidence?: AcConfidence;
  type?: string;
  image?: string | null;
  comfortScore?: number;
  comfortTier?: ComfortTier;
  stopsAway?: number | null;
  time?: number | string;
};

function filterVehiclesForLine(
  allVehicles: MobiVehicleFeedEntry[],
  line: { id: unknown; direction: unknown }
) {
  return allVehicles.filter(
    (veh) =>
      veh?.vehicle?.trip &&
      veh?.vehicle?.vehicle &&
      veh.vehicle.trip.routeId == line.id &&
      veh.vehicle.trip.directionId != null &&
      Number(veh.vehicle.trip.directionId) === Number(line.direction)
  );
}

async function refreshVehiclesIfStale(
  vehicles: MobiVehicleFeedEntry[],
  lines: { id: unknown; direction: unknown }[]
): Promise<MobiVehicleFeedEntry[]> {
  const hasStaleLineVehicles = lines.some((line) => {
    const filtered = filterVehiclesForLine(vehicles, line);
    return (
      filtered.length > 0 &&
      !filtered.every(
        (veh) =>
          veh.vehicle.timestamp != null &&
          isTimestampRecent(veh.vehicle.timestamp)
      )
    );
  });

  if (!hasStaleLineVehicles) return vehicles;

  await new Promise((resolve) => setTimeout(resolve, STALE_DATA_WAIT_MS));

  try {
    return await refreshMobiBusData();
  } catch {
    return vehicles;
  }
}

async function enrichVehicle(veh: StationVehicleEntry, lineName: string) {
  if (veh.id == 0 || veh.id == null) {
    const cityTour = getCityTourForLine(lineName);
    const type = cityTour?.type ?? getVehicleType(parseInt(lineName));
    veh.ac = false;
    veh.acConfidence = "none";
    veh.type = type;
    veh.image = cityTour?.image ?? UNKNOWN_VEHICLE_IMAGE;
    veh.comfortScore = computeComfortScore("none", veh.on_board);
    veh.comfortTier = comfortTierFromScore(veh.comfortScore);
  } else {
    const resolved = await resolveVehicleWithAc(veh.id, lineName);
    veh.ac = resolved.ac;
    veh.acConfidence = resolved.acConfidence;
    veh.type = resolved.type;
    veh.image = resolved.image;
    veh.comfortScore = computeComfortScore(resolved.acConfidence, veh.on_board);
    veh.comfortTier = comfortTierFromScore(veh.comfortScore);
  }

  if (typeof veh.distance === "number") {
    veh.stopsAway = estimateStopsAway(veh.distance);
  }
}

function assignVehicleArrivalTimes(
  vehicles: { distance: number; time?: number | string }[],
  nextArrivalTime: number | null,
  lineMode?: string
) {
  if (!vehicles.length) return;

  const lead = vehicles[0];
  const sanitized = sanitizeLeadEta(nextArrivalTime, lead.distance, lineMode);
  lead.time = sanitized.time;

  const leadMin =
    typeof sanitized.time === "number" ? sanitized.time : null;
  assignFollowerEtas(vehicles, leadMin);
}

export async function getStationArrivals(
  stationID: string
): Promise<StationResponse> {
  let allVehicles: MobiVehicleFeedEntry[];
  let stationInfo: MobiStationArrivals;
  let datasetByPlate: Map<string, MobiDatasetEntry>;
  let datasetByInventory: Map<number, MobiDatasetEntry>;

  try {
    const datasetIndexes = await buildDatasetIndexes();
    [allVehicles, stationInfo] = await Promise.all([
      fetchMobiBusData(),
      fetchMobiNextArrivals(stationID),
    ]);
    datasetByPlate = datasetIndexes.byPlate;
    datasetByInventory = datasetIndexes.byInventory;
  } catch {
    throw new Error("SERVICE_UNAVAILABLE");
  }

  const nextArrivals = stationInfo;
  const routes = await loadRoutesData();
  const lines = Array.isArray(stationInfo?.lines) ? stationInfo.lines : [];
  allVehicles = await refreshVehiclesIfStale(allVehicles, lines);

  const finalObject: StationResponse = {
    name: stationInfo?.name ?? ro.station.fallbackName,
    address: stationInfo?.address ?? "",
    lines: {},
  };

  for (const line of lines.sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    let nextArrivalTime: number | null = null;

    if (Array.isArray(nextArrivals?.lines)) {
      const arrivalLine = nextArrivals.lines.find(
        (l) => String(l.id) === String(line.id)
      );
      if (arrivalLine?.arrivingTime !== undefined) {
        nextArrivalTime = arrivalLine.arrivingTime;
      }
    }

    const lineMode = routes[line.name]?.type;
    const filteredVehicles = filterVehiclesForLine(allVehicles, line);

    let stationPos: { stop_lat: number; stop_lon: number };
    try {
      stationPos = await parseStationLocation(stationID);
    } catch {
      finalObject.lines[line.name] = [];
      continue;
    }

    const distAndIdPromises = filteredVehicles.map(async (veh) => {
      const vehLat = veh.vehicle.position.latitude;
      const vehLong = veh.vehicle.position.longitude;
      const plate = veh.vehicle.vehicle.licensePlate;
      const thId = Number(veh.vehicle.vehicle.th_id);
      const inventoryHint = thId > 0 ? thId : null;
      const datasetEntry = findDatasetEntry(
        datasetByPlate,
        datasetByInventory,
        plate,
        inventoryHint
      );
      const resolved = await resolveVehicle(veh, datasetEntry, lineMode);

      if (!isVehicleCompatibleWithLine(resolved.mode, lineMode)) {
        return null;
      }

      const shapeID = "" + line.id + line.direction;
      const dist = await calculateTramToStationDistance(
        [vehLat, vehLong],
        [stationPos.stop_lat, stationPos.stop_lon],
        shapeID
      );
      if (dist !== "past") {
        return {
          id: resolved.inventoryId,
          distance: dist,
          position: [vehLat, vehLong] as [number, number],
          plate: resolved.plate ?? plate,
          on_board: resolved.on_board,
        };
      }
      return null;
    });

    let orderedIDs = (await Promise.all(distAndIdPromises)).filter(
      (entry): entry is StationVehicleEntry => entry != null
    );
    orderedIDs = orderedIDs.sort((a, b) => a.distance - b.distance);

    for (let i = 0; i < orderedIDs.length; i++) {
      try {
        await enrichVehicle(orderedIDs[i], line.name);
      } catch {
        orderedIDs[i].type = "Unknown";
      }
    }

    assignVehicleArrivalTimes(orderedIDs, nextArrivalTime, lineMode);
    finalObject.lines[line.name] = orderedIDs as StationResponse["lines"][string];
  }

  return finalObject;
}

export async function getRouteShapeData(
  shapeID: string,
  routeName?: string
): Promise<RouteShapeResponse> {
  const tour = `${shapeID}0`;
  const retour = `${shapeID}1`;

  const [tourShape, retourShape, liveBundle, lineMode] = await Promise.all([
      getShapeById(tour),
      getShapeById(retour),
      fetchMobiLiveBundle(),
      getRouteModeByRouteId(shapeID),
    ]);

  const { datasetByPlate, datasetByInventory } = liveBundle;
  let busData = liveBundle.busData;
  busData = await refreshVehiclesIfStale(busData, [
    { id: shapeID, direction: 0 },
    { id: shapeID, direction: 1 },
  ]);

  const result: {
    tour: RouteShapeResponse["tour"]["vehicles"];
    retour: RouteShapeResponse["retour"]["vehicles"];
  } = { tour: [], retour: [] };

  for (const v of busData) {
    if (!v.vehicle?.trip || !v.vehicle?.vehicle) continue;
    if (String(v.vehicle.trip.routeId) !== String(shapeID)) continue;

    const plate = v.vehicle.vehicle.licensePlate;
    const thId = Number(v.vehicle.vehicle.th_id);
    const inventoryHint = thId > 0 ? thId : null;
    const datasetEntry = findDatasetEntry(
      datasetByPlate,
      datasetByInventory,
      plate,
      inventoryHint
    );
    const resolved = await resolveVehicle(v, datasetEntry, lineMode);

    if (!isVehicleCompatibleWithLine(resolved.mode, lineMode)) {
      continue;
    }

    const vehLat = v.vehicle.position.latitude;
    const vehLon = v.vehicle.position.longitude;
    const vehCoords: [number, number] = [vehLat, vehLon];
    const routeShape =
      v.vehicle.trip.directionId === 0 ? tourShape : retourShape;

    if (!routeShape?.length) continue;

    const proximity = getShapeProximity(vehCoords, routeShape);
    if (!proximity || proximity.minDist > ROUTE_SHAPE_PROXIMITY_METERS) continue;

    const { shapeProgressMeters, shapeLengthMeters: cumulative } = proximity;

    const id = resolved.inventoryId;
    const on_board = resolved.on_board;
    const licensePlate = resolved.plate ?? plate ?? null;

    const vehicleResolved = await resolveVehicleWithAc(id, routeName);
    const comfortScore = computeComfortScore(
      vehicleResolved.acConfidence,
      on_board
    );
    const shapeEnd = routeShape[routeShape.length - 1];
    const distToEnd = shapeEndpointDistance(vehCoords, shapeEnd);
    const remainingMeters = Math.min(
      distToEnd,
      shapeProgressMeters > 0 ? cumulative - shapeProgressMeters : distToEnd
    );

    const vehicleEntry: RouteVehicle = {
      id,
      type: vehicleResolved.type,
      img: vehicleResolved.image,
      ac: vehicleResolved.ac,
      acConfidence: vehicleResolved.acConfidence,
      comfortScore,
      comfortTier: comfortTierFromScore(comfortScore),
      stopsAway: estimateStopsAway(remainingMeters),
      on_board,
      licensePlate,
      position: { latitude: vehLat, longitude: vehLon },
      vehicle: {
        vehicle: {
          id: v.vehicle.vehicle.id ?? String(v.id ?? ""),
          th_id: v.vehicle.vehicle.th_id,
          licensePlate: v.vehicle.vehicle.licensePlate,
        },
        position: v.vehicle.position,
        trip: {
          routeId: String(v.vehicle.trip.routeId),
          directionId: v.vehicle.trip.directionId,
        },
      },
    };

    if (v.vehicle.trip.directionId === 0) {
      result.tour.push(vehicleEntry);
    } else {
      result.retour.push(vehicleEntry);
    }
  }

  const sortVehicles = (list: RouteShapeResponse["tour"]["vehicles"]) =>
    sortByComfortThenEta(list.map((v) => ({ ...v, time: undefined })));

  return {
    tour: { shape: tourShape ?? [], vehicles: sortVehicles(result.tour) },
    retour: { shape: retourShape ?? [], vehicles: sortVehicles(result.retour) },
  };
}
