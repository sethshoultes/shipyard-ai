/**
 * ReviewPulse KV Storage Operations
 *
 * All KV storage patterns for the ReviewPulse v1 MVP.
 * Uses O(n) list pattern for simplicity - acceptable for <1000 reviews.
 *
 * Storage keys:
 * - `review:{id}` - Individual review records
 * - `reviews:list` - Array of review IDs (sorted by date)
 * - `reviews:stats` - Cached aggregate statistics
 * - `reviews:sync-cursor` - Last sync timestamp
 * - `settings:google-place-id` - Google Places ID
 * - `settings:yelp-business-id` - Yelp Business ID
 * - `settings:display` - Display preferences
 */

import type { PluginContext } from "emdash";
import type { ReviewRecord, ReviewStats } from "../types";

/**
 * Get all reviews from KV storage.
 * Fetches the list of IDs and then hydrates each review.
 */
export async function getAllReviews(ctx: PluginContext): Promise<ReviewRecord[]> {
	const listJson = await ctx.kv.get<string[]>("reviews:list");
	const ids: string[] = listJson ?? [];

	const reviews: ReviewRecord[] = [];
	for (const id of ids) {
		const review = await ctx.kv.get<ReviewRecord | null>(`review:${id}`);
		if (review) reviews.push(review);
	}

	// Sort by date descending (newest first)
	reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return reviews;
}

/**
 * Add a review ID to the reviews list.
 */
export async function addReviewToList(ctx: PluginContext, reviewId: string): Promise<void> {
	const listJson = await ctx.kv.get<string[]>("reviews:list");
	const ids: string[] = listJson ?? [];
	if (!ids.includes(reviewId)) {
		ids.push(reviewId);
		await ctx.kv.set("reviews:list", ids);
	}
}

/**
 * Save a review record to KV.
 */
export async function saveReview(ctx: PluginContext, review: ReviewRecord): Promise<void> {
	await ctx.kv.set(`review:${review.id}`, review);
	await addReviewToList(ctx, review.id);
}

/**
 * Get a single review by ID.
 */
export async function getReview(ctx: PluginContext, id: string): Promise<ReviewRecord | null> {
	return ctx.kv.get<ReviewRecord | null>(`review:${id}`);
}

/**
 * Compute aggregate stats from all reviews.
 */
export function computeStats(reviews: ReviewRecord[]): ReviewStats {
	const totalCount = reviews.length;

	if (totalCount === 0) {
		return {
			averageRating: 0,
			totalCount: 0,
			bySource: { google: 0, yelp: 0, manual: 0 },
			trend: "stable",
			previousAverage: 0,
		};
	}

	const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
	const averageRating = Math.round((sum / totalCount) * 10) / 10;

	const bySource = { google: 0, yelp: 0, manual: 0 };
	for (const r of reviews) {
		if (r.source in bySource) {
			bySource[r.source]++;
		}
	}

	// Trend: compare last 30 days vs. previous 30 days
	const now = Date.now();
	const thirtyDays = 30 * 24 * 60 * 60 * 1000;
	const recent: number[] = [];
	const previous: number[] = [];

	for (const r of reviews) {
		const reviewTime = new Date(r.date).getTime();
		const age = now - reviewTime;
		if (age <= thirtyDays) {
			recent.push(r.rating);
		} else if (age <= thirtyDays * 2) {
			previous.push(r.rating);
		}
	}

	const recentAvg =
		recent.length > 0
			? recent.reduce((a, b) => a + b, 0) / recent.length
			: averageRating;
	const previousAvg =
		previous.length > 0
			? previous.reduce((a, b) => a + b, 0) / previous.length
			: averageRating;

	let trend: "up" | "down" | "stable" = "stable";
	if (recentAvg - previousAvg > 0.2) trend = "up";
	else if (previousAvg - recentAvg > 0.2) trend = "down";

	return {
		averageRating,
		totalCount,
		bySource,
		trend,
		previousAverage: Math.round(previousAvg * 10) / 10,
	};
}

/**
 * Update the cached stats in KV.
 */
export async function updateStatsCache(ctx: PluginContext): Promise<ReviewStats> {
	const reviews = await getAllReviews(ctx);
	const stats = computeStats(reviews);
	await ctx.kv.set("reviews:stats", stats, { ex: 3600 });
	return stats;
}

/**
 * Get cached stats or compute fresh if not cached.
 */
export async function getStatsCache(ctx: PluginContext): Promise<ReviewStats> {
	const cached = await ctx.kv.get<ReviewStats | null>("reviews:stats");
	if (cached) return cached;
	return updateStatsCache(ctx);
}
