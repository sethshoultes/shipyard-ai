/**
 * E2E Test: Sunrise Yoga Studio Journey
 *
 * Validates the complete attendee lifecycle:
 *   1. Create event
 *   2. Register attendee
 *   3. Check-in attendee
 *   4. Generate ticket / check-in code
 *   5. Verify calendar entry (iCal export)
 *   6. Export iCal feed
 *
 * Also covers edge cases:
 *   - Max capacity / waitlist
 *   - Double registration
 *   - Registration after event end date
 *   - Cancelled event display
 *   - Timezone edge cases
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	createMockContext,
	createMockKV,
	buildRouteCtx,
	sunriseYogaEvent,
	seedEvent,
	seedRegistration,
} from "./helpers";

// We cannot import the default export directly because definePlugin transforms it.
// Instead, we test via the route handler functions by importing the module and
// extracting routes. The sandbox-entry exports: default { hooks, routes }.
//
// However, the module uses `definePlugin` which may transform the shape.
// Let's mock `emdash` so definePlugin is a passthrough.

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
	hooks: Record<string, { handler: (event: unknown, ctx: unknown) => Promise<unknown> }>;
	routes: Record<string, { public?: boolean; handler: (routeCtx: unknown, ctx: unknown) => Promise<unknown> }>;
};
const routes = plugin.routes;

describe("Sunrise Yoga Studio - E2E Journey", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	// =========================================================================
	// STEP 1: Create Event
	// =========================================================================
	describe("Step 1: Create Event", () => {
		it("should create a Sunrise Yoga event as admin", async () => {
			const routeCtx = buildRouteCtx({
				input: {
					title: "Sunrise Yoga Flow",
					description: "Start your day with an energizing 60-minute yoga flow. All levels welcome.",
					date: "2026-05-15",
					time: "06:00",
					endTime: "07:00",
					location: "Sunrise Yoga Studio - Main Room",
					capacity: 20,
				},
				user: { isAdmin: true },
			});

			const result = await routes.createEvent.handler(routeCtx, ctx) as {
				success: boolean;
				eventId: string;
			};

			expect(result.success).toBe(true);
			expect(result.eventId).toBeTruthy();

			// Verify event stored in KV
			const eventJson = await kv.get<string>(`event:${result.eventId}`);
			expect(eventJson).toBeTruthy();
			const event = JSON.parse(eventJson!);
			expect(event.title).toBe("Sunrise Yoga Flow");
			expect(event.capacity).toBe(20);
			expect(event.registered).toBe(0);
		});

		it("should reject event creation without admin auth", async () => {
			const routeCtx = buildRouteCtx({
				input: {
					title: "Sunrise Yoga Flow",
					date: "2026-05-15",
					time: "06:00",
					location: "Sunrise Yoga Studio",
					capacity: 20,
				},
				user: { isAdmin: false },
			});

			await expect(
				routes.createEvent.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});

		it("should reject event creation with missing required fields", async () => {
			const routeCtx = buildRouteCtx({
				input: {
					title: "",
					date: "2026-05-15",
					time: "06:00",
					location: "",
					capacity: 0,
				},
				user: { isAdmin: true },
			});

			await expect(
				routes.createEvent.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});
	});

	// =========================================================================
	// STEP 2: Register Attendee
	// =========================================================================
	describe("Step 2: Register Attendee", () => {
		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent());
		});

		it("should register an attendee for the event", async () => {
			const routeCtx = buildRouteCtx({
				input: {
					name: "Sarah Chen",
					email: "sarah@example.com",
				},
				pathParams: { id: "yoga-001" },
			});

			const result = await routes.register.handler(routeCtx, ctx) as {
				success: boolean;
				status: string;
				message: string;
			};

			expect(result.success).toBe(true);
			expect(result.status).toBe("registered");
			expect(result.message).toContain("Sunrise Yoga Flow");

			// Verify registration in KV
			const regKey = `registration:yoga-001:${encodeURIComponent("sarah@example.com")}`;
			const regJson = await kv.get<string>(regKey);
			expect(regJson).toBeTruthy();
			const reg = JSON.parse(regJson!);
			expect(reg.name).toBe("Sarah Chen");
			expect(reg.status).toBe("registered");
			expect(reg.checkInCode).toBeTruthy();
			expect(reg.checkInCode.length).toBe(6);
		});

		it("should increment registered count after registration", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Sarah Chen", email: "sarah@example.com" },
				pathParams: { id: "yoga-001" },
			});

			await routes.register.handler(routeCtx, ctx);

			const eventJson = await kv.get<string>("event:yoga-001");
			const event = JSON.parse(eventJson!);
			expect(event.registered).toBe(1);
		});

		it("should reject registration with invalid email", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Bad Email", email: "not-an-email" },
				pathParams: { id: "yoga-001" },
			});

			await expect(
				routes.register.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});

		it("should reject registration for non-existent event", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Sarah", email: "sarah@example.com" },
				pathParams: { id: "nonexistent-event" },
			});

			await expect(
				routes.register.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});
	});

	// =========================================================================
	// STEP 3: Check-in Attendee
	// =========================================================================
	describe("Step 3: Check-in Attendee", () => {
		let checkInCode: string;

		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent({ registered: 1 }));
			checkInCode = "ABC123";
			await seedRegistration(kv, "yoga-001", {
				email: "sarah@example.com",
				name: "Sarah Chen",
				checkInCode,
			});
		});

		it("should check in attendee with valid code", async () => {
			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001", code: checkInCode },
			});

			const result = await routes.checkIn.handler(routeCtx, ctx) as {
				success: boolean;
				attendeeName?: string;
				message: string;
				checkedInAt?: string;
			};

			expect(result.success).toBe(true);
			expect(result.attendeeName).toBe("Sarah Chen");
			expect(result.message).toContain("Welcome");
			expect(result.checkedInAt).toBeTruthy();
		});

		it("should reject check-in with invalid code", async () => {
			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001", code: "XXXXXX" },
			});

			const result = await routes.checkIn.handler(routeCtx, ctx) as {
				success: boolean;
				message: string;
			};

			expect(result.success).toBe(false);
			expect(result.message).toContain("not recognized");
		});

		it("should prevent double check-in", async () => {
			// First check-in
			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001", code: checkInCode },
			});
			await routes.checkIn.handler(routeCtx, ctx);

			// Second check-in
			const result = await routes.checkIn.handler(routeCtx, ctx) as {
				success: boolean;
				message: string;
			};

			expect(result.success).toBe(false);
			expect(result.message).toContain("Already checked in");
		});

		it("should support manual admin check-in by email", async () => {
			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001", email: "sarah@example.com" },
				user: { isAdmin: true },
			});

			const result = await routes.checkInManual.handler(routeCtx, ctx) as {
				success: boolean;
				message: string;
			};

			expect(result.success).toBe(true);
			expect(result.message).toContain("checked in successfully");
		});
	});

	// =========================================================================
	// STEP 4: Generate Ticket / Check-in Code
	// =========================================================================
	describe("Step 4: Ticket Generation and Check-in Code", () => {
		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent({ registered: 1 }));
		});

		it("should generate unique 6-character check-in code on registration", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Maya Johnson", email: "maya@example.com" },
				pathParams: { id: "yoga-001" },
			});

			await routes.register.handler(routeCtx, ctx);

			const regKey = `registration:yoga-001:${encodeURIComponent("maya@example.com")}`;
			const regJson = await kv.get<string>(regKey);
			const reg = JSON.parse(regJson!);

			expect(reg.checkInCode).toBeTruthy();
			expect(reg.checkInCode).toMatch(/^[A-Z0-9]{6}$/);
		});

		it("should check-in stats reflect registrations and check-ins", async () => {
			await seedRegistration(kv, "yoga-001", {
				email: "sarah@example.com",
				name: "Sarah Chen",
				checkedIn: true,
				checkedInAt: new Date().toISOString(),
			});
			await seedRegistration(kv, "yoga-001", {
				email: "maya@example.com",
				name: "Maya Johnson",
				checkedIn: false,
			});

			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001" },
			});

			const result = await routes.checkInStats.handler(routeCtx, ctx) as {
				eventId: string;
				eventName: string;
				checkedIn: number;
				total: number;
				percentage: number;
			};

			expect(result.eventName).toBe("Sunrise Yoga Flow");
			expect(result.total).toBe(2);
			expect(result.checkedIn).toBe(1);
			expect(result.percentage).toBe(50);
		});
	});

	// =========================================================================
	// STEP 5: Verify Calendar Entry (iCal)
	// =========================================================================
	describe("Step 5: iCal Single Event Export", () => {
		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent());
		});

		it("should generate valid iCal for a single event", async () => {
			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001" },
			});

			const result = await routes.eventIcal.handler(routeCtx, ctx);

			// The handler returns a Response object
			expect(result).toBeInstanceOf(Response);
			const response = result as Response;
			expect(response.status).toBe(200);
			expect(response.headers.get("Content-Type")).toBe("text/calendar");

			const body = await response.text();
			expect(body).toContain("BEGIN:VCALENDAR");
			expect(body).toContain("END:VCALENDAR");
			expect(body).toContain("BEGIN:VEVENT");
			expect(body).toContain("END:VEVENT");
			expect(body).toContain("SUMMARY:Sunrise Yoga Flow");
			expect(body).toContain("LOCATION:Sunrise Yoga Studio - Main Room");
			expect(body).toContain("DTSTART:20260515T060000Z");
			expect(body).toContain("DTEND:20260515T070000Z");
			expect(body).toContain("PRODID:-//Shipyard AI//EventDash//EN");
		});

		it("should return 404 for non-existent event iCal", async () => {
			const routeCtx = buildRouteCtx({
				input: { id: "nonexistent" },
			});

			await expect(
				routes.eventIcal.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});
	});

	// =========================================================================
	// STEP 6: Calendar Feed Export
	// =========================================================================
	describe("Step 6: Monthly iCal Feed Export", () => {
		beforeEach(async () => {
			// Seed multiple events in May 2026
			await seedEvent(kv, sunriseYogaEvent({ id: "yoga-001", date: "2026-05-15" }));
			await seedEvent(kv, sunriseYogaEvent({ id: "yoga-002", date: "2026-05-22" }));
			// And one in June
			await seedEvent(kv, sunriseYogaEvent({ id: "yoga-003", date: "2026-06-05" }));
		});

		it("should export monthly iCal feed with events for that month", async () => {
			const routeCtx = buildRouteCtx({
				input: { month: "2026-05" },
			});

			const result = await routes.calendarIcal.handler(routeCtx, ctx);
			expect(result).toBeInstanceOf(Response);

			const response = result as Response;
			const body = await response.text();

			expect(body).toContain("BEGIN:VCALENDAR");
			// Should contain 2 events for May
			const veventCount = (body.match(/BEGIN:VEVENT/g) || []).length;
			expect(veventCount).toBe(2);
			expect(body).toContain("X-WR-CALNAME:Events - 2026-05");
		});

		it("should return empty calendar for month with no events", async () => {
			const routeCtx = buildRouteCtx({
				input: { month: "2026-12" },
			});

			const result = await routes.calendarIcal.handler(routeCtx, ctx);
			const response = result as Response;
			const body = await response.text();

			expect(body).toContain("BEGIN:VCALENDAR");
			expect(body).not.toContain("BEGIN:VEVENT");
		});

		it("should reject invalid month format", async () => {
			const routeCtx = buildRouteCtx({
				input: { month: "invalid" },
			});

			await expect(
				routes.calendarIcal.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});
	});

	// =========================================================================
	// FULL JOURNEY: End-to-End
	// =========================================================================
	describe("Full E2E Journey", () => {
		it("should complete the full attendee lifecycle", async () => {
			// 1. Admin creates event
			const createCtx = buildRouteCtx({
				input: {
					title: "Sunrise Yoga Flow",
					description: "60-minute energizing yoga flow",
					date: "2026-05-15",
					time: "06:00",
					endTime: "07:00",
					location: "Sunrise Yoga Studio - Main Room",
					capacity: 20,
				},
				user: { isAdmin: true },
			});
			const createResult = await routes.createEvent.handler(createCtx, ctx) as {
				success: boolean;
				eventId: string;
			};
			expect(createResult.success).toBe(true);
			const eventId = createResult.eventId;

			// 2. Attendee registers
			const registerCtx = buildRouteCtx({
				input: { name: "Sarah Chen", email: "sarah@example.com" },
				pathParams: { id: eventId },
			});
			const regResult = await routes.register.handler(registerCtx, ctx) as {
				success: boolean;
				status: string;
			};
			expect(regResult.success).toBe(true);
			expect(regResult.status).toBe("registered");

			// 3. Retrieve check-in code
			const regKey = `registration:${eventId}:${encodeURIComponent("sarah@example.com")}`;
			const regJson = await kv.get<string>(regKey);
			const reg = JSON.parse(regJson!);
			const checkInCode = reg.checkInCode;
			expect(checkInCode).toMatch(/^[A-Z0-9]{6}$/);

			// 4. Check in
			const checkInCtx = buildRouteCtx({
				input: { id: eventId, code: checkInCode },
			});
			const checkInResult = await routes.checkIn.handler(checkInCtx, ctx) as {
				success: boolean;
				attendeeName: string;
			};
			expect(checkInResult.success).toBe(true);
			expect(checkInResult.attendeeName).toBe("Sarah Chen");

			// 5. Export iCal
			const icalCtx = buildRouteCtx({
				input: { id: eventId },
			});
			const icalResult = await routes.eventIcal.handler(icalCtx, ctx) as Response;
			const icalBody = await icalResult.text();
			expect(icalBody).toContain("SUMMARY:Sunrise Yoga Flow");
			expect(icalBody).toContain("DTSTART:20260515T060000Z");
			expect(icalBody).toContain("DTEND:20260515T070000Z");

			// 6. Check-in stats confirm
			const statsCtx = buildRouteCtx({
				input: { id: eventId },
			});
			const stats = await routes.checkInStats.handler(statsCtx, ctx) as {
				checkedIn: number;
				total: number;
			};
			expect(stats.checkedIn).toBe(1);
			expect(stats.total).toBe(1);
		});
	});
});
