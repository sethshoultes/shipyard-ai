# PRD: LocalGenius Frontend Launch
**Author:** Phil Jackson (IMPROVE Cycle)
**Date:** 2026-04-14
**Priority:** P0 — Launch Blocker
**Source:** IMPROVE Board Review (Jensen, Oprah, Buffett, Shonda unanimous)

---

## Problem Statement

LocalGenius has a complete backend architecture (Cloudflare Workers, D1, R2, FAQ templates for 20+ business types) but **zero usable frontend**. Users cannot interact with the product. The admin interface doesn't exist. The chat widget CSS and JavaScript aren't built.

This isn't a feature gap—it's an existential blocker. A product that cannot be used cannot acquire customers, generate revenue, or build a data moat.

### Evidence from Board Review

- **Oprah (First-5-Minutes):** "First-5-Minutes Score: 2/10 (because the frontend doesn't exist). Potential Score: 8/10 (if built as designed)."
- **Buffett (Revenue):** "There is no revenue because there is no product. You cannot charge for software that doesn't exist."
- **Jensen (Moat):** "The Benchmark Engine is designed but not shipped. Until it's live and accumulating data, LocalGenius has no moat."
- **Shonda (Retention):** "The Weekly Digest is the primary retention mechanism. Without it, users have no reason to think about the product between customer interactions."

---

## Success Criteria

1. **Chat widget renders on WordPress sites** — floating bubble, expandable chat interface, responsive on mobile
2. **Admin interface functional** — FAQ management, business type selection, settings configuration
3. **Weekly Digest emails sent** — performance summary, question analytics, actionable recommendations
4. **Benchmark Engine operational** — competitive rankings within business type and location
5. **First 10 paying customers acquired** — $290+ MRR (10 × $29 base tier)

---

## Scope

### In Scope

#### 1. Chat Widget Frontend
- Floating chat bubble (bottom-right, customizable position)
- Expandable chat interface with conversation history
- Responsive design (mobile-first)
- Loading states and error handling
- Brand-customizable colors and position
- ARIA accessibility labels

#### 2. Admin Dashboard
- Business type selector (20+ categories)
- Location/region input
- FAQ management (view auto-generated, add custom)
- Chat widget preview
- Settings (position, colors, behavior)
- Analytics overview (questions this week, unanswered queue)

#### 3. Weekly Digest Email
- Questions answered this week (count + top 5)
- Review summary (if Google Business integrated)
- Competitive benchmark vs. similar businesses
- Personalized recommendations (based on engagement patterns)
- CTA: "Update your FAQs" / "Connect Google Business"

#### 4. Benchmark Engine
- Composite score calculation: Review count (25%), rating (25%), review velocity (20%), response rate (15%), response time (15%)
- Competitive ranking within business type + location
- Weekly ranking change notifications
- "How to improve your rank" recommendations

#### 5. Deployment & Launch
- WordPress plugin submission to wp.org
- Cloudflare Workers API deployed
- D1 database schema finalized
- R2 asset storage configured
- GDPR consent flow (EU compliance)

### Out of Scope (Deferred to v1.1)

- Multi-language support (Spanish, French)
- Agency/developer white-label tier
- CRM and booking integrations
- Custom domain support for LocalGenius Sites
- Drag-and-drop FAQ reordering

---

## Technical Requirements

### Frontend Stack
- Vanilla JavaScript (no frameworks, matches Dash/Pinned pattern)
- CSS with CSS variables for theming
- No build step required (wp-admin compatible)
- < 20KB combined JS + CSS (gzipped)

### API Endpoints (Already Designed)
- `POST /chat` — Send user message, receive AI response
- `GET /faqs` — Retrieve FAQ templates for business type
- `PUT /faqs` — Update custom FAQs
- `GET /analytics` — Weekly question analytics
- `GET /benchmark` — Competitive ranking data
- `POST /digest/send` — Trigger weekly digest (cron)

