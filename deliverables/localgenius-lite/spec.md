# SPARK — Technical Specification
**Product:** SPARK (formerly LocalGenius Lite)
**Build Date:** 2026-04-19
**Status:** APPROVED FOR BUILD
**Priority:** P0 — Ship This Session

---

## Executive Summary

SPARK is a drop-in AI chat widget that makes any website instantly helpful. One script tag, zero configuration, Claude-powered answers from page content.

**One-liner:** "Add AI chat to any website in 30 seconds."

---

## Goals (from PRD)

### Primary Goals
1. **Zero-friction embedding** — Website owner pastes one `<script>` tag, widget auto-initializes
2. **Instant intelligence** — Widget scrapes page content on load, answers questions from that context
3. **Beautiful experience** — Smooth animations, clean UI, feels like part of the site
4. **Fast shipping** — Build core product in 4-6 hours, launch same day

### Success Metrics
- **Launch Week:** 10 sites embedded, 100 questions answered, <500ms p95 response start
- **Month 1:** 100 active sites, 5 paying customers, <2% error rate
- **Technical:** <2s first token latency, <10KB widget size (gzipped), 99% uptime

---

## Implementation Approach (from Plan)

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Website with   │────▶│  Cloudflare Worker   │────▶│  Claude API │
│  Embed Script   │◀────│  (spark-api)         │◀────│   (Haiku)   │
└─────────────────┘     └──────────────────────┘     └─────────────┘
        │                         │
        │                         │
        ▼                         │
┌─────────────────┐              │
│  Chat Widget    │              │
│  (Shadow DOM)   │              │
└─────────────────┘              │
                                 ▼
                        ┌─────────────────┐
                        │  localStorage   │
                        │  (client-side   │
                        │   UUID only)    │
                        └─────────────────┘
```

### Key Technical Decisions

1. **No Backend in V1** — Client-side UUID generation via `crypto.randomUUID()`, no auth, no dashboard
2. **Shadow DOM Isolation** — Widget wrapped in Shadow DOM with CSS reset to prevent conflicts
3. **Claude 3.5 Haiku** — Fast, cheap model ($0.001 per request), 200K context window
4. **Streaming Responses** — SSE (Server-Sent Events) for real-time answer display
5. **Multi-layer Rate Limiting:**
   - 10 requests/min per site_id (in-memory map in Worker)
   - 100 requests/hour per IP (Cloudflare native rate limiting)

### Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Widget | Vanilla JS | <10KB gzipped, no framework overhead |
| Widget Isolation | Shadow DOM | Prevents CSS conflicts with host site |
| Backend | Cloudflare Worker | Serverless, zero ops, $0 fixed costs |
| AI | Claude 3.5 Haiku | Fast, cheap, 200K context |
| Storage | localStorage | Client-side site_id only, no DB |
| Deployment | Cloudflare Workers + CDN | Auto-scaling, global edge network |

### Data Flow

1. User loads page with `<script src="https://cdn.usespark.com/spark.js" data-site="abc123">`
2. Widget initializes, extracts:
   - `document.title`
   - `meta[name="description"]` content
   - Text from `<main>`, fallback to `<article>`, fallback to `<body>.innerText`
   - Truncate to 10KB
3. User clicks chat button, types question
4. Widget sends POST to Worker: `{ site_id, context, question }`
5. Worker:
   - Validates UUID format
   - Checks rate limits (site_id + IP)
   - Calls Claude API with system prompt + page context
   - Streams response back as SSE
6. Widget displays chunks in real-time with typing animation
7. Complete answer appears in ~1-2 seconds

### System Prompt Template

```
You are a helpful assistant for this website. Answer questions based ONLY on the page content provided. Be concise, friendly, and helpful.

If you don't know the answer from the provided content, say: "I don't see that information on this page. You might want to contact the site owner directly."

Never make up information. Never discuss topics unrelated to the page content.

