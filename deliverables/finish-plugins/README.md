# Membership Plugin for EmDash

Email-based membership and gated content plugin for EmDash CMS with full Stripe integration, member dashboard, JWT authentication, email automation, coupon discount codes, drip content, and member portals.

**Version:** 3.0.0  
**Status:** Production  
**Phase:** 3 (Complete with Stripe, Dashboard, JWT, Webhooks, Coupons, Drip Content, Portals, Gating)

## Features

### Membership & Plans
- **Flexible membership plans** — Configure unlimited plans with custom prices, intervals (once, monthly, yearly), and features
- **Email-only registration** — No password required; email is the unique identifier
- **Free and paid plans** — Support free tier, time-limited trials, and recurring subscriptions
- **Plan management** — Admin UI to create, edit, and manage all membership plans

### Payment Processing
- **Stripe Checkout integration** — Direct Stripe Checkout for one-click payment (no Payment Links required)
- **Multiple payment intervals** — Support once, monthly, and yearly billing cycles
- **Stripe customer management** — Automatic creation and syncing of Stripe customers and subscriptions
- **Webhook support** — Real-time payment events (charge succeeded, refunded, subscription cancelled, etc.)
- **Revenue tracking** — Total revenue per plan and member lifetime value
- **Failed payment handling** — Track failed and refunded transactions; contact members for retry

### Member Authentication
- **JWT-based auth** — Secure httpOnly cookies with JWT tokens (15-minute access, 7-day refresh)
- **Token refresh flow** — Automatic token refresh without re-authentication
- **Member dashboard** — Authenticated portal for members to view subscriptions, update payment methods, and manage their account
- **Session persistence** — Tokens stored securely in httpOnly cookies; no localStorage

### Content Gating (Phase 3)
- **Portable Text block** — `gated-content` block to restrict content to specific plans
- **Granular access control** — Gate by specific plan (e.g., Pro only) or any active member
- **Fallback messaging** — Show custom message to non-members with upgrade call-to-action
- **Public status checks** — Query member status without authentication
- **Drip content unlock** — Time-released access based on days after join date
- **Automatic unlock processing** — Admin cron endpoint processes drips daily at UTC midnight
- **Unlock notifications** — Email sent when drip content becomes available
- **Access rules engine** — Create membership/drip rules for any content

### Member Portal (Phase 3)
- **Content library view** — Display accessible and locked content with unlock dates
- **Plan information** — Show current plan, features, renewal date, payment method
- **Drip schedule visibility** — See when locked content will unlock
- **Skeleton loading** — Smooth UX with placeholder content during fetch
- **Mobile responsive** — Optimized for 320px+ devices with 44px touch targets
- **Accessibility** — WCAG 2.1 AA compliant with aria-labels and focus indicators

### Email Automation
- **Welcome email** — Sent on successful registration
- **Payment receipt** — Automatic invoice email after payment
- **Payment failure alerts** — Email when payment fails with retry instructions
- **Renewal reminders** — Email 7 days before subscription renews
- **Cancellation confirmation** — Email when member cancels subscription
- **Upgrade notification** — Email when member upgrades plan
- **Customizable templates** — Use Portable Text or HTML for email templates
- **Resend integration** — High-deliverability email via Resend API

### Admin Features
- **Members table** — View all members with status, plan, signup date, expiry date
- **Search & filter** — Filter by plan, status (active/inactive), or date range
- **Approve/revoke actions** — Manually approve pending members or revoke access
- **Coupons management** — Create, list, and manage discount codes with usage limits
- **Plans management** — View all plans with member counts and MRR (Monthly Recurring Revenue)
- **Revenue dashboard** — Total revenue, MRR, and per-plan breakdown
- **Cron jobs** — Automated token refresh, renewal reminder emails, and subscription cleanup

### Coupons & Discounts
- **Percentage and fixed discounts** — Create $5 off or 10% off coupons
- **Usage limits** — Set maximum uses per coupon
- **Expiration dates** — Auto-expire coupons on specified dates
- **Plan restrictions** — Limit coupon to specific plans or open to all
- **Real-time validation** — Validate coupons during checkout with instant feedback
- **Tracking** — Count uses and log applied coupons per member

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

## Environment Configuration

Add these variables to your `.env` file:

