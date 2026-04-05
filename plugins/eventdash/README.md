# EventDash Plugin for EmDash

Full-featured event management and registration plugin for EmDash CMS. Manage free and paid events, handle capacity-based registrations, automatic waitlists, recurring event templates, multiple ticket types with early bird pricing, Stripe payment processing, attendee portals, QR code tickets, check-in system, and iCal export.

**Version:** 3.0.0  
**Status:** Production  
**Phase:** 3 (Complete with Stripe, Tickets, Portal, Check-in, iCal, QR Codes)

## Features

### Event Management
- **Create one-off and recurring events** — Full date, time, location, capacity management
- **Event templates** — Create templates for recurring weekly/monthly events; auto-generate instances
- **Paid and free events** — Support both free registrations and paid events with Stripe
- **Event descriptions** — Rich Portable Text descriptions with full content
- **Event publishing** — Control visibility and availability of events

### Ticket Types (Phase 2)
- **Multiple ticket variants** — Create different ticket types per event (General, VIP, Early Bird)
- **Early bird pricing** — Time-limited discounts with automatic expiration
- **VIP perks** — Add VIP benefits (e.g., "Priority seating", "Complimentary drink")
- **Group discounts** — Set minimum group size and percentage discount
- **Capacity per type** — Manage capacity separately for each ticket variant
- **Dynamic pricing** — Apply early bird, group, and regular pricing rules
- **Sold-out handling** — Automatically hide or disable sold-out ticket types

### Registration & Capacity
- **Email-only registration** — No accounts required; register with name + email
- **Capacity enforcement** — Prevent overselling across all ticket types
- **Automatic waitlists** — Queue attendees when event reaches capacity
- **Waitlist management** — Promote attendees from waitlist when spots open
- **Duplicate prevention** — Prevent double registration (same email for same event)

### Payment Processing
- **Stripe integration** — Full Stripe Checkout support for paid events
- **Multiple payment methods** — Accept cards, Apple Pay, Google Pay via Stripe
- **Payment webhooks** — Real-time payment events (succeeded, refunded, failed)
- **Payment intent tracking** — Store payment status per registration
- **Revenue tracking** — Total revenue per event and ticket type
- **Refund handling** — Process refunds and free up capacity automatically

### Email Notifications
- **Registration confirmation** — Email when attendee registers (free and paid)
- **Payment confirmation** — Email with payment details for paid events
- **Cancellation confirmation** — Email when attendee cancels
- **Waitlist added** — Email when added to waitlist
- **Waitlist promoted** — Email when promoted from waitlist to registered
- **Resend integration** — High-deliverability email via Resend API
- **HTML email templates** — Professional templates with event details, calendar links

### Admin Features
- **Events dashboard** — Table view of all events with registration stats, revenue
- **Ticket type management** — Create and edit ticket types with pricing and capacity
- **Admin form** — Create events with full configuration (title, date, time, description, capacity)
- **Attendee tracking** — View registered attendees, waitlist, and refund status
- **Revenue reporting** — Track revenue per event and ticket type
- **Event statistics** — Registrations, waitlist counts, revenue totals

### Attendee Portal (Phase 3)
- **My registrations** — View all attendee's event registrations and ticket types
- **QR code tickets** — Mobile-friendly QR codes for each registration
- **Calendar export** — Export events to Google, Apple, or Outlook calendars
- **iCal subscription** — Subscribe to events as an ICS feed
- **Ticket details** — View ticket type, purchase date, and total paid
- **Registration management** — Cancel registrations and request refunds
- **Status tracking** — See confirmation status and check-in status
- **Mobile responsive** — Optimized for 320px+ devices with 44px touch targets

### Check-In System (Phase 3)
- **QR code scanning** — Scan attendee tickets for instant check-in
- **Confirmation codes** — 6-character alphanumeric codes for manual entry
- **Check-in validation** — Prevent double check-ins with concurrency control
- **Real-time stats** — Live check-in count vs total registrations
- **Admin manual check-in** — Offline check-in by email lookup

