import { isAstraImperioId } from "@/lib/vehicles/imageMap";
import {
  getFleetInfo,
  getFleetModelNameFromInfo,
  getFleetVehicleImage,
  resolveFleetInfo,
  resolveVehicleByInventory,
  type FleetVehicleInfo,
} from "@/lib/vehicles/fleetInfo";
import { normalizePlate } from "@/lib/vehicles/plate";
import { cache } from "@/lib/server/cache";
import { getShapeById, loadRoutesData } from "@/lib/server/gtfs";
import { fetchMobiLiveBundle, findDatasetEntry } from "@/lib/server/mobi";
import {
  getVehicleModeSync,
  isVehicleCompatibleWithLine,
  resolveVehicle,
} from "@/lib/server/resolve-vehicle";
import { isOnRouteShape } from "@/lib/server/route-shape-proximity";
import type { VehicleSearchResult } from "@/lib/types";
import { resolveVehicleWithAc } from "@/lib/server/vehicles";

export type LiveInfo = {
  routeId: string;
  lineName?: string;
  lineType?: string;
  on_board: number | null;
  inventoryId?: number;
  plate?: string;
};

export type LiveVehicleMaps = {
  byPlate: Map<string, LiveInfo>;
  byInventory: Map<number, LiveInfo>;
};

async function getRouteNameMap(): Promise<Map<string, string>> {
  const cacheKey = "route_id_to_name";
  const cached = cache.get<Map<string, string>>(cacheKey);
  if (cached) return cached;

  const routes = await loadRoutesData();
  const map = new Map<string, string>();
  const typeMap = new Map<string, string>();
  for (const [name, info] of Object.entries(routes)) {
    map.set(String(info.id), name);
    typeMap.set(String(info.id), info.type);
  }
  cache.set(cacheKey, map, 3600);
  cache.set("route_id_to_type", typeMap, 3600);
  return map;
}

async function getRouteTypeMap(): Promise<Map<string, string>> {
  const cached = cache.get<Map<string, string>>("route_id_to_type");
  if (cached) return cached;
  await getRouteNameMap();
  return cache.get<Map<string, string>>("route_id_to_type") ?? new Map();
}

function findLiveInfo(
  liveMaps: LiveVehicleMaps,
  inventory: number,
  plate?: string | null
): LiveInfo | undefined {
  const plateKey = plate ? normalizePlate(plate) : "";
  if (plateKey) {
    const byPlate = liveMaps.byPlate.get(plateKey);
    if (byPlate) return byPlate;
  }
  return liveMaps.byInventory.get(inventory);
}

export async function getLiveVehicleMaps(): Promise<LiveVehicleMaps> {
  const cacheKey = "live_vehicles_maps_v1";
  const cached = cache.get<LiveVehicleMaps>(cacheKey);
  if (cached) return cached;

  const routeNames = await getRouteNameMap();
  const routeTypes = await getRouteTypeMap();
  const byPlate = new Map<string, LiveInfo>();
  const byInventory = new Map<number, LiveInfo>();

  try {
    const { busData, datasetByPlate, datasetByInventory } =
      await fetchMobiLiveBundle();
    const shapeCache = new Map<string, [number, number][] | null>();

    for (const v of busData) {
      const routeId = v.vehicle?.trip?.routeId;
      if (!routeId) continue;

      const directionId = v.vehicle?.trip?.directionId;
      if (directionId == null) continue;

      const plate = v.vehicle?.vehicle?.licensePlate;
      const thId = Number(v.vehicle?.vehicle?.th_id);
      const inventoryHint = thId > 0 ? thId : null;
      const datasetEntry = findDatasetEntry(
        datasetByPlate,
        datasetByInventory,
        plate,
        inventoryHint
      );
      const lineMode = routeTypes.get(String(routeId));
      const resolved = await resolveVehicle(v, datasetEntry, lineMode);

      if (!resolved.plate && !resolved.inventoryId) continue;
      if (!isVehicleCompatibleWithLine(resolved.mode, lineMode)) continue;

      const shapeKey = `${routeId}${directionId}`;
      let routeShape = shapeCache.get(shapeKey);
      if (routeShape === undefined) {
        routeShape = await getShapeById(shapeKey);
        shapeCache.set(shapeKey, routeShape);
      }

      const vehLat = v.vehicle.position.latitude;
      const vehLon = v.vehicle.position.longitude;
      if (!isOnRouteShape([vehLat, vehLon], routeShape)) continue;

      const liveInfo: LiveInfo = {
        routeId: String(routeId),
        lineName: routeNames.get(String(routeId)),
        lineType: lineMode,
        on_board: resolved.on_board,
        inventoryId: resolved.inventoryId ?? undefined,
        plate: resolved.plate ?? plate ?? undefined,
      };

      const plateKey = resolved.plate
        ? normalizePlate(resolved.plate)
        : plate
          ? normalizePlate(plate)
          : null;
      if (plateKey) {
        byPlate.set(plateKey, liveInfo);
      }
      if (resolved.inventoryId) {
        byInventory.set(resolved.inventoryId, liveInfo);
      }
    }

    const maps = { byPlate, byInventory };
    cache.set(cacheKey, maps, 15);
    return maps;
  } catch {
    return { byPlate, byInventory };
  }
}

