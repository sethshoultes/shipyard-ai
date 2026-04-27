# PRD: LocalGenius Activation Sprint

**Author:** Phil Jackson (via IMPROVE Cycle 2026-04-24)
**Status:** Ready for Pipeline
**Priority:** P0
**Deadline:** 5 days
**Estimated Tokens:** 500K–750K

---

## Problem Statement

LocalGenius has shipped backend infrastructure (Cloudflare Workers, D1 schemas, Stripe billing, weekly digest queries) but the user-facing experience is incomplete. The previous `localgenius-frontend-launch` PRD was rejected by the board with a 1.5/10 score for shipping empty directories instead of a working frontend.

**The specific gaps preventing activation:**
1. **Blank-slate onboarding.** Users activate the plugin and see an empty FAQ table. No auto-detection. No pre-population. No guidance.
2. **Invisible widget.** The chat widget UI was not shipped. Users cannot see what their customers will see.
3. **Dormant benchmark engine.** The `insight_actions` table and competitive benchmark query exist but are not surfaced to users in emails or dashboards.
4. **No widget preview.** A restaurant owner configuring the plugin has no way to preview the AI assistant on their actual site.

**The business impact:**
- Activation rate is near-zero: users install, see homework, and abandon.
- Benchmark engine — the primary data moat — generates no customer value while staged.
- LTV/CAC of 9.3x cannot be realized if users churn before seeing value.

**Board Verdict (Oprah):** *"Minute 1: Install. Minute 2: Empty FAQ table. Minute 5: She closes the tab and goes back to Instagram."*
**Board Verdict (Jensen):** *"The schema is the moat. The query is the product. Customers cannot buy a Postgres schema."*

---

## Proposed Solution

A **5-day activation sprint** focused exclusively on the first-5-minutes experience and dormant infrastructure. No redesign. No new pricing. No new features. Just: make what exists visible, usable, and magical within 3 minutes of activation.

**Scope boundaries:**
- ✅ Auto-detect business info and pre-populate FAQs
- ✅ Ship basic chat widget UI (HTML/CSS/JS, not beautiful — working)
- ✅ Activate benchmark query in weekly digest
- ✅ Add widget preview to admin dashboard
- ✅ Add activation admin notice + first-run guidance
- ❌ No pricing page redesign (covered by `localgenius-revenue-retention-sprint`)
- ❌ No new email templates (use existing digest template)
- ❌ No new database schema (use existing `insight_actions` and benchmark tables)

---

## Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | Auto-Detect Business Metadata | Scrape site's schema.org, OpenGraph, footer text to pre-fill: business name, address, hours, phone, category | Must-have |
| 2 | Category-Based FAQ Pre-Population | Detect category (restaurant, dental, retail, services, etc.) and auto-generate 15-20 common FAQs. User reviews/confirms, not creates from void. | Must-have |
| 3 | Chat Widget UI (Basic) | Working HTML/CSS/JS widget: chat bubble, message input, AI response rendering, close/minimize. Matches brand colors. Not a redesign — ship what renders. | Must-have |
| 4 | Widget Preview Panel | Admin dashboard shows live widget preview on a sample page. "This is what your customers see." | Must-have |
| 5 | Benchmark Query Activation | SQL query against existing data: "Your review response rate is faster than X% of [category] in [city]." Added to existing weekly digest. | Must-have |
| 6 | Activation Admin Notice | On plugin activation: "LocalGenius found your business info. [Review and launch your AI assistant →]" | Must-have |
| 7 | Progressive Onboarding Wizard | 3-step modal: Step 1 Review detected info → Step 2 Edit FAQs → Step 3 Preview widget → Done. | Must-have |
| 8 | First-Run Tooltip | First wp-admin page load after activation: "Your AI assistant is ready. See it in action →" | Nice-to-have |
| 9 | "Quick Win" Email | 24 hours after activation: "Your widget answered its first question! Here's what your customers asked." | Nice-to-have |
| 10 | Empty State Design | FAQ table shows helpful empty state with "Add from template" button, not blank rows. | Nice-to-have |

---

## Feature Details

### Auto-Detect Business Metadata

**Inputs:**
- Site URL (WordPress home URL)
- Existing schema.org JSON-LD blocks (Restaurant, LocalBusiness, etc.)
- OpenGraph tags
- Footer text scraping (address patterns, phone patterns)
- WordPress site title/tagline

