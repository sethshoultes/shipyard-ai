# PRD: LocalGenius Lite
**Product Requirement Document**
**Date:** 2026-04-19
**Status:** APPROVED FOR BUILD
**Priority:** P0 — Ship This Session

---

## Executive Summary

LocalGenius Lite is a single `<script>` tag that adds an AI-powered chat widget to any website. The AI automatically understands the page content and answers visitor questions — zero configuration required.

**One-liner:** "Add AI chat to any website in 30 seconds."

---

## Problem Statement

Website owners want AI chat but face barriers:
- Intercom/Drift cost $50-300+/month
- Training chatbots requires manual Q&A entry
- Self-hosting AI is technically complex
- Most solutions need backend integration

**The gap:** There's no "just paste this script" AI chat for the masses.

---

## Solution

A drop-in JavaScript embed that:
1. Scrapes visible page content on load
2. Sends context + user question to our Cloudflare Worker
3. Returns Claude-powered answers about the page
4. Displays in a beautiful, customizable chat widget

```html
<script src="https://lite.localgenius.ai/widget.js" data-site="abc123"></script>
```

That's it. No backend. No training. No config.

---

## User Personas

### Primary: Small Business Website Owner
- Has a Squarespace/Wix/WordPress site
- Gets repetitive questions via email/forms
- Technical skill: can paste a script tag
- Budget: $9-29/month

### Secondary: Developer Adding AI to Client Sites
- Builds sites for SMB clients
- Wants to upsell AI features
- Needs white-label or minimal branding

### Tertiary: Documentation Site Maintainer
- Has docs that users don't read
- Wants AI to answer "how do I..." questions
- Often developer-focused

---

## Features (MVP)

### Must Have (Session 1)
- [ ] Embeddable chat widget (floating button → chat panel)
- [ ] Auto-scrape page content on load
- [ ] Claude-powered responses via Cloudflare Worker
- [ ] Basic styling (light/dark mode detection)
- [ ] Rate limiting (prevent abuse)
- [ ] Simple dashboard: create site → get script tag

### Nice to Have (Post-MVP)
- [ ] Custom branding (colors, logo)
- [ ] Conversation history
- [ ] Lead capture (email before chat)
- [ ] Analytics (questions asked, topics)
- [ ] Multi-page context (crawl entire site)

### Out of Scope
- User authentication/accounts (use simple API keys)
- Custom training/fine-tuning
- Integrations (Slack, email, etc.)
- Mobile apps

---

## Technical Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Website with   │────▶│  Cloudflare Worker   │────▶│  Claude API │
│  Embed Script   │◀────│  (lite.localgenius)  │◀────│             │
└─────────────────┘     └──────────────────────┘     └─────────────┘
        │                         │
        │                         ▼
        │               ┌──────────────────┐
        │               │   Cloudflare KV  │
        │               │  (site configs)  │
        │               └──────────────────┘
        ▼
┌─────────────────┐
│  Chat Widget    │
│  (iframe/shadow)│
└─────────────────┘
```

### Components

1. **Widget Script** (`widget.js`)
   - Vanilla JS, <10KB gzipped
   - Creates shadow DOM chat interface
   - Scrapes page content (innerText of body, meta tags, title)
   - Sends to Worker API

2. **Cloudflare Worker** (`lite-api`)
   - Receives: site_id, page_content, user_question
   - Validates site_id against KV
   - Calls Claude with system prompt + page context
   - Returns streamed response

3. **Dashboard** (simple static site)
   - Create site → get site_id + script tag
   - View usage stats
   - Manage API key / billing (Stripe)

### Data Flow

1. User loads page with embed
2. Widget extracts: `document.title`, `meta[description]`, `body.innerText` (truncated)
3. User asks question
4. Widget POSTs to Worker: `{ site_id, context, question }`
5. Worker validates, builds prompt, streams Claude response
6. Widget displays response with typing animation

---

## System Prompt

```
You are a helpful assistant for this website. Answer questions based ONLY on the page content provided. Be concise, friendly, and helpful.

