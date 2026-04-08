import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { sitesTable } from './sites';

/**
 * CRITICAL: This table caches Stripe data. Always verify with Stripe for access decisions.
 *
 * Stripe is the source of truth. This table provides fast read access for display purposes
 * with a 60-second TTL for access checks. Do NOT use this table for authorization decisions
 * without verifying the current subscription state with Stripe first.
 */
export const subscriptionsTable = pgTable('subscriptions', {
  id: serial('id').primaryKey(),

  // Foreign key to sites table
  site_id: integer('site_id')
    .notNull()
    .references(() => sitesTable.id, { onDelete: 'cascade' }),

  // Stripe identifiers
  stripe_subscription_id: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripe_customer_id: varchar('stripe_customer_id', { length: 255 }),
  stripe_price_id: varchar('stripe_price_id', { length: 255 }),

  // Subscription status: active | trialing | past_due | canceled | unpaid
  status: varchar('status', { length: 50 }),

  // Service tier
  tier: varchar('tier', { length: 50 }).notNull(),

  // Trial information
  trial_ends_at: timestamp('trial_ends_at'),

  // Billing period information
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),

  // Cancellation information
  canceled_at: timestamp('canceled_at'),

  // Timestamps
  created_at: timestamp('created_at').default(sql`now()`).notNull(),
  updated_at: timestamp('updated_at').default(sql`now()`).notNull(),
});

// TypeScript types
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
export type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

// Alias for consistency with other exports
export const subscriptions = subscriptionsTable;
