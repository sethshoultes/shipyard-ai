/**
 * Forge - A beautiful form builder plugin for EmDash CMS
 *
 * Plugin Descriptor (runs in Vite at build time)
 */
import type { PluginDescriptor } from "emdash";

export interface ForgeOptions {
	/** Default "from" email address for notifications */
	defaultFromEmail?: string;
}

/**
 * Creates the Forge plugin descriptor.
 *
 * @param options - Plugin configuration options
 * @returns PluginDescriptor for EmDash registration
 */
export function forge(options: ForgeOptions = {}): PluginDescriptor {
	return {
		id: "forge",
		version: "1.0.0",
		format: "standard",
		entrypoint: "@shipyard/forge/sandbox",
		options,

		// Capabilities needed by this plugin
		capabilities: ["email:send"],

		// Storage collections for forms and submissions (D1 backend)
		storage: {
			forms: {
				indexes: ["slug", "createdAt", "updatedAt"],
			},
			submissions: {
				indexes: ["formId", "createdAt", ["formId", "createdAt"]],
			},
		},

		// Admin UI configuration
		adminPages: [
			{ path: "/forms", label: "Forms", icon: "list" },
			{ path: "/forms/new", label: "New Form", icon: "plus" },
			{ path: "/submissions", label: "Submissions", icon: "inbox" },
		],
		adminWidgets: [
			{ id: "recent-submissions", title: "Recent Submissions", size: "half" },
			{ id: "form-stats", title: "Form Stats", size: "half" },
		],
	};
}

// Default export for convenience
export default forge;
