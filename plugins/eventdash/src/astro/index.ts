/**
 * Astro components for Portable Text block types and standalone components.
 * Exported to the site for rendering event listings, calendars, and portals.
 */

import EventListing from "./EventListing.astro";
import EventCalendarMonth from "./EventCalendarMonth.astro";
import AttendeePortal from "./AttendeePortal.astro";

export const blockComponents = {
	"event-listing": EventListing,
	"event-calendar-month": EventCalendarMonth,
	"attendee-portal": AttendeePortal,
};

export { EventListing, EventCalendarMonth, AttendeePortal };
