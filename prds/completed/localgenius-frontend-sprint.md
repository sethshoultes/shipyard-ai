# PRD: LocalGenius Frontend Sprint
**Status:** Draft
**Date:** 2026-04-26
**Agent:** Phil Jackson (featureDream IMPROVE → PRD Pipeline)
**Priority:** P0 — Product Critical
**Estimated Tokens:** 1.5M (Complex Site + Widget + Plugin)

---

## 1. Problem Statement

LocalGenius has an 80% complete backend (D1 schema, Cloudflare Workers, FAQ cache, benchmark engine, email infrastructure) and a 20% complete frontend. The product cannot be used. There are zero customers and zero MRR.

The board has repeatedly rejected frontend sprints for shipping "empty directories" instead of working code. The benchmark engine is a Postgres schema with no UI. The weekly digest is email infrastructure with no templates.

**Result:** A product with 9.3x LTV/CAC unit economics that generates $0 because no one can install, configure, or pay.

---

## 2. Goal

Ship a complete, usable LocalGenius frontend within 14 days. Target: 10 paying customers at $29/month within 30 days, $1,000 MRR within 90 days.

---

## 3. Scope

### IN SCOPE

#### A. AI Chat Widget (Primary Product)
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Floating Bubble | Bottom-right corner, branded | Fixed position, 56px circle, "LG" logo, `z-index: 999999`, animates on load |
| Expanded Chat | Modal overlay | 380px wide, 520px tall, mobile: full-screen bottom sheet, max-height 80vh |
| FAQ Cache | D1 lookup before LLM | <200ms cached response, <3s LLM response, 2-second hard timeout with fallback |
| Message UI | User + assistant bubbles | User: right-aligned, slate-800. Assistant: left-aligned, white border. Timestamp on hover. |
| Typing Indicator | Animated dots while waiting | Three dots, CSS animation, disappears on response |
| Fallback State | "We'll get back to you" | Triggered at 2s timeout, captures email if provided |
| Bundle Size | Gzipped JS + CSS | <20KB total |
| Cross-Theme | Test on 3 themes | TwentyTwentyFour, GeneratePress, Astra — no layout breakage |

#### B. Admin Dashboard + Live Preview
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Dashboard Home | Stats + preview | Questions this week, top questions, response rate, live widget preview |
| Live Preview Panel | Admin sees widget as visitor sees it | Interactive: admin can type test questions, see responses, verify styling |
| FAQ Management | CRUD for business FAQs | Add, edit, delete, reorder FAQs. Rich text limited to bold, links, lists. |
| Business Info | Editable profile | Name, address, hours, phone, category. Auto-detect on first run, editable after. |
| Settings | Widget appearance | Position (left/right), primary color, greeting message, offline message |
| Usage Meter | Tier visibility | "47 of 50 free responses used. 3 days remaining." Progress bar. Upgrade CTA. |

#### C. 60-Second Onboarding Wizard
| Step | Action | Time Target |
|------|--------|-------------|
| 1 | Auto-detect business from WordPress metadata (schema.org, OpenGraph, site title) | 5s |
| 2 | Show detected info: name, address, category, suggested logo | 5s |
| 3 | User confirms or edits: "Yes, that's me" button | 10s |
| 4 | Pre-populate 10-20 FAQs from category templates (restaurant, dental, retail, services) | 5s |
| 5 | Show live preview with test question auto-answered | 20s |
| 6 | Single "Activate Widget" button → widget live, confirmation screen with URL | 15s |

**Category Templates:**
- Restaurant: hours, reservations, parking, dietary options, private events, menu updates
- Dental: insurance, new patient forms, emergency hours, sedation, financing
- Retail: returns, shipping, store hours, gift cards, product availability
- Services: booking, estimates, service area, licensing, testimonials

#### D. Weekly Digest Email ("Sous" Episodes)
| Section | Content | Narrative Purpose |
|---------|---------|-------------------|
| Cold Open | One surprising number | "12 people asked about gluten-free options this week" |
| Rising Action | Comparison + context | "Your response time: 4 minutes. Average in your area: 2 hours." |
| Milestone | Badge or streak | "4-week streak! You've answered every question this month." |
| Benchmark | Percentile ranking | "You're in the top 15% of Italian restaurants in Denver for responsiveness." |
| Cliffhanger | Preview of next week | "Next week, I'm testing whether lunch specials drive more questions." |
| CTA | One button | "Update your hours" or "See full report →" |

