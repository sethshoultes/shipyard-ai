/**
 * Checkout API for MemberShip plugin
 * Version: 1.0.0
 *
 * Handles Stripe checkout session creation for membership purchases.
 * Single-form registration: email only, no password maze.
 */

import { createCheckoutSession, handleStripeError } from '../lib/stripe';
import { getMemberByEmail } from '../lib/kv';

export interface CheckoutRequest {
  email: string;
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface Env {
  STRIPE_SECRET_KEY: string;
  SITE_URL: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handle checkout request
 * Creates a Stripe checkout session and returns the URL
 */
export async function handleCheckout(
  request: Request,
  env: Env
): Promise<Response> {
  // Only accept POST
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return createErrorResponse('Invalid request body', 400);
  }

  // Validate email
  if (!body.email || !isValidEmail(body.email)) {
    return createErrorResponse('Please enter a valid email address', 400);
  }

  // Validate price ID
  if (!body.priceId) {
    return createErrorResponse('Please select a membership plan', 400);
  }

  // Check if already a member
  const existingMember = await getMemberByEmail(body.email);
  if (existingMember && existingMember.status === 'active') {
    return createErrorResponse(
      "You're already a member. Head to your member portal to manage your subscription.",
      400
    );
  }

  // Create checkout session
  try {
    const result = await createCheckoutSession({
      email: body.email,
      priceId: body.priceId,
      successUrl: body.successUrl || `${env.SITE_URL}/membership/success`,
      cancelUrl: body.cancelUrl || `${env.SITE_URL}/membership/canceled`,
      metadata: {
        email: body.email,
      },
    });

    return createSuccessResponse({ url: result.url });
  } catch (error) {
    const stripeError = handleStripeError(error);
    console.error('[Checkout] Stripe error:', stripeError.message);
    return createErrorResponse(stripeError.userMessage, 500);
  }
}

/**
 * Create success response
 */
function createSuccessResponse(data: { url: string }): Response {
  const response: CheckoutResponse = {
    success: true,
    url: data.url,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create error response with compassionate message
 */
function createErrorResponse(message: string, status: number): Response {
  const response: CheckoutResponse = {
    success: false,
    error: message,
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
