import { SYSTEM_PROMPT } from "../voice/templates.js";

export function buildPrompt(diff: string): { system: string; user: string } {
  const fileNames = extractFileNames(diff);
  const summary = fileNames.length > 0 ? `Files: ${fileNames.join(", ")}` : "Staged changes";
  const user = `${summary}\n\n${diff}`;
  return { system: SYSTEM_PROMPT, user };
}

function extractFileNames(diff: string): string[] {
  const names = new Set<string>();
  const regex = /^diff --git a\/(.+?) b\/(.+?)$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(diff)) !== null) {
    names.add(match[2]);
  }
  return Array.from(names);
}
