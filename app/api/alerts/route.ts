import { NextResponse } from "next/server";
import { cache } from "@/lib/server/cache";
import { getAlerts } from "@/lib/server/stb-alerts";
import { ro } from "@/lib/i18n";

const MAX_RETRIES = 3;

export async function GET() {
  const cacheKey = "alerts";
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const alerts = await getAlerts();
      cache.set(cacheKey, alerts, 60);
      return NextResponse.json(alerts);
    } catch (e) {
      console.error(e);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  return NextResponse.json({ error: ro.api.serviceUnavailable }, { status: 503 });
}