```bash
# Stripe API keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# JWT signing secret (generate a random string)
JWT_SECRET=your_random_secret_key_here

# Email service (Resend)
RESEND_API_KEY=re_...

# Optional: Email sender
MEMBERSHIP_EMAIL_FROM=noreply@yoursite.com
```

### Environment Variable Reference

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Yes | Stripe API key for backend | `sk_test_123...` |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe key for frontend | `pk_test_456...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signature verification | `whsec_789...` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens | Random 32+ char string |
| `RESEND_API_KEY` | Yes | Email delivery service | `re_abc123...` |
| `MEMBERSHIP_EMAIL_FROM` | No | Sender email address | `noreply@site.com` |

## Configuration

### Setup Stripe

1. **Create a Stripe account** at https://stripe.com
2. **Get API keys** from https://dashboard.stripe.com/apikeys
3. **Create a webhook endpoint:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-site.com/membership/webhooks/stripe`
   - Select events: `charge.succeeded`, `charge.refunded`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the Webhook Signing Secret
4. **Add keys to `.env`:**
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Create Membership Plans

Plans are created via the admin API. Default plans:

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
  "price": 9900,
  "interval": "month",
  "description": "Full access with support",
  "features": ["All content", "Priority email support", "Monthly newsletter"]
}
```

```json
{
  "id": "premium",
  "name": "Premium",
  "price": 99900,
  "interval": "year",
  "description": "VIP access",
  "features": ["All content", "Priority support", "Early access", "Annual digest"]
}
```

Prices are in cents (99 = $0.99, 9900 = $99.00).

## API Routes

All endpoints are at `/_emdash/api/plugins/membership/<route>`.

### Authentication Routes

#### `POST /auth/register`
Register a new member and return JWT token.

**Access:** Public

**Input:**
```json
{
  "email": "user@example.com",
  "plan": "pro"
}
```

**Response:**
```json
{
  "success": true,
  "memberId": "user@example.com",
  "email": "user@example.com",
  "plan": "pro",
  "status": "active",
  "token": "eyJhbGc...",
  "message": "Member registered"
}
```

#### `POST /auth/login`
Authenticate and get JWT token (email-based, no password).

**Access:** Public

**Input:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "expiresIn": 900,
  "message": "Login successful"
}
```

#### `POST /auth/refresh`
Refresh an expired JWT token.

