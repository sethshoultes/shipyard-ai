import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { subscribersTable } from './subscribers';

/**
 * Shipyard Care - Token Usage Logs
 *
 * Tracks token consumption per PRD processing event.
 * Used for billing, analytics, and incident reporting.
 *
 * Each log entry represents one PRD processing cycle.
 */

export const tokenUsageTable = pgTable('token_usage', {
  id: serial('id').primaryKey(),

  // Foreign key to subscribers (email-based)
  subscriber_email: text('subscriber_email')
    .notNull()
    .references(() => subscribersTable.email, { onDelete: 'cascade' }),

  // PRD identifier (links to the processed PRD)
  prd_id: text('prd_id').notNull(),

  // Tokens consumed in this processing cycle
  tokens_used: integer('tokens_used').notNull(),

  // When this usage occurred
  timestamp: timestamp('timestamp').notNull().default(sql`now()`),
});

// TypeScript types
export type TokenUsage = typeof tokenUsageTable.$inferSelect;
export type NewTokenUsage = typeof tokenUsageTable.$inferInsert;

// Alias for consistency with other exports
export const tokenUsage = tokenUsageTable;