PAGE CONTENT:
{scraped_content}
```

---

## Verification Criteria

### Widget UI
- [ ] Button appears bottom-right, 56px circle
- [ ] Button has purple gradient background
- [ ] Button has subtle pulse animation (opacity 0.7→1.0, 2s infinite)
- [ ] Click button → panel slides up in <300ms with smooth CSS transition
- [ ] Panel is 380×520px when open
- [ ] Close button (X) works correctly
- [ ] Input has placeholder: "What can I help you find?"
- [ ] Footer shows "Powered by SPARK" linking to https://usespark.com
- [ ] Message bubbles: user right-aligned, AI left-aligned

### Chat Interactions
- [ ] Type message + click send → message appears immediately (optimistic UI)
- [ ] Press Enter → message sends
- [ ] Input clears after send
- [ ] Empty messages rejected (validation)
- [ ] Send button disabled during API call
- [ ] Typing indicator shows while waiting for response
- [ ] Typing indicator hides when response complete

### Shadow DOM Isolation
- [ ] Widget wrapped in Shadow DOM with `mode: 'open'`
- [ ] CSS reset applied: `:host { all: initial; }`
- [ ] All widget styles scoped inside shadow root
- [ ] No style conflicts on WordPress (Astra, Divi themes)
- [ ] No style conflicts on Shopify (Dawn theme)
- [ ] No style conflicts on Wix sites
- [ ] Mobile: full-width panel on <480px viewport
- [ ] Mobile: touch targets ≥44px

### Content Scraping
- [ ] Scrapes `document.title` correctly
- [ ] Scrapes `meta[name="description"]` content
- [ ] Extracts text from `<main>` if present
- [ ] Falls back to `<article>` if no `<main>`
- [ ] Falls back to `<body>.innerText` if neither
- [ ] Truncates content to 10KB (10,240 bytes)
- [ ] SPA support: 1-second delay before initial scrape
- [ ] MutationObserver detects DOM changes and re-scrapes
- [ ] Content cached in widget memory (not re-scraped per question)

### Cloudflare Worker
- [ ] POST /api/chat endpoint accepts JSON
- [ ] Request validation: `{ site_id, context, question }` all required
- [ ] UUID validation: site_id matches regex `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`
- [ ] Returns 400 Bad Request if validation fails
- [ ] CORS headers: `Access-Control-Allow-Origin: *`
- [ ] OPTIONS preflight handled correctly
- [ ] Streams response as SSE: `Content-Type: text/event-stream`

### Claude API Integration
- [ ] Uses model: `claude-3-5-haiku-20241022`
- [ ] Reads API key from `env.ANTHROPIC_API_KEY`
- [ ] Streaming enabled: `stream: true`
- [ ] System prompt includes strict "ONLY from page content" instruction
- [ ] 30-second timeout enforced
- [ ] API errors caught and mapped to user-friendly messages
- [ ] Hallucination rate <5% (tested on 100+ questions)

### Rate Limiting
- [ ] 10 requests/min per site_id enforced
- [ ] Counter resets every 60 seconds
- [ ] 11th request from same site_id → 429 Too Many Requests
- [ ] 100 requests/hour per IP enforced (Cloudflare native)
- [ ] 429 response includes `Retry-After` header
- [ ] Client IP extracted from `CF-Connecting-IP` header

### Streaming Responses
- [ ] Claude chunks streamed as SSE: `data: {"chunk": "text"}\n\n`
- [ ] Final message: `data: {"done": true}\n\n`
- [ ] First chunk arrives in <2 seconds
- [ ] Widget appends chunks to AI message bubble in real-time
- [ ] Typing indicator hides on `done: true`
- [ ] Works on slow networks (tested)

### Error Handling
- [ ] Claude API errors → "Sorry, I couldn't answer that. Try again?"
- [ ] 30-second timeout → "Try again" message with retry button
- [ ] 429 rate limit → "I'm getting too many questions right now"
- [ ] 500 server error → "Something went wrong"
- [ ] No stack traces shown to user
- [ ] Errors logged to console.error for debugging
- [ ] Retry button re-sends failed message

### Usage Logging
- [ ] Every request logged with: `{ event, site_id, latency_ms, error }`
- [ ] Errors logged: `{ event: "error", site_id, error_type, error_message }`
- [ ] Rate limits logged: `{ event: "rate_limited", site_id, limit_type }`
- [ ] Structured JSON format for Cloudflare Analytics
- [ ] Logs visible in Cloudflare dashboard

### Landing Page
- [ ] Hero text: "Your website, instantly brilliant."
- [ ] Subheading: "One script tag. Zero configuration."
- [ ] Code block with copy-paste ready script tag
- [ ] Live demo: working widget embedded on landing page
- [ ] CTA button: "Try It Now" → scrolls to code block
- [ ] Footer: "Powered by SPARK"
- [ ] Clean, Apple-inspired design
- [ ] Purple gradient accents
- [ ] Generous whitespace
- [ ] No feature lists or pricing grids (minimal)

### Live Demo
- [ ] Widget appears on landing page
- [ ] Clicking widget opens panel
- [ ] Asking "What is SPARK?" → correct answer from landing content
- [ ] Suggested questions displayed: "Try asking: 'What is SPARK?' or 'How does it work?'"
- [ ] No errors in console

### CDN Deployment
- [ ] Widget bundled, minified, gzipped
- [ ] Bundle size ≤10KB gzipped
- [ ] Deployed to Cloudflare CDN at `https://cdn.usespark.com/spark.js`
- [ ] Caching configured: `Cache-Control: public, max-age=3600`
- [ ] Versioning: `/v1/spark.js` for future updates
- [ ] `curl` test returns bundled script

### Worker Deployment
- [ ] wrangler.jsonc configured with `nodejs_compat`
- [ ] `compatibility_date: "2026-04-19"`
- [ ] `ANTHROPIC_API_KEY` secret configured
- [ ] `wrangler dev` starts Worker locally
- [ ] `wrangler deploy` succeeds
- [ ] Production URL: `https://spark-api.<subdomain>.workers.dev/api/chat`
- [ ] POST to production → 200 response with Claude answer
- [ ] End-to-end flow works: widget → Worker → Claude → widget

