import type { FastifyInstance } from "fastify";
import {
  hashDeviceId,
  reportAcVote,
  VehicleHasNoAcError,
  listAcVoteStatuses,
} from "@/lib/server/ac-votes";
import { acReportSchema } from "@/lib/server/security/schemas";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { ro } from "@/lib/i18n";
import { getClientIp, getDeviceId } from "../lib/request.js";

export async function registerAcRoutes(app: FastifyInstance) {
  app.get("/ac/status", async (_request, reply) => {
    try {
      const statuses = await listAcVoteStatuses();
      return { statuses };
    } catch {
      return reply.status(500).send({ error: ro.api.serverError });
    }
  });

  app.post("/ac/report", async (request, reply) => {
    const ip = getClientIp(request);
    const deviceId = getDeviceId(request);
    if (!deviceId) {
      return reply.status(400).send({ error: ro.api.malformedRequest });
    }

    const rateKey = `ac:${ip}:${deviceId}`;
    const limited = checkRateLimit(rateKey, 10, 24 * 60 * 60 * 1000);
    if (!limited.ok) {
      reply.header("Retry-After", String(limited.retryAfterSec));
      return reply.status(429).send({ error: ro.api.rateLimited });
    }

    const parsed = acReportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: ro.api.malformedRequest });
    }

    try {
      const status = await reportAcVote(
        parsed.data.vehicleId,
        parsed.data.vote,
        hashDeviceId(deviceId)
      );
      return { status, message: ro.api.voteRecorded };
    } catch (err) {
      if (err instanceof VehicleHasNoAcError) {
        return reply.status(400).send({ error: ro.api.vehicleNoAc });
      }
      return reply.status(500).send({ error: ro.api.serverError });
    }
  });
}
