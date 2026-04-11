/**
 * Drift API Authentication Middleware
 *
 * Handles API key authentication via Bearer token.
 * Keys are stored as SHA-256 hashes in the database.
 */

import type { D1Database } from "@cloudflare/workers-types";

export interface Project {
  id: string;
  name: string;
  api_key_hash: string;
  created_at: number;
}

export interface AuthenticatedRequest {
  project: Project;
}

/**
 * Generate a new API key with the drift_ prefix
 * Format: drift_ + 32 random alphanumeric characters
 */
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "drift_";
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < 32; i++) {
    key += chars[randomBytes[i] % chars.length];
  }
  return key;
}

/**
 * Hash an API key using SHA-256
 * Returns hex-encoded hash
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Extract and validate API key from Authorization header
 * Returns the authenticated project or null if authentication fails
 */
export async function authenticateRequest(
  request: Request,
  db: D1Database
): Promise<{ project: Project | null; error: string | null }> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return { project: null, error: "Missing Authorization header" };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return { project: null, error: "Invalid Authorization header format. Use: Bearer <api_key>" };
  }

  const apiKey = authHeader.slice(7).trim();

  if (!apiKey) {
    return { project: null, error: "Empty API key" };
  }

  if (!apiKey.startsWith("drift_")) {
    return { project: null, error: "Invalid API key format" };
  }

  // Hash the incoming key for comparison
  const keyHash = await hashApiKey(apiKey);

  // Query for matching project
  const result = await db
    .prepare("SELECT id, name, api_key_hash, created_at FROM projects WHERE api_key_hash = ?")
    .bind(keyHash)
    .first<Project>();

  if (!result) {
    return { project: null, error: "Invalid API key" };
  }

  // Constant-time comparison for the hash
  if (!constantTimeCompare(result.api_key_hash, keyHash)) {
    return { project: null, error: "Invalid API key" };
  }

  return { project: result, error: null };
}

/**
 * Create a 401 Unauthorized response
 */
export function unauthorizedResponse(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'Bearer realm="Drift API"',
    },
  });
}

/**
 * Generate a unique ID using crypto.randomUUID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
