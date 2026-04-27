# Shipyard Recurring Revenue Deployment — Running To-Do

**Rule:** Each task must complete in <5 minutes. If it can't, split it further.
**Rule:** Mark `[x]` only after verification passes.

---

## Wave 1 — Foundation (zero dependencies)

- [ ] W1.1 Create D1 migration file `migrations/001_initial.sql` with all 5 tables — verify: `grep -c "CREATE TABLE" migrations/001_initial.sql` returns 5
- [ ] W1.2 Add `customers` table with CHECK constraint on `tier` — verify: `grep "CHECK(tier IN" migrations/001_initial.sql` returns match
- [ ] W1.3 Add `sites` table with CHECK constraint on `status` — verify: `grep "CHECK(status IN" migrations/001_initial.sql` returns match
- [ ] W1.4 Add `health_checks` table with CHECK constraints on `uptime_status`, `ssl_status`, `lighthouse_status` — verify: `grep -c "CHECK.*status IN" migrations/001_initial.sql` returns 3
- [ ] W1.5 Add `email_log` table with CHECK constraint on `email_type` — verify: `grep "CHECK(email_type IN" migrations/001_initial.sql` returns match
- [ ] W1.6 Add `portal_tokens` table with `expires_at` NOT NULL — verify: `grep "expires_at DATETIME NOT NULL" migrations/001_initial.sql` returns match
- [ ] W1.7 Create root `package.json` with workspace config for `apps/web` and `worker` — verify: `cat package.json | grep -c '"workspaces"'` returns 1
- [ ] W1.8 Create `apps/web/lib/db.ts` with D1 binding helper and TypeScript interfaces — verify: `grep -c "export interface" apps/web/lib/db.ts` returns 5
- [ ] W1.9 Create `apps/web/lib/stripe.ts` exporting initialized Stripe SDK — verify: `grep "new Stripe" apps/web/lib/stripe.ts` returns match
- [ ] W1.10 Create `apps/web/lib/resend.ts` exporting initialized Resend SDK — verify: `grep "new Resend" apps/web/lib/resend.ts` returns match
- [ ] W1.11 Create `worker/wrangler.toml` with D1 binding and cron triggers — verify: `grep -c "[[triggers.cron]]" worker/wrangler.toml` returns 1
- [ ] W1.12 Create `worker/package.json` with `wrangler` dev dependency — verify: `grep "wrangler" worker/package.json` returns match
- [ ] W1.13 Create `worker/src/index.ts` Worker entry with basic router — verify: `php -l worker/src/index.ts` is not applicable; verify file exists and contains `export default` instead

---

## Wave 2 — Conversion Layer (marketing site fixes)

- [ ] W2.1 Create `apps/web/components/mobile-nav.tsx` with hamburger icon, toggle state, ARIA labels — verify: `grep -c "aria-" apps/web/components/mobile-nav.tsx` >= 3
- [ ] W2.2 Mobile nav uses `aria-expanded` and `aria-label="Toggle menu"` — verify: `grep "aria-expanded" apps/web/components/mobile-nav.tsx` returns match
- [ ] W2.3 Mobile nav has 200ms ease-in-out CSS transition — verify: `grep "200ms" apps/web/components/mobile-nav.tsx` returns match
- [ ] W2.4 Import mobile-nav into root layout so it renders site-wide — verify: `grep "MobileNav" apps/web/app/layout.tsx` returns match
- [ ] W2.5 Create `apps/web/components/pricing-cards.tsx` with Keep/Grow/Scale tiers — verify: `grep -c "\$199\|\$349\|\$500" apps/web/components/pricing-cards.tsx` returns 3
- [ ] W2.6 Pricing cards have clear hierarchy: price, description, CTA button — verify: `grep -c "Get Started\|Subscribe\|Sign up" apps/web/components/pricing-cards.tsx` >= 3
- [ ] W2.7 Annual pricing shows "Contact us" text, no toggle — verify: `grep -i "contact us" apps/web/components/pricing-cards.tsx` returns match; `grep -i "annual.*toggle\|yearly.*toggle" apps/web/components/pricing-cards.tsx` returns 0
- [ ] W2.8 Add pricing cards to landing page above fold — verify: `grep "PricingCards\|pricing-cards" apps/web/app/page.tsx` returns match
- [ ] W2.9 Create `POST /api/contact` route writing to D1 + sending Resend email — verify: `grep "export async function POST" apps/web/app/api/contact/route.ts` returns match
- [ ] W2.10 Contact form handler uses `resend.emails.send` — verify: `grep "resend.emails.send" apps/web/app/api/contact/route.ts` returns match
- [ ] W2.11 Contact form handler inserts row into D1 — verify: `grep "INSERT INTO" apps/web/app/api/contact/route.ts` returns match

