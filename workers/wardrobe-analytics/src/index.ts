/**
 * Shipyard Wardrobe — Analytics Worker
 *
 * Cloudflare Worker that receives install telemetry for the Wardrobe CLI theme engine.
 * Anonymous analytics only — no PII collection.
 *
 * POST /track — accepts JSON { theme, os, timestamp, cliVersion }
 * Extracts country from CF-IPCountry header for anonymous geo analytics.
 * Returns 200 OK (fire-and-forget for CLI).
 */

interface Env {
  DB: D1Database;
}

interface AnalyticsPayload {
  theme: string;
  os: string;
  timestamp: number;
  cliVersion: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limiting store (per worker instance)
// In production, consider using Durable Objects for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function validatePayload(body: unknown): body is AnalyticsPayload {
  if (!body || typeof body !== "object") return false;

  const payload = body as Record<string, unknown>;

  return (
    typeof payload.theme === "string" &&
    payload.theme.length > 0 &&
    payload.theme.length <= 100 &&
    typeof payload.os === "string" &&
    payload.os.length > 0 &&
    payload.os.length <= 100 &&
    typeof payload.timestamp === "number" &&
    payload.timestamp > 0 &&
    typeof payload.cliVersion === "string" &&
    payload.cliVersion.length > 0 &&
    payload.cliVersion.length <= 50
  );
}

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength).replace(/[^a-zA-Z0-9._-]/g, "");
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetTime) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

function sanitizeCountry(country: string): string {
  // CF-IPCountry returns ISO 3166-1 alpha-2 country codes or "T1" for Tor
  if (!country || country.length !== 2) {
    return "ZZ"; // Unknown
  }
  return country.toUpperCase();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Extract client IP for rate limiting
      const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

      // Check rate limit
      if (!checkRateLimit(clientIp)) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Parse payload
      const body = await request.json();

      // Validate payload schema
      if (!validatePayload(body)) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Sanitize inputs
      const theme = sanitizeString(body.theme, 100);
      const os = sanitizeString(body.os, 100);
      const cliVersion = sanitizeString(body.cliVersion, 50);
      const timestamp = Math.floor(body.timestamp);

      // Extract country from CF-IPCountry header (anonymous geo)
      const country = sanitizeCountry(request.headers.get("CF-IPCountry") || "ZZ");

      // Insert record to D1
      const result = await env.DB.prepare(
        `INSERT INTO installs (theme, os, country, timestamp, cli_version, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))
         RETURNING id`
      )
        .bind(theme, os, country, timestamp, cliVersion)
        .run();

      if (!result.success) {
        console.error("D1 insert failed:", result);
        // Still return 200 for fire-and-forget semantics
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Return 200 OK (fire-and-forget for CLI)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Analytics request error:", error);
      // Return 200 even on error (fire-and-forget semantics)
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
