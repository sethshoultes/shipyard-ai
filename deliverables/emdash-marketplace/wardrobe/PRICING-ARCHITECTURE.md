# Wardrobe Pricing Architecture

**Product:** Theme marketplace for Emdash CMS
**Version:** Q3 2026 (Premium Launch)
**Status:** Planned — Not in V1 (Free tier only)
**Last Updated:** April 9, 2026

---

## Overview

This document defines the pricing structure for Wardrobe premium themes. V1 ships with **free themes only**. Premium tier architecture is documented here to guide implementation decisions and unblock board requirements.

Per [decisions.md](./decisions.md) line 264: "Build pricing rails in V2." This document is the blueprint.

---

## Tier Structure

### Free Tier
- **Price:** $0 (Forever free)
- **Themes:** All 5 launch themes (Ember, Forge, Slate, Drift, Bloom)
- **Features:**
  - Install via `npx wardrobe install [theme]`
  - Full customization with theme variables
  - No license key required
  - No time limits or trials
- **Target:** Broad adoption, zero friction entry point
- **License Model:** Open source (MIT or Apache 2.0)

### Premium Tier
- **Price:** $99/year or $29 one-time purchase (TBD post-board-review)
- **Launch:** Q3 2026 (post-V1)
- **Themes:** Exclusive premium themes (designed after V1 launch)
- **Features:**
  - All Free tier features
  - Priority support (24h response time)
  - Early access to upcoming themes
  - License key required
  - Custom domain support for showcase
- **Target:** Professional designers, agencies, small businesses
- **License Model:** Proprietary (single-site or multi-site)

### Pro Tier (Future — Post-Q3 2026)
- **Price:** $499/year or $599 one-time (aspirational)
- **Launch:** Q4 2026 or later
- **Themes:** All Premium themes + exclusive Pro themes
- **Features:**
  - White-label theming (remove Wardrobe branding)
  - Custom theme development services (retainer-based)
  - Dedicated account manager
  - Priority feature requests
  - Multi-site license (up to 5 domains)
  - Advanced analytics
- **Target:** Enterprises, theme resellers, design agencies
- **License Model:** Proprietary with commercial use rights

---

## Pricing Decision Rationale

### Free Tier Rationale
- V1 goal is adoption, not revenue (per board: "Adoption is the only metric")
- Removes purchase friction for discovery
- Establishes market position before monetization
- Allows focus on quality over payment infrastructure

### Premium Tier Price Points
**Annual ($99/year):**
- Recurring revenue enables ongoing theme development
- Lower barrier to trial adoption
- Aligns with SaaS industry standards ($8-10/month equivalent)
- Sustainable for small creator audience

**One-Time ($29):**
- Alternative for users opposed to subscriptions
- Lower revenue per user but higher conversion
- Final decision depends on board preference post-review

**Pro Tier ($499-599/year):**
- 5-10x premium for white-label + custom services
- Targets 1-3 customers in first year (not revenue driver)
- Establishes pricing ceiling for market positioning

---

## Registry Schema Extension

All theme metadata is stored in `registry/themes.json`. This schema extension enables tier-aware distribution.

### Current Theme Registry Entry (V1)
```json
{
  "id": "ember",
  "name": "Ember",
  "description": "Bold, editorial. For people with something to say.",
  "version": "1.0.0",
  "author": "Wardrobe Team",
  "license": "MIT",
  "downloadUrl": "https://r2.cdn.wardrobe.sh/themes/ember-1.0.0.tar.gz",
  "checksumSha256": "abc123...",
  "screenshots": [
    { "url": "https://cdn.wardrobe.sh/screenshots/ember-1.png", "caption": "Homepage" },
    { "url": "https://cdn.wardrobe.sh/screenshots/ember-2.png", "caption": "Blog" }
  ],
  "compatibleVersions": { "emdash": ">=1.0.0" },
  "personality": "bold",
  "targetUser": "Editorial, opinion-driven content"
}
```

