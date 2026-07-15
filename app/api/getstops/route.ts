import { NextResponse } from "next/server";
import { getStopsJson } from "@/lib/server/gtfs";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { jsonCached } from "@/lib/server/api-cache";
import { ro } from "@/lib/i18n";

export async function GET() {
  await ensureGtfsData();
  try {
    const stops = getStopsJson();
    if (!stops.length) {
      return NextResponse.json({ error: ro.api.stopsLoadError }, { status: 503 });
    }
    return jsonCached(stops);
  } catch {
    return NextResponse.json({ error: ro.api.stopsLoadError }, { status: 500 });
  }
}
