/**
 * RANK — Google OAuth Integration
 *
 * Wraps existing LocalGenius Google OAuth infrastructure for RANK.
 * Adds error handling UX for OAuth failures with "Reconnect" button
 * and last-known rank preservation.
 *
 * Requirements:
 *   REQ-API-001: Google OAuth flow
 *   REQ-API-002: Error handling UX
 *
 * Per decisions.md line 270:
 *   "Clear error message, 'Reconnect' button, preserve last-known rank with timestamp"
 */

import { db } from "@/lib/db";
import {
  businessSettings,
  rankEmailPreferences,
  weeklyRankings,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/encryption";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Result of an OAuth operation.
 */
export type OAuthResult =
  | { success: true; data: OAuthSuccessData }
  | { success: false; error: OAuthError };

export interface OAuthSuccessData {
  connected: boolean;
  lastSync: Date | null;
  accountId: string;
  locationId: string;
}

export interface OAuthError {
  code: OAuthErrorCode;
  message: string;
  retryable: boolean;
  action?: "reconnect" | "contact_support";
}

export type OAuthErrorCode =
  | "PERMISSION_DENIED"
  | "NETWORK_ERROR"
  | "TOKEN_EXPIRED"
  | "INVALID_GRANT"
  | "ACCOUNT_NOT_FOUND"
  | "UNKNOWN";

/**
 * Connection status response for the dashboard.
 */
export interface RankConnectionStatus {
  connected: boolean;
  connectionStatus: "active" | "expired" | "revoked" | "error" | "none";
  lastSync: Date | null;
  lastRank: LastKnownRank | null;
  error?: OAuthError;
}

export interface LastKnownRank {
  rank: number;
  cohortSize: number;
  cohortLabel: string;
  percentile: number;
  updatedAt: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM = "google_business";

/**
 * User-friendly error messages per decisions.md.
 * Coach voice: direct, actionable, not technical.
 */
const ERROR_MESSAGES: Record<OAuthErrorCode, string> = {
  PERMISSION_DENIED:
    "To see your rank, we need access to your Google Business Profile. Grant permission and we'll show you exactly where you stand.",
  NETWORK_ERROR:
    "Couldn't reach Google right now. Check your connection and try again.",
  TOKEN_EXPIRED:
    "Your Google connection expired. Reconnect to keep your ranking up to date.",
  INVALID_GRANT:
    "Your Google connection was revoked. Reconnect to resume ranking updates.",
  ACCOUNT_NOT_FOUND:
    "We couldn't find a Google Business Profile for your account. Make sure you have one set up.",
  UNKNOWN:
    "Something went wrong with your Google connection. Try reconnecting.",
};

// ─── OAuth Flow ───────────────────────────────────────────────────────────────

/**
 * Check connection status for a business.
 * Returns current status with last-known rank for graceful degradation.
 *
 * @param businessId - The business to check
 * @returns Connection status with fallback data
 */
export async function getConnectionStatus(
  businessId: string
): Promise<RankConnectionStatus> {
  // Get current connection status
  const [connection] = await db
    .select()
    .from(businessSettings)
    .where(
      and(
        eq(businessSettings.businessId, businessId),
        eq(businessSettings.platform, PLATFORM)
      )
    )
    .limit(1);

  // Get last known rank from email preferences (fallback)
  const [emailPrefs] = await db
    .select()
    .from(rankEmailPreferences)
    .where(eq(rankEmailPreferences.businessId, businessId))
    .limit(1);

  // Get latest weekly ranking
  const [latestRanking] = await db
    .select()
    .from(weeklyRankings)
    .where(eq(weeklyRankings.businessId, businessId))
    .orderBy(desc(weeklyRankings.weekOf))
    .limit(1);

  // Build last known rank from available data
  let lastRank: LastKnownRank | null = null;

  if (latestRanking) {
    lastRank = {
      rank: latestRanking.rank,
      cohortSize: latestRanking.cohortSize,
      cohortLabel: latestRanking.cohortLabel,
      percentile: Number(latestRanking.percentile),
      updatedAt: latestRanking.createdAt,
    };
  } else if (emailPrefs?.lastKnownRank && emailPrefs.lastKnownRankAt) {
    // Fall back to email preferences if no recent ranking
    lastRank = {
      rank: emailPrefs.lastKnownRank,
      cohortSize: 0, // Unknown from fallback
      cohortLabel: "Your Area",
      percentile: 0, // Unknown from fallback
      updatedAt: emailPrefs.lastKnownRankAt,
    };
  }

  // No connection exists
  if (!connection) {
    return {
      connected: false,
      connectionStatus: "none",
      lastSync: null,
      lastRank,
    };
  }

  // Build error response if connection has issues
  let error: OAuthError | undefined;
  if (connection.connectionStatus === "expired") {
    error = {
      code: "TOKEN_EXPIRED",
      message: ERROR_MESSAGES.TOKEN_EXPIRED,
      retryable: true,
      action: "reconnect",
    };
  } else if (connection.connectionStatus === "revoked") {
    error = {
      code: "INVALID_GRANT",
      message: ERROR_MESSAGES.INVALID_GRANT,
      retryable: true,
      action: "reconnect",
    };
  } else if (connection.connectionStatus === "error") {
    error = {
      code: "UNKNOWN",
      message: ERROR_MESSAGES.UNKNOWN,
      retryable: true,
      action: "reconnect",
    };
  }

  return {
    connected: connection.connectionStatus === "active",
    connectionStatus: connection.connectionStatus,
    lastSync: connection.lastSyncedAt,
    lastRank,
    error,
  };
}

/**
 * Handle OAuth callback after user grants permission.
 * Stores tokens and initializes RANK email preferences.
 *
 * @param businessId - The business completing OAuth
 * @param organizationId - The organization ID
 * @param tokens - OAuth tokens from Google
 * @param accountId - Google account ID
 * @param locationId - Google Business Profile location ID
 */
export async function handleOAuthCallback(
  businessId: string,
  organizationId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  },
  accountId: string,
  locationId: string
): Promise<OAuthResult> {
  try {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Store/update connection
    await db
      .insert(businessSettings)
      .values({
        businessId,
        organizationId,
        platform: PLATFORM,
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : null,
        tokenExpiresAt: expiresAt,
        platformUserId: accountId,
        platformBusinessId: locationId,
        connectionStatus: "active",
        lastSyncedAt: new Date(),
        config: { accountId, locationId, rankEnabled: true },
      })
      .onConflictDoUpdate({
        target: [businessSettings.businessId, businessSettings.platform],
        set: {
          accessToken: encrypt(tokens.access_token),
          refreshToken: tokens.refresh_token
            ? encrypt(tokens.refresh_token)
            : undefined,
          tokenExpiresAt: expiresAt,
          connectionStatus: "active",
          platformUserId: accountId,
          platformBusinessId: locationId,
          config: { accountId, locationId, rankEnabled: true },
          updatedAt: new Date(),
        },
      });

    // Initialize RANK email preferences
    await db
      .insert(rankEmailPreferences)
      .values({
        businessId,
        weeklyEmailEnabled: 1, // Enabled by default
      })
      .onConflictDoNothing();

    return {
      success: true,
      data: {
        connected: true,
        lastSync: new Date(),
        accountId,
        locationId,
      },
    };
  } catch (error) {
    console.error("OAuth callback failed:", error);
    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: ERROR_MESSAGES.UNKNOWN,
        retryable: true,
        action: "reconnect",
      },
    };
  }
}

