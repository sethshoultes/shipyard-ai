/**
 * slugify - String normalization utility
 *
 * Converts an input string to a URL-friendly slug by:
 * - Converting to lowercase
 * - Replacing non-alphanumeric characters with hyphens
 * - Trimming leading and trailing hyphens
 * - Collapsing consecutive hyphens into single hyphens
 *
 * @param input - The raw string to normalize
 * @returns A clean slug string safe for URLs and identifiers
 */
export function slugify(input: string): string {
  const lower = input.toLowerCase();
  const hyphenated = lower.replace(/[^a-z0-9]+/g, '-');
  const trimmed = hyphenated.replace(/^-+|-+$/g, '');
  const collapsed = trimmed.replace(/--+/g, '-');
  return collapsed;
}
