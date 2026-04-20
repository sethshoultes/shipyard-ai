import { getDb } from '../client';
import { subscribersTable, type Status } from '../schema/subscribers';
import { eq } from 'drizzle-orm';

/**
 * Result of subscriber check
 */
export interface SubscriberCheckResult {
  /** Subscription status or null if not a subscriber */
  status: Status | null;
  /** Token balance (null if not a subscriber) */
  tokens_remaining: number | null;
  /** Subscriber tier (null if not a subscriber) */
  tier: string | null;
  /** Subscriber email (null if not found) */
  email: string | null;
}

/**
 * Check subscriber status and token balance
 *
 * Queries the subscribers table for the given email.
 * Used for:
 * - PRD intake routing (subscriber vs non-subscriber)
 * - Priority access decisions
 * - Token balance checks before processing
 *
 * @param email Subscriber's email address
 * @returns Status, token balance, and tier (or null if not a subscriber)
 */
export async function checkSubscriber(
  email: string
): Promise<SubscriberCheckResult> {
  const db = getDb();

  try {
    const [subscriber] = await db
      .select({
        status: subscribersTable.status,
        tokens_remaining: subscribersTable.tokens_remaining,
        tier: subscribersTable.tier,
        email: subscribersTable.email,
      })
      .from(subscribersTable)
      .where(eq(subscribersTable.email, email))
      .limit(1);

    if (!subscriber) {
      // Not a subscriber
      return {
        status: null,
        tokens_remaining: null,
        tier: null,
        email: null,
      };
    }

    return {
      status: subscriber.status,
      tokens_remaining: subscriber.tokens_remaining,
      tier: subscriber.tier,
      email: subscriber.email,
    };
  } catch (error) {
    console.error('Error checking subscriber:', error);
    throw error;
  }
}
