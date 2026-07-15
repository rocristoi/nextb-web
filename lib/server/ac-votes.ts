import crypto from "crypto";
import fs from "fs";
import type { AcConfidence, AcVoteStatus } from "@/lib/types";
import { vehicleHasAc } from "@/lib/comfort/score";
import { resolveVehicleByInventory } from "@/lib/vehicles/fleetInfo";
import { getDb, isDbConfigured } from "./db/client";
import { serverConfig } from "./config";

const BROKEN_THRESHOLD = 5;
const UNCERTAIN_THRESHOLD = 1;

export class VehicleHasNoAcError extends Error {
  constructor(readonly vehicleId: number) {
    super(`Vehicle ${vehicleId} has no AC hardware`);
    this.name = "VehicleHasNoAcError";
  }
}

function resolveAcVehicleType(vehicleId: number): string {
  return resolveVehicleByInventory(vehicleId).type;
}

/** In-memory fallback when DATABASE_URL is not set */
const memoryVotes = new Map<number, Map<string, number>>();

function readLegacyNoAc(): string[] {
  try {
    return JSON.parse(fs.readFileSync(serverConfig.noAcPath(), "utf8"));
  } catch {
    return [];
  }
}

export function hashDeviceId(deviceId: string): string {
  const salt = process.env.DEVICE_HASH_SALT ?? "nextb-dev-salt";
  return crypto.createHash("sha256").update(`${salt}:${deviceId}`).digest("hex");
}

async function ensureSchema() {
  const db = getDb();
  if (!db) return;
  await db`
    CREATE TABLE IF NOT EXISTS ac_votes (
      id          BIGSERIAL PRIMARY KEY,
      vehicle_id  INTEGER NOT NULL,
      vote        SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
      device_hash TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (vehicle_id, device_hash)
    )
  `;
  await db`
    CREATE INDEX IF NOT EXISTS ac_votes_vehicle_id_idx ON ac_votes (vehicle_id)
  `;
}

let schemaReady: Promise<void> | null = null;

function getSchemaReady() {
  if (!schemaReady) schemaReady = ensureSchema().catch(() => {});
  return schemaReady;
}

export async function seedLegacyNoAcVotes(): Promise<void> {
  if (!isDbConfigured()) return;
  await getSchemaReady();
  const db = getDb();
  if (!db) return;
  const legacy = readLegacyNoAc();
  for (const id of legacy) {
    const vehicleId = parseInt(id, 10);
    if (!vehicleId) continue;
    await db`
      INSERT INTO ac_votes (vehicle_id, vote, device_hash)
      VALUES (${vehicleId}, 1, ${`legacy-seed-${vehicleId}`})
      ON CONFLICT (vehicle_id, device_hash) DO NOTHING
    `;
  }
}

export function confidenceFromVotes(
  brokenVotes: number,
  workingVotes: number,
  vehicleType: string,
  vehicleId?: number | null
): AcConfidence {
  if (!vehicleHasAc(vehicleId ?? null, vehicleType)) return "none";
  const net = brokenVotes - workingVotes;
  if (net >= BROKEN_THRESHOLD) return "broken";
  if (net >= UNCERTAIN_THRESHOLD) return "uncertain";
  return "ok";
}

export async function getVoteCounts(vehicleId: number): Promise<{ broken: number; working: number }> {
  if (!isDbConfigured()) {
    const votes = memoryVotes.get(vehicleId);
    if (!votes) return { broken: 0, working: 0 };
    let broken = 0;
    let working = 0;
    for (const v of votes.values()) {
      if (v === 1) broken++;
      else working++;
    }
    return { broken, working };
  }
  await getSchemaReady();
  const db = getDb()!;
  const rows = await db`
    SELECT vote, COUNT(*)::int AS cnt
    FROM ac_votes
    WHERE vehicle_id = ${vehicleId}
    GROUP BY vote
  `;
  let broken = 0;
  let working = 0;
  for (const row of rows as { vote: number; cnt: number }[]) {
    if (row.vote === 1) broken = row.cnt;
    if (row.vote === -1) working = row.cnt;
  }
  return { broken, working };
}

