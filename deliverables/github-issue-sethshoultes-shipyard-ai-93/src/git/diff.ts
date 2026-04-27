import { spawn } from "child_process";

export function getStagedDiff(): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    const child = spawn("git", ["diff", "--staged"], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString("utf-8");
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString("utf-8");
    });

    child.on("close", (code: number | null) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`git diff --staged exited with code ${code}: ${stderr.trim()}`));
      } else {
        resolve(stdout);
      }
    });

    child.on("error", (err: Error) => {
      reject(err);
    });
  });
}
