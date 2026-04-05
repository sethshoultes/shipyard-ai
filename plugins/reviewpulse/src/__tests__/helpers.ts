/**
 * Test helpers for ReviewPulse plugin.
 *
 * Provides: mock KV store, mock PluginContext, route invocation utilities,
 * factory functions for review data, and mock Google Places API responses.
 */
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// Types (mirrors planned plugin types — self-contained for test-first dev)
// ---------------------------------------------------------------------------

export interface ReviewRecord {
	id: string;
	sourceId: string;
	source: "google" | "yelp" | "manual";
	authorName: string;
	authorAvatar?: string;
	rating: number;
	text: string;
	publishedAt: string;
	importedAt: string;
	responseText?: string;
	responseDate?: string;
	flagged?: boolean;
	featured?: boolean;
}

export interface ReviewStats {
	totalCount: number;
	averageRating: number;
	distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
	lastSyncAt: string;
	recentTrend: "up" | "down" | "stable";
}

export interface GooglePlacesReview {
	author_name: string;
	author_url?: string;
	profile_photo_url?: string;
	rating: number;
	text: string;
	time: number; // Unix timestamp
	relative_time_description?: string;
}

export interface GooglePlacesResponse {
	result: {
		reviews?: GooglePlacesReview[];
		rating?: number;
		user_ratings_total?: number;
	};
	status: string;
}

// ---------------------------------------------------------------------------
// Mock KV Store
// ---------------------------------------------------------------------------

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
			if (val === undefined) return null;
			try {
				return JSON.parse(val) as T;
			} catch {
				return val as unknown as T;
			}
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
					try {
						results.push({ key: k, value: JSON.parse(v) });
					} catch {
						results.push({ key: k, value: v });
					}
				}
			}
			return results;
		}),
	};
}

// ---------------------------------------------------------------------------
// Mock Plugin Context
// ---------------------------------------------------------------------------

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
		site: { url: "https://bellas-bistro.example.com", name: "Bella's Bistro" },
		url: (path: string) => `https://bellas-bistro.example.com${path}`,
		env: {
			GOOGLE_PLACES_API_KEY: "test-google-api-key",
		},
	};
}

// ---------------------------------------------------------------------------
// Route Context Builder
// ---------------------------------------------------------------------------

export function buildRouteCtx(opts: {
	input?: Record<string, unknown>;
	pathParams?: Record<string, string>;
	query?: Record<string, string>;
	user?: { isAdmin?: boolean; email?: string };
}) {
	return {
		input: opts.input ?? {},
		pathParams: opts.pathParams,
		query: opts.query ?? {},
		user: opts.user,
	};
}

// ---------------------------------------------------------------------------
// Review Factory
// ---------------------------------------------------------------------------

let reviewCounter = 0;

export function makeReview(overrides?: Partial<ReviewRecord>): ReviewRecord {
	reviewCounter++;
	const id = overrides?.id ?? `rev-${reviewCounter}`;
	return {
		id,
		sourceId: overrides?.sourceId ?? `google-${reviewCounter}`,
		source: overrides?.source ?? "google",
		authorName: overrides?.authorName ?? `Reviewer ${reviewCounter}`,
		authorAvatar: overrides?.authorAvatar,
		rating: overrides?.rating ?? 4,
		text: overrides?.text ?? `Great food and excellent service! Visit #${reviewCounter}.`,
		publishedAt: overrides?.publishedAt ?? "2026-03-15T12:00:00.000Z",
		importedAt: overrides?.importedAt ?? "2026-04-01T00:00:00.000Z",
		responseText: overrides?.responseText,
		responseDate: overrides?.responseDate,
		flagged: overrides?.flagged ?? false,
		featured: overrides?.featured ?? false,
	};
}

/**
 * Seed a review into the mock KV store and update reviews:list.
 */
export async function seedReview(kv: MockKV, review: ReviewRecord) {
	// Store individual review
	await kv.set(`review:${review.sourceId}`, review);

	// Update reviews:list
	const existing = await kv.get<string[]>("reviews:list");
	const list: string[] = existing ?? [];
	if (!list.includes(review.sourceId)) {
		list.push(review.sourceId);
	}
	await kv.set("reviews:list", list);
}

/**
 * Seed multiple reviews and compute stats.
 */
export async function seedReviews(kv: MockKV, reviews: ReviewRecord[]) {
	for (const review of reviews) {
		await seedReview(kv, review);
	}
	// Compute and store stats
	const stats = computeStats(reviews);
	await kv.set("reviews:stats", stats);
}

