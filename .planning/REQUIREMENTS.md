# ReviewPulse v1 MVP — Requirements Specification

**Project Slug:** `github-issue-sethshoultes-shipyard-ai-32`
**Generated:** 2026-04-13
**Source:** PRD + Locked Decisions (decisions.md)

---

## Executive Summary

ReviewPulse is an Emdash CMS plugin for review management. This specification covers the v1 MVP which includes Google/Yelp sync, display widgets, and admin dashboard — but explicitly excludes response templates, email campaigns, AI suggestions, and sentiment analysis.

**North Star:** *Letting small business owners sleep at night by turning customer voices into peace of mind.*

---

## Requirements Traceability Matrix

### MVP Features (IN)

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-SYNC-001 | SYNC | Google OAuth connection | User authenticates via Google OAuth; token stored securely; reviews sync within 30s | P0 |
| REQ-SYNC-002 | SYNC | Google Places API integration | Reviews pulled from Google Business Profile; all fields populated (rating, text, author, date) | P0 |
| REQ-SYNC-003 | SYNC | Yelp API integration | Reviews pulled from Yelp Business; same field coverage as Google | P0 |
| REQ-SYNC-004 | SYNC | KV storage pattern | Reviews persist using `reviews:list` + `review:{id}` pattern; handles <1000 reviews | P0 |
| REQ-SYNC-005 | SYNC | 30-second first-run | Reviews visible within 30 seconds of OAuth completion; no config screens | P0 |
| REQ-UI-001 | WIDGET | Review display widget | Reviews render with rating, author, text, date; uses Emdash design system; mobile-responsive | P0 |
| REQ-UI-002 | WIDGET | Schema markup (JSON-LD) | Valid JSON-LD for review rich snippets; Google Search Console validates | P0 |
| REQ-UI-003 | WIDGET | Widget data endpoint | Public `/widgetData` endpoint returns featured + recent reviews with stats | P0 |
| REQ-ADMIN-001 | ADMIN | Dashboard overview | Lists all reviews with rating, author, text, date, source; loads <2s | P0 |
| REQ-ADMIN-002 | ADMIN | Filter by rating | Filter reviews by star rating (1-5); count per rating shown | P1 |
| REQ-ADMIN-003 | ADMIN | Filter by source | Filter by Google/Yelp/Manual source | P1 |
| REQ-ADMIN-004 | ADMIN | Featured toggle | Mark reviews as featured; featured status persists; featured display first on widget | P0 |
| REQ-ADMIN-005 | ADMIN | Flagged toggle | Mark reviews for follow-up; flagged status persists; highlighted in admin | P0 |
| REQ-ADMIN-006 | ADMIN | Design system alignment | All UI uses Emdash design system components; no custom CSS | P0 |
| REQ-UI-004 | WIDGET | 30-day trends | Simple trend line showing review volume over 30 days; tiny, unobtrusive | P1 |
| REQ-UI-005 | COPY | Human-first UI copy | Warm, human language throughout: "You've got 3 new reviews" not technical jargon | P1 |

### Required Fixes (FIX)

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-FIX-001 | FIX | Eliminate `throw new Response()` | Replace all instances with proper Emdash error handling; all routes return valid responses | P0 |
| REQ-FIX-002 | FIX | Correct `rc.user` access | Replace all 17 `rc.user` references with correct Emdash context API | P0 |
| REQ-FIX-003 | FIX | Correct `rc.pathParams` access | Replace with correct Emdash route parameter access pattern | P0 |
| REQ-FIX-004 | FIX | Emdash design system | Refactor all UI to use Emdash components; zero custom CSS | P0 |
| REQ-FIX-005 | FIX | Mock data testing | All routes testable with mock data; tests pass without live API credentials | P0 |

### Features to Cut (CUT) — Explicitly Out of Scope

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-CUT-001 | CUT | Response templates | No template system; no template UI; all responses are manual | P0 |
| REQ-CUT-002 | CUT | Email campaigns | No email campaign routes; no marketing automation | P0 |
| REQ-CUT-003 | CUT | Manual review creation | No "create review" button; all reviews from sync only | P0 |
| REQ-CUT-004 | CUT | AI response suggestions | No AI drafts; no suggestion engine; defer to v2 | P0 |
| REQ-CUT-005 | CUT | Sentiment analysis | No sentiment graphs; no confidence scores; ratings from source only | P0 |
| REQ-CUT-006 | CUT | Notification emails | Deferred pending resolution; no email notifications in v1 | P0 |

