/**
 * Health Score Calculation Algorithm
 * Requirement: REQ-011 - Design Health Score calculation algorithm
 *
 * Combines load time, uptime, and lighthouse score into a single health metric.
 * The algorithm weights each component to produce a score from 0-100.
 */

import { query } from './db';

/**
 * Health Score components with their weights
 */
export interface HealthScoreComponents {
  loadTime: number; // in milliseconds
  uptimePercent: number; // 0-100
  lighthouseScore: number; // 0-100
}

/**
 * Health Score result
 */
export interface HealthScoreResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    loadTimeScore: number;
    uptimeScore: number;
    lighthouseScore: number;
  };
  weights: typeof WEIGHTS;
  recommendations: string[];
}

/**
 * Weight configuration for health score components
 * REQ-011: Algorithm combining load time + uptime + lighthouse score
 *
 * Total weights must equal 1.0
 */
const WEIGHTS = {
  loadTime: 0.25, // 25% - Page load performance
  uptime: 0.35, // 35% - Availability is critical
  lighthouse: 0.40, // 40% - Overall performance quality
} as const;

/**
 * Load time thresholds (in milliseconds)
 * Based on Google's Core Web Vitals recommendations
 */
const LOAD_TIME_THRESHOLDS = {
  excellent: 1000, // < 1s = 100 score
  good: 2500, // < 2.5s = 80+ score
  needsImprovement: 4000, // < 4s = 50+ score
  poor: 10000, // < 10s = 20+ score
  // > 10s = 0 score
};

/**
 * Grade thresholds
 */
const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
};

/**
 * Calculate load time score (0-100)
 * Uses a curve that rewards fast sites and penalizes slow ones
 */
function calculateLoadTimeScore(loadTimeMs: number): number {
  if (loadTimeMs <= 0) return 0;

  if (loadTimeMs <= LOAD_TIME_THRESHOLDS.excellent) {
    return 100;
  }

  if (loadTimeMs <= LOAD_TIME_THRESHOLDS.good) {
    // Linear interpolation between 100 and 80
    const ratio =
      (loadTimeMs - LOAD_TIME_THRESHOLDS.excellent) /
      (LOAD_TIME_THRESHOLDS.good - LOAD_TIME_THRESHOLDS.excellent);
    return Math.round(100 - ratio * 20);
  }

  if (loadTimeMs <= LOAD_TIME_THRESHOLDS.needsImprovement) {
    // Linear interpolation between 80 and 50
    const ratio =
      (loadTimeMs - LOAD_TIME_THRESHOLDS.good) /
      (LOAD_TIME_THRESHOLDS.needsImprovement - LOAD_TIME_THRESHOLDS.good);
    return Math.round(80 - ratio * 30);
  }

  if (loadTimeMs <= LOAD_TIME_THRESHOLDS.poor) {
    // Linear interpolation between 50 and 20
    const ratio =
      (loadTimeMs - LOAD_TIME_THRESHOLDS.needsImprovement) /
      (LOAD_TIME_THRESHOLDS.poor - LOAD_TIME_THRESHOLDS.needsImprovement);
    return Math.round(50 - ratio * 30);
  }

  // Beyond poor threshold, score drops to 0
  const ratio = Math.min(
    (loadTimeMs - LOAD_TIME_THRESHOLDS.poor) / LOAD_TIME_THRESHOLDS.poor,
    1
  );
  return Math.max(0, Math.round(20 - ratio * 20));
}

/**
 * Calculate uptime score
 * Uptime is critical - even small drops have significant impact
 */
function calculateUptimeScore(uptimePercent: number): number {
  // Clamp to valid range
  const uptime = Math.max(0, Math.min(100, uptimePercent));

  // Non-linear scoring that heavily penalizes downtime
  // 99.9% uptime = 99.9 score
  // 99% uptime = 99 score
  // 95% uptime = 90 score
  // 90% uptime = 70 score
  // Below 90% drops rapidly

  if (uptime >= 99) {
    return uptime;
  }

  if (uptime >= 95) {
    // 95-99% maps to 85-99
    return 85 + ((uptime - 95) / 4) * 14;
  }

  if (uptime >= 90) {
    // 90-95% maps to 70-85
    return 70 + ((uptime - 90) / 5) * 15;
  }

  // Below 90% drops linearly to 0
  return Math.max(0, (uptime / 90) * 70);
}

/**
 * Normalize lighthouse score (already 0-100)
 */
function normalizeLighthouseScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/**
 * Get grade from score
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(
  loadTimeScore: number,
  uptimeScore: number,
  lighthouseScore: number
): string[] {
  const recommendations: string[] = [];

  // Load time recommendations
  if (loadTimeScore < 50) {
    recommendations.push(
      'Critical: Page load time is very slow. Consider optimizing images, enabling compression, and using a CDN.'
    );
  } else if (loadTimeScore < 80) {
    recommendations.push(
      'Consider reducing page load time by optimizing resources and leveraging browser caching.'
    );
  }

  // Uptime recommendations
  if (uptimeScore < 95) {
    recommendations.push(
      'Critical: Site availability is below acceptable levels. Review server infrastructure and monitoring.'
    );
  } else if (uptimeScore < 99) {
    recommendations.push(
      'Improve uptime by implementing redundancy, load balancing, or upgrading hosting.'
    );
  }

  // Lighthouse recommendations
  if (lighthouseScore < 50) {
    recommendations.push(
      'Critical: Performance score is poor. Run a Lighthouse audit and address critical issues.'
    );
  } else if (lighthouseScore < 80) {
    recommendations.push(
      'Review Lighthouse report for opportunities to improve Core Web Vitals.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job! Your site is performing well across all metrics.');
  }

  return recommendations;
}

/**
 * Calculate Health Score
 * REQ-011: Algorithm combining load time + uptime + lighthouse score
 *
 * @param components - Health score input components
 * @returns Health score result with grade and recommendations
 */
export function calculateHealthScore(
  components: HealthScoreComponents
): HealthScoreResult {
  // Calculate individual scores
  const loadTimeScore = calculateLoadTimeScore(components.loadTime);
  const uptimeScore = calculateUptimeScore(components.uptimePercent);
  const lighthouseScore = normalizeLighthouseScore(components.lighthouseScore);

  // Calculate weighted score
  const weightedScore =
    loadTimeScore * WEIGHTS.loadTime +
    uptimeScore * WEIGHTS.uptime +
    lighthouseScore * WEIGHTS.lighthouse;

  // Round to 2 decimal places
  const score = Math.round(weightedScore * 100) / 100;

  // Get grade and recommendations
  const grade = getGrade(score);
  const recommendations = generateRecommendations(
    loadTimeScore,
    uptimeScore,
    lighthouseScore
  );

  return {
    score,
    grade,
    components: {
      loadTimeScore: Math.round(loadTimeScore * 100) / 100,
      uptimeScore: Math.round(uptimeScore * 100) / 100,
      lighthouseScore: Math.round(lighthouseScore * 100) / 100,
    },
    weights: WEIGHTS,
    recommendations,
  };
}

/**
 * Calculate and store health score for a site
 *
 * @param siteId - Site ID to calculate score for
 * @param components - Health score components
 * @returns Calculated health score result
 */
export async function calculateAndStoreHealthScore(
  siteId: string,
  components: HealthScoreComponents
): Promise<HealthScoreResult> {
  const result = calculateHealthScore(components);

  // Store in metrics table
  await query(
    `INSERT INTO metrics (site_id, health_score, load_time, uptime_percent, lighthouse_score)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      siteId,
      result.score,
      components.loadTime,
      components.uptimePercent,
      components.lighthouseScore,
    ]
  );

  console.log(
    `[HealthScore] Calculated for site ${siteId}: ${result.score} (${result.grade})`
  );

  return result;
}

/**
 * Get latest health score for a site
 *
 * @param siteId - Site ID to get score for
 * @returns Latest health score or null if not found
 */
export async function getLatestHealthScore(
  siteId: string
): Promise<HealthScoreResult | null> {
  const result = await query<{
    health_score: number;
    load_time: number;
    uptime_percent: number;
    lighthouse_score: number;
  }>(
    `SELECT health_score, load_time, uptime_percent, lighthouse_score
     FROM metrics
     WHERE site_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [siteId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return calculateHealthScore({
    loadTime: row.load_time,
    uptimePercent: row.uptime_percent,
    lighthouseScore: row.lighthouse_score,
  });
}

/**
 * Get health score history for a site
 *
 * @param siteId - Site ID
 * @param limit - Maximum number of records to return
 * @returns Array of health scores with timestamps
 */
export async function getHealthScoreHistory(
  siteId: string,
  limit: number = 30
): Promise<Array<{ score: number; timestamp: Date }>> {
  const result = await query<{
    health_score: number;
    created_at: Date;
  }>(
    `SELECT health_score, created_at
     FROM metrics
     WHERE site_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [siteId, limit]
  );

  return result.rows.map((row) => ({
    score: row.health_score,
    timestamp: row.created_at,
  }));
}
