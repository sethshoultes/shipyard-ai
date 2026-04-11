# MemberShip Plugin Configuration Guide

**Product:** MemberShip
**Version:** 1.0.0
**Platform:** EmDash CMS

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Stripe Configuration](#stripe-configuration)
3. [Email Configuration](#email-configuration)
4. [Membership Plans](#membership-plans)
5. [JWT Authentication](#jwt-authentication)
6. [Content Gating](#content-gating)
7. [Coupons and Discounts](#coupons-and-discounts)
8. [Webhooks](#webhooks)
9. [Admin Dashboard](#admin-dashboard)

---

## Environment Variables

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Stripe API key for backend operations | `sk_test_123...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe key for frontend checkout | `pk_test_456...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | `whsec_789...` |
| `JWT_SECRET` | Secret for signing JWT tokens | Random 32+ character string |
| `RESEND_API_KEY` | Email delivery service API key | `re_abc123...` |

### Optional Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `MEMBERSHIP_EMAIL_FROM` | Sender email address | `noreply@yoursite.com` |
| `CRON_SECRET` | Shared secret for cron job authentication | (none) |
| `APP_URL` | Base URL for invite links | Auto-detected |

### Example .env File

```bash
# Stripe (required)
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_ABC123...

# Authentication (required)
JWT_SECRET=your-random-32-character-secret-key-here

# Email (required)
RESEND_API_KEY=re_ABC123...
MEMBERSHIP_EMAIL_FROM=membership@yoursite.com

# Optional
CRON_SECRET=cron-job-secret
APP_URL=https://yoursite.com
```

---

## Stripe Configuration

### Getting API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the **test mode** keys (start with `pk_test_` and `sk_test_`)

### Webhook Setup

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://your-site.com/membership/webhook`
   - **Events to listen for:**
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)

### Test Cards

For testing in Stripe test mode:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0341` | Attach fails |
| `4000 0000 0000 9995` | Insufficient funds |

---

## Email Configuration

### Resend Setup

1. Create a [Resend account](https://resend.com)
2. Verify your sending domain
3. Generate an API key
4. Add to `.env` as `RESEND_API_KEY`

### Email Templates

The plugin sends automatic emails for:

| Event | Template | Variables |
|-------|----------|-----------|
| Registration | Welcome Email | `{memberName}`, `{planName}`, `{dashboardUrl}` |
| Payment | Receipt Email | `{amount}`, `{planName}`, `{date}`, `{invoiceUrl}` |
| Renewal Reminder | Reminder Email | `{renewalDate}`, `{amount}`, `{planName}` |
| Payment Failed | Alert Email | `{amount}`, `{retryUrl}` |
| Cancellation | Confirmation Email | `{cancellationDate}`, `{planName}` |

---

## Membership Plans

### Default Plans

The plugin includes three default plans:

```json
[
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
    "features": ["All content", "Priority support", "Early access", "Annual digest"]
  }
]
```

**Note:** Prices are in cents (99 = $0.99, 999 = $9.99).

### Plan Configuration

Plans support these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `price` | number | Yes | Price in cents (0 for free) |
| `interval` | string | Yes | `"once"`, `"month"`, or `"year"` |
| `description` | string | No | Short description |
| `features` | array | No | List of feature strings |

### Creating Plans via API

```bash
curl -X POST https://your-site.com/membership/plans \
  -H "Content-Type: application/json" \
  -d '{
    "id": "enterprise",
    "name": "Enterprise",
    "price": 49900,
    "interval": "year",
    "description": "For teams",
    "features": ["Unlimited seats", "Priority support", "Custom integrations"]
  }'
```

---

## JWT Authentication

### Token Configuration

- **Access Token TTL:** 15 minutes
- **Refresh Token TTL:** 7 days
- **Storage:** httpOnly cookies (secure, SameSite=Strict)

### Security Best Practices

1. Use a strong `JWT_SECRET` (32+ random characters)
2. Regenerate secrets periodically
3. Always use HTTPS in production
4. Monitor for unusual authentication patterns

### Token Refresh Flow

1. Client makes request with access token
2. If expired (401 response), call `/auth/refresh`
3. New access token issued from refresh cookie
4. Client retries original request

---

## Content Gating

### Portable Text Block

Gate content using the `gated-content` block type:

```json
{
  "_type": "gated-content",
  "_key": "premium-guide",
  "requiredPlan": "pro",
  "fallbackMessage": "Upgrade to Pro to access this guide.",
  "children": [
    { "_type": "block", "children": [{ "text": "Premium content here..." }] }
  ]
}
```

### Gating Rules

Create programmatic access rules via API:

```bash
curl -X POST https://your-site.com/membership/gating/rules \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "page-premium-guide",
    "targetType": "page",
    "planIds": ["pro", "premium"],
    "type": "membership"
  }'
```

### Drip Content

Release content over time after signup:

```bash
curl -X POST https://your-site.com/membership/gating/rules \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "week-2-content",
    "planIds": ["pro"],
    "type": "drip",
    "dripDays": 14
  }'
```

---

## Coupons and Discounts

### Creating Coupons

```bash
curl -X POST https://your-site.com/membership/coupons/create \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "discountType": "percent",
    "discountAmount": 20,
    "maxUses": 100,
    "expiresAt": "2026-12-31",
    "applicablePlans": ["pro", "premium"]
  }'
```

### Coupon Options

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Coupon code (auto-uppercased) |
| `discountType` | string | `"percent"` or `"fixed"` |
| `discountAmount` | number | Percentage (1-100) or cents |
| `maxUses` | number | Maximum redemptions |
| `expiresAt` | string | Expiration date (ISO 8601) |
| `applicablePlans` | array | Restrict to specific plans |

---

## Webhooks

### Registering Developer Webhooks

```bash
curl -X POST https://your-site.com/membership/webhooks/register \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["member.created", "member.cancelled", "payment.succeeded"]
  }'
```

### Available Events

| Event | Description |
|-------|-------------|
| `member.created` | New member registered |
| `member.activated` | Member activated (payment confirmed) |
| `member.cancelled` | Subscription cancelled |
| `member.expired` | Subscription expired |
| `member.upgraded` | Plan changed |
| `payment.succeeded` | Payment received |
| `payment.failed` | Payment failed |

### Webhook Security

All webhooks are signed with HMAC-SHA256. Verify signatures:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}
```

---

## Admin Dashboard

### Admin Pages

The plugin adds these pages to EmDash admin:

| Path | Label | Description |
|------|-------|-------------|
| `/members` | Members | Member list with search/filter |
| `/plans` | Plans | Plan management |
| `/reporting` | Reporting | Revenue and analytics |

### Admin Widgets

Dashboard widgets show:
- **Active Members** - Current active member count
- **Total Revenue (MRR)** - Monthly recurring revenue

### Admin Actions

From the admin dashboard:
- **Approve** pending members
- **Revoke** access from members
- **Mark as Paid** for manual payments
- **Create/manage** coupons
- **Export** members to CSV
- **Import** members from CSV

---

## Data Storage

All data is stored in KV (key-value store):

| Key Pattern | Purpose |
|-------------|---------|
| `plans` | Membership plans configuration |
| `member:{email}` | Individual member records |
| `members:list` | List of all member emails |
| `coupon:{code}` | Coupon details |
| `coupons:list` | List of all coupon codes |
| `group:{id}` | Group/organization records |
| `webhook:{id}` | Registered webhook endpoints |

---

## Next Steps

- [API Reference](./API-reference.md) - Full REST API documentation
- [Troubleshooting](./Troubleshooting.md) - Common issues and solutions

---

*Copyright Shipyard AI. Included with EmDash.*
