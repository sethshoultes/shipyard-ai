/**
 * ReviewPulse Utility Functions
 *
 * Shared helper functions for the ReviewPulse v1 MVP plugin.
 * Includes date formatting, HTML escaping, and ID generation.
 */

/**
 * Generate a unique ID for new records.
 */
export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Escape HTML entities to prevent XSS.
 */
export function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Escape HTML for use in attributes (double quotes).
 */
export function escapeAttr(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/**
 * Format a date string for display.
 */
export function formatDate(iso: string): string {
	try {
		const d = new Date(iso);
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return iso;
	}
}

/**
 * Truncate text to a maximum length, breaking at word boundaries.
 */
export function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	const cut = text.slice(0, max);
	const lastSpace = cut.lastIndexOf(" ");
	return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + "\u2026";
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Parse an integer from input with a default fallback.
 */
export function parseIntOr(value: unknown, defaultValue: number): number {
	const parsed = parseInt(String(value ?? ""), 10);
	return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Calculate time ago in human-readable format.
 */
export function timeAgo(dateStr: string): string {
	const now = Date.now();
	const date = new Date(dateStr).getTime();
	const diff = now - date;

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 30) {
		return formatDate(dateStr);
	} else if (days > 0) {
		return `${days} day${days === 1 ? "" : "s"} ago`;
	} else if (hours > 0) {
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	} else if (minutes > 0) {
		return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	} else {
		return "just now";
	}
}
