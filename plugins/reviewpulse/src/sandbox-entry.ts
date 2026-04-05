import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	renderReviewList,
	renderStatsWidget,
	renderReviewCountWidget,
	renderRecentReviewsWidget,
} from "./admin-ui";
import type { ReviewRecord, ReviewStats, ReviewFilters } from "./admin-ui";

// Re-export types for tests
export type { ReviewRecord, ReviewStats };

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseJSON<T>(json: string | undefined | null, fallback: T): T {
	if (!json) return fallback;
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
}

/**
 * Normalize a raw Google Places review into our ReviewRecord format.
 */
export function normalizeGoogleReview(raw: Record<string, unknown>): ReviewRecord {
	const authorName = String(raw.author_name ?? raw.authorName ?? "Anonymous");
	const rating = Math.min(5, Math.max(1, Number(raw.rating ?? 5)));
	const text = String(raw.text ?? "");
	const time = raw.time
		? new Date(Number(raw.time) * 1000).toISOString()
		: raw.relative_time_description
			? new Date().toISOString()
			: new Date().toISOString();
	const sourceId = String(
		raw.author_url ?? raw.authorUrl ?? `google-${authorName}-${rating}-${Date.now()}`
	);

	return {
		id: generateId(),
		source: "google",
		author: authorName,
		rating,
		text,
		date: time,
		featured: false,
		flagged: rating <= 2,
		replyText: raw.reply?.text ? String((raw.reply as Record<string, unknown>).text) : undefined,
		repliedAt: raw.reply?.time
			? new Date(
					Number((raw.reply as Record<string, unknown>).time) * 1000
				).toISOString()
			: undefined,
	};
}

