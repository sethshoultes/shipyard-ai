import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Shipyard Care Subscription Service - Subscribers Table
 *
 * Tracks active Care and Care Pro subscribers with token budgets,
 * referral codes, and subscription status.
 *
 * Email is the primary identifier (not site-specific).
 * Each subscriber gets a unique referral code for viral distribution.
 */

// Enums for tier and status
export const tierEnum = pgEnum('tier', ['care', 'care_pro']);
export const statusEnum = pgEnum('status', ['active', 'cancelled', 'paused']);

export const subscribersTable = pgTable('subscribers', {
  id: serial('id').primaryKey(),

  // Subscriber identification
  email: text('email').notNull().unique(),

  // Subscription tier (care = $500/month, care_pro = $1000/month)
  tier: tierEnum('tier').notNull(),

  // Token budget allocation
  tokens_monthly: integer('tokens_monthly').notNull(),
  tokens_remaining: integer('tokens_remaining').notNull(),

  // Referral system
  referral_code: text('referral_code').notNull().unique(),
  referral_credits: integer('referral_credits').notNull().default(0),

  // Subscription lifecycle
  start_date: timestamp('start_date').notNull().default(sql`now()`),
  status: statusEnum('status').notNull().default('active'),
});

// Indexes for fast lookups
// Note: Drizzle indexes are defined separately in migrations
// For now, unique constraints on email and referral_code provide indexing

// TypeScript types
export type Subscriber = typeof subscribersTable.$inferSelect;
export type NewSubscriber = typeof subscribersTable.$inferInsert;

export type Tier = 'care' | 'care_pro';
export type Status = 'active' | 'cancelled' | 'paused';

// Alias for consistency with other exports
export const subscribers = subscribersTable;
