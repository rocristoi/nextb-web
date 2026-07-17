import type { FastifyInstance } from "fastify";
import { downloadAndExtractStops } from "@/lib/server/gtfs-download";
import { env } from "../config/env.js";

export async function registerCronRoutes(app: FastifyInstance) {
  app.get("/cron/gtfs-refresh", async (request, reply) => {
    const query = request.query as { secret?: string };
    const authHeader = request.headers.authorization;
    const bearerSecret = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const secret = query.secret ?? bearerSecret;

    if (env.nodeEnv === "production" && !env.cronSecret) {
      return reply.status(503).send({ error: "Cron not configured" });
    }

    if (env.cronSecret && secret !== env.cronSecret) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const result = await downloadAndExtractStops();
    return {
      ok: true,
      ...result,
    };
  });
}
