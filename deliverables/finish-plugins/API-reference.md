# MemberShip Plugin -- REST API Reference

**Version:** 1.5.0
**Base path:** `/membership`

All routes are prefixed with the plugin's base path. For example, a route documented as `POST /register` is reached at `POST /membership/register`.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Members](#members)
3. [Plans](#plans)
4. [Subscriptions & Checkout](#subscriptions--checkout)
5. [Member Dashboard](#member-dashboard)
6. [Coupons](#coupons)
7. [Groups](#groups)
8. [Member-Facing Groups](#member-facing-groups)
9. [Content Gating](#content-gating)
10. [Registration Forms](#registration-forms)
11. [Developer Webhooks](#developer-webhooks)
12. [Reporting & Analytics](#reporting--analytics)
13. [CSV Import / Export](#csv-import--export)
14. [PayPal Integration](#paypal-integration)
15. [Payment Gateways](#payment-gateways)
16. [Health Check](#health-check)
17. [Stripe Webhook (Inbound)](#stripe-webhook-inbound)
18. [Webhook Event Payloads](#webhook-event-payloads)
19. [Error Codes](#error-codes)

---

## Authentication

The API uses two authentication models:

| Model | How it works | Used by |
|-------|-------------|---------|
| **Admin auth** | EmDash admin session. Routes without `public: true` require an authenticated admin user (`user.isAdmin === true`). | All admin-only endpoints |
| **JWT (member auth)** | Bearer token or `Authorization` cookie. Issued after successful Stripe checkout. 15-minute expiry. | Dashboard endpoints |
| **Public** | No authentication required. Route is marked `public: true`. | Registration, status checks, plans, forms, health |

### JWT Token Format

Tokens are passed via:
- `Authorization: Bearer <token>` header
- `Authorization=<url-encoded-token>` cookie

The JWT payload contains the member's email and a 15-minute TTL with type `"access"`.

---

## Members

### Register a Member

Create a new membership or return an existing one.

```
POST /membership/register
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email address |
| `plan` | string | Yes | Plan ID (e.g., `"free"`, `"pro"`, `"premium"`) |
| `stripeCustomerId` | string | No | Pre-existing Stripe customer ID |
| `stripeSubscriptionId` | string | No | Pre-existing Stripe subscription ID |
| `stripePaymentMethod` | string | No | Payment method display string (e.g., `"Visa 4242"`) |
| `planInterval` | `"month"` \| `"year"` \| `"once"` | No | Billing interval override |
| `currentPeriodEnd` | string (ISO 8601) | No | Subscription period end from Stripe |
| `cancelAtPeriodEnd` | boolean | No | Whether subscription is scheduled to cancel |

**Response (200):**

```json
{
  "memberId": "user@example.com",
  "status": "pending",
  "plan": "pro",
  "paymentLink": "https://buy.stripe.com/..."
}
```

**Behavior:**
- Free plans (`price === 0`) are immediately `"active"`.
- Paid plans start as `"pending"` until payment is confirmed.
- If the email already exists, the existing member record is returned (no duplicate created).
- A 5-second distributed lock prevents race conditions on concurrent registrations.

**Errors:**

| Status | Reason |
|--------|--------|
| 400 | Missing or invalid email / plan |
| 404 | Plan not found |
| 429 | Registration already in progress for this email |

---

### Check Membership Status

```
GET /membership/status
```

**Auth:** Public

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |

**Response (200):**

```json
{
  "email": "user@example.com",
  "active": true,
  "plan": "pro",
  "status": "active",
  "expiresAt": "2026-05-05T00:00:00.000Z",
  "stripeCustomerId": "cus_abc123",
  "stripeSubscriptionId": "sub_xyz789",
  "stripePaymentMethod": "Visa 4242",
  "planInterval": "month",
  "currentPeriodEnd": "2026-05-05T00:00:00.000Z",
  "cancelAtPeriodEnd": false
}
```

**Behavior:**
- `active` is `false` if `status !== "active"` or if `expiresAt` is in the past.
- Returns `{ email, active: false }` if no member record exists.

---

### Approve a Member (Admin)

Manually approve a pending member.

```
POST /membership/approve
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |

**Response (200):**

```json
{
  "success": true
}
```

**Errors:** 400 (invalid email), 404 (member not found)

---

### Revoke a Member (Admin)

Revoke a member's access.

```
POST /membership/revoke
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |

**Response (200):**

```json
{
  "success": true
}
```

**Errors:** 400 (invalid email), 404 (member not found)

---

### Mark Member as Paid (Admin)

Manually mark a member as paid via any gateway.

```
POST /membership/admin/mark-paid
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |
| `gateway` | `"stripe"` \| `"paypal"` \| `"manual"` | No | Payment method (default: `"manual"`) |
| `notes` | string | No | Admin notes (stored in payment log) |

**Response (200):**

```json
{
  "success": true,
  "member": { "email": "user@example.com", "status": "active", "paymentMethod": "manual", "..." : "..." }
}
```

**Errors:** 400 (invalid email or gateway), 403 (not admin), 404 (member not found)

---

### Get Member Portal

Retrieve a member's portal data: accessible content, plan, billing.

```
GET /membership/portal
```

**Auth:** Public

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |

**Response (200) -- active member:**

```json
{
  "hasAccess": true,
  "member": {
    "email": "user@example.com",
    "plan": "pro",
    "status": "active",
    "joinDate": "2026-01-15T00:00:00.000Z",
    "currentPeriodEnd": "2026-05-05T00:00:00.000Z",
    "stripePaymentMethod": "Visa 4242"
  },
  "plan": {
    "id": "pro",
    "name": "Pro",
    "price": 99,
    "interval": "month",
    "description": "Full access with email support",
    "features": ["All content", "Priority email support", "Monthly newsletter"]
  },
  "accessibleContent": ["page-1", "page-2"],
  "nextBillingDate": "2026-05-05T00:00:00.000Z"
}
```

**Response (200) -- no access:**

```json
{
  "hasAccess": false,
  "reason": "No active membership"
}
```

---

## Plans

### List Plans

```
GET /membership/plans
```

**Auth:** Public

**Response (200):**

```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "interval": "once",
      "description": "Basic access",
      "features": ["Limited content access", "Community support"]
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 99,
      "interval": "month",
      "description": "Full access with email support",
      "features": ["All content", "Priority email support", "Monthly newsletter"]
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 999,
      "interval": "year",
      "description": "VIP access and priority support",
      "features": ["All content", "Priority support", "Early access to new content", "Annual digest report"]
    }
  ]
}
```

**Note:** Prices are in cents (e.g., `99` = $0.99, `999` = $9.99).

---

## Subscriptions & Checkout

### Create Stripe Checkout Session

```
POST /membership/checkout/create
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |
| `plan` | string | Yes | Plan ID (must be a paid plan) |
| `successUrl` | string | No | Redirect URL after success (default: `/membership/checkout/success?session_id={CHECKOUT_SESSION_ID}`) |
| `cancelUrl` | string | No | Redirect URL on cancel (default: `/membership`) |

**Response (200):**

```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

**Behavior:**
- Creates a Stripe Customer if one doesn't exist for this email.
- Creates a Stripe Checkout Session in `subscription` mode.
- Stores session data in KV with 24h TTL for the success callback.

**Errors:** 400 (missing fields, free plan), 404 (plan not found), 500 (Stripe API failure)

**Required env:** `STRIPE_API_SECRET`

---

### Handle Checkout Success

```
POST /membership/checkout/success
```

**Auth:** Public

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string | Yes | Stripe Checkout Session ID (from redirect URL) |

**Response (200):**

```json
{
  "success": true,
  "redirectUrl": "/membership/dashboard?status=subscribed",
  "cookie": "Authorization=eyJ...; Path=/; HttpOnly; Secure; SameSite=Strict"
}
```

**Behavior:**
- Retrieves the Checkout Session from Stripe API (with expanded subscription).
- Updates the member record with subscription ID, period end, and active status.
- Issues a JWT cookie for member dashboard authentication (15-minute TTL).

**Required env:** `STRIPE_API_SECRET`, `JWT_SECRET`

---

## Member Dashboard

All dashboard endpoints require JWT authentication via Bearer token or cookie.

### Get Dashboard Data

```
GET /membership/dashboard
```

**Auth:** JWT (member)

**Response (200):**

```json
{
  "email": "user@example.com",
  "plan": "Pro",
  "planId": "pro",
  "price": 99,
  "interval": "month",
  "currentPeriodEnd": "2026-05-05T00:00:00.000Z",
  "status": "active",
  "cancelAtPeriodEnd": false,
  "stripePaymentMethod": "Visa 4242",
  "stripeSubscriptionId": "sub_xyz789"
}
```

**Errors:** 401 (unauthorized / expired token), 404 (member or plan not found)

---

### Cancel Subscription

Cancel at end of current billing period.

```
POST /membership/dashboard/cancel
```

**Auth:** JWT (member)

**Response (200):**

```json
{
  "success": true,
  "cancelDate": "2026-05-05T00:00:00.000Z",
  "message": "Your subscription will be cancelled on 2026-05-05T00:00:00.000Z. You'll maintain access until then."
}
```

---

### Upgrade Plan

Switch to a different plan.

```
POST /membership/dashboard/upgrade
```

**Auth:** JWT (member)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `newPlanId` | string | Yes | Target plan ID |

**Response (200):**

```json
{
  "success": true,
  "newPlan": "Premium",
  "newPlanId": "premium",
  "newPrice": 999,
  "interval": "year",
  "priceDifference": 900,
  "message": "Successfully upgraded to Premium. Your new price is $9.99/year."
}
```

**Errors:** 400 (missing plan ID), 404 (plan not found)

---

## Coupons

### Create Coupon (Admin)

```
POST /membership/coupons/create
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Coupon code (min 2 chars, auto-uppercased) |
| `discountType` | `"percent"` \| `"fixed"` | Yes | Discount type |
| `discountAmount` | number | Yes | Percentage (1-100) or cents (e.g., 500 = $5.00) |
| `expiresAt` | string (ISO 8601) | No | Expiration date |
| `maxUses` | number | No | Maximum redemptions (unlimited if omitted) |
| `applicablePlans` | string[] | No | Restrict to specific plan IDs (all plans if omitted) |
| `description` | string | No | Admin notes |

**Response (200):**

```json
{
  "success": true,
  "coupon": {
    "code": "SAVE20",
    "discountType": "percent",
    "discountAmount": 20,
    "usedCount": 0,
    "createdAt": "2026-04-05T12:00:00.000Z"
  },
  "message": "Coupon SAVE20 created successfully"
}
```

**Errors:** 400 (invalid code/type/amount), 403 (not admin), 409 (code already exists)

---

### List Coupons (Admin)

```
GET /membership/coupons
```

**Auth:** Admin

**Response (200):**

```json
{
  "coupons": [
    {
      "code": "SAVE20",
      "discountType": "percent",
      "discountAmount": 20,
      "usedCount": 5,
      "maxUses": 100,
      "expiresAt": "2026-12-31T23:59:59.000Z",
      "createdAt": "2026-04-05T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### Validate Coupon

Real-time coupon validation for checkout forms.

```
POST /membership/coupons/validate
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Coupon code |
| `planId` | string | No | Plan ID to check plan-specific restrictions |

**Response (200) -- valid:**

```json
{
  "valid": true,
  "discountType": "percent",
  "discountAmount": 20,
  "message": "Save 20% with this code!"
}
```

**Response (200) -- invalid:**

```json
{
  "valid": false,
  "reason": "Coupon has expired"
}
```

Possible `reason` values: `"Coupon code required"`, `"Coupon not found"`, `"Coupon has expired"`, `"Coupon usage limit reached"`, `"This coupon is not valid for your selected plan"`.

---

## Groups

Admin-managed group (team/organization) memberships with seat limits.

### Create Group (Admin)

```
POST /membership/groups/create
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orgName` | string | Yes | Organization name |
| `orgEmail` | string | Yes | Organization email |
| `adminEmail` | string | Yes | Group admin/owner email |
| `planId` | string | Yes | Plan ID for all group members |
| `maxSeats` | number | No | Maximum seats (default: 10) |

**Response (200):**

```json
{
  "success": true,
  "group": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orgName": "Acme Corp",
    "orgEmail": "team@acme.com",
    "adminEmail": "admin@acme.com",
    "planId": "pro",
    "maxSeats": 10,
    "members": ["admin@acme.com"],
    "createdAt": "2026-04-05T12:00:00.000Z",
    "updatedAt": "2026-04-05T12:00:00.000Z"
  },
  "message": "Group \"Acme Corp\" created with max 10 seats"
}
```

**Errors:** 400 (missing fields, maxSeats < 1), 403 (not admin)

---

### Invite to Group (Admin)

```
POST /membership/groups/invite
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | string | Yes | Group UUID |
| `email` | string | Yes | Email to invite |

**Response (200):**

```json
{
  "success": true,
  "inviteCode": "550e8400-e29b-41d4-a716-446655440001",
  "inviteLink": "https://app.shipyard.io/join-group?code=550e8400-e29b-41d4-a716-446655440001",
  "message": "Invite sent to user@example.com"
}
```

**Behavior:**
- Invite codes expire after 30 days.
- Returns error if group has reached maximum seats.

**Errors:** 400 (max seats reached), 404 (group not found)

---

### Remove from Group (Admin)

```
POST /membership/groups/remove
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | string | Yes | Group UUID |
| `email` | string | Yes | Email to remove |

**Response (200):**

```json
{
  "success": true,
  "message": "user@example.com removed from group"
}
```

**Errors:** 400 (member not in group), 404 (group not found)

---

### Get Group Details (Admin)

```
GET /membership/groups/:id
```

**Auth:** Admin

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | string | Yes | Group UUID |

**Response (200):**

```json
{
  "group": {
    "id": "550e8400-...",
    "orgName": "Acme Corp",
    "orgEmail": "team@acme.com",
    "adminEmail": "admin@acme.com",
    "planId": "pro",
    "maxSeats": 10,
    "members": ["admin@acme.com", "user1@acme.com"],
    "createdAt": "2026-04-05T12:00:00.000Z",
    "updatedAt": "2026-04-05T13:00:00.000Z"
  },
  "seatsUsed": 2,
  "seatsAvailable": 8
}
```

---

### Accept Group Invite

```
POST /membership/groups/accept
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Invite code UUID |
| `email` | string | Yes | Email of accepting member |

**Response (200):**

```json
{
  "success": true,
  "group": { "..." : "..." },
  "message": "Welcome to Acme Corp!"
}
```

**Errors:** 400 (max seats reached), 404 (invite not found), 410 (invite expired)

---

## Member-Facing Groups

Endpoints for group owners (not necessarily site admins) to manage their own groups.

### Look Up My Group

```
GET /membership/groups/my
```

**Auth:** Public

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Member email |

**Response (200) -- found:**

```json
{
  "found": true,
  "group": { "id": "...", "orgName": "Acme Corp", "..." : "..." },
  "isOwner": true,
  "seatsUsed": 3,
  "seatsAvailable": 7
}
```

**Response (200) -- not found:**

```json
{
  "found": false
}
```

---

### Create Invite (Group Owner)

```
POST /membership/groups/my/invite
```

**Auth:** Public (owner verified by `ownerEmail` matching `group.adminEmail`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ownerEmail` | string | Yes | Group owner's email |
| `groupId` | string | Yes | Group UUID |
| `email` | string | No | Optional pre-filled invite email |

**Response (200):**

```json
{
  "success": true,
  "inviteCode": "...",
  "inviteLink": "https://app.example.com/join-group?code=...",
  "message": "Invite created for user@example.com"
}
```

**Errors:** 400 (missing fields, max seats), 403 (not group owner), 404 (group not found)

---

### Remove Member (Group Owner)

```
POST /membership/groups/my/remove
```

**Auth:** Public (owner verified by `ownerEmail`)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ownerEmail` | string | Yes | Group owner's email |
| `groupId` | string | Yes | Group UUID |
| `email` | string | Yes | Email to remove |

**Response (200):**

```json
{
  "success": true,
  "message": "user@example.com removed from group"
}
```

**Errors:** 400 (member not in group, cannot remove owner), 403 (not group owner), 404 (group not found)

---

## Content Gating

Protect pages and blocks behind membership plans with optional drip scheduling.

### Create Gating Rule (Admin)

```
POST /membership/gating/rules
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contentId` | string | Yes | Page or block ID to protect |
| `targetType` | `"page"` \| `"block"` | No | Content type (default: `"page"`) |
| `planIds` | string[] | Yes | Plan IDs that grant access |
| `type` | `"membership"` \| `"drip"` | No | Gating type (default: `"membership"`) |
| `dripDays` | number | No | Days after join to unlock (required if type is `"drip"`) |
| `previewText` | string | No | Preview text shown to non-members |

**Response (200):**

```json
{
  "ruleId": "1712345678901-abc1234",
  "success": true
}
```

---

### List Gating Rules (Admin)

```
GET /membership/gating/rules
```

**Auth:** Admin

**Response (200):**

```json
{
  "rules": [
    {
      "id": "1712345678901-abc1234",
      "contentId": "page-premium-guide",
      "targetType": "page",
      "planIds": ["pro", "premium"],
      "type": "drip",
      "dripDays": 7,
      "createdAt": "2026-04-05T12:00:00.000Z"
    }
  ]
}
```

---

### Check Content Access

```
GET /membership/gating/check
```

**Auth:** Public

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `targetType` | `"page"` \| `"block"` | No | Content type (default: `"page"`) |
| `targetId` | string | Yes | Content ID to check |
| `email` | string | Yes | Member email |

**Response (200) -- has access:**

```json
{
  "hasAccess": true
}
```

**Response (200) -- no access (drip not yet unlocked):**

```json
{
  "hasAccess": false,
  "reason": "Content unlocks in 3 days",
  "unlocksOn": "2026-04-08T00:00:00.000Z"
}
```

**Behavior:**
- If no gating rule exists for the content, returns `hasAccess: true` (content is public).
- For drip content, checks member's `joinDate` against `rule.dripDays`.

---

### Process Drip Unlocks (Cron)

Batch process all drip content unlocks. Designed to run as a scheduled cron job.

```
POST /membership/drip/process
```

**Auth:** Public (protected by `X-Cron-Secret` header)

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Cron-Secret` | Conditional | Must match `CRON_SECRET` env var if configured |

**Response (200):**

```json
{
  "success": true,
  "processed": 150,
  "unlocked": 12,
  "errors": ["Member user%40example.com: Error message"]
}
```

**Behavior:**
- Iterates all active members with a `joinDate`.
- For each drip gating rule, unlocks content when `daysElapsed >= rule.dripDays`.
- Sends email notifications for newly unlocked content.
- Uses UTC midnight boundaries for consistent day calculations.

---

## Registration Forms

Custom registration forms with configurable fields and optional multi-step wizard support.

### Create Form (Admin)

```
POST /membership/forms/create
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Form name (max 200 chars) |
| `description` | string | No | Form description |
| `fields` | array | Yes | 1-50 field definitions (see below) |
| `steps` | array | No | Multi-step wizard configuration (see below) |

**Field definition:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `"text"` \| `"email"` \| `"dropdown"` \| `"checkbox"` \| `"phone"` | Yes | Field type |
| `label` | string | Yes | Display label (max 200 chars) |
| `required` | boolean | No | Whether field is required (default: false) |
| `options` | string[] | Conditional | Required for `"dropdown"` type |
| `placeholder` | string | No | Placeholder text |

**Step definition (optional multi-step wizard):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Step label (max 200 chars) |
| `fieldIds` | string[] | Yes | Field IDs belonging to this step |

**Step validation rules:**
- Maximum 20 steps per form.
- Every field must be assigned to exactly one step (no orphans, no duplicates).

**Response (200):**

```json
{
  "success": true,
  "form": {
    "id": "1712345678901-abc1234",
    "name": "Member Registration",
    "fields": [
      { "id": "1712345678901-def5678", "type": "text", "label": "Full Name", "required": true },
      { "id": "1712345678902-ghi9012", "type": "email", "label": "Email", "required": true }
    ],
    "createdAt": "2026-04-05T12:00:00.000Z",
    "updatedAt": "2026-04-05T12:00:00.000Z"
  }
}
```

---

### Update Form (Admin)

```
PUT /membership/forms/:id
```

**Auth:** Admin

**Request Body:** Same fields as Create (all optional). Omitting `steps` leaves them unchanged; sending `steps: null` removes them.

**Response (200):**

```json
{
  "success": true,
  "form": { "..." : "..." }
}
```

**Errors:** 400 (validation), 403 (not admin), 404 (form not found)

---

### Get Form

```
GET /membership/forms/:id
```

**Auth:** Public

**Response (200):**

```json
{
  "form": {
    "id": "...",
    "name": "Member Registration",
    "fields": [ "..." ],
    "steps": [ { "label": "Step 1", "fieldIds": ["..."] } ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### List Forms

```
GET /membership/forms
```

**Auth:** Public

**Response (200):**

```json
{
  "forms": [ "..." ],
  "total": 3
}
```

---

### Submit Form

```
POST /membership/forms/:id/submit
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | object | Yes | Key-value pairs keyed by field ID |

**Example request:**

```json
{
  "data": {
    "1712345678901-def5678": "Jane Smith",
    "1712345678902-ghi9012": "jane@example.com"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "submissionId": "1712345679000-xyz4567"
}
```

**Validation:**
- Required fields must have non-empty values.
- `email` fields are validated for format and lowercased.
- `phone` fields must be 7-20 characters (digits, +, -, parentheses, spaces).
- `dropdown` values must be one of the defined `options`.
- `text` fields are capped at 5,000 characters.

**Errors:** 400 (validation failed with `details` array), 404 (form not found)

---

### List Submissions (Admin)

```
GET /membership/forms/:id/submissions
```

**Auth:** Admin

**Response (200):**

```json
{
  "submissions": [
    {
      "id": "1712345679000-xyz4567",
      "formId": "1712345678901-abc1234",
      "data": { "field-id-1": "Jane Smith", "field-id-2": "jane@example.com" },
      "submittedAt": "2026-04-05T12:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

## Developer Webhooks

Register HTTP endpoints to receive real-time event notifications. Webhooks are signed with HMAC-SHA256, retried with exponential backoff, and rate-limited to 100 fires/minute.

### Register Webhook (Admin)

```
POST /membership/webhooks/register
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | HTTPS endpoint URL |
| `events` | string[] | Yes | Event types to subscribe to |

**Supported event types:**

| Event | Description |
|-------|-------------|
| `member.created` | New member registered |
| `member.activated` | Member activated (payment confirmed) |
| `member.cancelled` | Subscription cancelled |
| `member.expired` | Subscription expired |
| `member.upgraded` | Plan changed |
| `payment.succeeded` | Payment received |
| `payment.failed` | Payment failed |

**Response (200):**

```json
{
  "success": true,
  "webhook": {
    "id": "550e8400-...",
    "url": "https://your-app.com/webhook",
    "events": ["member.created", "member.cancelled"],
    "secret": "7a5b3c2d-...",
    "active": true,
    "createdAt": "2026-04-05T12:00:00.000Z",
    "failedCount": 0
  },
  "secret": "7a5b3c2d-...",
  "message": "Webhook registered successfully"
}
```

**Important:** Store the `secret` value -- it is used to verify webhook signatures. It is only returned at registration time (and when rotated).

---

### Delete Webhook (Admin)

```
DELETE /membership/webhooks/:id
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhookId` | string | Yes | Webhook UUID |

**Response (200):**

```json
{
  "success": true,
  "message": "Webhook deleted"
}
```

---

### List Webhooks (Admin)

```
GET /membership/webhooks
```

**Auth:** Admin

**Response (200):**

```json
{
  "webhooks": [
    {
      "id": "550e8400-...",
      "url": "https://your-app.com/webhook",
      "events": ["member.created"],
      "active": true,
      "failedCount": 0,
      "lastFiredAt": "2026-04-05T13:00:00.000Z",
      "createdAt": "2026-04-05T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Note:** The `secret` field is NOT included in list responses for security.

---

### Test Webhook (Admin)

Send a test event to a registered webhook endpoint.

```
POST /membership/webhooks/test
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhookId` | string | Yes | Webhook UUID |

**Response (200):**

```json
{
  "success": true,
  "log": {
    "id": "...",
    "webhookId": "...",
    "eventType": "member.created",
    "responseCode": 200,
    "success": true,
    "firedAt": "2026-04-05T13:00:00.000Z"
  }
}
```

**Behavior:** Fires a `member.created` event with test data to the endpoint.

---

### Rotate Webhook Secret (Admin)

Generate a new HMAC signing secret for a webhook.

```
POST /membership/webhooks/:id/secret
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhookId` | string | Yes | Webhook UUID |

**Response (200):**

```json
{
  "success": true,
  "webhookId": "550e8400-...",
  "secret": "new-secret-uuid-here"
}
```

---

### Webhook Delivery Logs (Admin)

Paginated log of webhook deliveries.

```
GET /membership/webhooks/logs
```

**Auth:** Admin

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `webhookId` | string | Yes | Webhook UUID |
| `limit` | number | No | Results per page (1-100, default: 50) |
| `offset` | number | No | Skip N results (default: 0) |

**Response (200):**

```json
{
  "logs": [
    {
      "id": "...",
      "webhookId": "550e8400-...",
      "eventType": "member.created",
      "payload": "{\"event\":\"member.created\",\"timestamp\":\"...\",\"data\":{...}}",
      "responseCode": 200,
      "responseBody": "OK",
      "firedAt": "2026-04-05T13:00:00.000Z",
      "success": true
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

---

### Webhook Health Dashboard (Admin)

```
GET /membership/webhooks/health
```

**Auth:** Admin

**Response (200):**

```json
{
  "totalRegistered": 3,
  "last24hFires": 127,
  "last24hSuccessRate": "98%",
  "failedWebhooks": [
    { "id": "...", "url": "https://broken.example.com/hook", "failedCount": 5 }
  ]
}
```

---

## Reporting & Analytics

All reporting endpoints require admin authentication.

### Revenue Report

```
GET /membership/reports/revenue
```

**Auth:** Admin

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | number | No | Lookback period (default: 30) |

**Response (200):**

```json
{
  "totalRevenue": 149.97,
  "mrr": 49.99,
  "averageRevenuePerMember": 14.99,
  "memberCount": 10,
  "chartData": [
    { "date": "2026-03-15", "amount": 9900 },
    { "date": "2026-03-20", "amount": 4999 }
  ],
  "period": "last 30 days"
}
```

**Note:** `totalRevenue`, `mrr`, and `averageRevenuePerMember` are in dollars. `chartData[].amount` is in cents.

---

### Churn Report

```
GET /membership/reports/churn
```

**Auth:** Admin

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `days` | number | No | Lookback period (default: 30) |

**Response (200):**

```json
{
  "churnRate": "5.26%",
  "cancelledMembers": 1,
  "activeMembersAtStart": 19,
  "period": "last 30 days",
  "retentionRate": "94.74%"
}
```

---

### Members Report

Paginated, filterable member list.

```
GET /membership/reports/members
```

**Auth:** Admin

**Query / Input:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | string | No | Filter by plan |
| `status` | string | No | Filter by status (`active`, `pending`, `cancelled`, `past_due`, `revoked`) |
| `search` | string | No | Search email (partial match) |
| `page` | number | No | Page number (default: 1) |
| `perPage` | number | No | Results per page (default: 20) |

**Response (200):**

```json
{
  "members": [
    {
      "email": "user@example.com",
      "plan": "pro",
      "status": "active",
      "createdAt": "2026-03-15T12:00:00.000Z",
      "expiresAt": "2026-04-15T12:00:00.000Z",
      "planInterval": "month"
    }
  ],
  "total": 45,
  "page": 1,
  "perPage": 20,
  "totalPages": 3,
  "summary": {
    "total": 45,
    "active": 38,
    "pastDue": 2,
    "cancelled": 5
  }
}
```

---

### Cohort Analysis

Members grouped by signup month with retention metrics.

```
GET /membership/reports/cohorts
```

**Auth:** Admin

**Response (200):**

```json
{
  "cohorts": [
    {
      "month": "2026-01",
      "joined": 20,
      "active": 15,
      "churned": 5,
      "retentionRate": "75%",
      "totalPayments": 14850,
      "avgLtv": "$7.43"
    },
    {
      "month": "2026-02",
      "joined": 30,
      "active": 28,
      "churned": 2,
      "retentionRate": "93%",
      "totalPayments": 27720,
      "avgLtv": "$9.24"
    }
  ]
}
```

---

### Lifetime Value (LTV) Analysis

```
GET /membership/reports/ltv
```

**Auth:** Admin

**Response (200):**

```json
{
  "overallAverageLtv": "$24.50",
  "ltvByPlan": [
    { "plan": "pro", "averageLtv": "$14.85", "memberCount": 30 },
    { "plan": "premium", "averageLtv": "$89.90", "memberCount": 10 }
  ],
  "ltvByCohort": [
    { "cohort": "2026-01", "averageLtv": "$28.00", "memberCount": 20 }
  ],
  "projectedLtv": "$36.75",
  "avgSubscriptionMonths": 3.5,
  "totalMembers": 40
}
```

---

### Conversion Funnel

```
GET /membership/reports/funnel
```

**Auth:** Admin

**Response (200):**

```json
{
  "funnel": [
    { "stage": "Visitors (estimated)", "count": 300, "percentage": "100%" },
    { "stage": "Signups", "count": 100, "percentage": "33%" },
    { "stage": "Active Subscribers", "count": 60, "percentage": "60%" },
    { "stage": "Renewals (30+ days)", "count": 45, "percentage": "75%" }
  ],
  "summary": {
    "totalSignups": 100,
    "paidConversionRate": "65%",
    "renewalRate": "75%"
  }
}
```

---

## CSV Import / Export

### Export Members as CSV (Admin)

```
GET /membership/export/csv
```

**Auth:** Admin

**Response (200):**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="members-export.csv"

email,name,plan,status,createdAt,planInterval,paymentMethod
user@example.com,user,pro,active,2026-03-15T12:00:00.000Z,month,stripe
```

**Columns:** `email`, `name`, `plan`, `status`, `createdAt`, `planInterval`, `paymentMethod`

---

### Import Members from CSV (Admin)

```
POST /membership/import/csv
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `csv` (or `body`) | string | Yes | CSV text content |

**CSV format:**

```
email,name,plan,status
user@example.com,User Name,pro,active
```

**Required column:** `email`. Optional columns: `name`, `plan` (default: `"basic"`), `status` (default: `"active"`).

**Response (200):**

```json
{
  "imported": 8,
  "errors": [
    { "row": 3, "reason": "Invalid email: not-an-email" },
    { "row": 7, "reason": "Duplicate email: existing@example.com" }
  ],
  "total": 10
}
```

**Validation:**
- Duplicate emails (within file or against existing members) are skipped.
- Emails over 254 characters are rejected.
- Invalid statuses default to `"active"`.
- Imported members are tagged with `paymentMethod: "manual"`.

---

## PayPal Integration

PayPal checkout flow (currently a stub/mock implementation; structure is production-ready).

### Create PayPal Order

```
POST /membership/checkout/paypal/create
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `planId` | string | Yes | Plan ID |
| `email` | string | Yes | Member email |

**Response (200):**

```json
{
  "orderId": "PAYPAL-550e8400-...",
  "approveUrl": "/membership/checkout/paypal/approve?orderId=PAYPAL-550e8400-..."
}
```

**Errors:** 400 (missing fields, invalid email, PayPal disabled)

---

### Capture PayPal Payment

```
POST /membership/checkout/paypal/capture
```

**Auth:** Public

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | PayPal order ID from create step |

**Response (200):**

```json
{
  "success": true,
  "memberId": "user%40example.com",
  "email": "user@example.com"
}
```

**Behavior:**
- Creates or updates the member record with `status: "active"` and `paymentMethod: "paypal"`.
- Prevents double-capture (returns error if already captured).

**Errors:** 400 (already captured, invalid data), 404 (order not found)

---

### PayPal Webhook (Inbound)

```
POST /membership/webhooks/paypal
```

**Auth:** Public

**Handled events:**

| Event Type | Action |
|------------|--------|
| `PAYMENT.CAPTURE.COMPLETED` | Activates member, sets `paymentMethod: "paypal"` |
| `BILLING.SUBSCRIPTION.CANCELLED` | Cancels member |

**Response (200):**

```json
{
  "received": true,
  "status": "processed",
  "eventType": "PAYMENT.CAPTURE.COMPLETED"
}
```

All events are logged (last 200 entries retained).

---

## Payment Gateways

### List Gateways

```
GET /membership/gateways
```

**Auth:** Public

**Response (200):**

```json
{
  "gateways": [
    { "id": "stripe", "name": "Stripe", "status": "active", "description": "Credit/debit cards via Stripe..." },
    { "id": "paypal", "name": "PayPal", "status": "planned", "description": "PayPal payments. Coming soon..." },
    { "id": "manual", "name": "Manual", "status": "active", "description": "Admin manually marks members as paid..." }
  ]
}
```

---

### Toggle Gateway (Admin)

Enable or disable a payment gateway.

```
POST /membership/admin/gateway-toggle
```

**Auth:** Admin

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gateway` | `"paypal"` \| `"stripe"` \| `"manual"` | Yes | Gateway identifier |
| `enabled` | boolean | Yes | Enable or disable |

**Response (200):**

```json
{
  "success": true,
  "gateway": "paypal",
  "enabled": true
}
```

---

## Health Check

```
GET /membership/health
```

**Auth:** Public

**Response (200):**

```json
{
  "status": "ok",
  "version": "1.5.0",
  "features": [
    "reporting",
    "groups",
    "group-portal",
    "webhooks",
    "forms",
    "categories",
    "venues",
    "series",
    "widgets",
    "csv",
    "paypal",
    "cohorts"
  ]
}
```

---

## Stripe Webhook (Inbound)

Receives and processes Stripe webhook events with signature verification and idempotency.

```
POST /membership/webhook
```

**Auth:** Public (verified via Stripe signature)

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `stripe-signature` | Yes | Stripe webhook signature (`t=...,v1=...`) |

**Required env:** `STRIPE_WEBHOOK_SECRET`

**Handled event types:**

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Sets member active, records subscription ID, sends welcome email |
| `customer.subscription.updated` | Updates billing period end, sends update email |
| `customer.subscription.deleted` | Sets member cancelled, clears subscription, sends cancellation email |
| `invoice.payment_succeeded` | Restores `past_due` members to active, sends receipt email |
| `invoice.payment_failed` | Sets member to `past_due`, sends payment failed email |
| `checkout.session.completed` | Confirms subscription from checkout, sends welcome email |

**Response (200):**

```json
{
  "received": true
}
```

**Behavior:**
- Always returns `200` to prevent Stripe retries (even on internal errors).
- Idempotency: each event ID is stored with 24h TTL to prevent duplicate processing.
- Signature verification uses HMAC-SHA256 with the `STRIPE_WEBHOOK_SECRET`.

---

## Webhook Event Payloads

When the MemberShip plugin fires a developer webhook (registered via `/webhooks/register`), it sends a POST request with the following format.

### HTTP Headers

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `X-Shipyard-Signature` | `sha256=<hex-encoded HMAC-SHA256>` |
| `X-Webhook-Signature` | `sha256=<hex-encoded HMAC-SHA256>` (alias) |
| `X-Shipyard-Event` | Event type string (e.g., `member.created`) |

### Payload Structure

```json
{
  "event": "member.created",
  "timestamp": "2026-04-05T12:00:00.000Z",
  "data": {
    "member_id": "user@example.com",
    "email": "user@example.com",
    "plan_id": "pro",
    "created_at": "2026-04-05T12:00:00.000Z"
  }
}
```

### Verifying Webhook Signatures

Compute HMAC-SHA256 of the raw JSON payload using the `secret` provided at registration:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}

// In your Express handler:
app.post('/your-webhook', (req, res) => {
  const sig = req.headers['x-shipyard-signature'];
  const raw = JSON.stringify(req.body);
  if (!verifySignature(raw, sig, YOUR_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  // Process event...
  res.sendStatus(200);
});
```

### Retry Policy

Failed deliveries are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 (initial) | Immediate |
| 2 (retry 1) | 1 second |
| 3 (retry 2) | 4 seconds |
| 4 (retry 3) | 16 seconds |

After all retries fail, the webhook's `failedCount` is incremented. Check the health dashboard for failing webhooks.

### Rate Limiting

Webhook fires are rate-limited to **100 per minute** across all endpoints. If the limit is exceeded, the delivery is logged with status `429` and skipped.

---

## Error Codes

All error responses use the following JSON format:

```json
{
  "error": "Human-readable error message"
}
```

For form validation errors, an additional `details` array is included:

```json
{
  "error": "Validation failed",
  "details": ["Full Name is required", "Email must be a valid email"]
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request -- missing or invalid input |
| 401 | Unauthorized -- missing or expired JWT token |
| 403 | Forbidden -- admin access required |
| 404 | Not found -- member, plan, group, form, or webhook not found |
| 409 | Conflict -- resource already exists (e.g., duplicate coupon code) |
| 410 | Gone -- resource has expired (e.g., expired group invite) |
| 429 | Too many requests -- rate limited (registration lock or webhook rate limit) |
| 500 | Internal server error |

### Member Status Values

| Status | Description |
|--------|-------------|
| `pending` | Registered but not yet paid / approved |
| `active` | Active membership with valid payment |
| `past_due` | Payment failed; grace period |
| `cancelled` | Subscription cancelled |
| `revoked` | Admin manually revoked access |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_API_SECRET` | For Stripe checkout | Stripe secret key (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | For Stripe webhooks | Stripe webhook signing secret (`whsec_...`) |
| `JWT_SECRET` | For member dashboard | Secret for signing JWT tokens |
| `CRON_SECRET` | For drip processing | Shared secret for cron job authentication |
| `APP_URL` | For invite links | Base URL of the application |
