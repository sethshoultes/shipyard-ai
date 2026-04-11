# MemberShip Plugin Installation Guide

**Product:** MemberShip
**Version:** 1.0.0
**Platform:** EmDash CMS

---

## Overview

MemberShip is an email-based membership and gated content plugin for EmDash CMS. It provides full Stripe integration, member dashboards, JWT authentication, email automation, and content gating.

---

## Prerequisites

Before installing MemberShip, ensure you have:

- **EmDash CMS** v0.1.0 or higher
- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Stripe account** (for payment processing)
- A **Resend account** (for email delivery)

---

## Installation Steps

### Step 1: Install the Package

Add the MemberShip plugin to your EmDash site:

```bash
npm install @shipyard/membership
```

### Step 2: Configure Astro Integration

Add the plugin to your `astro.config.mjs`:

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

### Step 3: Set Environment Variables

Create or update your `.env` file with the required variables:

```bash
# Stripe API keys (required)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# JWT signing secret (required)
JWT_SECRET=your_random_secret_key_here

# Email service (required)
RESEND_API_KEY=re_...

# Optional settings
MEMBERSHIP_EMAIL_FROM=noreply@yoursite.com
```

### Step 4: Configure Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-site.com/membership/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Copy the **Webhook Signing Secret** and add it to your `.env` as `STRIPE_WEBHOOK_SECRET`

### Step 5: Build and Deploy

```bash
npm run build
npm run deploy
```

---

## Verification

After installation, verify the plugin is working:

1. **Health Check**: Visit `https://your-site.com/membership/health`

   Expected response:
   ```json
   {
     "status": "ok",
     "version": "1.0.0",
     "features": ["reporting", "webhooks"]
   }
   ```

2. **List Plans**: Visit `https://your-site.com/membership/plans`

   Expected response:
   ```json
   {
     "plans": [
       { "id": "free", "name": "Free", "price": 0 },
       { "id": "pro", "name": "Pro", "price": 99 }
     ]
   }
   ```

3. **Admin Dashboard**: Log in to EmDash admin and navigate to **Members** in the sidebar

---

## Upgrading

To upgrade to a newer version:

```bash
npm update @shipyard/membership
npm run build
npm run deploy
```

---

## Uninstalling

To remove the MemberShip plugin:

1. Remove from `astro.config.mjs`:
   ```javascript
   // Remove: plugins: [membershipPlugin()]
   ```

2. Uninstall the package:
   ```bash
   npm uninstall @shipyard/membership
   ```

3. Remove environment variables from `.env`

4. (Optional) Delete member data from KV storage

---

## Next Steps

- [Configuration Guide](./Configuration.md) - Set up plans, email templates, and admin settings
- [API Reference](./API-reference.md) - Full REST API documentation
- [Troubleshooting](./Troubleshooting.md) - Common issues and solutions

---

## Support

For issues or questions:
- Review the [Troubleshooting Guide](./Troubleshooting.md)
- Check EmDash documentation
- Contact Shipyard AI support

---

*Copyright Shipyard AI. Included with EmDash.*
