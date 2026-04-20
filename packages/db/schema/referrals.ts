import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { subscribersTable } from './subscribers';

/**
 * Shipyard Care - Referral Tracking
 *
 * Tracks referral conversions and credits.
 * Credit applies after referred subscriber's 2nd monthly payment (fraud prevention).
 * Credit is $100 MRR per conversion, capped at 50% of monthly bill.
 *
 * Each row represents one successful referral conversion.
 */

export const referralsTable = pgTable('referrals', {
  id: serial('id').primaryKey(),

  // Who made the referral (foreign key to subscribers)
  referrer_email: text('referrer_email')
    .notNull()
    .references(() => subscribersTable.email, { onDelete: 'cascade' }),

  // Who signed up via the referral link
  referred_email: text('referred_email').notNull(),

  // Credit amount in cents (typically 10000 = $100)
  credit_amount: integer('credit_amount').notNull(),

  // When the referral converted (after 2nd payment)
  converted_date: timestamp('converted_date').notNull().default(sql`now()`),
});

// TypeScript types
export type Referral = typeof referralsTable.$inferSelect;
export type NewReferral = typeof referralsTable.$inferInsert;

// Alias for consistency with other exports
export const referrals = referralsTable;
