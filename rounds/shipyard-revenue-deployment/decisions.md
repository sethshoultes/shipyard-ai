# Shipyard Revenue Deployment — Locked Decisions

*Phil Jackson, Zen Master — Great Minds Agency*

> "The strength of the team is each individual member. The strength of each member is the team."

This document is the single source of truth for the build phase. Every line below passed through the forge of debate. No revisiting without new data.

---

## Executive Synthesis

Elon fought for developer velocity and ruthless scope reduction. Steve fought for perceived value and customer trust at the point of sale. The locked architecture honors both: **Steve owns the customer experience; Elon owns the constraint boundaries.**

The essence captured it: *Strip to payment + proof + contact. Portal over email threads. Health score over manual reports. No auth rabbit holes. No tracking tables. No cargo-cult SaaS UI.*

---

## Locked Decision Register

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1 | **Client Portal — simplified, no auth system** | Steve (portal); Elon (no auth rabbit hole) | **Steve, bounded by Elon's constraints** | Steve proved that $199–500/month for invisible work demands tangible proof. Elon proved that magic-link auth is a product, not a feature. The compromise: a lightweight D1-powered dashboard with green/yellow/red status badges, accessible via a secure tokenized URL or email link — no login system, no sessions, no password resets. |
| 2 | **Automated Health Monitoring — 3 checks only** | Steve (automated); Elon (manual reports only) | **Steve, with Elon's simplification** | Essence ruled: *Health score over manual reports.* Steve showed that daily automated checks are the core value proposition. Elon showed that a 0-100 gradient with 20 metrics is a standalone product. The compromise: automate **uptime + SSL expiry + basic Lighthouse score** only. Output is a green/yellow/red badge, not a 0-100 gradient. No daily cron snapshot tables. No crawler infrastructure. |
| 3 | **Lifecycle Emails — 2 emails, zero tracking** | Elon | **Elon** | Steve conceded that six timed emails with open/click tracking is newsletter software, not Shipyard. The locked sequence: **Welcome email** (immediately post-subscription) and **Day-7 check-in** (proactive touchpoint). Both sent via Resend. No D1 tracking table. No open/click columns. No dispatch cron logic beyond Stripe-webhook trigger for welcome and a simple D1-scheduled flag for Day-7. |
| 4 | **Stripe Checkout + Webhooks — end-to-end, polished** | Both | **Both** | Non-controversial. The subscription flow must be one-click, pre-filled email, immediate confirmation. This is the revenue artery. |
| 5 | **Mobile Navigation — must work** | Steve (raised); Elon (conceded) | **Steve** | Elon conceded: *"A broken hamburger menu on iPhone SE isn't missing polish — it's a 40% bounce rate."* This ships fixed, period. |
| 6 | **Pricing Card UI — clear hierarchy, no theater** | Elon (cut theater); Steve (demand clarity) | **Both** | Cut: "Most Popular" badge (no customers yet), hover animations, annual pricing toggle. Keep: rigorous visual hierarchy — price, what's included, CTA. Confusion kills conversion faster than ugliness. |
| 7 | **Annual Pricing Toggle — cut from V1** | Elon | **Elon** | Hardcode annual as **"Contact us"** until 20 subscribers exist. This is not a build priority; it's a configuration change later. |
| 8 | **Contact Form POST — keep** | Both | **Both** | The inbound funnel. Simple form endpoint writing to D1 + notification email. |
| 9 | **Upsell Footer — basic, in ship emails** | Elon | **Elon** | Three cards in the footer of existing ship-notification emails, each linking to a one-click Stripe checkout. Steve did not contest this channel. |
| 10 | **No Auth System in V1** | Elon | **Elon** | Magic links, cookies, session stores, password resets — all deferred. If a customer needs project status, they receive a secure link or an email. Auth is a product, not a feature. Steve accepted this boundary when he agreed to a "no auth rabbit hole" portal. |
| 11 | **Build Sessions — scoped to realistic token budget** | Elon | **Elon** | The full original PRD (~1.2M tokens) was unanimously ruled laughable. This V1 targets a single focused agent session. Health checks, portal view, Stripe webhooks, and email flow must fit within one cohesive build. Defer anything that requires a second session. |
| 12 | **Distribution — existing ship list, not paid ads** | Elon | **Elon** | "How do we reach 10,000 users?" is the wrong question. Distribution is the existing ship-notification email list. Convert 20% of 50 shipped sites = 10 customers = $2K–5K MRR. No viral loops. No growth hacks. No ads. |

