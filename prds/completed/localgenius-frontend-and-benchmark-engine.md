# PRD: LocalGenius Frontend Completion + Benchmark Engine

**Status**: READY FOR DEBATE
**Owner**: Steve Jobs (Design), Jensen Huang (Moat Architecture)
**Date**: 2026-04-30
**Priority**: P0 — PRODUCT COMPLETION
**Est. Tokens**: 1.5M
**Timeline**: 4-6 weeks

---

## 1. Problem Statement

LocalGenius is a product with a working backend and no frontend. The backend infrastructure — SPARK widget (Vanilla JS, <10KB), Cloudflare Workers with FAQ caching, Stripe billing, weekly digest emails — is production-ready. But the WordPress plugin directories are empty. The onboarding flow exists only in specification documents. A restaurant owner cannot install LocalGenius because there is nothing to install.

Compounding the problem: the **Benchmark Engine**, the only designed moat feature in the entire LocalGenius portfolio, was never built. This engine would aggregate anonymized data across businesses to generate competitive rankings ("You're #3 of 47 Italian restaurants in your zip code"). Without it, LocalGenius has zero defensibility. With it, every new customer makes the product more valuable for every existing customer.

The pattern is unacceptable: six sprints, empty directories, and a board that has graded every iteration between 1/10 and 6/10. This PRD ends the cycle.

---

## 2. Goals

### Frontend Goals
- [ ] Ship a working WordPress plugin (`localgenius.zip`) installable via WordPress admin or WordPress.org.
- [ ] Implement the 60-second onboarding flow: auto-detect business via schema.org/OpenGraph, pre-populate 10-20 FAQs, single-screen admin, widget preview.
- [ ] Submit plugin to WordPress.org (initial review; public listing within 2 weeks of approval).
- [ ] Build a live one-click demo: user enters any restaurant URL, sees SPARK widget preview with auto-detected FAQs. No signup required.

### Benchmark Engine Goals
- [ ] Build anonymized data aggregation pipeline from `chat_logs` and `faq_usage` tables.
- [ ] Generate competitive rankings by vertical + geography (zip code or city).
- [ ] Surface benchmarks in weekly digest and widget admin dashboard.
- [ ] Ensure GDPR/CCPA compliance: no PII in aggregation, opt-out available.

---

## 3. Non-Goals

- [ ] We are NOT building the full Pulse notification system (daily micro-notifications). That is a separate P1 feature.
- [ ] We are NOT building milestone badges or shareable OG images. Those are P2 retention plays.
- [ ] We are NOT supporting non-WordPress platforms (Shopify, Squarespace) in v1.
- [ ] We are NOT redesigning the SPARK widget UI. The existing Vanilla JS widget ships as-is.

---

## 4. User Stories

### As a restaurant owner (Oprah's lens)
- I hear about LocalGenius from another restaurant owner.
- I go to localgenius.company and see a "Try it on your site" demo.
- I enter my restaurant URL and see a preview of the chat widget with my actual hours, menu, and FAQ answers.
- I think: "This is magic. I want this on my site."
- I download the plugin from WordPress.org, install it, and in 60 seconds the widget is live.
- I get my first weekly digest: "You answered 12 questions this week. You are #3 of 47 Italian restaurants in Chicago for response helpfulness."
- I feel seen. I feel competitive. I keep the plugin.

### As a LocalGenius operator (Jensen's lens)
- Every new restaurant that joins improves the Benchmark Engine's accuracy.
- The data moat deepens automatically. Competitors cannot replicate 6 months of aggregate behavior without 6 months of customers.
- The Benchmark Engine becomes the reason restaurants stay: "I need LocalGenius to know where I rank."

---

## 5. Functional Requirements

### 5.1 WordPress Plugin: `localgenius.php`

#### 5.1.1 Plugin Structure
```
localgenius/
├── localgenius.php           # Main file (~400 lines)
├── admin/
│   ├── onboarding.php        # Single-screen onboarding
│   ├── dashboard.php         # Simple stats + benchmark card
│   └── preview.php           # Widget preview iframe
├── includes/
│   ├── api-client.php        # Cloudflare Worker API wrapper
│   ├── auto-detect.php       # schema.org / OpenGraph scraper
│   └── faq-seeder.php        # Pre-populate FAQs by category
├── assets/
│   ├── css/admin.css
│   └── js/onboarding.js        # Auto-save, validation, preview
└── spark/
    ├── spark.min.js            # <10KB widget (existing)
    └── spark.css               # Widget styles (existing)
```

