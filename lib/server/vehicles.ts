import {
  getCityTourForLine,
  CITY_TOUR_IMAGE,
  CITY_TOUR_MODEL,
  UNKNOWN_VEHICLE_IMAGE,
} from "@/lib/vehicles/imageMap";
import {
  getFleetInfo,
  isTramFleetId,
  resolveFleetInfo,
  resolveVehicleByInventory,
} from "@/lib/vehicles/fleetInfo";
import { getAcConfidence, hasAC as hasACFromVotes } from "./ac-votes";
import type { AcConfidence } from "@/lib/types";

export function getVehicleType(id: string | number): string {
  const numId = parseInt(String(id));
  if (Number.isNaN(numId)) return "bus";
  if (numId < 55) return "tram";
  if (numId > 60 && numId < 100) return "trolleybus";
  if (numId >= 100) return "bus";
  return "Unknown";
}

export async function getTramIdByPlate(
  plate: string | null | undefined
): Promise<number | null> {
  if (!plate) return null;
  const info = resolveFleetInfo(plate, null);
  if (info?.family === "tram") return info.inventory;
  return null;
}

export async function isTramInventoryId(id: number): Promise<boolean> {
  return isTramFleetId(id);
}

export async function getTipById(
  id: number
): Promise<[string, string | null]> {
  const { type, image } = resolveVehicleByInventory(id);
  return [type, image];
}

export async function resolveVehicleWithAc(
  id: number | null,
  lineName?: string
): Promise<{ type: string; image: string; ac: boolean; acConfidence: AcConfidence }> {
  if (id == null || id === 0) {
    const cityTour = getCityTourForLine(lineName);
    const type = cityTour?.type ?? "Unknown";
    const acConfidence = await getAcConfidence(null, type);
    return {
      type,
      image: cityTour?.image ?? UNKNOWN_VEHICLE_IMAGE,
      ac: hasACFromVotes(null, type, acConfidence),
      acConfidence,
    };
  }

  const fleet = getFleetInfo(id);
  if (fleet?.family === "cityTour") {
    const acConfidence = await getAcConfidence(id, CITY_TOUR_MODEL);
    return {
      type: CITY_TOUR_MODEL,
      image: CITY_TOUR_IMAGE,
      ac: hasACFromVotes(id, CITY_TOUR_MODEL, acConfidence),
      acConfidence,
    };
  }

  const { type, image } = resolveVehicleByInventory(id);
  const acConfidence = await getAcConfidence(id, type);
  return {
    type,
    image,
    ac: hasACFromVotes(id, type, acConfidence),
    acConfidence,
  };
}

export async function resolveVehicleImage(
  id: number | null,
  lineName?: string
): Promise<{ type: string; image: string; ac: boolean }> {
  const r = await resolveVehicleWithAc(id, lineName);
  return { type: r.type, image: r.image, ac: r.ac };
}

/** @deprecated use resolveVehicleWithAc */
export function hasAC(vehID: number | null, type: string): boolean {
  return hasACFromVotes(vehID, type, "ok");
}
