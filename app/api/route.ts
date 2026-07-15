import { NextResponse } from "next/server";
import { getStationArrivals } from "@/lib/server/arrivals";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { ro } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationID = searchParams.get("stationID");

  if (!stationID) {
    return NextResponse.json({ error: ro.api.missingStationId }, { status: 400 });
  }

  await ensureGtfsData();

  try {
    const data = await getStationArrivals(stationID);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof Error && err.message === "SERVICE_UNAVAILABLE") {
      return NextResponse.json({ error: ro.api.serviceUnavailable }, { status: 503 });
    }
    console.error(err);
    return NextResponse.json({ error: ro.api.serverError }, { status: 500 });
  }
}
