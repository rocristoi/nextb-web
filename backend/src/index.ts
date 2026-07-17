import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { ensureGtfsData } from "@/lib/server/gtfs-download";
import { seedLegacyNoAcVotes } from "@/lib/server/ac-votes";
import { env, REPO_ROOT } from "./config/env.js";
import { registerStationRoutes } from "./routes/station.js";
import { registerRoutesRoutes } from "./routes/routes.js";
import { registerStopsRoutes } from "./routes/stops.js";
import { registerRouteShapeRoutes } from "./routes/route-shape.js";
import { registerAlertsRoutes } from "./routes/alerts.js";
import { registerAcRoutes } from "./routes/ac.js";
import { registerVehicleRoutes } from "./routes/vehicle.js";
import { registerCronRoutes } from "./routes/cron.js";

process.chdir(REPO_ROOT);

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "production" ? "info" : "debug",
    },
    trustProxy: true,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(",").map((o) => o.trim()),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Device-Id", "Authorization"],
  });

  app.get("/health", async () => ({
    ok: true,
    service: "nextb-api",
    version: "1.0.0",
  }));

  await app.register(
    async (api) => {
      await registerStationRoutes(api);
      await registerRoutesRoutes(api);
      await registerStopsRoutes(api);
      await registerRouteShapeRoutes(api);
      await registerAlertsRoutes(api);
      await registerAcRoutes(api);
      await registerVehicleRoutes(api);
      await registerCronRoutes(api);
    },
    { prefix: "/api" }
  );

  ensureGtfsData().catch((err) => app.log.error(err, "GTFS bootstrap failed"));
  seedLegacyNoAcVotes().catch((err) => app.log.error(err, "AC seed failed"));

  await app.listen({ port: env.port, host: env.host });
  app.log.info(`NexTB API listening on http://${env.host}:${env.port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
