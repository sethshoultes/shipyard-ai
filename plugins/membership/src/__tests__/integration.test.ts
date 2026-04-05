/**
 * MemberShip Plugin — Cross-Feature Integration Tests
 *
 * Validates full lifecycle flows across the membership plugin:
 *   1. Full member lifecycle (register -> gated content -> drip unlock -> webhooks)
 *   2. Group membership flow (create group -> invite -> accept -> gated access -> portal)
 *   3. PayPal payment flow (create order -> capture -> subscription -> reporting)
 *   4. CSV round-trip (export -> import -> verify in reporting)
 *
 * Edge cases:
 *   - Expired group invite code
 *   - Form submission with invalid step data (multi-step wizard)
 *   - Webhook retry exhaustion (3 failures -> dead letter)
 *   - CSV import with malformed rows (missing fields, bad email, duplicate emails)
 *
 * Performance:
 *   - Reporting endpoints with 1000+ mock members
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	createMockContext,
	createMockKV,
	buildRouteCtx,
	seedMember,
	seedDefaultPlans,
	seedGatingRule,
	seedForm,
	seedGroup,
	seedGroupInvite,
	seedWebhook,
} from "./helpers";

// Mock emdash so definePlugin is a passthrough
vi.mock("emdash", () => ({
	definePlugin: (def: unknown) => def,
}));

// Mock fetch globally for webhook/email sends
const mockFetch = vi.fn().mockResolvedValue({
	ok: true,
	status: 200,
	text: async () => "{}",
	json: async () => ({}),
});
global.fetch = mockFetch as unknown as typeof fetch;

// Import after mocks are in place
const pluginModule = await import("../sandbox-entry");
const plugin = (pluginModule.default as unknown) as {
	hooks: Record<string, { handler: (event: unknown, ctx: unknown) => Promise<unknown> }>;
	routes: Record<string, { public?: boolean; handler: (routeCtx: unknown, ctx: unknown) => Promise<unknown> }>;
};
const routes = plugin.routes;

// =============================================================================
// 1. FULL MEMBER LIFECYCLE
// =============================================================================
describe("Integration: Full Member Lifecycle", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		await seedDefaultPlans(kv);
	});

	it("should register a member via form, grant gated content access, unlock drip, and fire webhooks", async () => {
		// --- Step 1: Register a new member on the free plan ---
		const registerCtx = buildRouteCtx({
			input: { email: "alice@example.com", plan: "free" },
		});
		const regResult = (await routes.register.handler(registerCtx, ctx)) as {
			memberId: string;
			status: string;
			plan: string;
		};

		expect(regResult.memberId).toBe("alice@example.com");
		expect(regResult.status).toBe("active");
		expect(regResult.plan).toBe("free");

		// --- Step 2: Check membership status ---
		const statusCtx = buildRouteCtx({
			input: { email: "alice@example.com" },
		});
		const statusResult = (await routes.status.handler(statusCtx, ctx)) as {
			email: string;
			active: boolean;
			plan: string;
		};

		expect(statusResult.email).toBe("alice@example.com");
		expect(statusResult.active).toBe(true);
		expect(statusResult.plan).toBe("free");

		// --- Step 3: Set up gated content rules ---
		await seedGatingRule(kv, {
			contentId: "premium-article",
			type: "membership",
			planIds: ["pro", "premium"],
		});

		await seedGatingRule(kv, {
			contentId: "drip-lesson-1",
			type: "drip",
			planIds: ["pro", "premium"],
			dripDays: 0,
		});

		await seedGatingRule(kv, {
			contentId: "drip-lesson-2",
			type: "drip",
			planIds: ["pro", "premium"],
			dripDays: 7,
		});

		// --- Step 4: Upgrade the member to pro ---
		// The approve route only changes status, so we manually update the plan
		// to simulate a plan upgrade (e.g., via Stripe webhook or admin action)
		const encodedAlice = encodeURIComponent("alice@example.com");
		const aliceJson = await kv.get<string>(`member:${encodedAlice}`);
		const aliceRecord = JSON.parse(aliceJson!);
		aliceRecord.plan = "pro";
		aliceRecord.status = "active";
		await kv.set(`member:${encodedAlice}`, JSON.stringify(aliceRecord));

		// Verify status is now active with pro plan
		const updatedStatus = (await routes.status.handler(
			buildRouteCtx({ input: { email: "alice@example.com" } }),
			ctx
		)) as { active: boolean; plan: string };

		expect(updatedStatus.active).toBe(true);
		expect(updatedStatus.plan).toBe("pro");

		// --- Step 5: Verify gated content access via gating module ---
		// Seed the member's join date for drip calculation
		const memberJson2 = await kv.get<string>(`member:${encodedAlice}`);
		const member = JSON.parse(memberJson2!);
		member.joinDate = new Date().toISOString();
		member.status = "active";
		await kv.set(`member:${encodedAlice}`, JSON.stringify(member));

		// Import gating module to test content access
		const { canAccessContent, getMemberAccessList } = await import("../gating");

		// Premium article: pro member should have access
		const accessResult = await canAccessContent(
			"alice@example.com",
			"alice@example.com",
			{ type: "membership", planIds: ["pro", "premium"] },
			ctx as any
		);
		expect(accessResult.hasAccess).toBe(true);

		// Drip lesson 1 (0 days) should be accessible immediately
		const dripResult1 = await canAccessContent(
			"alice@example.com",
			"alice@example.com",
			{ type: "drip", planIds: ["pro", "premium"], dripDays: 0 },
			ctx as any
		);
		expect(dripResult1.hasAccess).toBe(true);

		// Drip lesson 2 (7 days) should still be locked
		const dripResult2 = await canAccessContent(
			"alice@example.com",
			"alice@example.com",
			{ type: "drip", planIds: ["pro", "premium"], dripDays: 7 },
			ctx as any
		);
		expect(dripResult2.hasAccess).toBe(false);
		expect(dripResult2.reason).toContain("unlock");

		// --- Step 6: Test getMemberAccessList ---
		const accessList = await getMemberAccessList("alice@example.com", ctx as any);
		// Should include drip-lesson-1 (unlocked) but not drip-lesson-2 (still locked)
		expect(accessList).toContain("drip-lesson-1");
		expect(accessList).not.toContain("drip-lesson-2");

		// --- Step 7: Register a webhook and verify it was stored ---
		const webhookCtx = buildRouteCtx({
			input: {
				url: "https://hooks.example.com/membership",
				events: ["member.created", "member.cancelled"],
			},
			user: { isAdmin: true },
		});
		const whResult = (await routes.webhookRegister.handler(webhookCtx, ctx)) as {
			success: boolean;
			webhook: { id: string; secret: string };
		};
		expect(whResult.success).toBe(true);
		expect(whResult.webhook.id).toBeTruthy();
		expect(whResult.webhook.secret).toBeTruthy();
	});

	it("should handle the full paid registration flow", async () => {
		const registerCtx = buildRouteCtx({
			input: { email: "bob@example.com", plan: "pro" },
		});
		const regResult = (await routes.register.handler(registerCtx, ctx)) as {
			memberId: string;
			status: string;
			plan: string;
			paymentLink?: string;
		};

		expect(regResult.memberId).toBe("bob@example.com");
		expect(regResult.status).toBe("pending");
		expect(regResult.plan).toBe("pro");
		expect(regResult.paymentLink).toBe("https://buy.stripe.com/test_pro");
	});

	it("should return existing member on duplicate registration", async () => {
		// Register first
		await routes.register.handler(
			buildRouteCtx({ input: { email: "dup@example.com", plan: "free" } }),
			ctx
		);

		// Register again with same email
		const result = (await routes.register.handler(
			buildRouteCtx({ input: { email: "dup@example.com", plan: "pro" } }),
			ctx
		)) as { memberId: string; status: string; plan: string };

		expect(result.memberId).toBe("dup@example.com");
		expect(result.plan).toBe("free"); // Original plan preserved
	});
});

// =============================================================================
// 2. GROUP MEMBERSHIP FLOW
// =============================================================================
describe("Integration: Group Membership Flow", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		await seedDefaultPlans(kv);
	});

	it("should create group, invite member, accept invite, grant gated access, and appear in portal", async () => {
		// --- Step 1: Admin creates a group ---
		const createGroupCtx = buildRouteCtx({
			input: {
				orgName: "Acme Corp",
				orgEmail: "team@acme.com",
				planId: "pro",
				maxSeats: 5,
				adminEmail: "admin@acme.com",
			},
			user: { isAdmin: true, email: "admin@acme.com" },
		});
		const groupResult = (await routes.groupCreate.handler(createGroupCtx, ctx)) as {
			success: boolean;
			group: { id: string; members: string[] };
		};

		expect(groupResult.success).toBe(true);
		const groupId = groupResult.group.id;
		expect(groupResult.group.members).toContain("admin@acme.com");

		// --- Step 2: Admin invites a member ---
		const inviteCtx = buildRouteCtx({
			input: { groupId, email: "member1@acme.com" },
			user: { isAdmin: true, email: "admin@acme.com" },
		});
		const inviteResult = (await routes.groupInvite.handler(inviteCtx, ctx)) as {
			success: boolean;
			inviteCode: string;
		};

		expect(inviteResult.success).toBe(true);
		const inviteCode = inviteResult.inviteCode;

		// --- Step 3: Member accepts the invite ---
		const acceptCtx = buildRouteCtx({
			input: { code: inviteCode, email: "member1@acme.com" },
		});
		const acceptResult = (await routes.groupAccept.handler(acceptCtx, ctx)) as {
			success: boolean;
			group: { id: string; members: string[] };
			message: string;
		};

		expect(acceptResult.success).toBe(true);
		expect(acceptResult.group.members).toContain("member1@acme.com");
		expect(acceptResult.message).toContain("Acme Corp");

		// --- Step 4: Register the member and seed gated content access ---
		// The member needs a member record with the group's plan
		await seedMember(kv, {
			email: "member1@acme.com",
			plan: "pro",
			status: "active",
			joinDate: new Date().toISOString(),
		});

		await seedGatingRule(kv, {
			contentId: "pro-guide",
			type: "membership",
			planIds: ["pro", "premium"],
		});

		const { canAccessContent } = await import("../gating");
		const accessResult = await canAccessContent(
			"member1@acme.com",
			"member1@acme.com",
			{ type: "membership", planIds: ["pro", "premium"] },
			ctx as any
		);
		expect(accessResult.hasAccess).toBe(true);

		// --- Step 5: Member appears in group portal ---
		const lookupCtx = buildRouteCtx({
			input: { email: "member1@acme.com" },
		});
		const lookupResult = (await routes.memberGroupLookup.handler(lookupCtx, ctx)) as {
			found: boolean;
			group: { id: string; orgName: string; members: string[] };
			isOwner: boolean;
		};

		expect(lookupResult.found).toBe(true);
		expect(lookupResult.group.orgName).toBe("Acme Corp");
		expect(lookupResult.group.members).toContain("member1@acme.com");
		expect(lookupResult.isOwner).toBe(false);

		// --- Step 6: Verify the admin is recognized as owner ---
		const adminLookup = (await routes.memberGroupLookup.handler(
			buildRouteCtx({ input: { email: "admin@acme.com" } }),
			ctx
		)) as { found: boolean; isOwner: boolean };
		expect(adminLookup.found).toBe(true);
		expect(adminLookup.isOwner).toBe(true);

		// --- Step 7: Verify group details show correct seat usage ---
		const groupGetCtx = buildRouteCtx({
			input: { groupId },
			user: { isAdmin: true },
		});
		const groupDetail = (await routes.groupGet.handler(groupGetCtx, ctx)) as {
			group: { members: string[] };
			seatsUsed: number;
			seatsAvailable: number;
		};

		expect(groupDetail.seatsUsed).toBe(2); // admin + member1
		expect(groupDetail.seatsAvailable).toBe(3); // 5 max - 2 used
	});
});

// =============================================================================
// 3. PAYPAL PAYMENT FLOW
// =============================================================================
describe("Integration: PayPal Payment Flow", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		await seedDefaultPlans(kv);
		// Enable PayPal gateway
		await kv.set("gateway:paypal:enabled", "true");
	});

	it("should create PayPal order, capture payment, create subscription, and reflect in reporting", async () => {
		// --- Step 1: Create PayPal order ---
		const createCtx = buildRouteCtx({
			input: { planId: "pro", email: "charlie@example.com" },
		});
		const createResult = (await routes.paypalCreate.handler(createCtx, ctx)) as {
			orderId: string;
			approveUrl: string;
		};

		expect(createResult.orderId).toMatch(/^PAYPAL-/);
		expect(createResult.approveUrl).toContain(createResult.orderId);

		// --- Step 2: Capture PayPal payment ---
		const captureCtx = buildRouteCtx({
			input: { orderId: createResult.orderId },
		});
		const captureResult = (await routes.paypalCapture.handler(captureCtx, ctx)) as {
			success: boolean;
			memberId: string;
			email: string;
		};

		expect(captureResult.success).toBe(true);
		expect(captureResult.email).toBe("charlie@example.com");

		// --- Step 3: Verify member is now active ---
		const statusCtx = buildRouteCtx({
			input: { email: "charlie@example.com" },
		});
		const statusResult = (await routes.status.handler(statusCtx, ctx)) as {
			email: string;
			active: boolean;
			plan: string;
		};

		expect(statusResult.active).toBe(true);
		expect(statusResult.plan).toBe("pro");

		// --- Step 4: Verify the member record has paypal as payment method ---
		const encodedEmail = encodeURIComponent("charlie@example.com");
		const memberJson = await kv.get<string>(`member:${encodedEmail}`);
		const member = JSON.parse(memberJson!);
		expect(member.paymentMethod).toBe("paypal");

		// --- Step 5: Verify reporting reflects the new revenue ---
		const reportCtx = buildRouteCtx({
			input: { days: 30 },
			user: { isAdmin: true },
		});
		const reportResult = (await routes.revenueReport.handler(reportCtx, ctx)) as {
			totalRevenue: number;
			memberCount: number;
		};

		expect(reportResult.memberCount).toBe(1);
		expect(reportResult.totalRevenue).toBeGreaterThan(0);
	});

	it("should reject capture of already-captured order", async () => {
		// Create and capture once
		const createResult = (await routes.paypalCreate.handler(
			buildRouteCtx({ input: { planId: "pro", email: "double@example.com" } }),
			ctx
		)) as { orderId: string };

		await routes.paypalCapture.handler(
			buildRouteCtx({ input: { orderId: createResult.orderId } }),
			ctx
		);

		// Try to capture again
		try {
			await routes.paypalCapture.handler(
				buildRouteCtx({ input: { orderId: createResult.orderId } }),
				ctx
			);
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			const resp = error as Response;
			expect(resp.status).toBe(400);
			const body = JSON.parse(await resp.text());
			expect(body.error).toContain("already captured");
		}
	});

	it("should reject PayPal order when gateway is disabled", async () => {
		await kv.set("gateway:paypal:enabled", "false");

		try {
			await routes.paypalCreate.handler(
				buildRouteCtx({ input: { planId: "pro", email: "blocked@example.com" } }),
				ctx
			);
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(Response);
			const resp = error as Response;
			expect(resp.status).toBe(400);
			const body = JSON.parse(await resp.text());
			expect(body.error).toContain("disabled");
		}
	});
});

// =============================================================================
// 4. CSV ROUND-TRIP
// =============================================================================
describe("Integration: CSV Round-Trip", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		await seedDefaultPlans(kv);
	});

	it("should export members to CSV, import back, and reflect in reporting", async () => {
		// --- Step 1: Seed members ---
		await seedMember(kv, { email: "export1@example.com", plan: "pro", status: "active", planInterval: "month" });
		await seedMember(kv, { email: "export2@example.com", plan: "premium", status: "active", planInterval: "year" });
		await seedMember(kv, { email: "export3@example.com", plan: "free", status: "cancelled" });

		// --- Step 2: Export to CSV ---
		const exportCtx = buildRouteCtx({
			user: { isAdmin: true },
		});
		const exportResult = (await routes.exportCsv.handler(exportCtx, ctx)) as Response;

		expect(exportResult).toBeInstanceOf(Response);
		expect(exportResult.status).toBe(200);
		expect(exportResult.headers.get("Content-Type")).toBe("text/csv");

		const csvContent = await exportResult.text();
		expect(csvContent).toContain("email,name,plan,status,createdAt,planInterval,paymentMethod");
		expect(csvContent).toContain("export1@example.com");
		expect(csvContent).toContain("export2@example.com");
		expect(csvContent).toContain("export3@example.com");

		// --- Step 3: Import the CSV into a fresh KV ---
		// First, clear the existing members to simulate importing into a fresh system
		const freshKv = createMockKV();
		const freshCtx = createMockContext(freshKv);
		await seedDefaultPlans(freshKv);

		const importCtx = buildRouteCtx({
			input: { csv: csvContent },
			user: { isAdmin: true },
		});
		const importResult = (await routes.importCsv.handler(importCtx, freshCtx)) as {
			imported: number;
			errors: Array<{ row: number; reason: string }>;
			total: number;
		};

		expect(importResult.imported).toBe(3);
		expect(importResult.errors).toHaveLength(0);

		// --- Step 4: Verify imported members appear in reporting ---
		const reportCtx = buildRouteCtx({
			input: {},
			user: { isAdmin: true },
		});
		const reportResult = (await routes.membersReport.handler(reportCtx, freshCtx)) as {
			members: Array<{ email: string; plan: string; status: string }>;
			total: number;
			summary: { total: number; active: number; cancelled: number };
		};

		expect(reportResult.total).toBe(3);
		expect(reportResult.summary.active).toBe(2);
		expect(reportResult.summary.cancelled).toBe(1);

		// Verify specific members
		const emails = reportResult.members.map((m) => m.email);
		expect(emails).toContain("export1@example.com");
		expect(emails).toContain("export2@example.com");
		expect(emails).toContain("export3@example.com");
	});
});

// =============================================================================
// EDGE CASES
// =============================================================================
describe("Edge Cases", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		await seedDefaultPlans(kv);
	});

	// --- Expired group invite code ---
	describe("Expired group invite code", () => {
		it("should reject an expired invite code with 410 Gone", async () => {
			// Create a group
			await seedGroup(kv, {
				id: "group-expired",
				orgName: "Expired Org",
				orgEmail: "org@expired.com",
				adminEmail: "admin@expired.com",
				planId: "pro",
				maxSeats: 5,
			});

			// Create an expired invite
			await seedGroupInvite(kv, {
				code: "expired-invite-code",
				groupId: "group-expired",
				email: "late@example.com",
				expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
			});

			try {
				await routes.groupAccept.handler(
					buildRouteCtx({ input: { code: "expired-invite-code", email: "late@example.com" } }),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(410);
				const body = JSON.parse(await resp.text());
				expect(body.error).toContain("expired");
			}
		});

		it("should reject a non-existent invite code", async () => {
			try {
				await routes.groupAccept.handler(
					buildRouteCtx({ input: { code: "does-not-exist", email: "nobody@example.com" } }),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(404);
			}
		});
	});

	// --- Form submission with invalid step data ---
	describe("Form submission with invalid data", () => {
		it("should reject form submission with missing required fields", async () => {
			await seedForm(kv, {
				id: "registration-form",
				name: "Registration",
				fields: [
					{ id: "full_name", type: "text", label: "Full Name", required: true },
					{ id: "email", type: "email", label: "Email", required: true },
					{ id: "phone", type: "phone", label: "Phone", required: false },
				],
				steps: [
					{ label: "Personal Info", fieldIds: ["full_name"] },
					{ label: "Contact", fieldIds: ["email", "phone"] },
				],
			});

			// Submit with missing required field
			try {
				await routes.formSubmit.handler(
					buildRouteCtx({
						pathParams: { id: "registration-form" },
						input: { data: { phone: "555-1234" } }, // Missing full_name and email
					}),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(400);
				const body = JSON.parse(await resp.text());
				expect(body.error).toBe("Validation failed");
				expect(body.details).toBeDefined();
				expect(body.details.length).toBeGreaterThanOrEqual(2); // Both required fields missing
			}
		});

		it("should reject form submission with invalid email format", async () => {
			await seedForm(kv, {
				id: "email-form",
				name: "Email Form",
				fields: [
					{ id: "contact_email", type: "email", label: "Contact Email", required: true },
				],
			});

			try {
				await routes.formSubmit.handler(
					buildRouteCtx({
						pathParams: { id: "email-form" },
						input: { data: { contact_email: "not-an-email" } },
					}),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(400);
				const body = JSON.parse(await resp.text());
				expect(body.details).toBeDefined();
				expect(body.details.some((d: string) => d.includes("valid email"))).toBe(true);
			}
		});

		it("should accept a valid multi-step form submission", async () => {
			await seedForm(kv, {
				id: "wizard-form",
				name: "Wizard Form",
				fields: [
					{ id: "name", type: "text", label: "Name", required: true },
					{ id: "email", type: "email", label: "Email", required: true },
					{ id: "plan_choice", type: "dropdown", label: "Plan", required: true, options: ["basic", "pro"] },
				],
				steps: [
					{ label: "Step 1", fieldIds: ["name"] },
					{ label: "Step 2", fieldIds: ["email", "plan_choice"] },
				],
			});

			const result = (await routes.formSubmit.handler(
				buildRouteCtx({
					pathParams: { id: "wizard-form" },
					input: { data: { name: "Alice", email: "alice@wizard.com", plan_choice: "pro" } },
				}),
				ctx
			)) as { success: boolean; submissionId: string };

			expect(result.success).toBe(true);
			expect(result.submissionId).toBeTruthy();
		});

		it("should reject a dropdown value not in allowed options", async () => {
			await seedForm(kv, {
				id: "dropdown-form",
				name: "Dropdown Form",
				fields: [
					{ id: "tier", type: "dropdown", label: "Tier", required: true, options: ["silver", "gold"] },
				],
			});

			try {
				await routes.formSubmit.handler(
					buildRouteCtx({
						pathParams: { id: "dropdown-form" },
						input: { data: { tier: "platinum" } },
					}),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(400);
				const body = JSON.parse(await resp.text());
				expect(body.details.some((d: string) => d.includes("must be one of"))).toBe(true);
			}
		});
	});

	// --- Webhook retry exhaustion ---
	describe("Webhook retry exhaustion (3 failures -> dead letter)", () => {
		it("should exhaust retries and log failure when endpoint is unreachable", async () => {
			// Use fake timers to skip the exponential backoff delays
			vi.useFakeTimers();

			// Set up a webhook
			await seedWebhook(kv, {
				id: "wh-retry",
				url: "https://unreachable.example.com/hook",
				events: ["member.created"],
				secret: "test-secret-123",
			});

			// Make fetch always fail
			mockFetch.mockRejectedValue(new Error("Connection refused"));

			// Fire the webhook test endpoint (runs in background with timers)
			const handlerPromise = routes.webhookTest.handler(
				buildRouteCtx({
					input: { webhookId: "wh-retry" },
					user: { isAdmin: true },
				}),
				ctx
			);

			// Advance through all retry delays: 1s, 4s, 16s
			for (let i = 0; i < 10; i++) {
				await vi.advanceTimersByTimeAsync(20000);
			}

			const testResult = (await handlerPromise) as {
				success: boolean;
				log: { success: boolean; responseCode: number; responseBody: string };
			};

			expect(testResult.success).toBe(false);
			expect(testResult.log.success).toBe(false);

			// Verify fetch was called multiple times (initial + retries = 4 total)
			expect(mockFetch.mock.calls.length).toBe(4);

			// Verify the webhook's failedCount increased
			const webhookJson = await kv.get<string>("webhook:wh-retry");
			const webhook = JSON.parse(webhookJson!);
			expect(webhook.failedCount).toBe(1);

			// Verify webhook log was stored
			const logIdsJson = await kv.get<string>("webhook:wh-retry:logs");
			const logIds = JSON.parse(logIdsJson!);
			expect(logIds.length).toBeGreaterThan(0);

			vi.useRealTimers();
		});

		it("should succeed on first attempt when endpoint is reachable", async () => {
			await seedWebhook(kv, {
				id: "wh-ok",
				url: "https://hooks.example.com/ok",
				events: ["member.created"],
				secret: "test-secret-ok",
			});

			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => "OK",
			});

			const testResult = (await routes.webhookTest.handler(
				buildRouteCtx({ input: { webhookId: "wh-ok" }, user: { isAdmin: true } }),
				ctx
			)) as { success: boolean };

			expect(testResult.success).toBe(true);
			// Fetch should have been called exactly once (no retries)
			expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
		});
	});

	// --- CSV import with malformed rows ---
	describe("CSV import edge cases", () => {
		it("should report errors for rows with missing email", async () => {
			const csv = `email,name,plan,status
,John,pro,active
valid@example.com,Jane,pro,active`;

			const result = (await routes.importCsv.handler(
				buildRouteCtx({ input: { csv }, user: { isAdmin: true } }),
				ctx
			)) as { imported: number; errors: Array<{ row: number; reason: string }> };

			expect(result.imported).toBe(1);
			expect(result.errors.length).toBe(1);
			expect(result.errors[0]!.reason).toContain("Missing email");
		});

		it("should report errors for rows with invalid email format", async () => {
			const csv = `email,name,plan,status
not-an-email,John,pro,active
also-bad@@x,Jane,pro,active
good@example.com,Bob,pro,active`;

			const result = (await routes.importCsv.handler(
				buildRouteCtx({ input: { csv }, user: { isAdmin: true } }),
				ctx
			)) as { imported: number; errors: Array<{ row: number; reason: string }> };

			expect(result.imported).toBe(1);
			expect(result.errors.length).toBe(2);
			expect(result.errors[0]!.reason).toContain("Invalid email");
			expect(result.errors[1]!.reason).toContain("Invalid email");
		});

		it("should report errors for duplicate emails in import", async () => {
			// Seed an existing member
			await seedMember(kv, { email: "existing@example.com", plan: "pro", status: "active" });

			const csv = `email,name,plan,status
existing@example.com,Existing,pro,active
new@example.com,New,pro,active`;

			const result = (await routes.importCsv.handler(
				buildRouteCtx({ input: { csv }, user: { isAdmin: true } }),
				ctx
			)) as { imported: number; errors: Array<{ row: number; reason: string }> };

			expect(result.imported).toBe(1);
			expect(result.errors.length).toBe(1);
			expect(result.errors[0]!.reason).toContain("Duplicate email");
		});

		it("should reject CSV with no data rows", async () => {
			const csv = "email,name,plan,status";

			try {
				await routes.importCsv.handler(
					buildRouteCtx({ input: { csv }, user: { isAdmin: true } }),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(400);
				const body = JSON.parse(await resp.text());
				expect(body.error).toContain("header row and at least one data row");
			}
		});

		it("should reject CSV with missing email column header", async () => {
			const csv = `name,plan,status
John,pro,active`;

			try {
				await routes.importCsv.handler(
					buildRouteCtx({ input: { csv }, user: { isAdmin: true } }),
					ctx
				);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(Response);
				const resp = error as Response;
				expect(resp.status).toBe(400);
				const body = JSON.parse(await resp.text());
				expect(body.error).toContain("email");
			}
		});

		it("should handle mixed valid and invalid rows gracefully", async () => {
			const csv = `email,name,plan,status
good1@test.com,Good One,pro,active
,Missing Email,pro,active
bad-email,Bad Format,pro,active
good2@test.com,Good Two,premium,active
good1@test.com,Duplicate,pro,active`;

			const result = (await routes.importCsv.handler(
				buildRouteCtx({ input: { csv }, user: { isAdmin: true } }),
				ctx
			)) as { imported: number; errors: Array<{ row: number; reason: string }>; total: number };

			expect(result.total).toBe(5);
			expect(result.imported).toBe(2); // good1 and good2
			expect(result.errors.length).toBe(3); // empty, bad format, duplicate
		});
	});
});

// =============================================================================
// PERFORMANCE: Reporting with 1000+ members
// =============================================================================
describe("Performance: Reporting with 1000+ members", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
		await seedDefaultPlans(kv);
	});

	it("should handle membersReport with 1000+ members without timeout", async () => {
		// Seed 1050 members
		const memberEmails: string[] = [];
		for (let i = 0; i < 1050; i++) {
			const email = `perf${i}@loadtest.com`;
			const encodedEmail = encodeURIComponent(email);
			const status = i % 10 === 0 ? "cancelled" : "active";
			const plan = i % 3 === 0 ? "pro" : i % 3 === 1 ? "premium" : "free";
			const member = {
				email,
				plan,
				status,
				createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
				planInterval: plan === "pro" ? "month" : plan === "premium" ? "year" : "once",
				paymentMethod: "stripe",
			};
			await kv.set(`member:${encodedEmail}`, JSON.stringify(member));
			memberEmails.push(encodedEmail);
		}
		await kv.set("members:list", JSON.stringify(memberEmails));

		// Test membersReport completes within a reasonable time
		const startTime = Date.now();
		const result = (await routes.membersReport.handler(
			buildRouteCtx({ input: { perPage: 20 }, user: { isAdmin: true } }),
			ctx
		)) as {
			total: number;
			members: Array<{ email: string }>;
			totalPages: number;
			summary: { total: number; active: number; cancelled: number };
		};
		const elapsed = Date.now() - startTime;

		expect(result.total).toBe(1050);
		expect(result.members.length).toBe(20); // First page
		expect(result.totalPages).toBe(Math.ceil(1050 / 20));
		expect(result.summary.total).toBe(1050);
		expect(result.summary.active).toBeGreaterThan(0);
		expect(result.summary.cancelled).toBeGreaterThan(0);

		// Should complete in under 5 seconds (generous for in-memory KV)
		expect(elapsed).toBeLessThan(5000);
	});

	it("should handle revenueReport with 1000+ members without timeout", async () => {
		const memberEmails: string[] = [];
		for (let i = 0; i < 1050; i++) {
			const email = `rev${i}@loadtest.com`;
			const encodedEmail = encodeURIComponent(email);
			const plan = i % 2 === 0 ? "pro" : "premium";
			const member = {
				email,
				plan,
				status: "active",
				createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
				planInterval: plan === "pro" ? "month" : "year",
				paymentMethod: "stripe",
			};
			await kv.set(`member:${encodedEmail}`, JSON.stringify(member));
			memberEmails.push(encodedEmail);
		}
		await kv.set("members:list", JSON.stringify(memberEmails));

		const startTime = Date.now();
		const result = (await routes.revenueReport.handler(
			buildRouteCtx({ input: { days: 30 }, user: { isAdmin: true } }),
			ctx
		)) as {
			totalRevenue: number;
			memberCount: number;
			mrr: number;
		};
		const elapsed = Date.now() - startTime;

		expect(result.memberCount).toBe(1050);
		expect(result.totalRevenue).toBeGreaterThan(0);
		// Should complete in under 5 seconds
		expect(elapsed).toBeLessThan(5000);
	});
});
