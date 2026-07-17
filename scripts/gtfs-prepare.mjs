/**
 * Prebuild GTFS preparation — downloads/updates GTFS if changed, writes stops.json.
 */
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import unzipper from "unzipper";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const DATA_DIR = path.join(webRoot, "data");
const ASSETS_DATA_DIR = path.join(webRoot, "assets", "data");
const STOPS_ZIP_URL = "https://gtfs.tpbi.ro/regional/BUCHAREST-REGION.zip";

const PATHS = {
  stopsJson: path.join(ASSETS_DATA_DIR, "stops.json"),
  stopsTxt: path.join(DATA_DIR, "stops.txt"),
  gtfsZip: path.join(DATA_DIR, "BUCHAREST-REGION.zip"),
  gtfsZipTmp: path.join(DATA_DIR, "BUCHAREST-REGION.zip.tmp"),
  gtfsManifest: path.join(DATA_DIR, "gtfs-manifest.json"),
};

const BUNDLE_FILES = [
  { key: "stops.txt", path: PATHS.stopsTxt },
  { key: "routes.txt", path: path.join(DATA_DIR, "routes.txt") },
  { key: "shapes.txt", path: path.join(DATA_DIR, "shapes.txt") },
  { key: "stops.json", path: PATHS.stopsJson },
];

async function fileHash(filePath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) return resolve(null);
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => resolve(null));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function readManifest() {
  if (!fs.existsSync(PATHS.gtfsManifest)) return null;
  try {
    return JSON.parse(fs.readFileSync(PATHS.gtfsManifest, "utf8"));
  } catch {
    return null;
  }
}

async function writeManifest(zipSha256) {
  const files = {};
  for (const { key, path: filePath } of BUNDLE_FILES) {
    const hash = await fileHash(filePath);
    if (!hash) throw new Error(`Cannot hash missing GTFS file: ${key}`);
    files[key] = hash;
  }
  fs.writeFileSync(
    PATHS.gtfsManifest,
    JSON.stringify({ zipSha256, files, updatedAt: new Date().toISOString() }, null, 2),
    "utf8"
  );
}

async function isBundleReady() {
  if (!BUNDLE_FILES.every(({ path: filePath }) => fs.existsSync(filePath))) return false;
  const manifest = readManifest();
  if (!manifest) return false;
  for (const { key, path: filePath } of BUNDLE_FILES) {
    const actual = await fileHash(filePath);
    if (actual !== manifest.files?.[key]) return false;
  }
  if (fs.existsSync(PATHS.gtfsZip)) {
    const zipHash = await fileHash(PATHS.gtfsZip);
    if (zipHash !== manifest.zipSha256) return false;
  }
  return true;
}

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  try {
    if (await isBundleReady()) {
      console.log("[gtfs-prepare] Bundle present and checksums match, skipping.");
      return;
    }

    await downloadFile(STOPS_ZIP_URL, PATHS.gtfsZipTmp);
    const newHash = await fileHash(PATHS.gtfsZipTmp);
    const oldHash = await fileHash(PATHS.gtfsZip);
    if (newHash && oldHash && newHash === oldHash) {
      fs.unlinkSync(PATHS.gtfsZipTmp);
      if (!readManifest()) await writeManifest(newHash);
      if (await isBundleReady()) {
        console.log("[gtfs-prepare] ZIP unchanged, skipping.");
        return;
      }
      console.log("[gtfs-prepare] ZIP unchanged but checksums stale, re-extracting.");
    } else {
      fs.renameSync(PATHS.gtfsZipTmp, PATHS.gtfsZip);
    }

    const zipSha256 = (await fileHash(PATHS.gtfsZip)) ?? newHash;

    const filesToExtract = ["stops.txt", "routes.txt", "shapes.txt"];
    const extracted = { stops: false, routes: false, shapes: false };

    await new Promise((resolve, reject) => {
      fs.createReadStream(PATHS.gtfsZip)
        .pipe(unzipper.Parse())
        .on("entry", function (entry) {
          const name = entry.path;
          if (filesToExtract.includes(name)) {
            const outPath = path.join(DATA_DIR, name);
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

    const stops = parse(fs.readFileSync(PATHS.stopsTxt, "utf8"), {
      columns: true,
      skip_empty_lines: true,
    });
    for (const stop of stops) {
      if (stop.stop_id && /^\d+$/.test(String(stop.stop_id))) {
        stop.stop_id = parseInt(String(stop.stop_id), 10);
      }
      if (stop.stop_lat) stop.stop_lat = stop.stop_lat === "" ? null : parseFloat(String(stop.stop_lat));
      if (stop.stop_lon) stop.stop_lon = stop.stop_lon === "" ? null : parseFloat(String(stop.stop_lon));
    }
    fs.mkdirSync(ASSETS_DATA_DIR, { recursive: true });
    fs.writeFileSync(PATHS.stopsJson, JSON.stringify(stops, null, 2), "utf8");
    await writeManifest(zipSha256);
    console.log("[gtfs-prepare] Downloaded and converted stops.");
  } catch (err) {
    console.warn("[gtfs-prepare] Failed, using committed data:", err?.message ?? err);
    process.exit(0);
  }
}

main();
