import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function hasRepoMarkers(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, "backend", "package.json")) &&
    fs.existsSync(path.join(dir, "data"))
  );
}

export function findRepoRoot(startDir: string): string {
  let dir = path.resolve(startDir);
  while (true) {
    if (hasRepoMarkers(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        "Could not locate NexTB repository root (expected backend/ and data/ siblings)."
      );
    }
    dir = parent;
  }
}

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = findRepoRoot(moduleDir);
