/**
 * Shipyard AI — Contact Form Worker
 *
 * Cloudflare Worker that receives form submissions and sends
 * them via Resend. Deployed separately from the static site.
 *
 * POST /submit — accepts JSON { name, email, projectType, budget, description }
 * Returns 200 on success, 400/500 on error.
 */

interface Env {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  CORS_ORIGIN: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string; // e.g. "sethshoultes/shipyard-ai"
}

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 320;
const MAX_DESCRIPTION_LENGTH = 50_000;
const MAX_FIELD_LENGTH = 500;

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:\s*text\/html/i,
];

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

function sanitizeField(str: string, maxLength: number): string {
  return stripHtml(str).trim().slice(0, maxLength);
}

function containsXss(str: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(str));
}

interface ContactPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
  website?: string; // honeypot
}

function corsHeaders(origin: string, requestOrigin?: string): Record<string, string> {
  const allowed = [origin, origin.replace("://", "://www."), "https://shipyard-ai.pages.dev"];
  const matchedOrigin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : origin;
  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

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

    try {
      const body: ContactPayload = await request.json();

      // Honeypot check
      if (body.website) {
        return new Response(
          JSON.stringify({ success: true, message: "Thanks! We'll be in touch within 24 hours." }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Sanitize all inputs
      body.name = sanitizeField(body.name || "", MAX_NAME_LENGTH);
      body.email = sanitizeField(body.email || "", MAX_EMAIL_LENGTH);
      body.projectType = sanitizeField(body.projectType || "", MAX_FIELD_LENGTH);
      body.budget = sanitizeField(body.budget || "", MAX_FIELD_LENGTH);
      body.description = stripHtml(body.description || "").trim().slice(0, MAX_DESCRIPTION_LENGTH);

      // Validate required fields
      if (!body.name || !body.email || !body.description) {
        return new Response(
          JSON.stringify({ success: false, message: "Please fill in all required fields." }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return new Response(
          JSON.stringify({ success: false, message: "Please enter a valid email address." }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Reject XSS patterns
      const allFields = [body.name, body.email, body.projectType, body.budget, body.description];
      if (allFields.some(containsXss)) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid input detected." }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Send via Resend
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
          JSON.stringify({ success: false, message: "Failed to send. Please email us directly at hello@shipyard.company." }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Create GitHub issue for PRD intake tracking
      if (env.GITHUB_TOKEN && env.GITHUB_REPO) {
        try {
          await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.GITHUB_TOKEN}`,
              "Content-Type": "application/json",
              "User-Agent": "Shipyard-AI-Contact-Worker",
            },
            body: JSON.stringify({
              title: `PRD Intake: ${body.projectType} from ${body.name}`,
              body: [
                `## Contact Details`,
                `- **Name:** ${body.name}`,
                `- **Email:** ${body.email}`,
                `- **Project Type:** ${body.projectType}`,
                `- **Budget:** ${body.budget || "Not specified"}`,
                ``,
                `## Project Description / PRD`,
                ``,
                body.description,
              ].join("\n"),
              labels: ["prd-intake", body.projectType.toLowerCase().replace(/\s+/g, "-")],
            }),
          });
        } catch (e) {
          // Don't fail the response if GitHub issue creation fails
          console.error("GitHub issue creation failed:", e);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "Thanks! We'll scope your project and respond within 24 hours." }),
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
