import { NextResponse } from "next/server";
import { getRouteShapeData } from "@/lib/server/arrivals";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { ro } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shapeId = searchParams.get("shapeId");
  const name = searchParams.get("name") ?? undefined;

  if (!shapeId) {
    return NextResponse.json({ error: ro.api.provideDetails }, { status: 400 });
  }

  await ensureGtfsData();

  try {
    const data = await getRouteShapeData(shapeId, name);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: ro.api.serverError }, { status: 500 });
  }
}
