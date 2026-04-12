/**
 * Drift CLI - rollback command
 *
 * Revert a prompt to a specific version.
 * The rollback. One command. Instant. No thinking.
 */

import { rollbackPrompt, getPrompt } from "../api.js";
import { isConfigured } from "../config.js";

export interface RollbackOptions {
  version: string;
}

/**
 * Rollback a prompt to a specific version
 */
export async function rollback(
  name: string,
  options: RollbackOptions
): Promise<void> {
  // Check configuration
  if (!isConfigured()) {
    console.error("\nNot configured. Run 'drift init' first.");
    process.exit(1);
  }

  // Validate version option
  if (!options.version) {
    console.error("\nMissing required option: --version <number>");
    console.error("Example: drift rollback system-prompt --version 2");
    process.exit(1);
  }

  const version = parseInt(options.version, 10);

  if (isNaN(version) || version < 1) {
    console.error("\nInvalid version number. Must be a positive integer.");
    process.exit(1);
  }

  try {
    // Get current state for feedback
    const before = await getPrompt(name);
    const previousVersion = before.active_version;

    if (previousVersion === version) {
      console.log(`\n${name} is already at v${version}.`);
      return;
    }

    // Perform rollback
    const result = await rollbackPrompt(name, version);

    console.log(`\nRolled back ${result.name} from v${previousVersion} to v${result.active_version}.`);
    console.log("Live now.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`\nFailed to rollback: ${message}`);
    process.exit(1);
  }
}
