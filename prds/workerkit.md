# PRD: WorkerKit
**Product Requirement Document**
**Version:** 1.0
**Date:** 2026-04-15
**Status:** Ready for Build

---

## Executive Summary

WorkerKit is a production-ready scaffold for full-stack AI applications on Cloudflare Workers. One command (`npx create-workerkit@latest`) generates a complete project with authentication, database, AI integration, payments, and deployment configuration. Ship your first feature on day one, not day three.

---

## Problem Statement

Starting a new AI project on Cloudflare Workers requires:
- 30+ minutes configuring wrangler.toml and bindings
- 1+ hour setting up D1 schemas and migrations
- 1+ hour integrating authentication (Clerk/Auth.js)
- 1+ hour wiring up AI providers with fallback logic
- 30+ minutes configuring Stripe for payments
- Scattered documentation across 6+ different services

**Total:** 4-6 hours of boilerplate before writing a single line of product code.

This friction kills projects. Developers abandon ideas because setup is exhausting.

---

## Solution

`npx create-workerkit@latest my-app`

Interactive CLI that scaffolds a production-ready Cloudflare Workers application in under 60 seconds. Answer 5 questions, get a deployable app.

---

## Target User

**Primary:** Indie hackers and startup engineers building AI-powered SaaS
**Secondary:** Agencies building client projects on Cloudflare infrastructure
**Tertiary:** Enterprise teams standardizing on Cloudflare Workers

**User Persona — "Alex":**
- Senior developer at a 5-person startup
- Wants to ship an AI feature this week
- Knows Workers exist but dreads the setup
- Values speed and production-readiness over customization

---

## Core Features

### 1. Interactive Scaffold Generator
```bash
npx create-workerkit@latest my-app

? Project name: my-app
? Authentication: Clerk (recommended) / Auth.js / None
? Database: D1 (recommended) / Turso / None
? AI Provider: Workers AI + Claude fallback (recommended) / OpenAI / None
? Payments: Stripe / None
? Template: Minimal / API-only / Full-stack with UI

Creating project...
✓ Generated project structure
✓ Configured wrangler.toml
✓ Created D1 migrations
✓ Added authentication middleware
✓ Wired AI providers with fallback
✓ Set up Stripe webhooks
✓ Generated TypeScript types

Done! Next steps:
  cd my-app
  cp .env.example .env  # Add your API keys
  npm install
  npm run dev
```

### 2. Production-Ready Defaults

**Project Structure:**
```
my-app/
├── src/
│   ├── index.ts           # Entry point with Hono router
│   ├── middleware/
│   │   ├── auth.ts        # Clerk/Auth.js middleware
│   │   └── cors.ts        # CORS configuration
│   ├── routes/
│   │   ├── api.ts         # API routes
│   │   ├── webhooks.ts    # Stripe webhooks
│   │   └── ai.ts          # AI endpoint handlers
│   ├── services/
│   │   ├── ai.ts          # AI provider abstraction
│   │   ├── db.ts          # D1 query helpers
│   │   └── stripe.ts      # Stripe helpers
│   └── types/
│       └── env.d.ts       # Typed bindings
├── migrations/
│   └── 0001_initial.sql   # Base schema
├── wrangler.toml          # Fully configured
├── .env.example           # All required keys documented
└── package.json
```

### 3. AI Provider Abstraction
```typescript
// Automatic fallback: Workers AI → Claude → graceful error
import { ai } from './services/ai';

const response = await ai.complete({
  prompt: "Summarize this document",
  model: 'fast', // or 'smart' for Claude
  maxTokens: 500,
});
```

### 4. Type-Safe Database
```typescript
// Auto-generated types from migrations
import { db } from './services/db';

const users = await db.query<User>('SELECT * FROM users WHERE id = ?', [id]);
```

### 5. One-Command Deploy
```bash
npm run deploy  # wrangler deploy with all bindings
```

---

## Technical Architecture

### Stack
- **Runtime:** Cloudflare Workers
- **Framework:** Hono (fast, lightweight, Workers-native)
- **Database:** D1 (SQLite at the edge)
- **Auth:** Clerk (recommended) or Auth.js
- **AI:** Workers AI (fast/cheap) + Claude API (smart/fallback)
- **Payments:** Stripe with webhook handling
- **Language:** TypeScript (strict mode)

### Bindings Auto-Configuration
WorkerKit automatically configures wrangler.toml with:
- D1 database binding
- AI binding for Workers AI
- KV namespace for sessions/cache
- Environment variable declarations

### AI Fallback Strategy
```typescript
// services/ai.ts
export async function complete(opts: CompletionOpts) {
  try {
    // Try Workers AI first (fast, cheap, no external API)
    return await workersAI.complete(opts);
  } catch (e) {
    // Fallback to Claude for complex requests or rate limits
    return await claude.complete(opts);
  }
}
```

---

## Distribution Strategy

### Phase 1: Launch (Week 1)
- GitHub repository with excellent README
- Product Hunt launch
- Tweet thread with demo video
- Post to Cloudflare Discord

### Phase 2: Ecosystem (Month 1)
- Submit to Cloudflare's template gallery
- Write tutorial on Cloudflare blog (pitch to DevRel)
- Create YouTube walkthrough
- Answer StackOverflow/Discord questions using WorkerKit

### Phase 3: Monetization (Month 2+)
- **Free:** Core scaffold (MIT license)
- **Premium Templates ($49-199):**
  - SaaS Starter (multi-tenant, billing, admin)
  - AI Chat App (streaming, history, RAG)
  - API Gateway (rate limiting, analytics, keys)
  - Marketplace (listings, escrow, reviews)

---

## Success Metrics

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| GitHub Stars | 100 | 500 | 2000 |
| npm Downloads | 200 | 1000 | 5000 |
| Template Revenue | $0 | $500 | $3000 |

---

## Build Scope (Single Session)

### Must Ship
- [ ] CLI scaffold generator with interactive prompts
- [ ] Hono-based project template
- [ ] D1 integration with migrations
- [ ] Workers AI + Claude fallback service
- [ ] Clerk auth middleware
- [ ] Stripe webhook handler
- [ ] TypeScript types for all bindings
- [ ] Comprehensive README
- [ ] npm publish as `create-workerkit`

### Post-Launch (Future Sessions)
- Auth.js alternative
- Turso database option
- Premium templates
- VS Code extension
- Dashboard for managing projects

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Cloudflare changes Workers API | Pin versions, maintain compat layer |
| Similar tools emerge | Ship fast, build community, iterate |
| Clerk pricing increases | Auth.js as fallback option |
| Low adoption | Dogfood on all agency projects, refine |

---

## Timeline

**Hour 0-1:** CLI scaffold with Hono template
**Hour 1-2:** D1 integration and migrations
**Hour 2-3:** AI service with fallback logic
**Hour 3-4:** Auth middleware and Stripe webhooks
**Hour 4-5:** TypeScript types, README, npm publish
**Hour 5-6:** Buffer for testing and refinement

---

## Approval

**DREAM Cycle Vote:** 4-2 (Phil, Elon, Ada, Warren)
**Status:** Approved for immediate build

---

*"The best tool is the one that gets out of your way." — WorkerKit ships so you can ship.*
