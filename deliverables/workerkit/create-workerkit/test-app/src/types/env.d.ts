declare global {
  interface CloudflareEnv {
    DB: D1Database;
    AI: Ai;
  }
}

export {};