/**
 * Handle OAuth errors with user-friendly messages.
 *
 * @param error - The error from Google OAuth
 * @returns Structured error response
 */
export function parseOAuthError(error: unknown): OAuthError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("permission") || message.includes("denied")) {
      return {
        code: "PERMISSION_DENIED",
        message: ERROR_MESSAGES.PERMISSION_DENIED,
        retryable: true,
        action: "reconnect",
      };
    }

    if (message.includes("network") || message.includes("fetch")) {
      return {
        code: "NETWORK_ERROR",
        message: ERROR_MESSAGES.NETWORK_ERROR,
        retryable: true,
      };
    }

    if (message.includes("expired")) {
      return {
        code: "TOKEN_EXPIRED",
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
        retryable: true,
        action: "reconnect",
      };
    }

    if (message.includes("invalid_grant") || message.includes("revoked")) {
      return {
        code: "INVALID_GRANT",
        message: ERROR_MESSAGES.INVALID_GRANT,
        retryable: true,
        action: "reconnect",
      };
    }
  }

  return {
    code: "UNKNOWN",
    message: ERROR_MESSAGES.UNKNOWN,
    retryable: true,
    action: "reconnect",
  };
}

/**
 * Preserve the last known rank when connection fails.
 * Called when sync fails but we want to show stale data gracefully.
 *
 * @param businessId - The business to preserve rank for
 */
export async function preserveLastKnownRank(businessId: string): Promise<void> {
  // Get latest ranking
  const [latestRanking] = await db
    .select()
    .from(weeklyRankings)
    .where(eq(weeklyRankings.businessId, businessId))
    .orderBy(desc(weeklyRankings.weekOf))
    .limit(1);

  if (!latestRanking) return;

  // Store in email preferences for fallback
  await db
    .update(rankEmailPreferences)
    .set({
      lastKnownRank: latestRanking.rank,
      lastKnownRankAt: latestRanking.createdAt,
      updatedAt: new Date(),
    })
    .where(eq(rankEmailPreferences.businessId, businessId));
}

/**
 * Mark a connection as having an error.
 * Called when sync repeatedly fails.
 *
 * @param businessId - The business with connection issues
 * @param errorCode - The error code to record
 */
export async function markConnectionError(
  businessId: string,
  errorCode: OAuthErrorCode
): Promise<void> {
  await db
    .update(businessSettings)
    .set({
      connectionStatus: errorCode === "INVALID_GRANT" ? "revoked" : "error",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(businessSettings.businessId, businessId),
        eq(businessSettings.platform, PLATFORM)
      )
    );

  // Preserve rank for graceful degradation
  await preserveLastKnownRank(businessId);
}

/**
 * Disconnect Google Business Profile for a business.
 * Preserves last known rank for historical reference.
 *
 * @param businessId - The business to disconnect
 */
export async function disconnectGoogleBusiness(
  businessId: string
): Promise<void> {
  // Preserve rank before disconnecting
  await preserveLastKnownRank(businessId);

  // Remove connection
  await db
    .delete(businessSettings)
    .where(
      and(
        eq(businessSettings.businessId, businessId),
        eq(businessSettings.platform, PLATFORM)
      )
    );
}
