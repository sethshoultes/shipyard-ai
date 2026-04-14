/**
 * RANK — Category Configuration
 *
 * V1 Scope: Exactly 3 categories per decisions.md line 55.
 *
 * "Rankings require cohort density. 9 categories at launch = 'V2 wearing V1's clothes.'
 * 'You have density in maybe 3. Ship those.'" — Elon Musk
 *
 * These values are intentionally locked for V1. Expansion to additional
 * categories is V2 scope and will require founder approval.
 *
 * Requirements:
 *   REQ-CONFIG-001: categories.ts
 *   REQ-BL-003: V1 category scope
 */

/**
 * V1 locked categories.
 * Do NOT add categories without founder approval and cohort density analysis.
 *
 * Expansion criteria per decisions.md:
 *   - 500+ businesses per category in target markets
 *   - Sufficient geographic diversity for dynamic cohort sizing
 *
 * @see decisions.md line 55: "3 categories: restaurants, home_services, retail"
 */
export const RANK_CATEGORIES = [
  "restaurants",
  "home_services",
  "retail",
] as const;

/**
 * Type representing a valid RANK category.
 * Used for type-safe category handling throughout the codebase.
 */
export type RankCategory = (typeof RANK_CATEGORIES)[number];

/**
 * Human-readable category labels for UI display.
 * Used in cohort labels, emails, and dashboard components.
 */
export const CATEGORY_LABELS: Record<RankCategory, string> = {
  restaurants: "Restaurants",
  home_services: "Home Services",
  retail: "Retail",
} as const;

/**
 * Category descriptions for onboarding and help text.
 * Brief explanations of what businesses fall into each category.
 */
export const CATEGORY_DESCRIPTIONS: Record<RankCategory, string> = {
  restaurants:
    "Restaurants, cafes, bars, food trucks, and other food service establishments",
  home_services:
    "Plumbers, electricians, HVAC, landscaping, cleaning, and other home service providers",
  retail:
    "Retail stores, boutiques, gift shops, and brick-and-mortar retail establishments",
} as const;

/**
 * Type guard to check if a string is a valid RANK category.
 *
 * @param category - The string to validate
 * @returns True if the category is valid for RANK V1
 *
 * @example
 * ```ts
 * const userCategory = "restaurants";
 * if (isValidCategory(userCategory)) {
 *   // TypeScript knows userCategory is RankCategory here
 *   processRanking(userCategory);
 * }
 * ```
 */
export function isValidCategory(category: string): category is RankCategory {
  return RANK_CATEGORIES.includes(category as RankCategory);
}

/**
 * Get the human-readable label for a category.
 *
 * @param category - The category to get the label for
 * @returns The human-readable label, or the original string if invalid
 */
export function getCategoryLabel(category: string): string {
  if (isValidCategory(category)) {
    return CATEGORY_LABELS[category];
  }
  return category;
}

/**
 * Format a category for display in cohort labels.
 * Converts snake_case to Title Case.
 *
 * @param category - The category to format
 * @returns Formatted category name (e.g., "Home Services")
 *
 * @example
 * ```ts
 * formatCategoryForCohort("home_services") // "Home Services"
 * formatCategoryForCohort("restaurants")   // "Restaurants"
 * ```
 */
export function formatCategoryForCohort(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