**Access:** Public (requires valid refresh token in cookie)

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "expiresIn": 900
}
```

### Member Routes

#### `GET /member/me`
Get current authenticated member details.

**Access:** Requires valid JWT token

**Response:**
```json
{
  "email": "user@example.com",
  "plan": "pro",
  "status": "active",
  "createdAt": "2026-01-15T10:00:00Z",
  "expiresAt": "2026-02-15T10:00:00Z",
  "stripeCustomerId": "cus_123...",
  "stripeSubscriptionId": "sub_456...",
  "stripePaymentMethod": "visa ••••4242"
}
```

#### `GET /member/status?email=user@example.com`
Check membership status (no auth required).

**Access:** Public

**Response:**
```json
{
  "email": "user@example.com",
  "active": true,
  "plan": "pro",
  "status": "active",
  "expiresAt": "2026-02-15T10:00:00Z"
}
```

### Checkout Routes

#### `POST /checkout/create`
Create a Stripe Checkout session for payment.

**Access:** Requires valid JWT token

**Input:**
```json
{
  "planId": "pro",
  "couponCode": "SAVE10" (optional)
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
Retrieve checkout success details.

**Access:** Public

**Response:**
```json
{
  "success": true,
  "email": "user@example.com",
  "plan": "pro",
  "amount": 9900,
  "status": "paid",
  "message": "Payment confirmed"
}
```

### Dashboard Routes

#### `GET /dashboard`
Get member dashboard data (subscriptions, usage, billing).

**Access:** Requires valid JWT token

**Response:**
```json
{
  "member": { ... },
  "subscriptions": [
    {
      "id": "sub_123...",
      "plan": "pro",
      "status": "active",
      "currentPeriodEnd": "2026-02-15T10:00:00Z",
      "cancelAtPeriodEnd": false
    }
  ],
  "invoices": [
    {
      "id": "in_123...",
      "amount": 9900,
      "date": "2026-01-15",
      "status": "paid"
    }
  ]
}
```

#### `POST /dashboard/upgrade`
Upgrade to a higher plan.

**Access:** Requires valid JWT token

**Input:**
```json
{
  "newPlanId": "premium"
}
```

**Response:**
```json
{
  "success": true,
  "newPlan": "Premium",
  "newPrice": 99900,
  "message": "Successfully upgraded to Premium"
}
```

#### `POST /dashboard/downgrade`
Downgrade to a lower plan (prorated).

**Access:** Requires valid JWT token

**Input:**
```json
{
  "newPlanId": "free"
}
```

**Response:**
```json
{
  "success": true,
  "newPlan": "Free",
  "message": "Downgraded to Free plan"
}
```

#### `POST /dashboard/cancel`
Cancel membership (takes effect at end of billing period).

**Access:** Requires valid JWT token

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled at end of billing period"
}
```

### Coupon Routes

#### `POST /coupons/create`
Create a new coupon (admin only).

**Access:** Admin only

**Input:**
```json
{
  "code": "SAVE10",
  "discountType": "percent",
  "discountAmount": 10,
  "maxUses": 100,
  "expiresAt": "2026-12-31",
  "applicablePlans": ["pro", "premium"],
  "description": "Holiday sale"
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "code": "SAVE10",
    "discountType": "percent",
    "discountAmount": 10,
    "usedCount": 0,
    "maxUses": 100,
    "expiresAt": "2026-12-31",
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

#### `GET /coupons`
List all coupons (admin only).

**Access:** Admin only

**Response:**
```json
{
  "coupons": [
    {
      "code": "SAVE10",
      "discountType": "percent",
      "discountAmount": 10,
      "usedCount": 24,
      "maxUses": 100,
      "expiresAt": "2026-12-31"
    }
  ],
  "total": 1
}
```

#### `POST /coupons/validate`
Validate a coupon code (public).

**Access:** Public

**Input:**
```json
{
  "code": "SAVE10",
  "planId": "pro"
}
```

**Response (valid):**
```json
{
  "valid": true,
  "discountType": "percent",
  "discountAmount": 10,
  "message": "Save 10% with this code!"
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "reason": "Coupon has expired"
}
```

### Plan Routes

#### `GET /plans`
Get all available membership plans.

**Access:** Public

**Response:**
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
      "price": 9900,
      "interval": "month",
      "description": "Full access",
      "features": ["All content", "Priority support"]
    }
  ]
}
```

#### `POST /approve`
Manually approve a pending member (admin only).

**Access:** Admin only

**Input:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

#### `POST /revoke`
Revoke a member's access (admin only).

**Access:** Admin only

**Input:**
```json
{
  "email": "user@example.com"
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

**Access:** Public (Stripe IP whitelist via signature verification)

**Handled Events:**
- `charge.succeeded` — Payment successful
- `charge.refunded` — Payment refunded
- `charge.failed` — Payment failed
- `customer.subscription.updated` — Subscription changed
- `customer.subscription.deleted` — Subscription cancelled
- `invoice.payment_failed` — Invoice payment failed

## Email Templates

The plugin supports automatic email notifications for all membership events:

### Welcome Email
Sent when member registers.

**Variables:**
- `{memberName}` — Member's name (if available)
- `{planName}` — Membership plan name
- `{planPrice}` — Plan price
- `{billingInterval}` — Billing interval (month/year/once)
- `{dashboardUrl}` — Link to member dashboard

### Payment Receipt
Sent after successful payment.

**Variables:**
- `{amount}` — Payment amount
- `{planName}` — Plan purchased
- `{date}` — Transaction date
- `{invoiceUrl}` — Link to invoice

### Renewal Reminder
Sent 7 days before subscription renews.

**Variables:**
- `{renewalDate}` — When renewal occurs
- `{amount}` — Renewal amount
- `{planName}` — Current plan

### Cancellation Confirmation
Sent when member cancels.

**Variables:**
- `{cancellationDate}` — When access ends
- `{planName}` — Cancelled plan
- `{refundInfo}` — Refund details if applicable

## Data Storage

All data is stored in KV (key-value store):

| Key | Format | Purpose |
|-----|--------|---------|
| `plans` | JSON array | Membership plans config |
| `member:{email}` | JSON object | Member record |
| `members:list` | JSON array | All member emails |
| `coupon:{code}` | JSON object | Coupon details |
| `coupons:list` | JSON array | All coupon codes |

### MemberRecord Schema

```typescript
interface MemberRecord {
  email: string;
  plan: string;
  status: "pending" | "active" | "revoked" | "cancelled" | "past_due";
  createdAt: string;
  expiresAt?: string;
  approvedAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentMethod?: string;
  planInterval?: "month" | "year" | "once";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  lastSyncAt?: string;
}
```

### CouponRecord Schema

```typescript
interface CouponRecord {
  code: string;
  discountType: "percent" | "fixed";
  discountAmount: number;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  applicablePlans?: string[];
  createdAt: string;
  description?: string;
}
```

## Portable Text Blocks

### gated-content

Gate content visible only to members with specific plans.

**Fields:**
- `requiredPlan` (optional) — Plan ID. If empty, any active member can see it.
- `fallbackMessage` (optional) — Message for non-members.

**Example:**

```json
{
  "_type": "gated-content",
  "_key": "premium-guide",
  "requiredPlan": "pro",
  "fallbackMessage": "Upgrade to Pro to access this guide.",
  "children": [
    {
      "_type": "heading",
      "children": [{ "text": "Exclusive Guide" }]
    }
  ]
}
```

## Member Flow

```
Registration
  ├─ Free Plan
  │   ├─ Email sent (welcome)
  │   └─ Status: Active immediately
  │
  └─ Paid Plan
      ├─ Checkout session created
      ├─ Stripe payment processed
      ├─ Webhook confirms charge.succeeded
      ├─ Stripe customer + subscription created
      ├─ Email sent (receipt)
      └─ Status: Active (recurring)

Member Dashboard
  ├─ View current subscription
  ├─ Update payment method
  ├─ Upgrade/downgrade plan
  ├─ Cancel subscription
  └─ View billing history

Subscription Renewal
  ├─ 7 days before: renewal reminder email
  ├─ On renewal date: charge customer
  ├─ On success: refresh member record, send receipt
  └─ On failure: send payment failure email

Cancellation
  ├─ Member requests cancellation
  ├─ Stripe subscription marked cancel_at_period_end
  ├─ Email confirmation sent
  ├─ At period end: subscription deleted
  └─ Status: Cancelled
```

## Troubleshooting

### Member can't access gated content
1. Check status: `GET /member/status?email=user@example.com`
2. Verify JWT token is set in httpOnly cookie
3. Check expiry date hasn't passed
4. Confirm plan has required access

### Payment fails
1. Verify Stripe keys are correct
2. Check webhook endpoint is configured
3. Review Stripe dashboard for error logs
4. Ensure payment method is valid

### Email not sending
1. Verify RESEND_API_KEY is set
2. Check email logs in admin
3. Verify sender email is allowlisted in Resend
4. Check spam folder

### Webhook not receiving events
1. Verify webhook secret matches
2. Confirm endpoint URL is reachable
3. Check Stripe dashboard → Webhooks → Event logs
4. Verify required event types are selected

## Best Practices

1. **Security**
   - Keep JWT_SECRET secure
   - Use https in production
   - Regenerate secrets periodically
   - Monitor failed payment patterns

2. **Stripe Setup**
   - Test in Stripe test mode first
   - Use test card: 4242 4242 4242 4242
   - Create invoice templates in Stripe dashboard
   - Set up dunning management for failed payments

3. **Email**
   - Test email templates before launch
   - Monitor deliverability rates
   - Add unsubscribe links
   - Verify sender domain

4. **Coupons**
   - Create time-limited promotions
   - Track ROI per coupon
   - Expire old coupons regularly
   - Limit usage to prevent abuse

5. **Member Communication**
   - Welcome email with clear onboarding
   - Renewal reminders 7 days before
   - Failed payment alerts with retry link
   - Cancellation exit surveys

## Support & Debugging

**View logs:**
- Admin UI → System → Logs
- Search for "membership" or error keywords

**Check KV storage:**
- Admin UI → Developer Tools → KV Store
- View member records and coupon codes

**Stripe dashboard:**
- Review failed payments
- Check webhook delivery status
- Monitor customer and subscription events

## License

Copyright © Shipyard AI. Included with EmDash.
