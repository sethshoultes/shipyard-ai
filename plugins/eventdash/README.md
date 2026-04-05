# EventDash Plugin

The first events and ticketing plugin in the EmDash ecosystem. Manage events, track registrations, and export calendars.

## Features

- **Event Management** — Create and manage events with capacity, pricing, and recurring schedules
- **Registration Tracking** — Register attendees, track capacity, and manage paid/free events
- **iCal Export** — Export events as an iCal feed for calendar integration
- **Admin UI** — Manage events and registrations through the EmDash admin panel
- **REST API** — Full API for querying events and managing registrations

## Installation

EventDash is a standard-format EmDash plugin that works in both trusted (in-process) and sandboxed (V8 isolate) modes.

### Register in astro.config.mjs

```typescript
import { eventDashPlugin } from "@shipyard/eventdash";

export default defineConfig({
	integrations: [
		emdash({
			plugins: [eventDashPlugin()], // Trusted mode
			// OR
			// sandboxed: [eventDashPlugin()], // Sandboxed mode on Cloudflare
		}),
	],
});
```

## Data Structures

### Event

```typescript
{
	id: string;                    // Unique event ID
	title: string;                 // Event name
	description: string;           // Full description
	date: string;                  // ISO date (YYYY-MM-DD)
	time: string;                  // Time (HH:mm)
	location: string;              // Physical location or URL
	capacity: number;              // Max attendees
	registered: number;            // Current registrations
	price: number;                 // Ticket price (0 for free)
	recurring?: string;            // "daily" | "weekly" | "monthly" (optional)
	recurringId?: string;          // For grouping recurring instances (optional)
	createdAt: string;             // ISO timestamp
	updatedAt: string;             // ISO timestamp
}
```

### Registration

```typescript
{
	id: string;         // Unique registration ID
	eventId: string;    // Event ID
	name: string;       // Attendee name
	email: string;      // Attendee email
	ticketCount: number; // Number of tickets
	paid: boolean;      // Payment status
	createdAt: string;  // ISO timestamp
}
```

## API Routes

All routes are available at `/_emdash/api/plugins/eventdash/<route>`.

### GET `/events`

List all upcoming events with pagination.

**Query Parameters:**
- `limit` (optional) — Results per page, max 100. Default: 50.
- `cursor` (optional) — Pagination cursor from previous response.

**Response:**
```json
{
	"items": [
		{
			"id": "evt_123",
			"title": "Community Meetup",
			"date": "2026-05-15",
			"time": "18:00",
			"location": "Downtown Coffee",
			"capacity": 50,
			"registered": 28,
			"price": 0,
			"createdAt": "2026-04-05T10:00:00Z",
			"updatedAt": "2026-04-05T10:00:00Z"
		}
	],
	"cursor": "next_page_token",
	"hasMore": true
}
```

### GET `/events/:id`

Get single event details with registration count.

**Path Parameters:**
- `id` — Event ID

**Response:**
```json
{
	"id": "evt_123",
	"title": "Community Meetup",
	"date": "2026-05-15",
	"time": "18:00",
	"location": "Downtown Coffee",
	"capacity": 50,
	"registered": 28,
	"price": 0,
	"createdAt": "2026-04-05T10:00:00Z",
	"updatedAt": "2026-04-05T10:00:00Z"
}
```

**Errors:**
- `404` — Event not found

### POST `/events/:id/register`

Register an attendee for an event.

**Path Parameters:**
- `id` — Event ID

**Request Body:**
```json
{
	"name": "Jane Doe",
	"email": "jane@example.com",
	"ticketCount": 2,
	"paid": false
}
```

**Response:**
```json
{
	"success": true,
	"registrationId": "reg_abc123",
	"registration": {
		"id": "reg_abc123",
		"eventId": "evt_123",
		"name": "Jane Doe",
		"email": "jane@example.com",
		"ticketCount": 2,
		"paid": false,
		"createdAt": "2026-04-05T12:30:00Z"
	}
}
```

**Errors:**
- `404` — Event not found
- `400` — Not enough tickets available

### POST `/events/:id/cancel`

Cancel a registration.

**Path Parameters:**
- `id` — Event ID

**Request Body:**
```json
{
	"registrationId": "reg_abc123"
}
```

**Response:**
```json
{
	"success": true,
	"deleted": "reg_abc123"
}
```

**Errors:**
- `404` — Registration not found

### GET `/events/ical`

Export all events as an iCal feed.

**Response:**
- Content-Type: `text/calendar`
- Standard iCal format (RFC 5545)

**Usage:**
```bash
curl https://your-site.com/_emdash/api/plugins/eventdash/events/ical > events.ics
```

## Settings

EventDash stores configuration in KV storage:

- `settings:defaultCapacity` — Default capacity for new events (default: 100)
- `settings:requirePayment` — Whether payment is required (default: false)
- `settings:notificationEmail` — Email for registration notifications (default: empty)

**Access in routes:**
```typescript
const capacity = (await ctx.kv.get<number>("settings:defaultCapacity")) ?? 100;
const email = await ctx.kv.get<string>("settings:notificationEmail");
```

## Storage Collections

EventDash uses two storage collections, automatically scoped to this plugin:

### `events`

Document collection with indexes on:
- `date` — Event date (for chronological queries)
- `recurringId` — Recurring event grouping
- `createdAt` — Creation timestamp

### `registrations`

Document collection with indexes on:
- `eventId` — Event association (for finding registrations per event)
- `email` — Attendee email (for finding attendee's registrations)
- `createdAt` — Registration timestamp

## Development

### Project Structure

```
src/
  index.ts           — Plugin descriptor (runs in Vite at build time)
  sandbox-entry.ts   — Plugin definition with hooks and routes (runs at request time)
```

### TypeScript

EventDash is written in strict TypeScript. All types are exported from `sandbox-entry.ts`.

### Testing

Test locally in trusted mode:

```bash
cd your-emdash-site
npm install @shipyard/eventdash
npx emdash dev
```

Then call routes:

```bash
# Get events
curl http://localhost:4321/_emdash/api/plugins/eventdash/events

# Register
curl -X POST http://localhost:4321/_emdash/api/plugins/eventdash/events/evt_123/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "ticketCount": 1}'
```

## Sandboxing

EventDash works in sandboxed mode on Cloudflare Workers without code changes. The plugin declares `kv:storage` and `api:routes` capabilities, which are enforced at runtime via the RPC bridge.

## Future Enhancements

- Paid event processing with payment gateway integration
- Email notifications for registrations
- Recurring event automation
- Waitlist management
- Custom registration forms
- Analytics and reporting

## License

MIT
