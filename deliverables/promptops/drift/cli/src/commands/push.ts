/**
 * Drift CLI - push command
 *
 * Push a new prompt version from a file.
 * Auto-increments version number.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pushPrompt } from "../api.js";
import { isConfigured } from "../config.js";

export interface PushOptions {
  file: string;
  message?: string;
}

export async function push(name: string, options: PushOptions): Promise<void> {
  // Check configuration
  if (!isConfigured()) {
    console.error("\nNot configured. Run 'drift init' first.");
    process.exit(1);
  }

  // Validate file option
  if (!options.file) {
    console.error("\nMissing required option: --file <path>");
    console.error("Example: drift push system-prompt --file ./prompt.txt");
    process.exit(1);
  }

  // Resolve and read file
  const filePath = resolve(options.file);

  if (!existsSync(filePath)) {
    console.error(`\nFile not found: ${filePath}`);
    process.exit(1);
  }

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`\nFailed to read file: ${message}`);
    process.exit(1);
  }

  if (!content.trim()) {
    console.error("\nFile is empty. Nothing to push.");
    process.exit(1);
  }

  // Push to API
  try {
    const result = await pushPrompt(name, content, options.message);
    console.log(`Pushed ${result.name} v${result.version}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`\nFailed to push prompt: ${message}`);
    process.exit(1);
  }
}