---

## Wave 3 — Revenue Layer (Stripe)

- [ ] W3.1 Create `POST /api/stripe/checkout` route accepting `tier` and `email` — verify: `grep "export async function POST" apps/web/app/api/stripe/checkout/route.ts` returns match
- [ ] W3.2 Checkout route creates Stripe Checkout session with price IDs — verify: `grep "stripe.checkout.sessions.create" apps/web/app/api/stripe/checkout/route.ts` returns match
- [ ] W3.3 Checkout route returns `{ url }` JSON — verify: `grep "url:" apps/web/app/api/stripe/checkout/route.ts` returns match
- [ ] W3.4 Create `POST /api/stripe/webhooks` route with signature validation — verify: `grep "stripe.webhooks.constructEvent" apps/web/app/api/stripe/webhooks/route.ts` returns match
- [ ] W3.5 Webhook handler listens for `checkout.session.completed` — verify: `grep "checkout.session.completed" apps/web/app/api/stripe/webhooks/route.ts` returns match
- [ ] W3.6 Webhook upserts customer into D1 with tier — verify: `grep "INSERT INTO customers" apps/web/app/api/stripe/webhooks/route.ts` returns match and `grep "ON CONFLICT" apps/web/app/api/stripe/webhooks/route.ts` returns match
- [ ] W3.7 Webhook generates portal token and stores in `portal_tokens` — verify: `grep "portal_tokens" apps/web/app/api/stripe/webhooks/route.ts` returns match
- [ ] W3.8 Webhook sends welcome email via Resend with idempotency check — verify: `grep "welcome" apps/web/app/api/stripe/webhooks/route.ts` returns match; `grep "SELECT.*email_log" apps/web/app/api/stripe/webhooks/route.ts` returns match
- [ ] W3.9 Webhook returns 200 on duplicate events (idempotency) — verify: `grep "return NextResponse" apps/web/app/api/stripe/webhooks/route.ts` returns match

---

## Wave 4 — Trust Layer (Portal + Health)

- [ ] W4.1 Create `apps/web/app/portal/page.tsx` that reads `?t=` token from URL — verify: `grep "searchParams" apps/web/app/portal/page.tsx` returns match
- [ ] W4.2 Portal page fetches `/api/portal?t={token}` client-side — verify: `grep "fetch.*api/portal" apps/web/app/portal/page.tsx` returns match
- [ ] W4.3 Portal page has no login/password/auth UI — verify: `grep -ic "login\|password\|magic\|sign.in\|sign.up" apps/web/app/portal/page.tsx` returns 0
- [ ] W4.4 Create `GET /api/portal/route.ts` validating token and returning data — verify: `grep "export async function GET" apps/web/app/api/portal/route.ts` returns match
- [ ] W4.5 API portal route returns 401 for invalid/expired token — verify: `grep "401\|Unauthorized" apps/web/app/api/portal/route.ts` returns match
- [ ] W4.6 API portal route joins customers → sites → latest health_checks — verify: `grep "LEFT JOIN\|JOIN" apps/web/app/api/portal/route.ts` returns match
- [ ] W4.7 Create `apps/web/components/portal-dashboard.tsx` rendering site cards — verify: `grep "export default function PortalDashboard" apps/web/components/portal-dashboard.tsx` returns match
- [ ] W4.8 Create `apps/web/components/health-badge.tsx` showing green/yellow/red — verify: `grep -c "green\|yellow\|red" apps/web/components/health-badge.tsx` >= 3
- [ ] W4.9 Health badge has NO numeric score display — verify: `grep -c "[0-9]" apps/web/components/health-badge.tsx` returns 0 (or only in CSS class names)
- [ ] W4.10 Create `worker/src/health-check.ts` with uptime + SSL + Lighthouse checks — verify: `grep -c "uptime\|ssl\|lighthouse" worker/src/health-check.ts` >= 3
- [ ] W4.11 Health check writes results to D1 `health_checks` — verify: `grep "INSERT INTO health_checks" worker/src/health-check.ts` returns match
- [ ] W4.12 Worker cron trigger wired to health check every 6 hours — verify: `grep "cron\|6 hours" worker/wrangler.toml` returns match

