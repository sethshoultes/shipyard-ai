import { getDb } from '../client';
import { subscribersTable } from '../schema/subscribers';
import { tokenUsageTable } from '../schema/token-usage';
import { TOKEN_WARNING_THRESHOLD } from '../config/pricing';
import { eq, sql } from 'drizzle-orm';

/**
 * Result of token deduction
 */
export interface TokenDeductResult {
  /** New token balance after deduction */
  balance: number;
  /** Whether warning email should be sent */
  should_warn: boolean;
}

/**
 * Deduct tokens from subscriber balance and log usage
 *
 * This function:
 * 1. Decrements tokens_remaining in subscribers table
 * 2. Logs usage in token_usage table
 * 3. Checks if balance is below warning threshold
 *
 * Note: Email sending is handled by caller (separation of concerns)
 *
 * @param email Subscriber's email address
 * @param prdId PRD identifier
 * @param tokensUsed Number of tokens consumed
 * @returns Updated balance and warning flag
 * @throws Error if subscriber not found or insufficient tokens
 */
export async function deductTokens(
  email: string,
  prdId: string,
  tokensUsed: number
): Promise<TokenDeductResult> {
  const db = getDb();

  // Start transaction (if supported by Drizzle, otherwise sequential)
  try {
    // First, check if subscriber exists and has sufficient tokens
    const [subscriber] = await db
      .select()
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);

    if (!subscriber) {
      throw new Error(`Subscriber not found: ${email}`);
    }

    if (subscriber.tokens_remaining < tokensUsed) {
      throw new Error(
        `Insufficient tokens. Available: ${subscriber.tokens_remaining}, Required: ${tokensUsed}`
      );
    }

    // Decrement tokens_remaining
    const newBalance = subscriber.tokens_remaining - tokensUsed;

    await db
      .update(subscribersTable)
      .set({
        tokens_remaining: newBalance,
      })
      .where(eq(subscribersTable.email, email));

    // Log usage in token_usage table
    await db.insert(tokenUsageTable).values({
      subscriber_email: email,
      prd_id: prdId,
      tokens_used: tokensUsed,
    });

    // Check if warning threshold crossed
    const shouldWarn = newBalance < TOKEN_WARNING_THRESHOLD;

    return {
      balance: newBalance,
      should_warn: shouldWarn,
    };
  } catch (error) {
    console.error('Error deducting tokens:', error);
    throw error;
  }
}

/**
 * Get total token usage for a subscriber in current billing period
 * (Helper function for analytics)
 *
 * @param email Subscriber's email
 * @param periodStart Start of billing period
 * @returns Total tokens used since period start
 */
export async function getTotalUsage(
  email: string,
  periodStart: Date
): Promise<number> {
  const db = getDb();

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${tokenUsageTable.tokens_used}), 0)`,
    })
    .from(tokenUsageTable)
    .where(
      sql`${tokenUsageTable.subscriber_email} = ${email} AND ${tokenUsageTable.timestamp} >= ${periodStart}`
    );

  return result[0]?.total || 0;
}
