import { eq, and } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { subscriptionsTable, type Subscription, type NewSubscription } from '../schema/subscriptions';

/**
 * Query helpers for subscriptions table
 * Always verify with Stripe for authorization decisions
 */

/**
 * Get subscription by site ID
 * Returns the subscription record for a specific site
 */
export async function getSubscriptionBySiteId(
  db: NodePgDatabase,
  siteId: number,
): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.site_id, siteId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get subscription by Stripe subscription ID
 * Returns the subscription record for a specific Stripe subscription
 */
export async function getSubscriptionByStripeId(
  db: NodePgDatabase,
  stripeId: string,
): Promise<Subscription | null> {
  const result = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripe_subscription_id, stripeId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new subscription record
 * Inserts subscription data and returns the created record
 */
export async function createSubscription(
  db: NodePgDatabase,
  data: NewSubscription,
): Promise<Subscription> {
  const result = await db
    .insert(subscriptionsTable)
    .values(data)
    .returning();

  return result[0];
}

/**
 * Update subscription record
 * Updates the subscription with the given ID and returns the updated record
 */
export async function updateSubscription(
  db: NodePgDatabase,
  id: number,
  data: Partial<NewSubscription>,
): Promise<Subscription> {
  const result = await db
    .update(subscriptionsTable)
    .set({
      ...data,
      updated_at: new Date(),
    })
    .where(eq(subscriptionsTable.id, id))
    .returning();

  return result[0];
}

/**
 * Get all active subscriptions
 * Returns subscriptions with status 'active' or 'trialing'
 */
export async function getActiveSubscriptions(
  db: NodePgDatabase,
): Promise<Subscription[]> {
  return db
    .select()
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.status, 'active'),
      ),
    );
}
