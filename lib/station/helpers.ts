import type { VehicleArrival, StationResponse } from "@/lib/types";
import { ro } from "@/lib/i18n";

export type EtaUrgency = "now" | "soon" | "medium" | "far" | "unknown";

export function parseEtaMinutes(time: number | string | undefined | null): number | null {
  if (time === undefined || time === null) return null;
  if (time.toString() === "m") return 17;
  const n = Number(time);
  return Number.isNaN(n) ? null : n;
}

export function getEtaUrgency(time: number | string | undefined | null): EtaUrgency {
  const min = parseEtaMinutes(time);
  if (min === null) return "unknown";
  if (min === 0) return "now";
  if (min <= 3) return "soon";
  if (min <= 10) return "medium";
  return "far";
}

export function formatEtaLabel(time: number | string | undefined | null): string {
  if (time === undefined || time === null) return ro.eta.dash;
  if (time.toString() === "m") return ro.eta.over17;
  const n = Number(time);
  if (Number.isNaN(n)) return ro.eta.dash;
  if (n === 0) return ro.eta.now;
  if (n === 1) return ro.eta.oneMin;
  return ro.eta.minutes(n);
}

export function etaTextClass(time: number | string | undefined | null): string {
  const urgency = getEtaUrgency(time);
  switch (urgency) {
    case "now":
      return "text-success";
    case "soon":
      return "text-accent";
    case "medium":
      return "text-foreground";
    case "far":
      return "text-muted";
    default:
      return "text-muted";
  }
}

export function getEtaDisplay(time: number | string | undefined | null): {
  primary: string;
  secondary: string;
} {
  if (time === undefined || time === null) {
    return { primary: ro.eta.dash, secondary: "" };
  }
  if (time.toString() === "m") {
    return { primary: ro.eta.over17, secondary: ro.eta.minUnit };
  }
  const n = Number(time);
  if (Number.isNaN(n)) return { primary: ro.eta.dash, secondary: "" };
  if (n === 0) return { primary: ro.eta.now, secondary: "" };
  if (n === 1) return { primary: "1", secondary: ro.eta.minUnit };
  return { primary: String(n), secondary: ro.eta.minUnit };
}

export function sortStationLines(
  lines: StationResponse["lines"]
): [string, VehicleArrival[]][] {
  return Object.entries(lines).sort(([, aV], [, bV]) => {
    const aMin = parseEtaMinutes(aV[0]?.time);
    const bMin = parseEtaMinutes(bV[0]?.time);
    if (aV.length === 0 && bV.length === 0) return 0;
    if (aV.length === 0) return 1;
    if (bV.length === 0) return -1;
    if (aMin === null && bMin === null) return 0;
    if (aMin === null) return 1;
    if (bMin === null) return -1;
    return aMin - bMin;
  });
}

export function countActiveLines(lines: StationResponse["lines"]): number {
  return Object.values(lines).filter((v) => v.length > 0).length;
}

export function soonestEta(lines: StationResponse["lines"]): number | null {
  let best: number | null = null;
  for (const vehicles of Object.values(lines)) {
    const min = parseEtaMinutes(vehicles[0]?.time);
    if (min === null || vehicles.length === 0) continue;
    if (best === null || min < best) best = min;
  }
  return best;
}
