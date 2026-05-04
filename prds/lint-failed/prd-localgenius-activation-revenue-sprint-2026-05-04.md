# PRD: LocalGenius Activation & Revenue Sprint

**Status:** Approved for Build
**Date:** 2026-05-04
**Owner:** Phil Jackson (Dream Cycle)
**Build Target:** 2-week sprint, shippable to production
**Distribution:** localgenius.company SaaS + WordPress.org plugin

---

## 1. Overview

LocalGenius has a clean backend, strong unit economics (LTV/CAC 9.3x), and zero revenue. The gap is not engineering complexity — it is missing *wires* between existing features. The widget doesn't auto-render. The insight table is write-only. The pricing page has no buy button. The Monday Morning Report doesn't exist.

This sprint connects what is built to what users need. We will ship: (1) widget auto-rendering, (2) the Monday Morning Report, (3) a $1 trial with three paid tiers, (4) AgentPress upsell integration, and (5) the `insight_actions` feedback loop.

**The promise:** A local business owner installs LocalGenius, sees their AI chat widget live in 4 minutes, receives their first weekly marketing report on Monday, and pays $1 to continue.

---

## 2. Goals

1. Widget auto-renders on the user's site with no manual activation step.
2. Monday Morning Report email generates automatically and sends to every active user.
3. Stripe billing flows live: $1 trial → Starter ($49/mo) / Growth ($149/mo) / Pro ($399/mo).
4. AgentPress plugin suggests LocalGenius upsell at site-launch time with one-click install.
5. `insight_actions` table feeds back into campaign generation prompts.

---

## 3. Non-Goals

- Multi-location dashboard (Agency tier at $999/mo — defer to v1.1).
- White-labeling (defer to v1.1).
- Custom AI model fine-tuning (defer to Q3).
- Real-time push notifications beyond email (defer to v1.1).
- Social posting automation (defer to v1.1).

---

## 4. User Stories

1. **As a restaurant owner,** I want the AI chat widget to appear on my website immediately after I connect my Google Business Profile, without digging through settings.
2. **As a restaurant owner,** I want a weekly email telling me how my reviews and campaigns performed, so I don't have to remember to log in.
3. **As a restaurant owner,** I want to try LocalGenius for $1 before paying full price, because I've been burned by marketing tools before.
4. **As an agency operator using Shipyard AI,** I want AgentPress to offer LocalGenius to my client at site-launch time, so I earn recurring revenue without extra work.
5. **As a returning LocalGenius user,** I want my next email campaign subject line to be informed by what worked last time, not random.

---

## 5. Functional Specification

### 5.1 Widget Auto-Render

**Current state:** Widget exists but requires manual "activation" toggle in settings.
**New behavior:**
- On plugin install + API key validation, widget renders with a "Powered by LocalGenius" badge.
- Badge is dismissible by paid-tier users (Starter+).
- Free/trial users see badge permanently (marketing trade-off for $1 trial).
- Auto-render respects `localgenius_widget_enabled` option: defaults to `true`, can be set `false` by user.
- Widget position: bottom-right, z-index 9999, loads async to avoid blocking render.

**Technical:**
- Inject script tag via `wp_footer` hook if `localgenius_api_key` is set and valid.
- Script loads from `cdn.localgenius.company/widget/v1.js` with `data-business-id` attribute.
- Fallback: inline iframe if JS fails to load.

### 5.2 Monday Morning Report

**Delivery:** Every Monday at 8:00 AM in the user's timezone.
**Channels:** Email (primary). SMS optional for Pro tier.
**Content blocks:**
1. **Headline:** "Your Marketing Week at a Glance" + business name.
2. **Review Summary:** New reviews count, average rating change, top positive keyword, top negative keyword.
3. **Campaign Performance:** If email campaign active → open rate, click rate, best-performing subject line.
4. **Competitor Snapshot:** "Tony's Pizza got 8 reviews this week. You got 3." (anonymized, vertical-matched).
5. **This Week's Suggestion:** One AI-generated action: "Post a photo of your Friday special to Instagram. Caption suggestion included."
6. **CTA:** "Open LocalGenius Dashboard" button linking to `/wp-admin/admin.php?page=localgenius`.

**Technical:**
- Cron job registered on `wp_schedule_event` (weekly, Monday 8am).
- Template engine: MJML for responsive email, rendered server-side.
- Unsubscribe link required (CAN-SPAM).
- Open rate tracked via 1x1 pixel (`/track/open/{campaign_id}`).

### 5.3 Paid Tiers & Stripe Billing

**Pricing:**
| Tier | Price | Features |
|------|-------|----------|
| Trial | $1 for 30 days | All Growth features, limited to 1 location |
| Starter | $49/mo | 1 location, review management, monthly report |
| Growth | $149/mo | 3 locations, email campaigns, weekly report, competitor tracking |
| Pro | $399/mo | Unlimited locations, white-label reports, SMS alerts, priority support |

**Stripe integration:**
- Checkout via Stripe Checkout hosted page.
- Webhooks: `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.deleted`.
- On trial conversion: update `localgenius_subscription_status` to `active`.
- On payment failure: grace period 7 days, then downgrade to free (widget badge returns).

