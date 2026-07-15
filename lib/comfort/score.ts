import type { AcConfidence } from "@/lib/types";
import { getFleetInfo } from "@/lib/vehicles/fleetInfo";
import { isCitaroEuro3Inventory } from "@/lib/vehicles/imageMap";

const nonACtypes = new Set([
  "M-Benz Citaro EURO 3",
  "V3A-93",
  "V3A-93M",
  "V3A-93 PPC",
  "V3A-93 CH-PPC",
  "V3A-2010-PPC-CA",
  "V3A-93M 2000",
  "V3A-2S-93",
  "Bucur 1 V2A-T",
  "Tatra T4R",
]);

export function typeHasAc(type: string): boolean {
  return !nonACtypes.has(type);
}

function citaroHasAcRetrofit(details: string | null | undefined): boolean {
  if (!details) return false;
  const d = details.toLowerCase();
  return d.includes("instalatie ac") || d.includes("instalație ac");
}

/** Per-vehicle AC capability (type default + fleet exceptions such as retrofitted Citaro). */
export function vehicleHasAc(vehicleId: number | null, type: string): boolean {
  if (vehicleId != null && vehicleId > 0) {
    const fleet = getFleetInfo(vehicleId);
    if (isCitaroEuro3Inventory(vehicleId)) {
      return fleet?.family === "citaro" && citaroHasAcRetrofit(fleet.details);
    }
    if (fleet?.family === "citaro" && citaroHasAcRetrofit(fleet.details)) {
      return true;
    }
  }
  return typeHasAc(type);
}

export function acPointsFromConfidence(confidence: AcConfidence): number {
  switch (confidence) {
    case "ok":
      return 1;
    case "uncertain":
      return 0.4;
    case "broken":
    case "none":
      return 0;
    default:
      return 0.5;
  }
}

export function crowdPoints(onBoard: number | null | undefined): number {
  if (onBoard == null) return 0.5;
  if (onBoard < 25) return 1;
  if (onBoard < 45) return 0.6;
  return 0.2;
}

export function computeComfortScore(
  acConfidence: AcConfidence,
  onBoard: number | null | undefined
): number {
  const ac = acPointsFromConfidence(acConfidence);
  const crowd = crowdPoints(onBoard);
  return ac * 0.6 + crowd * 0.4;
}

export type ComfortTier = "great" | "ok" | "poor";

export function comfortTierFromScore(score: number): ComfortTier {
  if (score >= 0.75) return "great";
  if (score >= 0.45) return "ok";
  return "poor";
}

export function sortByComfortThenEta<T extends { comfortScore?: number; time?: number | string }>(
  vehicles: T[]
): T[] {
  return [...vehicles].sort((a, b) => {
    const cs = (b.comfortScore ?? 0) - (a.comfortScore ?? 0);
    if (Math.abs(cs) > 0.01) return cs;
    const aMin = parseEta(a.time);
    const bMin = parseEta(b.time);
    if (aMin == null && bMin == null) return 0;
    if (aMin == null) return 1;
    if (bMin == null) return -1;
    return aMin - bMin;
  });
}

function parseEta(time: number | string | undefined): number | null {
  if (time === undefined || time == null) return null;
  if (time.toString() === "m") return 17;
  const n = Number(time);
  return Number.isNaN(n) ? null : n;
}
