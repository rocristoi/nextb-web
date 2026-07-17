import type { FastifyRequest } from "fastify";

export function getClientIp(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string") return realIp;
  return request.ip ?? "unknown";
}

export function getDeviceId(request: FastifyRequest): string | null {
  const id = request.headers["x-device-id"];
  if (typeof id !== "string" || id.length < 8 || id.length > 64) return null;
  return id;
}

export const STATIC_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";