**WordPress integration:**
- Settings page tab: "Billing" shows current plan, next billing date, usage meter (reviews processed / emails sent).
- "Upgrade" button opens Stripe Checkout with `client_reference_id` = WP user ID.
- Portal link for invoice download and cancellation.

### 5.4 AgentPress Upsell Integration

**Trigger:** AgentPress site-launch completion event (`agentpress_site_launched`).
**UX:**
- Admin notice: "Your site is live. Want AI marketing? LocalGenius handles reviews, emails, and social — $1 to try."
- One-click install: button triggers `wp_ajax_install_plugin` for LocalGenius plugin from WordPress.org or GitHub release.
- Post-install redirect to LocalGenius onboarding wizard with `?ref=agentpress` tracking parameter.

**Revenue share:**
- AgentPress installs tracked via `ref=agentpress`.
- If conversion occurs, attribution logged for future partner program (v1.1).

### 5.5 Insight Actions Feedback Loop

**Current state:** `insight_actions` table records what the AI did. It is never read.
**New behavior:**
- Before generating a new campaign, query:
  ```sql
  SELECT action_type, action_data, outcome_score
  FROM insight_actions
  WHERE vertical = ? AND outcome_score > 0.7
  ORDER BY created_at DESC
  LIMIT 10;
  ```
- Inject top 5 outcomes into campaign generation prompt as:
  ```
  Here are high-performing actions for {vertical} businesses like yours:
  - {action_1} (score: {score_1})
  - {action_2} (score: {score_2})
  ...
  Use these as inspiration but do not copy verbatim.
  ```
- Outcome score derived from: email open rate, review response rate, click-through rate (normalized 0-1).

---

## 6. UI/UX Specification

### Settings Page — Billing Tab
- Current plan card (color-coded: Trial = yellow, Starter = blue, Growth = green, Pro = purple).
- Usage meter: horizontal bar, current / limit.
- "Change Plan" button → Stripe Checkout.
- "Download Invoices" link → Stripe Customer Portal.

### Widget — Default State
- Collapsed: floating bubble, 56px circle, LocalGenius logo, bottom-right 24px margin.
- Expanded: 400px wide, 600px tall chat panel, business name in header.
- Mobile: full-screen overlay on expand.

### Monday Morning Report — Email Design
- Header: LocalGenius brand color (#0F172A background, white text).
- Body: single column, 600px max-width, clear section dividers.
- CTA button: "Open Dashboard" — rounded, primary color.
- Footer: unsubscribe + "You're receiving this because you use LocalGenius."

---

## 7. Technical Architecture

```
localgenius/
├── widget/
│   └── v1.js              # Async-loaded widget script (CDN)
├── emails/
│   └── monday-report.mjml # MJML template
├── billing/
│   ├── stripe-webhook.php # Webhook handler
│   └── subscription.php   # Tier checks, upgrade/downgrade
├── insights/
│   └── feedback-loop.php  # Query insight_actions, inject into prompt
└── integrations/
    └── agentpress.php     # Upsell hook + one-click install
```

**Cron:**
- `localgenius_monday_report` — weekly, registered on plugin activation.
- `localgenius_widget_sync` — daily, syncs widget config to CDN edge cache.

**APIs:**
- Stripe Checkout + Customer Portal.
- Resend API for email delivery.
- LocalGenius API for campaign generation (existing).

---

## 8. Acceptance Criteria

- [ ] Widget renders on fresh WP install within 4 minutes of API key entry.
- [ ] Monday Morning Report sends to 100% of active users on first Monday post-launch.
- [ ] $1 trial checkout completes end-to-end in test mode.
- [ ] AgentPress upsell notice displays on `agentpress_site_launched` action.
- [ ] `insight_actions` query returns results and influences campaign prompt.
- [ ] Email open rate tracking pixel fires correctly.
- [ ] Grace period downgrade works on simulated payment failure.

---

## 9. Metrics & Success

| Metric | Baseline | Target (90 days) |
|--------|----------|-----------------|
| Widget auto-render rate | Unknown | 100% |
| Monday Report open rate | N/A | >40% |
| Trial signups | 0 | 300 |
| Trial-to-paid conversion | N/A | >15% |
| Paying customers | 0 | 100 |
| MRR | $0 | >$10,000 |
| AgentPress attach rate | N/A | >30% |
| insight_actions query usage | 0% | 100% of campaigns |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Stripe webhook failures | Log all webhooks; retry via cron every 15 min for 24h. |
| Email deliverability | Use Resend with DKIM/SPF verified domain. Monitor bounce rate. |
| Widget conflicts with themes | Test on 20 popular themes (Astra, Divi, GeneratePress, etc.). Provide CSS override guide. |
| Competitor data privacy | Aggregate only; no individual business identification in competitor snapshot. |
| Trial abuse | One trial per email + domain combo. Stripe fingerprinting. |

---

## 11. Release Plan

**Week 1:** Widget auto-render + insight_actions feedback loop + Stripe billing backend.
**Week 2:** Monday Morning Report + AgentPress integration + QA + pricing page live.
**Launch:** Monday morning for report timing alignment.

*Phil Jackson*
*Head Coach, Shipyard AI*