---

## MVP Feature Set (What Ships in V1)

> "This is not the PRD. This is what actually gets built."

### Revenue Layer
- Stripe Checkout integration with webhook handlers (`checkout.session.completed`, `invoice.paid`)
- One-click upsell footer in ship-notification emails (3 tiers linking to Stripe)
- Annual pricing deferred to "Contact us" CTA

### Trust Layer
- **Simple client portal page** (Next.js route, no auth): displays site list, maintenance status, and health badges (green/yellow/red)
- **Automated health checks** (Cloudflare Worker cron or lightweight endpoint): uptime, SSL expiry, basic Lighthouse score — results written to D1, surfaced in portal
- **Manual override capability**: agent can update status badges via D1 for edge cases

### Communication Layer
- Welcome email via Resend (triggered by Stripe webhook)
- Day-7 check-in email via Resend (triggered by simple D1-scheduled flag or lightweight cron)
- No tracking tables. No open/click telemetry.

### Conversion Layer
- Landing page with clear pricing hierarchy
- Working mobile navigation (iPhone SE tested)
- Contact form POST endpoint → D1 + notification email

### Explicitly Cut from V1
- Magic-link authentication
- 0-100 health score gradient
- Daily cron snapshot tables
- Lifecycle email dispatch engine (6+ emails with timing rules)
- Open/click tracking table
- Annual pricing toggle
- "Most Popular" badge
- Hover animations on pricing cards
- CRM lifecycle engine
- Upsell marketplace sidebar inside portal

---

## File Structure (What Gets Built)

```
shipyard-revenue-deployment/
├── apps/
│   └── web/                          # Next.js application
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── pricing/page.tsx      # Pricing page
│       │   ├── portal/page.tsx       # Simple client portal (token access)
│       │   └── api/
│       │       ├── contact/route.ts  # Contact form POST → D1
│       │       ├── stripe/
│       │       │   └── webhooks/route.ts  # Stripe webhooks
│       │       └── portal/route.ts   # Portal data fetch (token auth)
│       ├── components/
│       │   ├── mobile-nav.tsx
│       │   ├── pricing-cards.tsx     # Clear hierarchy, no theater
│       │   ├── health-badge.tsx      # Green/Yellow/Red only
│       │   └── portal-dashboard.tsx  # Site list + status
│       ├── lib/
│       │   ├── stripe.ts
│       │   ├── resend.ts
│       │   └── db.ts               # D1 client + schema types
│       └── emails/
│           ├── welcome.tsx
│           └── day7-checkin.tsx
│
├── worker/                           # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts                  # Worker entry
│   │   ├── health-check.ts         # Uptime + SSL + Lighthouse
│   │   └── stripe-webhook.ts         # Webhook validation + D1 writes
│   └── wrangler.toml
│
├── migrations/
│   └── 001_initial.sql             # D1 schema (customers, sites, health, emails)
│
└── package.json                      # Root workspace config
```

### D1 Schema (Minimal)
```sql
customers          -- stripe_customer_id, email, plan, status, created_at
sites              -- customer_id, url, status, last_checked_at
health_checks      -- site_id, uptime_status, ssl_status, lighthouse_score, checked_at
email_log          -- customer_id, email_type (welcome|day7), sent_at  -- NO open/click columns
portal_tokens      -- token, customer_id, expires_at  -- lightweight access, not auth
```

