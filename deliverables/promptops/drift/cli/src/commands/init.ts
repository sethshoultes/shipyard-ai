/**
 * Drift CLI - init command
 *
 * Create a new project with zero friction.
 * No email, no OAuth, no signup forms.
 */

import { createProject } from "../api.js";
import { saveConfig, isConfigured, loadConfig } from "../config.js";

export async function init(projectName?: string): Promise<void> {
  // Check if already configured
  if (isConfigured()) {
    const config = loadConfig();
    console.log(`\nAlready configured for project: ${config.project_name || "unknown"}`);
    console.log("To use a different project, delete ~/.drift/config.json first.");
    return;
  }

  console.log("\nInitializing Drift project...");

  try {
    const result = await createProject(projectName);

    // Save the API key
    saveConfig({
      api_key: result.api_key,
      project_name: result.name,
    });

    console.log(`\nProject initialized: ${result.name}`);
    console.log(`\nAPI Key: ${result.api_key}`);
    console.log("\n\x1b[33m⚠️  Save this key! It won't be shown again.\x1b[0m");
    console.log("\nNext step: Push your first prompt:");
    console.log(`  drift push system-prompt --file ./prompt.txt`);
    console.log("\nOr set DRIFT_KEY environment variable to use in CI:");
    console.log(`  export DRIFT_KEY=${result.api_key}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`\nFailed to initialize project: ${message}`);
    process.exit(1);
  }
}
