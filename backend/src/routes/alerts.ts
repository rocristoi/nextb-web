import type { FastifyInstance } from "fastify";
import { cache } from "@/lib/server/cache";
import { getAlerts } from "@/lib/server/stb-alerts";
import { ro } from "@/lib/i18n";

const MAX_RETRIES = 3;

export async function registerAlertsRoutes(app: FastifyInstance) {
  app.get("/alerts", async (_request, reply) => {
    const cacheKey = "alerts";
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const alerts = await getAlerts();
        cache.set(cacheKey, alerts, 60);
        return alerts;
      } catch (err) {
        console.error(err);
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((res) => setTimeout(res, 1000));
        }
      }
    }

    return reply.status(503).send({ error: ro.api.serviceUnavailable });
  });
}
