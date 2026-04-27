import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { CACHE_DIR } from "../config/constants.js";

const CACHE_FILE = `${CACHE_DIR}/suggestions.json`;

interface CacheEntry {
  suggestion: string;
  timestamp: number;
}

interface CacheData {
  [key: string]: CacheEntry;
}

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function readCache(): CacheData {
  ensureCacheDir();
  if (!existsSync(CACHE_FILE)) {
    return {};
  }
  try {
    const raw = readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as CacheData;
  } catch {
    return {};
  }
}

function writeCache(data: CacheData): void {
  ensureCacheDir();
  writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function hashDiff(diff: string): string {
  return createHash("sha256").update(diff).digest("hex");
}

export function getCachedSuggestion(hash: string): string | null {
  const cache = readCache();
  const entry = cache[hash];
  if (entry && typeof entry.suggestion === "string") {
    return entry.suggestion;
  }
  return null;
}

export function setCachedSuggestion(hash: string, suggestion: string): void {
  const cache = readCache();
  cache[hash] = { suggestion, timestamp: Date.now() };
  writeCache(cache);
}
