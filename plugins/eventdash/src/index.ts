import type { PluginDescriptor } from "emdash";

export function eventdashPlugin(): PluginDescriptor {
	return {
		id: "eventdash",
		version: "1.0.0",
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
