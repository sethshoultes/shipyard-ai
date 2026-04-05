import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	sendEmail,
	formatDateTime,
	generateCalendarLink,
	generateFreeEventEmailHTML,
	generatePaidEventEmailHTML,
	generateCancellationEmailHTML,
	generateWaitlistEmailHTML,
	generateWaitlistPromotionEmailHTML,
} from "./email";

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
	// New Phase 2 Wave 4 fields
	earlyBirdDeadline?: string; // ISO date when early bird pricing expires
	earlyBirdPrice?: number; // Early bird price in cents (optional, for early bird tickets)
	groupMin?: number; // Minimum tickets for group discount
	groupDiscount?: number; // Group discount percentage (1-100)
	vipPerks?: string[]; // Array of VIP perks/benefits (e.g., "Priority seating", "Complimentary drink")
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
	// Phase 3: Check-in fields
	checkInCode?: string; // 6-char alphanumeric code for check-in
	checkedIn?: boolean; // Whether attendee has checked in
	checkedInAt?: string; // ISO timestamp when checked in
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
 * Utility: Generate 6-character alphanumeric check-in code
 */
function generateCheckInCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

/**
 * Utility: Format date and time for iCal (RFC 5545 format: YYYYMMDDTHHmmssZ)
 */
function formatICalDate(date: string, time: string): string {
	try {
		const [hours, minutes] = time.split(":").map(Number);
		const dateObj = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`);
		const year = dateObj.getUTCFullYear();
		const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
		const day = String(dateObj.getUTCDate()).padStart(2, "0");
		const h = String(dateObj.getUTCHours()).padStart(2, "0");
		const m = String(dateObj.getUTCMinutes()).padStart(2, "0");
		const s = String(dateObj.getUTCSeconds()).padStart(2, "0");
		return `${year}${month}${day}T${h}${m}${s}Z`;
	} catch {
		return "";
	}
}

/**
 * Utility: Escape special characters for iCal
 */
function escapeICalString(str: string): string {
	return str
		.replace(/\\/g, "\\\\")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;")
		.replace(/\n/g, "\\n");
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
 * Utility: Verify Stripe signature on webhook
 */
async function verifyStripeSignature(
	payload: string,
	signature: string,
	secret: string
): Promise<boolean> {
	try {
		const parts = signature.split(",");
		const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
		const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);

		if (!timestamp || !v1) return false;

		const signedPayload = `${timestamp}.${payload}`;

		// Import HMAC key
		const key = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"]
		);

		// Sign the payload
		const sig = await crypto.subtle.sign(
			"HMAC",
			key,
			new TextEncoder().encode(signedPayload)
		);

		// Convert signature to hex
		const expected = Array.from(new Uint8Array(sig))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		return expected === v1;
	} catch (error) {
		return false;
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
	// Initialize Resend configuration
	// Admin should set RESEND_API_KEY and EVENT_FROM_EMAIL environment variables
	// Alternatively, store in KV via admin settings endpoint
	ctx.log.info("EventDash: Configure email settings via RESEND_API_KEY and EVENT_FROM_EMAIL environment variables");
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

							// Send waitlist email via Resend
							const waitlistEmailHTML = generateWaitlistEmailHTML(name, freshEvent.title, position);
							await sendEmail(ctx, {
								to: email,
								subject: `Waitlisted for ${freshEvent.title}`,
								html: waitlistEmailHTML,
							});

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
							checkInCode: generateCheckInCode(), // Generate check-in code for Wave 3
							checkedIn: false,
						};

						// Add payment fields if provided
						if (ticketType) registration.ticketType = ticketType;
						if (stripePaymentIntentId) registration.stripePaymentIntentId = stripePaymentIntentId;
						if (amountPaid !== undefined) registration.amountPaid = amountPaid;
						if (paymentStatus) registration.paymentStatus = paymentStatus;

						await ctx.kv.set(regKey, JSON.stringify(registration));

						// Track attendee email for bulk operations (Wave 3)
						const attendeesListJson = await ctx.kv.get<string>("event-attendees:list");
						const attendeesList = parseJSON<string[]>(attendeesListJson, []);
						const encodedEmail = emailToKvKey(email);
						if (!attendeesList.includes(encodedEmail)) {
							attendeesList.push(encodedEmail);
							await ctx.kv.set("event-attendees:list", JSON.stringify(attendeesList));
						}

						// Increment registered count
						freshEvent.registered++;
						// Update total revenue if payment was made
						if (amountPaid && paymentStatus === "paid") {
							freshEvent.totalRevenue = (freshEvent.totalRevenue ?? 0) + amountPaid;
						}
						await ctx.kv.set(`event:${eventId}`, JSON.stringify(freshEvent));

						// Send confirmation email via Resend
						// For free events or pending payments, send immediately
						// For paid events with confirmed payment, send in webhook handler
						if (!freshEvent.requiresPayment || paymentStatus === "paid") {
							const calendarLink = generateCalendarLink(
								freshEvent.title,
								freshEvent.date,
								freshEvent.time,
								freshEvent.endTime,
								freshEvent.location
							);

							let emailHTML: string;
							if (freshEvent.requiresPayment && paymentStatus === "paid") {
								// Paid event with payment confirmed
								const price = amountPaid || 0;
								const ticketTypeDisplay = ticketType || "General";
								emailHTML = generatePaidEventEmailHTML(
									name,
									freshEvent.title,
									ticketTypeDisplay,
									price,
									freshEvent.date,
									freshEvent.time,
									freshEvent.location,
									calendarLink,
									freshEvent.endTime
								);
							} else {
								// Free event or pending payment
								emailHTML = generateFreeEventEmailHTML(
									name,
									freshEvent.title,
									freshEvent.date,
									freshEvent.time,
									freshEvent.location,
									calendarLink,
									freshEvent.endTime
								);
							}

							await sendEmail(ctx, {
								to: email,
								subject: `You're registered for ${freshEvent.title}!`,
								html: emailHTML,
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

						// Send cancellation email via Resend
						const cancellationEmailHTML = generateCancellationEmailHTML(registration.name, event.title);
						await sendEmail(ctx, {
							to: email,
							subject: `Registration cancelled — ${event.title}`,
							html: cancellationEmailHTML,
						});

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

						// Send cancellation email via Resend
						const waitlistName = waitlist.find((w) => w.email === email)?.name || "there";
						const cancellationEmailHTML = generateCancellationEmailHTML(waitlistName, event.title);
						await sendEmail(ctx, {
							to: email,
							subject: `Waitlist cancelled — ${event.title}`,
							html: cancellationEmailHTML,
						});

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

							// Send promotion email via Resend
							const siteUrl = (ctx as unknown as Record<string, unknown>).siteUrl || "https://example.com";
							const registerLink = `${siteUrl}/events/${eventId}/register?email=${encodeURIComponent(promoted.email)}`;
							const promotionEmailHTML = generateWaitlistPromotionEmailHTML(
								promoted.name,
								event.title,
								registerLink
							);
							await sendEmail(ctx, {
								to: promoted.email,
								subject: `A spot opened up — ${event.title}`,
								html: promotionEmailHTML,
							});

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
		 * POST /eventdash/events/:id/checkout
		 * Create a Stripe Checkout Session for a paid event ticket.
		 *
		 * Body: { name: string, email: string, ticketType: string }
		 * Returns: { clientSecret: string, amount: number, status: "pending" }
		 */
		checkout: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const eventId = String(rc.pathParams?.id ?? "").trim();
					const input = rc.input as Record<string, unknown>;
					const name = validateStringLength(String(input.name ?? "").trim(), 100, "Name");
					const email = validateStringLength(String(input.email ?? "").trim().toLowerCase(), 254, "Email");
					const ticketType = validateStringLength(String(input.ticketType ?? "").trim(), 100, "Ticket type");

					if (!eventId || !name || !email || !ticketType || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Event ID, name, email, and ticket type required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
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

					// Validate it's a paid event
					if (!event.requiresPayment || !event.ticketTypes || event.ticketTypes.length === 0) {
						throw new Response(
							JSON.stringify({ error: "Event does not accept paid registrations" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Find the ticket type
					const selectedTicket = event.ticketTypes.find((t) => t.name === ticketType);
					if (!selectedTicket) {
						throw new Response(
							JSON.stringify({ error: "Ticket type not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check capacity
					if (selectedTicket.sold >= selectedTicket.capacity) {
						throw new Response(
							JSON.stringify({ error: "Ticket type is sold out" }),
							{ status: 409, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get Stripe API key
					const stripeKey = ctx.env?.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
					if (!stripeKey) {
						ctx.log.error("Stripe secret key not configured");
						throw new Response(
							JSON.stringify({ error: "Payment processing not available" }),
							{ status: 503, headers: { "Content-Type": "application/json" } }
						);
					}

					// Create payment intent via Stripe API
					const paymentIntentResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${stripeKey}`,
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: new URLSearchParams({
							amount: String(selectedTicket.price),
							currency: "usd",
							receipt_email: email,
							metadata: JSON.stringify({
								eventId,
								ticketTypeId: selectedTicket.id,
								email,
								name,
								ticketTypeName: ticketType,
							}),
						}).toString(),
					});

					if (!paymentIntentResponse.ok) {
						ctx.log.error(`Stripe API error: ${paymentIntentResponse.status}`);
						throw new Response(
							JSON.stringify({ error: "Failed to create payment intent" }),
							{ status: 502, headers: { "Content-Type": "application/json" } }
						);
					}

					const paymentIntent = (await paymentIntentResponse.json()) as Record<string, unknown>;
					const clientSecret = String(paymentIntent.client_secret ?? "");

					if (!clientSecret) {
						throw new Response(
							JSON.stringify({ error: "Failed to create payment intent" }),
							{ status: 502, headers: { "Content-Type": "application/json" } }
						);
					}

					// Create pending registration record
					const now = new Date().toISOString();
					const registration: RegistrationRecord = {
						email,
						name,
						status: "registered",
						ticketCount: 1,
						createdAt: now,
						ticketType,
						stripePaymentIntentId: String(paymentIntent.id ?? ""),
						amountPaid: selectedTicket.price,
						paymentStatus: "pending",
					};

					const regKey = `registration:${eventId}:${emailToKvKey(email)}`;
					await ctx.kv.set(regKey, JSON.stringify(registration));

					// Decrement capacity (optimistic)
					selectedTicket.sold++;
					await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

					ctx.log.info(`Checkout created: ${email} for event ${eventId}, ticket: ${ticketType}`);

					return {
						clientSecret,
						amount: selectedTicket.price,
						status: "pending",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Checkout error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Checkout failed" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /eventdash/webhook
		 * Stripe webhook handler for payment and charge events.
		 * Public route: true (required for Stripe webhooks)
		 *
		 * Handles:
		 *   - payment_intent.succeeded → update registration to paid
		 *   - charge.refunded → update registration to refunded, free up capacity
		 *
		 * Returns: { received: true }
		 */
		webhook: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const stripeSecret = ctx.env?.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

					if (!stripeSecret) {
						ctx.log.warn("Stripe webhook secret not configured");
						return { received: true };
					}

					// Get raw body and signature
					const rawBody = rc.rawBody as string | undefined;
					const signature = rc.headers?.["stripe-signature"] as string | undefined;

					if (!rawBody || !signature) {
						ctx.log.warn("Missing webhook payload or signature");
						return { received: true };
					}

					// Verify Stripe signature
					const isValid = await verifyStripeSignature(rawBody, signature, stripeSecret);
					if (!isValid) {
						ctx.log.warn("Invalid Stripe signature");
						return { received: true };
					}

					// Parse event
					let event: Record<string, unknown>;
					try {
						event = JSON.parse(rawBody) as Record<string, unknown>;
					} catch {
						ctx.log.error("Failed to parse webhook payload");
						return { received: true };
					}

					const eventId = String(event.id ?? "");
					const eventType = String(event.type ?? "");

					if (!eventId || !eventType) {
						ctx.log.warn("Missing event id or type");
						return { received: true };
					}

					// Idempotency check
					const idempotencyKey = `stripe:webhook:${eventId}`;
					const processed = await ctx.kv.get<string>(idempotencyKey);
					if (processed) {
						ctx.log.info(`Webhook already processed: ${eventId}`);
						return { received: true };
					}

					// Mark as processing
					await ctx.kv.set(idempotencyKey, "1", { ex: 86400 }); // 24h TTL

					const eventData = event.data as Record<string, unknown> | undefined;
					const object = eventData?.object as Record<string, unknown> | undefined;

					if (!object) {
						ctx.log.warn(`Webhook ${eventType}: missing data.object`);
						return { received: true };
					}

					switch (eventType) {
						case "payment_intent.succeeded": {
							// Payment succeeded: update registration status and send confirmation email
							const metadata = object.metadata as Record<string, string> | undefined;
							if (!metadata) break;

							const piEventId = metadata.eventId || "";
							const email = metadata.email || "";

							if (!piEventId || !email) {
								ctx.log.warn("Missing metadata in payment_intent.succeeded");
								break;
							}

							const regKey = `registration:${piEventId}:${emailToKvKey(email)}`;
							const regJson = await ctx.kv.get<string>(regKey);
							if (regJson) {
								const registration = parseJSON<RegistrationRecord>(regJson, null);
								if (registration) {
									registration.paymentStatus = "paid";
									await ctx.kv.set(regKey, JSON.stringify(registration));

									// Send confirmation email for paid event
									const eventJson = await ctx.kv.get<string>(`event:${piEventId}`);
									const evt = parseJSON<EventRecord>(eventJson, null);
									if (evt && evt.requiresPayment) {
										const calendarLink = generateCalendarLink(
											evt.title,
											evt.date,
											evt.time,
											evt.endTime,
											evt.location
										);

										const price = registration.amountPaid || 0;
										const ticketType = registration.ticketType || "General";

										const emailHTML = generatePaidEventEmailHTML(
											registration.name,
											evt.title,
											ticketType,
											price,
											evt.date,
											evt.time,
											evt.location,
											calendarLink,
											evt.endTime
										);

										await sendEmail(ctx, {
											to: email,
											subject: `Payment confirmed! You're registered for ${evt.title}`,
											html: emailHTML,
										});
									}

									ctx.log.info(`Payment confirmed for ${email} on event ${piEventId}`);
								}
							}
							break;
						}

						case "charge.refunded": {
							// Charge refunded: update registration and free up capacity
							const metadata = object.metadata as Record<string, string> | undefined;
							if (!metadata) break;

							const chargeEventId = metadata.eventId || "";
							const chargeEmail = metadata.email || "";
							const ticketTypeName = metadata.ticketTypeName || "";

							if (!chargeEventId || !chargeEmail) {
								ctx.log.warn("Missing metadata in charge.refunded");
								break;
							}

							const regKey = `registration:${chargeEventId}:${emailToKvKey(chargeEmail)}`;
							const regJson = await ctx.kv.get<string>(regKey);
							if (regJson) {
								const registration = parseJSON<RegistrationRecord>(regJson, null);
								if (registration) {
									registration.paymentStatus = "refunded";
									await ctx.kv.set(regKey, JSON.stringify(registration));

									// Free up capacity
									const eventJson = await ctx.kv.get<string>(`event:${chargeEventId}`);
									const evt = parseJSON<EventRecord>(eventJson, null);
									if (evt && evt.ticketTypes) {
										const ticket = evt.ticketTypes.find((t) => t.name === ticketTypeName);
										if (ticket && ticket.sold > 0) {
											ticket.sold--;
											await ctx.kv.set(`event:${chargeEventId}`, JSON.stringify(evt));
										}
									}

									ctx.log.info(`Refund processed for ${chargeEmail} on event ${chargeEventId}`);
								}
							}
							break;
						}

						default:
							ctx.log.info(`Unhandled webhook type: ${eventType}`);
					}

					return { received: true };
				} catch (error) {
					ctx.log.error(`Webhook handler error: ${String(error)}`);
					return { received: true };
				}
			},
		},

		/**
		 * GET /eventdash/events/:id/checkout/success
		 * Stripe checkout success page handler.
		 * Returns event and ticket confirmation data for display.
		 *
		 * Query params:
		 *   - email: attendee email (to look up registration)
		 *
		 * Returns: { event: EventRecord, registration: RegistrationRecord, ticketType: TicketType }
		 */
		checkoutSuccess: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const eventId = String(rc.pathParams?.id ?? "").trim();
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!eventId || !email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Event ID and valid email required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
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

					// Get registration
					const regKey = `registration:${eventId}:${emailToKvKey(email)}`;
					const regJson = await ctx.kv.get<string>(regKey);
					if (!regJson) {
						throw new Response(
							JSON.stringify({ error: "Registration not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const registration = parseJSON<RegistrationRecord>(regJson, null);
					if (!registration) {
						throw new Response(
							JSON.stringify({ error: "Registration not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Find ticket type
					let ticketType: TicketType | undefined;
					if (registration.ticketType && event.ticketTypes) {
						ticketType = event.ticketTypes.find((t) => t.name === registration.ticketType);
					}

					return {
						event,
						registration,
						ticketType: ticketType || null,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Checkout success error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch confirmation" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /events/:id/tickets
		 * List ticket types for an event with availability and pricing.
		 *
		 * Returns: { event: EventRecord, ticketTypes: (TicketType & { available: boolean, seatsLeft: number })[] }
		 */
		eventTickets: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const eventId = String(rc.eventId ?? "").trim();

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

					const now = new Date();
					const ticketTypes = (event.ticketTypes || []).map((ticket) => {
						// Check if ticket type is expired
						const isExpired = ticket.availableUntil && new Date(ticket.availableUntil) < now;
						const isSoldOut = ticket.sold >= ticket.capacity;
						const available = !isExpired && !isSoldOut;
						const seatsLeft = Math.max(0, ticket.capacity - ticket.sold);

						// Determine price: use early bird if applicable
						let displayPrice = ticket.price;
						let displayLabel = ticket.name;

						if (ticket.earlyBirdPrice && ticket.earlyBirdDeadline && new Date(ticket.earlyBirdDeadline) > now) {
							displayPrice = ticket.earlyBirdPrice;
							displayLabel = `${ticket.name} (Early Bird)`;
						}

						return {
							...ticket,
							available,
							seatsLeft,
							displayPrice,
							displayLabel,
							isExpired: !!isExpired,
							isSoldOut: !!isSoldOut,
						};
					});

					return {
						event,
						ticketTypes,
						totalAvailable: ticketTypes.filter((t) => t.available).length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Event tickets error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /events/:id/ticket-types/create
		 * Admin endpoint to create a new ticket type for an event.
		 *
		 * Expects: { eventId, name, price, capacity, availableUntil?, earlyBirdPrice?, earlyBirdDeadline?, groupMin?, groupDiscount?, vipPerks? }
		 * Returns: { success: true, ticketType: TicketType }
		 */
		createTicketType: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.eventId ?? "").trim();
					const name = String(input.name ?? "").trim();
					const price = Number(input.price ?? 0);
					const capacity = Number(input.capacity ?? 0);
					const availableUntil = input.availableUntil ? String(input.availableUntil).trim() : undefined;
					const earlyBirdPrice = input.earlyBirdPrice ? Number(input.earlyBirdPrice) : undefined;
					const earlyBirdDeadline = input.earlyBirdDeadline ? String(input.earlyBirdDeadline).trim() : undefined;
					const groupMin = input.groupMin ? Number(input.groupMin) : undefined;
					const groupDiscount = input.groupDiscount ? Number(input.groupDiscount) : undefined;
					const vipPerks = input.vipPerks as string[] | undefined;

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!name) {
						throw new Response(
							JSON.stringify({ error: "Ticket type name required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (price <= 0 || capacity <= 0) {
						throw new Response(
							JSON.stringify({ error: "Price and capacity must be greater than 0" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
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

					// Create ticket type
					const ticketType: TicketType = {
						id: generateId(),
						name,
						stripePriceId: `price_${generateId()}`, // Placeholder; in real impl, create via Stripe API
						price,
						capacity,
						sold: 0,
					};

					if (availableUntil) ticketType.availableUntil = availableUntil;
					if (earlyBirdPrice) ticketType.earlyBirdPrice = earlyBirdPrice;
					if (earlyBirdDeadline) ticketType.earlyBirdDeadline = earlyBirdDeadline;
					if (groupMin) ticketType.groupMin = groupMin;
					if (groupDiscount) ticketType.groupDiscount = groupDiscount;
					if (vipPerks && vipPerks.length > 0) ticketType.vipPerks = vipPerks;

					// Add to event
					if (!event.ticketTypes) {
						event.ticketTypes = [];
					}
					event.ticketTypes.push(ticketType);

					// Save event
					await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

					ctx.log.info(`Ticket type created: ${ticketType.id} for event ${eventId}`);

					return {
						success: true,
						ticketType,
						message: `Ticket type "${name}" created successfully`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Create ticket type error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * PATCH /events/:id/ticket-types/:typeId/update
		 * Admin endpoint to update a ticket type.
		 *
		 * Expects: { eventId, ticketTypeId, updates: { name?, price?, capacity?, ... } }
		 * Returns: { success: true, ticketType: TicketType }
		 */
		updateTicketType: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.eventId ?? "").trim();
					const ticketTypeId = String(input.ticketTypeId ?? "").trim();
					const updates = input.updates as Record<string, unknown> | undefined;

					if (!eventId || !ticketTypeId || !updates) {
						throw new Response(
							JSON.stringify({ error: "Event ID, ticket type ID, and updates required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					if (!eventJson) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event || !event.ticketTypes) {
						throw new Response(
							JSON.stringify({ error: "Event or ticket types not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Find and update ticket type
					const ticketIndex = event.ticketTypes.findIndex((t) => t.id === ticketTypeId);
					if (ticketIndex === -1) {
						throw new Response(
							JSON.stringify({ error: "Ticket type not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const ticket = event.ticketTypes[ticketIndex];

					// Apply updates
					if (updates.name) ticket.name = String(updates.name).trim();
					if (updates.price) ticket.price = Number(updates.price);
					if (updates.capacity) ticket.capacity = Number(updates.capacity);
					if (updates.availableUntil !== undefined) {
						ticket.availableUntil = updates.availableUntil ? String(updates.availableUntil).trim() : undefined;
					}
					if (updates.earlyBirdPrice !== undefined) {
						ticket.earlyBirdPrice = updates.earlyBirdPrice ? Number(updates.earlyBirdPrice) : undefined;
					}
					if (updates.earlyBirdDeadline !== undefined) {
						ticket.earlyBirdDeadline = updates.earlyBirdDeadline ? String(updates.earlyBirdDeadline).trim() : undefined;
					}
					if (updates.groupMin !== undefined) {
						ticket.groupMin = updates.groupMin ? Number(updates.groupMin) : undefined;
					}
					if (updates.groupDiscount !== undefined) {
						ticket.groupDiscount = updates.groupDiscount ? Number(updates.groupDiscount) : undefined;
					}
					if (updates.vipPerks !== undefined) {
						ticket.vipPerks = updates.vipPerks as string[] | undefined;
					}

					// Save event
					await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

					ctx.log.info(`Ticket type updated: ${ticketTypeId}`);

					return {
						success: true,
						ticketType: ticket,
						message: "Ticket type updated successfully",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Update ticket type error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * DELETE /events/:id/ticket-types/:typeId/delete
		 * Admin endpoint to delete a ticket type.
		 *
		 * Expects: { eventId, ticketTypeId }
		 * Returns: { success: true }
		 */
		deleteTicketType: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.eventId ?? "").trim();
					const ticketTypeId = String(input.ticketTypeId ?? "").trim();

					if (!eventId || !ticketTypeId) {
						throw new Response(
							JSON.stringify({ error: "Event ID and ticket type ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					if (!eventJson) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event || !event.ticketTypes) {
						throw new Response(
							JSON.stringify({ error: "Event or ticket types not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Remove ticket type
					event.ticketTypes = event.ticketTypes.filter((t) => t.id !== ticketTypeId);

					// Save event
					await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));

					ctx.log.info(`Ticket type deleted: ${ticketTypeId}`);

					return {
						success: true,
						message: "Ticket type deleted successfully",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Delete ticket type error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /eventdash/portal?email=user@example.com
		 * Get attendee's portal data: registrations, upcoming events, past events
		 *
		 * Query params:
		 *   - email: attendee email (required)
		 *
		 * Returns: { attendee: { email, name }, upcoming: EventRecord[], past: EventRecord[], registered: RegistrationRecord[] }
		 */
		portal: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email || !isValidEmail(email)) {
						return {
							error: "Valid email required",
						};
					}

					// Get all events
					const allEvents = await getAllEventsWithDates(ctx);
					const now = new Date();
					const nowTimestamp = now.getTime();

					// Split events into upcoming and past
					const upcoming: EventRecord[] = [];
					const past: EventRecord[] = [];

					for (const event of allEvents) {
						const eventTime = dateTimeToTimestamp(event.date, event.time);
						if (eventTime > nowTimestamp) {
							upcoming.push(event);
						} else {
							past.push(event);
						}
					}

					// Get attendee's registrations for this email
					const listJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(listJson, []);

					const registered: RegistrationRecord[] = [];
					const encodedEmail = emailToKvKey(email);

					for (const eventId of eventIds) {
						const regKey = `registration:${eventId}:${encodedEmail}`;
						const regJson = await ctx.kv.get<string>(regKey);
						if (regJson) {
							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (reg && reg.status === "registered") {
								registered.push(reg);
							}
						}
					}

					// Filter events to only those the attendee is registered for
					const registeredEventIds = new Set(registered.map((r) => {
						// Find event ID by looking up registrations
						return Object.keys(eventIds).find((eid) => {
							const regKey = `registration:${eid}:${encodedEmail}`;
							return registered.some((reg) => reg.email === email);
						});
					}));

					return {
						attendee: {
							email,
						},
						upcoming: upcoming.slice(0, 20), // Limit to 20 for perf
						past: past.slice(0, 20),
						registered,
						upcomingCount: upcoming.length,
						pastCount: past.length,
					};
				} catch (error) {
					ctx.log.error(`Portal error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch portal data" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /eventdash/calendar/list?month=2026-04&view=list
		 * Get events for a month as paginated list
		 *
		 * Query params:
		 *   - month: YYYY-MM format (default: current month)
		 *   - page: page number (default: 1)
		 *   - limit: results per page (default: 20, max: 100)
		 *
		 * Returns: { events: EventRecord[], total: number, page: number, pages: number }
		 */
		calendarList: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const monthStr = String(input.month ?? "").trim() || new Date().toISOString().slice(0, 7);
					const page = Math.max(1, parseInt(String(input.page ?? "1"), 10) || 1);
					const limit = Math.min(Math.max(1, parseInt(String(input.limit ?? "20"), 10) || 20), 100);

					// Parse month string (YYYY-MM)
					const [year, month] = monthStr.split("-").map(Number);
					if (!year || !month || month < 1 || month > 12) {
						return { events: [], total: 0, page: 1, pages: 0, error: "Invalid month format" };
					}

					// Get all events
					let events = await getAllEventsWithDates(ctx);

					// Filter to events in the specified month
					events = events.filter((e) => {
						const eventDate = new Date(e.date);
						return eventDate.getUTCFullYear() === year && (eventDate.getUTCMonth() + 1) === month;
					});

					const total = events.length;
					const pages = Math.ceil(total / limit);
					const start = (page - 1) * limit;
					const paged = events.slice(start, start + limit);

					return {
						events: paged,
						total,
						page,
						pages,
					};
				} catch (error) {
					ctx.log.error(`Calendar list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch calendar events" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /eventdash/calendar/month?month=2026-04
		 * Get events grouped by day for month view
		 *
		 * Query params:
		 *   - month: YYYY-MM format (default: current month)
		 *
		 * Returns: { month: string, year: number, days: { [day: string]: EventRecord[] }, total: number }
		 */
		calendarMonth: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const monthStr = String(input.month ?? "").trim() || new Date().toISOString().slice(0, 7);

					// Parse month string (YYYY-MM)
					const [year, month] = monthStr.split("-").map(Number);
					if (!year || !month || month < 1 || month > 12) {
						return { days: {}, total: 0, error: "Invalid month format" };
					}

					// Get all events
					let events = await getAllEventsWithDates(ctx);

					// Filter to events in the specified month
					events = events.filter((e) => {
						const eventDate = new Date(e.date);
						return eventDate.getUTCFullYear() === year && (eventDate.getUTCMonth() + 1) === month;
					});

					// Group by day
					const days: Record<string, EventRecord[]> = {};
					for (const event of events) {
						const date = event.date; // YYYY-MM-DD
						if (!days[date]) days[date] = [];
						days[date].push(event);
					}

					return {
						month: monthStr,
						year,
						days,
						total: events.length,
					};
				} catch (error) {
					ctx.log.error(`Calendar month error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch calendar events" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 9: GET /eventdash/events/:id/registrations
		 * Admin: List all registrations for an event
		 *
		 * Query params:
		 *   - status: filter by "registered" or "cancelled" (default: all)
		 *   - page: page number (default: 1)
		 *   - limit: results per page (default: 50, max: 100)
		 *
		 * Returns: { registrations: RegistrationRecord[], total: number, page: number, pages: number }
		 */
		registrations: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();
					const statusFilter = String(input.status ?? "");
					const page = Math.max(1, parseInt(String(input.page ?? "1"), 10) || 1);
					const limit = Math.min(Math.max(1, parseInt(String(input.limit ?? "50"), 10) || 50), 100);

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event to verify it exists
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					if (!eventJson) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get all registrations for this event
					const listJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(listJson, []);

					const allRegs: RegistrationRecord[] = [];

					// Iterate through all members to find their registrations for this event
					const membersListJson = await ctx.kv.get<string>("event-attendees:list");
					const attendeeKeys = parseJSON<string[]>(membersListJson, []);

					for (const encodedEmail of attendeeKeys) {
						const regKey = `registration:${eventId}:${encodedEmail}`;
						const regJson = await ctx.kv.get<string>(regKey);
						if (regJson) {
							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (reg) {
								// Apply status filter
								if (!statusFilter || reg.status === statusFilter) {
									allRegs.push(reg);
								}
							}
						}
					}

					// Paginate
					const total = allRegs.length;
					const pages = Math.ceil(total / limit);
					const start = (page - 1) * limit;
					const paged = allRegs.slice(start, start + limit);

					return {
						registrations: paged,
						total,
						page,
						pages,
					};
				} catch (error) {
					ctx.log.error(`Registrations list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch registrations" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 9: POST /eventdash/events/:id/registrations/export
		 * Admin: Export CSV of all registrations for an event
		 *
		 * Body: { eventId: string, status?: string }
		 *
		 * Returns: CSV string with Content-Type: text/csv
		 */
		registrationsExport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();
					const statusFilter = String(input.status ?? "");

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event to verify it exists
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get all registrations
					const membersListJson = await ctx.kv.get<string>("event-attendees:list");
					const attendeeKeys = parseJSON<string[]>(membersListJson, []);

					const registrations: RegistrationRecord[] = [];
					for (const encodedEmail of attendeeKeys) {
						const regKey = `registration:${eventId}:${encodedEmail}`;
						const regJson = await ctx.kv.get<string>(regKey);
						if (regJson) {
							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (reg && (!statusFilter || reg.status === statusFilter)) {
								registrations.push(reg);
							}
						}
					}

					// Build CSV
					const headers = ["Email", "Name", "Status", "Ticket Type", "Tickets", "Amount Paid", "Payment Status", "Registered At", "Checked In At"];
					const rows = registrations.map((r) => [
						`"${r.email.replace(/"/g, '""')}"`,
						`"${r.name.replace(/"/g, '""')}"`,
						r.status,
						r.ticketType || "",
						r.ticketCount.toString(),
						r.amountPaid ? `$${(r.amountPaid / 100).toFixed(2)}` : "",
						r.paymentStatus || "paid",
						r.createdAt,
						r.checkedInAt || "",
					]);

					const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

					return new Response(csv, {
						status: 200,
						headers: {
							"Content-Type": "text/csv",
							"Content-Disposition": `attachment; filename="event-${eventId}-registrations.csv"`,
						},
					});
				} catch (error) {
					ctx.log.error(`Registrations export error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to export registrations" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 9: POST /eventdash/events/:id/notify
		 * Admin: Send bulk email to all registrants
		 *
		 * Body: { eventId: string, subject: string, message: string }
		 *
		 * Returns: { sent: number, failed: number }
		 */
		notifyRegistrants: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();
					const subject = String(input.subject ?? "").trim();
					const message = String(input.message ?? "").trim();

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!eventId || !subject || !message) {
						throw new Response(
							JSON.stringify({ error: "Event ID, subject, and message required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get all registrations
					const membersListJson = await ctx.kv.get<string>("event-attendees:list");
					const attendeeKeys = parseJSON<string[]>(membersListJson, []);

					let sent = 0;
					let failed = 0;

					for (const encodedEmail of attendeeKeys) {
						const regKey = `registration:${eventId}:${encodedEmail}`;
						const regJson = await ctx.kv.get<string>(regKey);
						if (regJson) {
							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (reg && reg.status === "registered") {
								try {
									// Send email using Resend (or sendEmail function)
									await sendEmail({
										to: reg.email,
										subject: subject,
										html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
									});
									sent++;
								} catch (err) {
									ctx.log.error(`Failed to send email to ${reg.email}: ${String(err)}`);
									failed++;
								}
							}
						}
					}

					ctx.log.info(`Bulk email sent for event ${eventId}: ${sent} sent, ${failed} failed`);

					return { sent, failed };
				} catch (error) {
					ctx.log.error(`Notify registrants error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to send notifications" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 10: GET /eventdash/events/:id/tickets/sales
		 * Admin: Ticket sales breakdown (per type, revenue, remaining)
		 *
		 * Returns: { eventId, eventName, ticketSales: { type, sold, capacity, remaining, revenue } }
		 */
		ticketSales: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!event.ticketTypes || event.ticketTypes.length === 0) {
						return {
							eventId,
							eventName: event.title,
							ticketSales: [],
							totalRevenue: event.totalRevenue || 0,
						};
					}

					// Calculate sales per ticket type
					const ticketSales = event.ticketTypes.map((tt) => ({
						type: tt.name,
						sold: tt.sold,
						capacity: tt.capacity,
						remaining: tt.capacity - tt.sold,
						revenue: (tt.price * tt.sold) / 100, // Convert cents to dollars
						price: tt.price / 100,
					}));

					return {
						eventId,
						eventName: event.title,
						ticketSales,
						totalRevenue: (event.totalRevenue || 0) / 100,
					};
				} catch (error) {
					ctx.log.error(`Ticket sales error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch ticket sales" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 10: POST /eventdash/events/:id/tickets/transfer
		 * Admin: Transfer ticket between attendees
		 *
		 * Body: { eventId: string, fromEmail: string, toEmail: string }
		 *
		 * Returns: { success: boolean, message: string }
		 */
		ticketTransfer: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();
					const fromEmail = String(input.fromEmail ?? "").trim().toLowerCase();
					const toEmail = String(input.toEmail ?? "").trim().toLowerCase();

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!eventId || !fromEmail || !toEmail) {
						throw new Response(
							JSON.stringify({ error: "Event ID, fromEmail, and toEmail required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!isValidEmail(fromEmail) || !isValidEmail(toEmail)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email format" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get from registration
					const fromKey = `registration:${eventId}:${emailToKvKey(fromEmail)}`;
					const fromJson = await ctx.kv.get<string>(fromKey);
					const fromReg = parseJSON<RegistrationRecord>(fromJson, null);

					if (!fromReg || fromReg.status !== "registered") {
						throw new Response(
							JSON.stringify({ error: `No active registration found for ${fromEmail}` }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check if toEmail already has registration
					const toKey = `registration:${eventId}:${emailToKvKey(toEmail)}`;
					const toJson = await ctx.kv.get<string>(toKey);
					const toReg = parseJSON<RegistrationRecord>(toJson, null);

					if (toReg && toReg.status === "registered") {
						throw new Response(
							JSON.stringify({ error: `${toEmail} already has an active registration` }),
							{ status: 409, headers: { "Content-Type": "application/json" } }
						);
					}

					// Transfer: create new registration for toEmail, cancel fromEmail
					const newReg: RegistrationRecord = {
						email: toEmail,
						name: fromReg.name,
						status: "registered",
						ticketCount: fromReg.ticketCount,
						createdAt: new Date().toISOString(),
						ticketType: fromReg.ticketType,
						amountPaid: fromReg.amountPaid,
						paymentStatus: fromReg.paymentStatus,
						checkInCode: fromReg.checkInCode,
						checkedIn: false,
					};

					await ctx.kv.set(toKey, JSON.stringify(newReg));

					// Cancel original
					fromReg.status = "cancelled";
					await ctx.kv.set(fromKey, JSON.stringify(fromReg));

					ctx.log.info(`Ticket transferred: ${fromEmail} -> ${toEmail} for event ${eventId}`);

					return {
						success: true,
						message: `Ticket transferred from ${fromEmail} to ${toEmail}`,
					};
				} catch (error) {
					ctx.log.error(`Ticket transfer error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to transfer ticket" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 11: POST /eventdash/events/:id/checkin
		 * Check in attendee using QR code or confirmation code
		 *
		 * Body: { eventId: string, code: string }
		 *
		 * Returns: { success: boolean, attendeeName?: string, message: string, checkedInAt?: string }
		 */
		checkIn: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();
					const code = String(input.code ?? "").trim().toUpperCase();

					if (!eventId || !code) {
						throw new Response(
							JSON.stringify({ error: "Event ID and code required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Search for registration with matching checkInCode
					const membersListJson = await ctx.kv.get<string>("event-attendees:list");
					const attendeeKeys = parseJSON<string[]>(membersListJson, []);

					for (const encodedEmail of attendeeKeys) {
						const regKey = `registration:${eventId}:${encodedEmail}`;
						const regJson = await ctx.kv.get<string>(regKey);
						if (regJson) {
							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (reg && reg.checkInCode === code && reg.status === "registered") {
								if (reg.checkedIn) {
									return {
										success: false,
										message: `Already checked in at ${reg.checkedInAt}`,
										attendeeName: reg.name,
									};
								}

								const now = new Date().toISOString();
								reg.checkedIn = true;
								reg.checkedInAt = now;
								await ctx.kv.set(regKey, JSON.stringify(reg));

								ctx.log.info(`Checked in: ${reg.email} for event ${eventId}`);

								return {
									success: true,
									attendeeName: reg.name,
									message: `Welcome ${reg.name}!`,
									checkedInAt: now,
								};
							}
						}
					}

					return {
						success: false,
						message: "Check-in code not recognized",
					};
				} catch (error) {
					ctx.log.error(`Check-in error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to check in attendee" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 11: POST /eventdash/events/:id/checkin/manual
		 * Admin: Manual check-in by email
		 *
		 * Body: { eventId: string, email: string }
		 *
		 * Returns: { success: boolean, message: string }
		 */
		checkInManual: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();
					const email = String(input.email ?? "").trim().toLowerCase();

					// Check admin auth
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!eventId || !email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Event ID and valid email required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get registration
					const regKey = `registration:${eventId}:${emailToKvKey(email)}`;
					const regJson = await ctx.kv.get<string>(regKey);
					const reg = parseJSON<RegistrationRecord>(regJson, null);

					if (!reg || reg.status !== "registered") {
						throw new Response(
							JSON.stringify({ error: `No active registration found for ${email}` }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					if (reg.checkedIn) {
						return {
							success: false,
							message: `${email} already checked in at ${reg.checkedInAt}`,
						};
					}

					const now = new Date().toISOString();
					reg.checkedIn = true;
					reg.checkedInAt = now;
					await ctx.kv.set(regKey, JSON.stringify(reg));

					ctx.log.info(`Manual check-in: ${email} for event ${eventId}`);

					return {
						success: true,
						message: `${email} checked in successfully`,
					};
				} catch (error) {
					ctx.log.error(`Manual check-in error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to check in attendee" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 11: GET /eventdash/events/:id/checkin/stats
		 * Get check-in statistics (checked in vs total)
		 *
		 * Returns: { eventId, eventName, checkedIn: number, total: number, percentage: number }
		 */
		checkInStats: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Count check-ins
					const membersListJson = await ctx.kv.get<string>("event-attendees:list");
					const attendeeKeys = parseJSON<string[]>(membersListJson, []);

					let checkedIn = 0;
					let total = 0;

					for (const encodedEmail of attendeeKeys) {
						const regKey = `registration:${eventId}:${encodedEmail}`;
						const regJson = await ctx.kv.get<string>(regKey);
						if (regJson) {
							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (reg && reg.status === "registered") {
								total++;
								if (reg.checkedIn) {
									checkedIn++;
								}
							}
						}
					}

					const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

					return {
						eventId,
						eventName: event.title,
						checkedIn,
						total,
						percentage,
					};
				} catch (error) {
					ctx.log.error(`Check-in stats error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch check-in stats" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 12: GET /eventdash/events/:id/ical
		 * Single event iCal file (.ics format)
		 *
		 * Returns: iCalendar file with VEVENT
		 */
		eventIcal: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const eventId = String(input.id ?? "").trim();

					if (!eventId) {
						throw new Response(
							JSON.stringify({ error: "Event ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get event
					const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
					const event = parseJSON<EventRecord>(eventJson, null);
					if (!event) {
						throw new Response(
							JSON.stringify({ error: "Event not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Build iCal
					const dtStart = formatICalDate(event.date, event.time);
					const dtEnd = formatICalDate(event.date, event.endTime || event.time);
					const summary = escapeICalString(event.title);
					const description = event.description ? escapeICalString(event.description) : "";
					const location = escapeICalString(event.location);

					const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shipyard AI//EventDash//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${summary}
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:${eventId}@eventdash.shipyard.ai
DTSTAMP:${formatICalDate(new Date().toISOString().split("T")[0], new Date().toISOString().split("T")[1])}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}
LOCATION:${location}
DESCRIPTION:${description}
URL:https://events.shipyard.ai/events/${eventId}
END:VEVENT
END:VCALENDAR`;

					return new Response(ical, {
						status: 200,
						headers: {
							"Content-Type": "text/calendar",
							"Content-Disposition": `attachment; filename="event-${eventId}.ics"`,
						},
					});
				} catch (error) {
					ctx.log.error(`Event iCal error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to generate iCal" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * WAVE 3 TASK 12: GET /eventdash/calendar/ical?month=2026-04
		 * Month calendar subscription feed (iCal)
		 *
		 * Query params:
		 *   - month: YYYY-MM format (default: current month)
		 *
		 * Returns: iCalendar file with all events in the month
		 */
		calendarIcal: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const monthStr = String(input.month ?? "").trim() || new Date().toISOString().slice(0, 7);

					// Parse month string (YYYY-MM)
					const [year, month] = monthStr.split("-").map(Number);
					if (!year || !month || month < 1 || month > 12) {
						throw new Response(
							JSON.stringify({ error: "Invalid month format (use YYYY-MM)" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get all events
					let events = await getAllEventsWithDates(ctx);

					// Filter to events in the specified month
					events = events.filter((e) => {
						const eventDate = new Date(e.date);
						return eventDate.getUTCFullYear() === year && (eventDate.getUTCMonth() + 1) === month;
					});

					// Build iCal with multiple events
					const vevents = events.map((event) => {
						const dtStart = formatICalDate(event.date, event.time);
						const dtEnd = formatICalDate(event.date, event.endTime || event.time);
						const summary = escapeICalString(event.title);
						const description = event.description ? escapeICalString(event.description) : "";
						const location = escapeICalString(event.location);

						return `BEGIN:VEVENT
UID:${event.id}@eventdash.shipyard.ai
DTSTAMP:${formatICalDate(new Date().toISOString().split("T")[0], new Date().toISOString().split("T")[1])}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}
LOCATION:${location}
DESCRIPTION:${description}
URL:https://events.shipyard.ai/events/${event.id}
END:VEVENT`;
					}).join("\n");

					const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Shipyard AI//EventDash Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Events - ${monthStr}
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Events for ${monthStr}
${vevents}
END:VCALENDAR`;

					return new Response(ical, {
						status: 200,
						headers: {
							"Content-Type": "text/calendar",
							"Content-Disposition": `attachment; filename="events-${monthStr}.ics"`,
						},
					});
				} catch (error) {
					ctx.log.error(`Calendar iCal error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to generate calendar iCal" }),
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

		/**
		 * PHASE 4 WAVE 1: Task 2 - EventDash Reporting
		 * GET /eventdash/reports/performance
		 * GET /eventdash/reports/trends
		 * GET /eventdash/reports/revenue
		 */
		performanceReport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const days = Number(input.days ?? 90);

					// Get all events
					const eventsListJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(eventsListJson, []);

					const now = new Date();
					const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

					const events = [];

					for (const eventId of eventIds) {
						const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
						if (!eventJson) continue;

						const event = parseJSON<EventRecord>(eventJson, null);
						if (!event) continue;

						const eventDate = new Date(event.date);
						if (eventDate < cutoff) continue;

						// Get registrations
						const regsListJson = await ctx.kv.get<string>(`event:${eventId}:registrations`);
						const regEmails = parseJSON<string[]>(regsListJson, []);

						let registrationCount = 0;
						let checkedInCount = 0;
						let totalRevenue = 0;

						for (const encodedEmail of regEmails) {
							const regJson = await ctx.kv.get<string>(`event:${eventId}:registration:${encodedEmail}`);
							if (!regJson) continue;

							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (!reg || reg.status !== "registered") continue;

							registrationCount++;

							if (reg.checkedIn) {
								checkedInCount++;
							}

							if (reg.amountPaid) {
								totalRevenue += reg.amountPaid;
							}
						}

						const showRate = registrationCount > 0
							? Math.round((checkedInCount / registrationCount) * 10000) / 100
							: 0;
						const attendanceRate = registrationCount > 0
							? Math.round((checkedInCount / event.capacity) * 10000) / 100
							: 0;

						events.push({
							id: eventId,
							title: event.title,
							date: event.date,
							time: event.time,
							registrations: registrationCount,
							capacity: event.capacity,
							checkedIn: checkedInCount,
							showRate: `${showRate}%`,
							attendanceRate: `${attendanceRate}%`,
							revenue: totalRevenue / 100,
						});
					}

					// Sort by date descending
					events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

					return {
						events,
						total: events.length,
						period: `last ${days} days`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Performance report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		trendsReport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const days = Number(input.days ?? 30);

					// Get all events
					const eventsListJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(eventsListJson, []);

					const now = new Date();
					const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

					const registrationsByDate = new Map<string, number>();
					const registrationsByDayOfWeek = new Map<number, number>();
					const registrationsByHour = new Map<number, number>();
					const repeatAttendees = new Map<string, number>();

					for (const eventId of eventIds) {
						const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
						if (!eventJson) continue;

						const event = parseJSON<EventRecord>(eventJson, null);
						if (!event) continue;

						const eventDate = new Date(event.date);
						if (eventDate < cutoff) continue;

						// Get registrations
						const regsListJson = await ctx.kv.get<string>(`event:${eventId}:registrations`);
						const regEmails = parseJSON<string[]>(regsListJson, []);

						for (const encodedEmail of regEmails) {
							const regJson = await ctx.kv.get<string>(`event:${eventId}:registration:${encodedEmail}`);
							if (!regJson) continue;

							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (!reg || reg.status !== "registered") continue;

							// Track by created date
							const regDate = new Date(reg.createdAt);
							const dateKey = regDate.toISOString().split('T')[0];
							registrationsByDate.set(dateKey, (registrationsByDate.get(dateKey) || 0) + 1);

							// Track by day of week (0 = Sunday)
							const dayOfWeek = eventDate.getDay();
							registrationsByDayOfWeek.set(dayOfWeek, (registrationsByDayOfWeek.get(dayOfWeek) || 0) + 1);

							// Track by hour
							const [hours] = event.time.split(':').map(Number);
							registrationsByHour.set(hours, (registrationsByHour.get(hours) || 0) + 1);

							// Track repeat attendees
							repeatAttendees.set(encodedEmail, (repeatAttendees.get(encodedEmail) || 0) + 1);
						}
					}

					// Convert maps to arrays
					const registrationTrend = Array.from(registrationsByDate.entries())
						.map(([date, count]) => ({ date, registrations: count }))
						.sort((a, b) => a.date.localeCompare(b.date));

					const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
					const popularDays = Array.from(registrationsByDayOfWeek.entries())
						.map(([day, count]) => ({ day: dayOfWeekNames[day], registrations: count }))
						.sort((a, b) => b.registrations - a.registrations);

					const popularHours = Array.from(registrationsByHour.entries())
						.map(([hour, count]) => ({ hour: `${String(hour).padStart(2, '0')}:00`, registrations: count }))
						.sort((a, b) => b.registrations - a.registrations);

					const repeatAttendeeCount = Array.from(repeatAttendees.values()).filter(count => count > 1).length;

					return {
						registrationTrend,
						popularDays: popularDays.slice(0, 3),
						popularHours: popularHours.slice(0, 5),
						repeatAttendees: repeatAttendeeCount,
						totalUniqueRegistrants: repeatAttendees.size,
						period: `last ${days} days`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Trends report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		revenueReport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const days = Number(input.days ?? 90);

					// Get all events
					const eventsListJson = await ctx.kv.get<string>("events:list");
					const eventIds = parseJSON<string[]>(eventsListJson, []);

					const now = new Date();
					const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

					let totalRevenue = 0;
					const revenueByEvent = new Map<string, { title: string; revenue: number }>();
					const revenueByTicketType = new Map<string, number>();

					for (const eventId of eventIds) {
						const eventJson = await ctx.kv.get<string>(`event:${eventId}`);
						if (!eventJson) continue;

						const event = parseJSON<EventRecord>(eventJson, null);
						if (!event) continue;

						const eventDate = new Date(event.date);
						if (eventDate < cutoff) continue;

						// Get registrations
						const regsListJson = await ctx.kv.get<string>(`event:${eventId}:registrations`);
						const regEmails = parseJSON<string[]>(regsListJson, []);

						let eventRevenue = 0;

						for (const encodedEmail of regEmails) {
							const regJson = await ctx.kv.get<string>(`event:${eventId}:registration:${encodedEmail}`);
							if (!regJson) continue;

							const reg = parseJSON<RegistrationRecord>(regJson, null);
							if (!reg || reg.status !== "registered" || reg.paymentStatus !== "paid") continue;

							const amount = reg.amountPaid || 0;
							eventRevenue += amount;
							totalRevenue += amount;

							if (reg.ticketType) {
								revenueByTicketType.set(
									reg.ticketType,
									(revenueByTicketType.get(reg.ticketType) || 0) + amount
								);
							}
						}

						if (eventRevenue > 0) {
							revenueByEvent.set(eventId, {
								title: event.title,
								revenue: eventRevenue,
							});
						}
					}

					const eventRevenues = Array.from(revenueByEvent.entries())
						.map(([id, data]) => ({
							eventId: id,
							title: data.title,
							revenue: data.revenue / 100,
						}))
						.sort((a, b) => b.revenue - a.revenue);

					const ticketTypeRevenues = Array.from(revenueByTicketType.entries())
						.map(([type, revenue]) => ({
							ticketType: type,
							revenue: revenue / 100,
						}))
						.sort((a, b) => b.revenue - a.revenue);

					return {
						totalRevenue: totalRevenue / 100,
						eventRevenues,
						ticketTypeRevenues,
						averageRevenuePerEvent: eventRevenues.length > 0
							? Math.round((totalRevenue / eventRevenues.length) * 100) / 100 / 100
							: 0,
						period: `last ${days} days`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Revenue report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},
	},
});
