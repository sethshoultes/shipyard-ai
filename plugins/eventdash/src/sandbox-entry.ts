import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";

/**
 * Type definitions
 */

interface TicketType {
	id: string; // Unique within event
	name: string; // "Early Bird", "VIP", "General"
	stripePriceId: string; // Stripe price ID
	price: number; // In cents
	capacity: number; // Seats available
	sold: number; // Seats sold
	description?: string;
	availableUntil?: string; // ISO date for early bird cutoff
}

interface EventRecord {
	id: string;
	title: string;
	description?: string;
	date: string; // ISO date string
	time: string; // HH:MM format
	endTime?: string; // HH:MM format
	location: string;
	capacity: number;
	registered: number;
	templateId?: string; // If this is an instance from a template
	createdAt: string;
	// NEW: Stripe fields for paid events
	requiresPayment?: boolean; // true = paid event (default false)
	stripeProductId?: string; // Stripe product ID
	ticketTypes?: TicketType[]; // Array of ticket variants (early bird, VIP, general, etc.)
	totalRevenue?: number; // Cumulative revenue in cents from successful payments
}

interface RegistrationRecord {
	email: string;
	name: string;
	status: "registered" | "cancelled";
	ticketCount: number;
	createdAt: string;
	// NEW: Stripe payment fields
	stripePaymentIntentId?: string; // Payment intent ID
	ticketType?: string; // Which ticket type purchased
	amountPaid?: number; // What they actually paid in cents
	paymentStatus?: "pending" | "paid" | "refunded"; // Payment status (default: "paid" for backwards compatibility)
}

interface WaitlistRecord {
	email: string;
	name: string;
	createdAt: string;
	position: number;
}

interface EventTemplateRecord {
	id: string;
	title: string;
	description?: string;
	time: string; // HH:MM format
	endTime?: string;
	location: string;
	capacity: number;
	dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
	createdAt: string;
}

interface AdminInteraction {
	type: string;
	page?: string;
	widgetId?: string;
	action?: string;
	eventId?: string;
	title?: string;
	date?: string;
	time?: string;
	endTime?: string;
	location?: string;
	capacity?: number | string;
	description?: string;
}

/**
 * Utility: Validate email format
 */
function isValidEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

/**
 * Utility: Generate unique IDs
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Utility: Parse JSON safely
 */
function parseJSON<T>(json: string | undefined | null, fallback: T): T {
	if (!json) return fallback;
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
}

/**
 * Utility: Encode email for safe KV key usage
 * Normalizes email for KV storage (lowercase + trim), then encodes special characters.
 */
function emailToKvKey(email: string): string {
	return encodeURIComponent(email.toLowerCase().trim());
}

/**
 * Utility: Validate string length
 */
