/**
 * Anchor — PageSpeed Insights API Wrapper
 *
 * Per decisions.md:
 * - Weekly PageSpeed runs (not daily)
 * - Rate limit handling with exponential backoff
 * - Cache results aggressively (6 days)
 *
 * Cites: EMDASH-GUIDE.md Section 6 for external API patterns
 */

import type {
  PageSpeedConfig,
  PageSpeedResult,
  CoreWebVitals,
  PageSpeedAPIResponse,
} from "./types";

const PAGESPEED_API_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// In-memory cache for rate limit compliance
// Key: url, Value: { result, timestamp }
const cache = new Map<string, { result: PageSpeedResult; timestamp: number }>();
const CACHE_TTL_MS = 6 * 24 * 60 * 60 * 1000; // 6 days in milliseconds

/**
 * Get performance score for a URL
 *
 * Returns desktop and mobile scores plus Core Web Vitals
 * Handles rate limits with exponential backoff
 *
 * @param url - The URL to analyze
 * @param apiKey - Google PageSpeed API key
 * @returns PageSpeedResult with scores and vitals
 */
export async function getPerformanceScore(
  url: string,
  apiKey: string
): Promise<PageSpeedResult> {
  // Check cache first
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  // Fetch both desktop and mobile scores
  const [desktopResult, mobileResult] = await Promise.all([
    fetchPageSpeedScore(url, apiKey, "desktop"),
    fetchPageSpeedScore(url, apiKey, "mobile"),
  ]);

  const result: PageSpeedResult = {
    date: new Date().toISOString().split("T")[0],
    desktop: desktopResult.score,
    mobile: mobileResult.score,
    vitals: mobileResult.vitals, // Use mobile vitals as primary
  };

  // Update cache
  cache.set(url, { result, timestamp: Date.now() });

  return result;
}

/**
 * Fetch PageSpeed score for a single strategy
 *
 * @param url - The URL to analyze
 * @param apiKey - Google PageSpeed API key
 * @param strategy - 'desktop' or 'mobile'
 * @returns Score and Core Web Vitals
 */
async function fetchPageSpeedScore(
  url: string,
  apiKey: string,
  strategy: "desktop" | "mobile"
): Promise<{ score: number; vitals: CoreWebVitals }> {
  const params = new URLSearchParams({
    url,
    key: apiKey,
    strategy,
    category: "performance",
  });

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`);

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        attempts++;
        if (attempts < maxAttempts) {
          const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
          console.log(
            `[PageSpeed] Rate limited, waiting ${waitTime / 1000}s before retry ${attempts}/${maxAttempts}`
          );
          await sleep(waitTime);
          continue;
        }
        throw new Error("PageSpeed API rate limit exceeded after retries");
      }

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`);
      }

      const data: PageSpeedAPIResponse = await response.json();

      const score = Math.round(
        (data.lighthouseResult?.categories?.performance?.score || 0) * 100
      );
      const audits = data.lighthouseResult?.audits || {};

      const vitals: CoreWebVitals = {
        lcp: Math.round(
          audits["largest-contentful-paint"]?.numericValue || 0
        ),
        fid: Math.round(audits["first-input-delay"]?.numericValue || 0),
        cls: parseFloat(
          (audits["cumulative-layout-shift"]?.numericValue || 0).toFixed(3)
        ),
        fcp: Math.round(audits["first-contentful-paint"]?.numericValue || 0),
        ttfb: Math.round(audits["server-response-time"]?.numericValue || 0),
      };

      return { score, vitals };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempts++;

      if (attempts < maxAttempts) {
        const waitTime = Math.pow(2, attempts) * 1000;
        console.log(
          `[PageSpeed] Error: ${lastError.message}, retrying in ${waitTime / 1000}s`
        );
        await sleep(waitTime);
      }
    }
  }

  throw lastError || new Error("PageSpeed API failed after retries");
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Check if URL was recently analyzed
 *
 * @param url - The URL to check
 * @returns true if analyzed within cache TTL
 */
export function wasRecentlyAnalyzed(url: string): boolean {
  const cached = cache.get(url);
  return cached !== undefined && Date.now() - cached.timestamp < CACHE_TTL_MS;
}

/**
 * Sleep utility for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse a score into a human-readable rating
 */
export function getScoreRating(score: number): "good" | "needs-improvement" | "poor" {
  if (score >= 90) return "good";
  if (score >= 50) return "needs-improvement";
  return "poor";
}

/**
 * Get optimization tip based on lowest-scoring metric
 * Per decisions.md REQ-046: 10 hardcoded tips, no recommendation engine
 */
export function getOptimizationTip(
  vitals: CoreWebVitals,
  mobileScore: number,
  desktopScore: number
): string {
  const tips = [
    "Consider compressing images to WebP format for faster load times.",
    "Enable browser caching to reduce repeat visitor load times.",
    "Minimize render-blocking JavaScript by deferring non-critical scripts.",
    "Use a content delivery network (CDN) to serve assets faster globally.",
    "Optimize your largest contentful paint by preloading key resources.",
    "Reduce cumulative layout shift by setting explicit image dimensions.",
    "Improve first contentful paint by inlining critical CSS.",
    "Consider lazy-loading images below the fold.",
    "Minimize third-party script impact on page performance.",
    "Ensure text remains visible during webfont load with font-display.",
  ];

  // Pick tip based on weakest area
  if (vitals.lcp > 2500) return tips[4]; // LCP optimization
  if (vitals.cls > 0.1) return tips[5]; // CLS optimization
  if (vitals.fcp > 1800) return tips[6]; // FCP optimization
  if (mobileScore < desktopScore - 20) return tips[0]; // Mobile-specific (images)
  if (vitals.ttfb > 600) return tips[3]; // Server/CDN optimization

  // Default to a general tip based on overall score
  const tipIndex = Math.floor(mobileScore / 10) % tips.length;
  return tips[tipIndex];
}
