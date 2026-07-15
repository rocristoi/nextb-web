import { NextResponse } from "next/server";
import { hashDeviceId, reportAcVote, VehicleHasNoAcError } from "@/lib/server/ac-votes";
import { acReportSchema, getDeviceId } from "@/lib/server/security/schemas";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { ro } from "@/lib/i18n";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const deviceId = getDeviceId(request);
  if (!deviceId) {
    return NextResponse.json({ error: ro.api.malformedRequest }, { status: 400 });
  }

  const rateKey = `ac:${ip}:${deviceId}`;
  const limited = checkRateLimit(rateKey, 10, 24 * 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: ro.api.rateLimited },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: ro.api.malformedRequest }, { status: 400 });
  }

  const parsed = acReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: ro.api.malformedRequest }, { status: 400 });
  }

  try {
    const status = await reportAcVote(
      parsed.data.vehicleId,
      parsed.data.vote,
      hashDeviceId(deviceId)
    );
    return NextResponse.json({ status, message: ro.api.voteRecorded });
  } catch (err) {
    if (err instanceof VehicleHasNoAcError) {
      return NextResponse.json({ error: ro.api.vehicleNoAc }, { status: 400 });
    }
    return NextResponse.json({ error: ro.api.serverError }, { status: 500 });
  }
}
