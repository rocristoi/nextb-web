import fs from "fs";
import readline from "readline";
import { parse } from "csv-parse/sync";
import csv from "csv-parser";
import haversine from "haversine-distance";
import * as turf from "@turf/turf";
import { cache } from "./cache";
import { PATHS, serverConfig } from "./config";
import { getVehicleType } from "./vehicles";
import type { RouteInfo, Stop } from "@/lib/types";
import { isValidMapStop } from "@/lib/stops/search-index";

export function routeTypeToMode(routeType: string): string {
  const t = parseInt(routeType, 10);
  if (t === 0) return "tram";
  if (t === 11) return "trolleybus";
  return "bus";
}

export async function getRouteModeByRouteId(
  routeId: string | number
): Promise<string | undefined> {
  const routes = await loadRoutesData();
  for (const info of Object.values(routes)) {
    if (String(info.id) === String(routeId)) return info.type;
  }
  return undefined;
}

let stopsDataCache: { stop_id: string; stop_lat: number; stop_lon: number }[] | null = null;
let shapesDataCache: Record<string, string>[] | null = null;
let routesDataCache: Record<string, RouteInfo> | null = null;

export async function loadStopsData() {
  if (stopsDataCache) return stopsDataCache;
  const fileStream = fs.createReadStream(serverConfig.gtfsStopsFile(), "utf-8");
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  const results: { stop_id: string; stop_lat: number; stop_lon: number }[] = [];
  let isHeader = true;
  return new Promise<typeof results>((resolve, reject) => {
    rl.on("line", (line) => {
      if (isHeader) {
        isHeader = false;
        return;
      }
      const columns = line.split(",");
      results.push({
        stop_id: columns[0].trim(),
        stop_lat: parseFloat(columns[4]),
        stop_lon: parseFloat(columns[5]),
      });
    });
    rl.on("close", () => {
      stopsDataCache = results;
      resolve(stopsDataCache);
    });
    rl.on("error", (err) => reject(err));
  });
}

export async function parseStationLocation(stationID: string | number) {
  const stopsData = await loadStopsData();
  const station = stopsData.find((stop) => stop.stop_id === stationID.toString());
  if (station) {
    return { stop_lat: station.stop_lat, stop_lon: station.stop_lon };
  }
  throw new Error(`Station ID ${stationID} not found`);
}

export async function loadShapesData() {
  if (shapesDataCache) return shapesDataCache;
  const filePath = serverConfig.gtfsShapesFile();
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf-8");
  shapesDataCache = parse(data, { columns: true });
  return shapesDataCache;
}

export async function getShapeById(shapeId: string): Promise<[number, number][] | null> {
  const shapesData = await loadShapesData();
  if (!shapesData.length) return null;
  return shapesData
    .filter((row) => row.shape_id === shapeId)
    .map((row) => [parseFloat(row.shape_pt_lat), parseFloat(row.shape_pt_lon)]);
}

export async function loadRoutesData(): Promise<Record<string, RouteInfo>> {
  const cacheKey = "gtfs_routes";
  const cached = cache.get<Record<string, RouteInfo>>(cacheKey);
  if (cached) return cached;

  if (routesDataCache) return routesDataCache;

  const routesPath = PATHS.routesTxt;
  if (!fs.existsSync(routesPath)) return {};

  return new Promise((resolve, reject) => {
    const results: Record<string, RouteInfo> = {};
    fs.createReadStream(routesPath)
      .pipe(csv({ separator: "," }))
      .on("data", (data) => {
        const shortName = data.route_short_name;
        const mode =
          data.route_type != null && data.route_type !== ""
            ? routeTypeToMode(data.route_type)
            : getVehicleType(shortName);
        results[shortName] = {
          id: data.route_id,
          color: data.route_color,
          type: mode,
          agency_id: data.agency_id ?? undefined,
        };
      })
      .on("end", () => {
        cache.set(cacheKey, results, 300);
        routesDataCache = results;
        resolve(routesDataCache);
      })
      .on("error", (err) => reject(err));
  });
}

