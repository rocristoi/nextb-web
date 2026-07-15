import { z } from "zod";

export const acReportSchema = z.object({
  vehicleId: z.coerce.number().int().min(1).max(8999),
  vote: z.enum(["broken", "working"]),
});

export const vehicleSearchSchema = z.object({
  q: z.string().min(1).max(32),
});

export function getDeviceId(request: Request): string | null {
  const id = request.headers.get("x-device-id");
  if (!id || id.length < 8 || id.length > 64) return null;
  return id;
}
