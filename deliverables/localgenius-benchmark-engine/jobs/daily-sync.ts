/**
 * RANK — Daily GBP Sync Job
 *
 * Pulls review metrics from Google Business Profile API daily.
 * Implements rate limit mitigations from decisions.md line 267.
 *
 * Requirements:
 *   REQ-API-003: GBP daily sync
 *   REQ-API-004: Rate limit handling
 *
 * Rate Limit Mitigations (from decisions.md line 267, 291):
 *   - 24-hour minimum cache (skip if last sync < 24h ago)
 *   - Exponential backoff (1s initial, 5 retries, 5min max)
 *   - Staggered 6-hour sync window (4am-10am UTC)
 *   - Priority queue: active daily, inactive weekly
 */

import { db } from "@/lib/db";
import {
  businessSettings,
  businessMetrics,
  businesses,
  reviews,
} from "@/db/schema";
import { eq, and, lt, sql, desc, count } from "drizzle-orm";
import { getAccessToken, syncReviews } from "@/services/google-business";
import {
  markConnectionError,
  preserveLastKnownRank,
} from "../api/auth/google-oauth";
import { isValidCategory, type RankCategory } from "../config/categories";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SyncResult {
  businessId: string;
  status: "synced" | "skipped" | "failed";
  reason?: string;
  metrics?: BusinessMetricsSnapshot;
}

export interface BusinessMetricsSnapshot {
  reviewCount: number;
  avgRating: number;
  reviewVelocity: number;
  responseRate: number;
  avgResponseTimeHours: number | null;
}

