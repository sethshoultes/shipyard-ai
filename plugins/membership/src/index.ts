import type { PluginDescriptor } from "emdash";

export function membershipPlugin(): PluginDescriptor {
	return {
		id: "membership",
		version: "0.1.0",
		format: "standard",
		entrypoint: "@shipyard/membership/sandbox",
		options: {},
		capabilities: [],
		storage: {
			members: {
				indexes: ["email", "status", "created"],
			},
		},
		adminPages: [{ path: "/members", label: "Members", icon: "users" }],
		adminWidgets: [{ id: "members-count", title: "Active Members", size: "third" }],
	};
}
