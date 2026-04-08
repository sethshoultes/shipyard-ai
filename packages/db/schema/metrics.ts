import { pgTable, serial, integer, varchar, decimal, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { sitesTable } from './sites';

/**
 * Metrics table schema
 * Stores PageSpeed scores, uptime results, and calculated Health Scores
 * This is time-series data that powers the dashboard and monthly email
 *
 * Each row represents a measurement taken at a point in time for a specific site.
 * The metric_type field indicates the source: 'pagespeed', 'uptime', or 'daily_aggregate'
 */
export const metricsTable = pgTable('metrics', {
  id: serial('id').primaryKey(),

  // Foreign key to sites table
  site_id: integer('site_id')
    .notNull()
    .references(() => sitesTable.id, { onDelete: 'cascade' }),

  // Health score: 0-100 calculated value
  health_score: integer('health_score'),

  // Lighthouse score from PageSpeed API: 0-100
  lighthouse_score: integer('lighthouse_score'),

  // Load time in milliseconds
  load_time_ms: integer('load_time_ms'),

  // Uptime percentage: 99.95 represented as decimal(5,2)
  uptime_percent: decimal('uptime_percent', { precision: 5, scale: 2 }),

  // Response time in milliseconds from uptime check
  response_time_ms: integer('response_time_ms'),

  // Metric type: 'pagespeed' | 'uptime' | 'daily_aggregate'
  metric_type: varchar('metric_type', { length: 50 }).notNull(),

  // Timestamps
  created_at: timestamp('created_at').default(sql`now()`).notNull(),
});

// TypeScript types

/**
 * Metric type enum
 */
export type MetricType = 'pagespeed' | 'uptime' | 'daily_aggregate';

/**
 * Full Metric type (from database)
 */
export type Metric = typeof metricsTable.$inferSelect;

/**
 * New Metric type for inserts (omits id and timestamps)
 */
export type NewMetric = typeof metricsTable.$inferInsert;

/**
 * Average metrics calculated over a time period
 */
export interface AverageMetrics {
  average_health_score: number | null;
  average_lighthouse_score: number | null;
  average_load_time_ms: number | null;
  average_uptime_percent: number | null;
  average_response_time_ms: number | null;
  measurement_count: number;
}
