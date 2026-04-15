# LocalGenius Frontend Launch — Requirements Traceability

**Generated:** 2026-04-15
**Source:** PRD `/home/agent/shipyard-ai/prds/localgenius-frontend-launch.md`
**Decisions:** `/home/agent/shipyard-ai/rounds/localgenius-frontend-launch/decisions.md`
**Project Slug:** `localgenius-frontend-launch`

---

## CRITICAL: This is NOT an Emdash Project

**Platform:** WordPress Plugin (standalone, NOT Emdash-based)  
**Technology:** Vanilla JavaScript + WordPress PHP + Cloudflare Workers backend  
**Architecture:** WordPress plugin interfaces with separate Cloudflare Workers API

LocalGenius is a WordPress plugin that provides AI chat widget for local businesses.  
It is completely separate from the Emdash CMS ecosystem.

---

## Requirements Summary

| Category | Count | Status |
|----------|-------|--------|
| Must-Have (Week 1) | 47 requirements | Pending Build |
| Deferred (v1.1+) | 10 features | Out of Scope |
| Open Questions | 6 blockers | Requires Resolution |
| Technical Constraints | 28 constraints | Enforced |

---

## Week 1 Must-Have Requirements

### Chat Widget (12 requirements)

- **REQ-W001:** Floating bubble displays in bottom-right corner
- **REQ-W002:** Bubble is responsive on mobile (< 768px viewport)
- **REQ-W003:** Clicking bubble expands chat interface
- **REQ-W004:** Response time < 2 seconds
- **REQ-W005:** "Powered by LocalGenius" badge included
- **REQ-W006:** Single CSS variable: --localgenius-accent-color
- **REQ-W007:** Total bundle size < 20KB gzipped
- **REQ-W008:** Works on 3+ WordPress themes (TwentyTwentyFour, GeneratePress, Astra)
- **REQ-W009:** Loading state indicator during message processing
- **REQ-W010:** Error handling with fallback messages
- **REQ-W011:** ARIA labels on all interactive elements
- **REQ-W012:** Vanilla JavaScript only (no React/Vue/Angular)

### 60-Second Magical Onboarding (7 requirements)

- **REQ-O001:** Auto-detect business type from WordPress metadata
- **REQ-O002:** Fallback dropdown if detection fails
- **REQ-O003:** Auto-populate exactly 10 FAQs per business type
- **REQ-O004:** Live preview pane shows widget on user's site
- **REQ-O005:** Complete in < 60 seconds with clear metadata
- **REQ-O006:** Single activation button: "Yes, that's me"
- **REQ-O007:** Emotional goal: "Holy shit, this already works"

### Admin FAQ Editor (4 requirements)

- **REQ-F001:** Manual FAQ creation
- **REQ-F002:** Edit/override auto-generated FAQs
- **REQ-F003:** Basic CRUD operations
- **REQ-F004:** NO drag-and-drop reordering

### Chat API Endpoint (7 requirements)

- **REQ-A001:** POST /chat endpoint accepts message, returns response
- **REQ-A002:** FAQ caching layer checks D1 before OpenAI
- **REQ-A003:** Cache reduces LLM calls by >70%
- **REQ-A004:** p95 latency < 500ms for cached queries
- **REQ-A005:** 2-second hard timeout with fallback
- **REQ-A006:** Fallback message: "I'm not sure, contact us at [email]"
- **REQ-A007:** Response formatter normalizes outputs

### FAQ Data Layer (3 requirements)

- **REQ-D001:** D1 SQLite stores FAQs with business_id FK
- **REQ-D002:** Cache queries by business ID + question similarity
- **REQ-D003:** Cache invalidation when FAQs added/edited

### WordPress Plugin (6 requirements)

- **REQ-P001:** Main entry: localgenius.php with plugin headers
- **REQ-P002:** Settings page for API key storage
- **REQ-P003:** Auto-inject widget script on frontend
- **REQ-P004:** Follow WordPress coding standards (PHPCS)
- **REQ-P005:** Escape all output (prevent XSS)
- **REQ-P006:** readme.txt for wp.org submission

### Business Detection (2 requirements)

- **REQ-B001:** Extract business type from WP metadata
- **REQ-B002:** Pre-populated 10-FAQ templates per type

### Technical Stack (6 requirements)

- **REQ-T001:** Vanilla JavaScript (no frameworks)
- **REQ-T002:** CSS variables for theming
- **REQ-T003:** No build step required
- **REQ-T004:** Cloudflare Workers backend
- **REQ-T005:** D1 database for caching
- **REQ-T006:** R2 storage for assets

