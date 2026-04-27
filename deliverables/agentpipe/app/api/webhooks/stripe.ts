/**
 * Stripe Webhook Handler — Idempotent Event Processing
 *
 * DECISIONS (LOCKED):
 * - Idempotency keys on all Stripe webhook handlers.
 * - Async digest generation + idempotent webhooks ship in v1.
 * - Stripe webhook handler updated to process annual subscription events.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, isAnnualPlan } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import { renderConfirmationEmail } from "@/emails/Confirmation";

/**
 * Simple in-memory idempotency store with TTL.
 * In production, replace with Redis or DynamoDB.
 */
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Clean up expired entries periodically */
setInterval(() => {
  const now = Date.now();
  for (const [eventId, timestamp] of processedEvents.entries()) {
    if (now - timestamp > IDEMPOTENCY_TTL_MS) {
      processedEvents.delete(eventId);
    }
  }
}, 60 * 60 * 1000); // Every hour

/**
 * Check if an event has already been processed.
 */
function isDuplicateEvent(eventId: string): boolean {
  return processedEvents.has(eventId);
}

/**
 * Mark an event as processed.
 */
function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
}

/**
 * POST /api/webhooks/stripe
 *
 * Handles:
 * - invoice.payment_succeeded (annual subscriptions → confirmation email)
 * - customer.subscription.updated (plan changes)
 * - customer.subscription.deleted (cancellations)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Stripe Webhook] Signature verification failed: ${message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check — duplicate events return 200 OK without side effects
  if (isDuplicateEvent(event.id)) {
    console.log(`[Stripe Webhook] Duplicate event ${event.id} ignored.`);
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Stripe Webhook] Error processing event ${event.id}: ${message}`);
    // Return 500 so Stripe retries; do NOT mark as processed
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  // Mark as processed only after successful handling
  markEventProcessed(event.id);

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Handle invoice.payment_succeeded for annual subscriptions.
 * Sends confirmation email on first annual payment.
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

  if (!subscriptionId) {
    console.log("[Stripe Webhook] No subscription ID on invoice. Skipping.");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId || !isAnnualPlan(priceId)) {
    console.log("[Stripe Webhook] Not an annual plan. Skipping confirmation email.");
    return;
  }

  // Only send confirmation on the first successful payment (not renewals)
  const isFirstPayment = subscription.billing_cycle_anchor === subscription.current_period_start;
  if (!isFirstPayment) {
    console.log("[Stripe Webhook] Renewal payment. Skipping confirmation email.");
    return;
  }

  const customerEmail =
    typeof invoice.customer_email === "string"
      ? invoice.customer_email
      : typeof invoice.customer === "string"
      ? (await stripe.customers.retrieve(invoice.customer)).email
      : null;

  if (!customerEmail) {
    console.error("[Stripe Webhook] No customer email found. Cannot send confirmation.");
    return;
  }

  const html = renderConfirmationEmail({
    customerName: invoice.customer_name || "there",
    planTier: subscription.metadata?.plan_tier || "base",
  });

  await sendEmail({
    to: customerEmail,
    subject: "You're all set — your reviews are handled.",
    html,
    text: "You're all set for 12 months of hands-off marketing. — Sous",
  });

  console.log(`[Stripe Webhook] Confirmation email sent to ${customerEmail}`);
}

/**
 * Handle subscription updates (upgrades, downgrades, plan changes).
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const previousAttributes = (subscription as Stripe.Subscription & {
    previous_attributes?: Record<string, unknown>;
  }).previous_attributes;

  const priceChanged = previousAttributes?.items !== undefined;

  if (!priceChanged) {
    console.log("[Stripe Webhook] Subscription updated but price unchanged.");
    return;
  }

  const newPriceId = subscription.items.data[0]?.price.id;
  const isAnnual = newPriceId ? isAnnualPlan(newPriceId) : false;

  console.log(
    `[Stripe Webhook] Plan change detected. New plan: ${isAnnual ? "annual" : "monthly"}`
  );

  // Log for analytics / alerting — actual side effects handled by invoice events
  // or Customer Portal redirects
}

/**
 * Handle subscription deletions (cancellations).
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log(
    `[Stripe Webhook] Subscription ${subscription.id} cancelled at period end: ${subscription.cancel_at_period_end}`
  );

  // Trigger churn analytics or win-back workflow here
}

/**
 * Health check endpoint for webhook monitoring.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    idempotencyStoreSize: processedEvents.size,
    ttlHours: IDEMPOTENCY_TTL_MS / (60 * 60 * 1000),
  });
}
