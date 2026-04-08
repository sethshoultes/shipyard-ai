# ReviewPulse — Review Management Plugin

**Issue**: #32
**Status**: Debate complete, plan locked
**Date**: 2026-04-05

---

## Debate Transcript

### Round 1: What matters most?

**Steve Jobs** (Design & Brand):

The single biggest pain point for local business owners is *not knowing what people are saying about them* and *not being able to respond fast enough*. A restaurateur gets a 2-star review at 9pm — by morning, 200 people have seen it with no response. That's a brand crisis in slow motion.

The UX priority is dead simple:
1. **One screen, all reviews.** Google, Yelp, Facebook — unified. No switching tabs.
2. **One-tap response.** AI drafts a reply, owner approves or edits, it posts back. Under 30 seconds from notification to published response.
3. **The widget on their site must look native.** Not a clunky embed. It should feel like it was designed for their brand, using their colors, their typography.

The review display widget is the *marketing asset*. It turns happy customers into social proof. The admin dashboard is the *operations tool*. Both need to be excellent, but the widget ships first because it drives immediate value — owners can show it to customers the day they install it.

**Elon Musk** (Product & Engineering):

Steve's right about the pain, but let's be honest about the technical reality. Google Places API and Yelp Fusion API both have rate limits, auth complexity, and data freshness challenges. Building a full bidirectional sync with response posting is a Phase 2 feature, not MVP.

The fastest path to shipping value:
1. **Read-only review aggregation first.** Pull reviews from Google Places API (most critical for local businesses). Yelp can wait for Wave 2 — their API is more restrictive and less impactful.
2. **KV storage for cached reviews.** We don't hit external APIs on every page load. Periodic sync (cron or manual refresh) stores reviews in KV, widget reads from cache.
3. **Sentiment scoring can be simple.** Star rating IS sentiment. We don't need NLP in Wave 1. Average rating, rating distribution, trend over time — that's the dashboard.
4. **Response drafting via AI is a killer feature but Wave 2.** It requires OAuth write scopes to post back to Google, which is a separate approval process.

MVP = Google review import + cached display widget + admin dashboard with review list and basic stats. That's shippable in 3 waves.

### Round 2: Consensus

**Steve Jobs**: I'll concede on Yelp and response posting for Wave 1, but the widget MUST support theming from day one. No "powered by ReviewPulse" badge. No fixed styles. It uses the site's design tokens or it doesn't ship.

**Elon Musk**: Agreed on theming. And I'll add: the admin notification system should be in Wave 1, not Wave 2. Business owners need to know the moment a negative review drops. Even if they can't respond from within the plugin yet, they need the alert. Email notification on new review import — that's cheap to build and high value.

**Consensus reached:**
- Wave 1: Google Places review import, KV-cached review widget (themed), admin dashboard with review list + basic sentiment stats, email notification on new/negative reviews
- Wave 2: Yelp Fusion API integration, AI-powered response drafting, response templates
- Wave 3: Review response posting (Google Business Profile write API), review request email campaigns, advanced analytics (sentiment trends, competitor benchmarking)

---

## Architecture

### Plugin Structure (follows EmDash standard pattern)

```
plugins/reviewpulse/
  src/
    index.ts              — Plugin descriptor (reviewpulsePlugin())
    sandbox-entry.ts      — definePlugin() with all KV schemas, API routes, admin UI
    email.ts              — Email templates (new review alert, review request)
    astro/
      index.ts            — Astro component exports
      ReviewWidget.astro  — Star rating display widget for site pages
      ReviewGrid.astro    — Grid/carousel of featured reviews
  __tests__/
    sandbox-entry.test.ts
    email.test.ts
  package.json
  README.md
```

### KV Storage Schema

```
review:{sourceId}          — Individual review record
reviews:list               — Array of review IDs sorted by date
reviews:stats              — Cached aggregate stats (avg rating, count, distribution)
reviews:sync-cursor        — Last sync timestamp per source
settings:google-place-id   — Google Place ID for the business
settings:display           — Widget display preferences
settings:notifications     — Notification preferences
```

### Type Definitions

```typescript
interface ReviewRecord {
  id: string;               // Internal ID
  sourceId: string;          // External ID from Google/Yelp
  source: "google" | "yelp" | "manual";
  authorName: string;
  authorAvatar?: string;
  rating: number;            // 1-5
  text: string;
  publishedAt: string;       // ISO date
  importedAt: string;        // ISO date
  responseText?: string;     // Owner's response (if any, from source)
  responseDate?: string;
  flagged?: boolean;         // Admin flagged for attention
  featured?: boolean;        // Show in widget
}

interface ReviewStats {
  totalCount: number;
  averageRating: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  lastSyncAt: string;
  recentTrend: "up" | "down" | "stable";
}
```

### Admin Pages

| Path | Label | Icon | Purpose |
|------|-------|------|---------|
| /reviews | Reviews | star | Main review list with filters |
| /settings | Settings | settings | Google Place ID, notification prefs, widget config |
| /analytics | Analytics | chart | Rating trends, distribution, response rate |

### Admin Widgets (Dashboard)

| ID | Title | Size |
|----|-------|------|
| avg-rating | Average Rating | third |
| review-count | Total Reviews | third |
| recent-reviews | Recent Reviews | half |

