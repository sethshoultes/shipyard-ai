/**
 * Stripe Configuration & Subscription Helpers
 *
 * DECISIONS (LOCKED):
 * - Two Stripe annual plans, one radio button.
 * - Stripe owns proration entirely. proration_behavior: 'create_prorations'.
 * - Zero custom proration logic.
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

/** Plan IDs — single source of truth */
export const PLAN_IDS = {
  monthly: {
    base: process.env.STRIPE_MONTHLY_BASE_PRICE_ID || "price_monthly_base",
    pro: process.env.STRIPE_MONTHLY_PRO_PRICE_ID || "price_monthly_pro",
  },
  annual: {
    base: process.env.STRIPE_ANNUAL_BASE_PRICE_ID || "localgenius-annual-base",
    pro: process.env.STRIPE_ANNUAL_PRO_PRICE_ID || "localgenius-annual-pro",
  },
} as const;

/** Human-readable plan names for Stripe Checkout line items */
export const PLAN_NAMES = {
  [PLAN_IDS.monthly.base]: "Sous Monthly — Base",
  [PLAN_IDS.monthly.pro]: "Sous Monthly — Pro",
  [PLAN_IDS.annual.base]: "Sous Annual — Base",
  [PLAN_IDS.annual.pro]: "Sous Annual — Pro",
} as const;

/** Annual pricing for display (cents → dollars) */
export const ANNUAL_PRICES = {
  base: { display: "$278/year", raw: 27800, savings: 70 },
  pro: { display: "$798/year", raw: 79800, savings: 198 },
} as const;

/** Monthly pricing for display */
export const MONTHLY_PRICES = {
  base: { display: "$29/month", raw: 2900 },
  pro: { display: "$83/month", raw: 8300 },
} as const;

/** Checks if a price ID is an annual plan */
export function isAnnualPlan(priceId: string): boolean {
  return priceId === PLAN_IDS.annual.base || priceId === PLAN_IDS.annual.pro;
}

/** Checks if a price ID is a base plan */
export function isBasePlan(priceId: string): boolean {
  return priceId === PLAN_IDS.monthly.base || priceId === PLAN_IDS.annual.base;
}

/** Get the opposing billing interval plan ID (upgrade / downgrade target) */
export function getAlternatePlanId(currentPriceId: string): string | null {
  switch (currentPriceId) {
    case PLAN_IDS.monthly.base:
      return PLAN_IDS.annual.base;
    case PLAN_IDS.monthly.pro:
      return PLAN_IDS.annual.pro;
    case PLAN_IDS.annual.base:
      return PLAN_IDS.monthly.base;
    case PLAN_IDS.annual.pro:
      return PLAN_IDS.monthly.pro;
    default:
      return null;
  }
}

/**
 * Create or update a subscription with Stripe-native proration.
 *
 * DECISION (LOCKED): `proration_behavior: 'create_prorations'` on all updates.
 */
export async function updateSubscriptionBilling(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
    // Immediate invoice for upgrades; prorated credit for downgrades
    billing_cycle_anchor: "unchanged",
  });

  return updated;
}

/**
 * Create a new subscription with the selected plan.
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata: {
      ...metadata,
      plan_type: isAnnualPlan(priceId) ? "annual" : "monthly",
      plan_tier: isBasePlan(priceId) ? "base" : "pro",
    },
    proration_behavior: "create_prorations",
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
}

/**
 * Create a Stripe Checkout session for annual billing.
 */
export async function createAnnualCheckout(
  customerId: string,
  tier: "base" | "pro",
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const priceId = PLAN_IDS.annual[tier];

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        plan_type: "annual",
        plan_tier: tier,
      },
    },
    // Annual billing uses Stripe's native proration for any future changes
    allow_promotion_codes: true,
  });
}

/**
 * Generate a Stripe Customer Portal session link.
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    flow_data: {
      type: "payment_method_update",
    },
  });
}

export { stripe };