### Extended Schema (Q3 2026 with Premium Support)
```json
{
  "id": "ember",
  "name": "Ember",
  "description": "Bold, editorial. For people with something to say.",
  "version": "1.0.0",
  "author": "Wardrobe Team",
  "license": "MIT",

  // NEW: Tier and pricing fields
  "tier": "free",                    // "free" | "premium" | "pro"
  "price": null,                     // null for free; { "annual": 99, "oneTime": 29 } for premium
  "licenseRequired": false,          // false for free themes
  "licenseUrl": null,                // URL to license validation endpoint
  "trialDays": 0,                    // Days of free trial before license required

  "downloadUrl": "https://r2.cdn.wardrobe.sh/themes/ember-1.0.0.tar.gz",
  "checksumSha256": "abc123...",

  "screenshots": [
    { "url": "https://cdn.wardrobe.sh/screenshots/ember-1.png", "caption": "Homepage" },
    { "url": "https://cdn.wardrobe.sh/screenshots/ember-2.png", "caption": "Blog" }
  ],

  "compatibleVersions": { "emdash": ">=1.0.0" },
  "personality": "bold",
  "targetUser": "Editorial, opinion-driven content"
}
```

### Premium Theme Example (Q3 2026)
```json
{
  "id": "obsidian",
  "name": "Obsidian",
  "description": "Luxe, premium showcase. For high-end brands.",
  "version": "1.0.0",
  "author": "Wardrobe Team",
  "license": "Proprietary",

  "tier": "premium",
  "price": {
    "annual": 99,
    "oneTime": 29,
    "currency": "USD"
  },
  "licenseRequired": true,
  "licenseUrl": "https://api.wardrobe.sh/v1/licenses/validate",
  "trialDays": 14,

  "downloadUrl": "https://r2.cdn.wardrobe.sh/themes/obsidian-1.0.0.tar.gz",
  "checksumSha256": "def456...",

  "screenshots": [...],
  "compatibleVersions": { "emdash": ">=1.0.0" },
  "releaseDate": "2026-07-01",
  "features": [
    "Custom font support",
    "Advanced color schemes",
    "Animation options"
  ]
}
```

### Schema Validation Rules
- `tier` must be one of: "free", "premium", "pro"
- `free` themes: `price` must be null, `licenseRequired` must be false
- `premium`/`pro` themes: `price` must be an object with `annual` and/or `oneTime` keys
- `licenseRequired` must be true if `tier` is not "free"
- All prices in cents (e.g., 9900 = $99.00) for currency precision

---

## CLI Behavior for Paid Themes

The Wardrobe CLI (`wardrobe` command) will be updated to handle paid theme installation.

### User Flow: Installing a Premium Theme

#### Step 1: List Available Themes
```bash
$ npx wardrobe list

Available Themes:
  ✓ Ember (free)           - Bold, editorial
  ✓ Forge (free)           - Dark, technical
  ✓ Slate (free)           - Clean, professional
  ✓ Drift (free)           - Minimal, airy
  ✓ Bloom (free)           - Warm, organic
  🔒 Obsidian (premium)   - Luxe showcase ($99/year)
  🔒 Aurora (premium)      - Vibrant, modern ($99/year)

Tip: Free themes install immediately. Premium themes require a license key.
```

#### Step 2: Attempt Premium Install
```bash
$ npx wardrobe install obsidian

🔒 This is a premium theme ($99/year).

Options:
  1. Enter license key (if you own it)
  2. View purchase page
  3. Try 14-day free trial
  4. Cancel

Choose:
```

#### Step 3a: User Has License Key
```bash
$ npx wardrobe install obsidian --license-key sk_live_abcd1234

Validating license... ✓
License valid for: example.com
Expires: 2026-04-09 23:59:59 UTC

Installing Obsidian v1.0.0...
↓ Downloaded (234 KB)
✓ Installed in 2.3s

Your site is now wearing Obsidian.
```

#### Step 3b: User Wants to Purchase
```
Opening: https://wardrobe.sh/themes/obsidian/purchase

🌐 Browser opened. Complete purchase and return here with your license key.
```

#### Step 3c: User Wants Trial
```bash
✓ 14-day trial activated
License key generated: trial_obsidian_14d_xyz789

Installing Obsidian v1.0.0...
↓ Downloaded (234 KB)
✓ Installed in 2.3s

Trial expires: 2026-04-23
To purchase: npx wardrobe upgrade obsidian
```

### Implementation Details

