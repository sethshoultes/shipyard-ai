/**
 * Test helpers: mock PluginContext, KV store, and page factories for SEODash.
 */
import { vi } from "vitest";
import type { PageSeoData } from "../admin-ui";

/**
 * In-memory KV store for testing.
 * Simulates ctx.kv with get/set/delete/list.
 */
export interface MockKV {
	_store: Map<string, string>;
	get: <T>(key: string) => Promise<T | null>;
	set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<void>;
	delete: (key: string) => Promise<boolean>;
	list: (prefix?: string) => Promise<Array<{ key: string; value: unknown }>>;
}

export function createMockKV(): MockKV {
	const store = new Map<string, string>();

	return {
		_store: store,
		get: vi.fn(async <T>(key: string): Promise<T | null> => {
			const val = store.get(key);
			return val !== undefined ? (val as unknown as T) : null;
		}),
		set: vi.fn(async (key: string, value: unknown, _opts?: { ex?: number }): Promise<void> => {
			store.set(key, typeof value === "string" ? value : JSON.stringify(value));
		}),
		delete: vi.fn(async (key: string): Promise<boolean> => {
			return store.delete(key);
		}),
		list: vi.fn(async (prefix?: string): Promise<Array<{ key: string; value: unknown }>> => {
			const results: Array<{ key: string; value: unknown }> = [];
			for (const [k, v] of store.entries()) {
				if (!prefix || k.startsWith(prefix)) {
					results.push({ key: k, value: v });
				}
			}
			return results;
		}),
	};
}

/**
 * Create a mock PluginContext for testing.
 */
export function createMockContext(kvOverride?: MockKV) {
	const kv = kvOverride ?? createMockKV();

	return {
		kv,
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		},
		plugin: { id: "seodash", version: "1.0.0" },
		site: { url: "https://test.example.com", name: "Test Site" },
		url: (path: string) => `https://test.example.com${path}`,
		env: {},
	};
}

/**
 * Build a routeCtx object matching what the sandbox routes expect.
 */
export function buildRouteCtx(opts: {
	input?: Record<string, unknown>;
	pathParams?: Record<string, string>;
	user?: { isAdmin?: boolean; email?: string };
}) {
	return {
		input: opts.input ?? {},
		pathParams: opts.pathParams,
		user: opts.user,
	};
}

/**
 * Create a standard PageSeoData record for testing.
 */
export function createTestPageSeo(overrides?: Partial<PageSeoData>): PageSeoData {
	const has = (key: string) => overrides != null && key in overrides;
	return {
		id: overrides?.id ?? `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		path: overrides?.path ?? "/about",
		title: has("title") ? (overrides!.title as string) : "About Us - Test Site | Our Story",
		description: has("description") ? (overrides!.description as string) : "Learn about Test Site, our mission, values, and the team behind our products. We have been serving customers since 2020 with quality and care.",
		canonicalUrl: has("canonicalUrl") ? overrides!.canonicalUrl : "https://test.example.com/about",
		noIndex: overrides?.noIndex ?? false,
		noFollow: overrides?.noFollow ?? false,
		ogTitle: has("ogTitle") ? overrides!.ogTitle : undefined,
		ogDescription: has("ogDescription") ? overrides!.ogDescription : undefined,
		ogImage: has("ogImage") ? overrides!.ogImage : "https://test.example.com/images/og-about.jpg",
		ogType: overrides?.ogType ?? "website",
		twitterCard: overrides?.twitterCard ?? "summary_large_image",
		twitterTitle: has("twitterTitle") ? overrides!.twitterTitle : undefined,
		twitterDescription: has("twitterDescription") ? overrides!.twitterDescription : undefined,
		twitterImage: has("twitterImage") ? overrides!.twitterImage : undefined,
		structuredData: has("structuredData") ? overrides!.structuredData : '{"@context":"https://schema.org","@type":"AboutPage"}',
		keywords: has("keywords") ? overrides!.keywords : ["about", "company", "team"],
		updatedAt: overrides?.updatedAt ?? "2026-04-01T12:00:00.000Z",
		seoScore: overrides?.seoScore,
		issues: overrides?.issues,
	};
}

/**
 * Seed a page into KV store and update seo:pages:list.
 */
export async function seedPage(
	kv: MockKV,
	page: PageSeoData,
): Promise<void> {
	// Compute path hash same as sandbox-entry
	const { hashPath } = await import("../sandbox-entry");
	const pathHash = hashPath(page.path);

	await kv.set(`seo:${pathHash}`, JSON.stringify(page));

	const listJson = await kv.get<string>("seo:pages:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(pathHash)) {
		list.push(pathHash);
	}
	await kv.set("seo:pages:list", JSON.stringify(list));
}

/**
 * Seed multiple pages at once.
 */
export async function seedPages(
	kv: MockKV,
	pages: PageSeoData[],
): Promise<void> {
	for (const page of pages) {
		await seedPage(kv, page);
	}
}
