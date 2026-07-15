import lookup from "./fleet/lookup.json";
import meta from "./fleet/meta.json";
import trolleybusByPlate from "./fleet/trolleybus-by-plate.json";
import tramByInventory from "./fleet/tram-by-inventory.json";
import tramByPlate from "./fleet/tram-by-plate.json";
import {
  CITY_TOUR_IMAGE,
  CITY_TOUR_MODEL,
  ASTRA_IMPERIO_IMAGE,
  ASTRA_IMPERIO_MODEL,
  getImageByTip,
  getImageFromTypeMap,
  isAstraImperioId,
  UNKNOWN_VEHICLE_IMAGE,
} from "./imageMap";
import { normalizePlate } from "./plate";

export type OtokarFleetRecord = {
  family: "otokar";
  inventory: number;
  plate: string;
  vin: string;
  depot: string;
};

export type CitaroFleetRecord = {
  family: "citaro";
  inventory: number;
  plate: string;
  depot: string;
  km: number | null;
  details: string | null;
};

export type CityTourFleetRecord = {
  family: "cityTour";
  inventory: number;
  plate: string;
  depot: string;
};

export type TrolleybusFleetRecord = {
  family: "trolleybus";
  inventory: number;
  plate: string;
  depot: string;
  yearBuilt: number | null;
  axles: string | null;
  manufacturer: string | null;
  modelType: string | null;
  imported: string | null;
  observations: string | null;
};

export type BusFleetRecord = {
  family: "bus";
  inventory: number;
  plate: string;
  depot: string;
  yearBuilt: number | null;
  axles: string | null;
  manufacturer: string | null;
  modelType: string | null;
  imported: string | null;
  observations: string | null;
};

export type TramFleetRecord = {
  family: "tram";
  inventory: number;
  plate: string;
  depot: string;
  yearBuilt: number | null;
  axles: string | null;
  manufacturer: string | null;
  modelType: string | null;
  imported: string | null;
  observations: string | null;
};

export type FleetVehicleInfo =
  | OtokarFleetRecord
  | CitaroFleetRecord
  | CityTourFleetRecord
  | TrolleybusFleetRecord
  | BusFleetRecord
  | TramFleetRecord;

const fleetLookup = lookup as Record<string, FleetVehicleInfo>;
const trolleyPlateLookup = trolleybusByPlate as Record<string, TrolleybusFleetRecord>;
const tramInventoryLookup = tramByInventory as Record<string, TramFleetRecord>;
const tramPlateLookup = tramByPlate as Record<string, TramFleetRecord>;

const plateIndex = new Map<string, FleetVehicleInfo>();
for (const rec of Object.values(tramPlateLookup)) {
  if (rec.plate && rec.plate !== "-") {
    plateIndex.set(normalizePlate(rec.plate), { ...rec, family: "tram" });
  }
}
for (const rec of Object.values(trolleyPlateLookup)) {
  if (rec.plate && rec.plate !== "-") {
    plateIndex.set(normalizePlate(rec.plate), { ...rec, family: "trolleybus" });
  }
}
for (const rec of Object.values(fleetLookup)) {
  if (!rec.plate || rec.plate === "-") continue;
  const key = normalizePlate(rec.plate);
  if (!plateIndex.has(key)) {
    plateIndex.set(key, rec);
  }
}

export const fleetMeta = meta;

export function getFleetInfo(
  inventoryId: number | null | undefined
): FleetVehicleInfo | null {
  if (inventoryId == null || inventoryId <= 0) return null;
  return fleetLookup[String(inventoryId)] ?? null;
}

export function getFleetInfoByPlate(
  plate: string | null | undefined
): FleetVehicleInfo | null {
  if (!plate) return null;
  return plateIndex.get(normalizePlate(plate)) ?? null;
}

