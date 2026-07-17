import type { FastifyInstance } from "fastify";
import { getStopsJson } from "@/lib/server/gtfs";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { buildStopSearchIndex } from "@/lib/stops/search-index";
import { cache } from "@/lib/server/cache";
import { ro } from "@/lib/i18n";
import { STATIC_CACHE } from "../lib/request.js";

export async function registerStopsRoutes(app: FastifyInstance) {
  app.get("/getstops", async (_request, reply) => {
    await ensureGtfsData();
    try {
      const stops = getStopsJson();
      if (!stops.length) {
        return reply.status(503).send({ error: ro.api.stopsLoadError });
      }
      reply.header("Cache-Control", STATIC_CACHE);
      return stops;
    } catch {
      return reply.status(500).send({ error: ro.api.stopsLoadError });
    }
  });

  app.get("/stops-index", async (_request, reply) => {
    const cacheKey = "stops_search_index";
    const cached = cache.get<ReturnType<typeof buildStopSearchIndex>>(cacheKey);
    if (cached) return cached;

    try {
      const stops = getStopsJson();
      const index = buildStopSearchIndex(stops);
      cache.set(cacheKey, index, 3600);
      return index;
    } catch {
      return reply.status(500).send({ error: ro.api.stopsLoadError });
    }
  });
}
