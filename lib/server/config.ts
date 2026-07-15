import path from "path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const ASSETS_DATA_DIR = path.join(process.cwd(), "assets", "data");

export const PATHS = {
  noAC: path.join(DATA_DIR, "noAC.json"),
  badStops: path.join(DATA_DIR, "bad-stops.json"),
  stopsJson: path.join(ASSETS_DATA_DIR, "stops.json"),
  stopsTxt: path.join(DATA_DIR, "stops.txt"),
  shapesTxt: path.join(DATA_DIR, "shapes.txt"),
  routesTxt: path.join(DATA_DIR, "routes.txt"),
  gtfsZip: path.join(DATA_DIR, "BUCHAREST-REGION.zip"),
  gtfsZipTmp: path.join(DATA_DIR, "BUCHAREST-REGION.zip.tmp"),
};

export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const serverConfig = {
  mobiBusData: () => getEnv("CORS_MOBI_BUS_DATA", "https://maps.mo-bi.ro/api/busData"),
  mobiNextArrivals: () => getEnv("CORS_MOBI_NEXT_ARRIVALS", "https://maps.mo-bi.ro/api/nextArrivals/"),
  mobiDataset: () => getEnv("CORS_MOBI_DATASET", "https://maps.mo-bi.ro/api/dataset"),
  lineCheckCooldown: () => Number(getEnv("LINE_CHECK_COOLDOWN", "120000")),
  gtfsStopsFile: () => process.env.GTFS_STOPS_FILE ?? PATHS.stopsTxt,
  gtfsShapesFile: () => process.env.GTFS_SHAPES_FILE ?? PATHS.shapesTxt,
  noAcPath: () => process.env.NOACPATH ?? PATHS.noAC,
  stopSpacingMeters: () => Number(process.env.STOP_SPACING_METERS ?? "350"),
  minMinutesPerStop: () => Number(process.env.MIN_MINUTES_PER_STOP ?? "2"),
  avgSpeedMetersPerMin: () =>
    Number(process.env.AVG_SPEED_METERS_PER_MIN ?? "230"),
  etaToleranceMinutes: () => Number(process.env.ETA_TOLERANCE_MINUTES ?? "1"),
};