### Database Schema (Already Designed)
- `businesses` — Business profile, type, location
- `questions` — User questions + AI responses
- `faqs` — Auto-generated + custom FAQ entries
- `benchmarks` — Competitive ranking snapshots
- `digest_history` — Sent email records

### Email Infrastructure
- Cloudflare Workers + Resend or SendGrid
- HTML email templates (responsive)
- Unsubscribe handling (CAN-SPAM compliant)

---

## User Stories

### Chat Widget User (Customer)
1. User visits WordPress site with LocalGenius Lite installed
2. User sees floating chat bubble in bottom-right corner
3. User clicks bubble → chat interface expands
4. User types question: "Do you deliver?"
5. AI responds based on FAQ + site context
6. User satisfied → closes chat

### Admin User (Business Owner)
1. Admin activates LocalGenius Lite plugin
2. Homepage scanner extracts business name + phone
3. Admin selects business type from dropdown
4. Admin enters city/region
5. Auto-generated FAQs populate immediately
6. Admin sees chat widget preview
7. Admin saves → widget appears on frontend

### Weekly Digest Recipient
1. Business owner receives email: "Your LocalGenius Weekly Report"
2. Sees: 127 questions answered, top question "Do you deliver?", 4 new reviews
3. Sees: "You're #3 Italian restaurant in Austin. Here's how to reach #2..."
4. Clicks CTA → lands in admin dashboard to update FAQs

---

## Milestones

| Week | Deliverable |
|------|-------------|
| 1 | Chat widget CSS + JS (bubble, interface, responsive) |
| 1 | Admin dashboard UI (React-free, vanilla JS) |
| 2 | API integration (chat, FAQ, analytics endpoints) |
| 2 | Benchmark Engine scoring + ranking |
| 3 | Weekly Digest email generation + delivery |
| 3 | GDPR consent flow + wp.org submission prep |
| 4 | Launch to 10 beta customers |
| 4 | Iterate based on feedback |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Homepage scanner fails to extract business info | Fallback to manual entry; clear empty-state guidance |
| AI responses too generic | Improve FAQ templates; add custom FAQ editor early |
| Email deliverability issues | Use established provider (Resend/SendGrid); monitor bounce rates |
| wp.org submission rejected | Follow WordPress coding standards; escape all output |
| Users don't upgrade to paid | Benchmark Engine creates competitive urgency; upsell in digest |

---

## Definition of Done

1. Chat widget renders correctly on 3+ WordPress themes (tested)
2. Admin dashboard allows business setup in < 60 seconds
3. Weekly Digest sends to 100% of active users (cron verified)
4. Benchmark rankings update weekly (verified with test data)
5. 10 paying customers at $29/month (verified in Stripe)
6. Plugin approved on WordPress.org

---

## Revenue Target

| Metric | Target | Timeline |
|--------|--------|----------|
| Beta users | 50 | Week 3 |
| Paying customers | 10 | Week 4 |
| MRR | $290+ | Week 4 |
| MAU (free tier) | 200 | Week 8 |
| Paying customers | 35 | Week 8 |
| MRR | $1,000+ | Week 8 |

---

## Board Conditions (From Previous Reviews)

**Mandatory (Before Launch):**
- [x] Backend architecture complete
- [ ] Complete frontend deliverables (admin interface, CSS, JavaScript)
- [ ] GDPR/Privacy consent flow
- [ ] Softer edge-case messaging (humanize rate limits, errors)

**Required (Within 90 Days):**
- [ ] Data instrumentation pipeline
- [ ] Lead capture mechanism
- [ ] Aggregate analytics dashboard (Benchmark Engine)

---

## Appendix: Board Quotes

> "Ship Benchmark Engine within 30 days. Every week of delay is a week your data lead doesn't compound." — Jensen Huang

> "The frontend isn't built. This isn't confusion—it's abandonment territory." — Oprah Winfrey

> "Get to $1,000 MRR within 90 days. That proves the business model more than any slide deck. Target: 35 customers at $29/month." — Warren Buffett

> "This single feature [Weekly Digest] is the primary retention mechanism for LocalGenius." — Shonda Rhimes
