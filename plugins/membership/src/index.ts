import type { PluginDescriptor } from "emdash";

/**
 * Membership plugin descriptor.
 *
 * Provides email-based membership gating, plan management,
 * and Stripe Payment Link integration.
 *
 * Storage: All data in KV (members, plans, settings)
 * Admin UI: Member list, plan editor, approve/revoke controls
 * Portable Text: "gated-content" block type for content gating
 */
export function membershipPlugin(): PluginDescriptor {
	return {
		id: "membership",
		version: "1.0.0",
		format: "standard",
		entrypoint: "@shipyard/membership/sandbox",
		capabilities: ["email:send"],
		options: {},
		adminPages: [
			{ path: "/members", label: "Members", icon: "users" },
			{ path: "/plans", label: "Plans", icon: "settings" },
		],
		adminWidgets: [
			{ id: "active-members", title: "Active Members", size: "third" },
			{ id: "total-revenue", title: "Total Revenue (MRR)", size: "third" },
		],
	};
}
