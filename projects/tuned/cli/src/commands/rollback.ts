import { Command } from "commander";
import { createInterface } from "readline";
import { loadConfig } from "../config.js";
import { listVersions, activateVersion } from "../api.js";

/**
 * Prompt the user for confirmation (y/N)
 */
function promptConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

/**
 * Rollback a prompt to a previous version
 * Usage:
 *   tuned rollback <name>              - Rollback to previous version
 *   tuned rollback <name> <version>    - Rollback to specific version
 *   tuned rollback <name> --yes        - Rollback without confirmation
 */
export async function rollback(
  name: string,
  versionArg?: string,
  options?: {
    yes?: boolean;
  }
): Promise<void> {
  // Load config - error if not initialized
  const config = loadConfig();
  if (!config) {
    throw new Error(
      "Not initialized. Run 'tuned init' first to create .tuned.json"
    );
  }

  try {
    // Get all versions for the prompt
    const versions = await listVersions(name, config);

    if (versions.length === 0) {
      throw new Error(`No versions found for ${name}.`);
    }

    // Sort versions by version number (descending)
    const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

    let targetVersion: number;

    if (versionArg) {
      // User specified a version
      targetVersion = parseInt(versionArg, 10);
      if (isNaN(targetVersion)) {
        throw new Error(`Invalid version number: ${versionArg}`);
      }

      // Check if the version exists
      const versionExists = sortedVersions.some((v) => v.version === targetVersion);
      if (!versionExists) {
        throw new Error(`Version ${targetVersion} not found for ${name}.`);
      }
    } else {
      // No version specified - rollback to previous version (current - 1)
      const activeVersion = sortedVersions.find((v) => v.is_active);
      if (!activeVersion) {
        throw new Error(`No active version found for ${name}.`);
      }

      // Find the previous version
      const previousVersion = sortedVersions.find(
        (v) => v.version < activeVersion.version
      );
      if (!previousVersion) {
        throw new Error(`No previous version available for ${name}.`);
      }

      targetVersion = previousVersion.version;
    }

    // Confirm before rollback (unless --yes flag is set)
    if (!options?.yes) {
      const confirmed = await promptConfirm(
        `Roll back ${name} to v${targetVersion}? [y/N] `
      );
      if (!confirmed) {
        console.log("Rollback cancelled.");
        return;
      }
    }

    // Activate the target version
    await activateVersion(name, targetVersion, config);

    // Success message with brand voice
    console.log(`Rolled back ${name} to v${targetVersion}. Live at edge.`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Check if it's a "not found" error
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      const match = errorMessage.match(/version[:\s]+(\d+)/i);
      const version = match ? match[1] : "requested";
      throw new Error(`Version ${version} not found for ${name}.`);
    }

    throw error;
  }
}

export const rollbackCommand = new Command()
  .name("rollback")
  .description("Roll back a prompt to a previous version")
  .argument("<name>", "Prompt name")
  .argument("[version]", "Optional: specific version to rollback to")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (name: string, version: string | undefined, options) => {
    try {
      await rollback(name, version, options);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });
