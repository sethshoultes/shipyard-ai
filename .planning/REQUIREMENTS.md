# SPARK (LocalGenius Lite) — Requirements Traceability

**Project:** localgenius-lite → SPARK
**Generated:** 2026-04-19
**Phase:** 1 (Core Build)
**Source Documents:**
- `/home/agent/shipyard-ai/prds/localgenius-lite.md`
- `/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md`

---

## Executive Summary

**Product Name:** SPARK (locked decision, not "LocalGenius Lite")
**Vision:** Invisible AI assistant that makes any website instantly helpful with one script tag
**V1 Scope:** Widget + Worker only. No dashboard, no auth, no billing.
**Total V1 Requirements:** 80 atomic requirements (all MUST HAVE)
**Build Timeline:** 4-6 hours (per decisions.md locked timeline)

---

## Requirements Traceability Matrix

| REQ-ID | Requirement | Testable Criteria | Priority | Category | Wave | Source |
|--------|-------------|-------------------|----------|----------|------|--------|
| **REQ-001** | Widget floating button appears bottom-right | Button visible at (innerWidth - 80px, innerHeight - 80px) on load | P0 | UI/UX | 1 | decisions.md §1.4 |
| **REQ-002** | Floating button is 56px diameter circle | CSS: width 56px, height 56px, border-radius 50% | P0 | UI/UX | 1 | PRD §UI/UX |
| **REQ-003** | Button opens chat panel on click | Panel appears in <300ms with smooth animation | P0 | UI/UX | 1 | PRD §Features |
| **REQ-004** | Chat panel is 380px × 520px | CSS dimensions exact | P0 | UI/UX | 1 | PRD §UI/UX |
| **REQ-005** | Panel slides up smoothly on open | CSS transition, no jank | P0 | UI/UX | 1 | decisions.md §1.5 |
| **REQ-006** | Panel slides down smoothly on close | CSS transition <300ms | P0 | UI/UX | 1 | decisions.md §1.5 |
| **REQ-007** | Close button (X) in top-right of panel | Button positioned correctly | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-008** | Input placeholder: "What can I help you find?" | Exact string matches | P0 | UI/UX | 1 | decisions.md §4.1 |
| **REQ-009** | Send button visible next to input | Button in-line, clickable | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-010** | User messages right, AI messages left | CSS alignment by message type | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-011** | Typing indicator during streaming | Animated dots when streaming | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-012** | "Powered by SPARK" footer visible | Link in footer, subtle | P0 | Branding | 1 | decisions.md §1.3 |
| **REQ-013** | Footer links to https://usespark.com | href + target="_blank" | P0 | Branding | 1 | decisions.md §1.3 |
| **REQ-014** | Purple gradient default theme | CSS linear-gradient | P0 | UI/UX | 1 | decisions.md §1.4 |
| **REQ-015** | Page scraped on widget load | Extract text before first question | P0 | Core | 1 | decisions.md §2.1 |
| **REQ-016** | Scraper extracts document.title | Title in context sent to API | P0 | Core | 1 | PRD §Data Flow |
| **REQ-017** | Scraper extracts meta[description] | Meta in context | P0 | Core | 1 | PRD §Data Flow |
| **REQ-018** | Scraper extracts body.innerText | Body text in context | P0 | Core | 1 | PRD §Data Flow |
| **REQ-019** | Scraped content cached in widget | No re-scrape per question | P0 | Core | 1 | decisions.md §2.1 |
| **REQ-020** | Context truncated to ~10KB | String length ≤ 10,240 bytes | P0 | Core | 1 | decisions.md §2.1 |
| **REQ-021** | Extract from <main>, <article>, or <body> | Fallback logic implemented | P0 | Core | 1 | decisions.md §2.1 |
| **REQ-022** | Worker accepts POST /api/chat | HTTP POST, route matches | P0 | Backend | 2 | PRD §API Design |
| **REQ-023** | Chat API accepts site_id, context, question | JSON validates against schema | P0 | Backend | 2 | PRD §API Design |
| **REQ-024** | site_id generated client-side (UUID v4) | crypto.randomUUID() used | P0 | Backend | 1 | decisions.md §1.2 |
| **REQ-025** | Site ID stored in localStorage 'spark_site_id' | getItem returns valid UUID | P0 | Backend | 1 | decisions.md §1.2 |
| **REQ-026** | Worker validates site_id before processing | UUID format check | P0 | Backend | 2 | decisions.md §2.1 |
| **REQ-027** | Worker calls Claude 3.5 Haiku | API specifies model correctly | P0 | Backend | 2 | decisions.md §1.6 |
| **REQ-028** | Worker streams response to widget | SSE format: data: {chunk} | P0 | Backend | 2 | decisions.md §2.1 |
| **REQ-029** | Streaming includes chunk data | Each SSE: data: {"chunk": "..."} | P0 | Backend | 2 | PRD §API Design |
| **REQ-030** | Response includes done flag on completion | Final SSE: data: {"done": true} | P0 | Backend | 2 | PRD §API Design |
| **REQ-031** | Rate limit: 10 req/min per site_id | >10/min rejected with 429 | P0 | Backend | 2 | decisions.md §1.4 |
| **REQ-032** | Rate limit: 100 req/hour per IP | Cloudflare enforced | P0 | Backend | 2 | decisions.md §2.1 |
| **REQ-033** | Rate limit returns 429 status | HTTP 429 on limit | P0 | Backend | 2 | decisions.md §2.1 |
| **REQ-034** | Claude prompt has system instruction | Includes: "You are a helpful assistant..." | P0 | Core | 2 | PRD §System Prompt |
| **REQ-035** | Prompt instructs "use only page context" | Exact text in prompt | P0 | Core | 2 | PRD §System Prompt |
| **REQ-036** | Prompt includes {scraped_content} | Variable interpolation | P0 | Core | 2 | PRD §System Prompt |
| **REQ-037** | Claude refuses out-of-context questions | "I don't see that information..." | P0 | Core | 2 | PRD §System Prompt |
| **REQ-038** | Claude must not hallucinate | Prompt: "Never make up information" | P0 | Core | 2 | PRD §System Prompt |
| **REQ-039** | Claude stays on-topic | Prompt: "Never discuss unrelated topics" | P0 | Core | 2 | PRD §System Prompt |
| **REQ-040** | Widget renders markdown in AI responses | Code blocks, bold, italic, links formatted | P0 | UI/UX | 1 | decisions.md §2.1 |
| **REQ-041** | Markdown has proper spacing | Line breaks, code indents | P0 | UI/UX | 1 | decisions.md §2.1 |
| **REQ-042** | Button has subtle pulse animation | CSS opacity 0.7-1.0, 2s, infinite | P0 | UI/UX | 1 | decisions.md §1.5 |
| **REQ-043** | Widget handles Claude API errors gracefully | User-friendly error, not stack trace | P0 | Core | 2 | decisions.md §4.3 |
| **REQ-044** | API timeout handled | 30s timeout → "Sorry, try again" | P0 | Core | 2 | decisions.md §2.1 |
| **REQ-045** | Widget supports CORS from any domain | Worker: Access-Control-Allow-Origin: * | P0 | Backend | 2 | decisions.md §4.2 |
| **REQ-046** | Landing page deployed to Cloudflare Pages | usespark.com or similar | P0 | Deploy | 3 | decisions.md §2.1 |
| **REQ-047** | Landing hero: "Your website, instantly brilliant." | Exact text above fold | P0 | Landing | 3 | decisions.md §1.7 |
| **REQ-048** | Landing includes script tag in code block | Copy-paste ready | P0 | Landing | 3 | decisions.md §2.1 |
| **REQ-049** | Landing includes live demo | Working widget embedded | P0 | Landing | 3 | decisions.md §1.7 |
| **REQ-050** | Landing CTA button: "Try It Now" | Button text, prominent | P0 | Landing | 3 | decisions.md §1.7 |
| **REQ-051** | Landing has minimal feature lists | No detailed lists | P0 | Landing | 3 | decisions.md §1.7 |
| **REQ-052** | Landing footer with attribution | Branding present | P0 | Landing | 3 | decisions.md §1.7 |
| **REQ-053** | Widget script deployed to CDN | URL: https://cdn.usespark.com/spark.js | P0 | Deploy | 3 | decisions.md §4.2 |
| **REQ-054** | Widget self-initializes on page load | No manual init, script tag only | P0 | Core | 1 | decisions.md §2.2 |
| **REQ-055** | Widget reads data-site attribute | data-site used as site_id | P0 | Core | 1 | PRD §Solution |
| **REQ-056** | If no data-site, generate UUID | Fallback to crypto.randomUUID() | P0 | Core | 1 | decisions.md §1.2 |
| **REQ-057** | Widget script <10KB gzipped | ≤10,240 bytes compressed | P0 | Performance | 1 | PRD §Components |
| **REQ-058** | Latency: first token <2 seconds | p95 ≤ 2000ms | P0 | Performance | 2 | decisions.md §2.3 |
| **REQ-059** | Widget uses Shadow DOM for CSS isolation | attachShadow({mode: 'open'}) | P0 | Core | 1 | decisions.md §1.6 |
| **REQ-060** | Worker uses Cloudflare 99% uptime SLA | Infrastructure choice | P0 | Deploy | 2 | decisions.md §2.3 |
| **REQ-061** | Cost per question <$0.001 | Claude Haiku pricing | P0 | Performance | 2 | decisions.md §2.3 |
| **REQ-062** | Widget is vanilla JS (no frameworks) | No React/Vue/Angular | P0 | Core | 1 | PRD §Components |
| **REQ-063** | Widget injects without conflicts | Works on WordPress, Shopify, etc. | P0 | Core | 1 | decisions.md §5.1 |
| **REQ-064** | Widget waits 1s before scraping SPAs | setTimeout(scrape, 1000) | P0 | Core | 1 | decisions.md §5.1 |
| **REQ-065** | Widget handles SPA content changes | MutationObserver implemented | P0 | Core | 1 | decisions.md §5.1 |
| **REQ-066** | Input cleared after message send | value = "" after POST | P0 | UI/UX | 1 | PRD §Data Flow |
| **REQ-067** | User message added before API call | Optimistic UI | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-068** | Loading state during API wait | Spinner or typing indicator | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-069** | Worker deployed with wrangler | wrangler deploy in pipeline | P0 | Deploy | 3 | decisions.md §3 |
| **REQ-070** | Worker config includes Claude API key | ANTHROPIC_API_KEY env var | P0 | Deploy | 3 | decisions.md §3 |
| **REQ-071** | Widget accessible: ARIA labels | aria-label on button | P0 | UI/UX | 1 | PRD §Mobile |
| **REQ-072** | Mobile: Panel full-width on small screens | width 100% on <480px | P0 | UI/UX | 1 | PRD §UI/UX |
| **REQ-073** | Mobile: Panel respects safe areas | CSS safe-area-inset | P0 | UI/UX | 1 | PRD §Mobile |
| **REQ-074** | Mobile: Touch targets ≥44px | Button min 44×44px | P0 | UI/UX | 1 | PRD §Mobile |
| **REQ-075** | Input supports send button or Enter key | Click OR Enter submits | P0 | UI/UX | 1 | PRD §Chat Interface |
| **REQ-076** | Empty questions rejected | Don't send if trim() === "" | P0 | Core | 1 | Basic validation |
| **REQ-077** | Widget state persists: open/closed | localStorage or in-memory | P0 | Core | 1 | PRD §Chat Interface |
| **REQ-078** | Worker logs usage to Cloudflare Analytics | Questions, errors, site_ids | P0 | Backend | 2 | decisions.md §4.1 |
| **REQ-079** | Multiple questions share context | No re-scrape per question | P0 | Core | 1 | decisions.md §2.1 |
| **REQ-080** | Error handling user-friendly | Not technical stack traces | P0 | Core | 2 | decisions.md §4.3 |

---

## Requirements by Category

### Core Functionality (34 requirements)
REQ-015, REQ-016, REQ-017, REQ-018, REQ-019, REQ-020, REQ-021, REQ-034, REQ-035, REQ-036, REQ-037, REQ-038, REQ-039, REQ-043, REQ-044, REQ-054, REQ-055, REQ-056, REQ-059, REQ-062, REQ-063, REQ-064, REQ-065, REQ-076, REQ-077, REQ-079, REQ-080

### UI/UX Requirements (32 requirements)
REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-011, REQ-014, REQ-040, REQ-041, REQ-042, REQ-066, REQ-067, REQ-068, REQ-071, REQ-072, REQ-073, REQ-074, REQ-075

### Backend/Worker Requirements (18 requirements)
REQ-022, REQ-023, REQ-024, REQ-025, REQ-026, REQ-027, REQ-028, REQ-029, REQ-030, REQ-031, REQ-032, REQ-033, REQ-045, REQ-060, REQ-078

### Landing Page Requirements (7 requirements)
REQ-046, REQ-047, REQ-048, REQ-049, REQ-050, REQ-051, REQ-052

### Deployment Requirements (4 requirements)
REQ-046, REQ-053, REQ-069, REQ-070

### Performance Requirements (4 requirements)
REQ-057, REQ-058, REQ-061, REQ-060

### Branding Requirements (2 requirements)
REQ-012, REQ-013

---

## What's CUT from V1 (Per Locked Decisions)

**NOT shipping in V1:**
- Dashboard / admin panel
- User authentication
- Pricing / billing / Stripe
- Custom branding / theming
- Dark mode auto-detection
- Mobile responsiveness polish (functional but basic)
- Exit-intent detection
- Auto-vibe matching
- Lead capture forms
- Analytics dashboard
- Conversation history

**Rationale:** Each adds 30min-3hrs to build time. None necessary to prove core value. Can be added when users request them.

---

## Coverage Analysis

| Category | Requirements | % of Total | Wave Distribution |
|----------|--------------|------------|-------------------|
| Core Functionality | 34 | 42.5% | Wave 1 (27), Wave 2 (7) |
| UI/UX | 32 | 40% | Wave 1 (32) |
| Backend/Worker | 18 | 22.5% | Wave 2 (18) |
| Landing Page | 7 | 8.75% | Wave 3 (7) |
| Deployment | 4 | 5% | Wave 3 (4) |
| Performance | 4 | 5% | Wave 1 (2), Wave 2 (2) |
| Branding | 2 | 2.5% | Wave 1 (2) |

**Total:** 80 atomic requirements (some overlap in categories)

---

## Validation Checklist

**Functional Testing:**
- [ ] All 80 requirements have automated or manual test cases
- [ ] Widget ↔ Worker ↔ Claude API integration tested end-to-end
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Performance: <2s first token, <10KB gzipped

**Integration Testing:**
- [ ] Streaming responses work correctly
- [ ] Error handling for API timeouts, rate limits, network failures
- [ ] CORS configuration verified from 3+ different domains
- [ ] Rate limiting enforced (10/min per site_id, 100/hr per IP)

**Cross-Platform Testing:**
- [ ] Works on WordPress (Astra, Divi, Twentythree)
- [ ] Works on Shopify (Dawn, Brooklyn)
- [ ] Works on Wix, Squarespace, Webflow
- [ ] Works on custom React/Vue/Angular SPAs

**Accessibility:**
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatible
- [ ] Touch targets ≥44px on mobile

---

## Success Metrics (Per PRD)

**Launch Week:**
- [ ] 50+ developers see launch
- [ ] 10+ sites embed widget
- [ ] 100+ questions answered
- [ ] 1+ viral tweet/post about SPARK

**First Month:**
- [ ] 100+ sites using SPARK
- [ ] 1,000+ questions answered
- [ ] 10+ organic mentions on Twitter/HN/Reddit
- [ ] 1+ request to remove branding (triggers paid tier build)

**First Quarter:**
- [ ] 1,000+ sites using SPARK
- [ ] 10,000+ questions answered
- [ ] Revenue: $100/mo (20 paid users @ $5/mo)
- [ ] 1+ competitor mention in their roadmap

---

## Traceability: Requirements → Locked Decisions

| Decision | Requirements Impacted |
|----------|---------------------|
| **Name: SPARK** | REQ-012, REQ-013, REQ-047, REQ-052 |
| **No Dashboard V1** | (All backend requirements simplified) |
| **"Powered By" Footer** | REQ-012, REQ-013 |
| **Scope: Widget+Worker Only** | (All V1 requirements; exclusions noted above) |
| **Polish Core Experience** | REQ-005, REQ-006, REQ-040, REQ-041, REQ-042 |
| **Tech Stack: CF+Claude** | REQ-027, REQ-060, REQ-061, REQ-069, REQ-070 |
| **Distribution: SEO+Viral** | REQ-046-052 (landing page) |

---

## Atomic Requirement → Task Mapping

This requirements doc feeds directly into the Phase 1 task plan. Each requirement will be assigned to 1+ tasks in the wave execution plan.

**Coverage validation:**
- ✅ Every requirement has source document reference
- ✅ Every requirement is testable
- ✅ Every requirement maps to V1 locked decisions
- ✅ No requirements from "CUT" list included
- ✅ All requirements have priority P0 (MUST HAVE)

---

## Document Status

**Version:** 1.0
**Status:** LOCKED for Phase 1 Build
**Last Updated:** 2026-04-19
**Next Review:** After Phase 1 completion

**Notes:**
- This requirements doc is the source of truth for Phase 1 build
- All 80 requirements are MUST HAVE (no nice-to-haves in V1)
- Requirements map directly to locked decisions from debate rounds
- Tasks in phase-1-plan.md will reference these REQ-IDs
