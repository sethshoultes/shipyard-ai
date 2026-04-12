/**
 * Anchor — Stripe Webhook Handler
 *
 * Main entry point for Cloudflare Worker
 * Handles Stripe webhook events for subscription lifecycle
 *
 * Per decisions.md:
 * - All Stripe API calls must include idempotency keys
 * - Webhook signature verification required
 */

import type { Env, Customer, SubscriptionTier } from "../lib/types";
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  getTierFromPriceId,
  mapSubscriptionStatus,
  generateIdempotencyKey,
  StripeWebhookEvent,
} from "../lib/stripe";
import {
  addCustomer,
  getCustomerByStripeId,
  updateCustomer,
  updateCustomerStatus,
} from "../lib/customers";
import { createCustomer as createCustomerRecord } from "../data/schema";

export default {
  /**
   * Handle incoming HTTP requests
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Health check endpoint
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "anchor-webhook" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get signature header
    const signature = request.headers.get("Stripe-Signature");
    if (!signature) {
      console.error("[Webhook] Missing Stripe-Signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse event
    const event = parseWebhookEvent(rawBody);
    if (!event) {
      console.error("[Webhook] Failed to parse event");
      return new Response("Invalid event payload", { status: 400 });
    }

    console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);

    // Handle event
    try {
      await handleWebhookEvent(event, env);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Webhook] Error processing event: ${message}`);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

/**
 * Handle Stripe webhook events
 */
async function handleWebhookEvent(
  event: StripeWebhookEvent,
  env: Env
): Promise<void> {
  const { type, data } = event;
  const subscription = data.object;

  switch (type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(subscription, env);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(subscription);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(subscription);
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${type}`);
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(
  subscription: StripeWebhookEvent["data"]["object"],
  env: Env
): Promise<void> {
  console.log(`[Webhook] New subscription: ${subscription.id}`);

  // Extract customer data from metadata
  const metadata = subscription.metadata || {};
  const email = metadata.email || "";
  const name = metadata.name || "";
  const siteUrl = metadata.siteUrl || "";

  if (!email || !siteUrl) {
    console.error("[Webhook] Missing required metadata (email, siteUrl)");
    throw new Error("Missing required customer metadata");
  }

  // Determine tier from price
  const priceId = subscription.items?.data?.[0]?.price?.id || "";
  const tier = getTierFromPriceId(priceId);

  // Create customer record
  const customerRecord = createCustomerRecord({
    id: generateIdempotencyKey(),
    email,
    name,
    siteUrl,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    tier,
  });

  // Save customer
  await addCustomer(customerRecord);
  console.log(`[Webhook] Created customer: ${email} (${tier})`);
}

/**
 * Handle subscription update (upgrade/downgrade, status change)
 */
async function handleSubscriptionUpdated(
  subscription: StripeWebhookEvent["data"]["object"]
): Promise<void> {
  console.log(`[Webhook] Subscription updated: ${subscription.id}`);

  // Find customer by Stripe ID
  const customer = await getCustomerByStripeId(subscription.customer);
  if (!customer) {
    console.warn(`[Webhook] Customer not found for: ${subscription.customer}`);
    return;
  }

  // Update subscription status
  const newStatus = mapSubscriptionStatus(subscription.status || "active");
  const priceId = subscription.items?.data?.[0]?.price?.id || "";
  const newTier = getTierFromPriceId(priceId);

  await updateCustomer(customer.id, {
    subscriptionStatus: subscription.status || "active",
    status: newStatus,
    tier: newTier,
  });

  console.log(`[Webhook] Updated customer ${customer.email}: status=${newStatus}, tier=${newTier}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(
  subscription: StripeWebhookEvent["data"]["object"]
): Promise<void> {
  console.log(`[Webhook] Subscription cancelled: ${subscription.id}`);

  // Find customer by Stripe ID
  const customer = await getCustomerByStripeId(subscription.customer);
  if (!customer) {
    console.warn(`[Webhook] Customer not found for: ${subscription.customer}`);
    return;
  }

  // Update status to cancelled
  await updateCustomerStatus(customer.id, "cancelled");
  console.log(`[Webhook] Cancelled customer: ${customer.email}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  invoice: StripeWebhookEvent["data"]["object"]
): Promise<void> {
  console.log(`[Webhook] Payment failed for customer: ${invoice.customer}`);

  // Find customer by Stripe ID
  const customer = await getCustomerByStripeId(invoice.customer);
  if (!customer) {
    console.warn(`[Webhook] Customer not found for: ${invoice.customer}`);
    return;
  }

  // Update status to past_due
  await updateCustomerStatus(customer.id, "past_due");
  console.log(`[Webhook] Marked customer as past_due: ${customer.email}`);
}
