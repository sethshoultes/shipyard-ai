/**
 * KV namespace helpers for managing prompts
 * Key format: prompt:{name}
 * Value format: { version: number, content: string }
 *
 * Usage:
 * - getActivePrompt(): Read-through KV for active prompt (target: <5ms latency)
 * - setActivePrompt(): Sync active version to KV after D1 writes
 *   Call via ctx.waitUntil(setActivePrompt(...)) for background sync
 */

export async function getActivePrompt(
  kv: KVNamespace,
  name: string
): Promise<{ version: number; content: string } | null> {
  const key = `prompt:${name}`;
  const value = await kv.get(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Failed to parse prompt value for key ${key}:`, error);
    return null;
  }
}

export async function setActivePrompt(
  kv: KVNamespace,
  name: string,
  version: number,
  content: string
): Promise<void> {
  const key = `prompt:${name}`;
  const value = JSON.stringify({ version, content });

  try {
    await kv.put(key, value);
  } catch (error) {
    console.error(`Failed to set prompt for key ${key}:`, error);
    throw error;
  }
}
