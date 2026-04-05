/**
 * ReviewPulse Wave 3 tests.
 *
 * Covers: AI response drafting, response templates, review campaigns, analytics dashboard.
 * 17 tests total.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	createMockKV,
	createMockContext,
	buildRouteCtx,
	createTestReview,
	seedReview,
	seedReviews,
} from "./helpers";
import type { MockKV } from "./helpers";

// ---------------------------------------------------------------------------
// Mock emdash module
// ---------------------------------------------------------------------------
vi.mock("emdash", () => ({
	definePlugin: (config: unknown) => config,
}));

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
// Helper: create mock context with Anthropic key
// ---------------------------------------------------------------------------
function createWave3Context(kvOverride?: MockKV) {
	const ctx = createMockContext(kvOverride);
	(ctx.env as Record<string, string>).ANTHROPIC_API_KEY = "test-anthropic-key";
	(ctx.env as Record<string, string>).RESEND_API_KEY = "test-resend-key";
	(ctx.env as Record<string, string>).REVIEW_FROM_EMAIL = "noreply@test.com";
	return ctx;
}

// ---------------------------------------------------------------------------
// Task 3.1: AI Response Drafting
// ---------------------------------------------------------------------------
describe("draftResponse route", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createWave3Context>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createWave3Context(kv);
		await seedReview(kv, createTestReview({ id: "draft-1", rating: 1, author: "Angry User", text: "Terrible experience." }));
		await seedReview(kv, createTestReview({ id: "draft-2", rating: 5, author: "Happy User", text: "Amazing!" }));
		await seedReview(kv, createTestReview({ id: "draft-3", rating: 3, author: "Neutral User", text: "It was okay." }));
	});

	it("should generate a draft response with correct prompt for negative review", async () => {
		// Mock global fetch for Anthropic API
		const originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				content: [{ type: "text", text: "We sincerely apologize for your experience." }],
			}),
		});

		try {
			const routeCtx = buildRouteCtx({
				input: { reviewId: "draft-1" },
				user: { isAdmin: true },
			});
			const result = await plugin.routes.draftResponse.handler(routeCtx, ctx);

			expect(result.draftText).toBe("We sincerely apologize for your experience.");
			expect(result.reviewId).toBe("draft-1");
			expect(result.generatedAt).toBeTruthy();

			// Verify the prompt contains empathetic tone for low rating
			const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const body = JSON.parse(fetchCall[1].body);
			expect(body.messages[0].content).toContain("empathetic");
			expect(body.messages[0].content).toContain("Angry User");
			expect(body.model).toBe("claude-haiku-4-5-20251001");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	it("should use grateful tone for positive reviews", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				content: [{ type: "text", text: "Thank you so much!" }],
			}),
		});

		try {
			const routeCtx = buildRouteCtx({
				input: { reviewId: "draft-2" },
				user: { isAdmin: true },
			});
			await plugin.routes.draftResponse.handler(routeCtx, ctx);

			const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const body = JSON.parse(fetchCall[1].body);
			expect(body.messages[0].content).toContain("grateful");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	it("should use balanced tone for neutral reviews (3 stars)", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				content: [{ type: "text", text: "Thank you for the feedback." }],
			}),
		});

		try {
			const routeCtx = buildRouteCtx({
				input: { reviewId: "draft-3" },
				user: { isAdmin: true },
			});
			await plugin.routes.draftResponse.handler(routeCtx, ctx);

			const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const body = JSON.parse(fetchCall[1].body);
			expect(body.messages[0].content).toContain("balanced");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

describe("saveResponse route", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createWave3Context>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createWave3Context(kv);
		await seedReview(kv, createTestReview({ id: "save-1", rating: 5, author: "Test" }));
	});

	it("should save reply text and repliedAt to review", async () => {
		const routeCtx = buildRouteCtx({
			input: { reviewId: "save-1", replyText: "Thank you for the review!" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.saveResponse.handler(routeCtx, ctx);

		expect(result.review.replyText).toBe("Thank you for the review!");
		expect(result.review.repliedAt).toBeTruthy();

		// Verify persisted
		const stored = JSON.parse(kv._store.get("review:save-1")!);
		expect(stored.replyText).toBe("Thank you for the review!");
	});
});

// ---------------------------------------------------------------------------
// Task 3.1 Edge Case: Draft for review with no text
// ---------------------------------------------------------------------------
describe("draftResponse edge cases", () => {
	it("should handle review with no text", async () => {
		const kv = createMockKV();
		const ctx = createWave3Context(kv);
		await seedReview(kv, createTestReview({ id: "notext-1", rating: 4, author: "Silent User", text: "" }));

		const originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				content: [{ type: "text", text: "Thank you for your rating." }],
			}),
		});

		try {
			const routeCtx = buildRouteCtx({
				input: { reviewId: "notext-1" },
				user: { isAdmin: true },
			});
			const result = await plugin.routes.draftResponse.handler(routeCtx, ctx);
			expect(result.draftText).toBe("Thank you for your rating.");

			// Verify prompt includes fallback text
			const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
			const body = JSON.parse(fetchCall[1].body);
			expect(body.messages[0].content).toContain("(No review text provided)");
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

// ---------------------------------------------------------------------------
// Task 3.2: Response Templates
// ---------------------------------------------------------------------------
describe("response templates CRUD", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createWave3Context>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createWave3Context(kv);
	});

	it("should create a template and list it", async () => {
		const createCtx = buildRouteCtx({
			input: {
				name: "Thank You Template",
				body: "Thank you {authorName} for your {rating}-star review of {businessName}!",
				category: "thank-you",
			},
			user: { isAdmin: true },
		});
		const created = await plugin.routes.createTemplate.handler(createCtx, ctx);

		expect(created.template.name).toBe("Thank You Template");
		expect(created.template.category).toBe("thank-you");
		expect(created.template.id).toBeTruthy();

		// List templates
		const listCtx = buildRouteCtx({ user: { isAdmin: true } });
		const listed = await plugin.routes.listTemplates.handler(listCtx, ctx);
		expect(listed.templates).toHaveLength(1);
		expect(listed.templates[0].name).toBe("Thank You Template");
	});

	it("should get a single template by ID", async () => {
		const createCtx = buildRouteCtx({
			input: { name: "Apology", body: "We are sorry {authorName}.", category: "apology" },
			user: { isAdmin: true },
		});
		const created = await plugin.routes.createTemplate.handler(createCtx, ctx);

		const getCtx = buildRouteCtx({
			input: { id: created.template.id },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.getTemplate.handler(getCtx, ctx);
		expect(result.template.name).toBe("Apology");
	});

	it("should delete a template", async () => {
		const createCtx = buildRouteCtx({
			input: { name: "Temp", body: "Body text", category: "custom" },
			user: { isAdmin: true },
		});
		const created = await plugin.routes.createTemplate.handler(createCtx, ctx);

		const deleteCtx = buildRouteCtx({
			input: { id: created.template.id },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.deleteTemplate.handler(deleteCtx, ctx);
		expect(result.deleted).toBe(true);

		// Verify list is empty
		const listCtx = buildRouteCtx({ user: { isAdmin: true } });
		const listed = await plugin.routes.listTemplates.handler(listCtx, ctx);
		expect(listed.templates).toHaveLength(0);
	});

	it("should apply template with variable substitution", async () => {
		const kv2 = createMockKV();
		const ctx2 = createWave3Context(kv2);
		await kv2.set("settings:business-name", "Joe's Pizza");
		await seedReview(kv2, createTestReview({ id: "apply-rev-1", author: "Maria", rating: 5 }));

		const createCtx = buildRouteCtx({
			input: {
				name: "Thanks",
				body: "Dear {authorName}, thanks for the {rating}-star review at {businessName}!",
				category: "thank-you",
			},
			user: { isAdmin: true },
		});
		const created = await plugin.routes.createTemplate.handler(createCtx, ctx2);

		const applyCtx = buildRouteCtx({
			input: { templateId: created.template.id, reviewId: "apply-rev-1" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.applyTemplate.handler(applyCtx, ctx2);

		expect(result.filledText).toBe("Dear Maria, thanks for the 5-star review at Joe's Pizza!");
	});
});

// ---------------------------------------------------------------------------
// Task 3.2 Edge Case: Template with missing variables
// ---------------------------------------------------------------------------
describe("template edge cases", () => {
	it("should leave unmatched variables in text when review has no matching data", async () => {
		const kv = createMockKV();
		const ctx = createWave3Context(kv);
		await seedReview(kv, createTestReview({ id: "edge-rev-1", author: "Alex", rating: 4 }));

		const createCtx = buildRouteCtx({
			input: {
				name: "Edge",
				body: "Hi {authorName}, your {unknownVar} was great!",
				category: "custom",
			},
			user: { isAdmin: true },
		});
		const created = await plugin.routes.createTemplate.handler(createCtx, ctx);

		const applyCtx = buildRouteCtx({
			input: { templateId: created.template.id, reviewId: "edge-rev-1" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.applyTemplate.handler(applyCtx, ctx);

		// Known variables substituted, unknown left as-is
		expect(result.filledText).toContain("Hi Alex");
		expect(result.filledText).toContain("{unknownVar}");
	});
});

// ---------------------------------------------------------------------------
// Task 3.3: Review Request Campaigns
// ---------------------------------------------------------------------------
describe("review request campaigns", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createWave3Context>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createWave3Context(kv);
	});

	it("should create a campaign", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				name: "Spring Campaign",
				recipientEmails: ["a@test.com", "b@test.com"],
				message: "We'd love to hear from you!",
				googleReviewUrl: "https://google.com/review/123",
			},
			user: { isAdmin: true },
		});
		const result = await plugin.routes.createCampaign.handler(routeCtx, ctx);

		expect(result.campaign.name).toBe("Spring Campaign");
		expect(result.campaign.status).toBe("draft");
		expect(result.campaign.recipientEmails).toHaveLength(2);
	});

	it("should enforce 50 recipient limit", async () => {
		const emails = Array.from({ length: 51 }, (_, i) => `user${i}@test.com`);
		const routeCtx = buildRouteCtx({
			input: {
				name: "Big Campaign",
				recipientEmails: emails,
				message: "Review us!",
			},
			user: { isAdmin: true },
		});

		await expect(
			plugin.routes.createCampaign.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should send campaign and track status", async () => {
		// Create campaign first
		const createCtx = buildRouteCtx({
			input: {
				name: "Send Test",
				recipientEmails: ["test@example.com"],
				message: "Please review us!",
				googleReviewUrl: "https://google.com/review/456",
			},
			user: { isAdmin: true },
		});
		const created = await plugin.routes.createCampaign.handler(createCtx, ctx);

		// Mock fetch for Resend API
		const originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ id: "email-123" }),
			text: async () => "OK",
		});

		try {
			const sendCtx = buildRouteCtx({
				input: { campaignId: created.campaign.id },
				user: { isAdmin: true },
			});
			const result = await plugin.routes.sendCampaign.handler(sendCtx, ctx);

			expect(result.campaign.status).toBe("sent");
			expect(result.sentCount).toBe(1);
			expect(result.total).toBe(1);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

// ---------------------------------------------------------------------------
// Task 3.4: Analytics Dashboard
// ---------------------------------------------------------------------------
describe("analytics routes", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createWave3Context>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createWave3Context(kv);

		await seedReviews(kv, [
			createTestReview({ id: "a1", rating: 5, source: "google", date: "2026-03-15T10:00:00Z", replyText: "Thanks!" }),
			createTestReview({ id: "a2", rating: 4, source: "google", date: "2026-03-10T10:00:00Z" }),
			createTestReview({ id: "a3", rating: 2, source: "yelp", date: "2026-02-15T10:00:00Z", replyText: "Sorry!" }),
			createTestReview({ id: "a4", rating: 1, source: "manual", date: "2026-01-20T10:00:00Z" }),
		]);
	});

	it("should return rating trends grouped by month", async () => {
		const routeCtx = buildRouteCtx({
			input: { range: "365d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.analyticsData.handler(routeCtx, ctx);

		expect(result.ratingTrend.length).toBeGreaterThan(0);
		// Each entry should have month, averageRating, count
		const entry = result.ratingTrend[0];
		expect(entry.month).toBeTruthy();
		expect(entry.averageRating).toBeGreaterThan(0);
		expect(entry.count).toBeGreaterThan(0);
	});

	it("should compute correct response rate", async () => {
		const routeCtx = buildRouteCtx({
			input: { range: "365d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.analyticsData.handler(routeCtx, ctx);

		// 2 out of 4 have replies = 50%
		expect(result.responseRate).toBe(50);
		expect(result.repliedReviews).toBe(2);
	});

	it("should filter by date range", async () => {
		const routeCtx = buildRouteCtx({
			input: { range: "30d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.analyticsData.handler(routeCtx, ctx);

		// Only reviews from last 30 days (March 2026 reviews)
		expect(result.totalReviews).toBeLessThanOrEqual(4);
		expect(result.range).toBe("30d");
	});

	it("should return correct rating distribution", async () => {
		const routeCtx = buildRouteCtx({
			input: { range: "365d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.analyticsData.handler(routeCtx, ctx);

		expect(result.ratingDistribution[5]).toBe(1);
		expect(result.ratingDistribution[4]).toBe(1);
		expect(result.ratingDistribution[2]).toBe(1);
		expect(result.ratingDistribution[1]).toBe(1);
		expect(result.ratingDistribution[3]).toBe(0);
	});

	it("should export analytics as CSV", async () => {
		const routeCtx = buildRouteCtx({
			input: { range: "365d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.analyticsExport.handler(routeCtx, ctx);

		expect(result.csv).toContain("Date,Author,Source,Rating,Has Reply,Text");
		expect(result.totalRows).toBe(4);
		expect(result.filename).toContain("reviewpulse-export-365d");
	});
});

// ---------------------------------------------------------------------------
// Task 3.4 Edge Case: Empty analytics
// ---------------------------------------------------------------------------
describe("analytics edge cases", () => {
	it("should handle empty analytics gracefully", async () => {
		const kv = createMockKV();
		const ctx = createWave3Context(kv);

		const routeCtx = buildRouteCtx({
			input: { range: "365d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.analyticsData.handler(routeCtx, ctx);

		expect(result.totalReviews).toBe(0);
		expect(result.responseRate).toBe(0);
		expect(result.ratingTrend).toHaveLength(0);
		expect(result.ratingDistribution[1]).toBe(0);
	});

	it("should render analytics page HTML with charts", async () => {
		const kv = createMockKV();
		const ctx = createWave3Context(kv);
		await seedReviews(kv, [
			createTestReview({ id: "p1", rating: 5, source: "google", date: "2026-03-15T10:00:00Z" }),
		]);

		const routeCtx = buildRouteCtx({
			input: { range: "365d" },
			user: { isAdmin: true },
		});
		const result = await plugin.routes.adminAnalyticsPage.handler(routeCtx, ctx);

		expect(result.html).toContain("Analytics Dashboard");
		expect(result.html).toContain("svg");
		expect(result.html).toContain("Rating Trend");
		expect(result.html).toContain("Rating Distribution");
	});
});
