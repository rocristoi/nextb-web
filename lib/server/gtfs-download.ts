import fs from "fs";
import crypto from "crypto";
import path from "path";
import { parse } from "csv-parse/sync";
import unzipper from "unzipper";
import { DATA_DIR, PATHS } from "./config";
import { clearGtfsCaches } from "./gtfs";

const STOPS_ZIP_URL = "https://gtfs.tpbi.ro/regional/BUCHAREST-REGION.zip";

const GTFS_BUNDLE_FILES = [
  { key: "stops.txt", path: PATHS.stopsTxt },
  { key: "routes.txt", path: PATHS.routesTxt },
  { key: "shapes.txt", path: PATHS.shapesTxt },
  { key: "stops.json", path: PATHS.stopsJson },
] as const;

export type GtfsBundleManifest = {
  zipSha256: string;
  files: Record<(typeof GTFS_BUNDLE_FILES)[number]["key"], string>;
  updatedAt: string;
};

export type GtfsDownloadResult = {
  skipped?: boolean;
  reason?: "bundle_ready" | "read_only_runtime";
};

function isDataDirWritable(): boolean {
  try {
    fs.accessSync(DATA_DIR, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

async function fileHash(filePath: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) return resolve(null);
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => resolve(null));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function readGtfsManifest(): GtfsBundleManifest | null {
  if (!fs.existsSync(PATHS.gtfsManifest)) return null;
  try {
    return JSON.parse(fs.readFileSync(PATHS.gtfsManifest, "utf8")) as GtfsBundleManifest;
  } catch {
    return null;
  }
}

async function writeGtfsManifest(zipSha256: string): Promise<GtfsBundleManifest> {
  const files = {} as GtfsBundleManifest["files"];
  for (const { key, path: filePath } of GTFS_BUNDLE_FILES) {
    const hash = await fileHash(filePath);
    if (!hash) throw new Error(`[STOPS] Cannot hash missing GTFS file: ${key}`);
    files[key] = hash;
  }

  const manifest: GtfsBundleManifest = {
    zipSha256,
    files,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(PATHS.gtfsManifest, JSON.stringify(manifest, null, 2), "utf8");
  return manifest;
}

async function verifyBundleChecksums(manifest: GtfsBundleManifest): Promise<boolean> {
  for (const { key, path: filePath } of GTFS_BUNDLE_FILES) {
    const expected = manifest.files[key];
    if (!expected) return false;
    const actual = await fileHash(filePath);
    if (actual !== expected) return false;
  }

  if (fs.existsSync(PATHS.gtfsZip)) {
    const zipHash = await fileHash(PATHS.gtfsZip);
    if (zipHash !== manifest.zipSha256) return false;
  }

  return true;
}

export async function isGtfsBundleReady(): Promise<boolean> {
  if (!GTFS_BUNDLE_FILES.every(({ path: filePath }) => fs.existsSync(filePath))) {
    return false;
  }

  const manifest = readGtfsManifest();
  if (!manifest) return false;

  return verifyBundleChecksums(manifest);
}

async function downloadFile(url: string, destPath: string) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(ab));
}

export async function downloadAndExtractStops(): Promise<GtfsDownloadResult> {
  if (await isGtfsBundleReady()) {
    console.log("[STOPS] GTFS bundle present and checksums match, skipping download.");
    return { skipped: true, reason: "bundle_ready" };
  }

  if (!isDataDirWritable()) {
    const message =
      "[STOPS] GTFS bundle missing and filesystem is read-only (serverless deployment). " +
      "Run `npm run gtfs:prepare` at build time.";
    console.error(message);
    throw new Error(message);
  }

  try {
    const tmpDownloadPath = PATHS.gtfsZipTmp;
    const finalZipPath = PATHS.gtfsZip;
    const stopsTxtPath = PATHS.stopsTxt;
    const stopsJsonPath = PATHS.stopsJson;

    await downloadFile(STOPS_ZIP_URL, tmpDownloadPath);

    const newHash = await fileHash(tmpDownloadPath);
    const oldHash = await fileHash(finalZipPath);
    if (newHash && oldHash && newHash === oldHash) {
      fs.unlinkSync(tmpDownloadPath);
      if (!readGtfsManifest()) {
        await writeGtfsManifest(newHash);
      }
      if (await isGtfsBundleReady()) {
        console.log("[STOPS] ZIP unchanged, skipping extraction.");
        return { skipped: true, reason: "bundle_ready" };
      }
      console.log("[STOPS] ZIP unchanged but bundle checksums stale, re-extracting.");
    } else {
      fs.renameSync(tmpDownloadPath, finalZipPath);
    }

    const zipSha256 = (await fileHash(finalZipPath)) ?? newHash;
    if (!zipSha256) throw new Error("[STOPS] Failed to hash GTFS ZIP.");

    const filesToExtract = ["stops.txt", "routes.txt", "shapes.txt"];
    const extracted = { stops: false, routes: false, shapes: false };

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(finalZipPath)
        .pipe(unzipper.Parse())
        .on("entry", function (entry) {
          const name = entry.path;
          if (filesToExtract.includes(name)) {
            const outPath = path.join(path.dirname(stopsTxtPath), name);
            const out = fs.createWriteStream(outPath);
            entry.pipe(out);
            out.on("finish", () => {
              if (name === "stops.txt") extracted.stops = true;
              if (name === "routes.txt") extracted.routes = true;
              if (name === "shapes.txt") extracted.shapes = true;
              if (Object.values(extracted).every(Boolean)) resolve();
            });
            out.on("error", reject);
          } else {
            entry.autodrain();
          }
        })
        .on("close", () => {
          if (extracted.stops) resolve();
          else reject(new Error("stops.txt not found in ZIP"));
        })
        .on("error", reject);
    });

    const stopsTxtRaw = fs.readFileSync(stopsTxtPath, "utf8");
    type GtfsStopRow = Record<string, string | number | null | undefined>;
    const stops = parse(stopsTxtRaw, {
      columns: true,
      skip_empty_lines: true,
    }) as GtfsStopRow[];
    for (const stop of stops) {
      if (stop.stop_id && /^\d+$/.test(String(stop.stop_id))) {
        stop.stop_id = parseInt(String(stop.stop_id), 10);
      }
      if (stop.stop_lat) {
        stop.stop_lat =
          stop.stop_lat === "" ? null : parseFloat(String(stop.stop_lat));
      }
      if (stop.stop_lon) {
        stop.stop_lon =
          stop.stop_lon === "" ? null : parseFloat(String(stop.stop_lon));
      }
    }

    const stopsDir = path.dirname(stopsJsonPath);
    if (!fs.existsSync(stopsDir)) {
      fs.mkdirSync(stopsDir, { recursive: true });
    }
    fs.writeFileSync(stopsJsonPath, JSON.stringify(stops, null, 2), "utf8");
    await writeGtfsManifest(zipSha256);
    clearGtfsCaches();
    console.log("[STOPS] Downloaded and converted stops.txt to JSON.");
    return {};
  } catch (err) {
    console.error("[STOPS] Error downloading or processing stops:", err);
    throw err;
  }
}

let downloadPromise: Promise<GtfsDownloadResult> | null = null;

export function ensureGtfsData(): Promise<GtfsDownloadResult> {
  if (!downloadPromise) {
    downloadPromise = downloadAndExtractStops().catch((err) => {
      downloadPromise = null;
      throw err;
    });
  }
  return downloadPromise;
}
