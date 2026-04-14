/**
 * SEODash sandbox-entry tests.
 *
 * Covers: Page CRUD, SEO audit, score computation, sitemap, robots.txt,
 * social preview, admin UI, public endpoints, edge cases.
 * 30+ tests as required by spec.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	createMockKV,
	createMockContext,
	buildRouteCtx,
	createTestPageSeo,
	seedPage,
	seedPages,
} from "./helpers";
import type { MockKV } from "./helpers";

// ---------------------------------------------------------------------------
// Mock emdash module
// ---------------------------------------------------------------------------
vi.mock("emdash", () => ({
	definePlugin: (config: unknown) => config,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let plugin: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let auditPage: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let computeSeoScore: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let hashPath: any;

beforeEach(async () => {
	vi.resetModules();
	vi.mock("emdash", () => ({
		definePlugin: (config: unknown) => config,
	}));
	const mod = await import("../sandbox-entry");
	plugin = mod.default;
	auditPage = mod.auditPage;
	computeSeoScore = mod.computeSeoScore;
	hashPath = mod.hashPath;
});

// ---------------------------------------------------------------------------
// Page CRUD
// ---------------------------------------------------------------------------
describe("Page CRUD", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should create a new page with SEO data", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				path: "/about",
				title: "About Us - Test Site | Our Story",
				description: "Learn about Test Site, our mission, values, and the team behind our products. We have been serving customers since 2020 with quality and care.",
				ogImage: "https://example.com/og.jpg",
			},
			user: { isAdmin: true },
		});

		const result = await plugin.routes.savePage.handler(routeCtx, ctx);

		expect(result.page).toBeTruthy();
		expect(result.page.path).toBe("/about");
		expect(result.page.title).toBe("About Us - Test Site | Our Story");
		expect(result.page.seoScore).toBeDefined();
		expect(typeof result.page.seoScore).toBe("number");
	});

	it("should read an existing page", async () => {
		const page = createTestPageSeo({ path: "/services" });
		await seedPage(kv, page);

		const routeCtx = buildRouteCtx({
			input: { path: "/services" },
			user: { isAdmin: true },
		});

		const result = await plugin.routes.getPage.handler(routeCtx, ctx);

		expect(result.page).toBeTruthy();
		expect(result.page.path).toBe("/services");
	});

	it("should update an existing page", async () => {
		// Create first
		const createCtx = buildRouteCtx({
			input: {
				path: "/about",
				title: "Original Title for Testing Page",
				description: "Original description for the about page that is long enough to pass validation checks for minimum length.",
			},
			user: { isAdmin: true },
		});
		await plugin.routes.savePage.handler(createCtx, ctx);

		// Update
		const updateCtx = buildRouteCtx({
			input: {
				path: "/about",
				title: "Updated Title for Testing Page",
			},
			user: { isAdmin: true },
		});
		const result = await plugin.routes.savePage.handler(updateCtx, ctx);

		expect(result.page.title).toBe("Updated Title for Testing Page");
	});

	it("should delete a page", async () => {
		const page = createTestPageSeo({ path: "/delete-me" });
		await seedPage(kv, page);

		const routeCtx = buildRouteCtx({
			input: { path: "/delete-me" },
			user: { isAdmin: true },
		});

		const result = await plugin.routes.deletePage.handler(routeCtx, ctx);

		expect(result.deleted).toBe(true);

		// Verify it's gone
		const getCtx = buildRouteCtx({
			input: { path: "/delete-me" },
			user: { isAdmin: true },
		});
		await expect(plugin.routes.getPage.handler(getCtx, ctx)).rejects.toBeInstanceOf(Response);
	});

	it("should list all pages with scores", async () => {
		await seedPages(kv, [
			createTestPageSeo({ path: "/about", seoScore: 85 }),
			createTestPageSeo({ path: "/services", seoScore: 70 }),
			createTestPageSeo({ path: "/contact", seoScore: 90 }),
		]);

		const routeCtx = buildRouteCtx({ user: { isAdmin: true } });
		const result = await plugin.routes.listPages.handler(routeCtx, ctx);

		expect(result.pages).toHaveLength(3);
		expect(result.total).toBe(3);
		// Sorted alphabetically by path
		expect(result.pages[0].path).toBe("/about");
		expect(result.pages[1].path).toBe("/contact");
		expect(result.pages[2].path).toBe("/services");
	});
});

// ---------------------------------------------------------------------------
// SEO Audit
// ---------------------------------------------------------------------------
describe("SEO Audit", () => {
	it("should flag empty title as error", () => {
		const page = createTestPageSeo({ title: "" });
		const issues = auditPage(page);

		const titleIssue = issues.find((i: { code: string }) => i.code === "title-missing");
		expect(titleIssue).toBeTruthy();
		expect(titleIssue.type).toBe("error");
	});

	it("should warn on short title", () => {
		const page = createTestPageSeo({ title: "Short" });
		const issues = auditPage(page);

		const titleIssue = issues.find((i: { code: string }) => i.code === "title-short");
		expect(titleIssue).toBeTruthy();
		expect(titleIssue.type).toBe("warning");
	});

	it("should warn on long title", () => {
		const page = createTestPageSeo({ title: "A".repeat(65) });
		const issues = auditPage(page);

		const titleIssue = issues.find((i: { code: string }) => i.code === "title-long");
		expect(titleIssue).toBeTruthy();
		expect(titleIssue.type).toBe("warning");
	});

	it("should flag empty description as error", () => {
		const page = createTestPageSeo({ description: "" });
		const issues = auditPage(page);

		const descIssue = issues.find((i: { code: string }) => i.code === "desc-missing");
		expect(descIssue).toBeTruthy();
		expect(descIssue.type).toBe("error");
	});

	it("should warn on short description", () => {
		const page = createTestPageSeo({ description: "Too short description" });
		const issues = auditPage(page);

		const descIssue = issues.find((i: { code: string }) => i.code === "desc-short");
		expect(descIssue).toBeTruthy();
		expect(descIssue.type).toBe("warning");
	});

	it("should warn on missing OG image", () => {
		const page = createTestPageSeo({ ogImage: undefined });
		const issues = auditPage(page);

		const ogIssue = issues.find((i: { code: string }) => i.code === "og-image-missing");
		expect(ogIssue).toBeTruthy();
		expect(ogIssue.type).toBe("warning");
	});

	it("should info on missing canonical URL", () => {
		const page = createTestPageSeo({ canonicalUrl: undefined });
		const issues = auditPage(page);

		const canonIssue = issues.find((i: { code: string }) => i.code === "canonical-missing");
		expect(canonIssue).toBeTruthy();
		expect(canonIssue.type).toBe("info");
	});

	it("should warn when description repeats title", () => {
		const page = createTestPageSeo({
			title: "About Us",
			description: "This page is About Us and our team, learn more about our history and values here.",
		});
		const issues = auditPage(page);

		const repeatIssue = issues.find((i: { code: string }) => i.code === "desc-repeats-title");
		expect(repeatIssue).toBeTruthy();
		expect(repeatIssue.type).toBe("warning");
	});

});

// ---------------------------------------------------------------------------
// SEO Score Computation
// ---------------------------------------------------------------------------
describe("computeSeoScore", () => {
	it("should return 100 for a perfect page with no issues", () => {
		const score = computeSeoScore([]);
		expect(score).toBe(100);
	});

	it("should deduct correctly for errors and warnings", () => {
		const issues = [
			{ type: "error" as const, code: "title-missing", message: "Title missing" },
			{ type: "warning" as const, code: "desc-short", message: "Desc short" },
			{ type: "info" as const, code: "canonical-missing", message: "No canonical" },
		];
		const score = computeSeoScore(issues);
		// 100 - 15 (error) - 5 (warning) - 1 (info) = 79
		expect(score).toBe(79);
	});

	it("should floor at 0 for many errors", () => {
		const issues = Array.from({ length: 10 }, (_, i) => ({
			type: "error" as const,
			code: `error-${i}`,
			message: `Error ${i}`,
		}));
		const score = computeSeoScore(issues);
		// 100 - (10 * 15) = -50 → 0
		expect(score).toBe(0);
	});
});

// ---------------------------------------------------------------------------
// Sitemap Generation
// ---------------------------------------------------------------------------
describe("Sitemap", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should include non-noindex pages in sitemap", async () => {
		await seedPages(kv, [
			createTestPageSeo({ path: "/about", noIndex: false }),
			createTestPageSeo({ path: "/services", noIndex: false }),
		]);

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.sitemap.handler(routeCtx, ctx);

		expect(result.xml).toContain("<urlset");
		expect(result.xml).toContain("/about");
		expect(result.xml).toContain("/services");
	});

	it("should exclude noindex pages from sitemap", async () => {
		await seedPages(kv, [
			createTestPageSeo({ path: "/about", noIndex: false }),
			createTestPageSeo({ path: "/private", noIndex: true }),
		]);

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.sitemap.handler(routeCtx, ctx);

		expect(result.xml).toContain("/about");
		expect(result.xml).not.toContain("/private");
	});

	it("should generate valid XML structure", async () => {
		await seedPage(kv, createTestPageSeo({ path: "/about", noIndex: false }));

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.sitemap.handler(routeCtx, ctx);

		expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
		expect(result.xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(result.xml).toContain("<loc>");
		expect(result.xml).toContain("<lastmod>");
		expect(result.xml).toContain("<changefreq>");
		expect(result.xml).toContain("<priority>");
		expect(result.xml).toContain("</urlset>");
	});
});

// ---------------------------------------------------------------------------
// Robots.txt
// ---------------------------------------------------------------------------
describe("Robots.txt", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should return default robots.txt content", async () => {
		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.robotsTxt.handler(routeCtx, ctx);

		expect(result.content).toContain("User-agent: *");
		expect(result.content).toContain("Allow: /");
		expect(result.content).toContain("Disallow: /admin/");
	});

	it("should include custom rules", async () => {
		await kv.set(
			"seo:robots-settings",
			JSON.stringify({
				rules: [
					{ userAgent: "Googlebot", allow: ["/"], disallow: ["/private/"] },
				],
				sitemapUrl: "https://test.example.com/sitemap.xml",
			}),
		);

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.robotsTxt.handler(routeCtx, ctx);

		expect(result.content).toContain("User-agent: Googlebot");
		expect(result.content).toContain("Disallow: /private/");
	});

	it("should include sitemap URL", async () => {
		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.robotsTxt.handler(routeCtx, ctx);

		expect(result.content).toContain("Sitemap:");
		expect(result.content).toContain("sitemap.xml");
	});
});

// ---------------------------------------------------------------------------
// Social Preview
// ---------------------------------------------------------------------------
describe("Social Preview", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should generate OG tags", async () => {
		await seedPage(kv, createTestPageSeo({
			path: "/about",
			ogTitle: "About Our Company",
			ogDescription: "We are a great company",
			ogImage: "https://example.com/og.jpg",
		}));

		const routeCtx = buildRouteCtx({ input: { path: "/about" } });
		const result = await plugin.routes.socialPreview.handler(routeCtx, ctx);

		expect(result.html).toContain('property="og:title"');
		expect(result.html).toContain("About Our Company");
		expect(result.html).toContain('property="og:description"');
		expect(result.html).toContain('property="og:image"');
	});

	it("should generate Twitter tags", async () => {
		await seedPage(kv, createTestPageSeo({
			path: "/about",
			twitterCard: "summary_large_image",
			twitterTitle: "About Us on Twitter",
		}));

		const routeCtx = buildRouteCtx({ input: { path: "/about" } });
		const result = await plugin.routes.socialPreview.handler(routeCtx, ctx);

		expect(result.html).toContain('name="twitter:card"');
		expect(result.html).toContain("summary_large_image");
		expect(result.html).toContain('name="twitter:title"');
		expect(result.html).toContain("About Us on Twitter");
	});

	it("should fall back to title/description when OG/Twitter fields are empty", async () => {
		await seedPage(kv, createTestPageSeo({
			path: "/about",
			title: "Fallback Title Here",
			description: "Fallback description text",
			ogTitle: undefined,
			ogDescription: undefined,
			twitterTitle: undefined,
			twitterDescription: undefined,
		}));

		const routeCtx = buildRouteCtx({ input: { path: "/about" } });
		const result = await plugin.routes.socialPreview.handler(routeCtx, ctx);

		expect(result.html).toContain("Fallback Title Here");
		expect(result.html).toContain("Fallback description text");
	});
});

// ---------------------------------------------------------------------------
// Public getPage
// ---------------------------------------------------------------------------
describe("getPagePublic", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should return data for a valid path", async () => {
		await seedPage(kv, createTestPageSeo({ path: "/about" }));

		const routeCtx = buildRouteCtx({ input: { path: "/about" } });
		const result = await plugin.routes.getPagePublic.handler(routeCtx, ctx);

		expect(result.page).toBeTruthy();
		expect(result.page.path).toBe("/about");
		// Should not include internal fields
		expect(result.page.seoScore).toBeUndefined();
		expect(result.page.issues).toBeUndefined();
		expect(result.page.id).toBeUndefined();
	});

	it("should return 404 for unknown path", async () => {
		const routeCtx = buildRouteCtx({ input: { path: "/nonexistent" } });

		await expect(
			plugin.routes.getPagePublic.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);
	});
});

// ---------------------------------------------------------------------------
// Admin UI HTML rendering
// ---------------------------------------------------------------------------
describe("Admin UI", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should render pages list HTML", async () => {
		await seedPages(kv, [
			createTestPageSeo({ path: "/about", seoScore: 85 }),
			createTestPageSeo({ path: "/services", seoScore: 70 }),
		]);

		const routeCtx = buildRouteCtx({ user: { isAdmin: true } });
		const result = await plugin.routes.adminPagesList.handler(routeCtx, ctx);

		expect(result.html).toContain("SEO Pages");
		expect(result.html).toContain("/about");
		expect(result.html).toContain("/services");
		expect(result.totalPages).toBe(2);
	});

	it("should render score widget HTML", async () => {
		await seedPage(kv, createTestPageSeo({ path: "/about", seoScore: 85, issues: [] }));

		const routeCtx = buildRouteCtx({ user: { isAdmin: true } });
		const result = await plugin.routes.adminScoreWidget.handler(routeCtx, ctx);

		expect(result.html).toContain("SEO Score");
		expect(result.html).toContain("seodash");
	});
});

// ---------------------------------------------------------------------------
// Audit All
// ---------------------------------------------------------------------------
describe("auditAll route", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(async () => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should audit all pages and return aggregate results", async () => {
		await seedPages(kv, [
			createTestPageSeo({ path: "/about" }),
			createTestPageSeo({ path: "/services", title: "", description: "" }),
		]);

		const routeCtx = buildRouteCtx({ user: { isAdmin: true } });
		const result = await plugin.routes.auditAll.handler(routeCtx, ctx);

		expect(result.totalPages).toBe(2);
		expect(typeof result.averageScore).toBe("number");
		expect(result.issues.length).toBeGreaterThan(0);
	});
});

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------
describe("Edge cases", () => {
	let kv: MockKV;
	let ctx: ReturnType<typeof createMockContext>;

	beforeEach(() => {
		kv = createMockKV();
		ctx = createMockContext(kv);
	});

	it("should handle empty title in page creation", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				path: "/empty-title",
				title: "",
				description: "Some description that is long enough to pass the minimum length validation for SEO audit purposes here.",
			},
			user: { isAdmin: true },
		});

		const result = await plugin.routes.savePage.handler(routeCtx, ctx);

		expect(result.page.title).toBe("");
		const hasError = result.page.issues.some(
			(i: { code: string }) => i.code === "title-missing",
		);
		expect(hasError).toBe(true);
	});

	it("should handle very long description", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				path: "/long-desc",
				title: "A Normal Page Title for Testing Purposes",
				description: "A".repeat(200),
			},
			user: { isAdmin: true },
		});

		const result = await plugin.routes.savePage.handler(routeCtx, ctx);

		const hasWarning = result.page.issues.some(
			(i: { code: string }) => i.code === "desc-long",
		);
		expect(hasWarning).toBe(true);
	});

	it("should handle special characters in path", async () => {
		const routeCtx = buildRouteCtx({
			input: {
				path: "/services/web-design & development",
				title: "Web Design & Development Services from Our Team",
				description: "Professional web design and development services for businesses of all sizes with modern responsive techniques.",
			},
			user: { isAdmin: true },
		});

		const result = await plugin.routes.savePage.handler(routeCtx, ctx);

		expect(result.page.path).toBe("/services/web-design & development");
	});

	it("should handle duplicate path saves (upsert behavior)", async () => {
		const save1 = buildRouteCtx({
			input: {
				path: "/about",
				title: "First Title for the About Page Test",
				description: "First description for the about page with enough characters to pass the minimum length check.",
			},
			user: { isAdmin: true },
		});
		await plugin.routes.savePage.handler(save1, ctx);

		const save2 = buildRouteCtx({
			input: {
				path: "/about",
				title: "Second Title for the About Page Test",
				description: "Second description for the about page with enough characters to pass the minimum length check.",
			},
			user: { isAdmin: true },
		});
		await plugin.routes.savePage.handler(save2, ctx);

		// Should only have 1 entry in list
		const listCtx = buildRouteCtx({ user: { isAdmin: true } });
		const result = await plugin.routes.listPages.handler(listCtx, ctx);
		expect(result.pages).toHaveLength(1);
		expect(result.pages[0].title).toBe("Second Title for the About Page Test");
	});

	it("should reject non-admin for admin routes", async () => {
		const routeCtx = buildRouteCtx({
			input: { path: "/about" },
			user: { isAdmin: false },
		});

		await expect(
			plugin.routes.savePage.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);

		await expect(
			plugin.routes.getPage.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);

		await expect(
			plugin.routes.deletePage.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);

		await expect(
			plugin.routes.listPages.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);
	});

	it("should return 404 when deleting nonexistent page", async () => {
		const routeCtx = buildRouteCtx({
			input: { path: "/ghost" },
			user: { isAdmin: true },
		});

		await expect(
			plugin.routes.deletePage.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);
	});

	it("should handle empty KV gracefully in list route", async () => {
		const routeCtx = buildRouteCtx({ user: { isAdmin: true } });
		const result = await plugin.routes.listPages.handler(routeCtx, ctx);

		expect(result.pages).toHaveLength(0);
		expect(result.total).toBe(0);
	});

	it("should return 400 when path is missing", async () => {
		const routeCtx = buildRouteCtx({
			input: {},
			user: { isAdmin: true },
		});

		await expect(
			plugin.routes.savePage.handler(routeCtx, ctx),
		).rejects.toBeInstanceOf(Response);
	});
});

// ---------------------------------------------------------------------------
// Plugin Install Hook
// ---------------------------------------------------------------------------
describe("plugin:install hook", () => {
	it("should initialize KV schema on install", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		await plugin.hooks["plugin:install"].handler({}, ctx);

		const list = kv._store.get("seo:pages:list");
		expect(list).toBe(JSON.stringify([]));

		const sitemapSettings = JSON.parse(kv._store.get("seo:sitemap-settings")!);
		expect(sitemapSettings.defaultChangefreq).toBe("monthly");

		const robotsSettings = JSON.parse(kv._store.get("seo:robots-settings")!);
		expect(robotsSettings.rules).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// Health Route
// ---------------------------------------------------------------------------
describe("health route", () => {
	it("should return ok status", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);
		await kv.set("seo:pages:list", JSON.stringify(["a", "b"]));

		const routeCtx = buildRouteCtx({});
		const result = await plugin.routes.health.handler(routeCtx, ctx);

		expect(result.status).toBe("ok");
		expect(result.plugin).toBe("seodash");
		expect(result.pageCount).toBe(2);
	});
});

// ---------------------------------------------------------------------------
// Sitemap Settings
// ---------------------------------------------------------------------------
describe("sitemapSettings route", () => {
	it("should update sitemap settings", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		const routeCtx = buildRouteCtx({
			input: {
				defaultChangefreq: "weekly",
				defaultPriority: 0.9,
			},
			user: { isAdmin: true },
		});

		const result = await plugin.routes.sitemapSettings.handler(routeCtx, ctx);

		expect(result.settings.defaultChangefreq).toBe("weekly");
		expect(result.settings.defaultPriority).toBe(0.9);
	});
});

// ---------------------------------------------------------------------------
// Robots Settings
// ---------------------------------------------------------------------------
describe("robotsSettings route", () => {
	it("should update robots settings", async () => {
		const kv = createMockKV();
		const ctx = createMockContext(kv);

		const routeCtx = buildRouteCtx({
			input: {
				rules: [
					{ userAgent: "Googlebot", allow: ["/"], disallow: ["/admin/"] },
				],
				sitemapUrl: "https://example.com/sitemap.xml",
			},
			user: { isAdmin: true },
		});

		const result = await plugin.routes.robotsSettings.handler(routeCtx, ctx);

		expect(result.settings.rules).toHaveLength(1);
		expect(result.settings.sitemapUrl).toBe("https://example.com/sitemap.xml");
	});
});

// ---------------------------------------------------------------------------
// hashPath utility
// ---------------------------------------------------------------------------
describe("hashPath", () => {
	it("should produce consistent hashes for the same path", () => {
		const h1 = hashPath("/about");
		const h2 = hashPath("/about");
		expect(h1).toBe(h2);
	});

	it("should produce different hashes for different paths", () => {
		const h1 = hashPath("/about");
		const h2 = hashPath("/services");
		expect(h1).not.toBe(h2);
	});
});
