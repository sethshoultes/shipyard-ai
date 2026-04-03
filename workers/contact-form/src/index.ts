/**
 * Shipyard AI — Contact Form Worker
 *
 * Cloudflare Worker that receives form submissions, sanitizes input,
 * sends email via Resend, and creates a GitHub issue for PRD intake.
 *
 * POST /submit — accepts JSON { name, email, projectType, budget, description }
 * Returns 200 on success, 400/429/500 on error.
 */

interface Env {
  RESEND_API_KEY: string;
  GITHUB_TOKEN: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  CORS_ORIGIN: string;
}

interface ContactPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
  website?: string; // honeypot
}

// --- Input Sanitization ---

const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:\s*text\/html/i,
  /vbscript:/i,
];

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

function sanitize(str: string, maxLength: number): string {
  let cleaned = stripHtml(str).trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }
  return cleaned;
}

function containsXss(str: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(str));
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

// --- Rate Limiting ---

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// Simple in-memory rate limit (resets on worker restart, good enough for edge)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// --- CORS ---

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// --- GitHub Issue Creation ---

async function createGitHubIssue(
  token: string,
  payload: ContactPayload
): Promise<boolean> {
  const title = `PRD: ${payload.projectType} from ${payload.name}`;
  const body = [
    `## PRD Intake`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Name** | ${payload.name} |`,
    `| **Email** | ${payload.email} |`,
    `| **Project Type** | ${payload.projectType} |`,
    `| **Budget** | ${payload.budget || "Not specified"} |`,
    ``,
    `## Project Description / PRD`,
    ``,
    payload.description,
    ``,
    `---`,
    `*Submitted via [shipyard.company](https://shipyard.company/contact) contact form*`,
  ].join("\n");

  const response = await fetch(
    "https://api.github.com/repos/sethshoultes/shipyard-ai/issues",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "Shipyard-AI-Worker",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title,
        body,
        labels: ["prd-intake"],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("GitHub issue creation failed:", response.status, err);
    return false;
  }
  return true;
}

// --- Main Handler ---

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env.CORS_ORIGIN);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Rate limit
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Too many submissions. Please try again later.",
        }),
        { status: 429, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    try {
      const raw: ContactPayload = await request.json();

      // Honeypot check
      if (raw.website) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Thanks! We'll be in touch within 24 hours.",
          }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Sanitize all fields
      const body: ContactPayload = {
        name: sanitize(raw.name || "", 100),
        email: sanitize(raw.email || "", 254),
        projectType: sanitize(raw.projectType || "", 100),
        budget: sanitize(raw.budget || "", 100),
        description: sanitize(raw.description || "", 50_000),
      };

      // Validate required fields
      if (!body.name || !body.email || !body.description) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Please fill in all required fields.",
          }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Validate email format
      if (!validateEmail(body.email)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Please enter a valid email address.",
          }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // XSS check across all fields
      const allInput = `${body.name} ${body.email} ${body.projectType} ${body.budget} ${body.description}`;
      if (containsXss(allInput)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid input detected.",
          }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Send email via Resend
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
            message:
              "Failed to send. Please email us directly at hello@shipyard.company.",
          }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Create GitHub issue (non-blocking — don't fail the response if this errors)
      if (env.GITHUB_TOKEN) {
        createGitHubIssue(env.GITHUB_TOKEN, body).catch((err) => {
          console.error("GitHub issue creation error:", err);
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Thanks! We'll scope your project and respond within 24 hours.",
        }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    } catch {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request." }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
