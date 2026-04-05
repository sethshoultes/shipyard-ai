/**
 * Edge Case Tests for EventDash
 *
 * Covers:
 *   - Event at max capacity (waitlist behavior)
 *   - Double registration (idempotency)
 *   - Registration after event end date
 *   - Cancelled event / cancelled registration display
 *   - Timezone edge cases
 *   - Cancellation + waitlist promotion
 *   - Input validation extremes
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

vi.mock("emdash", () => ({
	definePlugin: (def: unknown) => def,
}));

const mockFetch = vi.fn().mockResolvedValue({
	ok: true,
	text: async () => "{}",
	json: async () => ({}),
});
global.fetch = mockFetch as unknown as typeof fetch;

const pluginModule = await import("../sandbox-entry");
const plugin = (pluginModule.default as unknown) as {
	routes: Record<string, { handler: (routeCtx: unknown, ctx: unknown) => Promise<unknown> }>;
};
const routes = plugin.routes;

describe("Edge Cases", () => {
	let ctx: ReturnType<typeof createMockContext>;
	let kv: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
		mockFetch.mockClear();
		vi.clearAllMocks();
	});

	// =========================================================================
	// MAX CAPACITY / WAITLIST
	// =========================================================================
	describe("Event at Max Capacity", () => {
		beforeEach(async () => {
			// Create event with capacity 2, already 2 registered
			await seedEvent(kv, sunriseYogaEvent({ capacity: 2, registered: 2 }));
			await seedRegistration(kv, "yoga-001", {
				email: "person1@example.com",
				name: "Person One",
			});
			await seedRegistration(kv, "yoga-001", {
				email: "person2@example.com",
				name: "Person Two",
			});
		});

		it("should add to waitlist when event is full", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Waitlisted Person", email: "wait@example.com" },
				pathParams: { id: "yoga-001" },
			});

			const result = await routes.register.handler(routeCtx, ctx) as {
				success: boolean;
				status: string;
				message: string;
			};

			expect(result.success).toBe(true);
			expect(result.status).toBe("waitlisted");
			expect(result.message).toContain("#1");
		});

		it("should assign correct waitlist positions", async () => {
			// First waitlister
			await routes.register.handler(
				buildRouteCtx({
					input: { name: "Wait One", email: "wait1@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			);

			// Second waitlister
			const result = await routes.register.handler(
				buildRouteCtx({
					input: { name: "Wait Two", email: "wait2@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			) as { message: string };

			expect(result.message).toContain("#2");
		});

		it("should promote from waitlist when registration is cancelled", async () => {
			// Add someone to waitlist first
			await routes.register.handler(
				buildRouteCtx({
					input: { name: "Waitlisted", email: "waitlisted@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			);

			// Cancel one of the registered people
			const cancelCtx = buildRouteCtx({
				input: { email: "person1@example.com" },
				pathParams: { id: "yoga-001" },
			});

			const cancelResult = await routes.cancel.handler(cancelCtx, ctx) as {
				success: boolean;
				message: string;
			};

			expect(cancelResult.success).toBe(true);

			// The waitlisted person should now have a registration
			const regKey = `registration:yoga-001:${encodeURIComponent("waitlisted@example.com")}`;
			const regJson = await kv.get<string>(regKey);
			expect(regJson).toBeTruthy();
			const reg = JSON.parse(regJson!);
			expect(reg.status).toBe("registered");
		});
	});

	// =========================================================================
	// DOUBLE REGISTRATION
	// =========================================================================
	describe("Double Registration", () => {
		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent());
		});

		it("should return success but not duplicate when registering twice", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Sarah Chen", email: "sarah@example.com" },
				pathParams: { id: "yoga-001" },
			});

			// First registration
			const first = await routes.register.handler(routeCtx, ctx) as {
				success: boolean;
				status: string;
			};
			expect(first.success).toBe(true);
			expect(first.status).toBe("registered");

			// Second registration (duplicate)
			const second = await routes.register.handler(routeCtx, ctx) as {
				success: boolean;
				status: string;
				message: string;
			};
			expect(second.success).toBe(true);
			expect(second.message).toContain("Already registered");

			// Registered count should be 1, not 2
			const eventJson = await kv.get<string>("event:yoga-001");
			const event = JSON.parse(eventJson!);
			expect(event.registered).toBe(1);
		});

		it("should allow re-registration after cancellation", async () => {
			// Register
			await routes.register.handler(
				buildRouteCtx({
					input: { name: "Sarah Chen", email: "sarah@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			);

			// Cancel
			await routes.cancel.handler(
				buildRouteCtx({
					input: { email: "sarah@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			);

			// Re-register
			const result = await routes.register.handler(
				buildRouteCtx({
					input: { name: "Sarah Chen", email: "sarah@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			) as { success: boolean; status: string };

			expect(result.success).toBe(true);
			expect(result.status).toBe("registered");
		});
	});

	// =========================================================================
	// REGISTRATION AFTER EVENT END DATE
	// =========================================================================
	describe("Registration After Event End Date", () => {
		it("should still allow registration for past events (server does not reject)", async () => {
			// Note: The current implementation does not reject registrations for past events.
			// This is intentional -- the event listing filters by upcoming, but the API itself
			// does not enforce date restrictions on the register endpoint.
			// This test documents the current behavior.
			await seedEvent(kv, sunriseYogaEvent({
				date: "2024-01-01",
				time: "06:00",
			}));

			const routeCtx = buildRouteCtx({
				input: { name: "Late Person", email: "late@example.com" },
				pathParams: { id: "yoga-001" },
			});

			// Should succeed since the API does not check event date
			const result = await routes.register.handler(routeCtx, ctx) as {
				success: boolean;
				status: string;
			};
			expect(result.success).toBe(true);
		});
	});

	// =========================================================================
	// CANCELLED REGISTRATION
	// =========================================================================
	describe("Cancelled Event / Registration", () => {
		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent({ registered: 1 }));
			await seedRegistration(kv, "yoga-001", {
				email: "sarah@example.com",
				name: "Sarah Chen",
			});
		});

		it("should cancel a registration successfully", async () => {
			const routeCtx = buildRouteCtx({
				input: { email: "sarah@example.com" },
				pathParams: { id: "yoga-001" },
			});

			const result = await routes.cancel.handler(routeCtx, ctx) as {
				success: boolean;
				message: string;
			};

			expect(result.success).toBe(true);
			expect(result.message).toContain("cancelled");

			// Verify registration status is cancelled
			const regKey = `registration:yoga-001:${encodeURIComponent("sarah@example.com")}`;
			const regJson = await kv.get<string>(regKey);
			const reg = JSON.parse(regJson!);
			expect(reg.status).toBe("cancelled");

			// Verify count decremented
			const eventJson = await kv.get<string>("event:yoga-001");
			const event = JSON.parse(eventJson!);
			expect(event.registered).toBe(0);
		});

		it("should return 404 when cancelling non-existent registration", async () => {
			const routeCtx = buildRouteCtx({
				input: { email: "nobody@example.com" },
				pathParams: { id: "yoga-001" },
			});

			await expect(
				routes.cancel.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});

		it("should cancel waitlist entry and renumber positions", async () => {
			// Fill event and add waitlisters
			await seedEvent(kv, sunriseYogaEvent({ capacity: 1, registered: 1 }));

			// Add two to waitlist manually
			const waitlist = [
				{ email: "wait1@example.com", name: "Wait One", createdAt: new Date().toISOString(), position: 1 },
				{ email: "wait2@example.com", name: "Wait Two", createdAt: new Date().toISOString(), position: 2 },
			];
			await kv.set(`waitlist:yoga-001`, JSON.stringify(waitlist));

			// Cancel first waitlister
			const routeCtx = buildRouteCtx({
				input: { email: "wait1@example.com" },
				pathParams: { id: "yoga-001" },
			});

			const result = await routes.cancel.handler(routeCtx, ctx) as {
				success: boolean;
				message: string;
			};

			expect(result.success).toBe(true);
			expect(result.message).toContain("Waitlist entry cancelled");

			// Verify remaining waitlister is renumbered to position 1
			const waitlistJson = await kv.get<string>("waitlist:yoga-001");
			const updatedWaitlist = JSON.parse(waitlistJson!);
			expect(updatedWaitlist.length).toBe(1);
			expect(updatedWaitlist[0].email).toBe("wait2@example.com");
			expect(updatedWaitlist[0].position).toBe(1);
		});
	});

	// =========================================================================
	// TIMEZONE EDGE CASES
	// =========================================================================
	describe("Timezone Edge Cases", () => {
		it("should handle midnight UTC events correctly in iCal", async () => {
			await seedEvent(kv, sunriseYogaEvent({
				date: "2026-12-31",
				time: "00:00",
				endTime: "01:00",
			}));

			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001" },
			});

			const result = await routes.eventIcal.handler(routeCtx, ctx) as Response;
			const body = await result.text();

			expect(body).toContain("DTSTART:20261231T000000Z");
			expect(body).toContain("DTEND:20261231T010000Z");
		});

		it("should handle events near day boundary (23:00-00:00)", async () => {
			await seedEvent(kv, sunriseYogaEvent({
				date: "2026-06-15",
				time: "23:00",
				endTime: "23:59",
			}));

			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001" },
			});

			const result = await routes.eventIcal.handler(routeCtx, ctx) as Response;
			const body = await result.text();

			expect(body).toContain("DTSTART:20260615T230000Z");
			expect(body).toContain("DTEND:20260615T235900Z");
		});

		it("should handle February 29 (leap year) event", async () => {
			await seedEvent(kv, sunriseYogaEvent({
				date: "2028-02-29",
				time: "10:00",
				endTime: "11:00",
			}));

			const routeCtx = buildRouteCtx({
				input: { id: "yoga-001" },
			});

			const result = await routes.eventIcal.handler(routeCtx, ctx) as Response;
			const body = await result.text();

			expect(body).toContain("DTSTART:20280229T100000Z");
		});

		it("should filter events correctly by month for calendar feed", async () => {
			// Events spanning month boundaries
			await seedEvent(kv, sunriseYogaEvent({ id: "jan-31", date: "2026-01-31" }));
			await seedEvent(kv, sunriseYogaEvent({ id: "feb-01", date: "2026-02-01" }));

			const janCtx = buildRouteCtx({ input: { month: "2026-01" } });
			const janResult = await routes.calendarIcal.handler(janCtx, ctx) as Response;
			const janBody = await janResult.text();
			expect((janBody.match(/BEGIN:VEVENT/g) || []).length).toBe(1);

			const febCtx = buildRouteCtx({ input: { month: "2026-02" } });
			const febResult = await routes.calendarIcal.handler(febCtx, ctx) as Response;
			const febBody = await febResult.text();
			expect((febBody.match(/BEGIN:VEVENT/g) || []).length).toBe(1);
		});
	});

	// =========================================================================
	// INPUT VALIDATION EXTREMES
	// =========================================================================
	describe("Input Validation", () => {
		beforeEach(async () => {
			await seedEvent(kv, sunriseYogaEvent());
		});

		it("should reject registration with empty name", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "", email: "valid@example.com" },
				pathParams: { id: "yoga-001" },
			});

			await expect(
				routes.register.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});

		it("should reject registration with empty event ID", async () => {
			const routeCtx = buildRouteCtx({
				input: { name: "Sarah", email: "sarah@example.com" },
				pathParams: { id: "" },
			});

			await expect(
				routes.register.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});

		it("should handle case-insensitive email matching", async () => {
			// Register with uppercase email
			await routes.register.handler(
				buildRouteCtx({
					input: { name: "Sarah", email: "Sarah@Example.COM" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			);

			// Try to register again with lowercase - should detect duplicate
			const result = await routes.register.handler(
				buildRouteCtx({
					input: { name: "Sarah", email: "sarah@example.com" },
					pathParams: { id: "yoga-001" },
				}),
				ctx
			) as { message: string };

			expect(result.message).toContain("Already registered");
		});

		it("should handle very long event titles within limit", async () => {
			const longTitle = "A".repeat(200); // At the max limit
			const routeCtx = buildRouteCtx({
				input: {
					title: longTitle,
					date: "2026-06-01",
					time: "10:00",
					location: "Somewhere",
					capacity: 10,
				},
				user: { isAdmin: true },
			});

			const result = await routes.createEvent.handler(routeCtx, ctx) as {
				success: boolean;
			};
			expect(result.success).toBe(true);
		});

		it("should reject event title exceeding max length", async () => {
			const tooLong = "A".repeat(201);
			const routeCtx = buildRouteCtx({
				input: {
					title: tooLong,
					date: "2026-06-01",
					time: "10:00",
					location: "Somewhere",
					capacity: 10,
				},
				user: { isAdmin: true },
			});

			await expect(
				routes.createEvent.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});
	});

	// =========================================================================
	// EVENTS LISTING
	// =========================================================================
	describe("Events Listing", () => {
		it("should list events sorted by date", async () => {
			await seedEvent(kv, sunriseYogaEvent({ id: "later", date: "2099-12-01", time: "10:00" }));
			await seedEvent(kv, sunriseYogaEvent({ id: "earlier", date: "2099-06-01", time: "08:00" }));

			const routeCtx = buildRouteCtx({
				input: { limit: "10", upcomingOnly: "false" },
			});

			const result = await routes.events.handler(routeCtx, ctx) as {
				events: Array<{ id: string }>;
				total: number;
			};

			expect(result.events.length).toBe(2);
			expect(result.events[0].id).toBe("earlier");
			expect(result.events[1].id).toBe("later");
		});

		it("should filter to upcoming events only by default", async () => {
			await seedEvent(kv, sunriseYogaEvent({ id: "past", date: "2020-01-01" }));
			await seedEvent(kv, sunriseYogaEvent({ id: "future", date: "2099-12-01" }));

			const routeCtx = buildRouteCtx({
				input: { upcomingOnly: "true" },
			});

			const result = await routes.events.handler(routeCtx, ctx) as {
				events: Array<{ id: string }>;
			};

			expect(result.events.length).toBe(1);
			expect(result.events[0].id).toBe("future");
		});

		it("should respect limit parameter", async () => {
			for (let i = 0; i < 5; i++) {
				await seedEvent(kv, sunriseYogaEvent({ id: `e-${i}`, date: `2099-0${i + 1}-01` }));
			}

			const routeCtx = buildRouteCtx({
				input: { limit: "2", upcomingOnly: "false" },
			});

			const result = await routes.events.handler(routeCtx, ctx) as {
				events: unknown[];
				total: number;
			};

			expect(result.events.length).toBe(2);
			expect(result.total).toBe(5);
		});
	});

	// =========================================================================
	// EVENT DETAIL
	// =========================================================================
	describe("Event Detail", () => {
		it("should return event with spots remaining and waitlist count", async () => {
			await seedEvent(kv, sunriseYogaEvent({ capacity: 20, registered: 15 }));

			// Add 3 to waitlist
			const waitlist = [
				{ email: "w1@example.com", name: "W1", createdAt: new Date().toISOString(), position: 1 },
				{ email: "w2@example.com", name: "W2", createdAt: new Date().toISOString(), position: 2 },
				{ email: "w3@example.com", name: "W3", createdAt: new Date().toISOString(), position: 3 },
			];
			await kv.set("waitlist:yoga-001", JSON.stringify(waitlist));

			const routeCtx = buildRouteCtx({
				pathParams: { id: "yoga-001" },
			});

			const result = await routes.eventDetail.handler(routeCtx, ctx) as {
				event: { title: string };
				spotsRemaining: number;
				waitlistCount: number;
			};

			expect(result.event.title).toBe("Sunrise Yoga Flow");
			expect(result.spotsRemaining).toBe(5);
			expect(result.waitlistCount).toBe(3);
		});

		it("should return 0 spots remaining when full", async () => {
			await seedEvent(kv, sunriseYogaEvent({ capacity: 5, registered: 5 }));

			const routeCtx = buildRouteCtx({
				pathParams: { id: "yoga-001" },
			});

			const result = await routes.eventDetail.handler(routeCtx, ctx) as {
				spotsRemaining: number;
			};

			expect(result.spotsRemaining).toBe(0);
		});

		it("should return 404 for non-existent event", async () => {
			const routeCtx = buildRouteCtx({
				pathParams: { id: "nonexistent" },
			});

			await expect(
				routes.eventDetail.handler(routeCtx, ctx)
			).rejects.toBeInstanceOf(Response);
		});
	});
});
