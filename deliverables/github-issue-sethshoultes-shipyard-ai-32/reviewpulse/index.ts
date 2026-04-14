import type { PluginDescriptor } from "emdash";

/**
 * ReviewPulse plugin descriptor.
 *
 * Provides review aggregation from Google Places, cached display widgets,
 * admin dashboard with review management, and themed site widgets.
 *
 * Storage: All data in KV
 * - Reviews: `review:{sourceId}` -> review record
 * - Review list: `reviews:list` -> [sourceId1, sourceId2, ...] sorted by date
 * - Stats cache: `reviews:stats` -> aggregate stats
 * - Sync cursor: `reviews:sync-cursor` -> last sync timestamp
 * - Settings: `settings:*` -> plugin configuration
 *
 * Admin UI: Review list with filters, settings page, analytics dashboard
 * Astro: ReviewWidget for displaying ratings on site pages
 */
export function reviewpulsePlugin(): PluginDescriptor {
	return {
		id: "reviewpulse",
		version: "1.0.0",
		format: "standard",
		entrypoint: "@shipyard/reviewpulse/sandbox",
		capabilities: ["email:send"],
		options: {},
		adminPages: [
			{ path: "/reviews", label: "Reviews", icon: "star" },
			{ path: "/settings", label: "Settings", icon: "settings" },
			{ path: "/analytics", label: "Analytics", icon: "chart" },
		],
		adminWidgets: [
			{ id: "avg-rating", title: "Average Rating", size: "third" },
			{ id: "review-count", title: "Total Reviews", size: "third" },
			{ id: "recent-reviews", title: "Recent Reviews", size: "half" },
		],
	};
}
