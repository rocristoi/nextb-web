import { serverConfig } from "./config";
import { estimateStopsAway } from "./gtfs";

const DEFAULT_SPEED_BY_MODE: Record<string, number> = {
  tram: 250,
  bus: 220,
  trolleybus: 220,
};

export type EtaSanitizeResult = {
  time: number | string;
  corrected: boolean;
  reason?: "eta_distance_mismatch" | "missing_mobi_eta";
};

export function averageSpeedMetersPerMin(lineMode?: string): number {
  const configured = serverConfig.avgSpeedMetersPerMin();
  if (!lineMode) return configured;
  return DEFAULT_SPEED_BY_MODE[lineMode] ?? configured;
}

/** Minimum plausible ETA from shape distance and typical surface speeds. */
export function estimateMinEtaMinutes(
  distanceMeters: number,
  lineMode?: string
): number {
  if (distanceMeters <= 100) return 0;

  const spacing = serverConfig.stopSpacingMeters();
  const stopsAway = estimateStopsAway(distanceMeters);
  const minPerStop = serverConfig.minMinutesPerStop();

  const fromSpeed = Math.ceil(
    distanceMeters / averageSpeedMetersPerMin(lineMode)
  );
  const fromStops =
    stopsAway <= 1 ? 1 : 1 + (stopsAway - 1) * minPerStop;

  return Math.max(fromSpeed, fromStops);
}

export function isEtaPlausible(
  etaMinutes: number,
  distanceMeters: number,
  lineMode?: string
): boolean {
  if (etaMinutes >= 17) return true;
  const tolerance = serverConfig.etaToleranceMinutes();
  return etaMinutes + tolerance >= estimateMinEtaMinutes(distanceMeters, lineMode);
}

export function sanitizeLeadEta(
  mobiEtaSeconds: number | null,
  distanceMeters: number,
  lineMode?: string
): EtaSanitizeResult {
  const distanceBased = estimateMinEtaMinutes(distanceMeters, lineMode);

  if (mobiEtaSeconds === null || Number.isNaN(Number(mobiEtaSeconds))) {
    return {
      time: "m",
      corrected: false,
      reason: "missing_mobi_eta",
    };
  }

  const mobiMinutes = Math.ceil(Number(mobiEtaSeconds) / 60);

  if (!isEtaPlausible(mobiMinutes, distanceMeters, lineMode)) {
    return {
      time: distanceBased,
      corrected: true,
      reason: "eta_distance_mismatch",
    };
  }

  return { time: mobiMinutes, corrected: false };
}

export function assignFollowerEtas(
  vehicles: { distance: number; time?: number | string }[],
  leadMin: number | null
) {
  if (leadMin == null || vehicles.length <= 1) return;

  const spacing = serverConfig.stopSpacingMeters();
  const minPerStop = serverConfig.minMinutesPerStop();
  const lead = vehicles[0];

  for (let i = 1; i < vehicles.length; i++) {
    const extraDist = Math.max(0, vehicles[i].distance - lead.distance);
    const extraStops = Math.max(1, Math.round(extraDist / spacing));
    vehicles[i].time = leadMin + extraStops * minPerStop;
  }
}
