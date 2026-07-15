import { NextResponse } from "next/server";
import { resolveFleetInfo } from "@/lib/vehicles/fleetInfo";
import {
  buildVehicleResultWithAc,
  getLiveVehicleMaps,
  hasFleetRecord,
} from "@/lib/server/vehicle-lookup";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { ro } from "@/lib/i18n";

type RouteContext = { params: Promise<{ inventoryId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const limited = checkRateLimit(`vehicle:${ip}`, 120, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: ro.api.rateLimited }, { status: 429 });
  }

  const { inventoryId: rawId } = await context.params;
  const id = parseInt(rawId, 10);
  const plate = new URL(request.url).searchParams.get("plate");

  if (Number.isNaN(id) || id < 1 || id > 8999 || !hasFleetRecord(plate, id)) {
    return NextResponse.json({ error: ro.lookup.notFound }, { status: 404 });
  }

  const fleetInfo = resolveFleetInfo(plate, id);
  const liveMaps = await getLiveVehicleMaps();
  const vehicle = await buildVehicleResultWithAc(id, liveMaps, fleetInfo?.plate ?? plate);

  return NextResponse.json({ vehicle, fleetInfo });
}
