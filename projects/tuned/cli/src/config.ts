import fs from "fs";
import path from "path";

/**
 * Configuration format for Tuned CLI
 * Stored in .tuned.json in project root
 *
 * Example .tuned.json:
 * {
 *   "projectId": "550e8400-e29b-41d4-a716-446655440000",
 *   "apiKey": "tuned_sk_live_abc123def456",
 *   "backendUrl": "https://api.tuned.dev"
 * }
 */
export interface TunedConfig {
  projectId: string;
  apiKey: string;
  backendUrl: string;
}

const CONFIG_FILENAME = ".tuned.json";

/**
 * Get the config file path from current working directory
 */
function getConfigPath(): string {
  return path.join(process.cwd(), CONFIG_FILENAME);
}

/**
 * Check if .tuned.json exists in the current working directory
 */
export function configExists(): boolean {
  const configPath = getConfigPath();
  return fs.existsSync(configPath);
}

/**
 * Load configuration from .tuned.json in current working directory
 * @returns TunedConfig object or null if config file doesn't exist
 */
export function loadConfig(): TunedConfig | null {
  const configPath = getConfigPath();

  if (!configExists()) {
    return null;
  }

  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent) as TunedConfig;
    return config;
  } catch (error) {
    throw new Error(
      `Failed to load config from ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Save configuration to .tuned.json in current working directory
 * @param config - TunedConfig object to save
 */
export function saveConfig(config: TunedConfig): void {
  const configPath = getConfigPath();

  try {
    const configContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configContent, "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to save config to ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
