import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { PluginDescriptor } from "emdash";

/**
 * FormForge plugin descriptor.
 *
 * Dynamic form builder with pre-built templates, conditional logic,
 * spam protection (honeypot + rate limiting), webhook integration,
 * and CSV export.
 *
 * Storage: All data in KV
 * - Forms: `form:{id}` → FormDefinition
 * - Form list: `forms:list` → string[] of form IDs
 * - Submissions: `submission:{formId}:{id}` → FormSubmission
 * - Submission list: `submissions:{formId}:list` → string[] of submission IDs
 * - Rate limits: `rate-limit:{formId}:{ip}` → number (TTL 15min)
 * - Settings: `settings:formforge` → global config
 *
 * Admin UI: Form list, submission inbox
 * Templates: contact, booking, feedback, quote-request
 */
export function formforgePlugin(): PluginDescriptor {
	// NOTE: Use real file path instead of npm alias (@shipyard/formforge/sandbox)
	// The alias works in local dev via node_modules but fails in Cloudflare Workers
	// which only has access to bundled code. Bundler resolves absolute paths correctly.
	const currentDir = dirname(fileURLToPath(import.meta.url));
	const entrypointPath = join(currentDir, "sandbox-entry.ts");

	return {
		id: "formforge",
		version: "1.0.0",
		format: "standard",
		entrypoint: entrypointPath,
		capabilities: ["email:send"],
		options: {},
		adminPages: [
			{ path: "/forms", label: "Forms", icon: "list" },
			{ path: "/submissions", label: "Submissions", icon: "inbox" },
		],
		adminWidgets: [
			{ id: "form-activity", title: "Form Activity", size: "half" },
		],
	};
}
