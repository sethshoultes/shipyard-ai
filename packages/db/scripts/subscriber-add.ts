import { getDb } from '../client';
import { subscribersTable, type Tier } from '../schema/subscribers';
import { PRICING_TIERS } from '../config/pricing';
import { eq } from 'drizzle-orm';

/**
 * Generates a unique 8-character alphanumeric referral code
 * Format: uppercase letters and numbers (e.g., "A3B7X9K2")
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Add a new subscriber to the Shipyard Care service
 *
 * Creates a subscriber record with:
 * - Unique email
 * - Assigned tier (care or care_pro)
 * - Token allocation from pricing config
 * - Unique referral code
 * - Active status
 *
 * @param email Subscriber's email address
 * @param tier Subscription tier ('care' or 'care_pro')
 * @returns Created subscriber record
 * @throws Error if email already exists or referral code collision cannot be resolved
 */
export async function addSubscriber(email: string, tier: Tier) {
  const db = getDb();

  // Get token allocation from pricing config
  const tierConfig = PRICING_TIERS[tier];
  const tokens_monthly = tierConfig.tokens;
  const tokens_remaining = tierConfig.tokens;

  // Generate unique referral code with retry logic
  let referralCode = '';
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    referralCode = generateReferralCode();

    // Check if code already exists
    const existing = await db
      .select()
      .from(subscribersTable)
      .where(eq(subscribersTable.referral_code, referralCode))
      .limit(1);

    if (existing.length === 0) {
      // Code is unique
      break;
    }

    attempts++;
    if (attempts >= maxAttempts) {
      throw new Error(
        `Failed to generate unique referral code after ${maxAttempts} attempts`
      );
    }
  }

  try {
    // Insert subscriber record
    const [subscriber] = await db
      .insert(subscribersTable)
      .values({
        email,
        tier,
        tokens_monthly,
        tokens_remaining,
        referral_code: referralCode,
        referral_credits: 0,
        status: 'active',
      })
      .returning();

    return subscriber;
  } catch (error) {
    // Handle unique constraint violation on email
    if (error instanceof Error && error.message.includes('unique')) {
      throw new Error(`Subscriber with email ${email} already exists`);
    }
    throw error;
  }
}
