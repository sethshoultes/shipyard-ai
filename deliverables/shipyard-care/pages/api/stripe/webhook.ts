/**
 * Stripe Webhook Endpoint
 * Requirement: REQ-003 - Implement Stripe webhook endpoint with signature verification and idempotency
 *
 * POST /api/stripe/webhook
 * Handles Stripe webhook events with:
 * - Signature verification using stripe.webhooks.constructEvent()
 * - Idempotent event processing
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { getStripeClient } from '../../../lib/stripe';
import { query } from '../../../lib/db';

// Disable body parsing for raw body access (required for signature verification)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Processed event record for idempotency
 */
interface ProcessedEvent {
  id: string;
  eventId: string;
  eventType: string;
  processedAt: Date;
}

/**
 * Check if an event has already been processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const result = await query<ProcessedEvent>(
    'SELECT id FROM processed_webhook_events WHERE event_id = $1',
    [eventId]
  );
  return result.rows.length > 0;
}

/**
 * Mark an event as processed
 */
async function markEventProcessed(
  eventId: string,
  eventType: string
): Promise<void> {
  await query(
    `INSERT INTO processed_webhook_events (event_id, event_type, processed_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (event_id) DO NOTHING`,
    [eventId, eventType]
  );
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  const tier = mapPriceToTier(subscription.items.data[0]?.price.id);

  await query(
    `INSERT INTO subscriptions (
      stripe_subscription_id, stripe_customer_id, stripe_price_id,
      tier, status, current_period_start, current_period_end
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      updated_at = NOW()`,
    [
      subscription.id,
      subscription.customer as string,
      subscription.items.data[0]?.price.id,
      tier,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
    ]
  );

  console.log(`[Webhook] Subscription created: ${subscription.id}`);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const tier = mapPriceToTier(subscription.items.data[0]?.price.id);

  await query(
    `UPDATE subscriptions SET
      stripe_price_id = $1,
      tier = $2,
      status = $3,
      current_period_start = $4,
      current_period_end = $5,
      cancel_at_period_end = $6,
      canceled_at = $7,
      updated_at = NOW()
    WHERE stripe_subscription_id = $8`,
    [
      subscription.items.data[0]?.price.id,
      tier,
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      subscription.id,
    ]
  );

  console.log(`[Webhook] Subscription updated: ${subscription.id}`);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await query(
    `UPDATE subscriptions SET
      status = 'canceled',
      canceled_at = NOW(),
      updated_at = NOW()
    WHERE stripe_subscription_id = $1`,
    [subscription.id]
  );

  console.log(`[Webhook] Subscription deleted: ${subscription.id}`);
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
): Promise<void> {
  if (invoice.subscription) {
    await query(
      `UPDATE subscriptions SET
        status = 'active',
        updated_at = NOW()
      WHERE stripe_subscription_id = $1`,
      [invoice.subscription as string]
    );
  }

  console.log(`[Webhook] Invoice payment succeeded: ${invoice.id}`);
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  if (invoice.subscription) {
    await query(
      `UPDATE subscriptions SET
        status = 'past_due',
        updated_at = NOW()
      WHERE stripe_subscription_id = $1`,
      [invoice.subscription as string]
    );
  }

  console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
}

/**
 * Map Stripe price ID to subscription tier
 */
function mapPriceToTier(priceId: string | undefined): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_BASIC || '']: 'basic',
    [process.env.STRIPE_PRICE_PRO || '']: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
  };

  return priceMap[priceId || ''] || 'basic';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  // Get raw body for signature verification
  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature using stripe.webhooks.constructEvent()
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Signature verification failed: ${message}`);
    return res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
  }

  // Check idempotency - skip if already processed
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`[Webhook] Event already processed (idempotent): ${event.id}`);
    return res.status(200).json({ received: true, status: 'already_processed' });
  }

  try {
    // Process event based on type
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        console.log(`[Webhook] Checkout session completed: ${(event.data.object as Stripe.Checkout.Session).id}`);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event as processed (idempotency)
    await markEventProcessed(event.id, event.type);

    return res.status(200).json({ received: true, status: 'processed' });
  } catch (error) {
    console.error(`[Webhook] Error processing event ${event.id}:`, error);
    return res.status(500).json({ error: 'Error processing webhook event' });
  }
}