#### License Key Generation
- Format: `sk_live_[base64]` (production) or `sk_test_[base64]` (testing)
- Contains: theme ID, site domain, expiration timestamp, signature
- Stored locally: `~/.wardrobe/licenses.json`
- Backed up in project: `.wardrobe/licenses.json` (gitignored)

#### License Validation Endpoint
```
POST https://api.wardrobe.sh/v1/licenses/validate
Content-Type: application/json

{
  "licenseKey": "sk_live_abcd1234",
  "themeName": "obsidian",
  "siteUrl": "https://example.com"
}

Response 200:
{
  "valid": true,
  "expiresAt": "2027-04-09T23:59:59Z",
  "tier": "premium",
  "domains": ["example.com"]
}

Response 403:
{
  "valid": false,
  "reason": "expired" | "revoked" | "invalid" | "domain_mismatch"
}
```

#### CLI Commands
```bash
# List all themes (free + premium)
npx wardrobe list [--free-only | --premium-only]

# Install free theme (no license needed)
npx wardrobe install ember

# Install premium theme (interactive license flow)
npx wardrobe install obsidian [--license-key sk_live_...]

# View theme details (including price)
npx wardrobe info obsidian

# Manage licenses
npx wardrobe license list
npx wardrobe license add sk_live_...
npx wardrobe license remove obsidian
npx wardrobe license validate

# Check license status for installed theme
npx wardrobe status
```

---

## Payment Integration Options

The team will evaluate two payment processors for Q3 2026 implementation.

### Option A: Stripe (Recommended)

**Pros:**
- Industry standard (99% adoption in SaaS)
- Excellent API documentation
- Webhooks for license lifecycle events (purchase, refund, chargeback)
- Built-in subscription management
- Multi-currency support (automatic VAT/GST)
- Fraud detection included
- Dashboard analytics

**Cons:**
- 2.9% + $0.30 per transaction (recurring: 2.9% + $0.30)
- Requires separate VAT setup per region
- Account verification takes 1-3 days

**Integration Points:**
1. Payment collection → Stripe Checkout
2. License generation → Webhook on `charge.succeeded` or `customer.subscription.created`
3. License revocation → Webhook on `charge.refunded` or `customer.subscription.deleted`
4. License endpoint → Stripe API `retrieve_customer` to verify active subscription

**Annual Cost at $10k Revenue:**
- Stripe fees: ~$290 (2.9%) + $30 (tx fees) = ~$320/year
- Plus: Subscription management overhead (minimal)

### Option B: Paddle (Alternative)

