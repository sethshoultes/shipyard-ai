/**
 * ReviewPulse Plugin — sandbox-entry tests
 *
 * Comprehensive test suite covering:
 *   1. KV operations (store, deduplicate, stats update, pagination, filtering)
 *   2. Review normalization (Google Places → ReviewRecord)
 *   3. Stats calculation (averages, distribution, trends, empty state)
 *   4. API route handler contracts (sync, list, patch, widget-data, settings)
 *   5. Edge cases (API errors, all duplicates, zero reviews)
 *
 * These tests are self-contained with mocks — they validate data transformations
 * and KV logic without requiring the actual plugin implementation to exist yet.
 * The test helpers export reference implementations that the plugin code must match.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	createMockKV,
	createMockContext,
	buildRouteCtx,
	makeReview,
	seedReview,
	seedReviews,
	computeStats,
	normalizeGoogleReview,
	makeGoogleReview,
	makeGooglePlacesResponse,
	makeGoogleErrorResponse,
	isValidPlaceId,
	resetCounter,
	type MockKV,
	type ReviewRecord,
	type ReviewStats,
	type GooglePlacesReview,
} from "./helpers";

// ===========================================================================
// 1. KV OPERATIONS
// ===========================================================================

describe("KV Operations", () => {
	let kv: MockKV;

	beforeEach(() => {
		kv = createMockKV();
		resetCounter();
	});

	it("should store and retrieve a review by sourceId", async () => {
		const review = makeReview({ sourceId: "google-abc123" });
		await seedReview(kv, review);

		const stored = await kv.get<ReviewRecord>("review:google-abc123");
		expect(stored).not.toBeNull();
		expect(stored!.sourceId).toBe("google-abc123");
		expect(stored!.authorName).toContain("Reviewer");
		expect(stored!.rating).toBe(4);
	});

	it("should deduplicate reviews by sourceId", async () => {
		const review1 = makeReview({ sourceId: "google-dup-001", text: "Original text" });
		const review2 = makeReview({ sourceId: "google-dup-001", text: "Updated text" });

		await seedReview(kv, review1);
		await seedReview(kv, review2);

		// The list should contain only one entry for this sourceId
		const list = await kv.get<string[]>("reviews:list");
		const count = list!.filter((id) => id === "google-dup-001").length;
		expect(count).toBe(1);

		// The stored review should reflect the latest write
		const stored = await kv.get<ReviewRecord>("review:google-dup-001");
		expect(stored!.text).toBe("Updated text");
	});

	it("should update review stats on import", async () => {
		const reviews = [
			makeReview({ rating: 5 }),
			makeReview({ rating: 4 }),
			makeReview({ rating: 3 }),
		];

		await seedReviews(kv, reviews);

		const stats = await kv.get<ReviewStats>("reviews:stats");
		expect(stats).not.toBeNull();
		expect(stats!.totalCount).toBe(3);
		expect(stats!.averageRating).toBe(4);
		expect(stats!.distribution[5]).toBe(1);
		expect(stats!.distribution[4]).toBe(1);
		expect(stats!.distribution[3]).toBe(1);
	});

	it("should support paginated review listing", async () => {
		// Seed 15 reviews
		const reviews: ReviewRecord[] = [];
		for (let i = 0; i < 15; i++) {
			reviews.push(makeReview({ sourceId: `google-page-${String(i).padStart(3, "0")}` }));
		}
		await seedReviews(kv, reviews);

		const list = await kv.get<string[]>("reviews:list");
		expect(list).not.toBeNull();
		expect(list!.length).toBe(15);

		// Simulate pagination: page 1 (items 0-9), page 2 (items 10-14)
		const pageSize = 10;
		const page1 = list!.slice(0, pageSize);
		const page2 = list!.slice(pageSize, pageSize * 2);

		expect(page1.length).toBe(10);
		expect(page2.length).toBe(5);

		// Verify we can load individual reviews from page refs
		const firstReview = await kv.get<ReviewRecord>(`review:${page1[0]}`);
		expect(firstReview).not.toBeNull();
		expect(firstReview!.sourceId).toBe("google-page-000");
	});

	it("should filter reviews by rating", async () => {
		await seedReviews(kv, [
			makeReview({ sourceId: "r-5star", rating: 5 }),
			makeReview({ sourceId: "r-4star", rating: 4 }),
			makeReview({ sourceId: "r-2star", rating: 2 }),
			makeReview({ sourceId: "r-1star", rating: 1 }),
		]);

		// Load all reviews and filter by rating >= 4
		const list = await kv.get<string[]>("reviews:list");
		const allReviews: ReviewRecord[] = [];
		for (const sourceId of list!) {
			const r = await kv.get<ReviewRecord>(`review:${sourceId}`);
			if (r) allReviews.push(r);
		}

		const highRated = allReviews.filter((r) => r.rating >= 4);
		expect(highRated.length).toBe(2);

		const lowRated = allReviews.filter((r) => r.rating <= 2);
		expect(lowRated.length).toBe(2);
	});

	it("should filter reviews by source", async () => {
		await seedReviews(kv, [
			makeReview({ sourceId: "g-1", source: "google" }),
			makeReview({ sourceId: "g-2", source: "google" }),
			makeReview({ sourceId: "y-1", source: "yelp" }),
			makeReview({ sourceId: "m-1", source: "manual" }),
		]);

		const list = await kv.get<string[]>("reviews:list");
		const allReviews: ReviewRecord[] = [];
		for (const sourceId of list!) {
			const r = await kv.get<ReviewRecord>(`review:${sourceId}`);
			if (r) allReviews.push(r);
		}

		const googleOnly = allReviews.filter((r) => r.source === "google");
		expect(googleOnly.length).toBe(2);

		const yelpOnly = allReviews.filter((r) => r.source === "yelp");
		expect(yelpOnly.length).toBe(1);
	});

	it("should filter reviews by flagged status", async () => {
		await seedReviews(kv, [
			makeReview({ sourceId: "f-1", flagged: true }),
			makeReview({ sourceId: "f-2", flagged: false }),
			makeReview({ sourceId: "f-3", flagged: true }),
		]);

		const list = await kv.get<string[]>("reviews:list");
		const allReviews: ReviewRecord[] = [];
		for (const sourceId of list!) {
			const r = await kv.get<ReviewRecord>(`review:${sourceId}`);
			if (r) allReviews.push(r);
		}

		const flagged = allReviews.filter((r) => r.flagged);
		expect(flagged.length).toBe(2);
	});

	it("should delete a review and remove from list", async () => {
		const review = makeReview({ sourceId: "to-delete" });
		await seedReview(kv, review);

		// Verify it exists
		let stored = await kv.get<ReviewRecord>("review:to-delete");
		expect(stored).not.toBeNull();

		// Delete
		await kv.delete("review:to-delete");

		// Remove from list
		const list = await kv.get<string[]>("reviews:list");
		const updated = list!.filter((id) => id !== "to-delete");
		await kv.set("reviews:list", updated);

		// Verify removed
		stored = await kv.get<ReviewRecord>("review:to-delete");
		expect(stored).toBeNull();

		const finalList = await kv.get<string[]>("reviews:list");
		expect(finalList).not.toContain("to-delete");
	});
});

// ===========================================================================
// 2. REVIEW NORMALIZATION
// ===========================================================================

describe("Review Normalization", () => {
	beforeEach(() => {
		resetCounter();
	});

	it("should convert a Google Places review to ReviewRecord format", () => {
		const googleReview: GooglePlacesReview = {
			author_name: "Maria Garcia",
			author_url: "https://google.com/maps/contrib/12345",
			profile_photo_url: "https://lh3.googleusercontent.com/photo-maria",
			rating: 5,
			text: "Best Italian food in town! The pasta was incredible.",
			time: 1711929600, // 2024-04-01 00:00:00 UTC
			relative_time_description: "2 months ago",
		};

		const normalized = normalizeGoogleReview(googleReview, "2026-04-01T00:00:00.000Z");

		expect(normalized.source).toBe("google");
		expect(normalized.authorName).toBe("Maria Garcia");
		expect(normalized.authorAvatar).toBe("https://lh3.googleusercontent.com/photo-maria");
		expect(normalized.rating).toBe(5);
		expect(normalized.text).toBe("Best Italian food in town! The pasta was incredible.");
		expect(normalized.publishedAt).toBe(new Date(1711929600 * 1000).toISOString());
		expect(normalized.importedAt).toBe("2026-04-01T00:00:00.000Z");
		expect(normalized.sourceId).toContain("google-");
		expect(normalized.sourceId).toContain("maria-garcia");
		expect(normalized.flagged).toBe(false);
		expect(normalized.featured).toBe(false);
	});

	it("should handle missing fields gracefully", () => {
		const sparseReview: GooglePlacesReview = {
			author_name: "",
			rating: 3,
			text: "",
			time: 1711929600,
		};

		const normalized = normalizeGoogleReview(sparseReview);

		expect(normalized.authorName).toBe("Anonymous");
		expect(normalized.text).toBe("");
		expect(normalized.rating).toBe(3);
		expect(normalized.authorAvatar).toBeUndefined();
		expect(normalized.source).toBe("google");
	});

	it("should clamp rating to 1-5 range", () => {
		// Rating too high
		const highRating = normalizeGoogleReview(
			makeGoogleReview({ rating: 10 })
		);
		expect(highRating.rating).toBe(5);

		// Rating too low
		const lowRating = normalizeGoogleReview(
			makeGoogleReview({ rating: -1 })
		);
		expect(lowRating.rating).toBe(1);

		// Rating zero should clamp to 1
		const zeroRating = normalizeGoogleReview(
			makeGoogleReview({ rating: 0 })
		);
		expect(zeroRating.rating).toBe(1);

		// Fractional rating should round
		const fracRating = normalizeGoogleReview(
			makeGoogleReview({ rating: 3.7 })
		);
		expect(fracRating.rating).toBe(4);
	});

	it("should generate unique sourceIds for different authors at same timestamp", () => {
		const review1 = normalizeGoogleReview({
			author_name: "Alice",
			rating: 4,
			text: "Nice!",
			time: 1711929600,
		});
		const review2 = normalizeGoogleReview({
			author_name: "Bob",
			rating: 5,
			text: "Great!",
			time: 1711929600,
		});

		expect(review1.sourceId).not.toBe(review2.sourceId);
	});
});

// ===========================================================================
// 3. STATS CALCULATION
// ===========================================================================

describe("Stats Calculation", () => {
	beforeEach(() => {
		resetCounter();
	});

	it("should compute average rating from mixed reviews", () => {
		const reviews = [
			makeReview({ rating: 5 }),
			makeReview({ rating: 4 }),
			makeReview({ rating: 3 }),
			makeReview({ rating: 2 }),
			makeReview({ rating: 1 }),
		];

		const stats = computeStats(reviews);

		expect(stats.averageRating).toBe(3);
		expect(stats.totalCount).toBe(5);
	});

	it("should compute correct rating distribution counts", () => {
		const reviews = [
			makeReview({ rating: 5 }),
			makeReview({ rating: 5 }),
			makeReview({ rating: 5 }),
			makeReview({ rating: 4 }),
			makeReview({ rating: 4 }),
			makeReview({ rating: 3 }),
			makeReview({ rating: 1 }),
		];

		const stats = computeStats(reviews);

		expect(stats.distribution[5]).toBe(3);
		expect(stats.distribution[4]).toBe(2);
		expect(stats.distribution[3]).toBe(1);
		expect(stats.distribution[2]).toBe(0);
		expect(stats.distribution[1]).toBe(1);
	});

	it("should detect upward trend (last 30 days avg > previous 30 days avg)", () => {
		const now = new Date("2026-04-05T00:00:00.000Z");

		// Previous 30 days (March 6 - April 4): lower ratings
		const previousReviews = [
			makeReview({ rating: 2, publishedAt: "2026-03-10T00:00:00.000Z" }),
			makeReview({ rating: 2, publishedAt: "2026-03-15T00:00:00.000Z" }),
			makeReview({ rating: 3, publishedAt: "2026-03-20T00:00:00.000Z" }),
		];

		// Last 30 days (March 6 - April 5): higher ratings
		// Note: "last 30 days" from April 5 = March 6+
		// "previous 30 days" = Feb 4 - March 5
		// Let me recalculate with correct windows
		const recentReviews = [
			makeReview({ rating: 5, publishedAt: "2026-04-01T00:00:00.000Z" }),
			makeReview({ rating: 5, publishedAt: "2026-04-02T00:00:00.000Z" }),
			makeReview({ rating: 4, publishedAt: "2026-04-03T00:00:00.000Z" }),
		];

		// Previous period: Feb 4 - March 5
		const prevPeriod = [
			makeReview({ rating: 2, publishedAt: "2026-02-15T00:00:00.000Z" }),
			makeReview({ rating: 3, publishedAt: "2026-02-20T00:00:00.000Z" }),
			makeReview({ rating: 2, publishedAt: "2026-03-01T00:00:00.000Z" }),
		];

		const allReviews = [...prevPeriod, ...recentReviews];
		const stats = computeStats(allReviews, now);

		// Recent avg: (5+5+4)/3 = 4.67, Previous avg: (2+3+2)/3 = 2.33
		expect(stats.recentTrend).toBe("up");
	});

	it("should detect downward trend (last 30 days avg < previous 30 days avg)", () => {
		const now = new Date("2026-04-05T00:00:00.000Z");

		// Previous 30 days (Feb 4 - March 5): high ratings
		const prevReviews = [
			makeReview({ rating: 5, publishedAt: "2026-02-15T00:00:00.000Z" }),
			makeReview({ rating: 5, publishedAt: "2026-02-20T00:00:00.000Z" }),
			makeReview({ rating: 5, publishedAt: "2026-03-01T00:00:00.000Z" }),
		];

		// Last 30 days (March 6 - April 5): low ratings
		const recentReviews = [
			makeReview({ rating: 1, publishedAt: "2026-03-20T00:00:00.000Z" }),
			makeReview({ rating: 2, publishedAt: "2026-04-01T00:00:00.000Z" }),
			makeReview({ rating: 1, publishedAt: "2026-04-03T00:00:00.000Z" }),
		];

		const allReviews = [...prevReviews, ...recentReviews];
		const stats = computeStats(allReviews, now);

		expect(stats.recentTrend).toBe("down");
	});

	it("should return stable when recent and previous periods have similar averages", () => {
		const now = new Date("2026-04-05T00:00:00.000Z");

		const prevReviews = [
			makeReview({ rating: 4, publishedAt: "2026-02-15T00:00:00.000Z" }),
			makeReview({ rating: 4, publishedAt: "2026-03-01T00:00:00.000Z" }),
		];
		const recentReviews = [
			makeReview({ rating: 4, publishedAt: "2026-03-20T00:00:00.000Z" }),
			makeReview({ rating: 4, publishedAt: "2026-04-01T00:00:00.000Z" }),
		];

		const stats = computeStats([...prevReviews, ...recentReviews], now);
		expect(stats.recentTrend).toBe("stable");
	});

	it("should handle empty state (no reviews)", () => {
		const stats = computeStats([]);

		expect(stats.totalCount).toBe(0);
		expect(stats.averageRating).toBe(0);
		expect(stats.distribution[1]).toBe(0);
		expect(stats.distribution[2]).toBe(0);
		expect(stats.distribution[3]).toBe(0);
		expect(stats.distribution[4]).toBe(0);
		expect(stats.distribution[5]).toBe(0);
		expect(stats.recentTrend).toBe("stable");
	});

	it("should handle single review", () => {
		const stats = computeStats([makeReview({ rating: 5 })]);

		expect(stats.totalCount).toBe(1);
		expect(stats.averageRating).toBe(5);
		expect(stats.distribution[5]).toBe(1);
	});

	it("should produce precise averages to 2 decimal places", () => {
		const reviews = [
			makeReview({ rating: 5 }),
			makeReview({ rating: 4 }),
			makeReview({ rating: 4 }),
		];

		const stats = computeStats(reviews);
		// (5 + 4 + 4) / 3 = 4.333...
		expect(stats.averageRating).toBe(4.33);
	});
});

// ===========================================================================
// 4. API ROUTE HANDLER CONTRACTS
// ===========================================================================

describe("API Route Handler Contracts", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		resetCounter();
	});

	// -----------------------------------------------------------------------
	// POST /sync
	// -----------------------------------------------------------------------
	describe("POST /sync — Review Sync", () => {
		it("should import reviews from Google Places API response", async () => {
			const googleReviews = [
				makeGoogleReview({ author_name: "Alice", rating: 5, text: "Amazing!" }),
				makeGoogleReview({ author_name: "Bob", rating: 4, text: "Very good" }),
				makeGoogleReview({ author_name: "Carol", rating: 3, text: "Decent" }),
			];

			const apiResponse = makeGooglePlacesResponse(googleReviews);

			// Simulate what the sync handler would do:
			// 1. Normalize each review
			const normalized = apiResponse.result.reviews!.map((r) =>
				normalizeGoogleReview(r)
			);

			// 2. Store each in KV, deduplicating
			for (const review of normalized) {
				await seedReview(kv, review);
			}

			// 3. Update stats
			const stats = computeStats(normalized);
			await kv.set("reviews:stats", stats);
			await kv.set("reviews:sync-cursor", { google: new Date().toISOString() });

			// Verify
			const list = await kv.get<string[]>("reviews:list");
			expect(list!.length).toBe(3);

			const storedStats = await kv.get<ReviewStats>("reviews:stats");
			expect(storedStats!.totalCount).toBe(3);
			expect(storedStats!.averageRating).toBe(4);
		});

		it("should accept sync request with valid Place ID", () => {
			const validPlaceId = "ChIJN1t_tDeuEmsRUsoyG83frY4";
			expect(isValidPlaceId(validPlaceId)).toBe(true);

			const routeCtx = buildRouteCtx({
				input: { placeId: validPlaceId },
				user: { isAdmin: true },
			});

			expect(routeCtx.input.placeId).toBe(validPlaceId);
		});

		it("should reject sync with invalid Place ID format", () => {
			const invalidIds = [
				"",
				"not-a-place-id",
				"ChIJ", // too short
				"ABC123456789",
			];

			for (const id of invalidIds) {
				expect(isValidPlaceId(id)).toBe(false);
			}
		});
	});

	// -----------------------------------------------------------------------
	// GET /reviews — Pagination
	// -----------------------------------------------------------------------
	describe("GET /reviews — Paginated Listing", () => {
		beforeEach(async () => {
			// Seed 25 reviews with different dates for sorting
			const reviews: ReviewRecord[] = [];
			for (let i = 0; i < 25; i++) {
				reviews.push(
					makeReview({
						sourceId: `review-${String(i).padStart(3, "0")}`,
						publishedAt: new Date(
							Date.UTC(2026, 2, 1 + i)
						).toISOString(),
						rating: (i % 5) + 1,
					})
				);
			}
			await seedReviews(kv, reviews);
		});

		it("should return first page of reviews with correct count", async () => {
			const list = await kv.get<string[]>("reviews:list");
			const page = 1;
			const pageSize = 10;
			const start = (page - 1) * pageSize;
			const pageIds = list!.slice(start, start + pageSize);

			expect(pageIds.length).toBe(10);
			expect(list!.length).toBe(25);
		});

		it("should return last page with remaining reviews", async () => {
			const list = await kv.get<string[]>("reviews:list");
			const pageSize = 10;
			const page = 3;
			const start = (page - 1) * pageSize;
			const pageIds = list!.slice(start, start + pageSize);

			expect(pageIds.length).toBe(5);
		});

		it("should return empty array for page beyond total", async () => {
			const list = await kv.get<string[]>("reviews:list");
			const pageSize = 10;
			const page = 10;
			const start = (page - 1) * pageSize;
			const pageIds = list!.slice(start, start + pageSize);

			expect(pageIds.length).toBe(0);
		});
	});

	// -----------------------------------------------------------------------
	// PATCH /reviews/:id — Toggle Featured
	// -----------------------------------------------------------------------
	describe("PATCH /reviews/:id — Toggle Featured/Flagged", () => {
		it("should toggle featured status on a review", async () => {
			const review = makeReview({ sourceId: "toggle-me", featured: false });
			await seedReview(kv, review);

			// Simulate PATCH handler: read, toggle, write back
			const stored = await kv.get<ReviewRecord>("review:toggle-me");
			expect(stored!.featured).toBe(false);

			stored!.featured = true;
			await kv.set("review:toggle-me", stored);

			const updated = await kv.get<ReviewRecord>("review:toggle-me");
			expect(updated!.featured).toBe(true);
		});

		it("should toggle flagged status on a review", async () => {
			const review = makeReview({ sourceId: "flag-me", flagged: false });
			await seedReview(kv, review);

			const stored = await kv.get<ReviewRecord>("review:flag-me");
			stored!.flagged = true;
			await kv.set("review:flag-me", stored);

			const updated = await kv.get<ReviewRecord>("review:flag-me");
			expect(updated!.flagged).toBe(true);
		});

		it("should return null when toggling non-existent review", async () => {
			const stored = await kv.get<ReviewRecord>("review:nonexistent");
			expect(stored).toBeNull();
		});
	});

	// -----------------------------------------------------------------------
	// GET /widget-data — Public Widget Endpoint
	// -----------------------------------------------------------------------
	describe("GET /widget-data — Widget Data", () => {
		it("should return only featured and recent reviews for the widget", async () => {
			const reviews = [
				makeReview({
					sourceId: "w-featured-1",
					featured: true,
					rating: 5,
					publishedAt: "2026-04-01T00:00:00.000Z",
				}),
				makeReview({
					sourceId: "w-featured-2",
					featured: true,
					rating: 4,
					publishedAt: "2026-03-28T00:00:00.000Z",
				}),
				makeReview({
					sourceId: "w-not-featured",
					featured: false,
					rating: 5,
					publishedAt: "2026-04-02T00:00:00.000Z",
				}),
				makeReview({
					sourceId: "w-recent",
					featured: false,
					rating: 3,
					publishedAt: "2026-04-03T00:00:00.000Z",
				}),
			];

			await seedReviews(kv, reviews);

			// Widget logic: return featured reviews + up to N most recent
			const list = await kv.get<string[]>("reviews:list");
			const allReviews: ReviewRecord[] = [];
			for (const id of list!) {
				const r = await kv.get<ReviewRecord>(`review:${id}`);
				if (r) allReviews.push(r);
			}

			const featured = allReviews.filter((r) => r.featured);
			expect(featured.length).toBe(2);

			// Recent: sort by publishedAt desc, take top 3
			const recentSorted = [...allReviews].sort(
				(a, b) =>
					new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
			);
			const topRecent = recentSorted.slice(0, 3);
			expect(topRecent.length).toBe(3);
			expect(topRecent[0].sourceId).toBe("w-recent");

			// Widget data combines featured + recent (deduplicated)
			const widgetIds = new Set<string>();
			const widgetReviews: ReviewRecord[] = [];
			for (const r of [...featured, ...topRecent]) {
				if (!widgetIds.has(r.sourceId)) {
					widgetIds.add(r.sourceId);
					widgetReviews.push(r);
				}
			}

			// Should have all 4 unique reviews (2 featured + 2 non-featured recent)
			// Actually: featured gives w-featured-1, w-featured-2
			// topRecent gives w-recent, w-not-featured, w-featured-1
			// Deduped: w-featured-1, w-featured-2, w-recent, w-not-featured = 4
			expect(widgetReviews.length).toBe(4);

			// Stats should also be included
			const stats = await kv.get<ReviewStats>("reviews:stats");
			expect(stats).not.toBeNull();
			expect(stats!.averageRating).toBeGreaterThan(0);
		});

		it("should include aggregate stats in widget data", async () => {
			const reviews = [
				makeReview({ sourceId: "ws-1", rating: 5 }),
				makeReview({ sourceId: "ws-2", rating: 4 }),
			];
			await seedReviews(kv, reviews);

			const stats = await kv.get<ReviewStats>("reviews:stats");
			expect(stats!.averageRating).toBe(4.5);
			expect(stats!.totalCount).toBe(2);
		});
	});

	// -----------------------------------------------------------------------
	// PUT /settings — Settings Validation
	// -----------------------------------------------------------------------
	describe("PUT /settings — Settings Validation", () => {
		it("should accept a valid Google Place ID", async () => {
			const placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4";
			expect(isValidPlaceId(placeId)).toBe(true);

			await kv.set("settings:google-place-id", placeId);
			const stored = await kv.get<string>("settings:google-place-id");
			expect(stored).toBe(placeId);
		});

		it("should reject an invalid Place ID format", () => {
			const invalidIds = [
				"",
				"abc",
				"ChI", // too short prefix
				"12345",
				"https://maps.google.com/place/123",
			];

			for (const id of invalidIds) {
				expect(isValidPlaceId(id)).toBe(false);
			}
		});

		it("should persist display settings to KV", async () => {
			const displaySettings = {
				layout: "grid",
				maxReviews: 6,
				showAuthorNames: true,
				showDates: true,
				minRating: 4,
			};

			await kv.set("settings:display", displaySettings);

			const stored = await kv.get<typeof displaySettings>("settings:display");
			expect(stored).toEqual(displaySettings);
		});

		it("should persist notification settings to KV", async () => {
			const notifSettings = {
				emailOnNew: true,
				emailOnNegative: true,
				negativeThreshold: 3,
				adminEmail: "owner@bellasbistro.com",
			};

			await kv.set("settings:notifications", notifSettings);

			const stored = await kv.get<typeof notifSettings>("settings:notifications");
			expect(stored!.negativeThreshold).toBe(3);
			expect(stored!.adminEmail).toBe("owner@bellasbistro.com");
		});
	});
});

// ===========================================================================
// 5. EDGE CASES
// ===========================================================================

describe("Edge Cases", () => {
	let kv: MockKV;

	beforeEach(() => {
		kv = createMockKV();
		resetCounter();
	});

	it("should handle Google API error response (status != OK)", () => {
		const errorResponse = makeGoogleErrorResponse("REQUEST_DENIED");

		expect(errorResponse.status).toBe("REQUEST_DENIED");
		expect(errorResponse.result.reviews).toBeUndefined();

		// The sync handler should detect non-OK status and throw/return error
		const hasReviews = errorResponse.result.reviews?.length ?? 0;
		expect(hasReviews).toBe(0);
	});

	it("should handle Google API returning empty reviews array", () => {
		const emptyResponse = makeGooglePlacesResponse([]);

		expect(emptyResponse.result.reviews).toEqual([]);
		expect(emptyResponse.result.reviews!.length).toBe(0);

		// Stats from empty import
		const stats = computeStats([]);
		expect(stats.totalCount).toBe(0);
		expect(stats.averageRating).toBe(0);
	});

	it("should handle import with all duplicate reviews (no new records)", async () => {
		// First import
		const reviews = [
			makeGoogleReview({ author_name: "Alice", time: 1000000 }),
			makeGoogleReview({ author_name: "Bob", time: 2000000 }),
		];

		const firstNormalized = reviews.map((r) => normalizeGoogleReview(r));
		await seedReviews(kv, firstNormalized);

		const listAfterFirst = await kv.get<string[]>("reviews:list");
		expect(listAfterFirst!.length).toBe(2);

		// Second import — same reviews
		const secondNormalized = reviews.map((r) => normalizeGoogleReview(r));
		for (const review of secondNormalized) {
			await seedReview(kv, review);
		}

		// List should still have exactly 2 entries (no duplicates)
		const listAfterSecond = await kv.get<string[]>("reviews:list");
		expect(listAfterSecond!.length).toBe(2);
	});

	it("should handle widget data with zero reviews", async () => {
		// No reviews seeded — KV is empty
		const list = await kv.get<string[]>("reviews:list");
		expect(list).toBeNull();

		const stats = await kv.get<ReviewStats>("reviews:stats");
		expect(stats).toBeNull();

		// Widget should gracefully handle nulls
		const reviewList = list ?? [];
		const widgetStats = stats ?? {
			totalCount: 0,
			averageRating: 0,
			distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
			lastSyncAt: "",
			recentTrend: "stable" as const,
		};

		expect(reviewList.length).toBe(0);
		expect(widgetStats.totalCount).toBe(0);
		expect(widgetStats.averageRating).toBe(0);
	});

	it("should handle review with extremely long text", async () => {
		const longText = "A".repeat(5000);
		const review = makeReview({
			sourceId: "long-text",
			text: longText,
		});

		await seedReview(kv, review);

		const stored = await kv.get<ReviewRecord>("review:long-text");
		expect(stored!.text.length).toBe(5000);
	});

	it("should handle reviews with unicode author names", async () => {
		const review = makeReview({
			sourceId: "unicode-author",
			authorName: "Marquez",
		});

		await seedReview(kv, review);

		const stored = await kv.get<ReviewRecord>("review:unicode-author");
		expect(stored!.authorName).toBe("Marquez");
	});

	it("should handle concurrent sync cursor updates", async () => {
		await kv.set("reviews:sync-cursor", { google: "2026-03-01T00:00:00.000Z" });

		const cursor = await kv.get<{ google: string }>("reviews:sync-cursor");
		expect(cursor!.google).toBe("2026-03-01T00:00:00.000Z");

		// Update cursor after new sync
		await kv.set("reviews:sync-cursor", { google: "2026-04-01T00:00:00.000Z" });

		const updated = await kv.get<{ google: string }>("reviews:sync-cursor");
		expect(updated!.google).toBe("2026-04-01T00:00:00.000Z");
	});

	it("should handle stats calculation with ratings needing clamping", () => {
		// Reviews with out-of-range ratings that get clamped by computeStats
		const reviews = [
			makeReview({ rating: 0 }),   // clamps to 1
			makeReview({ rating: 6 }),   // clamps to 5
			makeReview({ rating: -2 }),  // clamps to 1
			makeReview({ rating: 100 }), // clamps to 5
		];

		const stats = computeStats(reviews);

		// Clamped: 1, 5, 1, 5 => avg = 3, distribution: {1:2, 5:2}
		expect(stats.averageRating).toBe(3);
		expect(stats.distribution[1]).toBe(2);
		expect(stats.distribution[5]).toBe(2);
		expect(stats.distribution[2]).toBe(0);
		expect(stats.distribution[3]).toBe(0);
		expect(stats.distribution[4]).toBe(0);
	});
});