export async function getAcConfidence(
  vehicleId: number | null,
  vehicleType: string
): Promise<AcConfidence> {
  if (vehicleId == null || vehicleId <= 0) {
    return vehicleHasAc(null, vehicleType) ? "ok" : "none";
  }
  if (!vehicleHasAc(vehicleId, vehicleType)) return "none";

  if (!isDbConfigured()) {
    const legacy = new Set(readLegacyNoAc());
    if (legacy.has(String(vehicleId))) return "broken";
    const { broken, working } = await getVoteCounts(vehicleId);
    return confidenceFromVotes(broken, working, vehicleType, vehicleId);
  }

  const { broken, working } = await getVoteCounts(vehicleId);
  return confidenceFromVotes(broken, working, vehicleType, vehicleId);
}

export async function reportAcVote(
  vehicleId: number,
  vote: "broken" | "working",
  deviceHash: string
): Promise<AcVoteStatus> {
  const vehicleType = resolveAcVehicleType(vehicleId);
  if (!vehicleHasAc(vehicleId, vehicleType)) {
    throw new VehicleHasNoAcError(vehicleId);
  }

  const voteVal = vote === "broken" ? 1 : -1;

  if (!isDbConfigured()) {
    if (!memoryVotes.has(vehicleId)) memoryVotes.set(vehicleId, new Map());
    memoryVotes.get(vehicleId)!.set(deviceHash, voteVal);
    const { broken, working } = await getVoteCounts(vehicleId);
    return {
      vehicleId,
      brokenVotes: broken,
      workingVotes: working,
      confidence: confidenceFromVotes(broken, working, vehicleType, vehicleId),
    };
  }

  await getSchemaReady();
  const db = getDb()!;
  await db`
    INSERT INTO ac_votes (vehicle_id, vote, device_hash)
    VALUES (${vehicleId}, ${voteVal}, ${deviceHash})
    ON CONFLICT (vehicle_id, device_hash)
    DO UPDATE SET vote = ${voteVal}, created_at = now()
  `;
  const { broken, working } = await getVoteCounts(vehicleId);
  return {
    vehicleId,
    brokenVotes: broken,
    workingVotes: working,
    confidence: confidenceFromVotes(broken, working, vehicleType, vehicleId),
  };
}

export async function listAcVoteStatuses(): Promise<AcVoteStatus[]> {
  if (!isDbConfigured()) {
    const legacy = readLegacyNoAc().map((id) => parseInt(id, 10)).filter(Boolean);
    const ids = new Set([...legacy, ...memoryVotes.keys()]);
    const results: AcVoteStatus[] = [];
    for (const vehicleId of ids) {
      const vehicleType = resolveAcVehicleType(vehicleId);
      if (!vehicleHasAc(vehicleId, vehicleType)) continue;
      const { broken, working } = await getVoteCounts(vehicleId);
      const confidence = confidenceFromVotes(broken, working, vehicleType, vehicleId);
      if (confidence !== "ok") {
        results.push({ vehicleId, brokenVotes: broken, workingVotes: working, confidence });
      }
    }
    return results.sort((a, b) => b.brokenVotes - a.brokenVotes);
  }

  await getSchemaReady();
  const db = getDb()!;
  const rows = await db`
    SELECT vehicle_id,
           SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END)::int AS broken,
           SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END)::int AS working
    FROM ac_votes
    GROUP BY vehicle_id
    HAVING SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END) -
           SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END) >= ${UNCERTAIN_THRESHOLD}
    ORDER BY broken DESC
  `;
  return (rows as { vehicle_id: number; broken: number; working: number }[])
    .map((r) => {
      const vehicleType = resolveAcVehicleType(r.vehicle_id);
      return {
        vehicleId: r.vehicle_id,
        brokenVotes: r.broken,
        workingVotes: r.working,
        confidence: confidenceFromVotes(r.broken, r.working, vehicleType, r.vehicle_id),
        vehicleType,
      };
    })
    .filter((r) => vehicleHasAc(r.vehicleId, r.vehicleType))
    .map(({ vehicleType: _vehicleType, ...status }) => status);
}

export function hasAC(vehID: number | null, type: string, confidence?: AcConfidence): boolean {
  const c = confidence ?? (vehicleHasAc(vehID, type) ? "ok" : "none");
  if (c === "broken" || c === "none") return false;
  if (c === "uncertain") return false;
  if (vehID !== null && new Set(readLegacyNoAc()).has(String(vehID)) && !isDbConfigured()) {
    return false;
  }
  return true;
}
