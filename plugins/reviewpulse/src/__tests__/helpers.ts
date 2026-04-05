/**
 * Test helpers: mock PluginContext, KV store, and review factories for ReviewPulse.
 */
import { vi } from "vitest";

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
		plugin: { id: "reviewpulse", version: "1.0.0" },
		site: { url: "https://test.example.com", name: "Test Site" },
		url: (path: string) => `https://test.example.com${path}`,
		env: {
			GOOGLE_PLACES_API_KEY: "test-api-key-123",
			YELP_API_KEY: "test-yelp-key",
			RESEND_API_KEY: "test-resend-key",
			REVIEW_FROM_EMAIL: "noreply@test.com",
		},
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
 * Create a standard review record for testing.
 */
export function createTestReview(overrides?: Partial<{
	id: string;
	source: "google" | "yelp" | "manual";
	author: string;
	rating: number;
	text: string;
	date: string;
	featured: boolean;
	flagged: boolean;
	replyText: string;
	repliedAt: string;
}>) {
	return {
		id: overrides?.id ?? `review-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
		source: overrides?.source ?? "google",
		author: overrides?.author ?? "Jane Doe",
		rating: overrides?.rating ?? 5,
		text: overrides?.text ?? "Excellent food and amazing service! Will definitely come back.",
		date: overrides?.date ?? "2026-03-15T12:00:00.000Z",
		featured: overrides?.featured ?? false,
		flagged: overrides?.flagged ?? false,
		...(overrides?.replyText !== undefined && { replyText: overrides.replyText }),
		...(overrides?.repliedAt !== undefined && { repliedAt: overrides.repliedAt }),
	};
}

/**
 * Seed a review into KV store and update reviews:list.
 */
export async function seedReview(
	kv: MockKV,
	review: ReturnType<typeof createTestReview>
) {
	await kv.set(`review:${review.id}`, JSON.stringify(review));

	const listJson = await kv.get<string>("reviews:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(review.id)) {
		list.push(review.id);
	}
	await kv.set("reviews:list", JSON.stringify(list));
}

/**
 * Seed multiple reviews at once.
 */
export async function seedReviews(
	kv: MockKV,
	reviews: ReturnType<typeof createTestReview>[]
) {
	for (const review of reviews) {
		await seedReview(kv, review);
	}
}

/**
 * Create a raw Google Places API review object for testing normalization.
 */
export function createRawGoogleReview(overrides?: Partial<{
	author_name: string;
	rating: number;
	text: string;
	time: number;
	author_url: string;
	relative_time_description: string;
}>) {
	return {
		author_name: overrides?.author_name ?? "John Smith",
		rating: overrides?.rating ?? 4,
		text: overrides?.text ?? "Great place, friendly staff!",
		time: overrides?.time ?? Math.floor(Date.now() / 1000),
		author_url: overrides?.author_url ?? "https://google.com/maps/contrib/123456",
		relative_time_description: overrides?.relative_time_description ?? "a month ago",
	};
}
