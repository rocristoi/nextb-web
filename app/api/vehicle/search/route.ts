import { NextResponse } from "next/server";
import lookup from "@/lib/vehicles/fleet/lookup.json";
import trolleybusByPlate from "@/lib/vehicles/fleet/trolleybus-by-plate.json";
import tramByInventory from "@/lib/vehicles/fleet/tram-by-inventory.json";
import tramByPlate from "@/lib/vehicles/fleet/tram-by-plate.json";
import { normalizePlate } from "@/lib/vehicles/plate";
import { vehicleSearchSchema } from "@/lib/server/security/schemas";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import {
  buildVehicleResult,
  buildVehicleResultFromInfo,
  getLiveVehicleMaps,
} from "@/lib/server/vehicle-lookup";
import type { FleetVehicleInfo } from "@/lib/vehicles/fleetInfo";
import type { VehicleSearchResult } from "@/lib/types";
import { ro } from "@/lib/i18n";

const fleetLookup = lookup as Record<string, FleetVehicleInfo>;
const trolleyLookup = trolleybusByPlate as Record<string, FleetVehicleInfo>;
const tramLookup = tramByInventory as Record<string, FleetVehicleInfo>;
const tramPlateLookup = tramByPlate as Record<string, FleetVehicleInfo>;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limited = checkRateLimit(`search:${ip}`, 60, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: ro.api.rateLimited }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = vehicleSearchSchema.safeParse({ q: searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: ro.api.malformedRequest }, { status: 400 });
  }

  const q = parsed.data.q.trim();
  const qUpper = q.toUpperCase();
  const qPlate = normalizePlate(q);
  const results: VehicleSearchResult[] = [];
  const seenInventory = new Set<number>();
  const seenPlates = new Set<string>();
  const liveMaps = await getLiveVehicleMaps();

  const pushFleetRecord = (rec: FleetVehicleInfo) => {
    const plateKey = rec.plate ? normalizePlate(rec.plate) : "";
    if ((rec.family === "trolleybus" || rec.family === "tram") && plateKey) {
      if (seenPlates.has(plateKey)) return;
      seenPlates.add(plateKey);
    } else {
      if (seenInventory.has(rec.inventory)) return;
      seenInventory.add(rec.inventory);
    }
    results.push(buildVehicleResultFromInfo(rec, liveMaps));
  };

  const idNum = parseInt(q, 10);
  if (!Number.isNaN(idNum)) {
    const rec = fleetLookup[String(idNum)];
    if (rec) pushFleetRecord(rec);
    const tramRec = tramLookup[String(idNum)];
    if (tramRec) pushFleetRecord(tramRec);
    for (const trolley of Object.values(trolleyLookup)) {
      if (trolley.inventory === idNum) pushFleetRecord(trolley);
    }
  }

  for (const rec of Object.values(tramPlateLookup)) {
    if (results.length >= 20) break;
    const plateNorm = normalizePlate(rec.plate);
    if (
      plateNorm.includes(qPlate) ||
      rec.plate.toUpperCase().includes(qUpper) ||
      String(rec.inventory).includes(q)
    ) {
      pushFleetRecord(rec);
    }
  }

  for (const rec of Object.values(trolleyLookup)) {
    if (results.length >= 20) break;
    const plateNorm = normalizePlate(rec.plate);
    if (
      plateNorm.includes(qPlate) ||
      rec.plate.toUpperCase().includes(qUpper)
    ) {
      pushFleetRecord(rec);
    }
  }

  for (const rec of Object.values(fleetLookup)) {
    if (results.length >= 20) break;
    const plateNorm = normalizePlate(rec.plate);
    if (
      plateNorm.includes(qPlate) ||
      rec.plate.toUpperCase().includes(qUpper) ||
      String(rec.inventory).includes(q)
    ) {
      pushFleetRecord(rec);
    }
  }

  if (results.length === 0 && qPlate.length >= 4) {
    const live = liveMaps.byPlate.get(qPlate);
    if (live?.inventoryId || live?.plate) {
      results.push(buildVehicleResult(live.inventoryId ?? 0, liveMaps, live.plate));
    } else {
      for (const [plateKey, liveInfo] of liveMaps.byPlate) {
        if (plateKey.includes(qPlate)) {
          results.push(
            buildVehicleResult(liveInfo.inventoryId ?? 0, liveMaps, liveInfo.plate)
          );
          if (results.length >= 20) break;
        }
      }
    }
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