#### 5.1.2 Activation Flow (60-Second Onboarding)
```
1. User activates plugin.
2. Redirected to onboarding screen (wp-admin/admin.php?page=localgenius-onboarding).
3. Plugin scrapes the site's homepage for:
   - schema.org/Restaurant data (name, address, hours, cuisine)
   - OpenGraph tags (name, image)
   - Footer text (fallback business name detection)
4. Displays: "We found [Business Name]. Does this look like you?"
5. User confirms or corrects.
6. Plugin auto-categorizes business (Italian, Dental, Yoga, etc.).
7. Plugin fetches 10-20 FAQ templates from Cloudflare Worker by category.
8. User sees FAQ list with toggles: "Show these answers on my widget."
9. User clicks "Activate Widget."
10. Plugin injects SPARK script tag into `wp_footer`.
11. Widget preview appears in admin: "This is what your customers see."
```

**Constraints**:
- Single screen. No wizard steps. Auto-save all fields.
- If auto-detection fails, user can manually enter business name + category.
- If WordPress site has no public homepage (maintenance mode), show manual entry.

#### 5.1.3 Admin Dashboard (Post-Onboarding)
- [ ] **Stats Card**: Questions answered this week, top FAQs, average response time.
- [ ] **Benchmark Card**: "You are #[rank] of [count] [category] businesses in [location]." (Pulls from Benchmark Engine API.)
- [ ] **FAQ Manager**: Toggle existing FAQs, add custom FAQs, reorder.
- [ ] **Widget Settings**: Color theme (matches auto-detected brand colors or manual hex), greeting message, position (bottom-right, bottom-left).
- [ ] **Account Card**: Subscription status (Free / Base / Pro), upgrade CTA.

#### 5.1.4 Subscription Integration
- [ ] Free tier: 50 questions/month, LocalGenius branding in widget.
- [ ] Upgrade to Base/Pro via Stripe Checkout link (opens in new tab).
- [ ] Webhook updates subscription status in WordPress option table.
- [ ] If question quota exceeded, widget shows "Upgrade to unlimited answers" soft prompt.

### 5.2 Benchmark Engine

#### 5.2.1 Data Aggregation Pipeline

**Source tables** (existing in Cloudflare D1):
- `chat_logs` — question, answer, business_id, timestamp, helpfulness_score (nullable)
- `faq_usage` — faq_id, business_id, shown_count, clicked_count, timestamp

**Aggregation job** (Cloudflare Cron Trigger, weekly):
```sql
-- Anonymized aggregation
INSERT INTO benchmark_aggregates (
  vertical,          -- 'restaurant', 'dental', 'yoga'
  sub_vertical,      -- 'italian', 'pizza', 'sushi'
  geography,         -- zip code or city
  period_start,
  period_end,
  business_count,      -- count of businesses in bucket
  avg_questions_answered,
  p50_response_time,
  p90_response_time,
  top_faq_patterns     -- JSON array of most common question patterns
)
SELECT ... FROM chat_logs, faq_usage, businesses
WHERE business_id NOT IN (opted_out_businesses)
GROUP BY vertical, sub_vertical, geography, period_start, period_end;
```

**Privacy rules**:
- No business names in aggregation.
- Minimum bucket size: 5 businesses. Buckets with fewer than 5 are suppressed.
- Opt-out available in plugin admin: "Exclude my data from benchmarks."
- GDPR: Business ID is pseudonymized in aggregation. No cross-reference possible.

#### 5.2.2 Ranking Algorithm

For each business, calculate a **LocalGenius Score** (0-100):
- **Volume** (30%): Questions answered per week vs. bucket average.
- **Responsiveness** (30%): Average response time vs. bucket p50.
- **Helpfulness** (25%): FAQ click-through rate + manual "was this helpful?" feedback.
- **Freshness** (15%): Last FAQ update timestamp.

Rank businesses in bucket by score. Expose:
- `rank` and `total_in_bucket`
- `percentile` (e.g., "Top 15%")
- `trend` (up/down arrow vs. last period)

#### 5.2.3 API Endpoint

```
GET /api/benchmarks?business_id=xxx&vertical=restaurant&sub_vertical=italian&geography=60614

Response:
{
  "rank": 3,
  "total": 47,
  "percentile": 94,
  "score": 87,
  "trend": "up",
  "top_in_bucket": {
    "avg_questions": 34,
    "your_questions": 41
  }
}
```

### 5.3 Live One-Click Demo

**Page**: `localgenius.company/demo`

**Flow**:
1. User enters any public URL (restaurant, dental, yoga studio).
2. Backend scrapes the URL (same logic as auto-detect).
3. Generates a temporary SPARK widget preview with:
   - Detected business name
   - Auto-generated FAQs from public data (hours, location, cuisine)
   - "This is a preview. Install the plugin to get AI-powered answers."
4. Preview expires in 24 hours. No signup required.
5. CTA: "Get LocalGenius on your site" → links to WordPress.org plugin page.

**Technical**:
- Cloudflare Worker handles scraping + preview generation.
- Rate limited: 5 previews per IP per hour.
- Cached: Preview results cached in KV for 1 hour.

