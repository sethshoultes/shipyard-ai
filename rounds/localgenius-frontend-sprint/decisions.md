# Sous — Frontend Sprint: Locked Decisions
*Consolidated by the Zen Master. No appeals. Build from here.*

---

## 1. Locked Decisions

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Product name is "Sous."** LocalGenius is dead. | Steve | Steve | A forgettable name starts every conversation ten feet behind. Legal review must clear it within 48 hours of sprint start or we fall back to "Sous" as code-name and trademark in parallel. Elon conceded once structural rules were met. |
| 2 | **Widget ships as a single vanilla JS IIFE, <20KB.** Zero dependencies, no React hydration, no build step. Injected via `wp_localize_script`. | Elon | Elon | TCP handshake time beats Figma elegance on a $40 Android phone. The 20KB ceiling is non-negotiable because the widget sits on someone else's livelihood. Steve conceded on minification but the CSS delivery method remains contested (see Open Questions #1). |
| 3 | **FAQ answers are served from Cloudflare KV.** D1 is for subscriptions only. 90% cache hit rate is the launch gate. | Elon | Elon | KV is 10x faster than D1 for reads and costs pennies. D1 is SQLite; it dies at write volume. Steve conceded on architecture but retains veto on tone — the answers must not feel like a 1997 phone tree. LLM is a fire extinguisher, not the default path. |
| 4 | **Stripe Checkout, monthly only.** No annual billing, no proration math inside WordPress, no customer-facing portal. One webhook endpoint. | Elon | Elon | Revenue validation happens in Stripe's UI, not ours. Steve conceded this gladly as discipline. |
| 5 | **One table. One cron. One agent session.** | Elon | Elon | The migration must not exceed one new table. Chat logging is counters-only in v1. Steve conceded after recognizing the PRD was 15 products in a trench coat. |
| 6 | **Concierge voice. Never "AI."** Warm, brief, confident. No "leverage," no "AI-powered insights," no chatbot clichés. | Steve | Steve | The tone *is* the feature. When a customer asks about parking, Sous says, "We have valet starting at five." Elon conceded: taste is a force multiplier once the machine works. |
| 7 | **SaaS dashboard first, thinnest possible PHP shim.** WordPress is a door, not the house. | Steve | Steve | The WordPress admin ecosystem is a bag of hurt. Elon conceded that a standalone SaaS app + thin embed would halve the codebase. The widget is the product; WP is distribution. |
| 8 | **Onboarding is 3 steps: Detect → Confirm → Activate.** No steps 4–6. No split-screen preview, no CSS confetti, no category templates. Target: under 15 seconds to first active widget. | Both | Both | Elon cut steps 4–6 as theater. Steve defended the first 30 seconds as the only retention funnel. Compromise: the flow is exactly three steps. The "magic" is lightweight heuristic detection; the "dazzle" comes from speed and voice, not animation. |
| 9 | **No widget backlinks.** No "powered by" growth-hacking graffiti. | Steve | Steve | Churn, not acquisition, is the metric that kills WordPress plugins. A plugin with 40% monthly churn dies faster than one with slow growth. Elon's distribution strategy is not wrong, but the widget itself is sacred customer space. |
| 10 | **Dashboard shows one toggle, one number, one button.** No 47-metric analytics panel. | Steve | Steve (with Elon's support) | Elon called a 47-metric dashboard a confession that you don't know what matters. Steve agreed. The admin UI is a settings page, not a NASA console. |
| 11 | **CUT from v1:** Weekly digest episodes, milestone badges, OG share cards, benchmark percentile UI, annual billing, FAQ drag-to-reorder, rich text editor, mobile bottom-sheet drag-to-dismiss, engagement system, mobile app, custom greeting field, border-radius picker. | Both | Both | Unanimous. These are either content marketing agencies masquerading as product, v2 revenue optimizations, or features searching for a problem. |

---

## 2. MVP Feature Set (What Ships in v1)

### Core
- **Sous Widget**: Single-file vanilla JS IIFE (<20KB), CSS-in-JS or inline `<style>` (see Open Questions), renders a floating chat bubble and conversation drawer. Injected via `wp_localize_script` with API endpoint and site key.
- **Cloudflare KV Cache**: Pre-populated FAQ answer bank per category. KV read on every visitor question. LLM fallback with realistic timeout + typing indicator.
- **Stripe Checkout Redirect**: Monthly billing only. One webhook endpoint (`checkout.session.completed`) to activate premium tier.
- **SaaS Dashboard**: Minimal React/Vue or plain HTML dashboard at `app.sous.ai`. One toggle (widget on/off), one number (questions answered this week), one button (upgrade/manage billing). Auth via magic link or simple password.
- **WordPress Plugin Shim**: Single PHP file (or severely constrained class structure) that enqueues the widget, exposes `wp_localize_script` variables, and handles activation/deactivation. Does not contain business logic.

### Onboarding
- **Detect**: Plugin reads site `title`, `meta description`, and first `h1` to guess business category against a lightweight keyword matcher. Pre-loads 3–5 relevant FAQ templates.
- **Confirm**: Owner sees the guessed business type and proposed FAQs. One-tap confirmation or single-field correction.
- **Activate**: Widget goes live immediately. No additional configuration required.

### Voice & Copy
- All customer-facing strings reviewed for concierge tone. No "AI." No "Processing your request." No "How can I help you today?"
- Default greeting is contextual to the detected business type (e.g., restaurant → "Ask us about reservations or dietary needs.")

### Data
- **One new table**: `sous_subscriptions` (site_id, stripe_customer_id, stripe_subscription_id, tier, status, created_at, expires_at).
- **One cron**: Daily cleanup of expired trial counters or stale KV cache entries.

---

## 3. File Structure (What Gets Built)

```
sous-frontend-sprint/
├── widget/
│   └── sous-widget.js              # The IIFE. <20KB. CSS, markup, fetch logic, state.
│                                   # No external deps. One HTTP request.
│
├── dashboard/
│   ├── index.html                  # Entry point, or Next.js/Vite build output
│   ├── src/
│   │   ├── main.js                 # Router + auth gate
│   │   ├── views/
│   │   │   ├── OnboardingDetect.js # Confirm + Activate UI
│   │   │   └── DashboardHome.js    # Toggle + Number + Button
│   │   └── api.js                  # Fetch wrapper to Cloudflare Worker
│   └── package.json                # If a build step is used for dashboard ONLY
│
├── plugin/
│   └── sous.php                    # Thin WordPress shim. One file preferred.
│                                   # Enqueues widget, localizes API key, admin notice.
│
├── worker/
│   ├── index.js                    # Cloudflare Worker: routes /ask, /webhook, /config
│   ├── kv-seed.json                # Pre-generated FAQ bank per category
│   └── d1-schema.sql               # One table: sous_subscriptions
│
└── infra/
    ├── wrangler.toml               # KV namespace + D1 binding + routes
    └── stripe-webhook.md           # Single webhook event spec for checkout.session.completed
```

**Rules of engagement:**
- `widget/` must build to a single file with zero dependencies.
- `dashboard/` may use a build step because it is not on the critical render path of customer sites.
- `plugin/` must not exceed one meaningful PHP file. If a second file is required, it must be justified in the sprint retro.
- `worker/` handles all auth, caching, and billing logic. The plugin does not touch Stripe secrets.

---

## 4. Open Questions (Needs Resolution Before Code)

| # | Question | Context | Suggested Path |
|---|----------|---------|--------------|
| 1 | **Widget CSS: inline `<style>` vs. separate enqueue?** | Elon demands one request. Steve argues a separate CSS file is cleaner, cacheable on repeat visits, and respectful of customer markup. | *Zen ruling pending.* Default to Elon for launch (inline keeps us under the physics limit), but Steve reserves the right to split CSS in v1.1 if real-world caching proves painful. **Decision needed: Day 1 of sprint.** |
| 2 | **How deep is "Detect"?** | Steve wants magic (crawl, classify, pre-load). Elon says anything beyond title/meta/h1 is a Series B company. | Ship a keyword matcher against title/meta/h1 + a hardcoded template map of 20 common local business types. If detection fails, fallback to "General Local Business" template. **No crawler. No LLM chain in onboarding.** |
| 3 | **What is the exact Stripe price point and trial length?** | Neither debated numbers, but "10 paying customers in 30 days" implies a free tier and a paid tier. | Default assumption: Free tier (50 answers/month, Sous branding in tone only, no backlink). Pro tier ($9–$29/month, unlimited answers, remove branding). **Decision needed: Day 2.** |
| 4 | **Dashboard frontend framework?** | The PRD context is missing; Steve would prefer taste, Elon would prefer zero framework if possible. | If the dashboard is truly "one toggle, one number, one button," ship it in vanilla JS or Alpine.js. No React runtime for a single page. **Decision needed: Day 1.** |
| 5 | **Distribution channel priority.** | Elon wants hosting provider deals and template marketplaces. Steve wants organic love. | Product Hunt launch is the compromise — gives Elon a numbers event and Steve a stage to tell the story. Hosting partnerships are deferred to post-MVP. **Decision needed: Day 3.** |
| 6 | **What happens when KV cache misses exceed 10%?** | Elon's launch gate is 90% hit rate. No plan was debated for what happens if seed data misses. | Build a circuit breaker: after 3 misses in 5 minutes for a site, trigger a Slack alert to the team and temporarily route to a generic fallback answer bank. **Engineering decision needed: Day 4.** |

---

## 5. Risk Register (What Could Go Wrong)

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Legal blocks the "Sous" trademark** | Medium | High | Fallback to "Sous" as code-name and product name with TM pending. Do not ship "LocalGenius." | Steve |
| **Widget exceeds 20KB after feature creep** | High | High | Daily size check in CI. Any PR adding >2KB requires both Elon and Steve sign-off. | Elon |
| **KV cache hit rate <90% on launch** | Medium | Critical | Pre-seed 500 answers across top 20 categories before deploy. Circuit breaker to generic fallback. If still <90%, delay launch by 48 hours to expand seed data. | Elon |
| **Onboarding "Detect" fails on Wix/Squarespace/weird CMS sites** | High | Medium | Graceful degradation to "General Local Business" template. No error states; always show something. Log detection failure rate silently. | Steve |
| **Stripe webhook desync or failure** | Low | Critical | One webhook endpoint only. Idempotency key on every event. If webhook fails, Stripe retries; if still failing, manual reconciliation dashboard for ops. | Elon |
| **Restaurant owners find answers too generic** | Medium | High | Steve owns copy audit. Every seeded answer must pass the "maître d' test" — would a five-star front-of-house staff say this? If not, rewrite. | Steve |
| **Plugin uninstall rate >40% in month one** | Medium | High | Steve's thesis: first impression is everything. Mitigation is the 3-step onboarding + concierge voice. Track uninstall timing; if >50% uninstall within 1 hour of activation, pause acquisition and fix onboarding. | Steve |
| **One-table schema cannot support future tiers** | Low | Medium | Schema includes `tier` as ENUM/VARCHAR, not BOOLEAN. `expires_at` is nullable for lifetime plans. Migration path is documented but not built. | Elon |
| **Agent session scope creep (the "15 products" failure)** | High | Critical | This blueprint is the lock. Any feature not listed in MVP Feature Set above requires a written amendment signed by both Elon and Steve. No exceptions. | Zen Master |
| **Cloudflare KV cold-start latency on first visit** | Medium | Medium | KV is edge-replicated but first read can spike. Mitigation: warm cache via synthetic requests post-deploy. Acceptable latency target: p95 <200ms for cached answers. | Elon |

---

## Zen Master's Note

> "The strength of the team is each member. The strength of each member is the team."

Elon built the machine. Steve gave it a soul. The compromise is not a dilution — it is a **pressure-tested design**. We are not building a chatbot. We are building the first good night's sleep a restaurant owner has had since they opened.

Build fast. Build light. Build Sous.

— Phil
