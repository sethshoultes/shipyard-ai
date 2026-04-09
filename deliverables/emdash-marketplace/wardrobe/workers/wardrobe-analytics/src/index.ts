/**
 * Wardrobe Analytics Cloudflare Worker
 *
 * Receives and aggregates anonymous install telemetry for Wardrobe themes.
 * No PII is collected — only theme, OS, country, and timestamp.
 *
 * Endpoints:
 * - POST /api/install: Record install event
 * - GET /api/counts: Return aggregated counts per theme
 * - GET /api/stats: Return detailed statistics (protected)
 */

interface Env {
  ANALYTICS_DB: D1Database;
  ENVIRONMENT?: string;
}

interface InstallPayload {
  theme: string;
  os?: string;
  cliVersion?: string;
}

interface InstallRecord {
  id: number;
  theme: string;
  os: string | null;
  country: string | null;
  timestamp: string;
  cli_version: string | null;
}

interface CountsResponse {
  [theme: string]: number;
}

interface StatsResponse {
  total: number;
  themes: {
    [theme: string]: {
      count: number;
      percentage: number;
      byOS: { [os: string]: number };
      byCountry: { [country: string]: number };
    };
  };
  timestamp: string;
}

/**
 * Extract country from CF-IPCountry header
 */
function getCountryFromRequest(request: Request): string | null {
  const cfCountry = request.headers.get("CF-IPCountry");
  return cfCountry && cfCountry !== "T1" ? cfCountry : null;
}

/**
 * Add CORS headers for cross-origin requests from showcase domain
 */
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * POST /api/install
 * Record an install event
 *
 * Request body:
 * {
 *   "theme": "ember",
 *   "os": "darwin",
 *   "cliVersion": "1.0.0"
 * }
 */
async function handleInstall(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "POST") {
    return addCorsHeaders(new Response("Method not allowed", { status: 405 }));
  }

  try {
    const payload: InstallPayload = await request.json();

    // Validate required fields
    if (!payload.theme) {
      return addCorsHeaders(new Response(
        JSON.stringify({ error: "theme is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      ));
    }

    // Extract country from CF-IPCountry header
    const country = getCountryFromRequest(request);

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Insert into D1 database
    const stmt = env.ANALYTICS_DB.prepare(
      `INSERT INTO installs (theme, os, country, timestamp, cli_version)
       VALUES (?, ?, ?, ?, ?)`
    );

    const result = await stmt
      .bind(
        payload.theme,
        payload.os || null,
        country,
        timestamp,
        payload.cliVersion || null
      )
      .run();

    // Return success response
    return addCorsHeaders(
      new Response(
        JSON.stringify({
          success: true,
          id: result.meta.last_row_id,
          timestamp,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  } catch (error) {
    console.error("Install handler error:", error);
    return addCorsHeaders(
      new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
}

/**
 * GET /api/counts
 * Return aggregated install counts per theme
 * Cached for 5 minutes
 *
 * Response:
 * {
 *   "ember": 1234,
 *   "forge": 987,
 *   "slate": 456,
 *   ...
 * }
 */
async function handleCounts(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return addCorsHeaders(new Response("Method not allowed", { status: 405 }));
  }

  try {
    // Query aggregated counts per theme
    const stmt = env.ANALYTICS_DB.prepare(
      `SELECT theme, COUNT(*) as count
       FROM installs
       GROUP BY theme
       ORDER BY count DESC`
    );

    const results = await stmt.all();
    const counts: CountsResponse = {};

    if (results.results) {
      for (const row of results.results) {
        const typedRow = row as { theme: string; count: number };
        counts[typedRow.theme] = typedRow.count;
      }
    }

    // Return with cache headers (5 minutes)
    return addCorsHeaders(
      new Response(JSON.stringify(counts), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
    );
  } catch (error) {
    console.error("Counts handler error:", error);
    return addCorsHeaders(
      new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
}

/**
 * GET /api/stats
 * Return detailed statistics (protected endpoint)
 * In production, this should be protected by authentication token
 *
 * Response includes:
 * - Total install count
 * - Per-theme breakdowns
 * - OS distribution
 * - Geographic distribution
 */
async function handleStats(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method !== "GET") {
    return addCorsHeaders(new Response("Method not allowed", { status: 405 }));
  }

  try {
    // TODO: Add authentication check here
    // For now, this is unprotected. In production, verify API key.
    // const apiKey = request.headers.get("Authorization");
    // if (!apiKey || !isValidApiKey(apiKey)) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    // Get total count
    const totalStmt = env.ANALYTICS_DB.prepare(
      `SELECT COUNT(*) as total FROM installs`
    );
    const totalResult = await totalStmt.first();
    const total = (totalResult as { total: number }).total || 0;

    // Get per-theme stats
    const themesStmt = env.ANALYTICS_DB.prepare(
      `SELECT
         theme,
         COUNT(*) as count,
         os,
         country
       FROM installs
       GROUP BY theme, os, country
       ORDER BY theme, count DESC`
    );
    const themesResult = await themesStmt.all();

    // Aggregate by theme
    const themes: StatsResponse["themes"] = {};

    if (themesResult.results) {
      for (const row of themesResult.results) {
        const typedRow = row as {
          theme: string;
          count: number;
          os: string | null;
          country: string | null;
        };
        const { theme, count, os, country } = typedRow;

        if (!themes[theme]) {
          themes[theme] = {
            count: 0,
            percentage: 0,
            byOS: {},
            byCountry: {},
          };
        }

        themes[theme].count += count;

        if (os) {
          themes[theme].byOS[os] = (themes[theme].byOS[os] || 0) + count;
        }

        if (country) {
          themes[theme].byCountry[country] =
            (themes[theme].byCountry[country] || 0) + count;
        }
      }
    }

    // Calculate percentages
    for (const theme in themes) {
      themes[theme].percentage = (themes[theme].count / total) * 100;
    }

    const stats: StatsResponse = {
      total,
      themes,
      timestamp: new Date().toISOString(),
    };

    return addCorsHeaders(
      new Response(JSON.stringify(stats), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
      })
    );
  } catch (error) {
    console.error("Stats handler error:", error);
    return addCorsHeaders(
      new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
}

/**
 * Main request router
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return addCorsHeaders(
        new Response(null, { status: 204 })
      );
    }

    // Route to handlers
    if (url.pathname === "/api/install") {
      return handleInstall(request, env);
    } else if (url.pathname === "/api/counts") {
      return handleCounts(request, env);
    } else if (url.pathname === "/api/stats") {
      return handleStats(request, env);
    } else {
      return addCorsHeaders(
        new Response(
          JSON.stringify({ error: "Not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }
  },
};
