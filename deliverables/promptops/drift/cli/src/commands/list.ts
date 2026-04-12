/**
 * Drift CLI - list command
 *
 * Display all prompts with version history.
 * Shows Name | Active Version | Total Versions | Created
 */

import { listPrompts, getPrompt } from "../api.js";
import { isConfigured } from "../config.js";

/**
 * Format Unix timestamp to human-readable date
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split("T")[0];
}

/**
 * Right-pad a string to a specific length
 */
function pad(str: string, length: number): string {
  return str.padEnd(length);
}

/**
 * List all prompts in table format
 */
export async function list(): Promise<void> {
  // Check configuration
  if (!isConfigured()) {
    console.error("\nNot configured. Run 'drift init' first.");
    process.exit(1);
  }

  try {
    const prompts = await listPrompts();

    if (prompts.length === 0) {
      console.log("\nNo prompts found.");
      console.log("\nPush your first prompt:");
      console.log("  drift push system-prompt --file ./prompt.txt");
      return;
    }

    // Get detailed info for each prompt to show total versions
    const detailedPrompts = await Promise.all(
      prompts.map(async (p) => {
        try {
          const detail = await getPrompt(p.name);
          return {
            name: p.name,
            active_version: p.active_version,
            total_versions: detail.versions.length,
            created_at: p.created_at,
          };
        } catch {
          // If we can't get details, use what we have
          return {
            name: p.name,
            active_version: p.active_version,
            total_versions: p.active_version,
            created_at: p.created_at,
          };
        }
      })
    );

    // Calculate column widths
    const nameWidth = Math.max(
      4,
      ...detailedPrompts.map((p) => p.name.length)
    );

    // Print header
    console.log("");
    console.log(
      `${pad("NAME", nameWidth + 2)}${pad("ACTIVE", 10)}${pad("VERSIONS", 12)}CREATED`
    );
    console.log("-".repeat(nameWidth + 2 + 10 + 12 + 12));

    // Print each prompt
    for (const p of detailedPrompts) {
      console.log(
        `${pad(p.name, nameWidth + 2)}${pad(`v${p.active_version}`, 10)}${pad(
          String(p.total_versions),
          12
        )}${formatDate(p.created_at)}`
      );
    }

    console.log("");
    console.log(`${detailedPrompts.length} prompt(s) found.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`\nFailed to list prompts: ${message}`);
    process.exit(1);
  }
}
