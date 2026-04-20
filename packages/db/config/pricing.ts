/**
 * Shipyard Care - Pricing Configuration
 *
 * Token-based subscription pricing tiers.
 * Tokens represent AI inference costs across all Claude API calls.
 *
 * Pricing Philosophy:
 * - Token-based (not round-based) for predictable costs
 * - Overage: $5 per 10K tokens (V1: manual approval, V2: auto-charge)
 * - Credit cap: Max 50% of monthly bill
 */

export type CareTier = 'care' | 'care_pro';

export interface PricingTier {
  /** Tier identifier */
  tier: CareTier;
  /** Monthly price in cents */
  price: number;
  /** Monthly token allocation */
  tokens: number;
  /** Overage cost per 10K tokens (in cents) */
  overage_rate: number;
  /** Display name for marketing */
  display_name: string;
  /** Stripe price ID (set in production) */
  stripe_price_id?: string;
}

export const PRICING_TIERS: Record<CareTier, PricingTier> = {
  care: {
    tier: 'care',
    price: 50000, // $500.00
    tokens: 100000, // 100K tokens/month
    overage_rate: 500, // $5 per 10K tokens
    display_name: 'Shipyard Care',
    stripe_price_id: 'price_care_500',
  },
  care_pro: {
    tier: 'care_pro',
    price: 100000, // $1,000.00
    tokens: 250000, // 250K tokens/month
    overage_rate: 500, // $5 per 10K tokens
    display_name: 'Shipyard Care Pro',
    stripe_price_id: 'price_care_pro_1000',
  },
};

/**
 * Get pricing configuration for a tier
 */
export function getTierConfig(tier: CareTier): PricingTier {
  return PRICING_TIERS[tier];
}

/**
 * Calculate overage cost for excess token usage
 * @param excessTokens Number of tokens over monthly allocation
 * @returns Cost in cents
 */
export function calculateOverageCost(excessTokens: number, tier: CareTier): number {
  const config = getTierConfig(tier);
  const blocks = Math.ceil(excessTokens / 10000); // Round up to nearest 10K block
  return blocks * config.overage_rate;
}

/**
 * Referral credit configuration
 */
export const REFERRAL_CONFIG = {
  /** Credit amount per successful referral (in cents) */
  credit_amount: 10000, // $100
  /** Maximum credit as percentage of monthly bill */
  credit_cap_percent: 50,
  /** Number of payments before credit applies (fraud prevention) */
  payments_before_credit: 2,
};

/**
 * Token warning threshold (send warning email when below this)
 */
export const TOKEN_WARNING_THRESHOLD = 20000; // 20K tokens

/**
 * Estimated tokens per typical PRD revision
 * (Used for initial estimates, replaced with actual usage tracking)
 */
export const ESTIMATED_TOKENS_PER_PRD = 15000; // 15K tokens
