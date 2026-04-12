/**
 * Wardrobe Email Capture Worker
 *
 * Cloudflare Worker that receives email subscriptions and stores
 * them in KV storage. Includes rate limiting and validation.
 *
 * POST /subscribe - accepts JSON { email, source, timestamp }
 * Returns 200 on success, 400/429/500 on error.
 */

interface Env {
  EMAILS: KVNamespace;
  RATE_LIMITS: KVNamespace;
  CORS_ORIGIN: string;
}

interface SubscribePayload {
  email: string;
  source: string;
  timestamp: string;
}

interface EmailEntry {
  email: string;
  source: string;
  timestamp: string;
  subscribedAt: string;
  ip: string;
}

const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

/**
 * Validate email format server-side
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  // RFC 5322 compliant email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Sanitize email input
 */
function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 320);
}

/**
 * Generate CORS headers for allowed origins
 */
function corsHeaders(corsOrigin: string, requestOrigin?: string): Record<string, string> {
  const allowed = [
    corsOrigin,
    corsOrigin.replace("://", "://www."),
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
  ];
  const matchedOrigin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : corsOrigin;
  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Check and update rate limit for an IP
 * Returns true if request should be allowed, false if rate limited
 */
async function checkRateLimit(ip: string, env: Env): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Get existing rate limit data
  const data = await env.RATE_LIMITS.get(key);
  let requests: number[] = [];

  if (data) {
    try {
      requests = JSON.parse(data);
      // Filter to only requests within the current window
      requests = requests.filter((timestamp: number) => timestamp > windowStart);
    } catch {
      requests = [];
    }
  }

  // Check if over limit
  if (requests.length >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  // Add current request timestamp
  requests.push(now);

  // Store updated rate limit data with TTL
  await env.RATE_LIMITS.put(key, JSON.stringify(requests), {
    expirationTtl: RATE_LIMIT_WINDOW + 10,
  });

  return { allowed: true, remaining: RATE_LIMIT_MAX - requests.length };
}

/**
 * Generate a unique key for email storage
 */
function generateEmailKey(email: string): string {
  // Use a hash-like approach for consistent key generation
  const normalizedEmail = email.toLowerCase().trim();
  return `email:${normalizedEmail}`;
}

/**
 * Store email in KV
 */
async function storeEmail(entry: EmailEntry, env: Env): Promise<{ success: boolean; duplicate: boolean }> {
  const key = generateEmailKey(entry.email);

  // Check if email already exists
  const existing = await env.EMAILS.get(key);
  if (existing) {
    return { success: true, duplicate: true };
  }

  // Store the email entry
  await env.EMAILS.put(key, JSON.stringify(entry));

  // Also maintain a list of all emails for easy retrieval
  const listKey = "email_list";
  const listData = await env.EMAILS.get(listKey);
  let emailList: string[] = [];

  if (listData) {
    try {
      emailList = JSON.parse(listData);
    } catch {
      emailList = [];
    }
  }

  emailList.push(entry.email);
  await env.EMAILS.put(listKey, JSON.stringify(emailList));

  return { success: true, duplicate: false };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const requestOrigin = request.headers.get("Origin") || "";
    const headers = corsHeaders(env.CORS_ORIGIN || "https://wardrobe.emdash.dev", requestOrigin);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Only handle /subscribe endpoint
    if (url.pathname !== "/subscribe") {
      return new Response(
        JSON.stringify({ success: false, message: "Not found" }),
        {
          status: 404,
          headers: { ...headers, "Content-Type": "application/json" },
        }
      );
    }

    // Only allow POST method
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, message: "Method not allowed" }),
        {
          status: 405,
          headers: { ...headers, "Content-Type": "application/json" },
        }
      );
    }

    const clientIP = getClientIP(request);

    // Check rate limit
    const rateCheck = await checkRateLimit(clientIP, env);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Retry-After": String(RATE_LIMIT_WINDOW),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    try {
      const body: SubscribePayload = await request.json();

      // Validate required fields
      if (!body.email) {
        return new Response(
          JSON.stringify({ success: false, message: "Email is required." }),
          {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      }

      // Sanitize and validate email
      const email = sanitizeEmail(body.email);
      if (!isValidEmail(email)) {
        return new Response(
          JSON.stringify({ success: false, message: "Please enter a valid email address." }),
          {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      }

      // Create email entry
      const entry: EmailEntry = {
        email: email,
        source: body.source || "wardrobe-showcase",
        timestamp: body.timestamp || new Date().toISOString(),
        subscribedAt: new Date().toISOString(),
        ip: clientIP,
      };

      // Store email
      const result = await storeEmail(entry, env);

      if (result.duplicate) {
        // Return success even for duplicates to avoid revealing existing emails
        return new Response(
          JSON.stringify({
            success: true,
            message: "You're already on the list! We'll notify you when Wardrobe launches.",
          }),
          {
            status: 200,
            headers: {
              ...headers,
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
              "X-RateLimit-Remaining": String(rateCheck.remaining),
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Thanks for subscribing! We'll notify you when Wardrobe launches.",
        }),
        {
          status: 200,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": String(rateCheck.remaining),
          },
        }
      );
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request format." }),
        {
          status: 400,
          headers: { ...headers, "Content-Type": "application/json" },
        }
      );
    }
  },
};