### API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | /sync | Trigger review sync from Google |
| GET | /reviews | List reviews (paginated, filterable) |
| GET | /reviews/:id | Single review detail |
| PATCH | /reviews/:id | Toggle featured/flagged |
| GET | /stats | Aggregate stats |
| GET | /widget-data | Public endpoint for site widget (cached) |
| PUT | /settings | Update plugin settings |

### Astro Components

- **ReviewWidget.astro** — Displays average rating + recent reviews. Configurable: count, layout (list/grid/carousel), show/hide author names, theme integration via CSS custom properties.
- **ReviewGrid.astro** — Featured reviews in a masonry/card grid. For testimonials pages.

---

## Build Plan

### Wave 1: Foundation + Display (5 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 1.1 | Plugin descriptor + project scaffold | Dev | Create `plugins/reviewpulse/` with `index.ts`, `package.json`, tsconfig, test setup | `reviewpulsePlugin()` returns valid PluginDescriptor with correct capabilities, admin pages, widgets |
| 1.2 | KV schema + core types + sandbox-entry skeleton | Dev | Define all interfaces, KV key patterns, utility functions, `definePlugin()` shell | All types exported, KV read/write helpers working, plugin registers without errors |
| 1.3 | Google Places review import | Dev | API route `POST /sync` fetches reviews from Google Places API, normalizes to ReviewRecord, stores in KV. Manual trigger from admin. | Given a valid Place ID, sync imports reviews, deduplicates by sourceId, stores in KV. Handles API errors gracefully. |
| 1.4 | Admin dashboard: review list + stats | Dev | Block Kit admin page listing all reviews with star rating, date, source, text preview. Stats widget showing avg rating + distribution. | Reviews display in reverse-chron order. Filter by rating (1-5), source, flagged. Stats widget shows correct aggregates. |
| 1.5 | Review display widget (ReviewWidget.astro) | Dev | Portable Text block + Astro component showing average rating + N most recent reviews. Themed via CSS custom properties. | Widget renders on site pages. Reads from `/widget-data` cache. Respects site design tokens. No layout shift on load. |

**Wave 1 tests**: 20+ unit tests covering KV operations, review normalization, stats calculation, API route handlers.

### Wave 2: Notifications + Yelp + Polish (4 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 2.1 | Email notifications on new/negative reviews | Dev | `email.ts` with templates. Trigger on sync when new reviews found. Configurable threshold (e.g., notify on <= 3 stars). | Email sent to admin on new review import. Negative review alert includes review text + one-click link to admin. Rate limited to prevent spam on bulk import. |
| 2.2 | Yelp Fusion API integration | Dev | Add Yelp as second review source in sync. Normalize Yelp data to same ReviewRecord format. | Yelp reviews import alongside Google. Source field correctly set. Dedup works across sources. |
| 2.3 | ReviewGrid.astro + featured reviews | Dev | Admin can mark reviews as "featured". ReviewGrid component displays featured reviews in card layout. | Toggle featured in admin. Grid component renders only featured reviews. Responsive layout (1/2/3 columns). |
| 2.4 | Settings page + sync scheduling | Dev | Admin settings page: Google Place ID, Yelp Business ID, notification prefs, widget display options. Auto-sync interval config. | Settings persist to KV. Place ID validation. Widget preview in settings. |

**Wave 2 tests**: 15+ tests covering email templates, Yelp normalization, featured toggle, settings validation.

### Wave 3: AI Responses + Campaigns (4 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 3.1 | AI response drafting | Dev | Use Claude Haiku to draft review responses based on review text, rating, and business context. Admin approves/edits before sending. | Given a review, AI generates contextual response draft. Tone matches rating (empathetic for negative, grateful for positive). Admin can edit before copying. |
| 3.2 | Response templates | Dev | Pre-built and custom response templates. Admin can create templates for common scenarios (thank you, apology, follow-up). | CRUD for templates. Quick-apply template to any review. Variable substitution ({authorName}, {businessName}). |
| 3.3 | Review request email campaigns | Dev | Send email to customers requesting they leave a Google/Yelp review. Includes direct link to review page. | Email template with review links. Batch send with rate limiting. Unsubscribe handling. Track sent/opened. |
| 3.4 | Analytics dashboard | Dev | Rating trend chart (last 30/90/365 days), response rate tracking, review volume by source, sentiment distribution over time. | Charts render correctly with real data. Date range selector. Export to CSV. |

**Wave 3 tests**: 15+ tests covering AI prompt construction, template variable substitution, email campaign logic, analytics aggregation.

---

## Test Sites

- **Bella's Bistro** — Restaurant with active Google reviews. Primary test target.
- **Peak Dental** — Healthcare with review-sensitive reputation needs.

## Token Budget

Per plugin tier: 500K tokens total.
- Debate + Plan: ~30K (6%) -- this document
- Wave 1 Build: ~180K (36%)
- Wave 2 Build: ~130K (26%)
- Wave 3 Build: ~110K (22%)
- Review + Deploy: ~50K (10%)

## Dependencies

- Google Places API key (environment variable)
- Yelp Fusion API key (Wave 2)
- Anthropic API key for AI response drafting (Wave 3)
- Resend API for email notifications (Wave 2+)