/**
 * Compute aggregate stats from a list of reviews.
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

// ---------------------------------------------------------------------------
// KV data access helpers
// ---------------------------------------------------------------------------

async function getAllReviews(ctx: PluginContext): Promise<ReviewRecord[]> {
	const listJson = await ctx.kv.get<string>("reviews:list");
	const ids: string[] = parseJSON(listJson, []);

	const reviews: ReviewRecord[] = [];
	for (const id of ids) {
		const json = await ctx.kv.get<string>(`review:${id}`);
		const review = parseJSON<ReviewRecord | null>(json, null);
		if (review) reviews.push(review);
	}

	// Sort by date descending (newest first)
	reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return reviews;
}

async function addReviewToList(ctx: PluginContext, sourceId: string): Promise<void> {
	const listJson = await ctx.kv.get<string>("reviews:list");
	const ids: string[] = parseJSON(listJson, []);
	if (!ids.includes(sourceId)) {
		ids.push(sourceId);
		await ctx.kv.set("reviews:list", JSON.stringify(ids));
	}
}

async function updateStatsCache(ctx: PluginContext): Promise<ReviewStats> {
	const reviews = await getAllReviews(ctx);
	const stats = computeStats(reviews);
	await ctx.kv.set("reviews:stats", JSON.stringify(stats), { ex: 3600 });
	return stats;
}

async function getStatsCache(ctx: PluginContext): Promise<ReviewStats> {
	const cached = await ctx.kv.get<string>("reviews:stats");
	if (cached) {
		const stats = parseJSON<ReviewStats | null>(cached, null);
		if (stats) return stats;
	}
	return updateStatsCache(ctx);
}

// ---------------------------------------------------------------------------
// Plugin definition
// ---------------------------------------------------------------------------

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				ctx.log.info("ReviewPulse installed — initializing KV schema");
				await ctx.kv.set("reviews:list", JSON.stringify([]));
				await ctx.kv.set(
					"reviews:stats",
					JSON.stringify({
						averageRating: 0,
						totalCount: 0,
						bySource: { google: 0, yelp: 0, manual: 0 },
						trend: "stable",
						previousAverage: 0,
					})
				);
			},
		},
	},

	routes: {
		// -----------------------------------------------------------------
		// POST /reviewpulse/sync
		// Trigger Google Places review import. Normalizes, deduplicates,
		// stores in KV.
		// -----------------------------------------------------------------
		sync: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get Google Place ID from settings
					const placeId = await ctx.kv.get<string>("settings:google-place-id");
					if (!placeId) {
						throw new Response(
							JSON.stringify({ error: "Google Place ID not configured. Update settings first." }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const apiKey = ctx.env?.GOOGLE_PLACES_API_KEY;
					if (!apiKey) {
						throw new Response(
							JSON.stringify({ error: "Google Places API key not configured" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					// Fetch reviews from Google Places API
					const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(String(apiKey))}`;
					const response = await fetch(url);

					if (!response.ok) {
						ctx.log.error(`Google Places API error: ${response.status}`);
						throw new Response(
							JSON.stringify({ error: "Google Places API request failed" }),
							{ status: 502, headers: { "Content-Type": "application/json" } }
						);
					}

					const data = (await response.json()) as Record<string, unknown>;
					const result = data.result as Record<string, unknown> | undefined;
					const rawReviews = (result?.reviews ?? []) as Record<string, unknown>[];

					// Get existing review IDs for deduplication
					const existingList = await ctx.kv.get<string>("reviews:list");
					const existingIds: string[] = parseJSON(existingList, []);
					const existingReviews = new Map<string, ReviewRecord>();

					for (const id of existingIds) {
						const json = await ctx.kv.get<string>(`review:${id}`);
						const review = parseJSON<ReviewRecord | null>(json, null);
						if (review) existingReviews.set(id, review);
					}

					// Build a dedup key set from existing reviews (author + rating + date prefix)
					const dedupKeys = new Set<string>();
					for (const r of existingReviews.values()) {
						dedupKeys.add(`${r.author}|${r.rating}|${r.date.slice(0, 10)}`);
					}

					let imported = 0;
					let skipped = 0;

					for (const raw of rawReviews) {
						const normalized = normalizeGoogleReview(raw);
						const dedupKey = `${normalized.author}|${normalized.rating}|${normalized.date.slice(0, 10)}`;

						if (dedupKeys.has(dedupKey)) {
							skipped++;
							continue;
						}

						// Store review
						const reviewId = normalized.id;
						await ctx.kv.set(`review:${reviewId}`, JSON.stringify(normalized));
						await addReviewToList(ctx, reviewId);
						dedupKeys.add(dedupKey);
						imported++;
					}

					// Update sync cursor
					await ctx.kv.set("reviews:sync-cursor", new Date().toISOString());

					// Refresh stats cache
					const stats = await updateStatsCache(ctx);

					ctx.log.info(`ReviewPulse sync complete: ${imported} imported, ${skipped} duplicates skipped`);

					return {
						imported,
						skipped,
						total: stats.totalCount,
						lastSyncAt: new Date().toISOString(),
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Sync error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Review sync failed" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/reviews
		// Paginated, filterable review list.
		// Query: page, perPage, rating, source, status (featured|flagged)
		// -----------------------------------------------------------------
		reviews: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;

					const page = Math.max(1, parseInt(String(input.page ?? "1"), 10) || 1);
					const perPage = Math.min(
						100,
						Math.max(1, parseInt(String(input.perPage ?? "20"), 10) || 20)
					);
					const ratingFilter = input.rating
						? parseInt(String(input.rating), 10)
						: undefined;
					const sourceFilter = input.source ? String(input.source) : undefined;
					const statusFilter = input.status ? String(input.status) : undefined;

					let reviews = await getAllReviews(ctx);

					// Apply filters
					if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
						reviews = reviews.filter((r) => r.rating === ratingFilter);
					}
					if (
						sourceFilter &&
						(sourceFilter === "google" ||
							sourceFilter === "yelp" ||
							sourceFilter === "manual")
					) {
						reviews = reviews.filter((r) => r.source === sourceFilter);
					}
					if (statusFilter === "featured") {
						reviews = reviews.filter((r) => r.featured);
					} else if (statusFilter === "flagged") {
						reviews = reviews.filter((r) => r.flagged);
					}

					const totalCount = reviews.length;
					const totalPages = Math.ceil(totalCount / perPage);
					const start = (page - 1) * perPage;
					const paginated = reviews.slice(start, start + perPage);

					return {
						reviews: paginated,
						total: totalCount,
						page,
						pages: totalPages,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Reviews list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch reviews" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/reviewDetail
		// Single review by ID.
		// Path param: id
		// -----------------------------------------------------------------
		reviewDetail: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const pathParams = rc.pathParams as Record<string, string> | undefined;
					const reviewId = pathParams?.id ?? String((rc.input as Record<string, unknown>)?.id ?? "");

					if (!reviewId) {
						throw new Response(
							JSON.stringify({ error: "Review ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const json = await ctx.kv.get<string>(`review:${reviewId}`);
					if (!json) {
						throw new Response(
							JSON.stringify({ error: "Review not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const review = parseJSON<ReviewRecord | null>(json, null);
					if (!review) {
						throw new Response(
							JSON.stringify({ error: "Review not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					return { review };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Review detail error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch review" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// PATCH /reviewpulse/reviewUpdate
		// Toggle featured/flagged on a review (admin only).
		// Body: { id, featured?, flagged? }
		// -----------------------------------------------------------------
		reviewUpdate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = (rc.input ?? {}) as Record<string, unknown>;
					const reviewId = String(input.id ?? "");

					if (!reviewId) {
						throw new Response(
							JSON.stringify({ error: "Review ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const json = await ctx.kv.get<string>(`review:${reviewId}`);
					if (!json) {
						throw new Response(
							JSON.stringify({ error: "Review not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const review = parseJSON<ReviewRecord | null>(json, null);
					if (!review) {
						throw new Response(
							JSON.stringify({ error: "Review not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Apply updates
					if (typeof input.featured === "boolean") {
						review.featured = input.featured;
					}
					if (typeof input.flagged === "boolean") {
						review.flagged = input.flagged;
					}

					await ctx.kv.set(`review:${reviewId}`, JSON.stringify(review));

					return { review };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Review update error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to update review" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/stats
		// Aggregate review stats with caching.
		// -----------------------------------------------------------------
		stats: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const stats = await getStatsCache(ctx);
					return { stats };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Stats error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch stats" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/widgetData
		// Public endpoint for site widget. Returns featured/recent reviews
		// and aggregate rating. Cached for performance.
		// -----------------------------------------------------------------
		widgetData: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const limit = Math.min(
						20,
						Math.max(1, parseInt(String(input.limit ?? "5"), 10) || 5)
					);

					const reviews = await getAllReviews(ctx);
					const stats = await getStatsCache(ctx);

					// Prefer featured reviews, fall back to most recent
					const featured = reviews.filter((r) => r.featured);
					const displayReviews =
						featured.length >= limit
							? featured.slice(0, limit)
							: [
									...featured,
									...reviews
										.filter((r) => !r.featured)
										.slice(0, limit - featured.length),
								].slice(0, limit);

					return {
						averageRating: stats.averageRating,
						totalCount: stats.totalCount,
						reviews: displayReviews.map((r) => ({
							author: r.author,
							rating: r.rating,
							text: r.text,
							date: r.date,
							source: r.source,
						})),
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Widget data error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch widget data" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// PUT /reviewpulse/settings
		// Update plugin settings (admin only).
		// Body: { googlePlaceId?, displayPrefs?, notifications? }
		// -----------------------------------------------------------------
		settings: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = (rc.input ?? {}) as Record<string, unknown>;

					if (typeof input.googlePlaceId === "string") {
						const placeId = input.googlePlaceId.trim();
						if (!placeId) {
							throw new Response(
								JSON.stringify({ error: "Google Place ID cannot be empty" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}
						await ctx.kv.set("settings:google-place-id", placeId);
					}

					if (input.displayPrefs && typeof input.displayPrefs === "object") {
						await ctx.kv.set(
							"settings:display",
							JSON.stringify(input.displayPrefs)
						);
					}

					if (input.notifications && typeof input.notifications === "object") {
						await ctx.kv.set(
							"settings:notifications",
							JSON.stringify(input.notifications)
						);
					}

					// Return current settings
					const googlePlaceId = await ctx.kv.get<string>("settings:google-place-id");
					const displayJson = await ctx.kv.get<string>("settings:display");
					const notifJson = await ctx.kv.get<string>("settings:notifications");

					return {
						settings: {
							googlePlaceId: googlePlaceId ?? null,
							display: parseJSON(displayJson, {}),
							notifications: parseJSON(notifJson, {}),
						},
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Settings update error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to update settings" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/health
		// Health check endpoint.
		// -----------------------------------------------------------------
		health: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const listJson = await ctx.kv.get<string>("reviews:list");
					const ids: string[] = parseJSON(listJson, []);
					const syncCursor = await ctx.kv.get<string>("reviews:sync-cursor");

					return {
						status: "ok",
						plugin: "reviewpulse",
						version: "1.0.0",
						reviewCount: ids.length,
						lastSyncAt: syncCursor ?? null,
					};
				} catch (error) {
					ctx.log.error(`Health check error: ${String(error)}`);
					return {
						status: "degraded",
						plugin: "reviewpulse",
						version: "1.0.0",
						error: String(error),
					};
				}
			},
		},

		// -----------------------------------------------------------------
		// Admin page handlers — return HTML for Block Kit rendering.
		// -----------------------------------------------------------------

		/**
		 * GET /reviewpulse/adminReviews
		 * Admin page: review list with filters and pagination.
		 */
		adminReviews: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				const rc = routeCtx as Record<string, unknown>;
				const input = (rc.input ?? {}) as Record<string, unknown>;

				const filters: ReviewFilters = {
					page: Math.max(1, parseInt(String(input.page ?? "1"), 10) || 1),
					perPage: 20,
					rating: input.rating ? parseInt(String(input.rating), 10) : undefined,
					source: input.source
						? (String(input.source) as "google" | "yelp" | "manual")
						: undefined,
					status: input.status
						? (String(input.status) as "featured" | "flagged")
						: undefined,
				};

				let reviews = await getAllReviews(ctx);
				const totalBeforeFilter = reviews.length;

				// Apply filters
				if (filters.rating) {
					reviews = reviews.filter((r) => r.rating === filters.rating);
				}
				if (filters.source) {
					reviews = reviews.filter((r) => r.source === filters.source);
				}
				if (filters.status === "featured") {
					reviews = reviews.filter((r) => r.featured);
				} else if (filters.status === "flagged") {
					reviews = reviews.filter((r) => r.flagged);
				}

				const totalCount = reviews.length;
				const start = (filters.page - 1) * filters.perPage;
				const paginated = reviews.slice(start, start + filters.perPage);

				const html = renderReviewList(paginated, filters, totalCount);
				return { html, totalBeforeFilter };
			},
		},

		/**
		 * GET /reviewpulse/adminStatsWidget
		 * Dashboard widget: average rating card.
		 */
		adminStatsWidget: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const stats = await getStatsCache(ctx);
				const html = renderStatsWidget(stats);
				return { html };
			},
		},

		/**
		 * GET /reviewpulse/adminReviewCountWidget
		 * Dashboard widget: total review count card.
		 */
		adminReviewCountWidget: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const stats = await getStatsCache(ctx);
				const html = renderReviewCountWidget(stats);
				return { html };
			},
		},

		/**
		 * GET /reviewpulse/adminRecentReviewsWidget
		 * Dashboard widget: recent reviews list.
		 */
		adminRecentReviewsWidget: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const reviews = await getAllReviews(ctx);
				const recent = reviews.slice(0, 5);
				const html = renderRecentReviewsWidget(recent);
				return { html };
			},
		},
	},
});
