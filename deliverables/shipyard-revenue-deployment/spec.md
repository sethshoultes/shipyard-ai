# Shipyard Recurring Revenue Deployment — Build Spec

**Status:** Ready for build
**Source PRD:** `/home/agent/shipyard-ai/prds/shipyard-revenue-deployment.md`
**Locked Decisions:** `/home/agent/shipyard-ai/rounds/shipyard-revenue-deployment/decisions.md`
**Date:** 2026-04-26

---

## 1. Goals

1. **Fix conversion blockers on the marketing site** — working contact form POST endpoint, functional mobile navigation below 768px, and clear maintenance pricing hierarchy.
2. **Activate recurring revenue infrastructure** — Stripe Checkout with three tiers ($199/$349/$500/mo), webhook handlers that update D1, and a lightweight client portal.
3. **Launch post-ship lifecycle emails** — Welcome email (immediately on subscription) and Day-7 check-in (proactive touchpoint), both via Resend.
4. **Prove health monitoring value** — automated uptime, SSL expiry, and basic Lighthouse checks surfaced in the portal as green/yellow/red badges (not a 0-100 gradient).
5. **Ship within a single focused build session** — no auth rabbit holes, no tracking tables, no daily cron snapshot infrastructure.

**Business target:** $2,000 MRR within 90 days from maintenance subscriptions.

---

## 2. Implementation Approach

### 2.1 Architecture

| Layer | Technology | Scope |
|-------|------------|-------|
| Website | Next.js 16 + Tailwind CSS 4 | Marketing pages, portal UI, API routes |
| Background Jobs | Cloudflare Worker | Health checks, Stripe webhook handling |
| Database | Cloudflare D1 | Customers, sites, health check results, email log |
| Email | Resend | Welcome, Day-7, contact form notifications |
| Billing | Stripe Checkout + Customer Portal | Three tiers, webhook events, no self-service billing UI |

### 2.2 D1 Schema (Minimal)

```sql
-- customers: created/updated by Stripe webhook
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  tier TEXT CHECK(tier IN ('none','keep','grow','scale')) DEFAULT 'none',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- sites: one per shipped project
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  name TEXT NOT NULL,
  url TEXT,
  status TEXT CHECK(status IN ('building','deployed','maintenance','archived')) DEFAULT 'deployed',
  last_checked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- health_checks: latest result only (no history table in V1)
CREATE TABLE health_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id TEXT REFERENCES sites(id),
  uptime_status TEXT CHECK(uptime_status IN ('green','yellow','red')),
  ssl_status TEXT CHECK(ssl_status IN ('green','yellow','red')),
  lighthouse_status TEXT CHECK(lighthouse_status IN ('green','yellow','red')),
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- email_log: dedup + audit only, no open/click columns
CREATE TABLE email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id TEXT REFERENCES customers(id),
  email_type TEXT CHECK(email_type IN ('welcome','day7')),
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- portal_tokens: lightweight access, NOT an auth system
CREATE TABLE portal_tokens (
  token TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 No-Auth Portal Access

Instead of magic links, cookies, or sessions, the portal is accessed via a **tokenized URL** emailed to the customer after Stripe `checkout.session.completed`:

- Token is a 32-byte random hex string.
- Portal route: `/portal?t={token}`
- Token expires after 30 days.
- `GET /api/portal` validates token against `portal_tokens`, returns customer + sites + latest health checks.
- No password resets, no session store, no auth middleware chain.

### 2.4 Health Check Strategy

- **Uptime:** HTTP HEAD to site URL, expect 2xx/3xx.
- **SSL expiry:** Parse TLS certificate expiry date via `fetch` with `agent` or a lightweight TLS check (if Worker runtime supports it; otherwise fallback to an external API or manual badge).
- **Lighthouse:** PageSpeed Insights API (free tier). If rate-limited or unavailable, fallback to manual badge updated via admin trigger.
- **Cadence:** Every 6 hours via Cloudflare Cron Trigger.
- **Output:** green/yellow/red badge per check. No 0-100 score. No snapshot history table.

### 2.5 Lifecycle Email Strategy

- **Welcome:** Triggered immediately by Stripe webhook handler writing to `email_log` and calling Resend.
- **Day-7:** Triggered by a lightweight Cloudflare Cron Trigger that runs once daily, checks `customers.created_at`, and sends if `email_log` has no `day7` entry for that customer and `created_at + 7 days <= now()`.
- **No tracking:** No `opened_at`, no `clicked_at`. No dispatch engine with complex timing rules.

### 2.6 Stripe Webhook Idempotency

- On `checkout.session.completed`: check `email_log` for `welcome` type before sending.
- D1 `customers` table uses `stripe_customer_id` as a unique key; webhook handler upserts.
- On duplicate webhook: if customer already exists with same `stripe_customer_id`, skip email and return 200.

### 2.7 Explicitly Cut from V1

- Magic-link authentication, cookies, sessions
- 0-100 health score gradient
- Daily cron snapshot tables
- 6-email lifecycle engine with timing rules
- Open/click tracking table
- Annual pricing toggle (hardcoded as "Contact us")
- "Most Popular" badge, hover animations on pricing cards
- CRM lifecycle engine
- Upsell marketplace sidebar inside portal
- Self-service billing portal UI (Stripe Customer Portal only)

---

## 3. Verification Criteria

### 3.1 Foundation

| Feature | Verification |
|---------|------------|
| D1 migration applies cleanly | `wrangler d1 execute shipyard-db --file migrations/001_initial.sql` returns success; all 5 tables exist. |
| D1 schema has required constraints | `SELECT name, sql FROM sqlite_schema WHERE type='table'` returns tables with CHECK constraints on `tier`, `status`, `uptime_status`, etc. |
| Type-safe D1 client | `lib/db.ts` compiles with `tsc --noEmit` and exports typed `Customer`, `Site`, `HealthCheck`, `EmailLog`, `PortalToken` interfaces. |

### 3.2 Conversion Layer (Marketing Site)

| Feature | Verification |
|---------|------------|
| Mobile nav renders & toggles | `curl http://localhost:3000/` → response body contains `aria-label="Toggle menu"`, `aria-expanded`, and mobile-nav CSS classes. Toggle works in browser devtools at 375px width. |
| Contact form POST succeeds | `curl -X POST http://localhost:3000/api/contact -d '{"name":"Test","email":"test@example.com","message":"Hello"}'` returns `{"success":true}` and inserts row into D1 `customers` (or a dedicated `contacts` table) + sends Resend email. |
| Pricing cards visible above fold | `curl http://localhost:3000/` → body contains three tier names ("Keep", "Grow", "Scale") and prices ("$199", "$349", "$500"). |
| No annual toggle in UI | `grep -i "annual\|yearly\|toggle" apps/web/app/page.tsx` returns 0 matches. |

