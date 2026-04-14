/**
 * ReviewPulse Type Definitions
 *
 * Shared types used across the ReviewPulse v1 MVP plugin.
 * Design follows Emdash patterns for KV storage and route handlers.
 */

/**
 * A single review record stored in KV.
 */
export interface ReviewRecord {
	id: string;
	source: "google" | "yelp" | "manual";
	author: string;
	rating: number; // 1-5
	text: string;
	date: string; // ISO 8601
	featured: boolean;
	flagged: boolean;
	replyText?: string;
	repliedAt?: string;
	sourceId?: string; // External ID from Google/Yelp
}

/**
 * Filters for review list queries.
 */
export interface ReviewFilters {
	rating?: number; // 1-5 or undefined = all
	source?: "google" | "yelp" | "manual" | "";
	status?: "featured" | "flagged" | "";
	page: number;
	perPage: number;
}

/**
 * Aggregate statistics for reviews.
 */
export interface ReviewStats {
	averageRating: number;
	totalCount: number;
	bySource: { google: number; yelp: number; manual: number };
	trend: "up" | "down" | "stable"; // compared to previous period
	previousAverage: number;
}

/**
 * Widget data response for public API.
 */
export interface WidgetData {
	averageRating: number;
	totalCount: number;
	reviews: Array<{
		author: string;
		rating: number;
		text: string;
		date: string;
		source: string;
	}>;
}

/**
 * Sync result from Google/Yelp fetch.
 */
export interface SyncResult {
	imported: number;
	skipped: number;
	total: number;
	lastSyncAt: string;
}

/**
 * Plugin settings stored in KV.
 */
export interface PluginSettings {
	googlePlaceId: string | null;
	yelpBusinessId: string | null;
	display: {
		layout?: "list" | "grid" | "compact";
		showAuthors?: boolean;
	};
}

/**
 * Health check response.
 */
export interface HealthStatus {
	status: "ok" | "degraded";
	plugin: string;
	version: string;
	reviewCount?: number;
	lastSyncAt?: string | null;
	error?: string;
}
