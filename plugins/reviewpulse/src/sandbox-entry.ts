import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	renderReviewList,
	renderStatsWidget,
	renderReviewCountWidget,
	renderRecentReviewsWidget,
} from "./admin-ui";
import type { ReviewRecord, ReviewStats, ReviewFilters } from "./admin-ui";
import {
	sendEmail,
	generateReviewRequestHTML,
	generateNewReviewNotificationHTML,
	generateNegativeReviewAlertHTML,
} from "./email";
import type { ReviewForEmail } from "./email";

// ---------------------------------------------------------------------------
// Wave 3 Types
// ---------------------------------------------------------------------------

export interface ResponseTemplate {
	id: string;
	name: string;
	body: string;
	category: "thank-you" | "apology" | "follow-up" | "custom";
	createdAt: string;
}

export interface Campaign {
	id: string;
	name: string;
	recipientEmails: string[];
	message: string;
	googleReviewUrl?: string;
	yelpReviewUrl?: string;
	status: "draft" | "sending" | "sent" | "failed";
	sentCount: number;
	createdAt: string;
	sentAt?: string;
}

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
 * Send email notifications for newly imported reviews.
 * Rate-limited to max 10 emails per sync call to prevent spam.
 */
async function sendReviewNotifications(
	ctx: PluginContext,
	newReviews: ReviewRecord[]
): Promise<number> {
	const notifJson = await ctx.kv.get<Record<string, unknown>>("settings:notifications");
	const notifSettings = (notifJson ?? {});

	const emails = notifSettings.emails as string[] | undefined;
	if (!emails || emails.length === 0) return 0;

	const threshold = typeof notifSettings.threshold === "number"
		? notifSettings.threshold
		: 3;
	const enabled = notifSettings.enabled !== false; // default on
	if (!enabled) return 0;

	const adminUrl = (notifSettings.adminUrl as string) || undefined;

	let sentCount = 0;
	const maxEmails = 10;

	for (const review of newReviews) {
		if (sentCount >= maxEmails) {
			ctx.log.warn(`Rate limit reached: ${sentCount}/${maxEmails} notification emails sent`);
			break;
		}

		const reviewForEmail: ReviewForEmail = {
			author: review.author,
			rating: review.rating,
			text: review.text,
			date: review.date,
			source: review.source,
		};

		for (const email of emails) {
			if (sentCount >= maxEmails) break;

			if (review.rating <= threshold) {
				// Negative review alert
				const html = generateNegativeReviewAlertHTML(reviewForEmail, adminUrl);
				await sendEmail(ctx, {
					to: email,
					subject: `⚠️ Negative Review Alert: ${review.rating}-star review from ${review.author}`,
					html,
				});
			} else {
				// Standard new review notification
				const html = generateNewReviewNotificationHTML(reviewForEmail);
				await sendEmail(ctx, {
					to: email,
					subject: `New ${review.rating}-star review from ${review.author}`,
					html,
				});
			}
			sentCount++;
		}
	}

	return sentCount;
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
	const ids: string[] = (listJson ?? []);

	const reviews: ReviewRecord[] = [];
	for (const id of ids) {
		const json = await ctx.kv.get<ReviewRecord | null>(`review:${id}`);
		const review = json;
		if (review) reviews.push(review);
	}

	// Sort by date descending (newest first)
	reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return reviews;
}

