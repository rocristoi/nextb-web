import {
  getFleetInfo,
  getFleetInfoByPlate,
  isTramFleetId,
  resolveFleetInfo,
  type FleetVehicleInfo,
} from "@/lib/vehicles/fleetInfo";
import { normalizePlate } from "@/lib/vehicles/plate";
import { isAstraImperioId } from "@/lib/vehicles/imageMap";
import { getTramIdByPlate, isTramInventoryId } from "./vehicles";

export type VehicleMode = "tram" | "bus" | "trolleybus" | "unknown";

export type ResolvedVehicle = {
  inventoryId: number | null;
  plate: string | null;
  on_board: number | null;
  mode: VehicleMode;
};

function validThId(value: unknown): number | null {
  const id = Number(value);
  if (!id || id <= 0 || Number.isNaN(id)) return null;
  return id;
}

function extractPlate(busEntry: any, datasetEntry?: any): string | null {
  return (
    busEntry?.vehicle?.vehicle?.licensePlate ??
    datasetEntry?.vehicle?.vehicle?.license_plate ??
    null
  );
}

function isTrolleybusInventoryId(id: number): boolean {
  return (
    (id >= 5100 && id <= 5399) ||
    (id >= 5400 && id <= 5500) ||
    (id >= 5601 && id <= 5622)
  );
}

function fleetModeFromInfo(
  fleet: FleetVehicleInfo | null | undefined
): VehicleMode | null {
  if (!fleet) return null;
  if (fleet.family === "trolleybus") return "trolleybus";
  if (fleet.family === "tram") return "tram";
  return "bus";
}

export async function getVehicleMode(
  inventoryId: number | null,
  plate?: string | null
): Promise<VehicleMode> {
  if (inventoryId) {
    const fleetMode = fleetModeFromInfo(resolveFleetInfo(null, inventoryId));
    if (fleetMode) return fleetMode;
    if (isTramFleetId(inventoryId)) return "tram";
    if (isAstraImperioId(inventoryId)) return "tram";
    if (await isTramInventoryId(inventoryId)) return "tram";
    if (isTrolleybusInventoryId(inventoryId)) return "trolleybus";
  }

  if (plate) {
    const fleetMode = fleetModeFromInfo(getFleetInfoByPlate(plate));
    if (fleetMode) return fleetMode;
    const tramId = await getTramIdByPlate(plate);
    if (tramId) return "tram";
  }

  return "unknown";
}

function preferFleetFirst(lineMode?: string): boolean {
  return lineMode === "bus" || lineMode === "trolleybus";
}

async function resolveIdFromPlate(
  plate: string,
  lineMode?: string
): Promise<number | null> {
  const fleetFirst = preferFleetFirst(lineMode);

  if (fleetFirst) {
    const fleet = getFleetInfoByPlate(plate);
    if (fleet) return fleet.inventory;
    const tramId = await getTramIdByPlate(plate);
    if (tramId) return tramId;
  } else {
    const tramId = await getTramIdByPlate(plate);
    if (tramId) return tramId;
    const fleet = getFleetInfoByPlate(plate);
    if (fleet) return fleet.inventory;
  }

  return null;
}

export async function resolveVehicle(
  busEntry: any,
  datasetEntry?: any,
  lineMode?: string
): Promise<ResolvedVehicle> {
  let plate = extractPlate(busEntry, datasetEntry);
  const on_board = datasetEntry?.vehicle?.passenger_info?.on_board ?? null;

  if (lineMode === "trolleybus" && plate) {
    const fleet = getFleetInfoByPlate(plate);
    if (fleet?.family === "trolleybus") {
      return {
        inventoryId: fleet.inventory,
        plate,
        on_board,
        mode: "trolleybus",
      };
    }
  }

  let inventoryId =
    validThId(datasetEntry?.vehicle?.vehicle?.th_id) ??
    validThId(busEntry?.vehicle?.vehicle?.th_id) ??
    null;

  if (!inventoryId && plate) {
    inventoryId = await resolveIdFromPlate(plate, lineMode);
  }

  if (!plate && inventoryId) {
    const fleet = resolveFleetInfo(null, inventoryId);
    if (fleet?.plate && fleet.plate !== "-") {
      plate = fleet.plate;
    }
  }

  let mode = await getVehicleMode(inventoryId, plate);

  if (
    lineMode &&
    inventoryId &&
    !isVehicleCompatibleWithLine(mode, lineMode) &&
    plate
  ) {
    const correctedId = await resolveIdFromPlate(plate, lineMode);
    if (correctedId && correctedId !== inventoryId) {
      const correctedMode = await getVehicleMode(correctedId, plate);
      if (isVehicleCompatibleWithLine(correctedMode, lineMode)) {
        inventoryId = correctedId;
        mode = correctedMode;
      }
    }
  }

  if (lineMode === "trolleybus" && plate) {
    const fleet = getFleetInfoByPlate(plate);
    if (fleet?.family === "trolleybus") {
      return {
        inventoryId: fleet.inventory,
        plate,
        on_board,
        mode: "trolleybus",
      };
    }
  }

  return {
    inventoryId,
    plate,
    on_board,
    mode,
  };
}

export function getVehicleModeSync(
  inventoryId: number | null,
  plate?: string | null
): VehicleMode {
  if (plate) {
    const fleet = getFleetInfoByPlate(plate);
    if (fleet?.family === "trolleybus") return "trolleybus";
    if (fleet) return fleetModeFromInfo(fleet) ?? "unknown";
  }

  if (inventoryId) {
    const fleetMode = fleetModeFromInfo(resolveFleetInfo(null, inventoryId));
    if (fleetMode) return fleetMode;
    if (isTramFleetId(inventoryId)) return "tram";
    if (isAstraImperioId(inventoryId)) return "tram";
    if (isTrolleybusInventoryId(inventoryId)) return "trolleybus";
  }
  return "unknown";
}

export function isVehicleCompatibleWithLine(
  vehicleMode: VehicleMode,
  lineMode?: string
): boolean {
  if (vehicleMode === "unknown" || !lineMode) return true;
  return vehicleMode === lineMode;
}
