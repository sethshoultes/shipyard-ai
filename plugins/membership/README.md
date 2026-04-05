# Membership Plugin for EmDash

Email-based membership and gated content plugin for EmDash CMS. Integrate with Stripe Payment Links for hassle-free payment collection.

**Version:** 1.0.0
**Status:** Stable

## Features

- **Email-only registration** — No visitor authentication required. Members register with their email.
- **Flexible membership plans** — Configure unlimited plans with custom prices, intervals, and features.
- **Stripe Payment Links** — Integrate with Stripe Payment Links (admin-configured, no webhooks needed in v1.0).
- **Content gating** — Use the `gated-content` Portable Text block to restrict content to members only.
- **Admin UI** — Manage members, approve/revoke access, configure plans, and monitor revenue.
- **Member status API** — Check membership status via simple REST endpoints.

## Installation

### 1. Add to your EmDash site

In your `astro.config.mjs`:

```javascript
import { membershipPlugin } from "@shipyard/membership";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [membershipPlugin()],
    }),
  ],
});
```

### 2. Install the package

```bash
npm install @shipyard/membership
```

## Configuration

The plugin stores all configuration in KV (key-value storage). No environment variables required.

### Default Plans

On first install, the plugin initializes with three default plans:

```json
{
  "id": "free",
  "name": "Free",
  "price": 0,
  "interval": "once",
  "description": "Basic access",
  "features": ["Limited content access", "Community support"]
}
```

```json
{
  "id": "pro",
  "name": "Pro",
  "price": 99,
  "interval": "month",
  "description": "Full access with email support",
  "features": ["All content", "Priority email support", "Monthly newsletter"]
}
```

```json
{
  "id": "premium",
  "name": "Premium",
  "price": 999,
  "interval": "year",
  "description": "VIP access and priority support",
  "features": ["All content", "Priority support", "Early access", "Annual digest"]
}
```

Prices are in cents (e.g., 99 = $0.99).

### Managing Plans

1. Go to **Admin → Plugins → Membership → Plans**
2. View all active plans
3. To add or modify a plan:
   - Use the admin API route (see API Reference below)
   - Or manually edit plans in KV storage

### Stripe Payment Links

To accept payments via Stripe:

1. **Create Payment Links in Stripe Dashboard**
   - Go to https://dashboard.stripe.com/payment-links
   - Create a new Payment Link for each paid plan
   - Copy the link URL

2. **Update Plan with Payment Link**
   - Go to **Admin → Plugins → Membership → Plans**
   - Update the plan's `paymentLink` field with the Stripe URL
   - Save

3. **Registration Flow**
   - User registers with email and selects a paid plan
   - If the plan has a payment link, they're redirected to Stripe
   - After payment, they return to your site
   - **Admin manually approves** the member in the admin UI

Free plans are immediately active on registration.

## Usage

### For Site Visitors

#### Register for a Plan

Make a POST request to `/_emdash/api/plugins/membership/register`:

```bash
curl -X POST https://your-site.com/_emdash/api/plugins/membership/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "plan": "pro"
  }'
```

Response:

```json
{
  "memberId": "user@example.com",
  "status": "active",
  "plan": "pro",
  "paymentLink": "https://stripe.com/pay/xyz" 
}
```

If the plan is paid and has a payment link, redirect the user to `paymentLink`.

#### Check Membership Status

Make a GET request to `/_emdash/api/plugins/membership/status`:

```bash
curl https://your-site.com/_emdash/api/plugins/membership/status?email=user@example.com
```

Response:

```json
{
  "email": "user@example.com",
  "active": true,
  "plan": "pro",
  "status": "active",
  "expiresAt": "2025-05-05T12:00:00Z"
}
```

#### Get Available Plans

Make a GET request to `/_emdash/api/plugins/membership/plans`:

```bash
curl https://your-site.com/_emdash/api/plugins/membership/plans
```

Response:

```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "interval": "once",
      "description": "Basic access",
      "features": ["Limited access", "Community support"]
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 99,
      "interval": "month",
      "description": "Full access",
      "features": ["All content", "Priority support"]
    }
  ]
}
```

### For Site Editors