async function addReviewToList(ctx: PluginContext, sourceId: string): Promise<void> {
	const listJson = await ctx.kv.get<string[]>("reviews:list");
	const ids: string[] = (listJson ?? []);
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
	if (cached) {
		const stats = cached;
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
		// Trigger Google Places review import. Normalizes, deduplicates,
		// stores in KV.
		// -----------------------------------------------------------------
		sync: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					// Get existing review IDs for deduplication
					const existingList = await ctx.kv.get<string[]>("reviews:list");
					const existingIds: string[] = (existingList ?? []);
					const existingReviews = new Map<string, ReviewRecord>();

					for (const id of existingIds) {
						const json = await ctx.kv.get<ReviewRecord | null>(`review:${id}`);
						const review = json;
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

					if (placeId && googleApiKey) {
						try {
							const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(String(googleApiKey))}`;
							const response = await fetch(url);

							if (!response.ok) {
								ctx.log.error(`Google Places API error: ${response.status}`);
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
							ctx.log.error(`Google sync error: ${String(err)}`);
						}
					} else if (!placeId && !await ctx.kv.get<string>("settings:yelp-business-id")) {
						// Neither source configured
						throw new Error("No review sources configured. Set a Google Place ID or Yelp Business ID in settings.");
					}

					// ----------------------------------------------------------
					// Yelp Fusion sync
					// ----------------------------------------------------------
					const yelpBusinessId = await ctx.kv.get<string>("settings:yelp-business-id");
					const yelpApiKey = ctx.env?.YELP_API_KEY;

					if (yelpBusinessId && yelpApiKey) {
						try {
							const yelpUrl = `https://api.yelp.com/v3/businesses/${encodeURIComponent(yelpBusinessId)}/reviews`;
							const yelpResponse = await fetch(yelpUrl, {
								headers: {
									Authorization: `Bearer ${String(yelpApiKey)}`,
								},
							});

							if (!yelpResponse.ok) {
								ctx.log.error(`Yelp Fusion API error: ${yelpResponse.status}`);
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
							ctx.log.error(`Yelp sync error: ${String(err)}`);
						}
					}

					// Update sync cursor
					await ctx.kv.set("reviews:sync-cursor", new Date().toISOString());

					// Refresh stats cache
					const stats = await updateStatsCache(ctx);

					// Send email notifications for new reviews (rate-limited)
					let emailsSent = 0;
					if (newReviews.length > 0) {
						emailsSent = await sendReviewNotifications(ctx, newReviews);
					}

					ctx.log.info(`ReviewPulse sync complete: ${imported} imported, ${skipped} duplicates skipped, ${emailsSent} emails sent`);

					return {
						imported,
						skipped,
						total: stats.totalCount,
						emailsSent,
						lastSyncAt: new Date().toISOString(),
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Sync error: ${String(error)}`);
					throw new Error("Review sync failed");
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
					throw new Error("Failed to fetch reviews");
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
					const pathParams = rc.input as Record<string, string> | undefined;
					const reviewId = pathParams?.id ?? String((rc.input as Record<string, unknown>)?.id ?? "");

					if (!reviewId) {
						throw new Error("Review ID required");
					}

					const json = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					if (!json) {
						throw new Error("Review not found");
					}

					const review = json;
					if (!review) {
						throw new Error("Review not found");
					}

					return { review };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Review detail error: ${String(error)}`);
					throw new Error("Failed to fetch review");
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
						throw new Error("Review ID required");
					}

					const json = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					if (!json) {
						throw new Error("Review not found");
					}

					const review = json;
					if (!review) {
						throw new Error("Review not found");
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
					if (error instanceof Response) throw error;
					ctx.log.error(`Review update error: ${String(error)}`);
					throw new Error("Failed to update review");
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
					throw new Error("Failed to fetch stats");
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
					throw new Error("Failed to fetch widget data");
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
					const input = (rc.input ?? {}) as Record<string, unknown>;

					if (typeof input.googlePlaceId === "string") {
						const placeId = input.googlePlaceId.trim();
						if (!placeId) {
							throw new Error("Google Place ID cannot be empty");
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

					if (input.notifications && typeof input.notifications === "object") {
						await ctx.kv.set("settings:notifications", input.notifications);
					}

					// Return current settings
					const googlePlaceId = await ctx.kv.get<string>("settings:google-place-id");
					const yelpBizId = await ctx.kv.get<string>("settings:yelp-business-id");
					const displayJson = await ctx.kv.get<Record<string, unknown>>("settings:display");
					const notifJson = await ctx.kv.get<Record<string, unknown>>("settings:notifications");

					return {
						settings: {
							googlePlaceId: googlePlaceId ?? null,
							yelpBusinessId: yelpBizId ?? null,
							display: (displayJson ?? {}),
							notifications: (notifJson ?? {}),
						},
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Settings update error: ${String(error)}`);
					throw new Error("Failed to update settings");
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
					const ids: string[] = (listJson ?? []);
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

		// =================================================================
		// Wave 3: AI Response Drafting
		// =================================================================

		/**
		 * POST /reviewpulse/draftResponse
		 * Generate an AI response draft for a review using Claude Haiku.
		 */
		draftResponse: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const reviewId = String(input.reviewId ?? "");

					if (!reviewId) {
						throw new Error("Review ID required");
					}

					const json = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					if (!json) {
						throw new Error("Review not found");
					}

					const review = json;
					if (!review) {
						throw new Error("Review not found");
					}

					const apiKey = ctx.env?.ANTHROPIC_API_KEY;
					if (!apiKey) {
						throw new Error("Anthropic API key not configured");
					}

					// Get business context from settings
					const businessName = await ctx.kv.get<string>("settings:business-name") ?? "Our Business";
					const businessContext = await ctx.kv.get<string>("settings:business-context") ?? "";

					// Determine tone based on rating
					let toneInstruction: string;
					if (review.rating <= 2) {
						toneInstruction = "Use an empathetic and apologetic tone. Acknowledge the customer's frustration, express genuine concern, and offer to make things right.";
					} else if (review.rating === 3) {
						toneInstruction = "Use a balanced and appreciative tone. Thank the customer for their feedback, acknowledge areas for improvement, and highlight your commitment to excellence.";
					} else {
						toneInstruction = "Use a warm and grateful tone. Thank the customer sincerely for their positive feedback and express enthusiasm about their experience.";
					}

					const prompt = `You are a business owner responding to a customer review. Write a professional, authentic response.

Business Name: ${businessName}
${businessContext ? `Business Context: ${businessContext}` : ""}

Review Details:
- Author: ${review.author}
- Rating: ${review.rating}/5 stars
- Review Text: ${review.text || "(No review text provided)"}

Tone: ${toneInstruction}

Write a concise response (2-4 sentences). Be genuine, not generic. Do not use excessive exclamation marks. Address the reviewer by name if possible.`;

					const response = await fetch("https://api.anthropic.com/v1/messages", {
						method: "POST",
						headers: {
							"x-api-key": String(apiKey),
							"anthropic-version": "2023-06-01",
							"content-type": "application/json",
						},
						body: JSON.stringify({
							model: "claude-haiku-4-5-20251001",
							max_tokens: 300,
							messages: [{ role: "user", content: prompt }],
						}),
					});

					if (!response.ok) {
						ctx.log.error(`Anthropic API error: ${response.status}`);
						throw new Error("AI response generation failed");
					}

					const data = (await response.json()) as Record<string, unknown>;
					const content = data.content as Array<{ type: string; text: string }>;
					const draftText = content?.[0]?.text ?? "";

					return {
						draftText,
						reviewId,
						generatedAt: new Date().toISOString(),
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Draft response error: ${String(error)}`);
					throw new Error("Failed to generate response draft");
				}
			},
		},

		/**
		 * POST /reviewpulse/saveResponse
		 * Save a response (drafted or edited) to a review record.
		 */
		saveResponse: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const reviewId = String(input.reviewId ?? "");
					const replyText = String(input.replyText ?? "");

					if (!reviewId) {
						throw new Error("Review ID required");
					}

					if (!replyText.trim()) {
						throw new Error("Reply text cannot be empty");
					}

					const json = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					if (!json) {
						throw new Error("Review not found");
					}

					const review = json;
					if (!review) {
						throw new Error("Review not found");
					}

					review.replyText = replyText;
					review.repliedAt = new Date().toISOString();
					await ctx.kv.set(`review:${reviewId}`, review);

					return { review };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Save response error: ${String(error)}`);
					throw new Error("Failed to save response");
				}
			},
		},

		// =================================================================
		// Wave 3: Response Templates
		// =================================================================

		/**
		 * POST /reviewpulse/createTemplate
		 * Create a response template.
		 */
		createTemplate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const name = String(input.name ?? "").trim();
					const body = String(input.body ?? "").trim();
					const category = String(input.category ?? "custom") as ResponseTemplate["category"];

					if (!name) {
						throw new Error("Template name is required");
					}

					if (!body) {
						throw new Error("Template body is required");
					}

					const validCategories = ["thank-you", "apology", "follow-up", "custom"];
					if (!validCategories.includes(category)) {
						throw new Error("Invalid category. Must be: thank-you, apology, follow-up, or custom");
					}

					const template: ResponseTemplate = {
						id: generateId(),
						name,
						body,
						category,
						createdAt: new Date().toISOString(),
					};

					await ctx.kv.set(`template:${template.id}`, template);

					// Update templates list
					const listJson = await ctx.kv.get<string[]>("templates:list");
					const ids: string[] = (listJson ?? []);
					ids.push(template.id);
					await ctx.kv.set("templates:list", ids);

					return { template };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Create template error: ${String(error)}`);
					throw new Error("Failed to create template");
				}
			},
		},

		/**
		 * GET /reviewpulse/listTemplates
		 * Return all response templates.
		 */
		listTemplates: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const listJson = await ctx.kv.get<string[]>("templates:list");
					const ids: string[] = (listJson ?? []);
					const templates: ResponseTemplate[] = [];

					for (const id of ids) {
						const json = await ctx.kv.get<ResponseTemplate | null>(`template:${id}`);
						const template = json;
						if (template) templates.push(template);
					}

					return { templates };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`List templates error: ${String(error)}`);
					throw new Error("Failed to list templates");
				}
			},
		},

		/**
		 * GET /reviewpulse/getTemplate
		 * Return a single template by ID.
		 */
		getTemplate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const templateId = String(input.id ?? "");

					if (!templateId) {
						throw new Error("Template ID required");
					}

					const json = await ctx.kv.get<ResponseTemplate | null>(`template:${templateId}`);
					if (!json) {
						throw new Error("Template not found");
					}

					const template = json;
					if (!template) {
						throw new Error("Template not found");
					}

					return { template };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Get template error: ${String(error)}`);
					throw new Error("Failed to get template");
				}
			},
		},

		/**
		 * DELETE /reviewpulse/deleteTemplate
		 * Remove a template.
		 */
		deleteTemplate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const templateId = String(input.id ?? "");

					if (!templateId) {
						throw new Error("Template ID required");
					}

					// Remove from KV
					await ctx.kv.delete(`template:${templateId}`);

					// Remove from list
					const listJson = await ctx.kv.get<string[]>("templates:list");
					const ids: string[] = (listJson ?? []);
					const filtered = ids.filter((id) => id !== templateId);
					await ctx.kv.set("templates:list", filtered);

					return { deleted: true, id: templateId };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Delete template error: ${String(error)}`);
					throw new Error("Failed to delete template");
				}
			},
		},

		/**
		 * POST /reviewpulse/applyTemplate
		 * Apply a template to a review — substitute variables and return filled text.
		 */
		applyTemplate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const templateId = String(input.templateId ?? "");
					const reviewId = String(input.reviewId ?? "");

					if (!templateId || !reviewId) {
						throw new Error("Template ID and Review ID are required");
					}

					const templateJson = await ctx.kv.get<ResponseTemplate | null>(`template:${templateId}`);
					const template = templateJson;
					if (!template) {
						throw new Error("Template not found");
					}

					const reviewJson = await ctx.kv.get<ReviewRecord | null>(`review:${reviewId}`);
					const review = reviewJson;
					if (!review) {
						throw new Error("Review not found");
					}

					const businessName = await ctx.kv.get<string>("settings:business-name") ?? "Our Business";

					// Substitute variables
					let filledText = template.body;
					filledText = filledText.replace(/\{authorName\}/g, review.author);
					filledText = filledText.replace(/\{businessName\}/g, businessName);
					filledText = filledText.replace(/\{rating\}/g, String(review.rating));

					return { filledText, templateId, reviewId };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Apply template error: ${String(error)}`);
					throw new Error("Failed to apply template");
				}
			},
		},

		// =================================================================
		// Wave 3: Review Request Campaigns
		// =================================================================

		/**
		 * POST /reviewpulse/createCampaign
		 * Create an email campaign to request reviews.
		 */
		createCampaign: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const name = String(input.name ?? "").trim();
					const recipientEmails = (input.recipientEmails ?? []) as string[];
					const message = String(input.message ?? "").trim();
					const googleReviewUrl = input.googleReviewUrl ? String(input.googleReviewUrl) : undefined;
					const yelpReviewUrl = input.yelpReviewUrl ? String(input.yelpReviewUrl) : undefined;

					if (!name) {
						throw new Error("Campaign name is required");
					}

					if (!Array.isArray(recipientEmails) || recipientEmails.length === 0) {
						throw new Error("At least one recipient email is required");
					}

					if (recipientEmails.length > 50) {
						throw new Error("Maximum 50 recipients per campaign");
					}

					if (!message) {
						throw new Error("Campaign message is required");
					}

					const campaign: Campaign = {
						id: generateId(),
						name,
						recipientEmails,
						message,
						googleReviewUrl,
						yelpReviewUrl,
						status: "draft",
						sentCount: 0,
						createdAt: new Date().toISOString(),
					};

					await ctx.kv.set(`campaign:${campaign.id}`, campaign);

					// Update campaigns list
					const listJson = await ctx.kv.get<string[]>("campaigns:list");
					const ids: string[] = (listJson ?? []);
					ids.push(campaign.id);
					await ctx.kv.set("campaigns:list", ids);

					return { campaign };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Create campaign error: ${String(error)}`);
					throw new Error("Failed to create campaign");
				}
			},
		},

		/**
		 * POST /reviewpulse/sendCampaign
		 * Send a campaign's emails. Rate limited to 50 emails per campaign.
		 */
		sendCampaign: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const campaignId = String(input.campaignId ?? "");

					if (!campaignId) {
						throw new Error("Campaign ID required");
					}

					const json = await ctx.kv.get<Campaign | null>(`campaign:${campaignId}`);
					if (!json) {
						throw new Error("Campaign not found");
					}

					const campaign = json;
					if (!campaign) {
						throw new Error("Campaign not found");
					}

					if (campaign.status === "sent") {
						throw new Error("Campaign has already been sent");
					}

					const businessName = await ctx.kv.get<string>("settings:business-name") ?? "Our Business";

					// Update status to sending
					campaign.status = "sending";
					await ctx.kv.set(`campaign:${campaignId}`, campaign);

					const html = generateReviewRequestHTML(
						businessName,
						campaign.message,
						campaign.googleReviewUrl,
						campaign.yelpReviewUrl,
					);

					let sentCount = 0;
					let failCount = 0;
					const maxEmails = 50;
					const emailsToSend = campaign.recipientEmails.slice(0, maxEmails);

					for (const email of emailsToSend) {
						try {
							const sent = await sendEmail(ctx, {
								to: email,
								subject: `${businessName} would love your feedback!`,
								html,
							});
							if (sent) {
								sentCount++;
							} else {
								failCount++;
							}
						} catch {
							failCount++;
						}
					}

					campaign.sentCount = sentCount;
					campaign.status = sentCount > 0 ? "sent" : "failed";
					campaign.sentAt = new Date().toISOString();
					await ctx.kv.set(`campaign:${campaignId}`, campaign);

					return {
						campaign,
						sentCount,
						failCount,
						total: emailsToSend.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Send campaign error: ${String(error)}`);
					throw new Error("Failed to send campaign");
				}
			},
		},

		/**
		 * GET /reviewpulse/listCampaigns
		 * Return all campaigns with status.
		 */
		listCampaigns: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const listJson = await ctx.kv.get<string[]>("campaigns:list");
					const ids: string[] = (listJson ?? []);
					const campaigns: Campaign[] = [];

					for (const id of ids) {
						const json = await ctx.kv.get<Campaign | null>(`campaign:${id}`);
						const campaign = json;
						if (campaign) campaigns.push(campaign);
					}

					return { campaigns };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`List campaigns error: ${String(error)}`);
					throw new Error("Failed to list campaigns");
				}
			},
		},

		// =================================================================
		// Wave 3: Analytics Dashboard
		// =================================================================

		/**
		 * GET /reviewpulse/analyticsData
		 * Return analytics data: rating trends, volume by source, response rate, distribution.
		 */
		analyticsData: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const range = String(input.range ?? "365d");

					// Parse date range
					let daysBack = 365;
					if (range === "30d") daysBack = 30;
					else if (range === "90d") daysBack = 90;
					else if (range === "365d") daysBack = 365;

					const allReviews = await getAllReviews(ctx);
					const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
					const reviews = allReviews.filter((r) => new Date(r.date) >= cutoff);

					// Rating trend: average rating per month
					const monthlyData = new Map<string, { sum: number; count: number }>();
					for (const r of reviews) {
						const d = new Date(r.date);
						const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
						const existing = monthlyData.get(monthKey) ?? { sum: 0, count: 0 };
						existing.sum += r.rating;
						existing.count++;
						monthlyData.set(monthKey, existing);
					}

					const ratingTrend = Array.from(monthlyData.entries())
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([month, data]) => ({
							month,
							averageRating: Math.round((data.sum / data.count) * 10) / 10,
							count: data.count,
						}));

					// Volume by source per month
					const sourceMonthly = new Map<string, Record<string, number>>();
					for (const r of reviews) {
						const d = new Date(r.date);
						const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
						const existing = sourceMonthly.get(monthKey) ?? { google: 0, yelp: 0, manual: 0 };
						if (r.source in existing) {
							existing[r.source]++;
						}
						sourceMonthly.set(monthKey, existing);
					}

					const volumeBySource = Array.from(sourceMonthly.entries())
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([month, sources]) => ({ month, ...sources }));

					// Response rate
					const totalReviews = reviews.length;
					const repliedReviews = reviews.filter((r) => r.replyText).length;
					const responseRate = totalReviews > 0
						? Math.round((repliedReviews / totalReviews) * 100)
						: 0;

					// Rating distribution
					const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
					for (const r of reviews) {
						if (r.rating >= 1 && r.rating <= 5) {
							ratingDistribution[r.rating]++;
						}
					}

					return {
						range,
						totalReviews,
						ratingTrend,
						volumeBySource,
						responseRate,
						repliedReviews,
						ratingDistribution,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Analytics data error: ${String(error)}`);
					throw new Error("Failed to fetch analytics data");
				}
			},
		},

		/**
		 * GET /reviewpulse/analyticsExport
		 * Export analytics data as CSV.
		 */
		analyticsExport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const range = String(input.range ?? "365d");

					let daysBack = 365;
					if (range === "30d") daysBack = 30;
					else if (range === "90d") daysBack = 90;

					const allReviews = await getAllReviews(ctx);
					const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
					const reviews = allReviews.filter((r) => new Date(r.date) >= cutoff);

					// CSV header
					const lines = ["Date,Author,Source,Rating,Has Reply,Text"];

					for (const r of reviews) {
						const text = r.text.replace(/"/g, '""');
						lines.push(
							`${r.date},${r.author},${r.source},${r.rating},${r.replyText ? "Yes" : "No"},"${text}"`,
						);
					}

					return {
						csv: lines.join("\n"),
						filename: `reviewpulse-export-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
						totalRows: reviews.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Analytics export error: ${String(error)}`);
					throw new Error("Failed to export analytics");
				}
			},
		},

		/**
		 * GET /reviewpulse/adminAnalyticsPage
		 * Return HTML for the analytics admin page with inline SVG charts.
		 */
		adminAnalyticsPage: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const range = String(input.range ?? "365d");

					let daysBack = 365;
					if (range === "30d") daysBack = 30;
					else if (range === "90d") daysBack = 90;

					const allReviews = await getAllReviews(ctx);
					const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
					const reviews = allReviews.filter((r) => new Date(r.date) >= cutoff);

					// Compute data for charts
					const monthlyData = new Map<string, { sum: number; count: number }>();
					const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
					const sourceTotals: Record<string, number> = { google: 0, yelp: 0, manual: 0 };
					let repliedCount = 0;

					for (const r of reviews) {
						const d = new Date(r.date);
						const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
						const e = monthlyData.get(mk) ?? { sum: 0, count: 0 };
						e.sum += r.rating;
						e.count++;
						monthlyData.set(mk, e);

						if (r.rating >= 1 && r.rating <= 5) ratingDist[r.rating]++;
						if (r.source in sourceTotals) sourceTotals[r.source]++;
						if (r.replyText) repliedCount++;
					}

					const months = Array.from(monthlyData.entries()).sort(([a], [b]) => a.localeCompare(b));
					const responseRate = reviews.length > 0 ? Math.round((repliedCount / reviews.length) * 100) : 0;

					// Build rating trend line chart (SVG)
					const chartW = 600;
					const chartH = 200;
					let trendSvg = "";
					if (months.length > 0) {
						const points = months.map(([, d], i) => {
							const x = months.length === 1 ? chartW / 2 : (i / (months.length - 1)) * (chartW - 60) + 30;
							const avg = d.sum / d.count;
							const y = chartH - 20 - ((avg - 1) / 4) * (chartH - 40);
							return { x, y, avg: Math.round(avg * 10) / 10 };
						});
						const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
						const dots = points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#C4704B"/>`).join("");
						const labels = months.map(([m], i) => {
							const x = months.length === 1 ? chartW / 2 : (i / (months.length - 1)) * (chartW - 60) + 30;
							return `<text x="${x}" y="${chartH}" text-anchor="middle" font-size="10" fill="#666">${m.slice(5)}</text>`;
						}).join("");
						trendSvg = `<svg width="${chartW}" height="${chartH + 10}" viewBox="0 0 ${chartW} ${chartH + 10}" xmlns="http://www.w3.org/2000/svg">
							<path d="${pathD}" fill="none" stroke="#C4704B" stroke-width="2"/>
							${dots}${labels}
						</svg>`;
					} else {
						trendSvg = '<p style="color:#999;font-style:italic;">No data for the selected period.</p>';
					}

					// Rating distribution bar chart
					const maxCount = Math.max(...Object.values(ratingDist), 1);
					const barChartBars = [1, 2, 3, 4, 5].map((star) => {
						const count = ratingDist[star];
						const barH = (count / maxCount) * 140;
						const x = (star - 1) * 110 + 30;
						return `<rect x="${x}" y="${160 - barH}" width="80" height="${barH}" fill="#D4A853" rx="4"/>
							<text x="${x + 40}" y="${175}" text-anchor="middle" font-size="12" fill="#666">${star} star</text>
							<text x="${x + 40}" y="${155 - barH}" text-anchor="middle" font-size="11" fill="#2c2c2c">${count}</text>`;
					}).join("");
					const distSvg = `<svg width="600" height="190" viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg">${barChartBars}</svg>`;

					// Source distribution bar chart
					const sourceEntries = Object.entries(sourceTotals);
					const maxSource = Math.max(...sourceEntries.map(([, v]) => v), 1);
					const sourceColors: Record<string, string> = { google: "#4285F4", yelp: "#D32323", manual: "#7A8B6F" };
					const sourceBars = sourceEntries.map(([source, count], i) => {
						const barH = (count / maxSource) * 140;
						const x = i * 180 + 30;
						const color = sourceColors[source] ?? "#666";
						return `<rect x="${x}" y="${160 - barH}" width="140" height="${barH}" fill="${color}" rx="4"/>
							<text x="${x + 70}" y="${175}" text-anchor="middle" font-size="12" fill="#666">${source}</text>
							<text x="${x + 70}" y="${155 - barH}" text-anchor="middle" font-size="11" fill="#2c2c2c">${count}</text>`;
					}).join("");
					const sourceSvg = `<svg width="600" height="190" viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg">${sourceBars}</svg>`;

					const html = `<div class="reviewpulse" style="font-family:'Source Sans 3',-apple-system,sans-serif;color:#2c2c2c;max-width:1200px;margin:0 auto;padding:2rem;">
	<div style="border-bottom:2px solid #d4a853;padding-bottom:1rem;margin-bottom:2rem;">
		<h1 style="font-family:Lora,serif;font-size:2rem;margin:0 0 0.25rem;">Analytics Dashboard</h1>
		<p style="color:#666;font-size:0.95rem;margin:0;">${reviews.length} reviews in the last ${daysBack} days | Response rate: ${responseRate}%</p>
	</div>

	<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">
		<div style="background:#faf8f5;border:1px solid #e5e5e5;border-radius:8px;padding:1.25rem;">
			<p style="font-size:0.8rem;font-weight:600;text-transform:uppercase;color:#7a8b6f;margin:0 0 0.5rem;">Total Reviews</p>
			<p style="font-family:Lora,serif;font-size:1.75rem;font-weight:700;margin:0;color:#c4704b;">${reviews.length}</p>
		</div>
		<div style="background:#faf8f5;border:1px solid #e5e5e5;border-radius:8px;padding:1.25rem;">
			<p style="font-size:0.8rem;font-weight:600;text-transform:uppercase;color:#7a8b6f;margin:0 0 0.5rem;">Response Rate</p>
			<p style="font-family:Lora,serif;font-size:1.75rem;font-weight:700;margin:0;color:#c4704b;">${responseRate}%</p>
		</div>
		<div style="background:#faf8f5;border:1px solid #e5e5e5;border-radius:8px;padding:1.25rem;">
			<p style="font-size:0.8rem;font-weight:600;text-transform:uppercase;color:#7a8b6f;margin:0 0 0.5rem;">Avg Rating</p>
			<p style="font-family:Lora,serif;font-size:1.75rem;font-weight:700;margin:0;color:#c4704b;">${reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "N/A"}</p>
		</div>
	</div>

	<div style="background:#faf8f5;border:1px solid #e5e5e5;border-radius:8px;padding:1.25rem;margin-bottom:2rem;">
		<h2 style="font-family:Lora,serif;font-size:1.25rem;margin:0 0 1rem;">Rating Trend</h2>
		${trendSvg}
	</div>

	<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
		<div style="background:#faf8f5;border:1px solid #e5e5e5;border-radius:8px;padding:1.25rem;">
			<h2 style="font-family:Lora,serif;font-size:1.25rem;margin:0 0 1rem;">Rating Distribution</h2>
			${distSvg}
		</div>
		<div style="background:#faf8f5;border:1px solid #e5e5e5;border-radius:8px;padding:1.25rem;">
			<h2 style="font-family:Lora,serif;font-size:1.25rem;margin:0 0 1rem;">Reviews by Source</h2>
			${sourceSvg}
		</div>
	</div>
</div>`;

					return { html };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Analytics page error: ${String(error)}`);
					throw new Error("Failed to render analytics page");
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
		 * Admin settings page: Google Place ID, Yelp Business ID,
		 * notification preferences, widget display options, sync button.
		 */
		settingsPage: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				const rc = routeCtx as Record<string, unknown>;
				const googlePlaceId = (await ctx.kv.get<string>("settings:google-place-id")) ?? "";
				const yelpBusinessId = (await ctx.kv.get<string>("settings:yelp-business-id")) ?? "";
				const notifJson = await ctx.kv.get<Record<string, unknown>>("settings:notifications");
				const notifSettings = (notifJson ?? {});
				const displayJson = await ctx.kv.get<Record<string, unknown>>("settings:display");
				const displaySettings = (displayJson ?? {});
				const syncCursor = (await ctx.kv.get<string>("reviews:sync-cursor")) ?? "Never";

				const notifEmails = Array.isArray(notifSettings.emails)
					? (notifSettings.emails as string[]).join(", ")
					: "";
				const notifThreshold = typeof notifSettings.threshold === "number"
					? notifSettings.threshold
					: 3;
				const notifEnabled = notifSettings.enabled !== false;

				const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

				const html = `<div class="reviewpulse-settings" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; padding: 24px;">
	<h1 style="font-size: 24px; color: #2C2C2C; margin: 0 0 24px;">ReviewPulse Settings</h1>

	<form id="reviewpulse-settings-form" method="POST" action="/_emdash/api/plugins/reviewpulse/settings">
		<fieldset style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
			<legend style="font-size: 16px; font-weight: 600; color: #C4704B; padding: 0 8px;">Review Sources</legend>

			<label style="display: block; margin-bottom: 16px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Google Place ID</span>
				<input type="text" name="googlePlaceId" value="${escapeAttr(googlePlaceId)}"
					placeholder="ChIJ..." style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
			</label>

			<label style="display: block; margin-bottom: 8px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Yelp Business ID</span>
				<input type="text" name="yelpBusinessId" value="${escapeAttr(yelpBusinessId)}"
					placeholder="my-business-city" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
			</label>
		</fieldset>

		<fieldset style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
			<legend style="font-size: 16px; font-weight: 600; color: #C4704B; padding: 0 8px;">Email Notifications</legend>

			<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
				<input type="checkbox" name="notifEnabled" ${notifEnabled ? "checked" : ""} />
				<span style="font-size: 14px; color: #2C2C2C;">Enable email notifications for new reviews</span>
			</label>

			<label style="display: block; margin-bottom: 16px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Notification Email Addresses (comma-separated)</span>
				<input type="text" name="notifEmails" value="${escapeAttr(notifEmails)}"
					placeholder="admin@example.com, manager@example.com" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;" />
			</label>

			<label style="display: block; margin-bottom: 8px;">
				<span style="display: block; font-size: 14px; font-weight: 600; color: #7A8B6F; margin-bottom: 4px;">Alert Threshold (send negative alert for reviews at or below this rating)</span>
				<select name="notifThreshold" style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
					${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === notifThreshold ? "selected" : ""}>${n} star${n > 1 ? "s" : ""}</option>`).join("")}
				</select>
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
				<span style="font-size: 14px; color: #2C2C2C;">Show author names</span>
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
			Sync Now
		</button>
		<span style="font-size: 13px; color: #666;">Last sync: ${escapeAttr(syncCursor)}</span>
	</div>
</div>`;

				return { html };
			},
		},
	},
});