/** @deprecated use getLiveVehicleMaps */
export async function getLiveByPlate(): Promise<Map<string, LiveInfo>> {
  const maps = await getLiveVehicleMaps();
  return maps.byPlate;
}

function resolveLiveStatus(
  info: FleetVehicleInfo,
  liveMaps: LiveVehicleMaps
) {
  const liveRaw = findLiveInfo(liveMaps, info.inventory, info.plate);
  if (
    !liveRaw ||
    !isVehicleCompatibleWithLine(
      getVehicleModeSync(info.inventory, info.plate),
      liveRaw.lineType
    )
  ) {
    return undefined;
  }
  return liveRaw;
}

export function buildVehicleResultFromInfo(
  info: FleetVehicleInfo,
  liveMaps: LiveVehicleMaps
): VehicleSearchResult {
  const image = getFleetVehicleImage(info, info.inventory) ?? resolveVehicleByInventory(info.inventory, info.plate).image;
  const live = resolveLiveStatus(info, liveMaps);

  return {
    inventory: info.inventory,
    plate: info.plate ?? "",
    model: getFleetModelNameFromInfo(info),
    image,
    depot: info.depot,
    km: info && "km" in info ? info.km : null,
    family: info.family,
    live: live
      ? {
          routeId: live.routeId,
          lineName: live.lineName,
          lineType: live.lineType,
          on_board: live.on_board,
        }
      : null,
  };
}

export function buildVehicleResult(
  id: number,
  liveMaps: LiveVehicleMaps,
  plate?: string | null
): VehicleSearchResult {
  const info = resolveFleetInfo(plate, id) ?? getFleetInfo(id);
  if (!info) {
    const resolved = resolveVehicleByInventory(id, plate);
    const liveRaw = findLiveInfo(liveMaps, id, plate);
    return {
      inventory: id,
      plate: plate ?? "",
      model: resolved.type === "Unknown" ? null : resolved.type,
      image: resolved.image,
      live: liveRaw
        ? {
            routeId: liveRaw.routeId,
            lineName: liveRaw.lineName,
            lineType: liveRaw.lineType,
            on_board: liveRaw.on_board,
          }
        : null,
    };
  }
  return buildVehicleResultFromInfo(info, liveMaps);
}

export async function buildVehicleResultWithAc(
  id: number,
  liveMaps: LiveVehicleMaps,
  plate?: string | null
): Promise<VehicleSearchResult> {
  const vehicle = buildVehicleResult(id, liveMaps, plate);
  const acResolved = await resolveVehicleWithAc(
    id,
    vehicle.live?.lineName ?? undefined
  );
  return {
    ...vehicle,
    ac: acResolved.ac,
    acConfidence: acResolved.acConfidence,
  };
}

export function hasFleetRecord(plate?: string | null, id?: number | null): boolean {
  if (resolveFleetInfo(plate, id) != null) return true;
  return id != null && isAstraImperioId(id);
}