If you don't know the answer from the provided content, say: "I don't see that information on this page. You might want to contact the site owner directly."

Never make up information. Never discuss topics unrelated to the page content.

PAGE CONTENT:
{scraped_content}
```

---

## API Design

### POST /api/chat
```json
Request:
{
  "site_id": "abc123",
  "context": "Page title. Page description. Truncated body content...",
  "question": "What are your business hours?",
  "session_id": "optional-for-history"
}

Response (streamed):
data: {"chunk": "Our "}
data: {"chunk": "business "}
data: {"chunk": "hours are..."}
data: {"done": true}
```

### POST /api/sites (dashboard)
```json
Request:
{
  "domain": "example.com",
  "email": "owner@example.com"
}

Response:
{
  "site_id": "abc123",
  "script_tag": "<script src=\"...\" data-site=\"abc123\"></script>"
}
```

---

## UI/UX Specifications

### Widget Appearance
- **Closed state:** Floating button, bottom-right, 56px circle
- **Open state:** 380px × 520px panel, slides up
- **Colors:** Auto-detect dark/light mode, or accent color from page
- **Typography:** System font stack

### Chat Interface
- Simple message bubbles (user right, AI left)
- Typing indicator during streaming
- "Powered by LocalGenius" footer link
- Close button (X) top-right
- Input field with send button

### Mobile
- Full-width panel when open
- Respects safe areas
- Touch-friendly tap targets (44px min)

---

## Pricing Model

### Free Tier
- 100 questions/month
- LocalGenius branding
- Single site

### Pro ($9/month)
- 1,000 questions/month
- Remove branding
- Up to 3 sites

### Business ($29/month)
- 10,000 questions/month
- White-label
- Unlimited sites
- Priority support

---

## Success Metrics

### Launch Week
- [ ] 10 sites embedded
- [ ] 100 questions answered
- [ ] <500ms p95 response start

### Month 1
- [ ] 100 active sites
- [ ] 5 paying customers
- [ ] <2% error rate

---

## Implementation Plan

### Phase 1: Core (2-3 hours)
1. Cloudflare Worker with Claude integration
2. Basic widget.js with chat UI
3. KV-based site registration

### Phase 2: Polish (1-2 hours)
1. Streaming responses
2. Dark mode detection
3. Mobile responsiveness
4. Error handling

### Phase 3: Dashboard (1 hour)
1. Simple signup page
2. Script tag generator
3. Usage display

### Phase 4: Launch (30 min)
1. Deploy to production
2. Test on real site
3. Write launch tweet

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude rate limits | Medium | High | Implement queuing, use Workers AI fallback |
| Abuse (prompt injection) | Medium | Medium | Strict system prompt, content moderation |
| Scraping fails on SPAs | Medium | Low | Fallback to meta tags only, document limitation |
| Widget conflicts with site CSS | Low | Medium | Shadow DOM isolation |

---

## Open Questions

1. **Domain verification?** — Skip for MVP, add later if abuse occurs
2. **Conversation memory?** — Skip for MVP, stateless is simpler
3. **Pricing tiers?** — Launch free-only, add paid when we have users

---

## Appendix: Competitive Analysis

| Product | Price | AI-Native | Zero-Config | Our Advantage |
|---------|-------|-----------|-------------|---------------|
| Intercom | $74+/mo | Add-on | No | 10x cheaper, AI-first |
| Drift | $50+/mo | Add-on | No | Simpler, cheaper |
| Chatbase | $19/mo | Yes | No (needs training) | No training needed |
| **LocalGenius Lite** | $9/mo | Yes | Yes | Simplest possible |

---

**Document Status:** APPROVED
**Build Authority:** GRANTED
**Ship Target:** Tonight

*"Don't find customers for your products, find products for your customers."* — Seth Godin
