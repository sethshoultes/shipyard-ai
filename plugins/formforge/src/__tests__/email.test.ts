/**
 * Tests for FormForge email module:
 *   - Submission notification email rendering
 *   - Auto-response email rendering
 *   - Missing email config handling
 *   - HTML entity escaping
 *   - Long field value truncation / handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	sendEmail,
	generateSubmissionNotificationHTML,
	generateAutoResponseHTML,
} from "../email";

describe("generateSubmissionNotificationHTML", () => {
	it("should render all field values in the notification email", () => {
		const html = generateSubmissionNotificationHTML(
			"Contact Form",
			[
				{ label: "Full Name", value: "Jane Doe" },
				{ label: "Email", value: "jane@example.com" },
				{ label: "Subject", value: "Partnership Inquiry" },
				{ label: "Message", value: "I would like to discuss a collaboration." },
			],
			"2026-04-05T14:30:00.000Z",
			"sub-abc123"
		);

		expect(html).toContain("Jane Doe");
		expect(html).toContain("jane@example.com");
		expect(html).toContain("Partnership Inquiry");
		expect(html).toContain("I would like to discuss a collaboration.");
		expect(html).toContain("Contact Form");
		expect(html).toContain("sub-abc123");
		expect(html).toContain("New Form Submission");
		// Should be valid HTML structure
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("<table");
		expect(html).toContain("</table>");
	});

	it("should handle empty field values gracefully", () => {
		const html = generateSubmissionNotificationHTML(
			"Feedback Form",
			[
				{ label: "Name", value: "" },
				{ label: "Comments", value: "" },
			],
			"2026-04-05T14:30:00.000Z",
			"sub-empty"
		);

		// Empty values should show placeholder
		expect(html).toContain("(empty)");
		expect(html).toContain("Feedback Form");
	});
});

describe("generateAutoResponseHTML", () => {
	it("should render auto-response email correctly", () => {
		const html = generateAutoResponseHTML(
			"Thank you for contacting us!",
			"We received your message and will get back to you within 24 hours.",
			"Contact Form"
		);

		expect(html).toContain("Thank you for contacting us!");
		expect(html).toContain("We received your message and will get back to you within 24 hours.");
		expect(html).toContain("Contact Form");
		expect(html).toContain("automated response");
		expect(html).toContain("<!DOCTYPE html>");
	});
});

describe("HTML entity escaping in emails", () => {
	it("should escape HTML entities in notification email field values", () => {
		const html = generateSubmissionNotificationHTML(
			"Contact Form",
			[
				{ label: "Name", value: '<script>alert("xss")</script>' },
				{ label: "Message", value: "Tom & Jerry's <Adventure>" },
			],
			"2026-04-05T14:30:00.000Z",
			"sub-xss"
		);

		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
		expect(html).toContain("&amp;");
		expect(html).toContain("&#039;");
		expect(html).toContain("&lt;Adventure&gt;");
	});

	it("should escape HTML entities in auto-response email", () => {
		const html = generateAutoResponseHTML(
			"Thanks <User>!",
			"Your request for \"quote\" has been received & noted.",
			"Form <Test>"
		);

		expect(html).not.toContain("<User>");
		expect(html).toContain("&lt;User&gt;");
		expect(html).toContain("&quot;quote&quot;");
		expect(html).toContain("&amp; noted");
		expect(html).toContain("Form &lt;Test&gt;");
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
				FORM_FROM_EMAIL: "forms@test.com",
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

	it("should handle missing email config gracefully", async () => {
		mockCtx.env = {};
		const result = await sendEmail(mockCtx as any, {
			to: "user@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result).toBe(false);
		expect(mockCtx.log.warn).toHaveBeenCalled();
	});

	it("should send email via Resend API when configured", async () => {
		const result = await sendEmail(mockCtx as any, {
			to: "user@example.com",
			subject: "New Submission",
			html: "<p>You have a new form submission.</p>",
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

	it("should return false on API error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			text: async () => "Bad Request",
		}));

		const result = await sendEmail(mockCtx as any, {
			to: "user@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result).toBe(false);
		expect(mockCtx.log.error).toHaveBeenCalled();
	});

	it("should return false on network error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

		const result = await sendEmail(mockCtx as any, {
			to: "user@example.com",
			subject: "Test",
			html: "<p>Test</p>",
		});

		expect(result).toBe(false);
		expect(mockCtx.log.error).toHaveBeenCalled();
	});
});

describe("Long field values", () => {
	it("should handle very long field values in notification email without crashing", () => {
		const longValue = "A".repeat(10000);

		const html = generateSubmissionNotificationHTML(
			"Contact Form",
			[
				{ label: "Name", value: "Jane" },
				{ label: "Message", value: longValue },
			],
			"2026-04-05T14:30:00.000Z",
			"sub-long"
		);

		// Should still produce valid HTML containing the value
		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("Contact Form");
		// The long value should be present (not truncated in v1)
		expect(html.length).toBeGreaterThan(10000);
	});
});
