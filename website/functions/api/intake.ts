/**
 * POST /api/intake
 *
 * Cloudflare Pages Function. Receives a paid-customer intake submission
 * and emails it to the operator via Resend. Sits beside the static Next.js
 * export — Next can't host server routes when output: "export" is set.
 *
 * Env vars (set in Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY       — required to send. If unset, the route logs and
 *                          returns success so the form still works in dev.
 *   INTAKE_FROM_EMAIL    — sender. Default: "Shipyard <onboarding@resend.dev>"
 *                          (Resend's sandbox; only delivers to the account
 *                          owner's verified email until you verify a domain
 *                          like shipyard.company in Resend).
 *   INTAKE_TO_EMAIL      — recipient. Default: seth@caseproof.com.
 */

interface Env {
  RESEND_API_KEY?: string;
  INTAKE_FROM_EMAIL?: string;
  INTAKE_TO_EMAIL?: string;
}

interface Context {
  request: Request;
  env: Env;
}

interface IntakePayload {
  [key: string]: string | string[] | undefined;
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled"
  );
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function summarizeForOperator(data: IntakePayload): string {
  const lines: string[] = [];
  lines.push(`New Shipyard intake — ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Name:     ${data.name || "(not provided)"}`);
  lines.push(`Email:    ${data.email || "(not provided)"}`);
  lines.push(`Business: ${data.business_name || "(not provided)"}`);
  lines.push(`Tier:     ${data.tier || "(not selected)"}`);
  lines.push(`Beta:     ${data.beta ? "yes" : "no"}`);
  lines.push("");
  lines.push(`Project:  ${data.project_name || "(no name yet)"}`);
  lines.push(`Domain:   ${data.target_domain || "(undecided)"}`);
  lines.push(`Deadline: ${data.deadline || "(none)"}`);
  lines.push("");
  if (data.business_what) lines.push(`What:     ${data.business_what}`);
  if (data.business_audience) lines.push(`Audience: ${data.business_audience}`);
  if (data.business_goal) lines.push(`Goal:     ${data.business_goal}`);
  if (data.notes) {
    lines.push("");
    lines.push(`Notes:`);
    lines.push(String(data.notes));
  }
  lines.push("");
  lines.push(
    `Acks: deposit=${data.ack_deposit ? "yes" : "no"} terms=${data.ack_terms ? "yes" : "no"}`
  );
  return lines.join("\n");
}

function buildEmailHtml(data: IntakePayload, summary: string): string {
  const customerEmail = escapeHtml(String(data.email || ""));
  const customerName = escapeHtml(String(data.name || "(no name)"));
  const tier = escapeHtml(String(data.tier || "(no tier)"));
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h2 style="margin: 0 0 8px;">New Shipyard intake</h2>
      <p style="margin: 0 0 16px; color: #555;">
        <strong>${customerName}</strong> &lt;${customerEmail}&gt; — ${tier}
      </p>
      <pre style="background: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(summary)}</pre>
      <p style="margin: 16px 0 0; color: #888; font-size: 12px;">
        Reply to this email to respond directly to the customer.
      </p>
    </div>
  `;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const onRequestPost = async ({ request, env }: Context) => {
  let data: IntakePayload;
  try {
    data = (await request.json()) as IntakePayload;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!data.email || !data.name || !data.tier) {
    return json({ error: "Missing required fields: name, email, tier" }, 400);
  }
  if (data.ack_deposit !== "yes" || data.ack_terms !== "yes") {
    return json({ error: "Both acknowledgements (deposit, terms) are required." }, 400);
  }

  const slug = `${slugify(String(data.name))}-${Date.now().toString(36)}`;
  const summary = summarizeForOperator(data);

  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.INTAKE_FROM_EMAIL || "Shipyard <onboarding@resend.dev>";
  const toEmail = env.INTAKE_TO_EMAIL || "seth@caseproof.com";

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          reply_to: String(data.email),
          subject: `Shipyard intake — ${data.name} (${data.tier})`,
          text: summary,
          html: buildEmailHtml(data, summary),
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        console.error("[intake] resend non-2xx:", res.status, detail);
        console.error("[intake] payload:", summary);
      }
    } catch (err) {
      console.error("[intake] resend error:", err);
      console.error("[intake] payload:", summary);
    }
  } else {
    console.log("[intake] RESEND_API_KEY not set — logging payload:");
    console.log(summary);
  }

  return json({ ok: true, slug, received_at: new Date().toISOString() });
};

export const onRequest = async ({ request }: Context) => {
  return json({ error: `Method ${request.method} not allowed` }, 405);
};
