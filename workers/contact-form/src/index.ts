/**
 * Shipyard AI — Contact Form Worker (Secure PRD Intake)
 *
 * Cloudflare Worker that receives form submissions, sanitizes input,
 * creates GitHub issues for PRD tracking, and sends email via Resend.
 *
 * POST /submit — accepts JSON { name, email, projectType, budget, description }
 * Returns 200 on success, 400/429/500 on error.
 *
 * Security: HTML stripping, XSS pattern rejection, field length limits,
 * strict email validation, IP-based rate limiting (5/hr via CF headers).
 */

interface Env {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  CORS_ORIGIN: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string; // e.g. "sethshoultes/shipyard-ai"
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_DESCRIPTION_LENGTH = 50_000;
const MAX_FIELD_LENGTH = 500;

/** Submissions allowed per IP per window */
const RATE_LIMIT_MAX = 5;
/** Window size in seconds (1 hour) */
const RATE_LIMIT_WINDOW = 3600;

/** In-memory rate limit store. Resets on cold start — acceptable for
 *  edge workers with low traffic. For higher volume, swap for KV/D1. */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:\s*text\/html/i,
  /vbscript:/i,
  /expression\s*\(/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
  /<form[\s>]/i,
  /url\s*\(\s*['"]?\s*javascript/i,
];

/** Strict email regex — RFC 5321 local@domain.tld */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Strip ALL HTML tags from a string */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/** Escape special HTML characters for safe embedding */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Sanitize a short field: strip HTML, trim, enforce max length */
function sanitizeField(str: string, maxLength: number): string {
  return stripHtml(str).trim().slice(0, maxLength);
}

/**
 * Sanitize markdown / plain-text description.
 * Strips any raw HTML tags but preserves standard markdown syntax.
 */
function sanitizeMarkdown(str: string): string {
  // Strip HTML tags (even nested/malformed)
  let cleaned = str.replace(/<[^>]*>/g, "");
  // Collapse null bytes
  cleaned = cleaned.replace(/\0/g, "");
  return cleaned.trim().slice(0, MAX_DESCRIPTION_LENGTH);
}

/** Check if any string contains XSS patterns */
function containsXss(str: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(str));
}

/** Returns the client IP from Cloudflare headers */
function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * IP-based rate limiter. Returns true if the request is allowed,
 * false if the IP has exceeded the limit.
 */
function checkRateLimit(ip: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ContactPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
  website?: string; // honeypot
}

/* ------------------------------------------------------------------ */
/*  CORS                                                               */
/* ------------------------------------------------------------------ */

function corsHeaders(origin: string, requestOrigin?: string): Record<string, string> {
  const allowed = [origin, origin.replace("://", "://www."), "https://shipyard-ai.pages.dev"];
  const matchedOrigin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : origin;
  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/* ------------------------------------------------------------------ */
/*  Worker Entry                                                       */
/* ------------------------------------------------------------------ */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestOrigin = request.headers.get("Origin") || "";
    const headers = corsHeaders(env.CORS_ORIGIN, requestOrigin);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    /* --- Rate limit ------------------------------------------------ */
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Too many submissions. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            ...headers,
            "Content-Type": "application/json",
            "Retry-After": String(RATE_LIMIT_WINDOW),
          },
        },
      );
    }

    try {
      const body: ContactPayload = await request.json();

      /* --- Honeypot check ------------------------------------------ */
      if (body.website) {
        return new Response(
          JSON.stringify({ success: true, message: "Thanks! We'll be in touch within 24 hours." }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      /* --- Sanitize all inputs ------------------------------------- */
      body.name = sanitizeField(body.name || "", MAX_NAME_LENGTH);
      body.email = sanitizeField(body.email || "", MAX_EMAIL_LENGTH);
      body.projectType = sanitizeField(body.projectType || "", MAX_FIELD_LENGTH);
      body.budget = sanitizeField(body.budget || "", MAX_FIELD_LENGTH);
      body.description = sanitizeMarkdown(body.description || "");

      /* --- Validate required fields -------------------------------- */
      if (!body.name || !body.email || !body.description) {
        return new Response(
          JSON.stringify({ success: false, message: "Please fill in all required fields." }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      /* --- Strict email validation --------------------------------- */
      if (!EMAIL_REGEX.test(body.email)) {
        return new Response(
          JSON.stringify({ success: false, message: "Please enter a valid email address." }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      /* --- XSS pattern rejection ----------------------------------- */
      const allFields = [body.name, body.email, body.projectType, body.budget, body.description];
      if (allFields.some(containsXss)) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid input detected." }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      /* --- Send email via Resend ----------------------------------- */
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Shipyard AI <${env.FROM_EMAIL}>`,
          to: [env.TO_EMAIL],
          reply_to: body.email,
          subject: `New PRD: ${body.projectType} from ${body.name}`,
          html: `
            <h2>New PRD Submission</h2>
            <table style="border-collapse:collapse;width:100%;max-width:600px;">
              <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.name)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></td></tr>
              <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Project Type</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.projectType)}</td></tr>
              <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Budget</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(body.budget || "Not specified")}</td></tr>
            </table>
            <h3 style="margin-top:24px;">Project Description / PRD</h3>
            <div style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(body.description)}</div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const err = await resendResponse.text();
        console.error("Resend error:", err);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to send. Please email us directly at hello@shipyard.company.",
          }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } },
        );
      }

      /* --- Create GitHub issue ------------------------------------- */
      if (env.GITHUB_TOKEN && env.GITHUB_REPO) {
        try {
          const issueBody = [
            `## Contact Details`,
            ``,
            `| Field | Value |`,
            `|-------|-------|`,
            `| **Name** | ${body.name} |`,
            `| **Email** | ${body.email} |`,
            `| **Project Type** | ${body.projectType} |`,
            `| **Budget** | ${body.budget || "Not specified"} |`,
            ``,
            `## Project Description / PRD`,
            ``,
            body.description,
            ``,
            `---`,
            `*Submitted via Shipyard AI contact form on ${new Date().toISOString().split("T")[0]}*`,
          ].join("\n");

          const ghResponse = await fetch(
            `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                "Content-Type": "application/json",
                "User-Agent": "Shipyard-AI-Contact-Worker",
              },
              body: JSON.stringify({
                title: `PRD: ${body.projectType} from ${body.name}`,
                body: issueBody,
                labels: ["prd-intake"],
              }),
            },
          );

          if (!ghResponse.ok) {
            const ghErr = await ghResponse.text();
            console.error("GitHub issue creation failed:", ghResponse.status, ghErr);
          }
        } catch (e) {
          // Don't fail the response if GitHub issue creation fails
          console.error("GitHub issue creation error:", e);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Thanks! We'll scope your project and respond within 24 hours.",
        }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } },
      );
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request." }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } },
      );
    }
  },
};
