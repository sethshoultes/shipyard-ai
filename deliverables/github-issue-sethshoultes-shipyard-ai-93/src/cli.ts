#!/usr/bin/env node

import { installHook } from "./commands/install.js";
import { uninstallHook } from "./commands/uninstall.js";
import { getStagedDiff } from "./git/diff.js";
import { hashDiff, getCachedSuggestion, setCachedSuggestion } from "./cache/store.js";
import { buildPrompt } from "./llm/prompt.js";
import { fetchSuggestion } from "./llm/client.js";
import { VERSION } from "./config/constants.js";
import { writeFileSync } from "fs";

async function main(): Promise<number> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: still <install | uninstall | hook <file> | --version | --help>");
    return 1;
  }

  const command = args[0];

  if (command === "--version") {
    console.log(VERSION);
    return 0;
  }

  if (command === "--help") {
    console.log("still - calm commit messages");
    console.log("");
    console.log("Commands:");
    console.log("  install              Register the prepare-commit-msg hook");
    console.log("  uninstall            Remove the prepare-commit-msg hook");
    console.log("  hook <file>          Generate suggestion into commit message file");
    console.log("  --version            Print version");
    console.log("  --help               Print this help");
    return 0;
  }

  if (command === "install") {
    return installHook();
  }

  if (command === "uninstall") {
    return uninstallHook();
  }

  if (command === "hook") {
    const filePath = args[1];
    if (!filePath) {
      console.error("Error: missing commit message file path");
      return 1;
    }

    let diff: string;
    try {
      diff = await getStagedDiff();
    } catch (err) {
      return 0;
    }

    if (!diff.trim()) {
      return 0;
    }

    const diffHash = hashDiff(diff);
    const cached = getCachedSuggestion(diffHash);

    let suggestion: string;
    if (cached) {
      suggestion = cached;
    } else {
      try {
        const { system, user } = buildPrompt(diff);
        suggestion = await fetchSuggestion(system, user);
        setCachedSuggestion(diffHash, suggestion);
      } catch {
        return 1;
      }
    }

    if (suggestion) {
      writeFileSync(filePath, suggestion + "\n", "utf-8");
    }

    return 0;
  }

  console.error(`Error: unknown command "${command}"`);
  return 1;
}

main().then((code) => {
  process.exitCode = code;
}).catch(() => {
  process.exitCode = 1;
});
