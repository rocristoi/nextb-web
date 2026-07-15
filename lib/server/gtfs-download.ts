import fs from "fs";
import crypto from "crypto";
import path from "path";
import { parse } from "csv-parse/sync";
import unzipper from "unzipper";
import { PATHS } from "./config";
import { clearGtfsCaches } from "./gtfs";

const STOPS_ZIP_URL = "https://gtfs.tpbi.ro/regional/BUCHAREST-REGION.zip";

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

export async function downloadAndExtractStops() {
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
      console.log("[STOPS] ZIP unchanged, skipping extraction.");
      return;
    }
    fs.renameSync(tmpDownloadPath, finalZipPath);

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
    clearGtfsCaches();
    console.log("[STOPS] Downloaded and converted stops.txt to JSON.");
  } catch (err) {
    console.error("[STOPS] Error downloading or processing stops:", err);
  }
}

let downloadPromise: Promise<void> | null = null;

export function ensureGtfsData() {
  if (!downloadPromise) {
    downloadPromise = downloadAndExtractStops();
  }
  return downloadPromise;
}
