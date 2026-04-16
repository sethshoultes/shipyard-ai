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
 * Normalize a raw Yelp Fusion API review into our ReviewRecord format.
 */
export function normalizeYelpReview(raw: Record<string, unknown>): ReviewRecord {
	const user = (raw.user ?? {}) as Record<string, unknown>;
	const authorName = String(user.name ?? raw.user_name ?? "Anonymous");
	const rating = Math.min(5, Math.max(1, Number(raw.rating ?? 5)));
	const text = String(raw.text ?? "");
	const timeCreated = raw.time_created
		? new Date(String(raw.time_created)).toISOString()
		: new Date().toISOString();
	const yelpId = String(raw.id ?? `yelp-${authorName}-${rating}-${Date.now()}`);

	return {
		id: generateId(),
		source: "yelp",
		author: authorName,
		rating,
		text,
		date: timeCreated,
		featured: false,
		flagged: rating <= 2,
		sourceId: yelpId,
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

async function addReviewToList(ctx: PluginContext, sourceId: string): Promise<void> {
	const listJson = await ctx.kv.get<string[]>("reviews:list");
	const ids: string[] = listJson ?? [];
	if (!ids.includes(sourceId)) {
		ids.push(sourceId);
		await ctx.kv.set("reviews:list", ids);
	}
}

async function updateStatsCache(ctx: PluginContext): Promise<ReviewStats> {
	const reviews = await getAllReviews(ctx);
	const stats = computeStats(reviews);
	await ctx.kv.set("reviews:stats", stats, { ex: 3600 });
	return stats;
}

async function getStatsCache(ctx: PluginContext): Promise<ReviewStats> {
	const cached = await ctx.kv.get<ReviewStats | null>("reviews:stats");
	if (cached) return cached;
	return updateStatsCache(ctx);
}

// ---------------------------------------------------------------------------
// Plugin definition — v1 MVP
// ---------------------------------------------------------------------------

function createPlugin() { return definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				ctx.log.info("ReviewPulse installed — setting up your review dashboard");
				await ctx.kv.set("reviews:list", []);
				await ctx.kv.set("reviews:stats", {
					averageRating: 0,
					totalCount: 0,
					bySource: { google: 0, yelp: 0, manual: 0 },
					trend: "stable",
					previousAverage: 0,
				});
			},
		},
	},

	routes: {
		// -----------------------------------------------------------------
		// POST /reviewpulse/sync
		// Fetch reviews from Google Places and Yelp. Normalizes, deduplicates,
		// stores in KV.
		// -----------------------------------------------------------------
		sync: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					// Get existing review IDs for deduplication
					const existingList = await ctx.kv.get<string[]>("reviews:list");
					const existingIds: string[] = existingList ?? [];
					const existingReviews = new Map<string, ReviewRecord>();

					for (const id of existingIds) {
						const review = await ctx.kv.get<ReviewRecord | null>(`review:${id}`);
						if (review) existingReviews.set(id, review);
					}

					// Build a dedup key set from existing reviews (author + rating + date prefix)
					const dedupKeys = new Set<string>();
					for (const r of existingReviews.values()) {
						dedupKeys.add(`${r.author}|${r.rating}|${r.date.slice(0, 10)}`);
					}

					let imported = 0;
					let skipped = 0;
					const newReviews: ReviewRecord[] = [];

					// ----------------------------------------------------------
					// Google Places sync
					// ----------------------------------------------------------
					const placeId = await ctx.kv.get<string>("settings:google-place-id");
					const googleApiKey = ctx.env?.GOOGLE_PLACES_API_KEY;

					if (!googleApiKey && placeId) {
						ctx.log.warn("Google Places API key not configured — skipping Google sync");
					}

					if (placeId && googleApiKey) {
						try {
							const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(String(googleApiKey))}`;
							const response = await fetch(url);

							if (!response.ok) {
								ctx.log.error(`Couldn't reach Google — got status ${response.status}`);
							} else {
								const data = (await response.json()) as Record<string, unknown>;
								const result = data.result as Record<string, unknown> | undefined;
								const rawReviews = (result?.reviews ?? []) as Record<string, unknown>[];

								for (const raw of rawReviews) {
									const normalized = normalizeGoogleReview(raw);
									const dedupKey = `${normalized.author}|${normalized.rating}|${normalized.date.slice(0, 10)}`;

									if (dedupKeys.has(dedupKey)) {
										skipped++;
										continue;
									}

									const reviewId = normalized.id;
									await ctx.kv.set(`review:${reviewId}`, normalized);
									await addReviewToList(ctx, reviewId);
									dedupKeys.add(dedupKey);
									newReviews.push(normalized);
									imported++;
								}
							}
						} catch (err) {
							ctx.log.error(`Google sync issue: ${String(err)}`);
						}
					}

					// ----------------------------------------------------------
					// Yelp Fusion sync
					// ----------------------------------------------------------
					const yelpBusinessId = await ctx.kv.get<string>("settings:yelp-business-id");
					const yelpApiKey = ctx.env?.YELP_API_KEY;

					if (!yelpApiKey && yelpBusinessId) {
						ctx.log.warn("Yelp API key not configured — skipping Yelp sync");
					}

					if (yelpBusinessId && yelpApiKey) {
						try {
							const yelpUrl = `https://api.yelp.com/v3/businesses/${encodeURIComponent(yelpBusinessId)}/reviews`;
							const yelpResponse = await fetch(yelpUrl, {
								headers: {
									Authorization: `Bearer ${String(yelpApiKey)}`,
								},
							});

							if (!yelpResponse.ok) {
								ctx.log.error(`Couldn't reach Yelp — got status ${yelpResponse.status}`);
							} else {
								const yelpData = (await yelpResponse.json()) as Record<string, unknown>;
								const rawYelpReviews = (yelpData.reviews ?? []) as Record<string, unknown>[];

								for (const raw of rawYelpReviews) {
									const normalized = normalizeYelpReview(raw);
									const dedupKey = `${normalized.author}|${normalized.rating}|${normalized.date.slice(0, 10)}`;

									if (dedupKeys.has(dedupKey)) {
										skipped++;
										continue;
									}

									const reviewId = normalized.id;
									await ctx.kv.set(`review:${reviewId}`, normalized);
									await addReviewToList(ctx, reviewId);
									dedupKeys.add(dedupKey);
									newReviews.push(normalized);
									imported++;
								}
							}
						} catch (err) {
							ctx.log.error(`Yelp sync issue: ${String(err)}`);
						}
					}

					// Check if any sources are configured
					if (!placeId && !yelpBusinessId) {
						throw new Error("No review sources set up yet. Add your Google Place ID or Yelp Business ID in settings to get started.");
					}

					// Update sync cursor
					await ctx.kv.set("reviews:sync-cursor", new Date().toISOString());

					// Refresh stats cache
					const stats = await updateStatsCache(ctx);

					// Log human-friendly message
					if (imported > 0) {
						ctx.log.info(`Found ${imported} new review${imported !== 1 ? "s" : ""}!`);
					} else {
						ctx.log.info("All caught up — no new reviews to import");
					}

					return {
						imported,
						skipped,
						total: stats.totalCount,
						lastSyncAt: new Date().toISOString(),
					};
				} catch (error) {
					ctx.log.error(`Sync issue: ${String(error)}`);
					throw new Error(error instanceof Error ? error.message : "Couldn't complete the review sync. Please try again.");
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
					ctx.log.error(`Couldn't load reviews: ${String(error)}`);
					throw new Error("We hit a snag loading your reviews. Please refresh and try again.");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/reviewDetail
		// Single review by ID.
		// -----------------------------------------------------------------
		reviewDetail: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const reviewId = String(input.id ?? "");

					if (!reviewId) {
						throw new Error("Which review would you like to see? Please provide an ID.");
					}

					const review = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					if (!review) {
						throw new Error("We couldn't find that review. It may have been removed.");
					}

					return { review };
				} catch (error) {
					ctx.log.error(`Review lookup issue: ${String(error)}`);
					throw new Error(error instanceof Error ? error.message : "Couldn't find that review.");
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
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const reviewId = String(input.id ?? "");

					if (!reviewId) {
						throw new Error("Which review would you like to update?");
					}

					const review = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					if (!review) {
						throw new Error("We couldn't find that review. It may have been removed.");
					}

					// Apply updates
					if (typeof input.featured === "boolean") {
						review.featured = input.featured;
					}
					if (typeof input.flagged === "boolean") {
						review.flagged = input.flagged;
					}

					await ctx.kv.set(`review:${reviewId}`, review);

					return { review };
				} catch (error) {
					ctx.log.error(`Review update issue: ${String(error)}`);
					throw new Error(error instanceof Error ? error.message : "Couldn't update that review.");
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
					ctx.log.error(`Stats issue: ${String(error)}`);
					throw new Error("Couldn't load your review stats right now.");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /reviewpulse/widgetData
		// Public endpoint for site widget. Returns featured/recent reviews
		// and aggregate rating.
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
					ctx.log.error(`Widget data issue: ${String(error)}`);
					throw new Error("Couldn't load review widget data.");
				}
			},
		},

		// -----------------------------------------------------------------
		// PUT /reviewpulse/settings
		// Update plugin settings (admin only).
		// Body: { googlePlaceId?, yelpBusinessId?, displayPrefs? }
		// -----------------------------------------------------------------
		settings: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;

					if (typeof input.googlePlaceId === "string") {
						const placeId = input.googlePlaceId.trim();
						if (!placeId) {
							throw new Error("Please enter a valid Google Place ID.");
						}
						await ctx.kv.set("settings:google-place-id", placeId);
					}

					if (typeof input.yelpBusinessId === "string") {
						const yelpId = input.yelpBusinessId.trim();
						if (yelpId) {
							await ctx.kv.set("settings:yelp-business-id", yelpId);
						} else {
							await ctx.kv.delete("settings:yelp-business-id");
						}
					}

					if (input.displayPrefs && typeof input.displayPrefs === "object") {
						await ctx.kv.set("settings:display", input.displayPrefs);
					}

					// Return current settings
					const googlePlaceId = await ctx.kv.get<string>("settings:google-place-id");
					const yelpBizId = await ctx.kv.get<string>("settings:yelp-business-id");
					const displayJson = await ctx.kv.get<Record<string, unknown>>("settings:display");

					return {
						settings: {
							googlePlaceId: googlePlaceId ?? null,
							yelpBusinessId: yelpBizId ?? null,
							display: displayJson ?? {},
						},
					};
				} catch (error) {
					ctx.log.error(`Settings issue: ${String(error)}`);
					throw new Error(error instanceof Error ? error.message : "Couldn't save your settings.");
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
					const listJson = await ctx.kv.get<string[]>("reviews:list");
					const ids: string[] = listJson ?? [];
					const syncCursor = await ctx.kv.get<string>("reviews:sync-cursor");

					return {
						status: "ok",
						plugin: "reviewpulse",
						version: "1.0.0",
						reviewCount: ids.length,
						lastSyncAt: syncCursor ?? null,
					};
				} catch (error) {
					ctx.log.error(`Health check issue: ${String(error)}`);
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

		/**
		 * GET /reviewpulse/settingsPage
		 * Admin settings page: Google Place ID, Yelp Business ID, widget display options.
		 */
		settingsPage: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const googlePlaceId = (await ctx.kv.get<string>("settings:google-place-id")) ?? "";
				const yelpBusinessId = (await ctx.kv.get<string>("settings:yelp-business-id")) ?? "";
				const displayJson = await ctx.kv.get<Record<string, unknown>>("settings:display");
				const displaySettings = displayJson ?? {};
				const syncCursor = (await ctx.kv.get<string>("reviews:sync-cursor")) ?? "Never synced yet";

				const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

				const html = `<div class="reviewpulse-settings" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; padding: 24px;">
	<h1 style="font-size: 24px; color: #2C2C2C; margin: 0 0 8px;">ReviewPulse Settings</h1>
	<p style="color: #666; font-size: 14px; margin: 0 0 24px;">Connect your review sources and customize how reviews appear on your site.</p>

	<form id="reviewpulse-settings-form" method="POST" action="/_emdash/api/plugins/reviewpulse/settings">
		<fieldset style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
			<legend style="font-size: 16px; font-weight: 600; color: #C4704B; padding: 0 8px;">Review Sources</legend>

			<label style="display: block; margin-bottom: 16px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Google Place ID</span>
				<input type="text" name="googlePlaceId" value="${escapeAttr(googlePlaceId)}"
					placeholder="ChIJ..." style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
				<span style="display: block; font-size: 12px; color: #999; margin-top: 4px;">Find this in your Google Business Profile URL</span>
			</label>

			<label style="display: block; margin-bottom: 8px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Yelp Business ID</span>
				<input type="text" name="yelpBusinessId" value="${escapeAttr(yelpBusinessId)}"
					placeholder="my-business-city" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
				<span style="display: block; font-size: 12px; color: #999; margin-top: 4px;">The last part of your Yelp business URL</span>
			</label>
		</fieldset>

		<fieldset style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
			<legend style="font-size: 16px; font-weight: 600; color: #C4704B; padding: 0 8px;">Widget Display</legend>

			<label style="display: block; margin-bottom: 16px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Default Layout</span>
				<select name="displayLayout" style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
					<option value="list" ${(displaySettings.layout ?? "list") === "list" ? "selected" : ""}>List</option>
					<option value="grid" ${displaySettings.layout === "grid" ? "selected" : ""}>Grid</option>
					<option value="compact" ${displaySettings.layout === "compact" ? "selected" : ""}>Compact</option>
				</select>
			</label>

			<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<input type="checkbox" name="showAuthors" ${displaySettings.showAuthors !== false ? "checked" : ""} />
				<span style="font-size: 14px; color: #2C2C2C;">Show reviewer names</span>
			</label>
		</fieldset>

		<div style="display: flex; gap: 12px; align-items: center;">
			<button type="submit" style="background: #C4704B; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
				Save Settings
			</button>
		</div>
	</form>

	<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

	<div style="display: flex; align-items: center; gap: 16px;">
		<button id="reviewpulse-sync-btn" style="background: #7A8B6F; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
			Check for New Reviews
		</button>
		<span style="font-size: 13px; color: #666;">Last checked: ${escapeAttr(syncCursor)}</span>
	</div>
</div>`;

				return { html };
			},
		},
	},
});
}
export { createPlugin };
export default createPlugin;

