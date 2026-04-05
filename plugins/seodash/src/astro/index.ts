/**
 * Astro components for SEO meta tag injection and social preview.
 * Exported to the site for rendering SEO head tags and preview cards.
 */

import SeoHead from "./SeoHead.astro";
import SocialPreview from "./SocialPreview.astro";

export const blockComponents = {
	"seo-head": SeoHead,
	"social-preview": SocialPreview,
};

export { SeoHead, SocialPreview };
