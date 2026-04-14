/**
 * RANK Configuration — Barrel Export
 *
 * Central export point for all RANK configuration.
 * Import from here rather than individual files.
 *
 * @example
 * ```ts
 * import {
 *   RANK_CATEGORIES,
 *   isValidCategory,
 *   MIN_COHORT_SIZE,
 *   COHORT_CONFIG,
 *   calculatePercentile,
 * } from "@/features/rank/config";
 * ```
 */

// ─── Categories ───────────────────────────────────────────────────────────────
export {
  RANK_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  isValidCategory,
  getCategoryLabel,
  formatCategoryForCohort,
  type RankCategory,
} from "./categories";

// ─── Cohorts ──────────────────────────────────────────────────────────────────
export {
  MIN_COHORT_SIZE,
  GEOGRAPHY_HIERARCHY,
  COHORT_CONFIG,
  COHORT_LEVEL_LABELS,
  COHORT_EXPANSION_MESSAGES,
  INSUFFICIENT_DATA_MESSAGE,
  determineEffectiveCohortLevel,
  buildCohortLabel,
  calculatePercentile,
  getCohortExpansionExplanation,
  type GeographyLevel,
  type CohortConfig,
} from "./cohorts";

// ─── Metro Areas ──────────────────────────────────────────────────────────────
export {
  deriveMetroFromCity,
  getCitiesInMetro,
  getAllMetros,
} from "./metros";

// ─── Algorithm Weights ────────────────────────────────────────────────────────
/**
 * Algorithm weights per decisions.md line 115.
 *
 * These weights are the core of RANK's competitive positioning:
 *   - Commodity signals (review count, rating): widely available data
 *   - Proprietary signals (response rate, time): LocalGenius moat
 *
 * "Review counts are commodity. Response times from LocalGenius platform
 * are the real moat." — decisions.md
 */
export const ALGORITHM_WEIGHTS = {
  /**
   * Review count: 25%
   * Commodity signal from GBP API. Volume indicator.
   * Higher review count = more established business, more trust signals.
   */
  REVIEW_COUNT: 0.25,

  /**
   * Average rating: 25%
   * Commodity signal from GBP API. Quality perception.
   * Direct customer satisfaction indicator.
   */
  AVG_RATING: 0.25,

  /**
   * Review velocity: 20%
   * Calculated signal. Growth momentum indicator.
   * Reviews per 30 days — shows business is active and generating engagement.
   */
  REVIEW_VELOCITY: 0.20,

  /**
   * Response rate: 15%
   * PROPRIETARY LocalGenius signal. Engagement metric.
   * Percentage of reviews that received a response.
   */
  RESPONSE_RATE: 0.15,

  /**
   * Response time: 15%
   * PROPRIETARY LocalGenius signal. Customer service indicator.
   * Average hours to respond — lower is better.
   */
  RESPONSE_TIME: 0.15,
} as const;

/**
 * Validates that algorithm weights sum to 1.0.
 * Used in tests and startup validation.
 */
export function validateAlgorithmWeights(): boolean {
  const sum = Object.values(ALGORITHM_WEIGHTS).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.0001; // Allow for floating point precision
}

// ─── Response Time Scoring ────────────────────────────────────────────────────
/**
 * Maximum response time (hours) that still receives a score > 0.
 * 72 hours (3 days) = 0 score, 0 hours = 100 score.
 */
export const MAX_RESPONSE_TIME_HOURS = 72;

/**
 * Convert response time in hours to a 0-100 score.
 * Lower response time = higher score (inverted scale).
 *
 * @param hours - Average response time in hours
 * @returns Score from 0-100 (100 = immediate, 0 = 72+ hours)
 */
export function scoreResponseTime(hours: number | null | undefined): number {
  if (hours === null || hours === undefined) {
    return 50; // Default for unknown
  }
  const score = 100 - (hours / MAX_RESPONSE_TIME_HOURS) * 100;
  return Math.max(0, Math.min(100, score));
}
