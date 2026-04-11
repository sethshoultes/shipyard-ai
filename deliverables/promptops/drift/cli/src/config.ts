/**
 * Drift CLI - Configuration Management
 *
 * Stores API key in ~/.drift/config.json
 * Supports DRIFT_KEY environment variable override
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface DriftConfig {
  api_key?: string;
  api_url?: string;
  project_name?: string;
}

const CONFIG_DIR = join(homedir(), ".drift");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const DEFAULT_API_URL = "https://drift-api.shipyard.workers.dev";

/**
 * Load configuration from file and environment
 * Environment variable DRIFT_KEY takes precedence
 */
export function loadConfig(): DriftConfig {
  let config: DriftConfig = {
    api_url: DEFAULT_API_URL,
  };

  // Try to load from file
  if (existsSync(CONFIG_FILE)) {
    try {
      const content = readFileSync(CONFIG_FILE, "utf-8");
      config = { ...config, ...JSON.parse(content) };
    } catch {
      // Ignore parse errors, use defaults
    }
  }

  // Environment variable override
  const envKey = process.env.DRIFT_KEY;
  if (envKey) {
    config.api_key = envKey;
  }

  // Environment variable for API URL override
  const envUrl = process.env.DRIFT_API_URL;
  if (envUrl) {
    config.api_url = envUrl;
  }

  return config;
}

/**
 * Save configuration to file
 * Creates ~/.drift directory with 0700 permissions if needed
 */
export function saveConfig(config: DriftConfig): void {
  // Create config directory if it doesn't exist
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }

  // Merge with existing config
  let existingConfig: DriftConfig = {};
  if (existsSync(CONFIG_FILE)) {
    try {
      existingConfig = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    } catch {
      // Ignore parse errors
    }
  }

  const mergedConfig = { ...existingConfig, ...config };

  // Write config file
  writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2) + "\n");

  // Set restrictive permissions (owner read/write only)
  try {
    chmodSync(CONFIG_FILE, 0o600);
  } catch {
    // Ignore permission errors on Windows
  }
}

/**
 * Get API key from config
 * Returns null if not configured
 */
export function getApiKey(): string | null {
  const config = loadConfig();
  return config.api_key || null;
}

/**
 * Get API URL from config
 */
export function getApiUrl(): string {
  const config = loadConfig();
  return config.api_url || DEFAULT_API_URL;
}

/**
 * Check if configuration exists
 */
export function isConfigured(): boolean {
  return getApiKey() !== null;
}

/**
 * Print configuration status
 */
export function printConfigStatus(): void {
  const config = loadConfig();
  const hasEnvKey = !!process.env.DRIFT_KEY;

  console.log("\nConfiguration:");
  console.log(`  Config file: ${CONFIG_FILE}`);
  console.log(`  API URL: ${config.api_url}`);
  console.log(
    `  API Key: ${config.api_key ? "configured" : "not configured"}${
      hasEnvKey ? " (from DRIFT_KEY env)" : ""
    }`
  );
  if (config.project_name) {
    console.log(`  Project: ${config.project_name}`);
  }
}