**Pros:**
- Handles VAT/GST automatically (no per-region setup)
- Affiliate/referral system built-in (future: revenue sharing with theme creators)
- Simpler dashboard for small vendors
- Global payment support (180+ countries)
- Lower minimum monthly fees ($5 vs. Stripe's $0 but higher per-tx)

**Cons:**
- 5% + $0.50 per transaction (higher than Stripe)
- Smaller ecosystem (fewer integrations)
- Webhooks slightly less robust

**Integration Points:**
1. Payment collection → Paddle Checkout
2. License generation → Webhook on `order.completed`
3. License revocation → Webhook on `refund.completed` or `subscription.cancelled`
4. License endpoint → Paddle API `get_subscription` to verify active status

**Annual Cost at $10k Revenue:**
- Paddle fees: ~$500 (5%) + $50 (tx fees) = ~$550/year
- Plus: VAT compliance built-in (no overhead)

### Recommendation: Stripe + VAT Service

**Decision:** Stripe for payment processing (Option A) + Stripe Tax for VAT automation.

**Rationale:**
- Saves ~$230/year on transaction fees (at $10k revenue)
- Better API flexibility for custom workflows (e.g., pro tier services)
- Stripe Tax handles VAT automatically (similar to Paddle's advantage)
- More familiar to engineering team and investors

**Cost Estimate (Annual):**
- Stripe payment processing: ~$290-400 (depends on revenue)
- Stripe Tax: ~$10 per transaction (pass-through, customer pays VAT separately)
- Stripe API calls: Free
- **Total annual cost:** ~$400-500 + VAT pass-through

---

## License Model: Free vs. Premium vs. Pro

### Free Tier License
- **Type:** MIT License
- **Terms:** Permissive open-source
- **Restrictions:** None (modify, redistribute, sublicense)
- **Support:** Community (GitHub Issues, Discord)

### Premium Tier License
- **Type:** Proprietary / Subscription
- **Terms:** Non-transferable, single-site personal license
- **Restrictions:**
  - Cannot modify source code (theme is "as-is")
  - Cannot redistribute or resell theme
  - Cannot sublicense to third parties
  - Single domain only (verified at license validation)
  - Revoked upon refund or subscription cancellation
- **Support:** Email support (24h response target)
- **Duration:** 1 year (auto-renews) or perpetual (one-time)

### Pro Tier License
- **Type:** Commercial / Multi-site
- **Terms:** Non-exclusive, multi-site commercial license
- **Restrictions:**
  - Cannot modify source code
  - Cannot open-source or redistribute
  - Can use on up to 5 domains
  - Can resell as white-label (per separate agreement)
- **Support:** Dedicated account manager + custom SLA
- **Duration:** 1 year (auto-renews)
- **Additional Services:**
  - Theme customization (retainer basis, 20 hours/month included)
  - Priority feature requests
  - Beta access to new features

---

## Compliance & Legal

### GDPR / Data Privacy
- License validation stores: theme name, domain, IP address, timestamp
- No personal data (email, user ID) is stored in license validation
- License validation logs are retained for 90 days for abuse detection
- User can request deletion of license history (manual process)

### Tax / VAT Compliance
- Stripe Tax automatically calculates and collects VAT/GST/Sales Tax
- No manual compliance burden on Wardrobe team
- Receipts are automatically generated and emailed to customers

### Refund Policy (TBD Post-Board-Review)
- Proposed: 30-day money-back guarantee for annual subscriptions
- One-time purchases: No refunds (download immediately upon purchase)
- Fraud cases: Stripe disputes team handles

---

## Launch Timeline

| Phase | Date | Milestone |
|-------|------|-----------|
| **V1 (Current)** | April 2026 | Free themes only (5 launch themes) |
| **Q2 Prep** | May-June 2026 | Board re-review, finalize Stripe integration |
| **Q3 Launch** | July 2026 | Premium tier available (2-3 premium themes) |
| **Q3 Growth** | July-Sept 2026 | Accumulate first 100 premium customers |
| **Q4 Roadmap** | Oct-Dec 2026 | Evaluate Pro tier viability, add white-label services |
| **2027** | Jan+ | Expand theme catalog, revenue-share model for creators |

---

## Success Metrics

### Tier Adoption
- Free tier: Track installs, retention, churn-to-premium
- Premium tier: Target 100+ subscriptions by end of Q3 2026
- Pro tier: Target 1-3 customers by end of 2026

### Revenue
- Premium target: $10k/year by Q4 2026 (100 customers × $99 average)
- Pro target: $1.5k/year by Q4 2026 (1-3 customers × $500+ services)
- **Total target:** $11.5k/year, covering team overhead + continued development

### Unit Economics
- CAC (Customer Acquisition Cost): <$10 (organic discovery, no ads)
- LTV (Lifetime Value): $99-500 per customer
- Payback period: <2 months (assuming zero CAC)

---

## Post-Launch Decisions (TBD)

1. **Pricing adjustment:** If premium conversion is <5%, reduce price to $49/year
2. **Payment processor:** Revisit Paddle if Stripe integration exceeds timeline
3. **White-label revenue share:** If Pro tier shows demand, offer 20-30% revenue share to theme creators
4. **Yearly vs. perpetual:** If annual churn >30%, shift to one-time purchases
5. **Bundle pricing:** Consider Wardrobe + Emdash bundle pricing post-2027

---

## Related Documents

- [decisions.md](./decisions.md) — Board decisions that led to this architecture
- [DISTRIBUTION.md](./DISTRIBUTION.md) — Theme distribution channels (CLI, npm, R2)
- [EMDASH-GUIDE.md](../../../docs/EMDASH-GUIDE.md) — Emdash plugin system (for potential future commerce hooks)

---

**Approval Status:** ⏳ Pending board re-review (Q3 2026)

**Last Reviewed:** April 9, 2026 (Phil Jackson)

---

*This document is the blueprint for Wardrobe monetization. Implement according to timeline. Revisit post-Q3 2026 for Pro tier feasibility.*
