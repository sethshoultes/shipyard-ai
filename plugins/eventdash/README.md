# EventDash Plugin v1.0

Event registration and management plugin for EmDash CMS. Manage events, handle capacity-based registrations, maintain automatic waitlists, support recurring event templates, and display events via Portable Text blocks.

## Features

- **Event Management** — Create one-off and recurring events with date, time, location, and capacity
- **Email-Only Registration** — No accounts required; register with name + email
- **Capacity & Waitlist** — Enforce capacity limits with automatic waitlist management
- **Recurring Events** — Create templates for weekly/monthly events; auto-generate instances
- **Email Notifications** — Optional Resend integration for confirmations, cancellations, and waitlist promotions (works without it)
- **Portable Text Block** — "event-listing" block displays upcoming events with inline registration
- **Admin UI** — Block Kit-based admin pages for event management and attendee tracking
- **REST API** — Full API for listing events, registering, cancelling, and creating events
- **No Stripe** — Free registrations only (v1.0)

## Installation

EventDash is a standard-format EmDash plugin that works in both trusted (in-process) and sandboxed modes.

### Register in astro.config.mjs

```typescript
import { eventdashPlugin } from "@shipyard/eventdash";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [eventdashPlugin()], // Trusted mode
			// OR
			// sandboxed: [eventdashPlugin()], // Sandboxed mode on Cloudflare
		}),
	],
});
```

## Data Structures

### Event

```typescript
{
	id: string;           // Unique event ID
	title: string;        // Event name
	description?: string; // Full description (optional)
	date: string;         // ISO date (YYYY-MM-DD)
	time: string;         // Start time (HH:MM)
	endTime?: string;     // End time (HH:MM, optional)
	location: string;     // Physical location
	capacity: number;     // Max attendees
	registered: number;   // Current registrations
	templateId?: string;  // If instance of recurring template (optional)
	createdAt: string;    // ISO timestamp
}
```

### Registration

```typescript
{
	email: string;           // Attendee email
	name: string;            // Attendee name
	status: "registered";    // Always "registered" when active
	ticketCount: number;     // Always 1 (v1.0)
	createdAt: string;       // Registration timestamp
}
```

### Waitlist

```typescript
{
	email: string;      // Attendee email
	name: string;       // Attendee name
	position: number;   // Position in waitlist (1-based)
	createdAt: string;  // Joined waitlist timestamp
}
```

### Event Template (for recurring events)

```typescript
{
	id: string;            // Template ID
	title: string;         // Event name
	description?: string;  // Description (optional)
	time: string;          // Start time (HH:MM)
	endTime?: string;      // End time (HH:MM, optional)
	location: string;      // Location
	capacity: number;      // Capacity per instance
	dayOfWeek: number;     // 0=Sunday, 1=Monday, ..., 6=Saturday
	createdAt: string;     // Template creation timestamp
}
```

## API Routes

All routes are available at `/_emdash/api/plugins/eventdash/<route>`.

### GET `/events`

List all upcoming events sorted by date/time.

**Query Parameters:**
- `limit` (optional) — Max events to return (default 20, max 100)
- `upcomingOnly` (optional) — Filter to future events only (default "true")

**Response:**
```json
{
	"events": [
		{
			"id": "1712243400000-abc123",
			"title": "Tuesday Yoga Class",
			"date": "2026-04-08",
			"time": "18:00",
			"location": "Sunrise Yoga Studio",
			"capacity": 20,
			"registered": 15,
			"createdAt": "2026-04-05T10:00:00Z"
		}
	],
	"total": 1
}
```

### GET `/events/:id` (via `eventDetail` route)

Get single event details with registration and waitlist counts.

**Response:**
```json
{
	"event": {
		"id": "1712243400000-abc123",
		"title": "Tuesday Yoga Class",
		"date": "2026-04-08",
		"time": "18:00",
		"location": "Sunrise Yoga Studio",
		"capacity": 20,
		"registered": 20,
		"createdAt": "2026-04-05T10:00:00Z"
	},
	"spotsRemaining": 0,
	"waitlistCount": 3
}
```

**Errors:**
- `400` — Event ID required
- `404` — Event not found

### POST `/events/:id/register`

Register an attendee for an event or add to waitlist if full.

**Request Body:**
```json
{
	"name": "Jane Doe",
	"email": "jane@example.com"
}
```

**Response:**
```json
{
	"success": true,
	"status": "registered",
	"message": "Registered for Tuesday Yoga Class"
}
```

Or if at capacity:
```json
{
	"success": true,
	"status": "waitlisted",
	"message": "Added to waitlist. You're #3"
}
```

**Errors:**
- `400` — Name, valid email, or event ID missing
- `404` — Event not found
- `429` — Registration in progress (concurrent request)

### POST `/events/:id/cancel`

Cancel a registration. If successful, promotes first person from waitlist.

**Request Body:**
```json
{
	"email": "jane@example.com"
}
```

**Response:**
```json
{
	"success": true,
	"message": "Registration cancelled"
}
```

**Errors:**
- `400` — Email required
- `404` — Registration not found

### POST `/events/create` (admin only)

Create a new event.

