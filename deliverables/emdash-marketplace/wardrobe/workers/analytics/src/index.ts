/**
 * Wardrobe Analytics Worker
 *
 * Cloudflare Worker for tracking anonymous theme installation metrics.
 * NO PII is collected — only theme name, OS, country, timestamp, and CLI version.
 *
 * POST /track — accepts JSON { theme, os, timestamp, cliVersion }
 * GET /stats — returns aggregated metrics (protected by X-API-Key header)
 */

interface Env {
  ANALYTICS: KVNamespace;
  API_KEY: string;
  CORS_ORIGIN?: string;
}

interface InstallEvent {
  theme: string;
  os: string;
  timestamp: number;
  cliVersion: string;
}

interface StoredEvent extends InstallEvent {
  country: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Rate limiting constants
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Validation constants
const MAX_THEME_LENGTH = 100;
const MAX_OS_LENGTH = 50;
const MAX_CLI_VERSION_LENGTH = 20;
const VALID_OS_PATTERNS = /^(darwin|linux|win32|windows|macos|freebsd|openbsd)$/i;
const VALID_CLI_VERSION_PATTERN = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
const VALID_THEME_PATTERN = /^[\w\-@/]+$/;

// KV key prefixes
const PREFIX_INSTALL = "install:";
const PREFIX_RATE_LIMIT = "ratelimit:";
const PREFIX_STATS = "stats:";

function corsHeaders(origin?: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

function jsonResponse(
  data: Record<string, unknown>,
  status: number,
  headers: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

function generateUUID(): string {
  return crypto.randomUUID();
}

function sanitize(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

function validateInstallPayload(body: unknown): { valid: true; data: InstallEvent } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid payload format" };
  }

  const payload = body as Record<string, unknown>;

  // Validate theme
  if (typeof payload.theme !== "string" || !payload.theme.trim()) {
    return { valid: false, error: "Missing or invalid theme" };
  }
  const theme = sanitize(payload.theme, MAX_THEME_LENGTH);
  if (!VALID_THEME_PATTERN.test(theme)) {
    return { valid: false, error: "Invalid theme format" };
  }

  // Validate OS
  if (typeof payload.os !== "string" || !payload.os.trim()) {
    return { valid: false, error: "Missing or invalid os" };
  }
  const os = sanitize(payload.os, MAX_OS_LENGTH);
  if (!VALID_OS_PATTERNS.test(os)) {
    return { valid: false, error: "Invalid OS value" };
  }

  // Validate timestamp
  if (typeof payload.timestamp !== "number" || !Number.isFinite(payload.timestamp)) {
    return { valid: false, error: "Missing or invalid timestamp" };
  }
  const timestamp = payload.timestamp;
  const now = Date.now();
  // Allow timestamps within 24 hours of now (past or future drift tolerance)
  if (timestamp < now - 86_400_000 || timestamp > now + 86_400_000) {
    return { valid: false, error: "Timestamp out of valid range" };
  }

  // Validate CLI version
  if (typeof payload.cliVersion !== "string" || !payload.cliVersion.trim()) {
    return { valid: false, error: "Missing or invalid cliVersion" };
  }
  const cliVersion = sanitize(payload.cliVersion, MAX_CLI_VERSION_LENGTH);
  if (!VALID_CLI_VERSION_PATTERN.test(cliVersion)) {
    return { valid: false, error: "Invalid CLI version format" };
  }

  return {
    valid: true,
    data: { theme, os, timestamp, cliVersion },
  };
}

async function checkRateLimit(
  kv: KVNamespace,
  clientIp: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `${PREFIX_RATE_LIMIT}${clientIp}`;
  const now = Date.now();

  const stored = await kv.get<RateLimitEntry>(key, "json");

  if (!stored || stored.resetAt < now) {
    // New window
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    await kv.put(key, JSON.stringify(entry), {
      expirationTtl: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) + 60,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (stored.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment count
  const updated: RateLimitEntry = {
    count: stored.count + 1,
    resetAt: stored.resetAt,
  };
  await kv.put(key, JSON.stringify(updated), {
    expirationTtl: Math.ceil((stored.resetAt - now) / 1000) + 60,
  });

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - updated.count };
}

async function handleTrack(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  // Get client IP for rate limiting
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

  // Check rate limit
  const rateLimit = await checkRateLimit(env.ANALYTICS, clientIp);
  if (!rateLimit.allowed) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded. Try again later." },
      429,
      {
        ...headers,
        "Retry-After": "60",
        "X-RateLimit-Remaining": "0",
      }
    );
  }

  // Parse and validate payload
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { success: false, error: "Invalid JSON" },
      400,
      headers
    );
  }

  const validation = validateInstallPayload(body);
  if (!validation.valid) {
    return jsonResponse(
      { success: false, error: validation.error },
      400,
      headers
    );
  }

  // Extract country from CF header (anonymous geo)
  const country = request.headers.get("CF-IPCountry") || "XX";

  // Build stored event (no PII)
  const event: StoredEvent = {
    theme: validation.data.theme,
    os: validation.data.os,
    timestamp: validation.data.timestamp,
    cliVersion: validation.data.cliVersion,
    country,
  };

