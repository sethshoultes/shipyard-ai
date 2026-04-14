/**
 * Yelp Fusion API Sync
 *
 * Fetches reviews from Yelp Fusion API and normalizes them
 * into the ReviewPulse record format.
 */

import type { PluginContext } from "emdash";
import type { ReviewRecord } from "../types";
import { generateId } from "../utils";

/**
 * Normalize a raw Yelp Fusion API review into our ReviewRecord format.
 */
export function normalizeYelpReview(raw: Record<string, unknown>): ReviewRecord {
	const user = (raw.user ?? {}) as Record<string, unknown>;
	const authorName = String(user.name ?? raw.user_name ?? "Anonymous");
	const rating = Math.min(5, Math.max(1, Number(raw.rating ?? 5)));
	const text = String(raw.text ?? "");
	const timeCreated = raw.time_created
		? new Date(String(raw.time_created)).toISOString()
		: new Date().toISOString();
	const yelpId = String(raw.id ?? `yelp-${authorName}-${rating}-${Date.now()}`);

	return {
		id: generateId(),
		source: "yelp",
		author: authorName,
		rating,
		text,
		date: timeCreated,
		featured: false,
		flagged: rating <= 2,
		sourceId: yelpId,
	};
}

/**
 * Fetch reviews from Yelp Fusion API.
 * Returns normalized reviews or throws an error.
 */
export async function fetchYelpReviews(
	ctx: PluginContext,
	businessId: string,
	apiKey: string
): Promise<ReviewRecord[]> {
	const url = `https://api.yelp.com/v3/businesses/${encodeURIComponent(businessId)}/reviews`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		ctx.log.error(`Couldn't reach Yelp - got status ${response.status}`);
		throw new Error(`Yelp API returned status ${response.status}`);
	}

	const data = (await response.json()) as Record<string, unknown>;
	const rawReviews = (data.reviews ?? []) as Record<string, unknown>[];

	return rawReviews.map(normalizeYelpReview);
}
