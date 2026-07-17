import type { FastifyInstance } from "fastify";
import { getRouteShapeData } from "@/lib/server/arrivals";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { ro } from "@/lib/i18n";

export async function registerRouteShapeRoutes(app: FastifyInstance) {
  app.get("/routeShape", async (request, reply) => {
    const query = request.query as { shapeId?: string; name?: string };
    const shapeId = query.shapeId;
    const name = query.name;

    if (!shapeId) {
      return reply.status(400).send({ error: ro.api.provideDetails });
    }

    await ensureGtfsData();

    try {
      const data = await getRouteShapeData(shapeId, name);
      return data;
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: ro.api.serverError });
    }
  });
}
