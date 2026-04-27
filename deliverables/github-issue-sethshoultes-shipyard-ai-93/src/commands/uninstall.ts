import { execSync } from "child_process";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";

const HOOK_MARKER = "# === still hook ===";

export function uninstallHook(): number {
  let hooksDir: string;
  try {
    hooksDir = execSync("git rev-parse --git-path hooks", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return 0;
  }

  const hookPath = join(hooksDir, "prepare-commit-msg");

  if (!existsSync(hookPath)) {
    return 0;
  }

  const content = readFileSync(hookPath, "utf-8");
  if (!content.includes(HOOK_MARKER) && !content.includes("still hook")) {
    return 0;
  }

  unlinkSync(hookPath);
  return 0;
}