**Brand Voice:** "Sous" — warm maître d'. Banned: "leverage AI," "we're excited to announce," "optimize." Approved: "Your reviews are handled. Your posts went live."

#### E. Milestone Badges
| Badge | Trigger | Visual |
|-------|---------|--------|
| First Answer | 1 question answered | Bronze circle |
| Helping Hand | 50 questions | Silver circle |
| Local Legend | 500 questions | Gold circle |
| Speed Demon | Avg response <5 min for 1 week | Lightning bolt |
| Streak Starter | 2-week streak | Flame |
| On Fire | 4-week streak | Larger flame |
| Top 10% | Benchmark percentile ≥90 | Star |
| People Person | 10 positive review responses | Heart |

**Delivery:** In-app notification + digest mention + shareable image (Open Graph).

#### F. Stripe Billing Integration
| Feature | Description |
|---------|-------------|
| Free Tier | 50 responses/month, LocalGenius branding |
| Base Tier | $29/month or $278/year, 1,000 responses, no branding, benchmark access |
| Pro Tier | $49/month or $478/year, unlimited responses, advanced insights |
| Checkout | Stripe Checkout hosted page, WordPress admin redirects to Stripe, returns to confirmation |
| Webhooks | Activate tier on payment, downgrade on cancellation, prorated annual |

### OUT OF SCOPE
- Engagement System "Pulse" (daily notifications, Business Journal) — v2
- LocalGenius Lite / SPARK embeddable widget — separate PRD
- Multi-location support (chains/franchises) — v2
- SMS notifications — cost unvalidated
- Mobile app — not justified at current scale

---

## 4. Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Widget | Vanilla JS, CSS custom properties, zero dependencies |
| WordPress Plugin | PHP 7.4+, standard admin pages |
| Backend API | Cloudflare Workers (existing) |
| Database | Cloudflare D1 (existing) |
| AI | OpenAI GPT-3.5-turbo / Claude 3.5 Haiku (existing) |
| Email | Resend (existing) |
| Billing | Stripe Checkout (new) |
| Cache | D1 FAQ table + Cloudflare Cache API |

### Widget Architecture
```
widget.js (IIFE, <20KB gzipped)
├── Config (injected via wp_localize_script)
│   ├── businessId, apiEndpoint, greeting, theme
├── UI Layer
│   ├── Bubble (fixed position, toggle)
│   ├── Modal (header, messages, input, close)
│   ├── Message bubbles (user/assistant)
│   ├── Typing indicator
│   └── Error/fallback state
├── Logic Layer
│   ├── sanitizeInput()
│   ├── renderMessage()
│   ├── handleSubmit() → fetch() with 2s timeout
│   └── fallbackHandler()
└── CSS (injected via <style>, CSS variables for theming)
```

### WordPress Plugin Structure
```
localgenius/
├── localgenius.php           # Main file, activation, dependency check
├── includes/
│   ├── class-admin.php       # Dashboard, settings, FAQ CRUD
│   ├── class-widget.php      # Frontend enqueue, wp_localize_script
│   ├── class-onboarding.php  # Wizard detection + flow
│   ├── class-api-client.php  # Cloudflare Worker communication
│   └── class-stripe.php      # Checkout session, webhook handling
├── assets/
│   ├── js/widget.js          # Chat widget (~8KB)
│   ├── css/widget.css        # Widget styles (~4KB)
│   ├── js/admin.js           # Dashboard + preview interactivity
│   └── css/admin.css         # Admin styles
├── templates/
│   ├── dashboard.php         # Main admin view
│   ├── onboarding-wizard.php # Step-by-step wizard
│   └── preview-panel.php     # Live preview iframe
└── readme.txt                # WordPress.org compliant
```

### API Endpoints (Cloudflare Workers)
```
POST /api/chat              → Cached FAQ check → LLM → response + log
GET  /api/business/:id      → Business profile + FAQ list
POST /api/business/:id/faqs → CRUD (auth required)
GET  /api/benchmark/:id     → Ranking + percentile (auth required)
POST /api/stripe/checkout   → Create session (auth required)
POST /api/stripe/webhook    → Stripe events
POST /api/digest/generate   → Trigger weekly digest (cron)
```

