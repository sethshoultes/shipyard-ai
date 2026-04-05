import type { PluginDescriptor } from "emdash";

/**
 * EventDash Plugin
 *
 * Provides events & ticketing capabilities for EmDash sites.
 * Includes event management, registration tracking, iCal exports, and admin UI.
 */
export function eventDashPlugin(): PluginDescriptor {
	return {
		id: "eventdash",
		version: "0.1.0",
		format: "standard",
		entrypoint: "@shipyard/eventdash/sandbox",
		options: {},
		capabilities: ["kv:storage", "api:routes"],
		storage: {
			events: {
				indexes: ["date", "recurringId", "createdAt"],
			},
			registrations: {
				indexes: ["eventId", "email", "createdAt"],
			},
		},
	};
}
