/**
 * FormForge Sandbox Entry Tests — Waves 1 & 2
 *
 * Covers:
 *   - Form CRUD (create, read, update, delete, list)
 *   - Template creation (contact, booking, feedback, quote-request)
 *   - Submission engine (validation, conditional logic, honeypot, rate limiting)
 *   - Submission management (list, get, delete, export CSV)
 *   - Edge cases (XSS, all field types, max fields, special characters)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	createMockContext,
	createMockKV,
	buildRouteCtx,
	contactFormDef,
	conditionalFormDef,
	allFieldTypesFormDef,
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

// Import after mocks are in place
const pluginModule = await import("../sandbox-entry");
const plugin = (pluginModule.default as unknown) as {
	hooks: Record<string, unknown>;
	routes: Record<string, { public?: boolean; handler: (routeCtx: unknown, ctx: unknown) => Promise<unknown> }>;
};
const routes = plugin.routes;

// =============================================================================
// FORM CRUD (8+ tests)
// =============================================================================
describe("Form CRUD", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	it("should create a form with valid data", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				name: "Contact Us",
				description: "Get in touch",
				fields: [
					{ id: "name", type: "text", label: "Name", required: true },
					{ id: "email", type: "email", label: "Email", required: true },
				],
			},
			user: { isAdmin: true },
		});

		const result = await routes.createForm.handler(routeCtx, ctx) as {
			success: boolean;
			formId: string;
		};

		expect(result.success).toBe(true);
		expect(result.formId).toBeTruthy();

		// Verify stored in KV
		const formJson = await kv.get<string>(`form:${result.formId}`);
		expect(formJson).toBeTruthy();
		const form = JSON.parse(formJson!);
		expect(form.name).toBe("Contact Us");
		expect(form.fields).toHaveLength(2);
		expect(form.totalSubmissions).toBe(0);
	});

	it("should reject form creation with missing name", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				name: "",
				fields: [{ id: "f1", type: "text", label: "Field", required: false }],
			},
			user: { isAdmin: true },
		});

		await expect(
			routes.createForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should reject form creation with zero fields", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				name: "Empty Form",
				fields: [],
			},
			user: { isAdmin: true },
		});

		await expect(
			routes.createForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should update an existing form", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				id: "form-001",
				name: "Updated Contact Form",
				notifyEmails: ["admin@test.com"],
			},
			user: { isAdmin: true },
		});

		const result = await routes.updateForm.handler(routeCtx, ctx) as {
			success: boolean;
			form: { name: string; notifyEmails: string[] };
		};

		expect(result.success).toBe(true);
		expect(result.form.name).toBe("Updated Contact Form");
		expect(result.form.notifyEmails).toEqual(["admin@test.com"]);
	});

	it("should return 404 when updating non-existent form", async () => {
		const routeCtx = buildRouteCtx({
			input: { id: "nonexistent", name: "No Form" },
			user: { isAdmin: true },
		});

		await expect(
			routes.updateForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should delete a form and cascade to submissions", async () => {
		await seedForm(kv, contactFormDef());
		await seedSubmission(kv, "form-001", {
			id: "sub-001",
			data: { name: "Test", email: "test@test.com" },
		});
		await seedSubmission(kv, "form-001", {
			id: "sub-002",
			data: { name: "Test2", email: "test2@test.com" },
		});

		const routeCtx = buildRouteCtx({
			input: { id: "form-001" },
			user: { isAdmin: true },
		});

		const result = await routes.deleteForm.handler(routeCtx, ctx) as {
			success: boolean;
			deletedSubmissions: number;
		};

		expect(result.success).toBe(true);
		expect(result.deletedSubmissions).toBe(2);

		// Verify form is gone
		const formJson = await kv.get<string>("form:form-001");
		expect(formJson).toBeNull();

		// Verify submissions are gone
		const sub1 = await kv.get<string>("submission:form-001:sub-001");
		expect(sub1).toBeNull();
	});

	it("should list forms with submission counts", async () => {
		await seedForm(kv, contactFormDef({ id: "form-a", name: "Form A" }));
		await seedForm(kv, contactFormDef({ id: "form-b", name: "Form B" }));
		await seedSubmission(kv, "form-a", { id: "s1", data: { name: "X" } });
		await seedSubmission(kv, "form-a", { id: "s2", data: { name: "Y" } });

		const routeCtx = buildRouteCtx({
			user: { isAdmin: true },
		});

		const result = await routes.listForms.handler(routeCtx, ctx) as {
			success: boolean;
			forms: Array<{ id: string; submissionCount: number }>;
			total: number;
		};

		expect(result.success).toBe(true);
		expect(result.total).toBe(2);

		const formA = result.forms.find((f) => f.id === "form-a");
		expect(formA?.submissionCount).toBe(2);

		const formB = result.forms.find((f) => f.id === "form-b");
		expect(formB?.submissionCount).toBe(0);
	});

	it("should get a single form by ID", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: { id: "form-001" },
		});

		const result = await routes.getForm.handler(routeCtx, ctx) as {
			success: boolean;
			form: { id: string; name: string };
		};

		expect(result.success).toBe(true);
		expect(result.form.id).toBe("form-001");
		expect(result.form.name).toBe("Contact Form");
	});

	it("should return 404 for non-existent form", async () => {
		const routeCtx = buildRouteCtx({
			input: { id: "nonexistent" },
		});

		await expect(
			routes.getForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});
});

// =============================================================================
// TEMPLATES (5+ tests)
// =============================================================================
describe("Templates", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		vi.clearAllMocks();
	});

	it("should create a form from 'contact' template", async () => {
		const routeCtx = buildRouteCtx({
			input: { template: "contact" },
			user: { isAdmin: true },
		});

		const result = await routes.createFromTemplate.handler(routeCtx, ctx) as {
			success: boolean;
			formId: string;
			form: { name: string; fields: Array<{ id: string }> };
		};

		expect(result.success).toBe(true);
		expect(result.form.name).toBe("Contact Form");
		expect(result.form.fields).toHaveLength(4);
		expect(result.form.fields.map((f) => f.id)).toEqual(["name", "email", "subject", "message"]);
	});

	it("should create a form from 'booking' template", async () => {
		const routeCtx = buildRouteCtx({
			input: { template: "booking" },
			user: { isAdmin: true },
		});

		const result = await routes.createFromTemplate.handler(routeCtx, ctx) as {
			success: boolean;
			form: { name: string; fields: Array<{ id: string; type: string }> };
		};

		expect(result.success).toBe(true);
		expect(result.form.name).toBe("Booking Request");
		expect(result.form.fields).toHaveLength(6);

		const dateField = result.form.fields.find((f) => f.id === "date");
		expect(dateField?.type).toBe("date");

		const timeField = result.form.fields.find((f) => f.id === "time");
		expect(timeField?.type).toBe("dropdown");
	});

	it("should create a form from 'feedback' template", async () => {
		const routeCtx = buildRouteCtx({
			input: { template: "feedback" },
			user: { isAdmin: true },
		});

		const result = await routes.createFromTemplate.handler(routeCtx, ctx) as {
			success: boolean;
			form: { name: string; fields: Array<{ id: string; type: string; required: boolean }> };
		};

		expect(result.success).toBe(true);
		expect(result.form.name).toBe("Feedback Survey");
		expect(result.form.fields).toHaveLength(3);

		// Name should be optional in feedback
		const nameField = result.form.fields.find((f) => f.id === "name");
		expect(nameField?.required).toBe(false);

		// Rating should be required
		const ratingField = result.form.fields.find((f) => f.id === "rating");
		expect(ratingField?.type).toBe("radio");
		expect(ratingField?.required).toBe(true);
	});

	it("should create a form from 'quote-request' template", async () => {
		const routeCtx = buildRouteCtx({
			input: { template: "quote-request" },
			user: { isAdmin: true },
		});

		const result = await routes.createFromTemplate.handler(routeCtx, ctx) as {
			success: boolean;
			form: { name: string; fields: Array<{ id: string }> };
		};

		expect(result.success).toBe(true);
		expect(result.form.name).toBe("Quote Request");
		expect(result.form.fields).toHaveLength(6);
		expect(result.form.fields.map((f) => f.id)).toContain("service");
		expect(result.form.fields.map((f) => f.id)).toContain("budget");
	});

	it("should reject creation from invalid template name", async () => {
		const routeCtx = buildRouteCtx({
			input: { template: "nonexistent-template" },
			user: { isAdmin: true },
		});

		await expect(
			routes.createFromTemplate.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should allow custom name override on template creation", async () => {
		const routeCtx = buildRouteCtx({
			input: { template: "contact", name: "My Custom Contact Form" },
			user: { isAdmin: true },
		});

		const result = await routes.createFromTemplate.handler(routeCtx, ctx) as {
			success: boolean;
			form: { name: string };
		};

		expect(result.success).toBe(true);
		expect(result.form.name).toBe("My Custom Contact Form");
	});
});

// =============================================================================
// SUBMISSION ENGINE (10+ tests)
// =============================================================================
describe("Submission Engine", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	it("should accept a valid submission", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Jane Doe",
					email: "jane@example.com",
					subject: "Hello",
					message: "Nice to meet you",
				},
				_ip: "192.168.1.1",
			},
			pathParams: { id: "form-001" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);
		expect(result.submissionId).toBeTruthy();

		// Verify stored
		const subJson = await kv.get<string>(`submission:form-001:${result.submissionId}`);
		expect(subJson).toBeTruthy();
		const sub = JSON.parse(subJson!);
		expect(sub.data.name).toBe("Jane Doe");
	});

	it("should reject submission with missing required field", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Jane Doe",
					email: "jane@example.com",
					// subject and message missing
				},
			},
			pathParams: { id: "form-001" },
		});

		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should reject submission with invalid email format", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Jane Doe",
					email: "not-an-email",
					subject: "Hello",
					message: "Test",
				},
			},
			pathParams: { id: "form-001" },
		});

		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should not require hidden conditional field when condition is not met", async () => {
		await seedForm(kv, conditionalFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-conditional",
				data: {
					inquiry_type: "General", // NOT "Other", so other_details is hidden
					email: "test@example.com",
				},
			},
			pathParams: { id: "form-conditional" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
		};

		// Should succeed because other_details is hidden (condition not met)
		expect(result.success).toBe(true);
	});

	it("should require conditional field when condition IS met", async () => {
		await seedForm(kv, conditionalFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-conditional",
				data: {
					inquiry_type: "Other", // "Other" triggers showWhen for other_details
					email: "test@example.com",
					// other_details is missing but required when visible
				},
			},
			pathParams: { id: "form-conditional" },
		});

		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should return fake success when honeypot is filled", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Spambot",
					email: "spam@bot.com",
					subject: "Buy now",
					message: "Click here",
				},
				_hp: "i-am-a-bot", // honeypot filled
			},
			pathParams: { id: "form-001" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
			submissionId: string;
		};

		// Should look successful to the bot
		expect(result.success).toBe(true);
		expect(result.submissionId).toContain("fake-");

		// But no actual submission stored
		const listJson = await kv.get<string>("submissions:form-001:list");
		expect(listJson).toBeNull();
	});

	it("should trigger rate limit after 5 submissions from same IP", async () => {
		await seedForm(kv, contactFormDef());

		const validData = {
			name: "Test",
			email: "test@test.com",
			subject: "Test",
			message: "Test message",
		};

		// Submit 5 times successfully
		for (let i = 0; i < 5; i++) {
			const routeCtx = buildRouteCtx({
				input: { formId: "form-001", data: validData, _ip: "10.0.0.1" },
				pathParams: { id: "form-001" },
			});
			const result = await routes.submitForm.handler(routeCtx, ctx) as { success: boolean };
			expect(result.success).toBe(true);
		}

		// 6th submission should be rate-limited
		const routeCtx = buildRouteCtx({
			input: { formId: "form-001", data: validData, _ip: "10.0.0.1" },
			pathParams: { id: "form-001" },
		});

		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should update analytics counters on submission", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
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

		await routes.submitForm.handler(routeCtx, ctx);

		const formJson = await kv.get<string>("form:form-001");
		const form = JSON.parse(formJson!);
		expect(form.totalSubmissions).toBe(1);
		expect(form.submissionsThisWeek).toBe(1);
		expect(form.lastSubmissionAt).toBeTruthy();
	});

	it("should return 404 for submission to non-existent form", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				formId: "nonexistent",
				data: { name: "Test" },
			},
			pathParams: { id: "nonexistent" },
		});

		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should reject oversized submission > 50KB", async () => {
		await seedForm(kv, contactFormDef());

		// Create a submission that exceeds 50KB
		const largeMessage = "X".repeat(60000); // ~60KB

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Test",
					email: "test@test.com",
					subject: "Test",
					message: largeMessage,
				},
			},
			pathParams: { id: "form-001" },
		});

		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should accept conditional field value when condition is met", async () => {
		await seedForm(kv, conditionalFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-conditional",
				data: {
					inquiry_type: "Other",
					other_details: "I need help with something custom",
					email: "test@example.com",
				},
			},
			pathParams: { id: "form-conditional" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);
	});
});

// =============================================================================
// SUBMISSION MANAGEMENT (5+ tests)
// =============================================================================
describe("Submission Management", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		vi.clearAllMocks();

		// Seed a form with some submissions
		await seedForm(kv, contactFormDef());
		for (let i = 1; i <= 5; i++) {
			await seedSubmission(kv, "form-001", {
				id: `sub-${String(i).padStart(3, "0")}`,
				data: {
					name: `User ${i}`,
					email: `user${i}@example.com`,
					subject: `Subject ${i}`,
					message: `Message ${i}`,
				},
				submittedAt: `2026-04-0${i}T12:00:00.000Z`,
			});
		}
	});

	it("should list submissions with pagination", async () => {
		const routeCtx = buildRouteCtx({
			input: { formId: "form-001", limit: "2", offset: "0" },
			user: { isAdmin: true },
		});

		const result = await routes.listSubmissions.handler(routeCtx, ctx) as {
			success: boolean;
			submissions: Array<{ id: string }>;
			total: number;
			limit: number;
			offset: number;
		};

		expect(result.success).toBe(true);
		expect(result.submissions).toHaveLength(2);
		expect(result.total).toBe(5);
		expect(result.limit).toBe(2);
		expect(result.offset).toBe(0);
	});

	it("should get a single submission", async () => {
		const routeCtx = buildRouteCtx({
			input: { formId: "form-001", submissionId: "sub-003" },
			user: { isAdmin: true },
		});

		const result = await routes.getSubmission.handler(routeCtx, ctx) as {
			success: boolean;
			submission: { id: string; data: { name: string } };
		};

		expect(result.success).toBe(true);
		expect(result.submission.id).toBe("sub-003");
		expect(result.submission.data.name).toBe("User 3");
	});

	it("should delete a submission", async () => {
		const routeCtx = buildRouteCtx({
			input: { formId: "form-001", submissionId: "sub-002" },
			user: { isAdmin: true },
		});

		const result = await routes.deleteSubmission.handler(routeCtx, ctx) as {
			success: boolean;
		};

		expect(result.success).toBe(true);

		// Verify removed from KV
		const subJson = await kv.get<string>("submission:form-001:sub-002");
		expect(subJson).toBeNull();

		// Verify removed from list
		const listJson = await kv.get<string>("submissions:form-001:list");
		const list = JSON.parse(listJson!);
		expect(list).not.toContain("sub-002");
		expect(list).toHaveLength(4);
	});

	it("should export submissions in CSV format", async () => {
		const routeCtx = buildRouteCtx({
			input: { formId: "form-001" },
			user: { isAdmin: true },
		});

		const result = await routes.exportSubmissions.handler(routeCtx, ctx) as {
			success: boolean;
			csv: string;
			count: number;
		};

		expect(result.success).toBe(true);
		expect(result.count).toBe(5);

		const lines = result.csv.split("\n");
		// Header row
		expect(lines[0]).toContain("Submission ID");
		expect(lines[0]).toContain("Submitted At");
		expect(lines[0]).toContain("Full Name");
		expect(lines[0]).toContain("Email Address");

		// Data rows
		expect(lines).toHaveLength(6); // 1 header + 5 data rows
		expect(lines[1]).toContain("sub-001");
	});

	it("should list submissions for empty form (no submissions)", async () => {
		await seedForm(kv, contactFormDef({ id: "form-empty", name: "Empty" }));

		const routeCtx = buildRouteCtx({
			input: { formId: "form-empty" },
			user: { isAdmin: true },
		});

		const result = await routes.listSubmissions.handler(routeCtx, ctx) as {
			success: boolean;
			submissions: unknown[];
			total: number;
		};

		expect(result.success).toBe(true);
		expect(result.submissions).toHaveLength(0);
		expect(result.total).toBe(0);
	});

	it("should paginate correctly with offset", async () => {
		const routeCtx = buildRouteCtx({
			input: { formId: "form-001", limit: "2", offset: "3" },
			user: { isAdmin: true },
		});

		const result = await routes.listSubmissions.handler(routeCtx, ctx) as {
			success: boolean;
			submissions: Array<{ id: string }>;
			total: number;
		};

		expect(result.success).toBe(true);
		expect(result.submissions).toHaveLength(2);
		expect(result.submissions[0].id).toBe("sub-004");
		expect(result.submissions[1].id).toBe("sub-005");
	});
});

// =============================================================================
// EDGE CASES (5+ tests)
// =============================================================================
describe("Edge Cases", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	it("should escape XSS in submitted field values", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: '<script>alert("xss")</script>',
					email: "test@test.com",
					subject: "Test <b>bold</b>",
					message: 'Normal "quoted" text',
				},
			},
			pathParams: { id: "form-001" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);

		// Verify stored data is escaped
		const subJson = await kv.get<string>(`submission:form-001:${result.submissionId}`);
		const sub = JSON.parse(subJson!);
		expect(sub.data.name).not.toContain("<script>");
		expect(sub.data.name).toContain("&lt;script&gt;");
		expect(sub.data.subject).toContain("&lt;b&gt;");
		expect(sub.data.message).toContain("&quot;");
	});

	it("should accept a form with all 10 field types", async () => {
		await seedForm(kv, allFieldTypesFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-all-types",
				data: {
					f_text: "Hello",
					f_email: "test@test.com",
					f_textarea: "Long text here",
					f_number: "42",
					f_phone: "(555) 123-4567",
					f_date: "2026-06-15",
					f_dropdown: "B",
					f_radio: "Y",
					f_checkbox: "true",
					f_hidden: "tracking-123",
				},
			},
			pathParams: { id: "form-all-types" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);
		expect(result.submissionId).toBeTruthy();
	});

	it("should handle concurrent form updates (last write wins)", async () => {
		await seedForm(kv, contactFormDef());

		// Simulate two concurrent updates
		const update1 = buildRouteCtx({
			input: { id: "form-001", name: "Version A" },
			user: { isAdmin: true },
		});
		const update2 = buildRouteCtx({
			input: { id: "form-001", name: "Version B" },
			user: { isAdmin: true },
		});

		await routes.updateForm.handler(update1, ctx);
		await routes.updateForm.handler(update2, ctx);

		const formJson = await kv.get<string>("form:form-001");
		const form = JSON.parse(formJson!);
		// Last write wins
		expect(form.name).toBe("Version B");
	});

	it("should reject form exceeding max field count", async () => {
		const fields = Array.from({ length: 51 }, (_, i) => ({
			id: `field-${i}`,
			type: "text",
			label: `Field ${i}`,
			required: false,
		}));

		const routeCtx = buildRouteCtx({
			input: { name: "Too Many Fields", fields },
			user: { isAdmin: true },
		});

		await expect(
			routes.createForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should handle special characters in field labels", async () => {
		const form = contactFormDef({
			id: "form-special",
			fields: [
				{ id: "q1", type: "text", label: "What's your name? (First & Last)", required: true },
				{ id: "q2", type: "email", label: 'Email "Address"', required: true },
			] as any,
		});

		await seedForm(kv, form);

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-special",
				data: {
					q1: "Test User",
					q2: "test@test.com",
				},
			},
			pathParams: { id: "form-special" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
		};

		expect(result.success).toBe(true);
	});

	it("should strip hidden conditional field values from submission", async () => {
		await seedForm(kv, conditionalFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-conditional",
				data: {
					inquiry_type: "General", // NOT "Other", so other_details is hidden
					other_details: "This should be stripped", // provided but field is hidden
					email: "test@example.com",
				},
			},
			pathParams: { id: "form-conditional" },
		});

		const result = await routes.submitForm.handler(routeCtx, ctx) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);

		// Verify hidden field value was stripped
		const subJson = await kv.get<string>(`submission:form-conditional:${result.submissionId}`);
		const sub = JSON.parse(subJson!);
		expect(sub.data.other_details).toBeUndefined();
	});

	it("should reject creation of form with no fields array", async () => {
		const routeCtx = buildRouteCtx({
			input: { name: "No Fields Form" },
			user: { isAdmin: true },
		});

		await expect(
			routes.createForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});

	it("should not allow non-admin to create forms", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				name: "Sneaky Form",
				fields: [{ id: "f1", type: "text", label: "Field", required: false }],
			},
			user: { isAdmin: false },
		});

		await expect(
			routes.createForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});
});
