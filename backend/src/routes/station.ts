import type { FastifyInstance } from "fastify";
import { getStationArrivals } from "@/lib/server/arrivals";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { ro } from "@/lib/i18n";

export async function registerStationRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const stationID = (request.query as { stationID?: string }).stationID;
    if (!stationID) {
      return reply.status(400).send({ error: ro.api.missingStationId });
    }

    await ensureGtfsData();

    try {
      const data = await getStationArrivals(stationID);
      return data;
    } catch (err) {
      if (err instanceof Error && err.message === "SERVICE_UNAVAILABLE") {
        return reply.status(503).send({ error: ro.api.serviceUnavailable });
      }
      request.log.error(err);
      return reply.status(500).send({ error: ro.api.serverError });
    }
  });
}
