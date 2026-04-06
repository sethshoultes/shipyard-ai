import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  metricsTable,
  type Metric,
  type NewMetric,
  type AverageMetrics,
} from '../schema/metrics';

/**
 * Query helpers for metrics table
 */

/**
 * Get the latest metric for a specific site
 * Returns the most recently created metric record for the site
 */
export async function getLatestMetrics(
  db: NodePgDatabase,
  siteId: number,
): Promise<Metric | null> {
  const result = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.site_id, siteId))
    .orderBy(desc(metricsTable.created_at))
    .limit(1);

  return result[0] || null;
}

/**
 * Get metrics history for a specific site within a time range
 * Returns all metric records for a site from the last N days
 *
 * @param db - Database connection
 * @param siteId - Site ID to query
 * @param days - Number of days of history to retrieve
 */
export async function getMetricsHistory(
  db: NodePgDatabase,
  siteId: number,
  days: number,
): Promise<Metric[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return db
    .select()
    .from(metricsTable)
    .where(
      and(
        eq(metricsTable.site_id, siteId),
        gte(metricsTable.created_at, cutoffDate),
      ),
    )
    .orderBy(desc(metricsTable.created_at));
}

/**
 * Create a new metric record
 * Inserts metric data and returns the created record
 */
export async function createMetric(
  db: NodePgDatabase,
  data: NewMetric,
): Promise<Metric> {
  const result = await db
    .insert(metricsTable)
    .values(data)
    .returning();

  return result[0];
}

/**
 * Get average metrics for a site over a time range
 * Calculates average values for all numeric metrics within the specified date range
 *
 * @param db - Database connection
 * @param siteId - Site ID to query
 * @param startDate - Start of date range (inclusive)
 * @param endDate - End of date range (inclusive)
 */
export async function getAverageMetrics(
  db: NodePgDatabase,
  siteId: number,
  startDate: Date,
  endDate: Date,
): Promise<AverageMetrics> {
  const result = await db
    .select({
      average_health_score: sql<number>`CAST(AVG(${metricsTable.health_score}) AS INTEGER)`,
      average_lighthouse_score: sql<number>`CAST(AVG(${metricsTable.lighthouse_score}) AS INTEGER)`,
      average_load_time_ms: sql<number>`CAST(AVG(${metricsTable.load_time_ms}) AS INTEGER)`,
      average_uptime_percent: sql<number>`CAST(AVG(${metricsTable.uptime_percent}::NUMERIC) AS NUMERIC)`,
      average_response_time_ms: sql<number>`CAST(AVG(${metricsTable.response_time_ms}) AS INTEGER)`,
      measurement_count: sql<number>`COUNT(*)`,
    })
    .from(metricsTable)
    .where(
      and(
        eq(metricsTable.site_id, siteId),
        gte(metricsTable.created_at, startDate),
        lte(metricsTable.created_at, endDate),
      ),
    );

  if (!result[0]) {
    return {
      average_health_score: null,
      average_lighthouse_score: null,
      average_load_time_ms: null,
      average_uptime_percent: null,
      average_response_time_ms: null,
      measurement_count: 0,
    };
  }

  return result[0];
}
