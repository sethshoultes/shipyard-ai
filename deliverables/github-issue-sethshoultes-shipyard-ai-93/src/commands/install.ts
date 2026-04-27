import { execSync } from "child_process";
import { writeFileSync, existsSync, chmodSync } from "fs";
import { join } from "path";

const HOOK_MARKER = "# === still hook ===";

export function installHook(): number {
  let hooksDir: string;
  try {
    hooksDir = execSync("git rev-parse --git-path hooks", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    console.error("Error: not inside a git repository");
    return 1;
  }

  const hookPath = join(hooksDir, "prepare-commit-msg");

  if (existsSync(hookPath)) {
    const existing = readFileSafe(hookPath);
    if (existing.includes("still hook")) {
      console.error("Error: a still-managed prepare-commit-msg hook already exists");
      return 1;
    }
    console.error("Error: prepare-commit-msg hook already exists; remove or back it up first");
    return 1;
  }

  const script = `#!/bin/sh
${HOOK_MARKER}
still hook "\$1"
`;

  writeFileSync(hookPath, script, "utf-8");
  chmodSync(hookPath, 0o755);

  return 0;
}

function readFileSafe(path: string): string {
  try {
    const { readFileSync } = require("fs");
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}
