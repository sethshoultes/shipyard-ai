import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import { z } from "astro/zod";

/**
 * Event data structure
 */
interface Event {
	id: string;
	title: string;
	description: string;
	date: string; // ISO date YYYY-MM-DD
	time: string; // HH:mm format
	location: string;
	capacity: number;
	registered: number;
	price: number; // 0 for free
	recurring?: string; // "daily" | "weekly" | "monthly" | undefined for one-time
	recurringId?: string; // ID for grouping recurring events
	createdAt: string;
	updatedAt: string;
}

/**
 * Registration data structure
 */
interface Registration {
	id: string;
	eventId: string;
	name: string;
	email: string;
	ticketCount: number;
	paid: boolean;
	createdAt: string;
}

/**
 * iCal event data
 */
interface ICalEvent {
	uid: string;
	summary: string;
	description: string;
	location: string;
	dtstart: string;
	dtend: string;
	dtstamp: string;
	created: string;
	modified: string;
}

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: any, ctx: PluginContext) => {
				ctx.log.info("EventDash plugin installed");
				// Set default settings
				await ctx.kv.set("settings:defaultCapacity", 100);
				await ctx.kv.set("settings:requirePayment", false);
				await ctx.kv.set("settings:notificationEmail", "");
			},
		},
	},

	routes: {
		// Get all upcoming events
		"events": {
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const url = new URL(routeCtx.request.url);
				const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 100);
				const cursor = url.searchParams.get("cursor") || undefined;

				const result = await ctx.storage.events!.query({
					orderBy: { date: "asc" },
					limit,
					cursor,
				});

				return {
					items: result.items.map((item: any) => ({
						id: item.id,
						...item.data,
					})),
					cursor: result.cursor,
					hasMore: result.hasMore,
				};
			},
		},

		// Get single event with registration count
		"events/:id": {
			input: z.object({
				id: z.string(),
			}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { id } = routeCtx.input;
				const event = await ctx.storage.events!.get(id);

				if (!event) {
					throw new Response(JSON.stringify({ error: "Event not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
				}

				const registrationCount = await ctx.storage.registrations!.count({
					eventId: id,
				});

				return {
					id,
					...event,
					registered: registrationCount,
				};
			},
		},

		// Register for an event
		"events/:id/register": {
			input: z.object({
				id: z.string(),
				name: z.string().min(1).max(200),
				email: z.string().email(),
				ticketCount: z.number().int().min(1).default(1),
				paid: z.boolean().default(false),
			}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { id, name, email, ticketCount, paid } = routeCtx.input;

				// Verify event exists
				const event = (await ctx.storage.events!.get(id)) as Event | null;
				if (!event) {
					throw new Response(JSON.stringify({ error: "Event not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
				}

				// Check capacity
				const registrationCount = await ctx.storage.registrations!.count({
					eventId: id,
				});

				if (registrationCount + ticketCount > event.capacity) {
					throw new Response(
						JSON.stringify({
							error: "Not enough tickets available",
							available: event.capacity - registrationCount,
						}),
						{
							status: 400,
							headers: { "Content-Type": "application/json" },
						}
					);
				}

				// Create registration
				const registrationId = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
				const registration: Registration = {
					id: registrationId,
					eventId: id,
					name,
					email,
					ticketCount,
					paid,
					createdAt: new Date().toISOString(),
				};

				await ctx.storage.registrations!.put(registrationId, registration);

				// Log registration
				ctx.log.info(`New registration for event ${id}`, { email, ticketCount });

				return {
					success: true,
					registrationId,
					registration,
				};
			},
		},

		// Cancel registration
		"events/:id/cancel": {
			input: z.object({
				id: z.string(),
				registrationId: z.string(),
			}),
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const { registrationId } = routeCtx.input;

				const registration = (await ctx.storage.registrations!.get(registrationId)) as Registration | null;
				if (!registration) {
					throw new Response(JSON.stringify({ error: "Registration not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
				}

				await ctx.storage.registrations!.delete(registrationId);

				ctx.log.info(`Registration cancelled: ${registrationId}`);

				return { success: true, deleted: registrationId };
			},
		},

		// Export events as iCal feed
		"events/ical": {
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const result = await ctx.storage.events!.query({
					orderBy: { date: "asc" },
					limit: 500,
				});

				// Build iCal events
				const icalEvents: ICalEvent[] = result.items.map((item: any) => {
					const event = item.data as Event;
					const [year, month, day] = event.date.split("-");
					const [hour, minute] = event.time.split(":");

					// Format: YYYYMMDDTHHMMSS
					const dtstart = `${year}${month}${day}T${hour}${minute}00`;
					const dtend = `${year}${month}${day}T${String(parseInt(hour) + 1).padStart(2, "0")}${minute}00`;
					const dtstamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");

					return {
						uid: `${item.id}@eventdash`,
						summary: event.title,
						description: event.description,
						location: event.location,
						dtstart,
						dtend,
						dtstamp,
						created: event.createdAt.replace(/[-:]/g, "").replace(/\.\d+/, ""),
						modified: event.updatedAt.replace(/[-:]/g, "").replace(/\.\d+/, ""),
					};
				});

				// Build iCal file
				const now = new Date();
				const prodId = "-//EventDash//EmDash Events//EN";
				const calId = `events-${now.getTime()}@eventdash`;

				let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:${prodId}
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Events
X-WR-TIMEZONE:UTC
DTSTAMP:${now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}Z
`;

				for (const event of icalEvents) {
					ical += `BEGIN:VEVENT
UID:${event.uid}
DTSTAMP:${event.dtstamp}Z
DTSTART:${event.dtstart}Z
DTEND:${event.dtend}Z
SUMMARY:${escapeICalString(event.summary)}
DESCRIPTION:${escapeICalString(event.description)}
LOCATION:${escapeICalString(event.location)}
CREATED:${event.created}Z
LAST-MODIFIED:${event.modified}Z
END:VEVENT
`;
				}

				ical += `END:VCALENDAR`;

				// Return as iCal MIME type
				return new Response(ical, {
					headers: {
						"Content-Type": "text/calendar; charset=utf-8",
						"Content-Disposition": 'attachment; filename="events.ics"',
					},
				});
			},
		},
	},
});

/**
 * Escape special characters in iCal strings
 */
function escapeICalString(str: string): string {
	return str
		.replace(/\\/g, "\\\\")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;")
		.replace(/\n/g, "\\n");
}
