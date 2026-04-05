import type { PluginDescriptor } from "emdash";

/**
 * EventDash plugin descriptor.
 *
 * Provides event registration, capacity management, waitlist,
 * recurring event templates, and Portable Text block for event listings.
 *
 * Storage: All data in KV
 * - Events: `event:{id}` → event data
 * - Registrations: `registration:{eventId}:{email}` → registration data
 * - Waitlist: `waitlist:{eventId}:{email}` → waitlist entry
 * - Event list: `events:list` → [id1, id2, ...] sorted by date
 * - Event templates: `event-template:{id}` → template data
 *
 * Admin UI: Block Kit pages for event management, attendee lists, check-in
 * Portable Text: "event-listing" block type for displaying upcoming events
 */
export function eventdashPlugin(): PluginDescriptor {
	return {
		id: "eventdash",
		version: "1.0.0",
		format: "standard",
		entrypoint: "@shipyard/eventdash/sandbox",
		capabilities: ["email:send"],
		options: {},
		adminPages: [
			{ path: "/events", label: "Events", icon: "calendar" },
			{ path: "/create", label: "Create Event", icon: "plus" },
		],
		adminWidgets: [
			{ id: "upcoming-events", title: "Upcoming Events", size: "half" },
		],
	};
}
