/**
 * Webhook API for MemberShip plugin
 * Version: 1.0.0
 *
 * Handles Stripe webhooks with HMAC signature verification.
 * Implements retry logic and failure recovery per Ship Gate requirements.
 *
 * CRITICAL: This handles payment → access flow. Failures here = customer rage-quits.
 */

import Stripe from 'stripe';
import { verifyWebhookSignature, mapSubscriptionStatus, getSubscription } from '../lib/stripe';
import {
  createMember,
  getMemberBySubscription,
  getMemberByEmail,
  updateMemberStatus,
} from '../lib/kv';
import { sendWelcomeEmail, sendConfirmationEmail, sendCancellationEmail } from '../lib/email';

export interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SITE_URL: string;
  SITE_NAME: string;
}

/**
 * Handle incoming Stripe webhook
 */
export async function handleWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Get signature header
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  // Get raw body for signature verification
  const payload = await request.text();

  // Verify signature
  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[Webhook] Signature verification failed:', error);
    return new Response('Invalid signature', { status: 400 });
  }

  // Process event
  try {
    await processEvent(event, env);
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[Webhook] Event processing failed:', error);
    // Return 500 so Stripe will retry
    return new Response('Processing failed', { status: 500 });
  }
}

/**
 * Process Stripe event
 */
async function processEvent(event: Stripe.Event, env: Env): Promise<void> {
  console.log(`[Webhook] Processing event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, env);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, env);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, env);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice, env);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice, env);
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle successful checkout - create member
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  env: Env
): Promise<void> {
  const email = session.customer_email || session.metadata?.email;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!email || !subscriptionId) {
    console.error('[Webhook] Missing email or subscription ID in checkout session');
    return;
  }

  // Check if member already exists (resubscription case)
  let member = await getMemberByEmail(email);

  if (member) {
    // Update existing member
    await updateMemberStatus(member.id, 'active');
    console.log(`[Webhook] Reactivated member: ${email}`);
  } else {
    // Get subscription details for plan name
    const subscription = await getSubscription(subscriptionId);
    const planName = (subscription.items.data[0]?.price?.nickname) || 'Membership';

    // Create new member
    member = await createMember({
      email,
      status: 'active',
      plan: planName,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });
    console.log(`[Webhook] Created member: ${email}`);

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: email,
        siteName: env.SITE_NAME,
        loginUrl: `${env.SITE_URL}/membership/portal`,
      });
    } catch (emailError) {
      console.error('[Webhook] Failed to send welcome email:', emailError);
      // Don't fail the webhook for email errors
    }
  }
}

/**
 * Handle subscription updates (status changes)
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  env: Env
): Promise<void> {
  const member = await getMemberBySubscription(subscription.id);

  if (!member) {
    console.log(`[Webhook] No member found for subscription: ${subscription.id}`);
    return;
  }

  const newStatus = mapSubscriptionStatus(subscription.status);
  const canceledAt = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : undefined;

  await updateMemberStatus(member.id, newStatus, canceledAt);
  console.log(`[Webhook] Updated member ${member.email} status to ${newStatus}`);
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  env: Env
): Promise<void> {
  const member = await getMemberBySubscription(subscription.id);

  if (!member) {
    console.log(`[Webhook] No member found for subscription: ${subscription.id}`);
    return;
  }

  // Set expiration to end of current period
  const expiresAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date().toISOString();

  await updateMemberStatus(member.id, 'canceled', expiresAt);
  console.log(`[Webhook] Canceled member ${member.email}, access until ${expiresAt}`);

  // Send cancellation email
  try {
    await sendCancellationEmail({
      to: member.email,
      memberName: member.name,
      siteName: env.SITE_NAME,
      accessEndDate: new Date(expiresAt).toLocaleDateString(),
    });
  } catch (emailError) {
    console.error('[Webhook] Failed to send cancellation email:', emailError);
  }
}

/**
 * Handle successful payment (renewal)
 */
async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  env: Env
): Promise<void> {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return; // One-time payment, not subscription
  }

  const member = await getMemberBySubscription(subscriptionId);

  if (!member) {
    return;
  }

  // Ensure member is active
  if (member.status !== 'active') {
    await updateMemberStatus(member.id, 'active');
    console.log(`[Webhook] Reactivated member ${member.email} after payment`);
  }

  // Send confirmation for renewal payments (skip first payment)
  if (invoice.billing_reason === 'subscription_cycle') {
    try {
      const subscription = await getSubscription(subscriptionId);
      const nextBillingDate = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
        : 'N/A';

      await sendConfirmationEmail({
        to: member.email,
        memberName: member.name,
        siteName: env.SITE_NAME,
        planName: member.plan,
        amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
        nextBillingDate,
      });
    } catch (emailError) {
      console.error('[Webhook] Failed to send confirmation email:', emailError);
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  env: Env
): Promise<void> {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const member = await getMemberBySubscription(subscriptionId);

  if (!member) {
    return;
  }

  // Update to past_due status (still has access during grace period)
  await updateMemberStatus(member.id, 'past_due');
  console.log(`[Webhook] Member ${member.email} payment failed, now past_due`);

  // Stripe handles dunning emails, we don't need to send additional emails
}
