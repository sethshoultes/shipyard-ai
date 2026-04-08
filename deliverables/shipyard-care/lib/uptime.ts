/**
 * Uptime Monitoring Module
 * Requirement: REQ-013 - Create uptime monitoring ping check mechanism
 *
 * Provides functionality to check website availability and track response times.
 */

import { query } from './db';

/**
 * Uptime check result
 */
export interface UptimeCheckResult {
  url: string;
  isUp: boolean;
  statusCode: number | null;
  responseTime: number; // milliseconds
  error?: string;
  timestamp: Date;
}

/**
 * Site uptime statistics
 */
export interface UptimeStats {
  siteId: string;
  url: string;
  uptimePercent: number;
  averageResponseTime: number;
  totalChecks: number;
  successfulChecks: number;
  lastCheck: Date | null;
  lastStatus: 'up' | 'down' | 'unknown';
}

/**
 * Check configuration
 */
const CHECK_CONFIG = {
  timeout: 10000, // 10 seconds
  followRedirects: true,
  maxRedirects: 5,
  userAgent: 'Shipyard-Pulse-Uptime-Monitor/1.0',
};

/**
 * HTTP status codes considered as "up"
 */
const SUCCESS_STATUS_CODES = [200, 201, 202, 204, 301, 302, 303, 307, 308];

/**
 * Perform an uptime check for a URL
 * REQ-013: Uptime check with response time tracking
 *
 * @param url - URL to check
 * @returns Uptime check result with response time
 */
export async function checkUptime(url: string): Promise<UptimeCheckResult> {
  const startTime = Date.now();
  const timestamp = new Date();

  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        url,
        isUp: false,
        statusCode: null,
        responseTime: 0,
        error: 'Invalid protocol. Only HTTP and HTTPS are supported.',
        timestamp,
      };
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to minimize data transfer
        signal: controller.signal,
        redirect: CHECK_CONFIG.followRedirects ? 'follow' : 'manual',
        headers: {
          'User-Agent': CHECK_CONFIG.userAgent,
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const isUp = SUCCESS_STATUS_CODES.includes(response.status);

      return {
        url,
        isUp,
        statusCode: response.status,
        responseTime,
        timestamp,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // Handle specific fetch errors
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return {
            url,
            isUp: false,
            statusCode: null,
            responseTime,
            error: `Request timeout after ${CHECK_CONFIG.timeout}ms`,
            timestamp,
          };
        }

        return {
          url,
          isUp: false,
          statusCode: null,
          responseTime,
          error: fetchError.message,
          timestamp,
        };
      }

      return {
        url,
        isUp: false,
        statusCode: null,
        responseTime,
        error: 'Unknown fetch error',
        timestamp,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      url,
      isUp: false,
      statusCode: null,
      responseTime,
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Perform uptime check and store result in database
 *
 * @param siteId - Site ID to check
 * @param url - URL to check
 * @returns Uptime check result
 */
export async function checkAndRecordUptime(
  siteId: string,
  url: string
): Promise<UptimeCheckResult> {
  const result = await checkUptime(url);

  // Store result in database
  await query(
    `INSERT INTO uptime_checks (site_id, url, is_up, status_code, response_time, error, checked_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      siteId,
      url,
      result.isUp,
      result.statusCode,
      result.responseTime,
      result.error || null,
      result.timestamp,
    ]
  );

  console.log(
    `[Uptime] Check completed for ${url}: ${result.isUp ? 'UP' : 'DOWN'} (${result.responseTime}ms)`
  );

  return result;
}

/**
 * Get uptime statistics for a site
 *
 * @param siteId - Site ID to get stats for
 * @param periodHours - Time period in hours (default: 24)
 * @returns Uptime statistics
 */
export async function getUptimeStats(
  siteId: string,
  periodHours: number = 24
): Promise<UptimeStats | null> {
  const result = await query<{
    site_id: string;
    url: string;
    total_checks: string;
    successful_checks: string;
    avg_response_time: string;
    last_check: Date;
    last_is_up: boolean;
  }>(
    `SELECT
      site_id,
      url,
      COUNT(*) as total_checks,
      SUM(CASE WHEN is_up THEN 1 ELSE 0 END) as successful_checks,
      AVG(response_time) as avg_response_time,
      MAX(checked_at) as last_check,
      (SELECT is_up FROM uptime_checks uc2
       WHERE uc2.site_id = uptime_checks.site_id
       ORDER BY checked_at DESC LIMIT 1) as last_is_up
    FROM uptime_checks
    WHERE site_id = $1 AND checked_at > NOW() - INTERVAL '${periodHours} hours'
    GROUP BY site_id, url`,
    [siteId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const totalChecks = parseInt(row.total_checks, 10);
  const successfulChecks = parseInt(row.successful_checks, 10);

  return {
    siteId: row.site_id,
    url: row.url,
    uptimePercent: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
    averageResponseTime: parseFloat(row.avg_response_time) || 0,
    totalChecks,
    successfulChecks,
    lastCheck: row.last_check,
    lastStatus: row.last_is_up ? 'up' : 'down',
  };
}

/**
 * Check uptime for multiple sites in parallel
 *
 * @param sites - Array of sites with id and url
 * @param concurrency - Maximum concurrent checks
 * @returns Array of uptime check results
 */
export async function checkMultipleSites(
  sites: Array<{ id: string; url: string }>,
  concurrency: number = 5
): Promise<UptimeCheckResult[]> {
  const results: UptimeCheckResult[] = [];

  // Process in batches to limit concurrency
  for (let i = 0; i < sites.length; i += concurrency) {
    const batch = sites.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((site) => checkAndRecordUptime(site.id, site.url))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Get sites that need uptime checking
 * Returns active sites that haven't been checked in the specified interval
 *
 * @param intervalMinutes - Minimum minutes since last check
 * @returns Array of sites needing checks
 */
export async function getSitesNeedingCheck(
  intervalMinutes: number = 5
): Promise<Array<{ id: string; url: string }>> {
  const result = await query<{ id: string; url: string }>(
    `SELECT s.id, s.url
     FROM sites s
     WHERE s.status = 'active'
     AND (
       NOT EXISTS (
         SELECT 1 FROM uptime_checks uc
         WHERE uc.site_id = s.id
         AND uc.checked_at > NOW() - INTERVAL '${intervalMinutes} minutes'
       )
     )
     ORDER BY s.created_at
     LIMIT 100`
  );

  return result.rows;
}
