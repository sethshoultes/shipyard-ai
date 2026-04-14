/**
 * RANK — Cohort Configuration
 *
 * Dynamic cohort sizing rules per decisions.md line 103.
 *
 * "Most category/location combos fail the n>=10 threshold. Fixed category/city
 * combos fail at power-law distribution." — decisions.md
 *
 * Solution: Hierarchical geography expansion until we hit minimum cohort size.
 *
 * Requirements:
 *   REQ-CONFIG-002: cohorts.ts
 *   REQ-BL-002: Dynamic cohort hierarchy
 */

/**
 * Minimum number of businesses required for a valid cohort.
 *
 * Per decisions.md line 103:
 *   "If state-level < 10, show 'Insufficient data' instead of rank —
 *   never show garbage rankings."
 *
 * This threshold ensures:
 *   - Statistical significance in percentile calculations
 *   - Meaningful competitive context (not comparing against 2-3 businesses)
 *   - Privacy protection (individual businesses not easily identifiable)
 */
export const MIN_COHORT_SIZE = 10;

/**
 * Geographic hierarchy levels for cohort expansion.
 * Order matters: primary -> fallback 1 -> fallback 2
 *
 * @see decisions.md line 103:
 *   "city -> metro -> state. If state N < 10, show 'Insufficient data'"
 */
export const GEOGRAPHY_HIERARCHY = ["city", "metro", "state"] as const;

/**
 * Type representing a geographic level in the cohort hierarchy.
 */
export type GeographyLevel = (typeof GEOGRAPHY_HIERARCHY)[number];

/**
 * Configuration for cohort sizing and fallback behavior.
 */
export interface CohortConfig {
  /**
   * Minimum businesses required for a valid cohort.
   * Below this threshold, the cohort is considered insufficient.
   */
  minSize: number;

  /**
   * Geographic levels to try, in order of preference.
   * Algorithm tries each level until minSize is met.
   */
  geographyFallback: readonly GeographyLevel[];
}

/**
 * Default cohort configuration for RANK V1.
 *
 * This configuration is locked for V1. Changes require:
 *   1. Analysis of cohort density data
 *   2. Founder approval
 *   3. Update to REQUIREMENTS.md
 */
export const COHORT_CONFIG: CohortConfig = {
  minSize: MIN_COHORT_SIZE,
  geographyFallback: GEOGRAPHY_HIERARCHY,
} as const;

/**
 * Human-readable labels for cohort level indicators.
 * Used in UI to explain which geographic level the cohort uses.
 */
export const COHORT_LEVEL_LABELS: Record<GeographyLevel, string> = {
  city: "City",
  metro: "Metro Area",
  state: "Statewide",
} as const;

/**
 * Messages shown when cohort expands to a wider geography.
 * Helps users understand why their cohort is larger than expected.
 */
export const COHORT_EXPANSION_MESSAGES: Record<GeographyLevel, string> = {
  city: "", // No message needed for primary level
  metro:
    "Comparing across your metro area because your city has fewer than 10 similar businesses.",
  state:
    "Comparing statewide because your metro area has fewer than 10 similar businesses.",
} as const;

/**
 * Message shown when no valid cohort can be formed (all levels < 10).
 *
 * Per decisions.md: "Never show garbage rankings."
 */
export const INSUFFICIENT_DATA_MESSAGE =
  "We don't have enough similar businesses in your area to calculate a meaningful ranking yet. Keep building your presence — rankings will appear as more businesses join.";

/**
 * Determines the effective cohort level based on business counts.
 *
 * @param cityCohortSize - Number of businesses at city level
 * @param metroCohortSize - Number of businesses at metro level
 * @param stateCohortSize - Number of businesses at state level
 * @returns The appropriate cohort level, or null if insufficient data
 *
 * @example
 * ```ts
 * // City has 15 businesses — use city level
 * determineEffectiveCohortLevel(15, 25, 100) // "city"
 *
 * // City has 5, metro has 12 — expand to metro
 * determineEffectiveCohortLevel(5, 12, 100) // "metro"
 *
 * // All levels under 10 — insufficient data
 * determineEffectiveCohortLevel(3, 5, 8) // null
 * ```
 */
export function determineEffectiveCohortLevel(
  cityCohortSize: number,
  metroCohortSize: number | null,
  stateCohortSize: number
): GeographyLevel | null {
  // Try city first
  if (cityCohortSize >= MIN_COHORT_SIZE) {
    return "city";
  }

  // Try metro if available
  if (metroCohortSize !== null && metroCohortSize >= MIN_COHORT_SIZE) {
    return "metro";
  }

  // Try state
  if (stateCohortSize >= MIN_COHORT_SIZE) {
    return "state";
  }

  // Insufficient data at all levels
  return null;
}

/**
 * Builds a human-readable cohort label.
 *
 * @param level - The geographic level being used
 * @param location - The location name (city, metro, or state)
 * @param category - The business category
 * @returns Formatted cohort label for display
 *
 * @example
 * ```ts
 * buildCohortLabel("city", "Austin", "restaurants")
 * // "Austin Restaurants"
 *
 * buildCohortLabel("metro", "Austin", "home_services")
 * // "Austin Metro Home Services"
 *
 * buildCohortLabel("state", "Texas", "retail")
 * // "Texas Retail"
 * ```
 */
export function buildCohortLabel(
  level: GeographyLevel,
  location: string,
  category: string
): string {
  // Format category: snake_case to Title Case
  const formattedCategory = category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  switch (level) {
    case "city":
      return `${location} ${formattedCategory}`;
    case "metro":
      return `${location} Metro ${formattedCategory}`;
    case "state":
      return `${location} ${formattedCategory}`;
  }
}

/**
 * Calculates percentile from rank and cohort size.
 *
 * Formula: 100 - ((rank - 1) / cohort_size * 100)
 *   - Rank 1 of 100 = 100th percentile (top)
 *   - Rank 50 of 100 = 51st percentile
 *   - Rank 100 of 100 = 1st percentile (bottom)
 *
 * @param rank - Position in cohort (1 = best)
 * @param cohortSize - Total businesses in cohort
 * @returns Percentile value (0-100)
 */
export function calculatePercentile(rank: number, cohortSize: number): number {
  if (cohortSize <= 0 || rank <= 0) {
    return 0;
  }

  const percentile = 100 - ((rank - 1) / cohortSize) * 100;
  return Math.round(percentile * 100) / 100; // Round to 2 decimal places
}

/**
 * Gets the appropriate explanation for the current cohort level.
 *
 * @param level - The geographic level being used
 * @returns Explanation message, or empty string for city level
 */
export function getCohortExpansionExplanation(level: GeographyLevel): string {
  return COHORT_EXPANSION_MESSAGES[level];
}