### Portable Text Integration
- **event-listing block** — Display upcoming events with inline registration
- **Calendar links** — Add to calendar (Google, Apple, Outlook)
- **Responsive design** — Mobile-friendly event cards and registration forms
- **Month/List calendar views** — Custom calendar components for event discovery

## Installation

### 1. Add to your EmDash site

In your `astro.config.mjs`:

```javascript
import { eventdashPlugin } from "@shipyard/eventdash";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [eventdashPlugin()],
    }),
  ],
});
```

### 2. Install the package

```bash
npm install @shipyard/eventdash
```

## Environment Configuration

Add these variables to your `.env` file for paid event support:

```bash
# Stripe API keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Email service (Resend)
RESEND_API_KEY=re_...

# Optional: Email sender
EVENTDASH_EMAIL_FROM=noreply@yoursite.com
```

### Environment Variable Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Yes* | Stripe API key for backend | `sk_test_123...` |
| `STRIPE_PUBLISHABLE_KEY` | Yes* | Stripe key for frontend | `pk_test_456...` |
| `STRIPE_WEBHOOK_SECRET` | Yes* | Webhook signature verification | `whsec_789...` |
| `RESEND_API_KEY` | Yes | Email delivery service | `re_abc123...` |
| `EVENTDASH_EMAIL_FROM` | No | Sender email address | `noreply@site.com` |

*Only required for paid events. Free events work without Stripe.

## Configuration

### Setup Stripe (for paid events)

