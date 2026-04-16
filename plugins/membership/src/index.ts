import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
	// Resolve the actual file path to sandbox-entry relative to this file
	// This ensures the entrypoint works both in local dev and in Cloudflare Workers
	const currentDir = dirname(fileURLToPath(import.meta.url));
	const entrypointPath = join(currentDir, "sandbox-entry.ts");

	return {
		id: "membership",
		version: "1.0.0",
		format: "standard",
		// NOTE: Use real file path instead of npm alias (@shipyard/membership/sandbox)
		// The alias works in local dev via node_modules but fails in Cloudflare Workers
		// which only has access to bundled code. Bundler resolves absolute paths correctly.
		entrypoint: entrypointPath,
		capabilities: ["email:send"],
		options: {},
		adminPages: [
			{ path: "/members", label: "Members", icon: "users" },
			{ path: "/plans", label: "Plans", icon: "settings" },
			{ path: "/reporting", label: "Reporting", icon: "chart" },
		],
		adminWidgets: [
			{ id: "active-members", title: "Active Members", size: "third" },
			{ id: "total-revenue", title: "Total Revenue (MRR)", size: "third" },
		],
	};
}
