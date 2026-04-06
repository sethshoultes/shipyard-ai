/**
 * Stripe Checkout API Endpoint
 * Requirement: REQ-002 - Build Stripe checkout flow for subscription creation
 *
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for subscription tiers:
 * - Basic: $99/month
 * - Pro: $249/month
 * - Enterprise: $499/month
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getStripeClient, generateIdempotencyKey, handleStripeError } from '../../../lib/stripe';
import { withAuth, User } from '../../../lib/auth';
import { query } from '../../../lib/db';

/**
 * Subscription tier configuration
 */
interface TierConfig {
  name: string;
  priceId: string;
  amount: number; // in cents
}

/**
 * Tier configurations
 * REQ-002: Basic ($99), Pro ($249), Enterprise ($499)
 */
const TIERS: Record<string, TierConfig> = {
  basic: {
    name: 'Basic',
    priceId: process.env.STRIPE_PRICE_BASIC || '',
    amount: 9900, // $99
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO || '',
    amount: 24900, // $249
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    amount: 49900, // $499
  },
};

interface CheckoutRequest {
  tier: 'basic' | 'pro' | 'enterprise';
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

/**
 * Get or create Stripe customer for user
 */
async function getOrCreateStripeCustomer(
  stripe: Stripe,
  user: User
): Promise<string> {
  // Check if user already has a Stripe customer ID
  const result = await query<{ stripe_customer_id: string }>(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [user.id]
  );

  if (result.rows.length > 0 && result.rows[0].stripe_customer_id) {
    return result.rows[0].stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create(
    {
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    },
    {
      idempotencyKey: generateIdempotencyKey(),
    }
  );

  // Save Stripe customer ID to user record
  await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [
    customer.id,
    user.id,
  ]);

  return customer.id;
}

/**
 * Create checkout session handler (protected by auth)
 */
async function createCheckoutSession(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutResponse>,
  user: User
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { tier, successUrl, cancelUrl } = req.body as CheckoutRequest;

    // Validate tier
    if (!tier || !TIERS[tier]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription tier. Must be basic, pro, or enterprise.',
      });
    }

    const tierConfig = TIERS[tier];

    // Validate price ID is configured
    if (!tierConfig.priceId) {
      return res.status(500).json({
        success: false,
        error: `Price ID not configured for ${tier} tier`,
      });
    }

    const stripe = getStripeClient();

    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(stripe, user);

    // Build URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const defaultSuccessUrl = `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${baseUrl}/pricing?checkout=canceled`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: tierConfig.priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || defaultSuccessUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
        subscription_data: {
          metadata: {
            userId: user.id,
            tier: tier,
          },
        },
        metadata: {
          userId: user.id,
          tier: tier,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      },
      {
        idempotencyKey: generateIdempotencyKey(),
      }
    );

    console.log(
      `[Checkout] Session created for user ${user.id}: ${session.id} (${tier})`
    );

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);

    const stripeError = handleStripeError(error);
    return res.status(400).json({
      success: false,
      error: stripeError.userMessage,
    });
  }
}

export default withAuth(createCheckoutSession);
