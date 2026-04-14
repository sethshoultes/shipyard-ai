/**
 * ReviewPulse sandbox-entry tests.
 *
 * Covers: KV operations, normalization, stats computation, API routes, edge cases.
 * MVP v1 test suite — 25+ tests covering core functionality.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	createMockKV,
	createMockContext,
	buildRouteCtx,
	createTestReview,
	seedReview,
	seedReviews,
	createRawGoogleReview,
} from "./helpers";
import type { MockKV } from "./helpers";
import { normalizeGoogleReview, normalizeYelpReview, computeStats } from "../sandbox-entry";
import type { ReviewRecord, ReviewStats } from "../sandbox-entry";

// ---------------------------------------------------------------------------
// Mock emdash module
// ---------------------------------------------------------------------------
vi.mock("emdash", () => ({
	definePlugin: (config: unknown) => config,
}));

// Import the plugin after mocking emdash
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let plugin: any;

beforeEach(async () => {
	vi.resetModules();
	vi.mock("emdash", () => ({
		definePlugin: (config: unknown) => config,
	}));
	const mod = await import("../sandbox-entry");
	plugin = mod.default;
});

// ---------------------------------------------------------------------------
// Google Review Normalization
// ---------------------------------------------------------------------------
describe("normalizeGoogleReview", () => {
	it("should normalize a standard Google review", () => {
		const raw = createRawGoogleReview();
		const result = normalizeGoogleReview(raw);

		expect(result.source).toBe("google");
		expect(result.author).toBe("John Smith");
		expect(result.rating).toBe(4);
		expect(result.text).toBe("Great place, friendly staff!");
		expect(result.featured).toBe(false);
		expect(result.id).toBeTruthy();
		expect(result.date).toBeTruthy();
	});

	it("should clamp rating to 1-5 range", () => {
		const tooHigh = normalizeGoogleReview({ ...createRawGoogleReview(), rating: 10 });
		expect(tooHigh.rating).toBe(5);

		const tooLow = normalizeGoogleReview({ ...createRawGoogleReview(), rating: -1 });
		expect(tooLow.rating).toBe(1);
	});

	it("should auto-flag reviews with rating <= 2", () => {
		const lowRating = normalizeGoogleReview({ ...createRawGoogleReview(), rating: 2 });
		expect(lowRating.flagged).toBe(true);

		const highRating = normalizeGoogleReview({ ...createRawGoogleReview(), rating: 4 });
		expect(highRating.flagged).toBe(false);
	});

	it("should handle missing author name", () => {
		const result = normalizeGoogleReview({ rating: 5, text: "Great!" });
		expect(result.author).toBe("Anonymous");
	});

	it("should handle missing text", () => {
		const result = normalizeGoogleReview({ author_name: "Test", rating: 3 });
		expect(result.text).toBe("");
	});

	it("should convert Unix timestamp to ISO date", () => {
		const ts = 1711929600; // 2024-04-01T00:00:00Z
		const result = normalizeGoogleReview({ ...createRawGoogleReview(), time: ts });
		expect(result.date).toContain("2024");
	});
});

// ---------------------------------------------------------------------------
// Yelp Review Normalization
// ---------------------------------------------------------------------------
describe("normalizeYelpReview", () => {
	it("should normalize a standard Yelp review", () => {
		const raw = {
			id: "yelp-review-123",
			rating: 4,
			text: "Great tacos and friendly staff!",
			time_created: "2026-03-10 14:30:00",
			user: { name: "Maria G." },
		};
		const result = normalizeYelpReview(raw);

		expect(result.source).toBe("yelp");
		expect(result.author).toBe("Maria G.");
		expect(result.rating).toBe(4);
		expect(result.text).toBe("Great tacos and friendly staff!");
		expect(result.featured).toBe(false);
		expect(result.flagged).toBe(false);
		expect(result.id).toBeTruthy();
		expect(result.date).toBeTruthy();
	});

	it("should auto-flag low-rating Yelp reviews", () => {
		const raw = {
			id: "yelp-review-456",
			rating: 1,
			text: "Terrible experience",
			time_created: "2026-03-11 10:00:00",
			user: { name: "Bob T." },
		};
		const result = normalizeYelpReview(raw);

		expect(result.flagged).toBe(true);
		expect(result.rating).toBe(1);
	});

	it("should handle missing user name gracefully", () => {
		const raw = {
			id: "yelp-review-789",
			rating: 3,
			text: "It was okay",
			time_created: "2026-03-12 09:00:00",
		};
		const result = normalizeYelpReview(raw);

		expect(result.author).toBe("Anonymous");
		expect(result.source).toBe("yelp");
	});
});

// ---------------------------------------------------------------------------
// Stats Computation
// ---------------------------------------------------------------------------
describe("computeStats", () => {
	it("should return zeroed stats for empty reviews", () => {
		const stats = computeStats([]);
		expect(stats.totalCount).toBe(0);
		expect(stats.averageRating).toBe(0);
		expect(stats.trend).toBe("stable");
		expect(stats.bySource.google).toBe(0);
	});

	it("should compute correct average rating", () => {
		const reviews: ReviewRecord[] = [
			createTestReview({ id: "r1", rating: 5 }) as ReviewRecord,
			createTestReview({ id: "r2", rating: 3 }) as ReviewRecord,
			createTestReview({ id: "r3", rating: 4 }) as ReviewRecord,
		];
		const stats = computeStats(reviews);
		expect(stats.averageRating).toBe(4);
		expect(stats.totalCount).toBe(3);
	});

	it("should count reviews by source", () => {
		const reviews: ReviewRecord[] = [
			createTestReview({ id: "r1", source: "google" }) as ReviewRecord,
			createTestReview({ id: "r2", source: "google" }) as ReviewRecord,
			createTestReview({ id: "r3", source: "yelp" }) as ReviewRecord,
			createTestReview({ id: "r4", source: "manual" }) as ReviewRecord,
		];
		const stats = computeStats(reviews);
		expect(stats.bySource.google).toBe(2);
		expect(stats.bySource.yelp).toBe(1);
		expect(stats.bySource.manual).toBe(1);
	});

	it("should detect upward trend", () => {
		const now = new Date();
		const recent = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
		const older = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString();

		const reviews: ReviewRecord[] = [
			createTestReview({ id: "r1", rating: 5, date: recent }) as ReviewRecord,
			createTestReview({ id: "r2", rating: 5, date: recent }) as ReviewRecord,
			createTestReview({ id: "r3", rating: 2, date: older }) as ReviewRecord,
			createTestReview({ id: "r4", rating: 2, date: older }) as ReviewRecord,
		];
		const stats = computeStats(reviews);
		expect(stats.trend).toBe("up");
	});

	it("should detect downward trend", () => {
		const now = new Date();
		const recent = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
		const older = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString();

		const reviews: ReviewRecord[] = [
			createTestReview({ id: "r1", rating: 2, date: recent }) as ReviewRecord,
			createTestReview({ id: "r2", rating: 1, date: recent }) as ReviewRecord,
			createTestReview({ id: "r3", rating: 5, date: older }) as ReviewRecord,
			createTestReview({ id: "r4", rating: 5, date: older }) as ReviewRecord,
		];
		const stats = computeStats(reviews);
		expect(stats.trend).toBe("down");
	});
});

// ---------------------------------------------------------------------------
// KV Operations via Routes
// ---------------------------------------------------------------------------
describe("reviews route (GET /reviews)", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);

		await seedReviews(kv, [
			createTestReview({ id: "rev-1", rating: 5, author: "Alice", date: "2026-03-20T10:00:00Z" }),
			createTestReview({ id: "rev-2", rating: 3, author: "Bob", source: "yelp", date: "2026-03-19T10:00:00Z" }),
			createTestReview({ id: "rev-3", rating: 1, author: "Charlie", flagged: true, date: "2026-03-18T10:00:00Z" }),
			createTestReview({ id: "rev-4", rating: 4, author: "Diana", featured: true, date: "2026-03-17T10:00:00Z" }),
			createTestReview({ id: "rev-5", rating: 5, author: "Eve", date: "2026-03-16T10:00:00Z" }),
		]);
	});

	it("should return all reviews paginated", async () => {
		const routeCtx = buildRouteCtx({ input: { page: "1", perPage: "10" } });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(5);
		expect(result.total).toBe(5);
		expect(result.page).toBe(1);
	});

	it("should paginate correctly", async () => {
		const routeCtx = buildRouteCtx({ input: { page: "1", perPage: "2" } });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(2);
		expect(result.total).toBe(5);
		expect(result.pages).toBe(3);
	});

	it("should filter by rating", async () => {
		const routeCtx = buildRouteCtx({ input: { rating: "5" } });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(2);
		expect(result.reviews.every((r: ReviewRecord) => r.rating === 5)).toBe(true);
	});

	it("should filter by source", async () => {
		const routeCtx = buildRouteCtx({ input: { source: "yelp" } });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(1);
		expect(result.reviews[0].source).toBe("yelp");
	});

	it("should filter by featured status", async () => {
		const routeCtx = buildRouteCtx({ input: { status: "featured" } });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(1);
		expect(result.reviews[0].featured).toBe(true);
	});

	it("should filter by flagged status", async () => {
		const routeCtx = buildRouteCtx({ input: { status: "flagged" } });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(1);
		expect(result.reviews[0].flagged).toBe(true);
	});

	it("should return reviews sorted by date descending", async () => {
		const routeCtx = buildRouteCtx({ input: {} });
		const result = await plugin.routes.reviews.handler(routeCtx, ctx);

		const dates = result.reviews.map((r: ReviewRecord) => new Date(r.date).getTime());
		for (let i = 1; i < dates.length; i++) {
			expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
		}
	});
});

// ---------------------------------------------------------------------------
// Review Detail Route
// ---------------------------------------------------------------------------
describe("reviewDetail route (GET /reviews/:id)", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		await seedReview(kv, createTestReview({ id: "detail-1", author: "Test User", rating: 4 }));
	});

	it("should return a single review by ID", async () => {
		const routeCtx = buildRouteCtx({ input: { id: "detail-1" } });
		const result = await plugin.routes.reviewDetail.handler(routeCtx, ctx);

		expect(result.review).toBeTruthy();
		expect(result.review.id).toBe("detail-1");
		expect(result.review.author).toBe("Test User");
	});

	it("should throw error for nonexistent review", async () => {
		const routeCtx = buildRouteCtx({ input: { id: "nonexistent" } });

		await expect(
			plugin.routes.reviewDetail.handler(routeCtx, ctx)
		).rejects.toThrow();
	});

	it("should throw error when no ID provided", async () => {
		const routeCtx = buildRouteCtx({ input: {} });

		await expect(
			plugin.routes.reviewDetail.handler(routeCtx, ctx)
		).rejects.toThrow();
	});
});

// ---------------------------------------------------------------------------
// Review Update Route (toggle featured/flagged)
// ---------------------------------------------------------------------------
describe("reviewUpdate route (PATCH /reviews/:id)", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		await seedReview(kv, createTestReview({ id: "update-1", featured: false, flagged: false }));
	});

	it("should toggle featured on a review", async () => {
		const routeCtx = buildRouteCtx({
			input: { id: "update-1", featured: true },
		});
		const result = await plugin.routes.reviewUpdate.handler(routeCtx, ctx);

		expect(result.review.featured).toBe(true);

		// Verify persisted to KV
		const stored = JSON.parse(kv._store.get("review:update-1")!);
		expect(stored.featured).toBe(true);
	});

	it("should toggle flagged on a review", async () => {
		const routeCtx = buildRouteCtx({
			input: { id: "update-1", flagged: true },
		});
		const result = await plugin.routes.reviewUpdate.handler(routeCtx, ctx);

		expect(result.review.flagged).toBe(true);
	});

	it("should throw error for nonexistent review", async () => {
		const routeCtx = buildRouteCtx({
			input: { id: "nonexistent", featured: true },
		});

		await expect(
			plugin.routes.reviewUpdate.handler(routeCtx, ctx)
		).rejects.toThrow();
	});
});

// ---------------------------------------------------------------------------
// Stats Route
// ---------------------------------------------------------------------------
describe("stats route (GET /stats)", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should return zeroed stats when no reviews exist", async () => {
		await kv.set("reviews:list", JSON.stringify([]));
		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.stats.handler(routeCtx, ctx);

		expect(result.stats.totalCount).toBe(0);
		expect(result.stats.averageRating).toBe(0);
	});

	it("should return computed stats for existing reviews", async () => {
		await seedReviews(kv, [
			createTestReview({ id: "s1", rating: 5 }),
			createTestReview({ id: "s2", rating: 3 }),
		]);

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.stats.handler(routeCtx, ctx);

		expect(result.stats.totalCount).toBe(2);
		expect(result.stats.averageRating).toBe(4);
	});
});

// ---------------------------------------------------------------------------
// Widget Data Route
// ---------------------------------------------------------------------------
describe("widgetData route (GET /widget-data)", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);

		await seedReviews(kv, [
			createTestReview({ id: "w1", rating: 5, featured: true, author: "Featured User", date: "2026-03-20T10:00:00Z" }),
			createTestReview({ id: "w2", rating: 4, featured: false, author: "Regular User", date: "2026-03-19T10:00:00Z" }),
			createTestReview({ id: "w3", rating: 3, featured: false, author: "Another User", date: "2026-03-18T10:00:00Z" }),
		]);
	});

	it("should return widget data with featured reviews prioritized", async () => {
		const routeCtx = buildRouteCtx({ input: { limit: "5" } });
		const result = await plugin.routes.widgetData.handler(routeCtx, ctx);

		expect(result.averageRating).toBe(4);
		expect(result.totalCount).toBe(3);
		expect(result.reviews).toHaveLength(3);
		// Featured review should appear first
		expect(result.reviews[0].author).toBe("Featured User");
	});

	it("should respect limit parameter", async () => {
		const routeCtx = buildRouteCtx({ input: { limit: "1" } });
		const result = await plugin.routes.widgetData.handler(routeCtx, ctx);

		expect(result.reviews).toHaveLength(1);
	});

	it("should strip admin fields from widget response", async () => {
		const routeCtx = buildRouteCtx({ input: {} });
		const result = await plugin.routes.widgetData.handler(routeCtx, ctx);

		// Widget data should only contain public-safe fields
		const review = result.reviews[0];
		expect(review.author).toBeTruthy();
		expect(review.rating).toBeTruthy();
		expect(review.text).toBeTruthy();
		expect(review.date).toBeTruthy();
		expect(review.source).toBeTruthy();
		// Should not include admin fields
		expect((review as Record<string, unknown>).featured).toBeUndefined();
		expect((review as Record<string, unknown>).flagged).toBeUndefined();
		expect((review as Record<string, unknown>).id).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
// Settings Route
// ---------------------------------------------------------------------------
describe("settings route (PUT /settings)", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should save Google Place ID", async () => {
		const routeCtx = buildRouteCtx({
			input: { googlePlaceId: "ChIJ12345" },
		});
		const result = await plugin.routes.settings.handler(routeCtx, ctx);

		expect(result.settings.googlePlaceId).toBe("ChIJ12345");
		expect(kv._store.get("settings:google-place-id")).toBe("ChIJ12345");
	});

	it("should save Yelp Business ID", async () => {
		const routeCtx = buildRouteCtx({
			input: { yelpBusinessId: "sunrise-yoga-sf" },
		});
		const result = await plugin.routes.settings.handler(routeCtx, ctx);

		expect(result.settings.yelpBusinessId).toBe("sunrise-yoga-sf");
		expect(kv._store.get("settings:yelp-business-id")).toBe("sunrise-yoga-sf");
	});

	it("should save display preferences", async () => {
		const routeCtx = buildRouteCtx({
			input: { displayPrefs: { layout: "grid", showAuthor: true } },
		});
		const result = await plugin.routes.settings.handler(routeCtx, ctx);

		expect(result.settings.display).toEqual({ layout: "grid", showAuthor: true });
	});

	it("should throw error for empty Google Place ID", async () => {
		const routeCtx = buildRouteCtx({
			input: { googlePlaceId: "  " },
		});

		await expect(
			plugin.routes.settings.handler(routeCtx, ctx)
		).rejects.toThrow();
	});
});

// ---------------------------------------------------------------------------
// Health Route
// ---------------------------------------------------------------------------
describe("health route", () => {
	it("should return ok status", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);
		await kv.set("reviews:list", JSON.stringify(["r1", "r2"]));
		await kv.set("reviews:sync-cursor", "2026-03-20T10:00:00Z");

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.health.handler(routeCtx, ctx);

		expect(result.status).toBe("ok");
		expect(result.plugin).toBe("reviewpulse");
		expect(result.reviewCount).toBe(2);
		expect(result.lastSyncAt).toBe("2026-03-20T10:00:00Z");
	});
});

// ---------------------------------------------------------------------------
// Admin Widget Routes
// ---------------------------------------------------------------------------
describe("admin widget routes", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		await seedReviews(kv, [
			createTestReview({ id: "aw1", rating: 5, source: "google" }),
			createTestReview({ id: "aw2", rating: 3, source: "yelp" }),
		]);
	});

	it("should render stats widget HTML", async () => {
		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.adminStatsWidget.handler(routeCtx, ctx);

		expect(result.html).toContain("reviewpulse");
		expect(result.html).toContain("Average Rating");
	});

	it("should render review count widget HTML", async () => {
		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.adminReviewCountWidget.handler(routeCtx, ctx);

		expect(result.html).toContain("Review Count");
		expect(result.html).toContain("2");
	});

	it("should render recent reviews widget HTML", async () => {
		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.adminRecentReviewsWidget.handler(routeCtx, ctx);

		expect(result.html).toContain("Recent Reviews");
	});

	it("should render admin review list HTML", async () => {
		const routeCtx = buildRouteCtx({ input: { page: "1" } });
		const result = await plugin.routes.adminReviews.handler(routeCtx, ctx);

		expect(result.html).toContain("Review Management");
		expect(result.totalBeforeFilter).toBe(2);
	});
});

// ---------------------------------------------------------------------------
// Plugin Install Hook
// ---------------------------------------------------------------------------
describe("plugin:install hook", () => {
	it("should initialize KV schema on install", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		await plugin.hooks["plugin:install"].handler({}, ctx);

		const list = kv._store.get("reviews:list");
		expect(list).toBe(JSON.stringify([]));

		const stats = JSON.parse(kv._store.get("reviews:stats")!);
		expect(stats.totalCount).toBe(0);
		expect(stats.averageRating).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------
describe("edge cases", () => {
	it("should handle empty KV gracefully in reviews route", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);
		const routeCtx = buildRouteCtx({ input: {} });

		const result = await plugin.routes.reviews.handler(routeCtx, ctx);
		expect(result.reviews).toHaveLength(0);
		expect(result.total).toBe(0);
	});

	it("should handle review in list but missing from KV", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		// List references a review that doesn't exist
		await kv.set("reviews:list", JSON.stringify(["ghost-review"]));
		const routeCtx = buildRouteCtx({ input: {} });

		const result = await plugin.routes.reviews.handler(routeCtx, ctx);
		expect(result.reviews).toHaveLength(0);
	});

	it("should clamp perPage to max 100", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);
		const routeCtx = buildRouteCtx({ input: { perPage: "500" } });

		const result = await plugin.routes.reviews.handler(routeCtx, ctx);
		expect(result.page).toBe(1);
		// No error thrown — it silently caps
	});
});

// ---------------------------------------------------------------------------
// Settings Page Route
// ---------------------------------------------------------------------------
describe("settingsPage route", () => {
	it("should return HTML settings page", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		await kv.set("settings:google-place-id", "ChIJ_test123");
		await kv.set("settings:yelp-business-id", "my-biz");

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.settingsPage.handler(routeCtx, ctx);

		expect(result.html).toContain("ReviewPulse Settings");
		expect(result.html).toContain("ChIJ_test123");
		expect(result.html).toContain("my-biz");
		expect(result.html).toContain("Google Place ID");
		expect(result.html).toContain("Yelp Business ID");
		expect(result.html).toContain("Check for New Reviews");
	});
});

// ---------------------------------------------------------------------------
// Sync Route
// ---------------------------------------------------------------------------
describe("sync route", () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("should throw error when no sources configured", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		const routeCtx = buildRouteCtx({});

		await expect(
			plugin.routes.sync.handler(routeCtx, ctx)
		).rejects.toThrow("No review sources set up yet");
	});

	it("should import Google reviews when configured", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		await kv.set("settings:google-place-id", "ChIJ_test");

		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				result: {
					reviews: [
						{
							author_name: "Test User",
							rating: 5,
							text: "Great place!",
							time: Math.floor(Date.now() / 1000),
						},
					],
				},
			}),
		});
		globalThis.fetch = mockFetch;

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.sync.handler(routeCtx, ctx);

		expect(result.imported).toBe(1);
		expect(result.skipped).toBe(0);
	});

	it("should deduplicate reviews across syncs", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		await kv.set("settings:google-place-id", "ChIJ_test");

		const mockReview = {
			author_name: "Same User",
			rating: 5,
			text: "Great place!",
			time: Math.floor(new Date("2026-03-20T10:00:00Z").getTime() / 1000),
		};

		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				result: { reviews: [mockReview] },
			}),
		});
		globalThis.fetch = mockFetch;

		// First sync
		const routeCtx1 = buildRouteCtx({});
		const result1 = await plugin.routes.sync.handler(routeCtx1, ctx);
		expect(result1.imported).toBe(1);

		// Second sync with same review
		const routeCtx2 = buildRouteCtx({});
		const result2 = await plugin.routes.sync.handler(routeCtx2, ctx);
		expect(result2.imported).toBe(0);
		expect(result2.skipped).toBe(1);
	});
});