### 3.3 Revenue Layer (Stripe)

| Feature | Verification |
|---------|------------|
| Stripe Checkout creates sessions | `curl -X POST http://localhost:3000/api/stripe/checkout -d '{"tier":"keep","email":"test@example.com"}'` returns `{"url":"https://checkout.stripe.com/..."}`. |
| Webhook handler is idempotent | Send mock `checkout.session.completed` payload twice to `POST /api/stripe/webhook` with same `id`. Second request returns 200, creates only 1 `customers` row and 1 `email_log` row. |
| Webhook updates D1 | After webhook: `SELECT * FROM customers WHERE stripe_customer_id = 'cus_xxx'` returns row with matching `tier`. |
| Welcome email sends within 5 min | After webhook: `SELECT * FROM email_log WHERE email_type = 'welcome'` has 1 row. Resend dashboard shows delivered status. |

### 3.4 Trust Layer (Portal + Health)

| Feature | Verification |
|---------|------------|
| Portal page exists | `curl http://localhost:3000/portal` returns 200 and contains `portal-dashboard` class/id. |
| Token access works | `curl "http://localhost:3000/api/portal?t=valid_token"` returns JSON with `customer`, `sites`, `healthChecks` arrays. Invalid token returns 401. |
| Health checks write to D1 | Run Worker health check manually or wait for cron. `SELECT * FROM health_checks WHERE site_id = 'xxx'` returns row with `uptime_status`, `ssl_status`, `lighthouse_status` in (`green`,`yellow`,`red`). |
| Health badges color-coded | Portal dashboard renders green/yellow/red classes based on status values. No numeric score displayed. |
| Portal has no auth UI | `grep -i "login\|password\|magic.link\|sign.in\|sign.up" apps/web/app/portal/page.tsx` returns 0 matches. |

### 3.5 Communication Layer (Emails)

| Feature | Verification |
|---------|------------|
| Welcome email template renders | `node -e "require('./apps/web/emails/welcome.tsx')"` or Next.js build compiles email TSX without errors. |
| Day-7 email template renders | Same as above for `day7-checkin.tsx`. |
| Day-7 cron sends once per customer | Run daily cron trigger. Customer with `created_at = now() - 7 days` and no `day7` log entry receives email. Re-running cron does not send duplicate. |

### 3.6 Build & Quality Gates

