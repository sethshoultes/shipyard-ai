/**
 * Astro components for Portable Text block types and standalone components.
 * Exported to the site for rendering gated-content blocks and member portals.
 */

import AdminReporting from "./AdminReporting.astro";
import GatedContent from "./GatedContent.astro";
import MemberDashboard from "./MemberDashboard.astro";
import MemberPortal from "./MemberPortal.astro";

export const blockComponents = {
	"gated-content": GatedContent,
	"member-portal": MemberPortal,
};

export { AdminReporting, MemberDashboard, MemberPortal };