---

## Open Questions (What Still Needs Resolution)

1. **Portal Access Mechanism**
   - How does a customer reach their portal without auth?
   - Options: (a) unique tokenized URL emailed after signup, (b) email-based lookup with verification code, (c) simple customer ID + passphrase
   - *Resolution needed before UI build begins.*

2. **Day-7 Email Trigger**
   - What infrastructure triggers the Day-7 email?
   - Options: (a) Cloudflare Cron Trigger at 1-hour intervals checking D1, (b) Vercel cron job, (c) manual send via admin trigger until volume warrants automation
   - *Resolution needed before worker build begins.*

3. **Lighthouse Execution Strategy**
   - How is Lighthouse score generated?
   - Options: (a) PageSpeed Insights API (free tier limits?), (b) lightweight chrome-launcher in Worker (likely too heavy), (c) deferred to manual badge until automated solution is viable
   - *Resolution needed before health-check worker is built.*

4. **Health Check Cadence**
   - How often do checks run?
   - Options: (a) every 6 hours via Cron Trigger, (b) once daily, (c) on-demand when portal is accessed
   - *Impacts D1 write volume and Worker execution time.*

5. **Upsell Email Integration Point**
   - Are ship-notification emails sent from a separate system?
   - How does the upsell footer get injected into existing ship emails?
   - *Resolution needed if this sits outside the Next.js app.*

6. **Stripe Webhook Idempotency**
   - D1 does not support unique constraints on arbitrary columns natively in all contexts.
   - How do we prevent duplicate welcome emails on webhook retries?
   - *Resolution needed before webhook handler is finalized.*

---

## Risk Register (What Could Go Wrong)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Portal without auth leaks customer data** | Medium | Critical | Tokenized URLs with expiration. No PII in URL params. Rate-limit portal route. D1 row-level filtering by token. |
| **Health checks exceed Worker execution limits** | Medium | High | Lighthouse via API, not local Chrome. 3 checks max. Timeout guards. Fallback to manual badge if automated check fails. |
| **Stripe webhook retry creates duplicate emails/customers** | Medium | Medium | Idempotency key check in webhook handler. D1 upsert on `stripe_customer_id`. Email dedup via `email_log` table. |
| **D1 query limits hit at >100 customers** | Low | Medium | V1 is built for 10–50 customers. Monitor D1 metrics. If growth exceeds plan, migration path is PostgreSQL or paid D1 tier. |
| **One build session is still too ambitious** | Medium | High | Hard cut-list defined above. If any feature (portal or health check) balloons, it becomes a static HTML page + manual process. |
| **Customer expects full PRD features after seeing portal** | Medium | High | Portal copy sets expectations clearly: "Your site health dashboard" — not "Client command center." Marketing language must match V1 reality. |
| **Health check false positives erode trust** | Medium | High | SSL expiry is deterministic. Uptime uses 2xx check. Lighthouse volatility is expected — badge logic should tolerate score swings (e.g., rolling average or threshold bands). |
| **Day-7 email feels spammy without personalization** | Low | Medium | Keep it plain text, human voice, single question: "Is there anything on your site you wish worked better?" No HTML bloat. Easy reply-to. |
| **Pricing page without "Most Popular" badge reduces conversion** | Low | Low | A/B test this after 20 signups. V1 ships without it. |

---

## The Zen Master's Final Word

> "This is not about who won the argument. It's about what argument we no longer need to have."

Steve was right that customers pay for peace of mind, not invoices. Elon was right that peace of mind doesn't require a login system. Build the portal. Build the health check. Build it so small and so clean that you can rebuild it in an afternoon when you have real customer feedback.

The only metric that matters in Month 1 is **dollars collected per hour invested.** But those dollars only stay collected if the customer feels smart for paying them.

Build the feeling. Revenue follows.

---

*Locked: Round 2 — Elon vs. Steve*
*Arbiter: Phil Jackson*
*Status: Ready for build phase*
