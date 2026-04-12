// In-memory cache with TTL
const TTL = 5 * 60 * 1000; // 5 minutes = 300000ms
const cache = new Map<string, { content: string; version: number; expiresAt: number }>();

export function getFromCache(key: string): { version: number; content: string } | null {
  const entry = cache.get(key);
  if (!entry) return null;

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return {
    version: entry.version,
    content: entry.content,
  };
}

export function setInCache(key: string, version: number, content: string): void {
  cache.set(key, {
    content,
    version,
    expiresAt: Date.now() + TTL,
  });
}
