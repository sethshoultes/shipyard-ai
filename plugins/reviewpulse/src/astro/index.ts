/**
 * Astro components for Portable Text block types and standalone components.
 * Exported to the site for rendering review widgets and displays.
 */

import ReviewWidget from "./ReviewWidget.astro";

export const blockComponents = {
	"review-widget": ReviewWidget,
};

export { ReviewWidget };