function validateStringLength(value: string, maxLength: number, fieldName: string): string {
	if (value.length > maxLength) {
		throw new Response(
			JSON.stringify({ error: `${fieldName} must be ${maxLength} characters or less` }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
	return value;
}

/**
 * Utility: Parse ISO date and time into a comparable timestamp
 */
function dateTimeToTimestamp(date: string, time: string): number {
	try {
		const [hours, minutes] = time.split(":").map(Number);
		const dt = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`);
		return dt.getTime();
	} catch {
		return 0;
	}
}

/**
 * Utility: Get all events and sort by date/time
 */
async function getAllEventsWithDates(ctx: PluginContext): Promise<EventRecord[]> {
	const listJson = await ctx.kv.get<string>("events:list");
	const eventIds = parseJSON<string[]>(listJson, []);

	const events: EventRecord[] = [];
	for (const id of eventIds) {
		const eventJson = await ctx.kv.get<string>(`event:${id}`);
		if (eventJson) {
			const event = parseJSON<EventRecord>(eventJson, null);
			if (event) {
				events.push(event);
			}
		}
	}

	// Sort by date and time
	events.sort((a, b) => {
		const aTimestamp = dateTimeToTimestamp(a.date, a.time);
		const bTimestamp = dateTimeToTimestamp(b.date, b.time);
		return aTimestamp - bTimestamp;
	});

	return events;
}

/**
 * Utility: Get waitlist for an event, sorted by position
 */
async function getWaitlist(ctx: PluginContext, eventId: string): Promise<WaitlistRecord[]> {
	const waitlistKey = `waitlist:${eventId}`;
	const waitlistJson = await ctx.kv.get<string>(waitlistKey);
	const waitlist = parseJSON<WaitlistRecord[]>(waitlistJson, []);

	// Sort by position
	waitlist.sort((a, b) => a.position - b.position);
	return waitlist;
}

/**
 * Utility: Get first person on waitlist and remove them
 */
async function promoteFromWaitlist(
	ctx: PluginContext,
	eventId: string
): Promise<WaitlistRecord | null> {
	const waitlist = await getWaitlist(ctx, eventId);

	if (waitlist.length === 0) return null;

	const promoted = waitlist[0];
	const remaining = waitlist.slice(1);

	// Renumber positions
	const updated = remaining.map((w, index) => ({ ...w, position: index + 1 }));

	if (updated.length > 0) {
		await ctx.kv.set(`waitlist:${eventId}`, JSON.stringify(updated));
	} else {
		await ctx.kv.delete(`waitlist:${eventId}`);
	}

	return promoted;
}

/**
 * Hook: Initialize plugin on install
 */
function initializePlugin(ctx: PluginContext): void {
	ctx.log.info("EventDash plugin installed");
	// No default data needed — events are created by admin
}

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				initializePlugin(ctx);
			},
		},
	},

	routes: {
		/**
		 * GET /eventdash/events
		 * List all upcoming events sorted by date.
		 *
		 * Query params:
		 *   - limit: max number of events (default 20)
		 *   - upcomingOnly: if "true", filter to future events only (default true)
		 *
		 * Returns: { events: EventRecord[], total: number }
		 */
		events: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const limit = Math.min(
						Math.max(1, parseInt(String(input.limit ?? "20"), 10) || 20),
						100
					);
					const upcomingOnly = String(input.upcomingOnly ?? "true") === "true";

					let events = await getAllEventsWithDates(ctx);

					// Filter to upcoming events if requested
					if (upcomingOnly) {
						const now = new Date();
						events = events.filter((e) => {
							const eventTime = dateTimeToTimestamp(e.date, e.time);
							return eventTime > now.getTime();
						});
					}

					// Limit results
					const limited = events.slice(0, limit);

					return { events: limited, total: events.length };
				} catch (error) {
					ctx.log.error(`Events list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch events" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /eventdash/events/:id
		 * Get event details with registration count and spots remaining.
		 *
		 * Returns: { event: EventRecord, spotsRemaining: number, waitlistCount: number }
		 */
		eventDetail: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const eventId = String(rc.pathParams?.id ?? "").trim();

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					if (!eventJson) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const waitlist = await getWaitlist(ctx, eventId);
					const spotsRemaining = Math.max(0, event.capacity - event.registered);

					return {
						event,
						spotsRemaining,
						waitlistCount: waitlist.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Event detail error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch event" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /eventdash/events/:id/register
		 * Register for an event. If full, adds to waitlist.
		 *
		 * Body: { name: string, email: string, ticketType?: string, stripePaymentIntentId?: string, amountPaid?: number, paymentStatus?: "pending" | "paid" | "refunded" }
		 * Returns: { success: boolean, status: "registered" | "waitlisted", message: string }
		 */
		register: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const eventId = String(rc.pathParams?.id ?? "").trim();
					const input = rc.input as Record<string, unknown>;
					const name = validateStringLength(String(input.name ?? "").trim(), 100, "Name");
					const email = validateStringLength(String(input.email ?? "").trim().toLowerCase(), 254, "Email");
					const ticketType = String(input.ticketType ?? "").trim();
					const stripePaymentIntentId = String(input.stripePaymentIntentId ?? "").trim();
					const amountPaid = input.amountPaid ? parseInt(String(input.amountPaid), 10) : undefined;
					const paymentStatus = String(input.paymentStatus ?? "paid").trim() as "pending" | "paid" | "refunded";

					// Validate input
					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!name) {
						throw new Response(
							JSON.stringify({ error: "Name is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Valid email is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					if (!eventJson) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Acquire event-level lock to prevent capacity overflow (P0 fix)
					// Lock is per-event, not per-email, to prevent race condition where
					// two different users both see capacity available
					const lockKey = `register-lock:${eventId}`;
					const existingLock = await ctx.kv.get<string>(lockKey);
					if (existingLock) {
						throw new Response(
							JSON.stringify({ error: "Registration in progress, please try again" }),
							{ status: 429, headers: { "Content-Type": "application/json" } }
						);
					}
					await ctx.kv.set(lockKey, "1", { ex: 5 }); // 5 second lock

					try {
						// Reload event to ensure fresh capacity check within lock
						const freshEventJson = await ctx.kv.get<string>(`event:${eventId}`);
						const freshEvent = parseJSON<EventRecord>(freshEventJson, null);
						if (!freshEvent) {
							throw new Response(
								JSON.stringify({ error: "Event not found" }),
								{ status: 404, headers: { "Content-Type": "application/json" } }
							);
						}

						// Check if already registered
						const regKey = `registration:${eventId}:${emailToKvKey(email)}`;
						const existingReg = await ctx.kv.get<string>(regKey);
						if (existingReg) {
							const existing = parseJSON<RegistrationRecord>(existingReg, null);
							if (existing && existing.status === "registered") {
								return {
									success: true,
									status: "registered",
									message: "Already registered for this event",
								};
							}
							// If cancelled, delete the old record before creating new one (P0 fix)
							if (existing && existing.status === "cancelled") {
								await ctx.kv.delete(regKey);
							}
						}

						const now = new Date().toISOString();
						let status: "registered" | "waitlisted" = "registered";

						// Check capacity (fresh data within lock)
						if (freshEvent.registered >= freshEvent.capacity) {
							// Full — add to waitlist
							status = "waitlisted";
							const waitlist = await getWaitlist(ctx, eventId);
							const position = waitlist.length + 1;

							const waitlistEntry: WaitlistRecord = {
								email,
								name,
								createdAt: now,
								position,
							};

							waitlist.push(waitlistEntry);
							await ctx.kv.set(`waitlist:${eventId}`, JSON.stringify(waitlist));

							// Send waitlist email if provider available
							if (ctx.email) {
								await ctx.email.send({
									to: email,
									subject: `Waitlisted for ${freshEvent.title}`,
									text: `Hi ${name},\n\nYou've been added to the waitlist for ${freshEvent.title} on ${freshEvent.date} at ${freshEvent.time}.\n\nYou're #${position} on the waitlist.`,
								});
							}

							return {
								success: true,
								status: "waitlisted",
								message: `Added to waitlist. You're #${position}`,
							};
						}

						// Register the attendee
						const registration: RegistrationRecord = {
							email,
							name,
							status: "registered",
							ticketCount: 1,
							createdAt: now,
						};

						// Add payment fields if provided
						if (ticketType) registration.ticketType = ticketType;
						if (stripePaymentIntentId) registration.stripePaymentIntentId = stripePaymentIntentId;
						if (amountPaid !== undefined) registration.amountPaid = amountPaid;
						if (paymentStatus) registration.paymentStatus = paymentStatus;

						await ctx.kv.set(regKey, JSON.stringify(registration));

						// Increment registered count
						freshEvent.registered++;
						// Update total revenue if payment was made
						if (amountPaid && paymentStatus === "paid") {
							freshEvent.totalRevenue = (freshEvent.totalRevenue ?? 0) + amountPaid;
						}
						await ctx.kv.set(`event:${eventId}`, JSON.stringify(freshEvent));

						// Send confirmation email if provider available
						if (ctx.email) {
							await ctx.email.send({
								to: email,
								subject: `Registered for ${freshEvent.title}`,
								text: `Hi ${name},\n\nYou're registered for ${freshEvent.title} on ${freshEvent.date} at ${freshEvent.time}.\n\nLocation: ${freshEvent.location}`,
							});
						}

						ctx.log.info(`Registration confirmed: ${email} for event ${eventId}${ticketType ? ` (${ticketType})` : ""}`);

						return {
							success: true,
							status: "registered",
							message: `Registered for ${freshEvent.title}`,
						};
					} finally {
						// Release the lock
						await ctx.kv.delete(lockKey);
					}
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Registration error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Registration failed" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /eventdash/events/:id/cancel
		 * Cancel registration or waitlist entry and optionally promote from waitlist.
		 *
		 * Body: { email: string }
		 * Returns: { success: boolean, message: string }
		 */
		cancel: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const eventId = String(rc.pathParams?.id ?? "").trim();
					const input = rc.input as Record<string, unknown>;
					const email = validateStringLength(String(input.email ?? "").trim().toLowerCase(), 254, "Email");

					if (!eventId || !email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Event ID and valid email required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					if (!eventJson) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check if registered
					const regKey = `registration:${eventId}:${emailToKvKey(email)}`;
					const regJson = await ctx.kv.get<string>(regKey);
					let isRegistered = false;

					if (regJson) {
						const registration = parseJSON<RegistrationRecord>(regJson, null);
						if (!registration) {
							throw new Response(
								JSON.stringify({ error: "Registration not found" }),
								{ status: 404, headers: { "Content-Type": "application/json" } }
							);
						}
						isRegistered = true;

						// Mark as cancelled
						registration.status = "cancelled";
						await ctx.kv.set(regKey, JSON.stringify(registration));

						// Decrement registered count
						if (event.registered > 0) {
							event.registered--;
							await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));
						}

						// Send cancellation email if provider available
						if (ctx.email) {
							await ctx.email.send({
								to: email,
								subject: `Cancelled for ${event.title}`,
								text: `Your registration for ${event.title} has been cancelled.`,
							});
						}

						ctx.log.info(`Cancelled registration: ${email} for event ${eventId}`);
					}

					// Check if on waitlist (P0 fix: support cancellation from waitlist)
					let isWaitlisted = false;
					const waitlist = await getWaitlist(ctx, eventId);
					const waitlistIndex = waitlist.findIndex((w) => w.email === email);

					if (waitlistIndex >= 0) {
						isWaitlisted = true;
						// Remove from waitlist
						const updated = waitlist.filter((w) => w.email !== email);

						// Renumber positions
						const renumbered = updated.map((w, index) => ({ ...w, position: index + 1 }));

						if (renumbered.length > 0) {
							await ctx.kv.set(`waitlist:${eventId}`, JSON.stringify(renumbered));
						} else {
							await ctx.kv.delete(`waitlist:${eventId}`);
						}

						// Send cancellation email if provider available
						if (ctx.email) {
							await ctx.email.send({
								to: email,
								subject: `Waitlist cancelled for ${event.title}`,
								text: `Your waitlist entry for ${event.title} has been cancelled.`,
							});
						}

						ctx.log.info(`Cancelled waitlist entry: ${email} for event ${eventId}`);
					}

					if (!isRegistered && !isWaitlisted) {
						throw new Response(
							JSON.stringify({ error: "No registration or waitlist entry found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Promote from waitlist if someone is waiting and we just freed a registered spot
					if (isRegistered) {
						const promoted = await promoteFromWaitlist(ctx, eventId);
						if (promoted) {
							// Create registration for promoted person
							const promRegKey = `registration:${eventId}:${emailToKvKey(promoted.email)}`;
							const promRegistration: RegistrationRecord = {
								email: promoted.email,
								name: promoted.name,
								status: "registered",
								ticketCount: 1,
								createdAt: new Date().toISOString(),
							};
							await ctx.kv.set(promRegKey, JSON.stringify(promRegistration));

							// Increment registered count
							event.registered++;
							await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

							// Send promotion email if provider available
							if (ctx.email) {
								await ctx.email.send({
									to: promoted.email,
									subject: `You're promoted from the waitlist for ${event.title}`,
									text: `Hi ${promoted.name},\n\nA spot has opened up for ${event.title} on ${event.date} at ${event.time}.\n\nLocation: ${event.location}`,
								});
							}

							ctx.log.info(`Promoted from waitlist: ${promoted.email} for event ${eventId}`);
						}
					}

					return {
						success: true,
						message: isWaitlisted ? "Waitlist entry cancelled" : "Registration cancelled",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Cancellation error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Cancellation failed" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /eventdash/events/create
		 * Create a new event (admin only).
		 *
		 * Body: { title, date, time, location, capacity, description?, endTime?, requiresPayment?, stripeProductId?, ticketTypes? }
		 * ticketTypes: array of { name, stripePriceId, price, capacity, description?, availableUntil? }
		 * Returns: { success: boolean, eventId: string }
		 */
		createEvent: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const title = validateStringLength(String(input.title ?? "").trim(), 200, "Title");
					const date = String(input.date ?? "").trim();
					const time = String(input.time ?? "").trim();
					const location = validateStringLength(String(input.location ?? "").trim(), 500, "Location");
					const capacity = parseInt(String(input.capacity ?? "1"), 10);
					const description = validateStringLength(String(input.description ?? "").trim(), 5000, "Description");
					const endTime = String(input.endTime ?? "").trim();
					const requiresPayment = input.requiresPayment === true;
					const stripeProductId = String(input.stripeProductId ?? "").trim();

					if (!title || !date || !time || !location || capacity < 1) {
						throw new Response(
							JSON.stringify({
								error: "Title, date, time, location, and capacity required",
							}),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Validate ticketTypes if provided
					let ticketTypes: TicketType[] | undefined;
					if (input.ticketTypes && Array.isArray(input.ticketTypes)) {
						ticketTypes = (input.ticketTypes as Array<Record<string, unknown>>).map((tt) => {
							const name = validateStringLength(String(tt.name ?? "").trim(), 100, "Ticket type name");
							const stripePriceId = String(tt.stripePriceId ?? "").trim();
							const price = parseInt(String(tt.price ?? "0"), 10);
							const ticketCapacity = parseInt(String(tt.capacity ?? "1"), 10);
							const availableUntil = String(tt.availableUntil ?? "").trim();
							const ticketDescription = validateStringLength(String(tt.description ?? "").trim(), 500, "Ticket description");

							if (!name || !stripePriceId || price < 0 || ticketCapacity < 1) {
								throw new Response(
									JSON.stringify({
										error: "Ticket type requires: name, stripePriceId, price, capacity",
									}),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}

							return {
								id: generateId(),
								name,
								stripePriceId,
								price,
								capacity: ticketCapacity,
								sold: 0,
								...(ticketDescription && { description: ticketDescription }),
								...(availableUntil && { availableUntil }),
							};
						});

						if (requiresPayment && ticketTypes.length === 0) {
							throw new Response(
								JSON.stringify({
									error: "Paid events require at least one ticket type",
								}),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}
					}

					const eventId = generateId();
					const event: EventRecord = {
						id: eventId,
						title,
						date,
						time,
						location,
						capacity,
						registered: 0,
						createdAt: new Date().toISOString(),
					};

					if (description) event.description = description;
					if (endTime) event.endTime = endTime;
					if (requiresPayment) event.requiresPayment = requiresPayment;
					if (stripeProductId) event.stripeProductId = stripeProductId;
					if (ticketTypes) event.ticketTypes = ticketTypes;
					event.totalRevenue = 0;

					await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

					// Add to events list
					const listJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(listJson, []);
					eventIds.push(eventId);
					await ctx.kv.set("events:list", JSON.stringify(eventIds));

					ctx.log.info(`Event created: ${eventId}${requiresPayment ? " (paid)" : ""}`);

					return { success: true, eventId };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Create event error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to create event" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /eventdash/events/create-template
		 * Create a recurring event template (admin only).
		 *
		 * Body: { title, time, location, capacity, dayOfWeek, description?, endTime? }
		 * dayOfWeek: 0=Sunday, 1=Monday, ..., 6=Saturday
		 * Returns: { success: boolean, templateId: string }
		 */
		createTemplate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const title = validateStringLength(String(input.title ?? "").trim(), 200, "Title");
					const time = String(input.time ?? "").trim();
					const location = validateStringLength(String(input.location ?? "").trim(), 500, "Location");
					const capacity = parseInt(String(input.capacity ?? "1"), 10);
					const dayOfWeek = parseInt(String(input.dayOfWeek ?? "0"), 10);
					const description = validateStringLength(String(input.description ?? "").trim(), 5000, "Description");
					const endTime = String(input.endTime ?? "").trim();

					if (!title || !time || !location || capacity < 1 || dayOfWeek < 0 || dayOfWeek > 6) {
						throw new Response(
							JSON.stringify({
								error: "Title, time, location, capacity, and dayOfWeek (0-6) required",
							}),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const templateId = generateId();
					const template: EventTemplateRecord = {
						id: templateId,
						title,
						time,
						location,
						capacity,
						dayOfWeek,
						createdAt: new Date().toISOString(),
					};

					if (description) template.description = description;
					if (endTime) template.endTime = endTime;

					await ctx.kv.set(`event-template:${templateId}`, JSON.stringify(template));

					ctx.log.info(`Event template created: ${templateId}`);

					return { success: true, templateId };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Create template error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to create template" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /eventdash/events/generate-recurring
		 * Generate recurring event instances from a template (admin only).
		 *
		 * Body: { templateId: string, weeks: number, startDate?: string }
		 * Returns: { success: boolean, generatedCount: number }
		 */
		generateRecurring: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const templateId = String(input.templateId ?? "").trim();
					const weeks = Math.max(1, parseInt(String(input.weeks ?? "4"), 10));
					const startDateInput = String(input.startDate ?? "");

					if (!templateId) {
						throw new Response(
							JSON.stringify({ error: "Template ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const templateJson = await ctx.kv.get<string>(`event-template:${templateId}`);
					if (!templateJson) {
						throw new Response(
							JSON.stringify({ error: "Template not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const template = parseJSON<EventTemplateRecord>(templateJson, null);
					if (!template) {
						throw new Response(
							JSON.stringify({ error: "Template not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Determine start date
					let currentDate = new Date();
					if (startDateInput) {
						currentDate = new Date(startDateInput);
					}

					// Validate start date is in the future (P1 fix)
					const now = new Date();
					now.setHours(0, 0, 0, 0);
					currentDate.setHours(0, 0, 0, 0);
					if (currentDate < now) {
						throw new Response(
							JSON.stringify({ error: "Start date must be in the future" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Generate instances for N weeks
					const generatedIds: string[] = [];
					for (let i = 0; i < weeks; i++) {
						// Find the next occurrence of the target day of week
						while (currentDate.getUTCDay() !== template.dayOfWeek) {
							currentDate.setUTCDate(currentDate.getUTCDate() + 1);
						}

						const dateStr = currentDate.toISOString().split("T")[0];
						const eventId = generateId();

						const event: EventRecord = {
							id: eventId,
							title: template.title,
							date: dateStr,
							time: template.time,
							location: template.location,
							capacity: template.capacity,
							registered: 0,
							templateId,
							createdAt: new Date().toISOString(),
						};

						if (template.description) event.description = template.description;
						if (template.endTime) event.endTime = template.endTime;

						await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));
						generatedIds.push(eventId);

						// Move to next week
						currentDate.setUTCDate(currentDate.getUTCDate() + 7);
					}

					// Add to events list
					const listJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(listJson, []);
					eventIds.push(...generatedIds);
					await ctx.kv.set("events:list", JSON.stringify(eventIds));

					ctx.log.info(
						`Generated ${generatedIds.length} recurring events from template ${templateId}`
					);

					return { success: true, generatedCount: generatedIds.length };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Generate recurring error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to generate recurring events" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * Block Kit admin handler for pages and widgets
		 */
		admin: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const interaction = rc.input as AdminInteraction;

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					// Events page
					if (interaction.type === "page_load" && interaction.page === "/events") {
						const events = await getAllEventsWithDates(ctx);

						const eventRows = [];
						let totalRevenue = 0;
						for (const event of events) {
							const waitlist = await getWaitlist(ctx, event.id);
							const eventRevenue = event.totalRevenue ?? 0;
							totalRevenue += eventRevenue;
							const revenueDisplay =
								event.requiresPayment && eventRevenue > 0
									? `$${(eventRevenue / 100).toFixed(2)}`
									: event.requiresPayment
										? "—"
										: "N/A";
							eventRows.push({
								id: event.id,
								title: event.title,
								date: event.date,
								time: event.time,
								registered: `${event.registered}/${event.capacity}`,
								waitlist: waitlist.length.toString(),
								status: event.registered >= event.capacity ? "Full" : "Open",
								type: event.requiresPayment ? "Paid" : "Free",
								revenue: revenueDisplay,
							});
						}

						return {
							blocks: [
								{
									type: "header",
									text: "Events",
								},
								{
									type: "stats",
									stats: [
										{
											label: "Total Events",
											value: events.length.toString(),
										},
										{
											label: "Total Registrations",
											value: events
												.reduce((sum, e) => sum + e.registered, 0)
												.toString(),
										},
										{
											label: "Total Revenue",
											value: `$${(totalRevenue / 100).toFixed(2)}`,
										},
									],
								},
								{
									type: "table",
									blockId: "events-table",
									columns: [
										{ key: "title", label: "Event", format: "text" as const },
										{ key: "date", label: "Date", format: "text" as const },
										{ key: "time", label: "Time", format: "text" as const },
										{
											key: "registered",
											label: "Registered",
											format: "text" as const,
										},
										{
											key: "waitlist",
											label: "Waitlist",
											format: "text" as const,
										},
										{ key: "type", label: "Type", format: "text" as const },
										{ key: "revenue", label: "Revenue", format: "text" as const },
										{ key: "status", label: "Status", format: "badge" as const },
									],
									rows: eventRows,
								},
							],
						};
					}

					// Create event page
					if (interaction.type === "page_load" && interaction.page === "/create") {
						return {
							blocks: [
								{
									type: "header",
									text: "Create Event",
								},
								{
									type: "form",
									blockId: "create-event-form",
									fields: [
										{
											type: "text_input",
											action_id: "title",
											label: "Event Title",
											placeholder: "e.g., Yoga Class",
										},
										{
											type: "text_input",
											action_id: "date",
											label: "Date (YYYY-MM-DD)",
											placeholder: "2026-04-15",
										},
										{
											type: "text_input",
											action_id: "time",
											label: "Time (HH:MM)",
											placeholder: "18:00",
										},
										{
											type: "text_input",
											action_id: "endTime",
											label: "End Time (HH:MM, optional)",
											placeholder: "19:00",
										},
										{
											type: "text_input",
											action_id: "location",
											label: "Location",
											placeholder: "123 Main St, City",
										},
										{
											type: "number_input",
											action_id: "capacity",
											label: "Capacity",
											placeholder: "30",
										},
										{
											type: "text_input",
											action_id: "description",
											label: "Description (optional)",
											placeholder: "Event details",
										},
									],
									submit: { label: "Create Event", action_id: "create" },
								},
							],
						};
					}

					// Process event creation
					if (interaction.type === "form_submit" && interaction.action === "create") {
						const title = String(interaction.title ?? "").trim();
						const date = String(interaction.date ?? "").trim();
						const time = String(interaction.time ?? "").trim();
						const location = String(interaction.location ?? "").trim();
						const capacity = parseInt(String(interaction.capacity ?? "1"), 10);
						const description = String(interaction.description ?? "").trim();
						const endTime = String(interaction.endTime ?? "").trim();

						if (!title || !date || !time || !location || capacity < 1) {
							return {
								blocks: [],
								toast: {
									message: "Please fill in all required fields",
									type: "error" as const,
								},
							};
						}

						// Validate string lengths
						if (title.length > 200) {
							return {
								blocks: [],
								toast: {
									message: "Title must be 200 characters or less",
									type: "error" as const,
								},
							};
						}
						if (location.length > 500) {
							return {
								blocks: [],
								toast: {
									message: "Location must be 500 characters or less",
									type: "error" as const,
								},
							};
						}
						if (description.length > 5000) {
							return {
								blocks: [],
								toast: {
									message: "Description must be 5000 characters or less",
									type: "error" as const,
								},
							};
						}

						const eventId = generateId();
						const event: EventRecord = {
							id: eventId,
							title,
							date,
							time,
							location,
							capacity,
							registered: 0,
							createdAt: new Date().toISOString(),
						};

						if (description) event.description = description;
						if (endTime) event.endTime = endTime;

						await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

						const listJson = await ctx.kv.get<string>("events:list");
						const eventIds = parseJSON<string[]>(listJson, []);
						eventIds.push(eventId);
						await ctx.kv.set("events:list", JSON.stringify(eventIds));

						ctx.log.info(`Event created: ${eventId}`);

						return {
							blocks: [],
							toast: {
								message: `Event created: ${title}`,
								type: "success" as const,
							},
						};
					}

					// Widget: upcoming events count
					if (interaction.type === "widget_load" && interaction.widgetId === "upcoming-events") {
						const events = await getAllEventsWithDates(ctx);
						const now = new Date();
						const upcoming = events.filter(
							(e) => dateTimeToTimestamp(e.date, e.time) > now.getTime()
						);

						return {
							blocks: [
								{
									type: "stats",
									stats: [
										{
											label: "Upcoming Events",
											value: upcoming.length.toString(),
										},
										{
											label: "Total Registrations",
											value: upcoming
												.reduce((sum, e) => sum + e.registered, 0)
												.toString(),
										},
									],
								},
							],
						};
					}

					return { blocks: [] };
				} catch (error) {
					ctx.log.error(`Admin handler error: ${String(error)}`);
					return {
						blocks: [
							{
								type: "banner",
								title: "Error",
								description: "Failed to load admin page",
								variant: "error" as const,
							},
						],
					};
				}
			},
		},
	},
});
