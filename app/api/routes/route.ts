import { NextResponse } from "next/server";
import { loadRoutesData } from "@/lib/server/gtfs";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { jsonCached } from "@/lib/server/api-cache";
import { ro } from "@/lib/i18n";

export async function GET() {
  await ensureGtfsData();
  try {
    const data = await loadRoutesData();
    return jsonCached(data);
  } catch {
    return NextResponse.json({ error: ro.api.serverError }, { status: 500 });
  }
}
