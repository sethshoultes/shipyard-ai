/**
 * Astro components for Portable Text block types.
 * Exported to the site for rendering event-listing blocks.
 */

import EventListing from "./EventListing.astro";

export const blockComponents = {
	"event-listing": EventListing,
};
