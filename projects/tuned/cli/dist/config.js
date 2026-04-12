import fs from "fs";
import path from "path";
const CONFIG_FILENAME = ".tuned.json";
/**
 * Get the config file path from current working directory
 */
function getConfigPath() {
    return path.join(process.cwd(), CONFIG_FILENAME);
}
/**
 * Check if .tuned.json exists in the current working directory
 */
export function configExists() {
    const configPath = getConfigPath();
    return fs.existsSync(configPath);
}
/**
 * Load configuration from .tuned.json in current working directory
 * @returns TunedConfig object or null if config file doesn't exist
 */
export function loadConfig() {
    const configPath = getConfigPath();
    if (!configExists()) {
        return null;
    }
    try {
        const configContent = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configContent);
        return config;
    }
    catch (error) {
        throw new Error(`Failed to load config from ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Save configuration to .tuned.json in current working directory
 * @param config - TunedConfig object to save
 */
export function saveConfig(config) {
    const configPath = getConfigPath();
    try {
        const configContent = JSON.stringify(config, null, 2);
        fs.writeFileSync(configPath, configContent, "utf-8");
    }
    catch (error) {
        throw new Error(`Failed to save config to ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