---

## Wave 5 — Communication Layer (Emails)

- [ ] W5.1 Create `apps/web/emails/welcome.tsx` email template — verify: `grep "export default" apps/web/emails/welcome.tsx` returns match
- [ ] W5.2 Welcome email includes portal token link — verify: `grep "portal" apps/web/emails/welcome.tsx` returns match
- [ ] W5.3 Create `apps/web/emails/day7-checkin.tsx` email template — verify: `grep "export default" apps/web/emails/day7-checkin.tsx` returns match
- [ ] W5.4 Day-7 email is plain-text-friendly, single question tone — verify: `grep "Is there anything" apps/web/emails/day7-checkin.tsx` returns match
- [ ] W5.5 Worker daily cron checks for Day-7 sends — verify: `grep "day7\|day_7\|7 day" worker/src/index.ts` returns match
- [ ] W5.6 Day-7 cron sends only if no existing `email_log` entry — verify: `grep "email_log" worker/src/index.ts` returns match
- [ ] W5.7 Day-7 cron uses `created_at + 7 days` rule — verify: `grep "created_at\|7" worker/src/index.ts` returns match

---

## Wave 6 — Build, Deploy, Quality Gates

- [ ] W6.1 Next.js build passes `npm run build` in `apps/web` — verify: `npm run build` in apps/web exits 0
- [ ] W6.2 Worker deploys with `wrangler deploy` — verify: `wrangler deploy` in worker/ exits 0
- [ ] W6.3 D1 migration runs successfully against remote DB — verify: `wrangler d1 migrations apply shipyard-db` exits 0
- [ ] W6.4 No banned auth patterns in source — verify: `grep -ri "next-auth\|lucia\|passport\|jwt\|magic.link.*auth\|session.*store" apps/web/ worker/` returns 0 matches
- [ ] W6.5 No tracking telemetry in source — verify: `grep -ri "opened_at\|clicked_at\|pixel\|gtag\|mixpanel\|segment" apps/web/ worker/` returns 0 matches
- [ ] W6.6 No localStorage/sessionStorage usage — verify: `grep -ri "localStorage\|sessionStorage" apps/web/ worker/` returns 0 matches
- [ ] W6.7 No 0-100 health score gradient code — verify: `grep -ri "score.*100\|0-100\|gradient.*health" apps/web/ worker/` returns 0 matches
- [ ] W6.8 All test scripts in `deliverables/shipyard-revenue-deployment/tests/` pass — verify: `bash tests/test-structure.sh && bash tests/test-banned-patterns.sh && bash tests/test-migration.sh && bash tests/test-worker.sh && bash tests/test-nextjs.sh` exits 0

---

## Post-Ship Deferred (do NOT work on now)

- [ ] Magic-link authentication system
- [ ] 0-100 health score gradient
- [ ] Daily cron snapshot tables
- [ ] 6-email lifecycle engine (Month 1, Quarter, Half-Year, Annual)
- [ ] Open/click tracking table
- [ ] Annual pricing toggle UI
- [ ] "Most Popular" badge
- [ ] Hover animations on pricing cards
- [ ] CRM lifecycle engine
- [ ] Upsell marketplace sidebar inside portal
