import type { Stop, StopSearchEntry } from "@/lib/types";

export const BUCHAREST_BBOX = {
  minLat: 44.32,
  maxLat: 44.58,
  minLon: 25.9,
  maxLon: 26.25,
};

export function isInBucharestBbox(lat: number, lon: number): boolean {
  return (
    lat >= BUCHAREST_BBOX.minLat &&
    lat <= BUCHAREST_BBOX.maxLat &&
    lon >= BUCHAREST_BBOX.minLon &&
    lon <= BUCHAREST_BBOX.maxLon
  );
}

export function isValidMapStop(stop: Stop): boolean {
  const id = stop.stop_id;
  if (id == null || id === "") return false;
  if (!/^\d+$/.test(String(id))) return false;
  const lat = Number(stop.stop_lat);
  const lon = Number(stop.stop_lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
  if (!isInBucharestBbox(lat, lon)) return false;
  const lt = stop.location_type;
  if (lt !== "" && lt != null && lt !== 0 && lt !== 1 && lt !== "0" && lt !== "1") {
    return false;
  }
  if (stop.parent_station && String(stop.parent_station).trim() !== "") return false;
  return true;
}

export function normalizeStopName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildStopSearchIndex(stops: Stop[], blocklist: Set<number> = new Set()): StopSearchEntry[] {
  const byName = new Map<string, StopSearchEntry>();

  for (const stop of stops) {
    if (!isValidMapStop(stop)) continue;
    const stopId = parseInt(String(stop.stop_id), 10);
    if (blocklist.has(stopId)) continue;
    const name = stop.stop_name?.trim();
    if (!name) continue;

    const key = normalizeStopName(name);
    const entry: StopSearchEntry = {
      stop_id: stopId,
      stop_name: name,
      stop_lat: Number(stop.stop_lat),
      stop_lon: Number(stop.stop_lon),
    };

    const existing = byName.get(key);
    if (!existing || stopId < existing.stop_id) {
      byName.set(key, entry);
    }
  }

  return Array.from(byName.values()).sort((a, b) =>
    a.stop_name.localeCompare(b.stop_name, "ro")
  );
}

export function searchStops(
  index: StopSearchEntry[],
  query: string,
  limit = 12
): StopSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: { entry: StopSearchEntry; score: number }[] = [];

  for (const entry of index) {
    const name = entry.stop_name.toLowerCase();
    if (name.startsWith(q)) {
      results.push({ entry, score: 0 });
    } else if (name.includes(q)) {
      results.push({ entry, score: 1 });
    } else if (String(entry.stop_id).includes(q)) {
      results.push({ entry, score: 2 });
    }
  }

  return results
    .sort((a, b) => a.score - b.score || a.entry.stop_name.localeCompare(b.entry.stop_name, "ro"))
    .slice(0, limit)
    .map((r) => r.entry);
}