---

## 6. Technical Requirements

### 6.1 WordPress Plugin

**Standards**:
- WordPress Coding Standards (WPCS)
- PHP 7.4+ compatibility
- No external dependencies beyond `wp_remote_get/post`
- Proper nonce verification on all admin forms
- Proper escaping (`esc_html`, `esc_url`, `wp_kses_post`)
- Accessibility: ARIA labels on widget, admin contrast ratios

**API Communication**:
```php
// Cloudflare Worker endpoints
const LG_API_BASE = 'https://localgenius-api.seth-a02.workers.dev';

// Endpoints used:
// POST /detect — auto-detect business from URL
// GET /faqs?category=italian — fetch FAQ templates
// POST /chat — proxy chat to Claude
// GET /benchmarks — fetch ranking data
// POST /subscribe — Stripe checkout URL
```

### 6.2 Benchmark Engine

**Stack**: Cloudflare D1 (SQLite), Cloudflare Cron Triggers, Cloudflare Workers

**Schema additions**:
```sql
-- New table
CREATE TABLE benchmark_aggregates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vertical TEXT NOT NULL,
  sub_vertical TEXT,
  geography TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  business_count INTEGER DEFAULT 0,
  avg_questions_answered REAL,
  p50_response_time REAL,
  p90_response_time REAL,
  top_faq_patterns TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_benchmarks_lookup ON benchmark_aggregates(vertical, sub_vertical, geography, period_end);
```

**Cron schedule**: Weekly, Sundays at 2 AM UTC.
**Retention**: Keep 12 weeks of aggregate history for trend calculation.

---

## 7. Open Questions

1. **Geography granularity**: Zip code is precise but may not have 5+ businesses. Fallback to city, then metro area, then state? (Leans toward zip → city → metro fallback.)
2. **Helpfulness signal**: Do we have "was this helpful?" UI in SPARK widget? If not, we need to add thumbs up/down to widget. (Decision: Add thumbs up/down to SPARK widget as part of this PRD.)
3. **WordPress.org review timeline**: Submission to approval can take 2-14 days. Do we soft-launch via direct download first? (Decision: Yes. Direct download from localgenius.company immediately. WordPress.org submission parallel.)
4. **Auto-detection accuracy**: What is acceptable accuracy for schema.org detection? (Target: >80% for restaurants with schema markup. Graceful manual fallback for rest.)

---

## 8. Success Metrics

| Metric | Baseline | Target (30d) | Target (90d) |
|--------|----------|--------------|--------------|
| WordPress plugin installs | 0 | 50 | 200 |
| Onboarding completion rate | N/A | >60% | >75% |
| Auto-detection accuracy | N/A | >80% | >85% |
| Plugin submitted to WordPress.org | No | Yes | Listed |
| Live demo conversions | N/A | >5% | >8% |
| Benchmark Engine buckets live | 0 | 3 verticals | 10 verticals |
| Businesses with benchmark data | 0 | 20 | 100 |
| Paying customers | 0 | 10 | 35 |
| MRR | $0 | $290 | $1,015 |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| WordPress.org rejects plugin for security/code quality | Medium | High | Run WPCS linter before submission. Follow Plugin Handbook rigorously. |
| Auto-detection fails on majority of sites | Medium | High | Extensive test on 50 real restaurant sites. Manual fallback must be excellent. |
| Benchmark buckets too small (<5 businesses) | High | Medium | Aggressive geography fallback (zip → city → metro). Suppress until threshold met. |
| SPARK widget thumbs up/down adds scope creep | Medium | Medium | Limit to simple event log. No complex sentiment analysis in v1. |
| Live demo abused (scraping arbitrary URLs) | Medium | Medium | Rate limiting + URL whitelist (only restaurant/dental/yoga sites). Blocklist for abuse. |

---

## 10. Dependencies

- [ ] SPARK widget code audited and ready for packaging
- [ ] Cloudflare Worker API endpoints updated for plugin communication
- [ ] Stripe Products/Prices for Base ($29/mo) and Pro ($83/mo) already exist
- [ ] WordPress.org SVN repository access for plugin submission
- [ ] 50 real restaurant URLs for auto-detection testing

---

## 11. Out of Scope (Future Versions)

- Pulse daily notifications (P1 — separate PRD)
- Milestone badges + shareable OG images (P2)
- Business Journal (proprietary training data moat — P2)
- Multi-platform support (Shopify, Squarespace — P3)
- Agency dashboard for managing multiple client sites (P3)

---

> **Bottom line**: LocalGenius is a Porsche in a parking lot with no roads, no gas stations, and no driver. The backend is the engine. This PRD is the keys, the road, and the map. Build the frontend. Ship the benchmark. Stop designing moats and start digging them.