export interface DailySyncSummary {
  synced: number;
  skipped: number;
  failed: number;
  duration: number;
  results: SyncResult[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Minimum hours between syncs for a single business.
 * Per decisions.md: "24hr cache minimum"
 */
const MIN_SYNC_INTERVAL_HOURS = 24;

/**
 * Exponential backoff configuration.
 * Per decisions.md: "1s initial, 5 retries, 5min max"
 */
const BACKOFF_CONFIG = {
  initialDelayMs: 1000,
  maxRetries: 5,
  maxDelayMs: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Delay between API calls to avoid rate limits.
 * Per decisions.md: "1-second delay between API calls"
 */
const INTER_CALL_DELAY_MS = 1000;

/**
 * Days of inactivity before switching to weekly sync.
 * Per decisions.md: "active businesses (activity in 7 days) sync daily"
 */
const ACTIVE_THRESHOLD_DAYS = 7;

/**
 * Days between syncs for inactive businesses.
 * Per decisions.md: "inactive sync weekly"
 */
const INACTIVE_SYNC_INTERVAL_DAYS = 7;

// ─── Sync Job ─────────────────────────────────────────────────────────────────

/**
 * Run daily sync for all businesses with Google connections.
 * Called by cron: POST /api/cron/rank/daily-sync
 *
 * @returns Summary of sync results
 */
export async function runDailySync(): Promise<DailySyncSummary> {
  const startTime = Date.now();
  const results: SyncResult[] = [];

  // Get all businesses needing sync, ordered by last sync (oldest first)
  const businessesToSync = await getBusinessesNeedingSync();

  for (const business of businessesToSync) {
    // Inter-call delay to avoid rate limits
    if (results.length > 0) {
      await sleep(INTER_CALL_DELAY_MS);
    }

    const result = await syncBusiness(business);
    results.push(result);
  }

  return {
    synced: results.filter((r) => r.status === "synced").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    duration: Date.now() - startTime,
    results,
  };
}

/**
 * Get businesses that need syncing, ordered by priority.
 *
 * Priority order:
 *   1. Active businesses not synced in 24h (daily sync)
 *   2. Inactive businesses not synced in 7 days (weekly sync)
 */
async function getBusinessesNeedingSync(): Promise<BusinessToSync[]> {
  const now = new Date();
  const dailyCutoff = new Date(
    now.getTime() - MIN_SYNC_INTERVAL_HOURS * 60 * 60 * 1000
  );
  const weeklyCutoff = new Date(
    now.getTime() - INACTIVE_SYNC_INTERVAL_DAYS * 24 * 60 * 60 * 1000
  );
  const activeCutoff = new Date(
    now.getTime() - ACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  );

  // Get all businesses with active Google connections
  const connections = await db
    .select({
      businessId: businessSettings.businessId,
      organizationId: businessSettings.organizationId,
      lastSyncedAt: businessSettings.lastSyncedAt,
    })
    .from(businessSettings)
    .where(
      and(
        eq(businessSettings.platform, "google_business"),
        eq(businessSettings.connectionStatus, "active")
      )
    )
    .orderBy(businessSettings.lastSyncedAt);

  // Get business details and determine activity status
  const businessesToSync: BusinessToSync[] = [];

  for (const conn of connections) {
    // Get business info
    const [businessInfo] = await db
      .select({
        id: businesses.id,
        vertical: businesses.vertical,
        city: businesses.city,
        state: businesses.state,
        lastActiveAt: sql<Date>`(
          SELECT MAX(created_at) FROM reviews WHERE business_id = ${conn.businessId}
        )`,
      })
      .from(businesses)
      .where(eq(businesses.id, conn.businessId))
      .limit(1);

    if (!businessInfo) continue;

    // Skip if not a valid RANK category
    if (!isValidCategory(businessInfo.vertical)) continue;

    // Determine if business is active (activity in last 7 days)
    const isActive =
      businessInfo.lastActiveAt &&
      businessInfo.lastActiveAt.getTime() > activeCutoff.getTime();

    // Determine sync eligibility
    const lastSync = conn.lastSyncedAt || new Date(0);
    const needsSync = isActive
      ? lastSync < dailyCutoff // Active: sync daily
      : lastSync < weeklyCutoff; // Inactive: sync weekly

    if (needsSync) {
      businessesToSync.push({
        businessId: conn.businessId,
        organizationId: conn.organizationId,
        category: businessInfo.vertical as RankCategory,
        city: businessInfo.city,
        state: businessInfo.state,
        metro: null, // TODO: Derive from city
        isActive,
        lastSyncedAt: conn.lastSyncedAt,
      });
    }
  }

  // Sort by last sync (oldest first) for fair distribution
  return businessesToSync.sort((a, b) => {
    const aTime = a.lastSyncedAt?.getTime() || 0;
    const bTime = b.lastSyncedAt?.getTime() || 0;
    return aTime - bTime;
  });
}

interface BusinessToSync {
  businessId: string;
  organizationId: string;
  category: RankCategory;
  city: string;
  state: string;
  metro: string | null;
  isActive: boolean;
  lastSyncedAt: Date | null;
}

/**
 * Sync a single business with exponential backoff.
 */
async function syncBusiness(business: BusinessToSync): Promise<SyncResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= BACKOFF_CONFIG.maxRetries; attempt++) {
    try {
      // Get access token (handles refresh if needed)
      const auth = await getAccessToken(business.businessId);

      if (!auth) {
        return {
          businessId: business.businessId,
          status: "skipped",
          reason: "No valid access token",
        };
      }

      // Sync reviews from GBP
      const syncResult = await syncReviews(
        business.businessId,
        business.organizationId
      );

      // Calculate metrics from synced data
      const metrics = await calculateBusinessMetrics(
        business.businessId,
        business.organizationId
      );

      // Insert metrics snapshot
      await insertMetricsSnapshot(business, metrics);

      return {
        businessId: business.businessId,
        status: "synced",
        metrics,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if retryable
      if (!isRetryableError(lastError)) {
        break;
      }

      // Exponential backoff
      if (attempt < BACKOFF_CONFIG.maxRetries) {
        const delay = Math.min(
          BACKOFF_CONFIG.initialDelayMs * Math.pow(2, attempt),
          BACKOFF_CONFIG.maxDelayMs
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted — mark connection error
  await markConnectionError(business.businessId, "UNKNOWN");
  await preserveLastKnownRank(business.businessId);

  return {
    businessId: business.businessId,
    status: "failed",
    reason: lastError?.message || "Unknown error",
  };
}

/**
 * Calculate business metrics from synced review data.
 */
async function calculateBusinessMetrics(
  businessId: string,
  organizationId: string
): Promise<BusinessMetricsSnapshot> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get review stats
  const reviewStats = await db
    .select({
      totalCount: count(),
      avgRating: sql<number>`AVG(rating)`,
      recentCount: sql<number>`COUNT(CASE WHEN review_date > ${thirtyDaysAgo} THEN 1 END)`,
    })
    .from(reviews)
    .where(eq(reviews.businessId, businessId));

  const stats = reviewStats[0] || {
    totalCount: 0,
    avgRating: 0,
    recentCount: 0,
  };

  // Calculate response metrics from LocalGenius data
  // This is the PROPRIETARY signal — the moat
  const responseStats = await db
    .select({
      totalReviews: count(),
      respondedReviews: sql<number>`COUNT(CASE WHEN id IN (
        SELECT review_id FROM review_responses
      ) THEN 1 END)`,
      avgResponseHours: sql<number>`AVG(
        EXTRACT(EPOCH FROM (
          SELECT MIN(created_at) FROM review_responses rr WHERE rr.review_id = reviews.id
        ) - reviews.review_date) / 3600
      )`,
    })
    .from(reviews)
    .where(eq(reviews.businessId, businessId));

  const response = responseStats[0] || {
    totalReviews: 0,
    respondedReviews: 0,
    avgResponseHours: null,
  };

  // Calculate response rate
  const responseRate =
    response.totalReviews > 0
      ? (response.respondedReviews / response.totalReviews) * 100
      : 0;

  return {
    reviewCount: Number(stats.totalCount) || 0,
    avgRating: Number(stats.avgRating) || 0,
    reviewVelocity: Number(stats.recentCount) || 0,
    responseRate: Math.round(responseRate * 100) / 100,
    avgResponseTimeHours: response.avgResponseHours
      ? Math.round(response.avgResponseHours)
      : null,
  };
}

/**
 * Insert metrics snapshot into business_metrics table.
 */
async function insertMetricsSnapshot(
  business: BusinessToSync,
  metrics: BusinessMetricsSnapshot
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db
    .insert(businessMetrics)
    .values({
      businessId: business.businessId,
      date: today,
      category: business.category,
      locationCity: business.city,
      locationMetro: business.metro,
      locationState: business.state,
      reviewCount: metrics.reviewCount,
      avgRating: String(metrics.avgRating),
      reviewVelocity: String(metrics.reviewVelocity),
      responseRate: String(metrics.responseRate),
      avgResponseTimeHours: metrics.avgResponseTimeHours,
    })
    .onConflictDoUpdate({
      target: [businessMetrics.businessId, businessMetrics.date],
      set: {
        reviewCount: metrics.reviewCount,
        avgRating: String(metrics.avgRating),
        reviewVelocity: String(metrics.reviewVelocity),
        responseRate: String(metrics.responseRate),
        avgResponseTimeHours: metrics.avgResponseTimeHours,
      },
    });

  // Update last synced timestamp
  await db
    .update(businessSettings)
    .set({
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(businessSettings.businessId, business.businessId),
        eq(businessSettings.platform, "google_business")
      )
    );
}

/**
 * Check if an error is retryable (network issues, rate limits).
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("rate limit") ||
    message.includes("429") ||
    message.includes("503") ||
    message.includes("econnreset")
  );
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Cron Endpoint Handler ────────────────────────────────────────────────────

/**
 * Handler for POST /api/cron/rank/daily-sync
 * Called by Vercel Cron or similar scheduler.
 *
 * Schedule: Daily between 4am-10am UTC (staggered window)
 *
 * @param cronSecret - Secret to validate cron request
 * @returns Sync summary
 */
export async function handleDailySyncCron(
  cronSecret: string
): Promise<{ authorized: boolean; result?: DailySyncSummary }> {
  // Validate cron secret
  if (cronSecret !== process.env.CRON_SECRET) {
    return { authorized: false };
  }

  const result = await runDailySync();

  return { authorized: true, result };
}
