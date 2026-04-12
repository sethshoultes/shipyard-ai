import Stripe from 'stripe';

/**
 * Stripe client for MemberShip plugin
 * Version: 1.0.0
 *
 * Handles all Stripe payment operations with proper error handling
 * and compassionate error messages per brand voice.
 */

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export interface StripeError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'unknown_error';
  userMessage: string;
}

export interface CheckoutSessionParams {
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export type MemberStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';

let stripeClient: Stripe | null = null;

/**
 * Initialize the Stripe client
 * Must be called before any other Stripe operations
 */
export function initStripe(config: StripeConfig): Stripe {
  if (!config.secretKey) {
    throw new Error('Stripe secret key is required');
  }

  stripeClient = new Stripe(config.secretKey, {
    apiVersion: '2024-06-20',
  });

  return stripeClient;
}

/**
 * Get the initialized Stripe client
 * Throws if initStripe hasn't been called
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    throw new Error('Stripe client not initialized. Call initStripe() first.');
  }
  return stripeClient;
}

/**
 * Create a checkout session for membership purchase
 * Returns a URL to redirect the user to Stripe Checkout
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: params.email,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Verify a Stripe webhook signature
 * Returns the parsed event if valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  const stripe = getStripeClient();

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Cancel a subscription
 * Cancels at period end by default (graceful cancellation)
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediate = false
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();

  if (immediate) {
    return stripe.subscriptions.cancel(subscriptionId);
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripeClient();
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Handle Stripe errors with compassionate messages
 * Per brand voice: terse, warm, helpful
 */
export function handleStripeError(error: unknown): StripeError {
  if (error instanceof Stripe.errors.StripeCardError) {
    return {
      code: error.code || 'card_error',
      message: error.message,
      type: 'card_error',
      userMessage: "The payment didn't go through. It happens. Here's what to do next: check your card details and try again.",
    };
  }

  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return {
      code: error.code || 'validation_error',
      message: error.message,
      type: 'validation_error',
      userMessage: 'Something looks off. Please check your information and try again.',
    };
  }

  if (error instanceof Stripe.errors.StripeAPIError) {
    return {
      code: error.code || 'api_error',
      message: error.message,
      type: 'api_error',
      userMessage: 'A payment issue occurred. Please try again in a moment.',
    };
  }

  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: error.message,
      type: 'unknown_error',
      userMessage: 'Something went wrong. Please try again or contact support.',
    };
  }

  return {
    code: 'unknown_error',
    message: 'Unknown error',
    type: 'unknown_error',
    userMessage: 'Something went wrong. Please try again or contact support.',
  };
}

/**
 * Map Stripe subscription status to member status
 */
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): MemberStatus {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'canceled';
  }
}