#### Gate Content with Portable Text

In any Portable Text field (e.g., page body):

1. Press `/` to open the block menu
2. Select **Gated Content**
3. Fill in:
   - **Required Plan ID** (optional) — If empty, any active member can see it
   - **Message for Non-Members** — What to show to non-members
4. Add your content inside the block

Example:

```json
{
  "_type": "gated-content",
  "_key": "abc123",
  "requiredPlan": "pro",
  "fallbackMessage": "Upgrade to Pro to access this exclusive guide.",
  "children": [
    {
      "_type": "block",
      "text": "This is exclusive content for Pro members only..."
    }
  ]
}
```

### For Site Admins

#### Manage Members

Go to **Admin → Plugins → Membership → Members**

The Members page shows:

- **Members table** — Email, plan, status (pending/active/revoked), expiry date
- **Stats** — Total members, active count, pending count
- **Admin actions** — Approve pending members or revoke access

#### Approve a Member

1. Go to **Members** page
2. Enter the member's email
3. Select "Approve" action
4. Click "Execute"

This activates a pending member (useful after manual payment verification).

#### Revoke Access

1. Go to **Members** page
2. Enter the member's email
3. Select "Revoke" action
4. Click "Execute"

This immediately deactivates the member.

#### Configure Plans

Go to **Admin → Plugins → Membership → Plans**

The Plans page shows all active plans and their payment links. To update:

- Use the API (see API Reference below)
- Or use admin tools to edit KV storage directly

## API Reference

### REST Endpoints

All endpoints are at `/_emdash/api/plugins/membership/<route>`.

#### POST `/register`

Register a new member or retrieve existing membership.

**Access:** Public (no auth required)

**Input:**
```json
{
  "email": "user@example.com",
  "plan": "pro"
}
```

**Returns:**
```json
{
  "memberId": "user@example.com",
  "status": "pending|active",
  "plan": "pro",
  "paymentLink": "https://stripe.com/pay/xyz"
}
```

**Errors:**
- `400 Bad Request` — Invalid email or plan not found
- `500 Internal Server Error` — Registration failed

---

#### GET `/status`

Check membership status for an email.

**Access:** Public (no auth required)

**Query Params:**
- `email` (required) — Member email address

**Returns:**
```json
{
  "email": "user@example.com",
  "active": true|false,
  "plan": "pro",
  "status": "pending|active|revoked",
  "expiresAt": "2025-05-05T12:00:00Z"
}
```

**Notes:**
- Returns `active: false` if member doesn't exist
- Returns `active: false` if membership is expired
- `status` can be "pending", "active", or "revoked"

---

#### GET `/plans`

Get all available membership plans.

**Access:** Public (no auth required)

**Returns:**
```json
{
  "plans": [
    {
      "id": "pro",
      "name": "Pro",
      "price": 99,
      "interval": "month",
      "description": "Full access",
      "features": ["All content", "Priority support"]
    }
  ]
}
```

---

#### POST `/approve`

Manually approve a pending member.

**Access:** Admin only

**Input:**
```json
{
  "email": "user@example.com"
}
```

**Returns:**
```json
{
  "success": true
}
```

**Errors:**
- `400 Bad Request` — Invalid email
- `404 Not Found` — Member not found
- `500 Internal Server Error` — Approval failed

---

#### POST `/revoke`

Revoke a member's access.

**Access:** Admin only

**Input:**
```json
{
  "email": "user@example.com"
}
```

**Returns:**
```json
{
  "success": true
}
```

**Errors:**
- `400 Bad Request` — Invalid email
- `404 Not Found` — Member not found
- `500 Internal Server Error` — Revoke failed

---

### Admin Handler

**Route:** `POST /admin`

Block Kit admin UI handler. Manages the admin pages and widgets.

## Data Storage

All data is stored in KV (key-value store):

| Key | Value | Purpose |
|-----|-------|---------|
| `plans` | JSON array | Membership plans configuration |
| `member:{email}` | JSON object | Member record (email, plan, status, etc.) |
| `members:list` | JSON array | List of all member emails for enumeration |
| `settings:requirePaymentApproval` | string | Whether to require manual approval for paid plans |

