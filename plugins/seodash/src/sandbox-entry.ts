import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	renderSeoPagesList,
	renderSeoScoreWidget,
	renderSeoIssuesWidget,
	renderAuditReport,
} from "./admin-ui";
import type { PageSeoData, SeoIssue } from "./admin-ui";

// Re-export types for tests
export type { PageSeoData, SeoIssue };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SitemapSettings {
	defaultChangefreq: string;
	defaultPriority: number;
}

export interface RobotsSettings {
	rules: Array<{ userAgent: string; allow: string[]; disallow: string[] }>;
	sitemapUrl?: string;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Hash a URL path into a KV-safe key segment.
 * Uses a simple deterministic hash to avoid special chars in keys.
 */
export function hashPath(path: string): string {
	let hash = 0;
	const normalized = path.toLowerCase().replace(/\/+$/, "") || "/";
	for (let i = 0; i < normalized.length; i++) {
		const char = normalized.charCodeAt(i);
		hash = ((hash << 5) - hash + char) | 0;
	}
	// Convert to positive hex
	return (hash >>> 0).toString(16);
}

// ---------------------------------------------------------------------------
// SEO Audit Engine
// ---------------------------------------------------------------------------

/**
 * Audit a page's SEO data and return a list of issues.
 */
export function auditPage(data: PageSeoData): SeoIssue[] {
	const issues: SeoIssue[] = [];

	// Title checks
	if (!data.title || data.title.trim().length === 0) {
		issues.push({ type: "error", code: "title-missing", message: "Page title is empty" });
	} else {
		if (data.title.length < 30) {
			issues.push({ type: "warning", code: "title-short", message: `Title is too short (${data.title.length} chars, recommend 30-60)` });
		}
		if (data.title.length > 60) {
			issues.push({ type: "warning", code: "title-long", message: `Title is too long (${data.title.length} chars, recommend 30-60)` });
		}
	}

	// Description checks
	if (!data.description || data.description.trim().length === 0) {
		issues.push({ type: "error", code: "desc-missing", message: "Meta description is empty" });
	} else {
		if (data.description.length < 120) {
			issues.push({ type: "warning", code: "desc-short", message: `Description is too short (${data.description.length} chars, recommend 120-160)` });
		}
		if (data.description.length > 160) {
			issues.push({ type: "warning", code: "desc-long", message: `Description is too long (${data.description.length} chars, recommend 120-160)` });
		}
	}

	// OG image check
	if (!data.ogImage) {
		issues.push({ type: "warning", code: "og-image-missing", message: "No Open Graph image set" });
	}

	// Canonical URL check
	if (!data.canonicalUrl) {
		issues.push({ type: "info", code: "canonical-missing", message: "No canonical URL set" });
	}

	// Structured data check
	if (!data.structuredData) {
		issues.push({ type: "info", code: "structured-data-missing", message: "No structured data (JSON-LD) set" });
	}

	// Title contains site name suggestion
	if (data.title && !data.title.includes("|") && !data.title.includes("-") && !data.title.includes("\u2014")) {
		issues.push({ type: "info", code: "title-no-sitename", message: "Consider adding your site name to the title (e.g. 'Page Title | Site Name')" });
	}

	// Description doesn't repeat title
	if (
		data.title &&
		data.description &&
		data.title.trim().length > 0 &&
		data.description.trim().length > 0 &&
		data.description.toLowerCase().includes(data.title.toLowerCase())
	) {
		issues.push({ type: "warning", code: "desc-repeats-title", message: "Description repeats the page title" });
	}

	return issues;
}

/**
 * Compute an SEO score from 0-100 based on issues.
 * Starts at 100 and deducts: errors -15, warnings -5, info -1.
 * Minimum score is 0.
 */
export function computeSeoScore(issues: SeoIssue[]): number {
	let score = 100;
	for (const issue of issues) {
		if (issue.type === "error") score -= 15;
		else if (issue.type === "warning") score -= 5;
		else if (issue.type === "info") score -= 1;
	}
	return Math.max(0, score);
}

// ---------------------------------------------------------------------------
// KV data access helpers
// ---------------------------------------------------------------------------

async function getPageList(ctx: PluginContext): Promise<string[]> {
	const list = await ctx.kv.get<string[]>("seo:pages:list");
	return list ?? [];
}

async function setPageList(ctx: PluginContext, list: string[]): Promise<void> {
	await ctx.kv.set("seo:pages:list", list);
}

async function getPageByHash(ctx: PluginContext, hash: string): Promise<PageSeoData | null> {
	const page = await ctx.kv.get<PageSeoData>(`seo:${hash}`);
	return page ?? null;
}

async function getAllPages(ctx: PluginContext): Promise<PageSeoData[]> {
	// Denormalized storage: single KV read instead of N reads (fixes N+1 bug)
	let pages = await ctx.kv.get<PageSeoData[]>("seo:pages:all");

	// Defensive: rebuild from individual keys if list is missing/corrupted
	if (!pages || !Array.isArray(pages)) {
		ctx.log.warn("SEODash: Rebuilding denormalized page list from individual keys");
		const hashes = await getPageList(ctx);
		pages = [];
		for (const hash of hashes) {
			const page = await getPageByHash(ctx, hash);
			if (page) pages.push(page);
		}
		// Persist the rebuilt list
		await ctx.kv.set("seo:pages:all", pages);
	}

	return pages;
}

// ---------------------------------------------------------------------------
// XML Sitemap generation
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function generateSitemapXml(
	pages: PageSeoData[],
	siteUrl: string,
	settings: SitemapSettings,
): string {
	const nonIndexPages = pages.filter((p) => !p.noIndex);

	const urls = nonIndexPages.map((p) => {
		const changefreq = settings.defaultChangefreq;
		const priority = settings.defaultPriority;
		const lastmod = p.updatedAt ? p.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
		const loc = `${siteUrl.replace(/\/+$/, "")}${p.path}`;

		return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${priority}</priority>
  </url>`;
	});

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

// ---------------------------------------------------------------------------
// Robots.txt generation
// ---------------------------------------------------------------------------

function generateRobotsTxt(settings: RobotsSettings): string {
	const lines: string[] = [];

	if (settings.rules.length === 0) {
		lines.push("User-agent: *");
		lines.push("Allow: /");
		lines.push("Disallow: /admin/");
	} else {
		for (const rule of settings.rules) {
			lines.push(`User-agent: ${rule.userAgent}`);
			for (const allow of rule.allow) {
				lines.push(`Allow: ${allow}`);
			}
			for (const disallow of rule.disallow) {
				lines.push(`Disallow: ${disallow}`);
			}
			lines.push("");
		}
	}

	if (settings.sitemapUrl) {
		lines.push(`Sitemap: ${settings.sitemapUrl}`);
	}

	return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Social Preview HTML fragment
// ---------------------------------------------------------------------------

function generateSocialPreviewHtml(page: PageSeoData): string {
	const ogTitle = page.ogTitle || page.title;
	const ogDesc = page.ogDescription || page.description;
	const twTitle = page.twitterTitle || ogTitle;
	const twDesc = page.twitterDescription || ogDesc;
	const twCard = page.twitterCard || "summary";
	const ogType = page.ogType || "website";

	const escTitle = ogTitle.replace(/"/g, "&quot;");
	const escDesc = ogDesc.replace(/"/g, "&quot;");
	const escTwTitle = twTitle.replace(/"/g, "&quot;");
	const escTwDesc = twDesc.replace(/"/g, "&quot;");

	let html = "";
	html += `<meta property="og:title" content="${escTitle}" />\n`;
	html += `<meta property="og:description" content="${escDesc}" />\n`;
	html += `<meta property="og:type" content="${ogType}" />\n`;
	if (page.ogImage) {
		html += `<meta property="og:image" content="${page.ogImage.replace(/"/g, "&quot;")}" />\n`;
	}
	html += `<meta name="twitter:card" content="${twCard}" />\n`;
	html += `<meta name="twitter:title" content="${escTwTitle}" />\n`;
	html += `<meta name="twitter:description" content="${escTwDesc}" />\n`;
	if (page.twitterImage || page.ogImage) {
		const twImg = (page.twitterImage || page.ogImage || "").replace(/"/g, "&quot;");
		html += `<meta name="twitter:image" content="${twImg}" />\n`;
	}

	return html;
}

// ---------------------------------------------------------------------------
// Plugin definition
// ---------------------------------------------------------------------------

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				ctx.log.info("SEODash installed — initializing KV schema");
				await ctx.kv.set("seo:pages:list", []);  // Legacy list (for defensive rebuild)
				await ctx.kv.set("seo:pages:all", []);   // Denormalized list (fixes N+1 bug)
				await ctx.kv.set("seo:sitemap-settings", {
					defaultChangefreq: "monthly",
					defaultPriority: 0.8,
				});
				// Note: robots.txt uses static default (no KV storage needed per Decision #7)
			},
		},
	},

	routes: {
		// -----------------------------------------------------------------
		// POST /seodash/savePage
		// Create or update SEO data for a page path. Runs audit on save.
		// -----------------------------------------------------------------
		savePage: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const path = String(input.path ?? "").trim();

					if (!path) {
						throw new Error("Page path is required");
					}

					const pathHash = hashPath(path);
					const existing = await getPageByHash(ctx, pathHash);

					const page: PageSeoData = {
						id: existing?.id ?? generateId(),
						path,
						title: String(input.title ?? existing?.title ?? ""),
						description: String(input.description ?? existing?.description ?? ""),
						canonicalUrl: input.canonicalUrl !== undefined ? String(input.canonicalUrl) : existing?.canonicalUrl,
						noIndex: typeof input.noIndex === "boolean" ? input.noIndex : existing?.noIndex ?? false,
						noFollow: typeof input.noFollow === "boolean" ? input.noFollow : existing?.noFollow ?? false,
						ogTitle: input.ogTitle !== undefined ? String(input.ogTitle) : existing?.ogTitle,
						ogDescription: input.ogDescription !== undefined ? String(input.ogDescription) : existing?.ogDescription,
						ogImage: input.ogImage !== undefined ? String(input.ogImage) : existing?.ogImage,
						ogType: input.ogType !== undefined ? String(input.ogType) : existing?.ogType,
						twitterCard: input.twitterCard !== undefined
							? (String(input.twitterCard) as "summary" | "summary_large_image")
							: existing?.twitterCard,
						twitterTitle: input.twitterTitle !== undefined ? String(input.twitterTitle) : existing?.twitterTitle,
						twitterDescription: input.twitterDescription !== undefined ? String(input.twitterDescription) : existing?.twitterDescription,
						twitterImage: input.twitterImage !== undefined ? String(input.twitterImage) : existing?.twitterImage,
						structuredData: input.structuredData !== undefined ? String(input.structuredData) : existing?.structuredData,
						updatedAt: new Date().toISOString(),
					};

					// Run audit
					const issues = auditPage(page);
					page.seoScore = computeSeoScore(issues);
					page.issues = issues;

					// Store page data (individual key for backward compat)
					await ctx.kv.set(`seo:${pathHash}`, page);

					// Update page hash list (legacy, for defensive rebuild)
					const list = await getPageList(ctx);
					if (!list.includes(pathHash)) {
						list.push(pathHash);
						await setPageList(ctx, list);
					}

					// Update denormalized list for fast getAllPages() - fixes N+1 bug
					const allPages = await ctx.kv.get<PageSeoData[]>("seo:pages:all") ?? [];
					const existingIndex = allPages.findIndex(p => p.id === page.id);
					if (existingIndex >= 0) {
						allPages[existingIndex] = page;
					} else {
						allPages.push(page);
					}
					await ctx.kv.set("seo:pages:all", allPages);

					// Invalidate sitemap cache (page added/updated affects sitemap)
					await ctx.kv.delete("seo:sitemap:xml").catch(() => {});

					ctx.log.info(`SEODash: saved page ${path} (score: ${page.seoScore})`);

					return { page };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`savePage error: ${String(error)}`);
					throw new Error("Failed to save page SEO data");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/getPage
		// Get SEO data for a specific path (admin).
		// -----------------------------------------------------------------
		getPage: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const path = String(input.path ?? "").trim();

					if (!path) {
						throw new Error("Page path is required");
					}

					const pathHash = hashPath(path);
					const page = await getPageByHash(ctx, pathHash);

					if (!page) {
						throw new Error("Page not found");
					}

					return { page };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`getPage error: ${String(error)}`);
					throw new Error("Failed to fetch page SEO data");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/listPages
		// List all pages with SEO data.
		// -----------------------------------------------------------------
		listPages: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;

					// Pagination parameters (Decision #4: max 50 per view)
					const limit = Math.min(Number(input.limit || 50), 50);
					const offset = Number(input.offset || 0);

					const allPages = await getAllPages(ctx);

					// Hard limit: reject if more than 1,000 pages (Decision #4)
					if (allPages.length > 1000) {
						throw new Error("Page limit exceeded (1,000 max). Add search/filter to narrow results.");
					}

					// Sort by SEO score (worst first) - see Task 7
					allPages.sort((a, b) => (a.seoScore ?? 0) - (b.seoScore ?? 0));

					// Paginate
					const paginatedPages = allPages.slice(offset, offset + limit);
					const totalPages = allPages.length;
					const currentPage = Math.floor(offset / limit) + 1;
					const totalPagesCount = Math.ceil(totalPages / limit);

					return {
						pages: paginatedPages,
						total: totalPages,
						limit,
						offset,
						currentPage,
						totalPagesCount,
						hasMore: offset + limit < totalPages,
					};
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`listPages error: ${String(error)}`);
					throw new Error("Failed to list pages");
				}
			},
		},

		// -----------------------------------------------------------------
		// DELETE /seodash/deletePage
		// Remove SEO data for a path.
		// -----------------------------------------------------------------
		deletePage: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const path = String(input.path ?? "").trim();

					if (!path) {
						throw new Error("Page path is required");
					}

					const pathHash = hashPath(path);
					const existing = await getPageByHash(ctx, pathHash);

					if (!existing) {
						throw new Error("Page not found");
					}

					await ctx.kv.delete(`seo:${pathHash}`);

					// Remove from hash list (legacy)
					const list = await getPageList(ctx);
					const newList = list.filter((h) => h !== pathHash);
					await setPageList(ctx, newList);

					// Update denormalized list - fixes N+1 bug
					const allPages = await ctx.kv.get<PageSeoData[]>("seo:pages:all") ?? [];
					const filtered = allPages.filter(p => p.id !== existing.id);
					await ctx.kv.set("seo:pages:all", filtered);

					// Invalidate sitemap cache (page removed affects sitemap)
					await ctx.kv.delete("seo:sitemap:xml").catch(() => {});

					ctx.log.info(`SEODash: deleted page ${path}`);

					return { deleted: true, path };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`deletePage error: ${String(error)}`);
					throw new Error("Failed to delete page");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/getPagePublic
		// Public endpoint: get SEO data for rendering (used by SeoHead.astro).
		// -----------------------------------------------------------------
		getPagePublic: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const path = String(input.path ?? "").trim();

					if (!path) {
						throw new Error("Page path is required");
					}

					const pathHash = hashPath(path);
					const page = await getPageByHash(ctx, pathHash);

					if (!page) {
						throw new Error("Page not found");
					}

					// Return only public-safe fields
					return {
						page: {
							path: page.path,
							title: page.title,
							description: page.description,
							canonicalUrl: page.canonicalUrl,
							noIndex: page.noIndex,
							noFollow: page.noFollow,
							ogTitle: page.ogTitle,
							ogDescription: page.ogDescription,
							ogImage: page.ogImage,
							ogType: page.ogType,
							twitterCard: page.twitterCard,
							twitterTitle: page.twitterTitle,
							twitterDescription: page.twitterDescription,
							twitterImage: page.twitterImage,
							structuredData: page.structuredData,
						},
					};
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`getPagePublic error: ${String(error)}`);
					throw new Error("Failed to fetch page SEO data");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/auditAll
		// Run audit on all pages, return aggregate score and issues.
		// -----------------------------------------------------------------
		auditAll: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const pages = await getAllPages(ctx);

					// Re-audit each page and update stored data
					for (const page of pages) {
						const issues = auditPage(page);
						page.issues = issues;
						page.seoScore = computeSeoScore(issues);
						const pathHash = hashPath(page.path);
						await ctx.kv.set(`seo:${pathHash}`, page);
					}

					const allIssues = pages.flatMap((p) => (p.issues ?? []).map((i) => ({ ...i, path: p.path })));
					const totalScore = pages.length > 0
						? Math.round(pages.reduce((sum, p) => sum + (p.seoScore ?? 0), 0) / pages.length)
						: 100;

					return {
						averageScore: totalScore,
						totalPages: pages.length,
						totalIssues: allIssues.length,
						issues: allIssues,
						pages,
					};
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`auditAll error: ${String(error)}`);
					throw new Error("Failed to run audit");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/sitemap
		// Public endpoint: generates XML sitemap.
		// -----------------------------------------------------------------
		sitemap: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					// Check cache first
					const cached = await ctx.kv.get<string>("seo:sitemap:xml");
					if (cached) {
						return { xml: cached, contentType: "application/xml" };
					}

					// Generate fresh sitemap
					const pages = await getAllPages(ctx);
					const siteUrl = ctx.site?.url ?? "https://example.com";

					const settings = await ctx.kv.get<SitemapSettings>("seo:sitemap-settings") ?? {
						defaultChangefreq: "monthly",
						defaultPriority: 0.8,
					};

					const xml = generateSitemapXml(pages, siteUrl, settings);

					// Cache the generated XML (invalidated on page save/delete)
					await ctx.kv.set("seo:sitemap:xml", xml).catch(() => {
						// Non-critical if cache write fails
						ctx.log.warn("Failed to cache sitemap XML");
					});

					return { xml, contentType: "application/xml" };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`Sitemap error: ${String(error)}`);
					throw new Error("Failed to generate sitemap");
				}
			},
		},

		// -----------------------------------------------------------------
		// PUT /seodash/sitemapSettings
		// Admin: configure sitemap defaults.
		// -----------------------------------------------------------------
		sitemapSettings: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;

					const current = await ctx.kv.get<SitemapSettings>("seo:sitemap-settings") ?? {
						defaultChangefreq: "monthly",
						defaultPriority: 0.8,
					};

					if (typeof input.defaultChangefreq === "string") {
						current.defaultChangefreq = input.defaultChangefreq;
					}
					if (typeof input.defaultPriority === "number") {
						current.defaultPriority = input.defaultPriority;
					}

					await ctx.kv.set("seo:sitemap-settings", current);

					return { settings: current };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`sitemapSettings error: ${String(error)}`);
					throw new Error("Failed to update sitemap settings");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/robotsTxt
		// Public endpoint: returns robots.txt content.
		// -----------------------------------------------------------------
		robotsTxt: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					// Use static battle-tested default (no UI configuration in v1)
					const sitemapUrl = ctx.site?.url ? `${ctx.site.url.replace(/\/+$/, "")}/sitemap.xml` : "";
					const settings: RobotsSettings = {
						rules: [],  // Empty rules = use default: Allow all, Disallow /admin/
						sitemapUrl,
					};

					const content = generateRobotsTxt(settings);

					return { content, contentType: "text/plain" };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`robotsTxt error: ${String(error)}`);
					throw new Error("Failed to generate robots.txt");
				}
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/socialPreview
		// Public endpoint: returns OG + Twitter meta tag HTML fragment.
		// -----------------------------------------------------------------
		socialPreview: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = (rc.input ?? {}) as Record<string, unknown>;
					const path = String(input.path ?? "").trim();

					if (!path) {
						throw new Error("Page path is required");
					}

					const pathHash = hashPath(path);
					const page = await getPageByHash(ctx, pathHash);

					if (!page) {
						throw new Error("Page not found");
					}

					const html = generateSocialPreviewHtml(page);

					return { html, contentType: "text/html" };
				} catch (error) {
					if (error instanceof Error) throw error;
					ctx.log.error(`socialPreview error: ${String(error)}`);
					throw new Error("Failed to generate social preview");
				}
			},
		},

		// -----------------------------------------------------------------
		// Admin page: SEO pages list HTML
		// -----------------------------------------------------------------
		adminPagesList: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const pages = await getAllPages(ctx);
				pages.sort((a, b) => a.path.localeCompare(b.path));
				const html = renderSeoPagesList(pages);
				return { html, totalPages: pages.length };
			},
		},

		// -----------------------------------------------------------------
		// Admin widget: SEO Score
		// -----------------------------------------------------------------
		adminScoreWidget: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const pages = await getAllPages(ctx);
				const allIssues = pages.flatMap((p) => p.issues ?? []);
				const avgScore = pages.length > 0
					? Math.round(pages.reduce((sum, p) => sum + (p.seoScore ?? 0), 0) / pages.length)
					: 100;

				const html = renderSeoScoreWidget(avgScore, allIssues);
				return { html };
			},
		},

		// -----------------------------------------------------------------
		// Admin widget: SEO Issues
		// -----------------------------------------------------------------
		adminIssuesWidget: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const pages = await getAllPages(ctx);
				const allIssues = pages.flatMap((p) => (p.issues ?? []).map((i) => ({ ...i, path: p.path })));
				const html = renderSeoIssuesWidget(allIssues);
				return { html };
			},
		},

		// -----------------------------------------------------------------
		// Admin page: Audit report HTML
		// -----------------------------------------------------------------
		adminAuditReport: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const pages = await getAllPages(ctx);
				const html = renderAuditReport(pages);
				return { html };
			},
		},

		// -----------------------------------------------------------------
		// GET /seodash/health
		// Health check endpoint.
		// -----------------------------------------------------------------
		health: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const list = await getPageList(ctx);
					return {
						status: "ok",
						plugin: "seodash",
						version: "1.0.0",
						pageCount: list.length,
					};
				} catch (error) {
					ctx.log.error(`Health check error: ${String(error)}`);
					return {
						status: "degraded",
						plugin: "seodash",
						version: "1.0.0",
						error: String(error),
					};
				}
			},
		},
	},
});
