import Stripe from 'stripe';
import { randomUUID } from 'crypto';

/**
 * Stripe Error Type - user-friendly error representation
 */
export interface StripeError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'unknown_error';
  userMessage: string;
}

/**
 * Checkout Session Parameters
 */
export interface CheckoutSessionParams {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey?: string;
}

/**
 * Subscription Status enum
 */
export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

// Validate and initialize Stripe client
function initializeStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is not set. Cannot initialize Stripe client.'
    );
  }

  const client = new Stripe(secretKey, {
    apiVersion: '2024-06-20',
  });

  // Determine if running in test or live mode
  const isTestMode = secretKey.startsWith('sk_test_');
  const mode = isTestMode ? 'test' : 'live';

  // Log startup validation
  console.log(`[Stripe] Initialized in ${mode} mode`);

  return client;
}

// Singleton instance
let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client instance
 * Initializes on first call, throws if STRIPE_SECRET_KEY is missing
 *
 * @returns {Stripe} The Stripe client instance
 * @throws {Error} If STRIPE_SECRET_KEY is not set
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    stripeInstance = initializeStripeClient();
  }
  return stripeInstance;
}

/**
 * Generate an idempotency key for Stripe API calls
 * All Stripe calls must include an idempotency key to ensure idempotent operations
 * and prevent duplicate charges/transactions.
 *
 * @returns {string} A unique idempotency key (UUID v4)
 */
export function generateIdempotencyKey(): string {
  return randomUUID();
}

/**
 * Handle Stripe errors and convert them to user-friendly messages
 *
 * Parses Stripe error types and returns structured error information
 * with both technical details and user-friendly messages.
 *
 * @param {unknown} error - The error object from Stripe SDK
 * @returns {StripeError} Structured error information
 */
export function handleStripeError(error: unknown): StripeError {
  // Handle Stripe-specific errors
  if (error instanceof Stripe.errors.StripeCardError) {
    return {
      code: error.code || 'card_error',
      message: error.message,
      type: 'card_error',
      userMessage:
        'Your card was declined. Please check your card details and try again.',
    };
  }

  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return {
      code: error.code || 'validation_error',
      message: error.message,
      type: 'validation_error',
      userMessage:
        'There was an issue with your request. Please check your information and try again.',
    };
  }

  if (error instanceof Stripe.errors.StripeAPIError) {
    return {
      code: error.code || 'api_error',
      message: error.message,
      type: 'api_error',
      userMessage:
        'A payment processing error occurred. Please try again in a few moments.',
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: error.message,
      type: 'unknown_error',
      userMessage:
        'An unexpected error occurred. Please try again or contact support.',
    };
  }

  // Handle completely unknown errors
  return {
    code: 'unknown_error',
    message: 'Unknown error',
    type: 'unknown_error',
    userMessage:
      'An unexpected error occurred. Please try again or contact support.',
  };
}