### Database Schema (D1 — additions to existing)
```sql
-- Existing tables: businesses, faqs, conversations, messages
-- Add:

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES businesses(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT CHECK(tier IN ('free', 'base', 'pro')),
  responses_used INTEGER DEFAULT 0,
  responses_limit INTEGER DEFAULT 50,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id TEXT REFERENCES businesses(id),
  badge_type TEXT,
  awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE digest_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id TEXT REFERENCES businesses(id),
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  opened_at DATETIME,
  clicked_at DATETIME
);
```

---

## 5. User Flows

### Restaurant Owner First-Time Experience
1. Installs LocalGenius plugin from WordPress.org or uploads ZIP
2. Activates → redirected to onboarding wizard
3. Wizard auto-detects "Bella's Bistro — Italian Restaurant, 247 Main St, Denver"
4. Owner confirms with "Yes, that's me" (or edits if wrong)
5. 15 FAQs pre-populated: hours, reservations, parking, gluten-free, etc.
6. Live preview shows widget on right, test questions on left
7. Owner types "Do you have outdoor seating?" → sees instant answer
8. Clicks "Activate Widget" → widget live on site
9. Sees dashboard with stats: "0 questions today. Ready when they are."
10. Usage meter shows "Free tier: 50 responses/month"

### Visitor Experience
1. Visitor lands on restaurant website
2. Chat bubble appears bottom-right after 3-second delay (first visit only)
3. Bubble pulses once to indicate presence
4. Visitor clicks → greeting: "Hi! Ask me anything about Bella's Bistro."
5. Visitor types "Do you take reservations?"
6. Cached FAQ returns in 150ms: "Yes! We accept reservations for parties of 4 or more. Call (303) 555-0101 or book online."
7. Visitor types "Is there parking?" (not in FAQ)
8. LLM generates in 2.1s: "We have a small lot behind the restaurant and street parking is available on Main St."
9. Visitor closes chat, satisfied

### Weekly Digest Delivery
1. Cron triggers every Monday 9am local time
2. System compiles: questions answered, response time, benchmark percentile, milestones earned
3. Resend delivers email from "Sous <sous@localgenius.company>"
4. Subject: "Bella's Bistro — Your week in 60 seconds"
5. Owner opens → sees cold open, rising action, milestone, cliffhanger
6. Clicks "See full report" → logs into dashboard

---

## 6. Design Requirements

### Widget Theme
```css
:root {
  --lg-primary: #4f46e5;        /* Indigo-600, overridable */
  --lg-bg: #ffffff;
  --lg-text: #1e293b;
  --lg-border: #e2e8f0;
  --lg-user-bubble: #1e293b;
  --lg-user-text: #ffffff;
  --lg-assistant-bubble: #f8fafc;
}
```
- Border radius: 12px modal, 16px bubbles
- Shadow: `0 4px 24px rgba(0,0,0,0.12)`
- Font: system-ui, -apple-system, sans-serif
- Mobile: full-width bottom sheet, drag handle to dismiss

### Admin Dashboard
- WordPress admin color scheme aware (light/dark)
- Preview panel: actual widget rendered in bordered container, resizable to mobile width
- Stats cards: questions (big number), response rate (percentage), benchmark (percentile rank)
- FAQ editor: drag-to-reorder, inline editing, add button always visible
- Onboarding wizard: full-screen overlay, progress dots (6 steps), "Skip" available but discouraged

### Onboarding Wizard
- Background: subtle gradient, calming
- Step cards: centered, max-width 560px
- Auto-detect loading state: pulsing skeleton, not spinner
- "Yes, that's me" button: large, primary, single action per step
- Preview step: split screen, left = test questions, right = live widget
- Success step: confetti animation (CSS only), "Your widget is live!" + copy embed code

---

## 7. Acceptance Criteria

### P0 Blockers (Ship Criteria)
- [ ] Widget renders on frontend, bubble + modal functional
- [ ] FAQ cache returns responses in <200ms
- [ ] LLM fallback works with 2s timeout + graceful error
- [ ] Admin dashboard accessible with live preview panel
- [ ] FAQ CRUD works (add, edit, delete, reorder)
- [ ] Onboarding wizard completes in 60 seconds for test business
- [ ] Auto-detection works for 3+ themes with schema.org or OpenGraph
- [ ] Category templates pre-populate 10+ FAQs
- [ ] Stripe checkout creates subscriptions, webhooks activate tiers
- [ ] Usage meter accurate, free tier gates at 50 responses
- [ ] Weekly digest email generates and delivers
- [ ] Cross-browser: Chrome, Safari, Firefox (latest 2 versions)
- [ ] Mobile: iOS Safari, Chrome Android — no layout breakage

