/**
 * Google Places API Sync
 *
 * Fetches reviews from Google Places API and normalizes them
 * into the ReviewPulse record format.
 */

import type { PluginContext } from "emdash";
import type { ReviewRecord } from "../types";
import { generateId } from "../utils";

/**
 * Normalize a raw Google Places review into our ReviewRecord format.
 */
export function normalizeGoogleReview(raw: Record<string, unknown>): ReviewRecord {
	const authorName = String(raw.author_name ?? raw.authorName ?? "Anonymous");
	const rating = Math.min(5, Math.max(1, Number(raw.rating ?? 5)));
	const text = String(raw.text ?? "");
	const time = raw.time
		? new Date(Number(raw.time) * 1000).toISOString()
		: raw.relative_time_description
			? new Date().toISOString()
			: new Date().toISOString();

	return {
		id: generateId(),
		source: "google",
		author: authorName,
		rating,
		text,
		date: time,
		featured: false,
		flagged: rating <= 2,
		replyText: raw.reply?.text ? String((raw.reply as Record<string, unknown>).text) : undefined,
		repliedAt: raw.reply?.time
			? new Date(
					Number((raw.reply as Record<string, unknown>).time) * 1000
				).toISOString()
			: undefined,
	};
}

/**
 * Fetch reviews from Google Places API.
 * Returns normalized reviews or throws an error.
 */
export async function fetchGoogleReviews(
	ctx: PluginContext,
	placeId: string,
	apiKey: string
): Promise<ReviewRecord[]> {
	const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${encodeURIComponent(apiKey)}`;

	const response = await fetch(url);

	if (!response.ok) {
		ctx.log.error(`Couldn't reach Google - got status ${response.status}`);
		throw new Error(`Google API returned status ${response.status}`);
	}

	const data = (await response.json()) as Record<string, unknown>;
	const result = data.result as Record<string, unknown> | undefined;
	const rawReviews = (result?.reviews ?? []) as Record<string, unknown>[];

	return rawReviews.map(normalizeGoogleReview);
}
