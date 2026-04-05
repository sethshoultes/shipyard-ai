/**
 * ReviewPulse email module tests.
 * Covers: HTML generation, sendEmail with Resend API mock.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	sendEmail,
	generateNewReviewNotificationHTML,
	generateNegativeReviewAlertHTML,
} from "../email";
import type { ReviewForEmail } from "../email";

// ---------------------------------------------------------------------------
// Mock context factory
// ---------------------------------------------------------------------------

function createEmailCtx(env: Record<string, string> = {}) {
	return {
		kv: {} as never,
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		},
		plugin: { id: "reviewpulse", version: "1.0.0" },
		site: { url: "https://test.example.com", name: "Test Site" },
		env: {
			RESEND_API_KEY: "re_test_key_123",
			REVIEW_FROM_EMAIL: "noreply@test.com",
			...env,
		},
	} as never;
}

const sampleReview: ReviewForEmail = {
	author: "Jane Doe",
	rating: 4,
	text: "Great service and wonderful atmosphere!",
	date: "2026-03-15T12:00:00.000Z",
	source: "google",
};

const negativeReview: ReviewForEmail = {
	author: "John Smith",
	rating: 2,
	text: "Food was cold and service was slow.",
	date: "2026-03-14T08:00:00.000Z",
	source: "yelp",
};

// ---------------------------------------------------------------------------
// HTML generation tests
// ---------------------------------------------------------------------------

describe("generateNewReviewNotificationHTML", () => {
	it("should generate HTML with review details", () => {
		const html = generateNewReviewNotificationHTML(sampleReview);

		expect(html).toContain("New Review Received");
		expect(html).toContain("Jane Doe");
		expect(html).toContain("4/5");
		expect(html).toContain("Great service and wonderful atmosphere!");
		expect(html).toContain("google");
		expect(html).toContain("#C4704B"); // brand terracotta
	});

	it("should handle review with empty text", () => {
		const html = generateNewReviewNotificationHTML({
			...sampleReview,
			text: "",
		});

		expect(html).toContain("No review text");
		expect(html).toContain("Jane Doe");
	});
});

describe("generateNegativeReviewAlertHTML", () => {
	it("should generate alert HTML with warning styling", () => {
		const html = generateNegativeReviewAlertHTML(negativeReview);

		expect(html).toContain("Negative Review Alert");
		expect(html).toContain("2-star review requires attention");
		expect(html).toContain("John Smith");
		expect(html).toContain("Food was cold and service was slow.");
		expect(html).toContain("yelp");
		expect(html).toContain("#b91c1c"); // red alert color
	});

	it("should include admin dashboard link when provided", () => {
		const html = generateNegativeReviewAlertHTML(
			negativeReview,
			"https://admin.example.com/reviews"
		);

		expect(html).toContain("View in Admin Dashboard");
		expect(html).toContain("https://admin.example.com/reviews");
	});
});

// ---------------------------------------------------------------------------
// sendEmail tests (Resend API mock)
// ---------------------------------------------------------------------------

describe("sendEmail", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it("should call Resend API and return true on success", async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ id: "email_123" }),
		});
		globalThis.fetch = mockFetch;

		const ctx = createEmailCtx();
		const result = await sendEmail(ctx, {
			to: "admin@example.com",
			subject: "Test Subject",
			html: "<p>Hello</p>",
		});

		expect(result).toBe(true);
		expect(mockFetch).toHaveBeenCalledOnce();
		expect(mockFetch).toHaveBeenCalledWith(
			"https://api.resend.com/emails",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer re_test_key_123",
				}),
			})
		);

		const body = JSON.parse(mockFetch.mock.calls[0][1].body);
		expect(body.to).toBe("admin@example.com");
		expect(body.subject).toBe("Test Subject");
		expect(body.from).toBe("noreply@test.com");
	});

	it("should return false when Resend API key is not configured", async () => {
		const ctx = createEmailCtx({ RESEND_API_KEY: "", REVIEW_FROM_EMAIL: "" });
		const result = await sendEmail(ctx, {
			to: "admin@example.com",
			subject: "Test",
			html: "<p>Hello</p>",
		});

		expect(result).toBe(false);
	});
});