### Member Record Schema

```typescript
interface MemberRecord {
  email: string;                    // Member email
  plan: string;                     // Plan ID (e.g., "pro")
  status: "pending" | "active" | "revoked";
  paymentLink?: string;             // Stripe Payment Link (if applicable)
  createdAt: string;                // ISO 8601 timestamp
  expiresAt?: string;               // ISO 8601 expiry (for recurring plans)
  approvedAt?: string;              // When admin approved (for paid plans)
}
```

### Plan Config Schema

```typescript
interface PlanConfig {
  id: string;                       // Unique plan ID
  name: string;                     // Display name
  price: number;                    // Price in cents (0 for free)
  interval: "once" | "month" | "year";
  description: string;
  paymentLink?: string;             // Stripe Payment Link URL
  features: string[];               // Feature list
}
```

## Portable Text Blocks

### gated-content

Gate content visible only to active members.

**Block Type:** `gated-content`

**Fields:**
- `requiredPlan` (string, optional) — Plan ID requirement. If set, only members with this plan can see the content.
- `fallbackMessage` (string, optional) — Message shown to non-members. Defaults to generic message.

**Rendering:**
- If member is active and has required plan: render content
- Otherwise: show fallback message

**Example:**

```json
{
  "_type": "gated-content",
  "_key": "exclusive-guide",
  "requiredPlan": "pro",
  "fallbackMessage": "Upgrade to Pro to read our exclusive guide.",
  "children": [
    {
      "_type": "heading",
      "children": [{ "text": "Exclusive Guide for Pro Members" }]
    },
    {
      "_type": "block",
      "children": [{ "text": "This content is only for Pro members..." }]
    }
  ]
}
```

## Member Status Flow

```
Registration
  ├─ Free Plan
  │   └─ → Immediately Active
  │
  └─ Paid Plan (with Payment Link)
      ├─ Register with email + plan
      ├─ Receive payment link
      ├─ User pays via Stripe
      └─ Status: Pending (awaiting admin approval)
          └─ Admin approves in Members UI
              └─ → Active
```

## Webhook Integration (v1.1+)

Version 1.0 requires manual approval of paid registrations. Future versions will support Stripe webhooks for automatic approval.

To migrate to v1.1:
- No code changes required in the membership plugin
- Admin will configure Stripe webhook secret in settings
- Payments will be verified automatically

## Troubleshooting

### Member can't access gated content

1. **Check membership status:**
   ```bash
   curl "https://your-site.com/_emdash/api/plugins/membership/status?email=user@example.com"
   ```

2. **Verify email cookie is set:**
   - The `membership-email` cookie must be set in the browser
   - Check browser DevTools → Cookies

3. **Check expiry date:**
   - If `expiresAt` is in the past, the membership is expired
   - Use the admin UI to manually extend or approve

### Payment link not in registration response

1. **Check plan configuration:**
   ```bash
   curl "https://your-site.com/_emdash/api/plugins/membership/plans"
   ```

2. **Verify payment link is set:**
   - The plan's `paymentLink` field must be a valid Stripe URL
   - Go to **Admin → Plugins → Membership → Plans** to add the link

3. **For free plans:**
   - Free plans never return a `paymentLink`
   - They are immediately active on registration

## Best Practices

1. **Create Stripe Payment Links carefully**
   - Use unique links for each plan
   - Include proper product names and descriptions
   - Test the link before adding to the plugin

2. **Monitor pending members**
   - Check the admin dashboard regularly
   - Approve members shortly after they pay
   - Use email notifications to alert admins

3. **Plan pricing**
   - Store prices in cents (99 = $0.99)
   - Use consistent pricing intervals
   - Document which products use monthly vs. yearly billing

4. **Content strategy**
   - Use `gated-content` blocks for high-value content
   - Set clear fallback messages so visitors know how to subscribe
   - Consider free trial content to reduce friction

## Support

For issues or questions:
1. Check logs: **Admin → System → Logs**
2. Review the troubleshooting section above
3. Verify KV storage is working in your EmDash instance

## License

Copyright © Shipyard AI. Included with EmDash.