**Outputs:**
```json
{
  "business_name": "Maria's Trattoria",
  "category": "restaurant",
  "address": "123 Main St, Denver, CO 80202",
  "phone": "(303) 555-0147",
  "hours": "Mon-Thu 11am-10pm, Fri-Sat 11am-11pm, Sun 4pm-9pm",
  "cuisine_type": "Italian"
}
```

**Confidence scoring:** If confidence < 0.7 for any field, show it as "We think this is... [edit]"

### Category-Based FAQ Pre-Population

**Categories and seed FAQs:**

| Category | Seed FAQs |
|----------|-----------|
| Restaurant | Hours, reservations, dietary options, parking, private events, menu changes, takeout/delivery |
| Dental | Insurance accepted, new patient forms, emergency visits, hours, location, services offered |
| Retail | Return policy, store hours, online ordering, gift cards, sizing, shipping |
| Services | Booking process, service areas, pricing estimates, cancellation policy, licenses |

**Mechanics:**
1. Auto-detect category from metadata or ask user to confirm
2. Generate 15-20 FAQs using category template + detected business info
3. Present in editable table: "We drafted 18 questions. Tap to edit or remove."
4. One-click "Add all" or selective approval

### Chat Widget UI (Basic)

**Requirements:**
- Fixed-position bubble (bottom-right)
- Expandable chat panel (320px wide, 480px tall)
- Message history with user/AI avatars
- Typing indicator
- Close/minimize controls
- Mobile-responsive (full-screen overlay on < 480px)

**Technical constraints:**
- Plain HTML/CSS/JS — no framework
- CSS variables for brand theming
- Inline SVG for icons (no external dependencies)
- Async fetch to existing Cloudflare Worker endpoint

**Acceptance:**
- Widget renders on page load
- User can type question → see AI response
- Works on Chrome, Safari, Firefox, Edge (latest 2 versions)
- Works on iOS Safari and Android Chrome

### Benchmark Query Activation

**Query logic (existing tables):**
```sql
SELECT
  me.reviews_responded,
  me.avg_response_time_hours,
  PERCENT_RANK() OVER (
    PARTITION BY benchmark_category, benchmark_city
    ORDER BY avg_response_time_hours DESC
  ) as response_time_percentile
FROM user_metrics me
JOIN benchmarks bm ON me.user_id = bm.user_id
WHERE me.user_id = ?
```

**Digest integration:**
Add 2-3 lines to existing Sunday digest:
> "Your review response time is **4.2 hours** — that's faster than **67% of Italian restaurants in Denver**. The top 10% average 2.1 hours. Room to climb 🏔️"

**Tone:** Warm maître d'. Never shaming. Always "room to climb."

### Progressive Onboarding Wizard

**Step 1: Review (30 seconds)**
- "We found this info on your site. Looks right?"
- Editable fields: name, category, hours, address, phone
- One button: "Looks good →"

**Step 2: FAQs (60 seconds)**
- "We drafted 18 common questions for [Italian restaurants]. Keep the ones that fit."
- Toggle each FAQ on/off. Edit text inline.
- "Add all" | "Select none" | "Custom add"

**Step 3: Preview (30 seconds)**
- Live widget preview: "This is what your customers see."
- "Launch on my site" | "Customize appearance →"
- Done state: "Your AI assistant is live! First weekly digest arrives Monday."

---

## Design Direction

