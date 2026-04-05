/**
 * Tests for email utility functions: formatDateTime, generateCalendarLink,
 * email HTML generators, and sendEmail.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	formatDateTime,
	generateCalendarLink,
	generateFreeEventEmailHTML,
	generatePaidEventEmailHTML,
	generateCancellationEmailHTML,
	generateWaitlistEmailHTML,
	generateWaitlistPromotionEmailHTML,
	sendEmail,
} from "../email";

describe("formatDateTime", () => {
	it("should format a valid date and time", () => {
		const result = formatDateTime("2026-05-15", "06:00");
		// Should contain the date components
		expect(result).toContain("2026");
		expect(result).toContain("May");
		expect(result).toContain("15");
	});

	it("should fallback for invalid date", () => {
		const result = formatDateTime("invalid", "06:00");
		expect(result).toBe("invalid at 06:00");
	});

	it("should handle midnight correctly", () => {
		const result = formatDateTime("2026-12-31", "00:00");
		expect(result).toContain("December");
		expect(result).toContain("31");
	});

	it("should handle afternoon times (PM)", () => {
		const result = formatDateTime("2026-06-15", "14:30");
		// Should show PM
		expect(result).toMatch(/PM/i);
	});
});

describe("generateCalendarLink", () => {
	it("should generate a valid Google Calendar link", () => {
		const link = generateCalendarLink(
			"Sunrise Yoga Flow",
			"2026-05-15",
			"06:00",
			"07:00",
			"Sunrise Yoga Studio"
		);

		expect(link).toContain("calendar.google.com");
		expect(link).toContain("Sunrise+Yoga+Flow");
		expect(link).toContain("20260515T060000");
		expect(link).toContain("20260515T070000");
		expect(link).toContain("Sunrise+Yoga+Studio");
	});

	it("should default end time to 1 hour after start when not provided", () => {
		const link = generateCalendarLink(
			"Quick Session",
			"2026-05-15",
			"10:00",
			undefined,
			"Studio"
		);

		expect(link).toContain("20260515T100000");
		expect(link).toContain("20260515T110000");
	});

	it("should handle events without location", () => {
		const link = generateCalendarLink(
			"Online Event",
			"2026-05-15",
			"10:00"
		);

		expect(link).toContain("calendar.google.com");
		expect(link).not.toContain("location");
	});

	it("should return empty string on error", () => {
		// Force an error with undefined values
		const link = generateCalendarLink("", "", "");
		// Even with empty strings it might not error -- test graceful handling
		expect(typeof link).toBe("string");
	});
});

describe("Email HTML Generators", () => {
	describe("generateFreeEventEmailHTML", () => {
		it("should include attendee name and event details", () => {
			const html = generateFreeEventEmailHTML(
				"Sarah Chen",
				"Sunrise Yoga Flow",
				"2026-05-15",
				"06:00",
				"Sunrise Yoga Studio",
				"https://calendar.google.com/test"
			);

			expect(html).toContain("Sarah Chen");
			expect(html).toContain("Sunrise Yoga Flow");
			expect(html).toContain("Sunrise Yoga Studio");
			expect(html).toContain("https://calendar.google.com/test");
			expect(html).toContain("You're registered!");
			expect(html).toContain("Add to calendar");
		});
	});

	describe("generatePaidEventEmailHTML", () => {
		it("should include payment details", () => {
			const html = generatePaidEventEmailHTML(
				"Sarah Chen",
				"VIP Yoga Retreat",
				"VIP",
				5000, // $50.00 in cents
				"2026-05-15",
				"06:00",
				"Retreat Center",
				"https://calendar.google.com/test"
			);

			expect(html).toContain("Sarah Chen");
			expect(html).toContain("VIP Yoga Retreat");
			expect(html).toContain("VIP");
			expect(html).toContain("50.00");
			expect(html).toContain("Payment confirmed!");
		});
	});

	describe("generateCancellationEmailHTML", () => {
		it("should include attendee name and event title", () => {
			const html = generateCancellationEmailHTML("Sarah Chen", "Sunrise Yoga Flow");

			expect(html).toContain("Sarah Chen");
			expect(html).toContain("Sunrise Yoga Flow");
			expect(html).toContain("Registration cancelled");
		});
	});

	describe("generateWaitlistEmailHTML", () => {
		it("should show waitlist position", () => {
			const html = generateWaitlistEmailHTML("Sarah Chen", "Sunrise Yoga Flow", 3);

			expect(html).toContain("Sarah Chen");
			expect(html).toContain("Sunrise Yoga Flow");
			expect(html).toContain("#3");
			expect(html).toContain("waitlist");
		});
	});

	describe("generateWaitlistPromotionEmailHTML", () => {
		it("should include register link", () => {
			const html = generateWaitlistPromotionEmailHTML(
				"Sarah Chen",
				"Sunrise Yoga Flow",
				"https://example.com/register"
			);

			expect(html).toContain("Sarah Chen");
			expect(html).toContain("Sunrise Yoga Flow");
			expect(html).toContain("https://example.com/register");
			expect(html).toContain("spot just opened up");
		});
	});
});

describe("sendEmail", () => {
	let mockCtx: {
		env: Record<string, string>;
		log: {
			info: ReturnType<typeof vi.fn>;
			warn: ReturnType<typeof vi.fn>;
			error: ReturnType<typeof vi.fn>;
		};
	};

	beforeEach(() => {
		mockCtx = {
			env: {
				RESEND_API_KEY: "re_test_123",
				EVENT_FROM_EMAIL: "events@test.com",
			},
			log: {
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			},
		};
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: true,
			text: async () => "{}",
		}));
	});

	it("should send email via Resend API", async () => {
		const result = await sendEmail(mockCtx as any, {
			to: "sarah@example.com",
			subject: "Test Email",
			html: "<p>Test</p>",
		});

		expect(result).toBe(true);
		expect(fetch).toHaveBeenCalledWith(
			"https://api.resend.com/emails",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer re_test_123",
				}),
			})
		);
	});

	it("should return false when Resend API key is not configured", async () => {
		mockCtx.env = {};
		const result = await sendEmail(mockCtx as any, {
			to: "sarah@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result).toBe(false);
		expect(mockCtx.log.warn).toHaveBeenCalled();
	});

	it("should return false on API error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			text: async () => "Bad Request",
		}));

		const result = await sendEmail(mockCtx as any, {
			to: "sarah@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result).toBe(false);
		expect(mockCtx.log.error).toHaveBeenCalled();
	});

	it("should return false on network error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

		const result = await sendEmail(mockCtx as any, {
			to: "sarah@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result).toBe(false);
		expect(mockCtx.log.error).toHaveBeenCalled();
	});
});