### Performance
- [ ] First token latency <2s (p95)
- [ ] Widget loads in <500ms
- [ ] Button appears immediately on page load
- [ ] Panel animation smooth (60fps)
- [ ] Works on mobile devices (iOS Safari, Android Chrome)

### Cross-browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Cross-platform Testing
- [ ] WordPress (5+ sites, different themes)
- [ ] Shopify (Dawn theme)
- [ ] Wix
- [ ] Squarespace
- [ ] Webflow

---

## Files to Create/Modify

### New Files to Create

#### Widget (`/spark/widget/`)
- [ ] `spark.js` — Main entry point, IIFE, self-initializing
- [ ] `components/Button.js` — 56px floating button component
- [ ] `components/Panel.js` — 380×520px chat panel UI
- [ ] `components/Message.js` — Message bubble component
- [ ] `utils/scraper.js` — Page content extraction logic
- [ ] `utils/api.js` — Worker API client (POST with SSE streaming)
- [ ] `utils/storage.js` — localStorage helpers (site_id persistence)
- [ ] `styles/spark.css` — Widget styles (Shadow DOM scoped)

#### Worker (`/spark/worker/`)
- [ ] `index.js` — Cloudflare Worker main entry, POST /api/chat handler
- [ ] `claude.js` — Claude API integration, streaming setup
- [ ] `prompt.js` — System prompt template
- [ ] `ratelimit.js` — Multi-layer rate limiting logic
- [ ] `errors.js` — Error handling utilities, user-friendly messages
- [ ] `analytics.js` — Usage logging (Cloudflare Analytics)
- [ ] `wrangler.jsonc` — Cloudflare Worker configuration

#### Landing Page (`/spark/landing/`)
- [ ] `index.html` — Landing page with hero, code block, demo
- [ ] `styles.css` — Landing page styles (Apple-inspired, purple gradient)

#### Build Configuration
- [ ] `package.json` — Dependencies: @anthropic-ai/sdk, esbuild (or rollup)
- [ ] `build.js` — Bundle script for minifying + gzipping widget
- [ ] `README.md` — Build instructions, deployment steps

### Files Modified
None — this is a greenfield project.

---

## Build Waves (Parallel Execution)

### Wave 1: Foundation (1.5-2 hours)
**Tasks can run in parallel:**
- Task 001: Widget UI (button + panel)
- Task 002: Chat interactions (send, Enter key, optimistic UI)
- Task 003: Shadow DOM setup + CSS isolation
- Task 004: Page content scraper (SPA-aware)
- Task 005: Cloudflare Worker foundation

### Wave 2: Integration (2-2.5 hours)
**Depends on Wave 1, tasks can run in parallel:**
- Task 006: Claude API integration
- Task 007: System prompt engineering
- Task 008: Multi-layer rate limiting
- Task 009: Streaming response handler
- Task 010: Error handling + timeouts
- Task 011: Usage logging

### Wave 3: Launch (1-1.5 hours)
**Depends on Wave 2, tasks can run in parallel:**
- Task 012: Landing page (Steve's vision)
- Task 013: Live demo embed
- Task 014: CDN deployment (widget script)
- Task 015: Cloudflare Worker deployment

---

## Quality Standards

### Code Quality
- Vanilla JS (no frameworks)
- ES6+ syntax
- Clear variable names
- Comments for complex logic
- No console.log in production (use console.error for errors)

### UX Quality
- Smooth animations (CSS transitions, not JavaScript)
- Instant feedback (optimistic UI)
- User-friendly error messages (no jargon)
- Accessible (keyboard navigation, ARIA labels)

### Performance Quality
- <10KB widget size (gzipped)
- <2s first token latency
- <500ms widget load time
- 60fps animations

### Security Quality
- UUID validation (prevent injection)
- Rate limiting (prevent abuse)
- CORS configured correctly
- No sensitive data logged

---

## Out of Scope (V1)

The following are explicitly cut from V1 to ship fast:
- Dashboard / admin panel
- User authentication
- Pricing / billing / Stripe
- Custom branding / theming
- Dark mode auto-detection
- Exit-intent detection
- Auto-vibe matching
- Lead capture forms
- Analytics dashboard
- Conversation history
- Multi-page context (site-wide crawling)

---

## Success Definition

This build is successful when:

1. ✅ A website owner can paste one `<script>` tag and see the widget appear
2. ✅ A visitor can click the button, ask a question, and get an answer in <2 seconds
3. ✅ The answer is accurate (based on page content, no hallucination)
4. ✅ The experience feels smooth, polished, and intentional
5. ✅ It works on WordPress, Shopify, and static sites without conflicts
6. ✅ The landing page clearly explains what SPARK is and how to use it
7. ✅ The entire stack is deployed and operational

**Ship target:** Tonight (same day as build start)

---

**Document Status:** LOCKED FOR BUILD
**Build Authority:** GRANTED
**Estimated Duration:** 4-6 hours

*"Fast AND great. No compromise." — Phil Jackson*
