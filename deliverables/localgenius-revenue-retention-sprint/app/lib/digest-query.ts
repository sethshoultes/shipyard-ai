/**
 * Weekly Digest MoM Query
 *
 * DECISION (LOCKED): Add (user_id, created_at) composite index on insight_actions.
 * Query: GROUP BY DATE_TRUNC('week', created_at) with index hint.
 * Target: under 12ms at 1M rows.
 */

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface WeeklyMetrics {
  weekStart: string;
  reviewsResponded: number;
  postsPublished: number;
  avgEngagementRate: number;
  totalActions: number;
}

export interface MoMComparison {
  currentWeek: WeeklyMetrics;
  previousWeek: WeeklyMetrics;
  delta: {
    reviewsResponded: number;
    postsPublished: number;
    avgEngagementRate: number;
    totalActions: number;
  };
}

/**
 * Fetch the last 2 complete weeks of metrics for a single user.
 *
 * Uses the (user_id, created_at) composite index for fast range scans.
 * Limited to last 60 days to keep the query lean.
 */
export async function getWeeklyMetrics(
  userId: string
): Promise<MoMComparison | null> {
  const query = `
    WITH weekly_actions AS (
      SELECT
        DATE_TRUNC('week', created_at) AS week_start,
        COUNT(*) FILTER (WHERE action_type = 'review_responded') AS reviews_responded,
        COUNT(*) FILTER (WHERE action_type = 'post_published') AS posts_published,
        COALESCE(AVG(engagement_rate) FILTER (WHERE engagement_rate IS NOT NULL), 0) AS avg_engagement_rate,
        COUNT(*) AS total_actions
      FROM insight_actions
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '60 days'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week_start DESC
      LIMIT 2
    )
    SELECT * FROM weekly_actions;
  `;

  const result = await pool.query(query, [userId]);

  if (result.rows.length < 2) {
    return null;
  }

  const [currentWeekRow, previousWeekRow] = result.rows;

  const currentWeek: WeeklyMetrics = {
    weekStart: currentWeekRow.week_start.toISOString(),
    reviewsResponded: parseInt(currentWeekRow.reviews_responded, 10),
    postsPublished: parseInt(currentWeekRow.posts_published, 10),
    avgEngagementRate: parseFloat(currentWeekRow.avg_engagement_rate),
    totalActions: parseInt(currentWeekRow.total_actions, 10),
  };

  const previousWeek: WeeklyMetrics = {
    weekStart: previousWeekRow.week_start.toISOString(),
    reviewsResponded: parseInt(previousWeekRow.reviews_responded, 10),
    postsPublished: parseInt(previousWeekRow.posts_published, 10),
    avgEngagementRate: parseFloat(previousWeekRow.avg_engagement_rate),
    totalActions: parseInt(previousWeekRow.total_actions, 10),
  };

  const delta = {
    reviewsResponded: currentWeek.reviewsResponded - previousWeek.reviewsResponded,
    postsPublished: currentWeek.postsPublished - previousWeek.postsPublished,
    avgEngagementRate: currentWeek.avgEngagementRate - previousWeek.avgEngagementRate,
    totalActions: currentWeek.totalActions - previousWeek.totalActions,
  };

  return { currentWeek, previousWeek, delta };
}

/**
 * Get a single "hero number" for the digest — the metric with the most emotional impact.
 *
 * DECISION (LOCKED): "One number, one smile, one reason to exhale."
 */
export function getHeroMetric(comparison: MoMComparison): {
  label: string;
  value: number;
  delta: number;
  unit: string;
} {
  // Default to reviews_responded as primary metric per PRD open questions resolution
  if (comparison.currentWeek.reviewsResponded > 0) {
    return {
      label: "Reviews handled",
      value: comparison.currentWeek.reviewsResponded,
      delta: comparison.delta.reviewsResponded,
      unit: "reviews",
    };
  }

  if (comparison.currentWeek.postsPublished > 0) {
    return {
      label: "Posts went live",
      value: comparison.currentWeek.postsPublished,
      delta: comparison.delta.postsPublished,
      unit: "posts",
    };
  }

  return {
    label: "Actions taken",
    value: comparison.currentWeek.totalActions,
    delta: comparison.delta.totalActions,
    unit: "actions",
  };
}

/**
 * Estimate time saved based on total actions.
 *
 * DECISION (LOCKED): "'Time saved' single-line teaser ships. One line. One smile."
 */
export function estimateTimeSaved(totalActions: number): string {
  // Rough heuristic: 5 minutes per action (drafting, scheduling, responding)
  const minutes = totalActions * 5;
  const hours = Math.round(minutes / 60);

  if (hours >= 1) {
    return `~${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `~${minutes} min`;
}

export { pool };
