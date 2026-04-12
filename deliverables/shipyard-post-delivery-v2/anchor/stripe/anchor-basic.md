# Anchor Basic — $79/month

**Product Name:** Anchor Basic
**Price:** $79/month (recurring subscription)
**Stripe Product Type:** Subscription

---

## Product Description (for Stripe)

**Name:** Anchor Basic
**Description:** Ongoing site care for peace of mind. Content updates, bug fixes, and we stay on call.

---

## Features

| Feature | Detail |
|---------|--------|
| **Token Allowance** | 50,000 tokens/month for updates |
| **Scope** | Content changes, bug fixes, minor tweaks |
| **Response Time** | 48 hours |
| **Request Method** | Email-based requests (reply to any Anchor email) |
| **Rollover** | Tokens do not roll over |

---

## What's Included

- **Content Updates:** Text changes, image swaps, new pages within token budget
- **Bug Fixes:** Anything broken, we fix it
- **Minor Tweaks:** Layout adjustments, color changes, small improvements
- **On-Call Support:** Reply to any email, we respond within 48 hours
- **Quarterly Check-in:** We proactively reach out to see how things are going

---

## What's NOT Included

- Priority queue (that's Anchor Pro)
- Major feature development
- Full site redesigns
- Third-party integrations requiring custom development
- Work exceeding 50K tokens/month (quoted separately)

---

## Positioning

**For clients who want peace of mind without a big commitment.**

Anchor Basic is the "set it and forget it" option. Your site works, you occasionally need a tweak, and you want someone on call. Not a big investment, but enough to know you're covered.

**Messaging:**
- "Keep us on call for $79/month"
- "Updates, fixes, peace of mind"
- "We don't disappear—for less than a dinner out"

---

## Stripe Setup Instructions

### Step 1: Create Product

1. Log into Stripe Dashboard
2. Go to **Products** → **Add Product**
3. Enter:
   - **Name:** Anchor Basic
   - **Description:** Ongoing site care. Content updates, bug fixes, 48-hour response. 50K tokens/month.
   - **Image:** (optional) Anchor logo

### Step 2: Create Price

1. In the product, click **Add Price**
2. Enter:
   - **Price:** $79.00
   - **Billing period:** Monthly
   - **Currency:** USD

### Step 3: Generate Payment Link

1. Go to **Payment Links** → **Create Payment Link**
2. Select the Anchor Basic price
3. Settings:
   - **Confirmation page:** Custom (or default)
   - **Collect customer email:** Yes
   - **Allow promotion codes:** Optional
4. Copy the generated URL

### Step 4: Add to Email Templates

Replace `{{MAINTENANCE_LINK}}` in email templates with:
- Option A: Direct payment link
- Option B: Landing page with both tier options

---

## Payment Link Configuration

```
{{ANCHOR_BASIC_LINK}}
```

**Example:** `https://buy.stripe.com/test_abc123xyz`

---

## Upgrade Path

Clients on Anchor Basic can upgrade to Anchor Pro at any time:
- Additional $70/month
- Immediate access to priority queue
- Quarterly refresh proposals included

Upgrade via email request or Stripe customer portal.

---

## Cancellation Policy

- Cancel anytime via Stripe customer portal
- No refunds for partial months
- Access continues until end of current billing period
- Re-enrollment available at current rates

---

*Per Decision #1 and #2: Product named "Anchor", not "maintenance plans." Two tiers from day one.*
*Price: $79/month per final decisions document.*