| Feature | Verification |
|---------|------------|
| Next.js builds successfully | `npm run build` in `apps/web` exits 0. |
| Worker deploys | `wrangler deploy` in `worker/` exits 0. |
| No banned patterns in source | `grep -ri "localStorage\|sessionStorage\|jwt\|passport\|next-auth\|lucia\|auth.js" apps/web/ worker/` returns 0 matches (except in comments/docs). |
| No tracking telemetry | `grep -ri "opened_at\|clicked_at\|pixel\|ga\|gtag\|mixpanel\|segment" apps/web/ worker/` returns 0 matches. |
| PHP syntax checks (if any PHP) | `find apps/web worker -name "*.php" -exec php -l {} \;` returns no errors (defensive; project is TS). |

---

## 4. Files to Create or Modify

### 4.1 New Files

```
deliverables/shipyard-revenue-deployment/
├── spec.md                          # This file
├── todo.md                          # Running task list
└── tests/
    ├── test-structure.sh
    ├── test-banned-patterns.sh
    ├── test-migration.sh
    ├── test-worker.sh
    └── test-nextjs.sh

apps/web/
├── app/
│   ├── page.tsx                     # Landing page with pricing cards
│   ├── layout.tsx                   # Root layout (if not existing)
│   ├── globals.css                  # Tailwind globals (if not existing)
│   ├── pricing/page.tsx             # Pricing page (annual = "Contact us")
│   ├── portal/page.tsx              # Simple client portal (token access)
│   └── api/
│       ├── contact/route.ts         # Contact form POST → D1 + Resend
│       ├── stripe/
│       │   ├── checkout/route.ts    # Create Stripe checkout session
│       │   └── webhooks/route.ts    # Handle Stripe webhooks
│       └── portal/route.ts          # Portal data fetch (token auth)
├── components/
│   ├── mobile-nav.tsx               # Hamburger menu, ARIA, focus trap
│   ├── pricing-cards.tsx            # Three tiers, clear hierarchy
│   ├── health-badge.tsx             # Green/Yellow/Red badge component
│   └── portal-dashboard.tsx         # Site list + status sidebar
├── lib/
│   ├── stripe.ts                    # Stripe SDK init + helpers
│   ├── resend.ts                    # Resend SDK init + send helpers
│   └── db.ts                        # D1 client, schema types, query helpers
└── emails/
    ├── welcome.tsx                  # Welcome email JSX template
    └── day7-checkin.tsx             # Day-7 check-in email JSX template

worker/
├── src/
│   ├── index.ts                     # Worker entry + routing
│   ├── health-check.ts              # Uptime + SSL + Lighthouse checks
│   └── stripe-webhook.ts            # Webhook validation + D1 writes
├── wrangler.toml                    # Worker config + D1 binding + cron triggers
└── package.json                     # Worker deps

migrations/
└── 001_initial.sql                  # D1 schema (5 tables)

package.json                         # Root workspace config
```

### 4.2 Potentially Modified Files

```
CLAUDE.md                            # Add project-specific notes if needed (do not modify unless instructed)
STATUS.md                            # Update pipeline state during build
```

### 4.3 File Count Summary

- **New files:** 27 (5 test scripts, 5 migration/schema/config, 17 application files)
- **Modified files:** 0–2 (system status files only)
- **Total lines of code target:** <2,500 (per single-session constraint in decisions)

---

## 5. Risks & Contingencies

| Risk | Contingency |
|------|-------------|
| Lighthouse in Worker exceeds CPU limits | Defer automated Lighthouse to manual badge; health check only validates uptime + SSL. |
| Portal without auth leaks data | Token is 32-byte random, 30-day expiry, rate-limited route. No PII in URL beyond token. |
| Stripe webhook retry duplicates | Idempotency via `email_log` + `customers` upsert on `stripe_customer_id`. |
| One build session is too ambitious | Hard cut list defined. If portal or health check balloons, portal becomes static HTML + manual D1 updates. |
| D1 query limits | V1 targets <50 customers. Health checks batched by site. |

---

## 6. Success Criteria (Shipyard-Revenue-Deployment V1)

- [ ] Contact form POST endpoint live, emails received by ops.
- [ ] Mobile nav works on iPhone SE width (375px) and iPhone 14 width (390px).
- [ ] Stripe Checkout creates subscriptions successfully.
- [ ] Webhooks update D1 customer records idempotently.
- [ ] Tokenized portal shows project list and health badges.
- [ ] Health checks calculate and display green/yellow/red (not 0-100).
- [ ] Welcome email sends within 5 minutes of subscription.
- [ ] Day-7 email sends automatically once per customer.
- [ ] Next.js builds and deploys. Worker deploys. D1 migration runs.
- [ ] Zero auth system code. Zero tracking tables. Zero annual pricing toggle.