**Brand:** "Sous" (warm maître d') — use existing brand voice from `config/brand.ts`
**Colors:** Use existing localgenius.company palette. No new colors.
**Typography:** Use existing site fonts. No new fonts.
**Widget style:** Rounded corners, warm gray tones, friendly avatar. Not corporate chatbot. Not hipster minimal. Trustworthy neighborhood restaurant energy.

**Banned phrases** (per brand guidelines):
- "Optimize your workflow"
- "Leverage AI"
- "Synergy"
- "Scalable solution"

**Required phrases:**
- "Room to climb"
- "Your AI assistant"
- "First weekly digest arrives Monday"

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Wizard completion rate | 70% of activations | 30 days |
| FAQ pre-population acceptance | 60% of users keep >10 auto-drafted FAQs | 30 days |
| Widget live rate | 80% of wizard completers | 30 days |
| Benchmark query in digest | 100% of weekly digests include percentile | Immediate |
| Time-to-first-value | < 3 minutes from activation | Immediate |
| Week-1 retention | 40% of installers return to dashboard | 30 days |
| Admin notice CTR | 50% of activations click through | 14 days |

---

## Must-Haves vs. Nice-to-Haves

**Must-Haves (will not ship without):**
1. Auto-detect business metadata from site content
2. Category-based FAQ pre-population (restaurant, dental, retail, services)
3. Working chat widget UI (HTML/CSS/JS, renders, accepts input, shows response)
4. Widget preview panel in admin dashboard
5. Benchmark percentile query added to existing weekly digest
6. Activation admin notice with "Review and launch" CTA
7. 3-step onboarding wizard (review → FAQs → preview)

**Nice-to-Haves (only if tokens allow):**
1. First-run tooltip on admin page
2. "Quick win" email at 24 hours
3. Empty state illustration for FAQ table
4. Multi-category detection (what if site has restaurant + event venue?)

---

## Technical Notes

**Existing infrastructure to leverage:**
- Cloudflare Workers (AI response endpoint already exists)
- D1 database (FAQ storage already exists)
- `insight_actions` table (persistence already exists)
- Benchmark tables (schema already exists)
- Weekly digest email job (Inngest cron already exists)
- Stripe billing (already configured)

**New code needed:**
- WordPress admin UI for wizard (PHP + vanilla JS)
- Widget frontend (HTML/CSS/JS, ~300 lines)
- Schema.org scraper (PHP, using existing WordPress functions)
- FAQ template definitions (JSON or PHP array, ~200 lines)

**Estimated files:**
```
localgenius/
├── admin/
│   ├── class-onboarding-wizard.php    # Step rendering, form handling
│   ├── class-business-detector.php    # Schema.org + metadata scraper
│   └── views/
│       ├── wizard-step-1.php
│       ├── wizard-step-2.php
│       ├── wizard-step-3.php
│       └── widget-preview.php
├── includes/
│   └── class-faq-templates.php      # Category-based seed FAQs
├── public/
│   └── js/
│       └── widget.js                  # Chat widget frontend
│   └── css/
│       └── widget.css                 # Widget styles
└── localgenius.php                    # Main plugin file (add activation hook)
```

---

## Token Budget

| Item | Tokens |
|------|--------|
| Base: Simple feature set | 500K |
| Multiplier: WordPress admin UI (+15%) | +75K |
| Multiplier: Widget frontend (+10%) | +50K |
| **Total Budget** | **~625K** |
| Revision credits (estimated 1 round) | 100K |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Schema.org missing on user site | Fallback to OpenGraph → footer text → manual entry. Always have fallback. |
| Widget JS conflicts with theme | Scoped CSS (BEM naming). Iframe optional fallback if conflicts detected. |
| Auto-detected info is wrong | Confidence scoring + editability. Never auto-save without user confirmation. |
| Previous frontend PRD trauma | Explicit scope boundary: "working, not beautiful." Board wants existence, not perfection. |
| Benchmark data insufficient for percentile | Graceful fallback: "You're responding to reviews in 4.2 hours." (no percentile if N < 10) |

---

## Related PRDs

- `localgenius-revenue-retention-sprint.md` — Annual billing, MoM digest (parallel work, not blocked by this sprint)
- `localgenius-engagement-system.md` — Daily micro-notifications, badges, cliffhangers (follow-up sprint)
- `localgenius-benchmark-engine.md` — Competitive ranking architecture (already built, this PRD activates it)

---

## Board Sponsorship

- **Oprah:** Primary sponsor — first-5-minutes experience owner
- **Jensen:** Moat activation — benchmark query + auto-detection data flywheel
- **Shonda:** Narrative arc — wizard creates "season premiere" energy
- **Buffett:** Revenue protection — activation is the prerequisite for LTV realization

---

**Non-Negotiable:** This PRD ships a working widget and a completed wizard. Empty directories are not acceptable. TODO placeholders are not acceptable. The board has spoken: 1.5/10 for frontend promises without frontend delivery. This sprint earns a 7+ or it doesn't ship.

---

*"The restaurant owner in Omaha cannot buy a Postgres schema. She can buy 'I know exactly how my review response time ranks.' That sentence requires a widget, a dashboard, and a weekly email that actually renders in Gmail."*

— Jensen Huang, Board Review 2026-04-24