export function resolveFleetInfo(
  plate?: string | null,
  inventoryId?: number | null
): FleetVehicleInfo | null {
  if (plate) {
    const byPlate = getFleetInfoByPlate(plate);
    if (byPlate) return byPlate;
  }
  if (inventoryId != null && inventoryId > 0) {
    const tramRec = tramInventoryLookup[String(inventoryId)];
    if (tramRec) return { ...tramRec, family: "tram" };
    const byInventory = getFleetInfo(inventoryId);
    if (byInventory) return byInventory;
    for (const rec of Object.values(trolleyPlateLookup)) {
      if (rec.inventory === inventoryId) {
        return { ...rec, family: "trolleybus" };
      }
    }
  }
  return null;
}

export function hasFleetInfo(
  plate?: string | null,
  inventoryId?: number | null
): boolean {
  return resolveFleetInfo(plate, inventoryId) != null;
}

export function isTramFleetId(inventoryId: number | null | undefined): boolean {
  if (inventoryId == null || inventoryId <= 0) return false;
  return tramInventoryLookup[String(inventoryId)] != null;
}

export function getFleetModelName(inventoryId: number): string | null {
  const fleet = getFleetInfo(inventoryId);
  if (fleet?.family === "cityTour") return CITY_TOUR_MODEL;
  const mapped = getImageFromTypeMap(inventoryId);
  return mapped?.[0] ?? null;
}

export function getFleetVehicleImage(
  info: FleetVehicleInfo | null | undefined,
  inventoryId?: number | null
): string | null {
  if (info?.family === "cityTour") return CITY_TOUR_IMAGE;
  if (info?.family === "tram" && info.modelType) return getImageByTip(info.modelType);
  const id = info?.inventory ?? inventoryId;
  if (id == null) return null;
  const fromMap = getImageFromTypeMap(id)?.[1] ?? null;
  if (fromMap) return fromMap;
  if (info?.family === "trolleybus" || info?.family === "bus") {
    if (info.modelType) return getImageByTip(info.modelType);
  }
  return null;
}

export function getFleetModelNameFromInfo(
  info: FleetVehicleInfo | null | undefined
): string | null {
  if (!info) return null;
  if (info.family === "cityTour") return CITY_TOUR_MODEL;
  if (info.family === "tram") return info.modelType;
  const mapped = getImageFromTypeMap(info.inventory)?.[0] ?? null;
  if (info.family === "trolleybus" || info.family === "bus") {
    return mapped ?? info.modelType;
  }
  return mapped;
}

export function resolveVehicleByInventory(
  inventoryId: number | null | undefined,
  plate?: string | null
): { type: string; image: string } {
  if (inventoryId == null || inventoryId <= 0) {
    return { type: "Unknown", image: UNKNOWN_VEHICLE_IMAGE };
  }

  const fleet = resolveFleetInfo(plate ?? null, inventoryId);
  if (fleet) {
    const type = getFleetModelNameFromInfo(fleet) ?? "Unknown";
    const image = getFleetVehicleImage(fleet, inventoryId) ?? UNKNOWN_VEHICLE_IMAGE;
    return { type, image };
  }

  if (isAstraImperioId(inventoryId)) {
    return { type: ASTRA_IMPERIO_MODEL, image: ASTRA_IMPERIO_IMAGE };
  }

  const fromMap = getImageFromTypeMap(inventoryId);
  if (fromMap) {
    return { type: fromMap[0], image: fromMap[1] };
  }

  return { type: "Unknown", image: UNKNOWN_VEHICLE_IMAGE };
}

export function formatFleetKm(km: number | null): string | null {
  if (km == null) return null;
  return `${km.toLocaleString("ro-RO")} km`;
}

export function getFleetSource(info: FleetVehicleInfo | null | undefined): string | null {
  if (!info) return null;
  switch (info.family) {
    case "otokar":
      return fleetMeta.otokar.source;
    case "cityTour":
      return fleetMeta.cityTour.source;
    case "trolleybus":
      return fleetMeta.trolleybus.source;
    case "bus":
      return fleetMeta.allBuses.source;
    case "tram":
      return fleetMeta.tram.source;
    case "citaro":
      return fleetMeta.citaro.source;
    default:
      return null;
  }
}
