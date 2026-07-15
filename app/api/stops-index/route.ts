import { NextResponse } from "next/server";
import { getStopsJson } from "@/lib/server/gtfs";
import { buildStopSearchIndex } from "@/lib/stops/search-index";
import { cache } from "@/lib/server/cache";
import { ro } from "@/lib/i18n";

export async function GET() {
  const cacheKey = "stops_search_index";
  const cached = cache.get<ReturnType<typeof buildStopSearchIndex>>(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const stops = getStopsJson();
    const index = buildStopSearchIndex(stops);
    cache.set(cacheKey, index, 3600);
    return NextResponse.json(index);
  } catch {
    return NextResponse.json({ error: ro.api.stopsLoadError }, { status: 500 });
  }
}