---

## Technical Constraints

### From EMDASH-GUIDE.md Section 6 (Plugin System)

1. **Plugin Context APIs** (verified from docs):
   - `ctx.kv.get<T>(key)` — Read from KV store
   - `ctx.kv.set(key, value, options?)` — Write to KV store
   - `ctx.kv.delete(key)` — Delete from KV store
   - `ctx.log.{info|warn|error}(msg)` — Structured logging
   - `ctx.env.{VARIABLE}` — Environment variable access
   - `ctx.storage` — Plugin document collections (preferred for scalability)

2. **Route Handler Pattern** (from EMDASH-GUIDE.md):
   ```typescript
   routeName: {
     public?: boolean,
     handler: async (ctx) => {
       // Return object, not throw Response
       return { data: ... };
     }
   }
   ```

3. **Block Kit Admin UI** (from EMDASH-GUIDE.md Section 6):
   - Sandboxed plugins describe admin UI as JSON
   - Block types: header, section, divider, fields, table, actions, stats, form
   - Plugin-supplied JavaScript does NOT run in browser

4. **Capabilities Required**:
   - `read:content` — Optional (if accessing site content)
   - `network:fetch` — Required for Google/Yelp API calls
   - `email:send` — Deferred (notifications cut from v1)

### From decisions.md

1. **Product name**: ReviewPulse (not Chorus) for v1
2. **Design system**: Use Emdash's existing design system exclusively
3. **KV pattern**: O(n) acceptable for v1; optimize if >1000 reviews become common
4. **Testing**: Mock data testing; human QA for live API verification
5. **No notification config UI**: Decision pending but cut from v1 MVP

---

## File Structure Target (~800 lines core)

Based on decisions.md file structure:

```
reviewpulse/
├── index.ts                 # Plugin descriptor export (40 lines)
├── routes/
│   ├── admin.ts            # Admin dashboard routes
│   ├── api.ts              # CRUD API endpoints
│   ├── oauth.ts            # Google OAuth flow
│   └── widget.ts           # Frontend widget endpoint
├── sync/
│   ├── google.ts           # Google Places API sync
│   └── yelp.ts             # Yelp API sync
├── storage/
│   └── kv.ts               # KV operations (reviews:list pattern)
├── components/
│   ├── widget.tsx          # Review display widget (Astro)
│   └── admin-panel.tsx     # Admin dashboard UI
├── types.ts                # Shared type definitions
└── utils.ts                # Helpers (date formatting, etc.)
```

---

## Risk Mitigations Required

From risk scan analysis:

| Risk ID | Description | Mitigation |
|---------|-------------|------------|
| RP-001 | Environment variable validation | Add explicit checks at plugin:install hook |
| RP-002 | External API error handling | Implement retry logic, timeouts, circuit breaker |
| RP-003 | KV storage scalability | Document limits; defer migration to ctx.storage |
| RP-006 | Admin UI XSS | Audit all HTML generation; add CSP headers |
| RP-008 | Public route rate limiting | Add IP-based rate limits on public endpoints |

---

## Acceptance Criteria Summary

### Must Pass Before Ship

1. [ ] All `throw new Response()` patterns removed
2. [ ] All `rc.user` and `rc.pathParams` references corrected
3. [ ] Google OAuth flow works with mock data
4. [ ] Yelp sync works with mock data
5. [ ] Widget displays reviews with Emdash design system
6. [ ] Admin dashboard loads in <2 seconds
7. [ ] Featured/flagged toggles persist correctly
8. [ ] 30-day trend line renders
9. [ ] All tests pass with mock data
10. [ ] No response templates, email campaigns, AI suggestions, or sentiment analysis code

### Human QA Required

1. [ ] Live Google Places API sync
2. [ ] Live Yelp API sync
3. [ ] Bella's Bistro integration test
4. [ ] Mobile responsiveness verification
5. [ ] First-run ≤30 seconds verification

---

## Version

- **Specification Version**: 1.0
- **Last Updated**: 2026-04-13
- **PRD Source**: `prds/github-issue-sethshoultes-shipyard-ai-32.md`
- **Decisions Source**: `rounds/github-issue-sethshoultes-shipyard-ai-32/decisions.md`