### P1 (Week 2-3)
- [ ] Milestone badges award and display in dashboard
- [ ] Benchmark percentile displays in dashboard
- [ ] Digest open/click tracking
- [ ] Shareable milestone images (Open Graph)
- [ ] Annual pricing discount active

### P2 (Month 2)
- [ ] A/B test greeting messages
- [ ] Response time analytics in dashboard
- [ ] Bulk FAQ import (CSV)
- [ ] Multi-language FAQ support

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Frontend rejected again (empty dirs pattern) | Medium | Critical | Margaret Hamilton adds "frontend verification" checkpoint: screenshots + interactive demo required before board review |
| Auto-detection fails on custom themes | High | Medium | Fallback to manual entry, editable at all times, no hard block |
| OpenAI costs exceed projections | Medium | High | Strict FAQ cache priority; rate limit uncached to 10/minute per site |
| Stripe webhook failures | Low | High | Idempotency + retry + manual sync button in admin |
| WordPress.org rejection | Medium | Medium | Compliant readme, no external tracking, GPL-compatible |
| 2s timeout feels slow | Medium | Medium | Typing indicator + "Sous is thinking..." copy reduces perceived wait |
| Mobile bottom sheet UX issues | Medium | Medium | Test on 5 devices, drag-to-dismiss, keyboard handling |

---

## 9. Metrics

**14-Day Ship Targets:**
- Widget functional on test site: Day 7
- Onboarding wizard complete: Day 10
- Admin dashboard + preview: Day 12
- Stripe integration: Day 14

**30-Day Post-Ship Targets:**
- Installs: >50
- Onboarding completions: >30 (60% rate)
- Paying customers: >10
- Support tickets: <5 (indicates confusion)

**90-Day Targets:**
- MRR: $1,000 (35 customers at $29/month)
- Free-to-paid conversion: >5%
- Weekly digest open rate: >40%
- Churn: <10%/month
- Response cache hit rate: >60%

---

## 10. Dependencies

- Cloudflare Workers deploy access
- D1 database migration (add subscriptions, milestones, digest_logs)
- Stripe account + webhook endpoint configuration
- Resend API key + domain verification (localgenius.company)
- OpenAI API key + rate limit monitoring
- WordPress test environments (3+ themes)

---

## 11. Open Questions

1. Do we have a Stripe account? If not, what is setup timeline?
2. Is `localgenius.company` domain + Resend verified?
3. Should we ship WordPress.org first or direct download? (Org adds 2-week review)
4. Which LLM for v1? GPT-3.5-turbo or Claude 3.5 Haiku? (Haiku is cheaper, GPT-3.5 has better tool ecosystem)
5. Do we have test Google Business Profile connections for benchmark data?

---

## 12. Board Context

This PRD originates from featureDream IMPROVE Cycle 2026-04-26:
- **Jensen:** "Stop building new schema. The only task that matters is shipping the chat widget + admin preview panel."
- **Oprah:** "The 60-second onboarding is not a feature. It is the product."
- **Buffett:** "Ship the frontend in 14 days or cut the project."
- **Shonda:** "The weekly digest is not a report. It is an episode."

**Pipeline:** Queue for parallel debate with `shipyard-revenue-deployment.md`. No dependencies between PRDs.

---

## 13. Anti-Patterns (Learnings from Prior Failures)

From `localgenius-frontend-launch` retrospective (1.5/10 rejection):
- DO NOT ship empty directories
- DO NOT ship backend-only "infrastructure"
- DO NOT add scope (engagement system, pulse) until core widget works
- DO NOT skip interactive demo in QA
- DO NOT assume "the user will figure it out" — test onboarding with non-technical user

**Margaret Hamilton checkpoint:** Frontend verification requires:
1. Screenshots of widget on 3 themes
2. Screen recording of onboarding wizard end-to-end
3. Interactive preview panel demo
4. Mobile device test results

No board review without these artifacts.
