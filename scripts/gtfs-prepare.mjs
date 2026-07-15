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
};

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

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  try {
    await downloadFile(STOPS_ZIP_URL, PATHS.gtfsZipTmp);
    const newHash = await fileHash(PATHS.gtfsZipTmp);
    const oldHash = await fileHash(PATHS.gtfsZip);
    if (newHash && oldHash && newHash === oldHash) {
      fs.unlinkSync(PATHS.gtfsZipTmp);
      console.log("[gtfs-prepare] ZIP unchanged, skipping.");
      return;
    }
    fs.renameSync(PATHS.gtfsZipTmp, PATHS.gtfsZip);

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
    console.log("[gtfs-prepare] Downloaded and converted stops.");
  } catch (err) {
    console.warn("[gtfs-prepare] Failed, using committed data:", err?.message ?? err);
    process.exit(0);
  }
}

main();