**Request Body:**
```json
{
	"title": "Tuesday Yoga Class",
	"date": "2026-04-08",
	"time": "18:00",
	"location": "123 Main St",
	"capacity": 20,
	"description": "Beginner-friendly vinyasa flow",
	"endTime": "19:00"
}
```

**Response:**
```json
{
	"success": true,
	"eventId": "1712243400000-abc123"
}
```

**Errors:**
- `400` — Missing required fields
- `403` — Admin access required

### POST `/events/generate-recurring` (admin only)

Generate N weeks of instances from a recurring event template.

**Request Body:**
```json
{
	"templateId": "template-123",
	"weeks": 8,
	"startDate": "2026-04-08"
}
```

**Response:**
```json
{
	"success": true,
	"generatedCount": 8
}
```

**Errors:**
- `400` — Template ID or weeks missing
- `403` — Admin access required
- `404` — Template not found

## Portable Text Block: "event-listing"

Display upcoming events with inline registration on your site.

### Block Configuration

```json
{
	"type": "event-listing",
	"limit": 5,
	"showWaitlist": true
}
```

### Block Props

- `limit` (number, default 5) — How many upcoming events to display
- `showWaitlist` (boolean, default true) — Show "Full — Join Waitlist" button when at capacity

### Example Usage

In your Portable Text editor, add an "event-listing" block to any page. The block:
1. Fetches upcoming events from the API
2. Displays title, date, time, location, and capacity
3. Shows inline registration form (name + email)
4. Displays "Register" or "Full — Join Waitlist" button based on capacity
5. Shows success/error messages inline

## Admin UI

EventDash provides Block Kit admin pages accessible in the EmDash admin panel.

### Pages

**Events** (`/events`)
- Table of all events with date, time, registration count, waitlist count, and status
- Quick stats: total events, total registrations
- Click through to event details

**Create Event** (`/create`)
- Form to create new events
- Fields: title, date (YYYY-MM-DD), time (HH:MM), end time (optional), location, capacity, description (optional)

### Widgets

**Upcoming Events** — Dashboard widget showing:
- Count of upcoming events
- Total registrations across upcoming events

## Email Notifications

EventDash optionally sends emails via the `ctx.email` API when an email provider is configured (e.g., Resend).

Notifications sent:
- **Registration Confirmation** — Sent when attendee registers
- **Cancellation Confirmation** — Sent when attendee cancels
- **Waitlist Added** — Sent when attendee joins waitlist
- **Waitlist Promoted** — Sent when attendee is promoted from waitlist

If no email provider is configured, registrations work normally but no emails are sent.

## Settings & Configuration

All data stored in KV:
- `event:{id}` — Event details
- `registration:{eventId}:{email}` — Attendee registration
- `waitlist:{eventId}` — Waitlist entries (JSON array)
- `event-template:{id}` — Recurring event template
- `events:list` — List of all event IDs

Email is optional and works with any provider configured in EmDash.

## Development

### Project Structure

```
src/
  index.ts              — Plugin descriptor (runs in Vite at build time)
  sandbox-entry.ts      — Plugin definition (runs at request time)
  astro/
    EventListing.astro  — Portable Text block component
    index.ts            — Block exports
```

### Key Utilities

- `emailToKvKey(email)` — URL-encodes email for safe KV key usage
- `generateId()` — Creates unique event/registration IDs
- `parseJSON<T>(json, fallback)` — Safe JSON parsing with fallback
- `isValidEmail(email)` — Basic email validation
- `dateTimeToTimestamp(date, time)` — Converts ISO date + time to comparable timestamp

### Concurrency Handling

Registration uses locks to prevent race conditions:
```typescript
const lockKey = `register-lock:${eventId}:${emailToKvKey(email)}`;
await ctx.kv.set(lockKey, "1", { ex: 5 }); // 5 second lock
```

### Error Handling

All routes use Response objects for HTTP errors:
```typescript
throw new Response(
	JSON.stringify({ error: "Message" }),
	{ status: 400, headers: { "Content-Type": "application/json" } }
);
```

## Testing

Test locally in trusted mode:

```bash
cd your-emdash-site
npm install @shipyard/eventdash
npx emdash dev
```

Call routes:
```bash
# List events
curl http://localhost:4321/_emdash/api/plugins/eventdash/events

# Register
curl -X POST http://localhost:4321/_emdash/api/plugins/eventdash/register?id=EVENT_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane", "email": "jane@example.com"}'

# Create event (admin only - requires auth)
curl -X POST http://localhost:4321/_emdash/api/plugins/eventdash/createEvent \
  -H "Content-Type: application/json" \
  -d '{"title": "Yoga", "date": "2026-04-15", "time": "18:00", "location": "Studio", "capacity": 20}'
```

## Sandboxing

EventDash works in sandboxed mode on Cloudflare Workers. The plugin declares `email:send` capability, enforced at runtime via RPC bridge. All code uses Web APIs only (no Node.js built-ins).

## Future Enhancements

- Paid event processing with Stripe
- Calendar view (iCal export)
- Custom registration forms
- Email digest/confirmation templates
- Analytics and reporting
- Multi-day events
- Event categories/filtering

## License

MIT
