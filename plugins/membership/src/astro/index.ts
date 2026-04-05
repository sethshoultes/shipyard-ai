/**
 * Astro components for Portable Text block types and standalone components.
 * Exported to the site for rendering gated-content blocks and member dashboard.
 */

import GatedContent from "./GatedContent.astro";
import MemberDashboard from "./MemberDashboard.astro";

export const blockComponents = {
	"gated-content": GatedContent,
};

export { MemberDashboard };
