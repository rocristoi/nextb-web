import type { FastifyInstance } from "fastify";
import { loadRoutesData } from "@/lib/server/gtfs";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { ro } from "@/lib/i18n";
import { STATIC_CACHE } from "../lib/request.js";

export async function registerRoutesRoutes(app: FastifyInstance) {
  app.get("/routes", async (_request, reply) => {
    await ensureGtfsData();
    try {
      const data = await loadRoutesData();
      reply.header("Cache-Control", STATIC_CACHE);
      return data;
    } catch {
      return reply.status(500).send({ error: ro.api.serverError });
    }
  });
}
