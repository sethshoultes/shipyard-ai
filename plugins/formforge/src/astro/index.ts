/**
 * Astro components for FormForge plugin.
 * Exported to the site for rendering form-embed blocks.
 */

import FormEmbed from "./FormEmbed.astro";

export const blockComponents = {
	"form-embed": FormEmbed,
};

export { FormEmbed };