// ---------------------------------------------------------------------------
// Stats Computation (reference implementation for tests)
// ---------------------------------------------------------------------------

export function computeStats(
	reviews: ReviewRecord[],
	now?: Date
): ReviewStats {
	if (reviews.length === 0) {
		return {
			totalCount: 0,
			averageRating: 0,
			distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
			lastSyncAt: new Date().toISOString(),
			recentTrend: "stable",
		};
	}

	const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
	let sum = 0;
	for (const r of reviews) {
		const clamped = Math.max(1, Math.min(5, Math.round(r.rating)));
		distribution[clamped]++;
		sum += clamped;
	}

	const currentDate = now ?? new Date();
	const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
	const sixtyDaysAgo = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000);

	const recent = reviews.filter(
		(r) => new Date(r.publishedAt) >= thirtyDaysAgo
	);
	const previous = reviews.filter(
		(r) =>
			new Date(r.publishedAt) >= sixtyDaysAgo &&
			new Date(r.publishedAt) < thirtyDaysAgo
	);

	let recentTrend: "up" | "down" | "stable" = "stable";
	if (recent.length > 0 && previous.length > 0) {
		const recentAvg = recent.reduce((s, r) => s + r.rating, 0) / recent.length;
		const prevAvg = previous.reduce((s, r) => s + r.rating, 0) / previous.length;
		if (recentAvg - prevAvg >= 0.25) recentTrend = "up";
		else if (prevAvg - recentAvg >= 0.25) recentTrend = "down";
	}

	return {
		totalCount: reviews.length,
		averageRating: parseFloat((sum / reviews.length).toFixed(2)),
		distribution: distribution as ReviewStats["distribution"],
		lastSyncAt: currentDate.toISOString(),
		recentTrend,
	};
}

// ---------------------------------------------------------------------------
// Normalization (reference implementation)
// ---------------------------------------------------------------------------

export function normalizeGoogleReview(
	raw: GooglePlacesReview,
	importedAt?: string
): ReviewRecord {
	const sourceId = `google-${raw.time}-${raw.author_name.replace(/\s+/g, "-").toLowerCase()}`;
	return {
		id: sourceId,
		sourceId,
		source: "google",
		authorName: raw.author_name || "Anonymous",
		authorAvatar: raw.profile_photo_url,
		rating: Math.max(1, Math.min(5, Math.round(raw.rating ?? 3))),
		text: raw.text || "",
		publishedAt: new Date(raw.time * 1000).toISOString(),
		importedAt: importedAt ?? new Date().toISOString(),
		flagged: false,
		featured: false,
	};
}

// ---------------------------------------------------------------------------
// Google Places API Mock Responses
// ---------------------------------------------------------------------------

export function makeGooglePlacesResponse(
	reviews: GooglePlacesReview[],
	overallRating?: number
): GooglePlacesResponse {
	return {
		result: {
			reviews,
			rating: overallRating ?? 4.2,
			user_ratings_total: reviews.length,
		},
		status: "OK",
	};
}

export function makeGoogleReview(overrides?: Partial<GooglePlacesReview>): GooglePlacesReview {
	reviewCounter++;
	return {
		author_name: overrides?.author_name ?? `Google User ${reviewCounter}`,
		author_url: overrides?.author_url ?? `https://google.com/maps/contrib/${reviewCounter}`,
		profile_photo_url: overrides?.profile_photo_url ?? `https://lh3.googleusercontent.com/photo-${reviewCounter}`,
		rating: overrides?.rating ?? 4,
		text: overrides?.text ?? `Wonderful experience at Bella's Bistro! Review #${reviewCounter}`,
		time: overrides?.time ?? Math.floor(Date.now() / 1000) - reviewCounter * 86400,
		relative_time_description: overrides?.relative_time_description ?? "a week ago",
	};
}

export function makeGoogleErrorResponse(status: string): GooglePlacesResponse {
	return {
		result: {},
		status,
	};
}

/**
 * Validate a Place ID format (Google Place IDs start with "ChIJ" and are base64-like).
 */
export function isValidPlaceId(placeId: string): boolean {
	return /^ChIJ[A-Za-z0-9_-]{20,}$/.test(placeId);
}

/**
 * Reset the review counter (useful in beforeEach).
 */
export function resetCounter() {
	reviewCounter = 0;
}
