import dotenv from "dotenv";
import path from "node:path";
import { REPO_ROOT } from "@/lib/repo-root";

// Load backend/.env first, then repo-root .env as fallback.
dotenv.config({ path: path.join(REPO_ROOT, "backend", ".env") });
dotenv.config({ path: path.join(REPO_ROOT, ".env") });

export { REPO_ROOT };

export const env = {
  port: Number(process.env.PORT ?? "8080"),
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  cronSecret: process.env.CRON_SECRET ?? "",
};
