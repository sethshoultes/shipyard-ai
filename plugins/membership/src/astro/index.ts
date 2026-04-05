/**
 * Astro components for Portable Text block types.
 * Exported to the site for rendering gated-content blocks.
 */

import GatedContent from "./GatedContent.astro";

export const blockComponents = {
	"gated-content": GatedContent,
};