  // Store in KV
  const uuid = generateUUID();
  const key = `${PREFIX_INSTALL}${event.timestamp}:${uuid}`;

  await env.ANALYTICS.put(key, JSON.stringify(event), {
    // Keep events for 90 days
    expirationTtl: 90 * 24 * 60 * 60,
  });

  // Update aggregated stats (fire-and-forget, we don't wait)
  updateStats(env.ANALYTICS, event).catch((err) => {
    console.error("Failed to update stats:", err);
  });

  return jsonResponse(
    { success: true },
    200,
    { ...headers, "X-RateLimit-Remaining": String(rateLimit.remaining) }
  );
}

async function updateStats(kv: KVNamespace, event: StoredEvent): Promise<void> {
  // Update total installs
  const totalKey = `${PREFIX_STATS}total`;
  const currentTotal = await kv.get<number>(totalKey, "json") || 0;
  await kv.put(totalKey, JSON.stringify(currentTotal + 1));

  // Update per-theme count
  const themeKey = `${PREFIX_STATS}theme:${event.theme}`;
  const currentTheme = await kv.get<number>(themeKey, "json") || 0;
  await kv.put(themeKey, JSON.stringify(currentTheme + 1));

  // Update per-country count
  const countryKey = `${PREFIX_STATS}country:${event.country}`;
  const currentCountry = await kv.get<number>(countryKey, "json") || 0;
  await kv.put(countryKey, JSON.stringify(currentCountry + 1));

  // Update per-OS count
  const osKey = `${PREFIX_STATS}os:${event.os}`;
  const currentOS = await kv.get<number>(osKey, "json") || 0;
  await kv.put(osKey, JSON.stringify(currentOS + 1));

  // Track themes list for enumeration
  const themesListKey = `${PREFIX_STATS}themes_list`;
  const themesList = await kv.get<string[]>(themesListKey, "json") || [];
  if (!themesList.includes(event.theme)) {
    themesList.push(event.theme);
    await kv.put(themesListKey, JSON.stringify(themesList));
  }

  // Track countries list for enumeration
  const countriesListKey = `${PREFIX_STATS}countries_list`;
  const countriesList = await kv.get<string[]>(countriesListKey, "json") || [];
  if (!countriesList.includes(event.country)) {
    countriesList.push(event.country);
    await kv.put(countriesListKey, JSON.stringify(countriesList));
  }

  // Track OS list for enumeration
  const osListKey = `${PREFIX_STATS}os_list`;
  const osList = await kv.get<string[]>(osListKey, "json") || [];
  if (!osList.includes(event.os)) {
    osList.push(event.os);
    await kv.put(osListKey, JSON.stringify(osList));
  }
}

async function handleStats(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  // Verify API key
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey || apiKey !== env.API_KEY) {
    return jsonResponse(
      { success: false, error: "Unauthorized" },
      401,
      headers
    );
  }

  // Get total installs
  const total = await env.ANALYTICS.get<number>(`${PREFIX_STATS}total`, "json") || 0;

  // Get per-theme counts
  const themesList = await env.ANALYTICS.get<string[]>(`${PREFIX_STATS}themes_list`, "json") || [];
  const themes: Record<string, number> = {};
  for (const theme of themesList) {
    const count = await env.ANALYTICS.get<number>(`${PREFIX_STATS}theme:${theme}`, "json") || 0;
    themes[theme] = count;
  }

  // Get per-country counts
  const countriesList = await env.ANALYTICS.get<string[]>(`${PREFIX_STATS}countries_list`, "json") || [];
  const countries: Record<string, number> = {};
  for (const country of countriesList) {
    const count = await env.ANALYTICS.get<number>(`${PREFIX_STATS}country:${country}`, "json") || 0;
    countries[country] = count;
  }

  // Get per-OS counts
  const osList = await env.ANALYTICS.get<string[]>(`${PREFIX_STATS}os_list`, "json") || [];
  const operatingSystems: Record<string, number> = {};
  for (const os of osList) {
    const count = await env.ANALYTICS.get<number>(`${PREFIX_STATS}os:${os}`, "json") || 0;
    operatingSystems[os] = count;
  }

  // Sort countries by count (descending) for top countries
  const topCountries = Object.entries(countries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  // Sort themes by count (descending)
  const sortedThemes = Object.entries(themes)
    .sort(([, a], [, b]) => b - a)
    .map(([theme, count]) => ({ theme, count }));

  return jsonResponse(
    {
      success: true,
      data: {
        totalInstalls: total,
        themes: sortedThemes,
        topCountries,
        operatingSystems,
        generatedAt: new Date().toISOString(),
      },
    },
    200,
    headers
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = corsHeaders(env.CORS_ORIGIN);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Route: POST /track
    if (request.method === "POST" && url.pathname === "/track") {
      return handleTrack(request, env, headers);
    }

    // Route: GET /stats
    if (request.method === "GET" && url.pathname === "/stats") {
      return handleStats(request, env, headers);
    }

    // Health check endpoint
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ status: "ok" }, 200, headers);
    }

    // 404 for unknown routes
    return jsonResponse(
      { success: false, error: "Not found" },
      404,
      headers
    );
  },
};