1. **Create a Stripe account** at https://stripe.com
2. **Get API keys** from https://dashboard.stripe.com/apikeys
3. **Create a webhook endpoint:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-site.com/eventdash/webhooks/stripe`
   - Select events: `charge.succeeded`, `charge.refunded`, `payment_intent.succeeded`
   - Copy the Webhook Signing Secret
4. **Add keys to `.env`:**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Create an Event

1. Go to **Admin → Plugins → EventDash → Create Event**
2. Fill in event details:
   - **Title** — Event name
   - **Date** — YYYY-MM-DD format
   - **Time** — HH:MM format (18:00)
   - **End Time** — Optional end time
   - **Location** — Physical address or venue name
   - **Capacity** — Total seats available
   - **Description** — Optional event details
3. For **paid events**, add ticket types (see below)
4. Click "Create Event"

### Create Ticket Types (Paid Events)

Ticket types define pricing variants for paid events. After creating an event:

1. In admin, add ticket types:
   - **Name** — "Early Bird", "General", "VIP"
   - **Price** — In cents (900 = $9.00)
   - **Capacity** — Seats for this type
   - **Early Bird Deadline** — ISO date when early bird expires
   - **VIP Perks** — Benefits list (e.g., ["Priority seating", "Complimentary drink"])
   - **Group Discount** — Percentage off for groups (min X tickets)

2. Example Early Bird Ticket:
   ```json
   {
     "name": "Early Bird",
     "price": 1000,
     "capacity": 50,
     "earlyBirdDeadline": "2026-04-20",
     "earlyBirdPrice": 800
   }
   ```

3. Example VIP Ticket:
   ```json
   {
     "name": "VIP",
     "price": 5000,
     "capacity": 20,
     "vipPerks": ["Front row seating", "Complimentary bar", "Meet & greet"]
   }
   ```

## API Routes

All routes are at `/_emdash/api/plugins/eventdash/<route>`.

### Event Routes

#### `GET /events`
List all upcoming events.

**Access:** Public

**Query Parameters:**
- `limit` (optional) — Max events (default 20, max 100)
- `upcomingOnly` (optional) — Filter to future events (default true)

**Response:**
```json
{
  "events": [
    {
      "id": "1712243400000-abc123",
      "title": "Product Launch Party",
      "date": "2026-04-20",
      "time": "18:00",
      "location": "Ballroom Grand",
      "capacity": 100,
      "registered": 45,
      "requiresPayment": true,
      "createdAt": "2026-04-05T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### `GET /events/:id`
Get single event details with registration and waitlist counts.

**Access:** Public

**Response:**
```json
{
  "event": {
    "id": "1712243400000-abc123",
    "title": "Product Launch Party",
    "date": "2026-04-20",
    "time": "18:00",
    "location": "Ballroom Grand",
    "capacity": 100,
    "registered": 45,
    "requiresPayment": true,
    "totalRevenue": 450000,
    "createdAt": "2026-04-05T10:00:00Z"
  },
  "spotsRemaining": 55,
  "waitlistCount": 0
}
```

#### `GET /events/:id/tickets`
List ticket types for an event with availability info.

**Access:** Public

**Response:**
```json
{
  "event": { ... },
  "ticketTypes": [
    {
      "id": "ticket-123",
      "name": "Early Bird",
      "price": 1000,
      "earlyBirdPrice": 800,
      "capacity": 50,
      "sold": 30,
      "availableUntil": "2026-04-20",
      "available": true,
      "seatsLeft": 20,
      "displayPrice": 800,
      "displayLabel": "Early Bird (Early Bird)"
    },
    {
      "id": "ticket-456",
      "name": "General",
      "price": 1500,
      "capacity": 40,
      "sold": 15,
      "available": true,
      "seatsLeft": 25,
      "displayPrice": 1500
    },
    {
      "id": "ticket-789",
      "name": "VIP",
      "price": 5000,
      "capacity": 10,
      "sold": 0,
      "vipPerks": ["Front row", "Complimentary bar"],
      "available": true,
      "seatsLeft": 10,
      "displayPrice": 5000
    }
  ],
  "totalAvailable": 3
}
```

### Registration Routes

#### `POST /register`
Register an attendee for an event (free events only).

**Access:** Public

**Input:**
```json
{
  "eventId": "1712243400000-abc123",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response (free event):**
```json
{
  "success": true,
  "status": "registered",
  "message": "Registered for Product Launch Party"
}
```

**Response (waitlist):**
```json
{
  "success": true,
  "status": "waitlisted",
  "message": "Added to waitlist. You're #2",
  "position": 2
}
```

#### `POST /checkout`
Create a Stripe Checkout session for paid events.

**Access:** Public

**Input:**
```json
{
  "eventId": "1712243400000-abc123",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "ticketTypeId": "ticket-456"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

#### `GET /checkout/success?session_id=cs_test_...`
Retrieve checkout success and registration confirmation.

**Access:** Public

**Response:**
```json
{
  "success": true,
  "email": "jane@example.com",
  "eventId": "1712243400000-abc123",
  "ticketType": "General",
  "amountPaid": 1500,
  "status": "paid",
  "message": "Payment confirmed. Check your email for confirmation."
}
```

#### `POST /cancel`
Cancel a registration (free or paid).

**Access:** Public

**Input:**
```json
{
  "eventId": "1712243400000-abc123",
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

### Admin Routes

#### `POST /createEvent`
Create a new event (admin only).

**Access:** Admin only

**Input:**
```json
{
  "title": "Product Launch",
  "date": "2026-04-20",
  "time": "18:00",
  "location": "Ballroom Grand",
  "capacity": 100,
  "description": "Join us for the big reveal",
  "endTime": "20:00",
  "requiresPayment": true,
  "ticketTypes": [
    {
      "name": "General",
      "price": 1500,
      "capacity": 80
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "1712243400000-abc123"
}
```

#### `POST /createTemplate`
Create a recurring event template (admin only).

**Access:** Admin only

**Input:**
```json
{
  "title": "Weekly Yoga",
  "time": "18:00",
  "endTime": "19:00",
  "location": "Yoga Studio",
  "capacity": 20,
  "dayOfWeek": 2,
  "description": "Tuesday evening flow"
}
```

**Response:**
```json
{
  "success": true,
  "templateId": "template-123"
}
```

#### `POST /generateRecurring`
Generate N weeks of instances from a template (admin only).

**Access:** Admin only

**Input:**
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

#### `POST /createTicketType`
Create a ticket type for a paid event (admin only).

**Access:** Admin only

**Input:**
```json
{
  "eventId": "1712243400000-abc123",
  "name": "Early Bird",
  "price": 1000,
  "capacity": 50,
  "earlyBirdDeadline": "2026-04-20",
  "earlyBirdPrice": 800,
  "vipPerks": ["Priority seating"]
}
```

**Response:**
```json
{
  "success": true,
  "ticketType": {
    "id": "ticket-123",
    "name": "Early Bird",
    "price": 1000,
    "earlyBirdPrice": 800,
    "capacity": 50,
    "sold": 0
  }
}
```

#### `PATCH /updateTicketType`
Update a ticket type (admin only).

**Access:** Admin only

**Input:**
```json
{
  "eventId": "1712243400000-abc123",
  "ticketTypeId": "ticket-123",
  "updates": {
    "price": 1200,
    "capacity": 60,
    "earlyBirdPrice": 900
  }
}
```

**Response:**
```json
{
  "success": true,
  "ticketType": { ... }
}
```

#### `DELETE /deleteTicketType`
Delete a ticket type (admin only).

**Access:** Admin only

**Input:**
```json
{
  "eventId": "1712243400000-abc123",
  "ticketTypeId": "ticket-123"
}
```

**Response:**
```json
{
  "success": true
}
```

### Webhook Routes

#### `POST /webhooks/stripe`
Stripe webhook handler for payment events.

**Access:** Public (Stripe IP verification via signature)

**Handled Events:**
- `charge.succeeded` — Payment successful, confirm registration
- `charge.refunded` — Payment refunded, free up capacity
- `payment_intent.succeeded` — Payment intent completed

## Email Templates

### Registration Confirmation (Free Event)
Sent immediately after registration.

**Includes:**
- Event title, date, time, location
- Attendee name
- Calendar link (add to Google, Outlook, Apple Calendar)

### Payment Confirmation (Paid Event)
Sent after successful payment.

**Includes:**
- Event details
- Ticket type purchased
- Amount paid
- Calendar link
- Payment receipt

### Cancellation Confirmation
Sent when attendee cancels.

**Includes:**
- Event details
- Cancellation timestamp
- Refund status (if applicable)

### Waitlist Added
Sent when added to waitlist.

**Includes:**
- Event details
- Waitlist position
- Estimated wait time

### Waitlist Promoted
Sent when promoted from waitlist.

**Includes:**
- Event details
- New registered status
- Confirmation details

## Data Storage

All data stored in KV:

| Key | Format | Purpose |
|-----|--------|---------|
| `event:{id}` | JSON object | Event details with ticket types |
| `events:list` | JSON array | List of all event IDs |
| `registration:{eventId}:{email}` | JSON object | Attendee registration |
| `waitlist:{eventId}` | JSON array | Waitlist entries |
| `event-template:{id}` | JSON object | Recurring template |

### EventRecord Schema

```typescript
interface EventRecord {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date
  time: string; // HH:MM
  endTime?: string;
  location: string;
  capacity: number;
  registered: number;
  templateId?: string;
  requiresPayment?: boolean;
  stripeProductId?: string;
  ticketTypes?: TicketType[];
  totalRevenue?: number; // In cents
  createdAt: string;
}
```

### TicketType Schema

```typescript
interface TicketType {
  id: string;
  name: string;
  stripePriceId: string;
  price: number; // In cents
  capacity: number;
  sold: number;
  description?: string;
  availableUntil?: string;
  earlyBirdDeadline?: string;
  earlyBirdPrice?: number; // In cents
  groupMin?: number;
  groupDiscount?: number; // Percentage
  vipPerks?: string[];
}
```

### RegistrationRecord Schema

```typescript
interface RegistrationRecord {
  email: string;
  name: string;
  status: "registered" | "cancelled";
  ticketCount: number;
  createdAt: string;
  stripePaymentIntentId?: string;
  ticketType?: string;
  amountPaid?: number; // In cents
  paymentStatus?: "pending" | "paid" | "refunded";
}
```

## Portable Text Blocks

### event-listing

Display upcoming events with inline registration.

**Configuration:**
```json
{
  "type": "event-listing",
  "limit": 5,
  "showWaitlist": true
}
```

**Props:**
- `limit` (number, default 5) — Events to display
- `showWaitlist` (boolean, default true) — Show waitlist option when full

## Admin UI

### Events Page
- Table of all events with date, registrations, revenue (if paid)
- Quick stats: total events, total registrations, total revenue
- Click event to view details and attendees

### Create Event Page
- Form to create new events
- Paid event toggle
- Ticket type configuration (if paid)

### Attendee Tracking
- View all registrations for an event
- See ticket type purchased
- Payment status for paid events
- Refund option for paid registrations

## Member Flow (Free Event)

```
User visits event page
  ↓
Clicks "Register" button
  ↓
Enters name + email
  ↓
Submits registration
  ↓
Event has capacity?
  ├─ YES → Registered (email sent)
  └─ NO → Waitlist (email sent)
          ↓
          [When spot opens]
          ↓
          Promoted (email sent)
```

## Member Flow (Paid Event)

```
User visits event page
  ↓
Selects ticket type (Early Bird, General, VIP)
  ↓
Clicks "Buy Ticket"
  ↓
Enters name + email
  ↓
Proceeds to Stripe Checkout
  ↓
Completes payment
  ↓
Webhook confirms payment
  ↓
Registration created
  ↓
Confirmation email sent (receipt + calendar link)
```

## Ticket Type Pricing Logic

### Early Bird Pricing
- If `earlyBirdDeadline` not passed: use `earlyBirdPrice`
- If `earlyBirdDeadline` passed: use regular `price`
- If no `earlyBirdPrice`: not an early bird ticket

### Group Discount
- If buyer selects `groupMin` tickets: apply `groupDiscount` %
- Applies to regular price (after early bird expires)
- Example: 10% off if buying 5+ tickets

### VIP Perks
- Display `vipPerks` array on checkout
- Include in confirmation email
- Update registration record

## Troubleshooting

### Payment not processing
1. Verify Stripe keys are correct
2. Check webhook endpoint is configured
3. Review Stripe dashboard for errors
4. Ensure test card used in test mode

### Webhook not receiving events
1. Verify webhook secret matches
2. Confirm endpoint URL is reachable
3. Check Stripe dashboard → Webhooks → Event logs
4. Verify required event types are selected

### Early bird not working
1. Check `earlyBirdDeadline` is ISO date string
2. Verify deadline hasn't passed
3. Ensure `earlyBirdPrice` is set (in cents)
4. Confirm ticket type has both prices set

### Email not sending
1. Verify RESEND_API_KEY is set
2. Check sender email is verified in Resend
3. Review email logs
4. Check spam folder

### Waitlist not promoting
1. Verify registration was cancelled (not just left event)
2. Check waitlist is populated
3. Confirm first waitlisted person exists
4. Review logs for promotion errors

## Best Practices

1. **Early Bird Strategy**
   - Set deadline 2-4 weeks before event
   - Early bird price 20-30% discount
   - Limit capacity (e.g., 50 early bird tickets)

2. **Pricing Tiers**
   - General admission as baseline
   - VIP 2-3x regular price
   - Early bird 70-80% of regular price

3. **Capacity Planning**
   - Sum of all ticket types ≤ event capacity
   - Early bird capacity ~50% of total
   - VIP limited (10-20% of capacity)

4. **Communication**
   - Welcome email with event details
   - Reminder 3 days before event
   - Cancellation window (7 days before)
   - Refund policy clarity

5. **Payment Security**
   - Use Stripe test mode for testing
   - Test refund workflow
   - Monitor for failed payments
   - Keep webhook logs

## Support & Debugging

**Check logs:**
- Admin UI → System → Logs
- Search for "eventdash" or error keywords

**View KV data:**
- Admin UI → Developer Tools → KV Store
- Inspect event and registration records

**Stripe debugging:**
- Review test payments in Stripe dashboard
- Check webhook delivery status
- Monitor customer and charge events

## License

Copyright © Shipyard AI. Included with EmDash.
