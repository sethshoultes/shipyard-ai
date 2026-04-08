/**
 * PageSpeed Insights API Client
 * Requirement: REQ-012 - Build PageSpeed Insights API client with 5-minute caching
 *
 * Provides functionality to fetch performance metrics from Google PageSpeed Insights API
 * with built-in caching to reduce API calls.
 */

/**
 * PageSpeed API response types
 */
export interface PageSpeedMetrics {
  performanceScore: number; // 0-100
  firstContentfulPaint: number; // milliseconds
  largestContentfulPaint: number; // milliseconds
  totalBlockingTime: number; // milliseconds
  cumulativeLayoutShift: number; // score
  speedIndex: number; // milliseconds
  timeToInteractive: number; // milliseconds
}

export interface PageSpeedResult {
  success: boolean;
  url: string;
  metrics?: PageSpeedMetrics;
  error?: string;
  cached: boolean;
  timestamp: Date;
}

/**
 * Cache entry structure
 */
interface CacheEntry {
  result: PageSpeedResult;
  expiresAt: number;
}

/**
 * In-memory cache for PageSpeed results
 * REQ-012: 5-minute caching
 */
const cache = new Map<string, CacheEntry>();

// Cache TTL: 5 minutes in milliseconds
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * PageSpeed API configuration
 */
const API_BASE_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * Strategy for PageSpeed analysis
 */
export type PageSpeedStrategy = 'mobile' | 'desktop';

/**
 * Normalize URL for caching
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Normalize to lowercase hostname, remove trailing slash
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/$/, '')}${parsed.search}`;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Generate cache key
 */
function getCacheKey(url: string, strategy: PageSpeedStrategy): string {
  return `${normalizeUrl(url)}:${strategy}`;
}

/**
 * Check if cached result is still valid
 */
function getCachedResult(cacheKey: string): PageSpeedResult | null {
  const entry = cache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    // Cache expired, remove entry
    cache.delete(cacheKey);
    return null;
  }

  return { ...entry.result, cached: true };
}

/**
 * Store result in cache
 */
function cacheResult(cacheKey: string, result: PageSpeedResult): void {
  cache.set(cacheKey, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): number {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
      cleared++;
    }
  }

  return cleared;
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Parse PageSpeed API response
 */
function parsePageSpeedResponse(data: unknown): PageSpeedMetrics {
  const response = data as {
    lighthouseResult?: {
      categories?: {
        performance?: {
          score?: number;
        };
      };
      audits?: {
        'first-contentful-paint'?: { numericValue?: number };
        'largest-contentful-paint'?: { numericValue?: number };
        'total-blocking-time'?: { numericValue?: number };
        'cumulative-layout-shift'?: { numericValue?: number };
        'speed-index'?: { numericValue?: number };
        'interactive'?: { numericValue?: number };
      };
    };
  };

  const lighthouse = response.lighthouseResult;
  const audits = lighthouse?.audits || {};

  return {
    performanceScore: Math.round((lighthouse?.categories?.performance?.score || 0) * 100),
    firstContentfulPaint: Math.round(audits['first-contentful-paint']?.numericValue || 0),
    largestContentfulPaint: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
    totalBlockingTime: Math.round(audits['total-blocking-time']?.numericValue || 0),
    cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
    speedIndex: Math.round(audits['speed-index']?.numericValue || 0),
    timeToInteractive: Math.round(audits['interactive']?.numericValue || 0),
  };
}

/**
 * Fetch PageSpeed Insights for a URL
 * REQ-012: PageSpeed API client with 5-minute caching
 *
 * @param url - URL to analyze
 * @param strategy - Analysis strategy (mobile or desktop)
 * @param skipCache - Skip cache lookup (force fresh fetch)
 * @returns PageSpeed analysis result
 */
export async function getPageSpeedMetrics(
  url: string,
  strategy: PageSpeedStrategy = 'mobile',
  skipCache: boolean = false
): Promise<PageSpeedResult> {
  const cacheKey = getCacheKey(url, strategy);

  // Check cache first (unless skipping)
  if (!skipCache) {
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      console.log(`[PageSpeed] Cache hit for ${url}`);
      return cachedResult;
    }
  }

  // Get API key from environment
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      url,
      error: 'GOOGLE_PAGESPEED_API_KEY environment variable is not set',
      cached: false,
      timestamp: new Date(),
    };
  }

  try {
    // Build API URL
    const params = new URLSearchParams({
      url: url,
      strategy: strategy,
      key: apiKey,
      category: 'performance',
    });

    const apiUrl = `${API_BASE_URL}?${params.toString()}`;

    console.log(`[PageSpeed] Fetching metrics for ${url} (${strategy})`);

    // Fetch from PageSpeed API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PageSpeed API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const metrics = parsePageSpeedResponse(data);

    const result: PageSpeedResult = {
      success: true,
      url,
      metrics,
      cached: false,
      timestamp: new Date(),
    };

    // Cache the result
    cacheResult(cacheKey, result);

    console.log(
      `[PageSpeed] Metrics fetched for ${url}: score=${metrics.performanceScore}`
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[PageSpeed] Error fetching metrics for ${url}:`, errorMessage);

    return {
      success: false,
      url,
      error: errorMessage,
      cached: false,
      timestamp: new Date(),
    };
  }
}

/**
 * Fetch PageSpeed metrics for multiple URLs
 * Processes in parallel with concurrency limit
 */
export async function getPageSpeedMetricsBatch(
  urls: string[],
  strategy: PageSpeedStrategy = 'mobile',
  concurrency: number = 3
): Promise<PageSpeedResult[]> {
  const results: PageSpeedResult[] = [];

  // Process in batches to limit concurrency
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url) => getPageSpeedMetrics(url, strategy))
    );
    results.push(...batchResults);
  }

  return results;
}
