import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");

function filePath(file) {
  return path.join(DATA_DIR, file.endsWith(".json") ? file : `${file}.json`);
}

export function readJSON(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(filePath(file), "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

// Write to a temp file then rename, so a crash can't leave a half-written file.
export function writeJSON(file, data) {
  const target = filePath(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, target);
}

export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}
