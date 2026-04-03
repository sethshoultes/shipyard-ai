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
}

interface ContactPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  description: string;
  website?: string; // honeypot
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(env.CORS_ORIGIN);

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

      // Validate required fields
      if (!body.name?.trim() || !body.email?.trim() || !body.description?.trim()) {
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
