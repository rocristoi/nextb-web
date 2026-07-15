import { NextResponse } from "next/server";

const STATIC_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export function jsonCached(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", STATIC_CACHE);
  return NextResponse.json(data, { ...init, headers });
}