function loadBadStopIds(): Set<number> {
  try {
    const raw = JSON.parse(fs.readFileSync(PATHS.badStops, "utf8")) as number[];
    return new Set(raw);
  } catch {
    return new Set();
  }
}

export function getStopsJson(): Stop[] {
  const stopsPath = PATHS.stopsJson;
  if (!fs.existsSync(stopsPath)) return [];
  const all: Stop[] = JSON.parse(fs.readFileSync(stopsPath, "utf8"));
  const blocklist = loadBadStopIds();
  return all.filter((stop) => {
    if (blocklist.has(Number(stop.stop_id))) return false;
    return isValidMapStop(stop);
  });
}

export function estimateStopsAway(distanceMeters: number): number {
  const spacing = serverConfig.stopSpacingMeters();
  return Math.max(1, Math.round(distanceMeters / spacing));
}

function haversineDistance(point1: [number, number], point2: [number, number]) {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  return haversine({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
}

function projectPointOntoSegment(
  point: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
) {
  const line = turf.lineString([segmentStart, segmentEnd]);
  const pt = turf.point(point);
  const snapped = turf.nearestPointOnLine(line, pt);
  return snapped.geometry.coordinates as [number, number];
}

export async function calculateTramToStationDistance(
  tramPos: [number, number],
  stationPos: [number, number],
  shapeId: string
): Promise<number | "past"> {
  const thresholdDistance = 500;
  const shapesData = await loadShapesData();
  const routeShape = shapesData
    .filter((row) => row.shape_id === shapeId)
    .map((row) => [parseFloat(row.shape_pt_lat), parseFloat(row.shape_pt_lon)] as [number, number]);

  if (!routeShape.length) return "past";

  let tramProjection: [number, number] | null = null;
  let stationProjection: [number, number] | null = null;
  let minTramDistance = Infinity;
  let minStationDistance = Infinity;
  const cumulativeDistances = [0];
  let tramSegmentIndex: number | null = null;
  let stationSegmentIndex: number | null = null;

  for (let i = 1; i < routeShape.length; i++) {
    const dist = haversineDistance(routeShape[i - 1], routeShape[i]);
    cumulativeDistances.push(cumulativeDistances[i - 1] + dist);
  }

  for (let i = 0; i < routeShape.length - 1; i++) {
    const segmentStart = routeShape[i];
    const segmentEnd = routeShape[i + 1];
    const tramProj = projectPointOntoSegment(tramPos, segmentStart, segmentEnd);
    const stationProj = projectPointOntoSegment(stationPos, segmentStart, segmentEnd);
    const tramDist = haversineDistance(tramPos, tramProj);
    const stationDist = haversineDistance(stationPos, stationProj);

    if (tramDist < thresholdDistance && tramDist < minTramDistance) {
      minTramDistance = tramDist;
      tramProjection = tramProj;
      tramSegmentIndex = i;
    }

    if (stationDist < minStationDistance) {
      minStationDistance = stationDist;
      stationProjection = stationProj;
      stationSegmentIndex = i;
    }
  }

  if (tramSegmentIndex === null || stationSegmentIndex === null) return "past";

  if (tramSegmentIndex < stationSegmentIndex) {
    let distance = cumulativeDistances[stationSegmentIndex] - cumulativeDistances[tramSegmentIndex];
    distance += haversineDistance(routeShape[tramSegmentIndex], tramProjection!);
    distance += haversineDistance(routeShape[stationSegmentIndex], stationProjection!);
    return distance;
  }
  if (tramSegmentIndex === stationSegmentIndex) {
    return 0;
  }
  return "past";
}

export function clearGtfsCaches() {
  stopsDataCache = null;
  shapesDataCache = null;
  routesDataCache = null;
  cache.del("gtfs_routes");
}
