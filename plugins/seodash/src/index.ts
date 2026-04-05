import type { PluginDescriptor } from "emdash";

/**
 * SEODash plugin descriptor.
 *
 * Provides SEO management for EmDash CMS: page-level meta tags, XML sitemaps,
 * robots.txt management, social preview generation, and automated SEO auditing.
 *
 * Storage: All data in KV
 * - Page SEO: `seo:{path-hash}` -> PageSeoData
 * - Page list: `seo:pages:list` -> string[] of path hashes
 * - Sitemap settings: `seo:sitemap-settings` -> SitemapSettings
 * - Robots settings: `seo:robots-settings` -> RobotsSettings
 *
 * Admin UI: SEO pages list, sitemap config, audit report, settings
 * Astro: SeoHead for meta tag injection, SocialPreview for OG/Twitter previews
 */
export function seodashPlugin(): PluginDescriptor {
	return {
		id: "seodash",
		version: "1.0.0",
		format: "standard",
		entrypoint: "@shipyard/seodash/sandbox",
		capabilities: [],
		options: {},
		adminPages: [
			{ path: "/pages", label: "SEO Pages", icon: "search" },
			{ path: "/sitemap", label: "Sitemap", icon: "map" },
			{ path: "/audit", label: "SEO Audit", icon: "check-circle" },
			{ path: "/settings", label: "Settings", icon: "settings" },
		],
		adminWidgets: [
			{ id: "seo-score", title: "SEO Score", size: "third" },
			{ id: "seo-issues", title: "SEO Issues", size: "half" },
		],
	};
}
