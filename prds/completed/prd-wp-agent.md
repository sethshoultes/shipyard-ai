# Product Requirements Document: WP-Agent
**Status:** APPROVED
**Dream Session:** dream-2026-04-21T00-1
**Board Vote:** 4-1 (Phil, Elon, Warren, Oprah)

---

## Overview

**WP-Agent** is a WordPress plugin that transforms any WordPress site into an AI-powered conversational agent. Visitors can interact with the site through natural language — asking questions, finding content, and completing actions — without navigating menus or search boxes.

### Vision Statement
*"Every WordPress site deserves an intelligent assistant."*

---

## Problem Statement

1. **For site visitors:** Finding information on websites requires clicking through menus, using search (which often fails), or hunting through pages. Frustrating.

2. **For site owners:** Adding AI chat to a website currently requires technical knowledge, third-party SaaS subscriptions, and complex integrations. Expensive and confusing.

3. **For the market:** WordPress powers 43% of the web, but most sites feel static and dumb in an AI-first world.

---

## Solution

A WordPress plugin that:
1. Automatically indexes site content (pages, posts, products, custom post types)
2. Provides a beautiful, unobtrusive chat widget
3. Answers visitor questions using hybrid Claude + Cloudflare Workers AI
4. Works out of the box with zero configuration required

---

## Target Users

### Primary: Small Business Owners
- Run WordPress sites (agency-built or DIY)
- Non-technical but understand "install plugin"
- Want to seem modern/AI-enabled without complexity
- Examples: Local restaurants, law firms, yoga studios, plumbers

### Secondary: WordPress Agencies
- Manage 10-100+ client sites
- Looking for differentiation and upsell opportunities
- Will pay for white-label or multi-site licensing

---

## Core Features (MVP)

### 1. One-Click Content Indexing
- Scans all published pages, posts, and products
- Extracts text, metadata, and structure
- Creates embeddings for semantic search
- Auto-updates when content changes

### 2. Chat Widget
- Floating button (bottom-right, customizable position)
- Expandable chat interface
- Mobile-responsive
- Customizable colors to match site branding
- "Powered by WP-Agent" branding (removable in Pro)

### 3. AI Response Engine
- Hybrid architecture: Claude for complex queries, Workers AI for simple/fast
- Context-aware responses based on indexed content
- Cites sources with links to relevant pages
- Graceful fallback: "I'm not sure, but you might find this helpful..."

### 4. Admin Dashboard
- View conversation analytics (queries, satisfaction, common questions)
- Customize widget appearance
- Set custom instructions ("Always mention we're located in Austin")
- Test the agent before going live

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WordPress Site                        │
├─────────────────────────────────────────────────────────┤
│  WP-Agent Plugin                                         │
│  ├── Content Indexer (cron job)                         │
│  ├── Chat Widget (React, embedded)                      │
│  ├── REST API endpoints                                 │
│  └── Admin Settings Page                                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers                          │
│  ├── Embedding generation (Workers AI)                  │
│  ├── Vector search (Vectorize)                          │
│  ├── Query routing (simple vs complex)                  │
│  └── Response generation (Claude API / Workers AI)      │
└─────────────────────────────────────────────────────────┘
```

### Stack
- **Plugin:** PHP 8.0+, WordPress 6.0+
- **Widget:** React (bundled, no external deps)
- **Backend:** Cloudflare Workers + Workers AI + Vectorize
- **AI:** Claude 3.5 Sonnet (complex) + Llama 3 via Workers AI (simple)

---

## User Journey

### Site Owner (Installation)
1. Find "WP-Agent" in WordPress plugin directory
2. Click Install → Activate
3. Plugin automatically indexes site content (progress bar shown)
4. Chat widget appears on frontend
5. Owner can customize colors in Settings → WP-Agent

### Site Visitor (Usage)
1. See floating chat icon on website
2. Click to open, greeted with: "Hi! I'm here to help you find anything on [Site Name]. What can I help you with?"
3. Ask question: "Do you offer gluten-free options?"
4. Receive answer with link to relevant menu/page
5. Continue conversation or close

---

## Success Metrics

### Launch (Week 1)
- Plugin successfully installs on WordPress 6.0-6.5
- Indexes sites up to 1,000 pages
- < 2 second response time for simple queries
- Widget loads without breaking existing themes

### Growth (Month 1)
- 100+ active installations
- < 5% uninstall rate
- Average 3.5+ star rating

### Validation
- At least one user reports business impact ("customer found info faster")
- At least one agency inquires about multi-site licensing

---

## MVP Scope (One Session)

### In Scope
- [ ] WordPress plugin scaffold (PHP)
- [ ] Content indexer (pages, posts)
- [ ] Cloudflare Worker for AI queries
- [ ] React chat widget (embedded)
- [ ] Basic admin settings page
- [ ] Widget color customization

### Out of Scope (V2)
- WooCommerce product search
- Form completion / actions
- Multi-language support
- White-label / branding removal
- Conversation memory across sessions
- Analytics dashboard

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI costs too high per query | Medium | High | Workers AI for simple queries (cheap), Claude for complex only |
| Widget breaks themes | Medium | Medium | Minimal CSS, shadow DOM, extensive testing |
| Content indexing fails on large sites | Low | Medium | Batch processing, progress indicator, size limits |
| Hallucination / wrong answers | Medium | High | Always cite sources, "I'm not sure" fallback, visible disclaimer |

---

## Distribution Strategy

### Launch Channels
1. **WordPress.org Plugin Directory** — Primary (free, searchable)
2. **ProductHunt** — Launch day buzz
3. **Twitter/X** — Dev community, WordPress community
4. **Reddit** — r/WordPress, r/smallbusiness

### Positioning
- "The AI chat widget that actually knows your website"
- "ChatGPT for your WordPress site — no coding required"

---

## Business Model (Future)

### Freemium
- **Free:** 100 queries/month, WP-Agent branding
- **Pro ($9/mo):** 1,000 queries, no branding, priority support
- **Agency ($49/mo):** 10 sites, 5,000 queries total, white-label

*Note: MVP ships as free plugin. Monetization added after product-market fit.*

---

## Definition of Done

This PRD is complete when:
1. Plugin can be installed on a fresh WordPress 6.4 site
2. Content is automatically indexed within 5 minutes
3. Chat widget appears and responds to questions
4. Responses are accurate based on indexed content
5. Admin can change widget colors
6. No PHP errors, no JavaScript console errors
7. README includes installation instructions

---

**Approved by:** The Board (4-1)
**Next step:** Build it.
