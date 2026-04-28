import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/intake
 *
 * Receives a paid-customer intake submission and persists it.
 * v0 implementation per DHH's flow design at website/intake/intake-flow.md.
 *
 * v0 storage: posts to a webhook (Resend / Slack / email) configured via
 * INTAKE_WEBHOOK_URL env. Failure mode: log to console and return 500;
 * the operator follows up via the customer's email address.
 *
 * NOT in v0: webhook signature, retry queue, customer dashboard, Stripe
 * integration. All deferred until first 5 customers tell us what's needed.
 */

export const runtime = "edge";

interface IntakePayload {
  [key: string]: string | string[] | undefined;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";
}

function summarizeForOperator(data: IntakePayload): string {
  const lines: string[] = [];
  lines.push(`📥 New Shipyard intake — ${new Date().toISOString()}`);
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

export async function POST(req: NextRequest) {
  let data: IntakePayload;
  try {
    data = (await req.json()) as IntakePayload;
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate the load-bearing fields
  if (!data.email || !data.name || !data.tier) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, tier" },
      { status: 400 }
    );
  }
  if (data.ack_deposit !== "yes" || data.ack_terms !== "yes") {
    return NextResponse.json(
      { error: "Both acknowledgements (deposit, terms) are required." },
      { status: 400 }
    );
  }

  const slug = `${slugify(String(data.name))}-${Date.now().toString(36)}`;
  const summary = summarizeForOperator(data);

  // v0: ship the summary to whatever webhook is configured.
  // INTAKE_WEBHOOK_URL might be Slack, Discord, a Resend email-via-webhook, etc.
  // If unset, we log and return success (the operator will check the logs).
  const webhookUrl = process.env.INTAKE_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          received_at: new Date().toISOString(),
          summary,
          raw: data,
        }),
      });
    } catch (err) {
      // Don't fail the customer's submission if the webhook is down;
      // log so the operator can backfill.
      console.error("[intake] webhook failed:", err);
      console.error("[intake] payload:", summary);
    }
  } else {
    // No webhook configured — log to console (Cloudflare Pages tail)
    console.log("[intake] no webhook configured. Payload:");
    console.log(summary);
  }

  return NextResponse.json({ ok: true, slug, received_at: new Date().toISOString() });
}
