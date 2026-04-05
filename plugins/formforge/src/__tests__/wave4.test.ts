/**
 * FormForge Wave 4 Tests
 *
 * Covers:
 *   - XSS prevention in submissions (2 tests)
 *   - Oversized submission rejection (1 test)
 *   - Form with 0 fields rejection (1 test)
 *   - Submission to deleted form (1 test)
 *   - Concurrent submissions (1 test)
 *   - Form analytics route (2 tests)
 *   - Admin page HTML rendering (2 tests)
 *   - Auto-response variable substitution (1 test)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	createMockContext,
	createMockKV,
	buildRouteCtx,
	contactFormDef,
	seedForm,
	seedSubmission,
} from "./helpers";

vi.mock("emdash", () => ({
	definePlugin: (def: unknown) => def,
}));

// Mock fetch globally for email sending
const mockFetch = vi.fn().mockResolvedValue({
	ok: true,
	text: async () => "{}",
	json: async () => ({}),
});
global.fetch = mockFetch as unknown as typeof fetch;

// Import after mocks
const pluginModule = await import("../sandbox-entry");
const plugin = pluginModule.default as unknown as {
	hooks: Record<string, unknown>;
	routes: Record<
		string,
		{
			public?: boolean;
			handler: (routeCtx: unknown, ctx: unknown) => Promise<unknown>;
		}
	>;
};
const routes = plugin.routes;

// Import email helpers for direct testing
const emailModule = await import("../email");
const { generateAutoResponseWithVariablesHTML, substituteVariables } =
	emailModule;

// Import admin-ui for direct testing
const adminUiModule = await import("../admin-ui");
const { renderFormListPage, renderSubmissionListPage, renderFormActivityWidget } =
	adminUiModule;

// =============================================================================
// XSS Prevention (2 tests)
// =============================================================================
describe("XSS Prevention", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	it("should escape <script> tags in submitted field values", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: '<script>alert("xss")</script>',
					email: "test@test.com",
					subject: "Normal subject",
					message: "Normal message",
				},
			},
			pathParams: { id: "form-001" },
		});

		const result = (await routes.submitForm.handler(routeCtx, ctx)) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);

		const subJson = await kv.get<string>(
			`submission:form-001:${result.submissionId}`
		);
		const sub = JSON.parse(subJson!);
		expect(sub.data.name).not.toContain("<script>");
		expect(sub.data.name).toContain("&lt;script&gt;");
		expect(sub.data.name).toContain("&lt;/script&gt;");
	});

	it("should escape all HTML entities in multi-field XSS attempt", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: '<img src=x onerror="alert(1)">',
					email: "test@test.com",
					subject: '"><script>document.cookie</script>',
					message: "<div onmouseover=\"alert('xss')\">hover me</div>",
				},
			},
			pathParams: { id: "form-001" },
		});

		const result = (await routes.submitForm.handler(routeCtx, ctx)) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);

		const subJson = await kv.get<string>(
			`submission:form-001:${result.submissionId}`
		);
		const sub = JSON.parse(subJson!);
		expect(sub.data.name).not.toContain("<img");
		expect(sub.data.name).toContain("&lt;img");
		expect(sub.data.subject).not.toContain("<script>");
		expect(sub.data.message).not.toContain("<div");
	});
});

// =============================================================================
// Oversized Submission (1 test)
// =============================================================================
describe("Oversized Submission", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		vi.clearAllMocks();
	});

	it("should reject submissions larger than 50KB with 413 status", async () => {
		await seedForm(kv, contactFormDef());

		const largeValue = "A".repeat(55000);

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Test",
					email: "test@test.com",
					subject: "Test",
					message: largeValue,
				},
			},
			pathParams: { id: "form-001" },
		});

		try {
			await routes.submitForm.handler(routeCtx, ctx);
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(Response);
			const response = err as Response;
			expect(response.status).toBe(413);
		}
	});
});

// =============================================================================
// Form with 0 Fields (1 test)
// =============================================================================
describe("Form with 0 Fields", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		vi.clearAllMocks();
	});

	it("should reject creation of form with empty fields array", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				name: "Empty Form",
				fields: [],
			},
			user: { isAdmin: true },
		});

		try {
			await routes.createForm.handler(routeCtx, ctx);
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(Response);
			const response = err as Response;
			expect(response.status).toBe(400);
		}
	});
});

// =============================================================================
// Submission to Deleted Form (1 test)
// =============================================================================
describe("Submission to Deleted Form", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		vi.clearAllMocks();
	});

	it("should return 404 when submitting to a deleted form", async () => {
		await seedForm(kv, contactFormDef());

		// Delete the form
		const deleteCtx = buildRouteCtx({
			input: { id: "form-001" },
			user: { isAdmin: true },
		});
		await routes.deleteForm.handler(deleteCtx, ctx);

		// Attempt to submit
		const submitCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Test",
					email: "test@test.com",
					subject: "Test",
					message: "Test",
				},
			},
			pathParams: { id: "form-001" },
		});

		try {
			await routes.submitForm.handler(submitCtx, ctx);
			expect.unreachable("Should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(Response);
			const response = err as Response;
			expect(response.status).toBe(404);
		}
	});
});

// =============================================================================
// Concurrent Submissions (1 test)
// =============================================================================
describe("Concurrent Submissions", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	it("should handle two rapid concurrent submissions successfully", async () => {
		await seedForm(kv, contactFormDef());

		const makeSubmission = (name: string, ip: string) =>
			buildRouteCtx({
				input: {
					formId: "form-001",
					data: {
						name,
						email: `${name.toLowerCase().replace(/ /g, "")}@test.com`,
						subject: "Test",
						message: "Test message",
					},
					_ip: ip,
				},
				pathParams: { id: "form-001" },
			});

		const [result1, result2] = await Promise.all([
			routes.submitForm.handler(makeSubmission("User One", "1.1.1.1"), ctx),
			routes.submitForm.handler(makeSubmission("User Two", "2.2.2.2"), ctx),
		]);

		expect((result1 as any).success).toBe(true);
		expect((result2 as any).success).toBe(true);
		expect((result1 as any).submissionId).not.toBe(
			(result2 as any).submissionId
		);
	});
});

// =============================================================================
// Form Analytics Route (2 tests)
// =============================================================================
describe("Form Analytics Route", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	it("should return daily and weekly analytics counts", async () => {
		await seedForm(kv, contactFormDef());

		// Submit some data to create analytics
		const today = new Date().toISOString().slice(0, 10);
		const analyticsSnapshot = {
			formId: "form-001",
			dailyCounts: { [today]: 3 },
			updatedAt: new Date().toISOString(),
		};
		await kv.set(
			"form-analytics:form-001",
			JSON.stringify(analyticsSnapshot)
		);

		// Seed some submissions for field completion
		await seedSubmission(kv, "form-001", {
			id: "sub-a1",
			data: {
				name: "Jane",
				email: "jane@test.com",
				subject: "Hi",
				message: "Hello",
			},
			submittedAt: new Date().toISOString(),
		});
		await seedSubmission(kv, "form-001", {
			id: "sub-a2",
			data: {
				name: "Bob",
				email: "bob@test.com",
				subject: "",
				message: "World",
			},
			submittedAt: new Date().toISOString(),
		});

		const routeCtx = buildRouteCtx({
			input: { formId: "form-001" },
			user: { isAdmin: true },
		});

		const result = (await routes.formAnalytics.handler(routeCtx, ctx)) as {
			success: boolean;
			daily: Array<{ date: string; count: number }>;
			weekly: Array<{ weekStart: string; count: number }>;
			fieldCompletion: Array<{
				fieldId: string;
				completionRate: number;
			}>;
		};

		expect(result.success).toBe(true);
		expect(result.daily).toHaveLength(30);
		expect(result.weekly).toHaveLength(12);

		// Today should have 3 in daily
		const todayEntry = result.daily.find((d) => d.date === today);
		expect(todayEntry?.count).toBe(3);

		// Field completion should exist
		expect(result.fieldCompletion.length).toBeGreaterThan(0);
	});

	it("should return correct field completion rates", async () => {
		await seedForm(kv, contactFormDef());

		// All fields filled
		await seedSubmission(kv, "form-001", {
			id: "sub-c1",
			data: {
				name: "Alice",
				email: "alice@test.com",
				subject: "Test",
				message: "Filled",
			},
		});
		// Subject skipped
		await seedSubmission(kv, "form-001", {
			id: "sub-c2",
			data: { name: "Bob", email: "bob@test.com", subject: "", message: "Partial" },
		});

		const routeCtx = buildRouteCtx({
			input: { formId: "form-001" },
			user: { isAdmin: true },
		});

		const result = (await routes.formAnalytics.handler(routeCtx, ctx)) as {
			success: boolean;
			fieldCompletion: Array<{
				fieldId: string;
				label: string;
				completionRate: number;
				filled: number;
				total: number;
			}>;
		};

		expect(result.success).toBe(true);

		const nameField = result.fieldCompletion.find(
			(f) => f.fieldId === "name"
		);
		expect(nameField?.completionRate).toBe(100);
		expect(nameField?.filled).toBe(2);

		const subjectField = result.fieldCompletion.find(
			(f) => f.fieldId === "subject"
		);
		expect(subjectField?.completionRate).toBe(50);
		expect(subjectField?.filled).toBe(1);
	});
});

// =============================================================================
// Admin Page HTML Rendering (2 tests)
// =============================================================================
describe("Admin Page HTML Rendering", () => {
	it("should render forms page with valid HTML containing form data", () => {
		const forms = [
			{
				id: "f1",
				name: "Contact Form",
				fieldCount: 4,
				submissionCount: 25,
				lastSubmissionAt: "2026-04-01T12:00:00.000Z",
				createdAt: "2026-03-15T00:00:00.000Z",
			},
			{
				id: "f2",
				name: "Feedback Survey",
				fieldCount: 3,
				submissionCount: 10,
				createdAt: "2026-03-20T00:00:00.000Z",
			},
		];

		const html = renderFormListPage(forms);

		// Structural checks
		expect(html).toContain("<div class=\"formforge\">");
		expect(html).toContain("<style>");
		expect(html).toContain("<table");
		expect(html).toContain("</table>");
		expect(html).toContain("Contact Form");
		expect(html).toContain("Feedback Survey");
		expect(html).toContain("Create Form");
		expect(html).toContain("Create from Template");
		expect(html).toContain("2 forms");
	});

	it("should render submissions page with valid HTML and pagination info", () => {
		const form = {
			id: "f1",
			name: "Contact Form",
			fields: [
				{ id: "name", label: "Full Name" },
				{ id: "email", label: "Email" },
				{ id: "message", label: "Message" },
			],
		};

		const submissions = [
			{
				id: "sub-1",
				data: { name: "Alice", email: "alice@test.com", message: "Hello" },
				submittedAt: "2026-04-01T12:00:00.000Z",
			},
			{
				id: "sub-2",
				data: { name: "Bob", email: "bob@test.com", message: "Hi there" },
				submittedAt: "2026-04-02T12:00:00.000Z",
			},
		];

		const pagination = { total: 50, limit: 20, offset: 0 };

		const html = renderSubmissionListPage(form, submissions, pagination);

		// Structural checks
		expect(html).toContain("<div class=\"formforge\">");
		expect(html).toContain("Contact Form");
		expect(html).toContain("Alice");
		expect(html).toContain("Bob");
		expect(html).toContain("Export CSV");
		expect(html).toContain("50 submissions");
		// Pagination should appear since total > limit
		expect(html).toContain("formforge__pagination");
	});
});

// =============================================================================
// Auto-Response Variable Substitution (1 test)
// =============================================================================
describe("Auto-Response Variable Substitution", () => {
	it("should replace {submitterName}, {formName}, {submissionDate} in email", () => {
		const variables = {
			submitterName: "Jane Doe",
			formName: "Contact Form",
			submissionDate: "Sunday, April 5, 2026",
		};

		const html = generateAutoResponseWithVariablesHTML(
			"Thanks {submitterName}!",
			"Hello {submitterName}, we received your submission to {formName} on {submissionDate}. We will get back to you soon.",
			variables
		);

		expect(html).toContain("Thanks Jane Doe!");
		expect(html).toContain("Hello Jane Doe");
		expect(html).toContain("Contact Form");
		expect(html).toContain("Sunday, April 5, 2026");
		expect(html).not.toContain("{submitterName}");
		expect(html).not.toContain("{formName}");
		expect(html).not.toContain("{submissionDate}");
	});

	it("should substitute variables in raw text correctly", () => {
		const result = substituteVariables(
			"Dear {submitterName}, thank you for {formName}",
			{
				submitterName: "Alice",
				formName: "Booking Form",
				submissionDate: "April 1, 2026",
			}
		);

		expect(result).toBe("Dear Alice, thank you for Booking Form");
	});
});
