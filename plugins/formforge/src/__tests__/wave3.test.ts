/**
 * FormForge Wave 3 Tests
 *
 * Covers:
 *   - Webhook dispatch: fires for configured webhooks, skips wrong events
 *   - Webhook HMAC signing: produces correct signature
 *   - Webhook integration: submission triggers webhook dispatch
 *   - Webhook test endpoint: sends test payload
 *   - Webhook logging: tracks last fire time
 *   - End-to-end: submit -> webhook fire
 *   - Multi-step form validation: per-step validation
 *   - Edge cases: empty webhooks, no secret, invalid URL
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
	createMockContext,
	createMockKV,
	buildRouteCtx,
	contactFormDef,
	seedForm,
} from "./helpers";

vi.mock("emdash", () => ({
	definePlugin: (def: unknown) => def,
}));

// Mock fetch globally
const mockFetch = vi.fn().mockResolvedValue({
	ok: true,
	status: 200,
	text: async () => "{}",
	json: async () => ({}),
});
global.fetch = mockFetch as unknown as typeof fetch;

// Mock crypto.subtle for HMAC signing
const mockSignResult = new Uint8Array(32);
for (let i = 0; i < 32; i++) mockSignResult[i] = i;

Object.defineProperty(global, "crypto", {
	value: {
		subtle: {
			importKey: vi.fn().mockResolvedValue("mockKey"),
			sign: vi.fn().mockResolvedValue(mockSignResult.buffer),
		},
	},
	writable: true,
});

// Import after mocks
const pluginModule = await import("../sandbox-entry");
const { dispatchWebhooks, computeHmacSignature } = pluginModule;
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

// =============================================================================
// WEBHOOK DISPATCH (2 tests)
// =============================================================================
describe("Webhook Dispatch", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should fire webhook for configured webhooks with submission.created event", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://example.com/webhook",
					events: ["submission.created"],
				},
			],
		};

		const submission = {
			id: "sub-001",
			formId: form.id,
			data: { name: "Test" },
			submittedAt: "2026-04-01T00:00:00.000Z",
		};

		await dispatchWebhooks(ctx as any, form as any, submission as any);

		// Wait for fire-and-forget promises
		await new Promise((r) => setTimeout(r, 50));

		expect(mockFetch).toHaveBeenCalledWith(
			"https://example.com/webhook",
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining("submission.created"),
			})
		);
	});

	it("should skip webhook if events do not include submission.created", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://example.com/webhook",
					events: ["form.updated"],
				},
			],
		};

		const submission = {
			id: "sub-001",
			formId: form.id,
			data: { name: "Test" },
			submittedAt: "2026-04-01T00:00:00.000Z",
		};

		await dispatchWebhooks(ctx as any, form as any, submission as any);
		await new Promise((r) => setTimeout(r, 50));

		// fetch should not have been called for webhook (may be called for other reasons)
		const webhookCalls = mockFetch.mock.calls.filter(
			(call: any[]) => call[0] === "https://example.com/webhook"
		);
		expect(webhookCalls).toHaveLength(0);
	});
});

// =============================================================================
// WEBHOOK HMAC SIGNING (2 tests)
// =============================================================================
describe("Webhook HMAC Signing", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should produce an HMAC-SHA256 signature string", async () => {
		const signature = await computeHmacSignature(
			"my-secret",
			'{"event":"test"}'
		);

		// Should be a hex string (64 chars for 32 bytes)
		expect(signature).toMatch(/^[0-9a-f]{64}$/);
		expect(crypto.subtle.importKey).toHaveBeenCalledWith(
			"raw",
			expect.any(Uint8Array),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"]
		);
	});

	it("should include X-FormForge-Signature header when webhook has secret", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);
		mockFetch.mockClear();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});

		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://example.com/hook",
					secret: "super-secret-key",
					events: ["submission.created"],
				},
			],
		};

		const submission = {
			id: "sub-002",
			formId: form.id,
			data: { name: "Test" },
			submittedAt: "2026-04-01T00:00:00.000Z",
		};

		await dispatchWebhooks(ctx as any, form as any, submission as any);
		await new Promise((r) => setTimeout(r, 50));

		expect(mockFetch).toHaveBeenCalledWith(
			"https://example.com/hook",
			expect.objectContaining({
				headers: expect.objectContaining({
					"X-FormForge-Signature": expect.stringMatching(/^[0-9a-f]+$/),
				}),
			})
		);
	});
});

// =============================================================================
// WEBHOOK INTEGRATION (2 tests)
// =============================================================================
describe("Webhook Integration", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should dispatch webhooks when form submission succeeds", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://hooks.example.com/submit",
					events: ["submission.created"],
				},
			],
		};
		await seedForm(kv, form);

		const routeCtx = buildRouteCtx({
			input: {
				formId: form.id,
				data: {
					name: "Alice",
					email: "alice@example.com",
					subject: "Hello",
					message: "Test message",
				},
				_ip: "10.0.0.1",
			},
			pathParams: { id: form.id },
		});

		const result = (await routes.submitForm.handler(routeCtx, ctx)) as {
			success: boolean;
			submissionId: string;
		};

		expect(result.success).toBe(true);

		// Allow fire-and-forget to resolve
		await new Promise((r) => setTimeout(r, 100));

		const webhookCalls = mockFetch.mock.calls.filter(
			(call: any[]) => call[0] === "https://hooks.example.com/submit"
		);
		expect(webhookCalls.length).toBeGreaterThanOrEqual(1);

		// Verify payload structure
		const payload = JSON.parse(webhookCalls[0][1].body);
		expect(payload.event).toBe("submission.created");
		expect(payload.formId).toBe(form.id);
		expect(payload.submissionId).toBeTruthy();
	});

	it("should not dispatch webhooks when form has no webhooks configured", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				data: {
					name: "Bob",
					email: "bob@example.com",
					subject: "No webhooks",
					message: "Testing",
				},
				_ip: "10.0.0.2",
			},
			pathParams: { id: "form-001" },
		});

		mockFetch.mockClear();
		const result = (await routes.submitForm.handler(routeCtx, ctx)) as {
			success: boolean;
		};
		expect(result.success).toBe(true);

		await new Promise((r) => setTimeout(r, 50));

		// Only email-related fetch calls should have happened (if any), not webhook calls
		const webhookCalls = mockFetch.mock.calls.filter(
			(call: any[]) =>
				typeof call[0] === "string" &&
				!call[0].includes("resend.com")
		);
		// No webhook URLs should be fetched
		expect(webhookCalls).toHaveLength(0);
	});
});

// =============================================================================
// WEBHOOK TEST ENDPOINT (1 test)
// =============================================================================
describe("Webhook Test Endpoint", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should send a test webhook payload and return success", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				url: "https://test-hook.example.com/test",
				secret: "test-secret",
			},
			user: { isAdmin: true },
		});

		const result = (await routes.webhookTest.handler(routeCtx, ctx)) as {
			success: boolean;
			status: number;
		};

		expect(result.success).toBe(true);
		expect(result.status).toBe(200);

		expect(mockFetch).toHaveBeenCalledWith(
			"https://test-hook.example.com/test",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Content-Type": "application/json",
					"X-FormForge-Signature": expect.any(String),
				}),
			})
		);

		// Verify the payload contains event: "test"
		const call = mockFetch.mock.calls.find(
			(c: any[]) => c[0] === "https://test-hook.example.com/test"
		);
		const payload = JSON.parse(call![1].body);
		expect(payload.event).toBe("test");
		expect(payload.formId).toBe("form-001");
	});
});

// =============================================================================
// WEBHOOK LOGGING (1 test)
// =============================================================================
describe("Webhook Logging", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should track last webhook fire time in KV after test", async () => {
		await seedForm(kv, contactFormDef());

		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-001",
				url: "https://log-hook.example.com",
			},
			user: { isAdmin: true },
		});

		await routes.webhookTest.handler(routeCtx, ctx);

		const logJson = await kv.get<string>("webhook-log:form-001");
		expect(logJson).toBeTruthy();
		const log = JSON.parse(logJson!);
		expect(log.lastFiredAt).toBeTruthy();
		expect(log.lastUrl).toBe("https://log-hook.example.com");
		expect(log.lastSuccess).toBe(true);
		expect(log.event).toBe("test");
	});
});

// =============================================================================
// END-TO-END: SUBMIT -> WEBHOOK (2 tests)
// =============================================================================
describe("Form with Webhooks E2E", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should fire multiple webhooks for a single submission", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://hook1.example.com",
					events: ["submission.created"],
				},
				{
					url: "https://hook2.example.com",
					secret: "hook2secret",
					events: ["submission.created"],
				},
			],
		};
		await seedForm(kv, form);

		const routeCtx = buildRouteCtx({
			input: {
				formId: form.id,
				data: {
					name: "Multi Hook",
					email: "multi@example.com",
					subject: "Test",
					message: "Multiple webhooks",
				},
				_ip: "10.0.0.3",
			},
			pathParams: { id: form.id },
		});

		const result = (await routes.submitForm.handler(routeCtx, ctx)) as {
			success: boolean;
		};
		expect(result.success).toBe(true);

		await new Promise((r) => setTimeout(r, 100));

		const hook1Calls = mockFetch.mock.calls.filter(
			(c: any[]) => c[0] === "https://hook1.example.com"
		);
		const hook2Calls = mockFetch.mock.calls.filter(
			(c: any[]) => c[0] === "https://hook2.example.com"
		);

		expect(hook1Calls.length).toBe(1);
		expect(hook2Calls.length).toBe(1);

		// hook2 should have signature header
		expect(hook2Calls[0][1].headers["X-FormForge-Signature"]).toBeTruthy();
	});

	it("should include correct submission data in webhook payload", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://data-hook.example.com",
					events: ["submission.created"],
				},
			],
		};
		await seedForm(kv, form);

		const routeCtx = buildRouteCtx({
			input: {
				formId: form.id,
				data: {
					name: "Payload Test",
					email: "payload@example.com",
					subject: "Data",
					message: "Check payload",
				},
				_ip: "10.0.0.4",
			},
			pathParams: { id: form.id },
		});

		const result = (await routes.submitForm.handler(routeCtx, ctx)) as {
			success: boolean;
			submissionId: string;
		};
		expect(result.success).toBe(true);

		await new Promise((r) => setTimeout(r, 100));

		const hookCalls = mockFetch.mock.calls.filter(
			(c: any[]) => c[0] === "https://data-hook.example.com"
		);
		expect(hookCalls.length).toBe(1);

		const payload = JSON.parse(hookCalls[0][1].body);
		expect(payload.event).toBe("submission.created");
		expect(payload.formName).toBe("Contact Form");
		expect(payload.submissionId).toBe(result.submissionId);
		expect(payload.data.name).toBeTruthy();
		expect(payload.submittedAt).toBeTruthy();
	});
});

// =============================================================================
// MULTI-STEP FORM VALIDATION (2 tests)
// =============================================================================
describe("Multi-Step Form Validation", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should store multi-step form definition with steps", async () => {
		const formData = {
			...contactFormDef({ id: "form-steps" }),
			steps: [
				{ name: "Contact Info", fieldIds: ["name", "email"] },
				{ name: "Message", fieldIds: ["subject", "message"] },
			],
		};
		await seedForm(kv, formData);

		const routeCtx = buildRouteCtx({
			input: { id: "form-steps" },
		});

		const result = (await routes.getForm.handler(routeCtx, ctx)) as {
			success: boolean;
			form: { steps: Array<{ name: string; fieldIds: string[] }> };
		};

		expect(result.success).toBe(true);
		expect(result.form.steps).toHaveLength(2);
		expect(result.form.steps[0].name).toBe("Contact Info");
		expect(result.form.steps[0].fieldIds).toEqual(["name", "email"]);
		expect(result.form.steps[1].name).toBe("Message");
	});

	it("should validate all step fields on submission (server-side)", async () => {
		const formData = {
			...contactFormDef({ id: "form-steps-val" }),
			steps: [
				{ name: "Step 1", fieldIds: ["name", "email"] },
				{ name: "Step 2", fieldIds: ["subject", "message"] },
			],
		};
		await seedForm(kv, formData);

		// Submit with missing fields from step 2
		const routeCtx = buildRouteCtx({
			input: {
				formId: "form-steps-val",
				data: {
					name: "Test User",
					email: "test@example.com",
					// subject and message missing
				},
				_ip: "10.0.0.5",
			},
			pathParams: { id: "form-steps-val" },
		});

		// Server-side validation should still reject incomplete data
		await expect(
			routes.submitForm.handler(routeCtx, ctx)
		).rejects.toBeInstanceOf(Response);
	});
});

// =============================================================================
// EDGE CASES (3 tests)
// =============================================================================
describe("Webhook Edge Cases", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "{}",
			json: async () => ({}),
		});
	});

	it("should handle empty webhooks array gracefully", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [] as any[],
		};

		const submission = {
			id: "sub-edge-1",
			formId: form.id,
			data: { name: "Test" },
			submittedAt: "2026-04-01T00:00:00.000Z",
		};

		// Should not throw
		await dispatchWebhooks(ctx as any, form as any, submission as any);
		await new Promise((r) => setTimeout(r, 50));

		const webhookCalls = mockFetch.mock.calls.filter(
			(call: any[]) => typeof call[0] === "string" && !call[0].includes("resend")
		);
		expect(webhookCalls).toHaveLength(0);
	});

	it("should fire webhook without signature when no secret is provided", async () => {
		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://no-secret.example.com",
					// no secret
					events: ["submission.created"],
				},
			],
		};

		const submission = {
			id: "sub-edge-2",
			formId: form.id,
			data: { name: "Test" },
			submittedAt: "2026-04-01T00:00:00.000Z",
		};

		await dispatchWebhooks(ctx as any, form as any, submission as any);
		await new Promise((r) => setTimeout(r, 50));

		const calls = mockFetch.mock.calls.filter(
			(c: any[]) => c[0] === "https://no-secret.example.com"
		);
		expect(calls).toHaveLength(1);

		// Should NOT have X-FormForge-Signature header
		expect(
			calls[0][1].headers["X-FormForge-Signature"]
		).toBeUndefined();
	});

	it("should handle invalid webhook URL without crashing", async () => {
		mockFetch.mockRejectedValueOnce(new Error("Network error"));

		const form = {
			...contactFormDef(),
			webhooks: [
				{
					url: "https://invalid-url.example.com/broken",
					events: ["submission.created"],
				},
			],
		};

		const submission = {
			id: "sub-edge-3",
			formId: form.id,
			data: { name: "Test" },
			submittedAt: "2026-04-01T00:00:00.000Z",
		};

		// Should not throw even when fetch fails
		await dispatchWebhooks(ctx as any, form as any, submission as any);
		await new Promise((r) => setTimeout(r, 100));

		// The webhook log should record the failure
		const logJson = await kv.get<string>(`webhook-log:${form.id}`);
		expect(logJson).toBeTruthy();
		const log = JSON.parse(logJson!);
		expect(log.lastSuccess).toBe(false);
		expect(log.error).toContain("Network error");
	});
});
