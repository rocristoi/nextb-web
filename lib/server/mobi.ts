import { cache } from "./cache";
import { serverConfig } from "./config";
import { normalizePlate } from "@/lib/vehicles/plate";

const MOBI_FETCH_TIMEOUT_MS = 15000;
const MOBI_CACHE_TTL_SEC = 12;

async function fetchMobiJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MOBI_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCached<T>(cacheKey: string, url: string): Promise<T> {
  const cached = cache.get<T>(cacheKey);
  if (cached) return cached;
  const data = await fetchMobiJson<T>(url);
  cache.set(cacheKey, data, MOBI_CACHE_TTL_SEC);
  return data;
}

export async function fetchMobiBusData(): Promise<any[]> {
  return fetchCached<any[]>("mobi_bus_data", serverConfig.mobiBusData());
}

export async function fetchMobiDataset(): Promise<any[]> {
  return fetchCached<any[]>("mobi_dataset", serverConfig.mobiDataset());
}

export async function fetchMobiNextArrivals(stationId: string): Promise<any> {
  const cacheKey = `mobi_next_arrivals_${stationId}`;
  return fetchCached<any>(
    cacheKey,
    `${serverConfig.mobiNextArrivals()}${stationId}`
  );
}

export async function buildDatasetIndexes(
  dataset?: any[]
): Promise<{ byPlate: Map<string, any>; byInventory: Map<number, any> }> {
  const allDatasets = dataset ?? (await fetchMobiDataset());
  const byPlate = new Map<string, any>();
  const byInventory = new Map<number, any>();
  for (const entry of allDatasets) {
    const rawPlate = entry.vehicle?.vehicle?.license_plate;
    if (rawPlate) {
      byPlate.set(normalizePlate(rawPlate), entry);
    }
    const thId = Number(entry.vehicle?.vehicle?.th_id);
    if (thId > 0) {
      byInventory.set(thId, entry);
    }
  }
  return { byPlate, byInventory };
}

export function findDatasetEntry(
  byPlate: Map<string, any>,
  byInventory: Map<number, any>,
  plate: string | null | undefined,
  inventoryId: number | null | undefined
) {
  if (plate) {
    const byPlateEntry = byPlate.get(normalizePlate(plate));
    if (byPlateEntry) return byPlateEntry;
  }
  if (inventoryId && inventoryId > 0) {
    return byInventory.get(inventoryId);
  }
  return undefined;
}

export async function buildDatasetByPlate(
  dataset?: any[]
): Promise<Map<string, any>> {
  const { byPlate } = await buildDatasetIndexes(dataset);
  return byPlate;
}

export async function refreshMobiBusData(): Promise<any[]> {
  cache.del("mobi_bus_data");
  return fetchMobiBusData();
}

export async function fetchMobiLiveBundle(): Promise<{
  busData: any[];
  dataset: any[];
  datasetByPlate: Map<string, any>;
  datasetByInventory: Map<number, any>;
}> {
  const [busData, dataset] = await Promise.all([
    fetchMobiBusData(),
    fetchMobiDataset(),
  ]);
  const { byPlate, byInventory } = await buildDatasetIndexes(dataset);
  return {
    busData,
    dataset,
    datasetByPlate: byPlate,
    datasetByInventory: byInventory,
  };
}
