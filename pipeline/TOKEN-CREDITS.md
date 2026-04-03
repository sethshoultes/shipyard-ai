# Shipyard AI — Token Credit System

**Author:** Elon Musk, Chief Product & Engineering Officer
**Date:** 2026-04-03
**Status:** Architecture Decision Record v1

---

## 1. Why Tokens?

Tokens solve three problems simultaneously:

1. **Scope control** — A PRD with "and also add a blog, and maybe e-commerce, and can we do multi-language?" gets priced in tokens before work begins. No ambiguity. No scope creep mid-build.

2. **Cost transparency** — The client sees exactly what they're paying for. 500K tokens = simple site. Want more? Buy more tokens. Want less? Ship with fewer pages.

3. **Agent discipline** — Agents can't goldplate. When your token allocation is 80K, you don't spend 60K on a fancy animation nobody asked for. You build what the PRD says and stop.

---

## 2. Token Definition

One **Shipyard Token** = 1 AI inference token (input or output, any model).

We use raw token counts rather than a synthetic currency because:
- Directly maps to our costs (Anthropic API billing)
- No exchange rate confusion
- Clients who understand AI can audit our efficiency
- Easy to benchmark against competitors

### Model Weighting

Not all tokens cost the same to us. Haiku tokens are ~12x cheaper than Sonnet tokens. But we charge the same rate to the client for simplicity. This means:

- **Haiku work is high-margin** (sub-agents: design, copy, SEO)
- **Sonnet work is low-margin** (directors: strategy, review, QA)
- **Optimal mix: 80% haiku / 20% sonnet** = healthy margin

If a project requires more Sonnet (complex strategy, many review rounds), our margin shrinks. This naturally incentivizes us to:
- Write better PRD templates (less debate needed)
- Build better sub-agent prompts (less director intervention)
- Improve first-pass QA rate (fewer revision rounds)

---

## 3. Credit Packages

### Site Credits

| Package | Tokens | Pages | Features Included | Price Point |
|---------|--------|-------|-------------------|-------------|
| **Starter** | 500K | 1-5 | Design, content, basic SEO, deploy | $ |
| **Business** | 1M | 6-10 | + advanced SEO, contact forms, analytics | $$ |
| **Professional** | 2M | 11-20 | + e-commerce, blog, integrations | $$$ |
| **Enterprise** | 3M+ | 20+ | + multi-language, custom features, priority | $$$$ |

### Theme Credits

| Package | Tokens | Scope |
|---------|--------|-------|
| **Standard Theme** | 750K | Design system, 5 page templates, responsive, dark/light mode |
| **Premium Theme** | 1.5M | + animations, 10 templates, plugin compatibility, docs |

### Plugin Credits

| Package | Tokens | Scope |
|---------|--------|-------|
| **Simple Plugin** | 300K | Single-feature, settings page, tests, docs |
| **Complex Plugin** | 750K | Multi-feature, admin UI, API, tests, docs |

### Revision Credits (sold separately)

| Scope | Tokens | Examples |
|-------|--------|---------|
| **Micro** | 50K | Fix a typo, swap an image, adjust a color |
| **Minor** | 100K | Redesign a section, rewrite page copy, add a component |
| **Major** | 200K | Add a new page, restructure navigation, add a feature |
| **Overhaul** | 500K | Redesign multiple pages, add e-commerce to existing site |

---

## 4. Token Budget Allocation Rules

Every project's tokens are pre-allocated across pipeline stages. This is enforced, not advisory.

```
┌──────────────────────────────────────────────┐
│              PROJECT TOKEN BUDGET             │
├──────────────────────────────────────────────┤
│  STRATEGY (10%)  │  Debate (5%) + Plan (5%)  │
├──────────────────────────────────────────────┤
│  BUILD (60%)     │  Sub-agent execution      │
│                  │  ├── Design: ~25%          │
│                  │  ├── Development: ~35%     │
│                  │  ├── Content/Copy: ~25%    │
│                  │  └── SEO/Analytics: ~15%   │
├──────────────────────────────────────────────┤
│  REVIEW (15%)    │  QA + director review      │
├──────────────────────────────────────────────┤
│  DEPLOY (5%)     │  Staging + production      │
├──────────────────────────────────────────────┤
│  RESERVE (10%)   │  Rework buffer             │
│                  │  Returned if unused         │
└──────────────────────────────────────────────┘
```

### Hard Rules

1. **No stage can borrow from another.** If debate burns all 5%, the remaining strategy tokens come from Plan's 5%. If both are gone, decisions lock with whatever was agreed.

2. **Build agents have individual caps.** A designer with 80K tokens can't spend 120K. When they hit 80K, they ship what they have.

3. **Reserve tokens require director approval.** A sub-agent can't unilaterally tap the reserve. They flag the need, a director evaluates, and either approves the draw or says "ship as-is."

4. **Unused reserve is returned.** If a project uses 450K of its 500K budget, the client gets 50K back as credit toward future work.

5. **Revision tokens are never drawn from the project budget.** Revisions are a separate purchase. This prevents "just one more thing" from eating the build budget.

---

## 5. Token Tracking Implementation

### STATUS.json (per project)

```json
{
  "project": "marias-bakery",
  "type": "site",
  "package": "starter",
  "tokenBudget": 500000,
  "allocation": {
    "strategy": { "budget": 50000, "burned": 12340 },
    "build": { "budget": 300000, "burned": 0 },
    "review": { "budget": 75000, "burned": 0 },
    "deploy": { "budget": 25000, "burned": 0 },
    "reserve": { "budget": 50000, "burned": 0 }
  },
  "agents": {
    "designer": { "budget": 80000, "burned": 0 },
    "developer": { "budget": 120000, "burned": 0 },
    "copywriter": { "budget": 60000, "burned": 0 },
    "seo": { "budget": 40000, "burned": 0 }
  },
  "stage": "debate",
  "warnings": [],
  "createdAt": "2026-04-03T12:00:00Z",
  "updatedAt": "2026-04-03T12:05:00Z"
}
```

### Token Logging (per agent task)

Every AI call appends to `projects/{slug}/build/token-log.jsonl`:

```jsonl
{"ts":"2026-04-03T12:05:00Z","agent":"designer","model":"haiku","task":"homepage-hero","input_tokens":1200,"output_tokens":800,"total":2000,"cumulative":2000}
{"ts":"2026-04-03T12:05:30Z","agent":"designer","model":"haiku","task":"homepage-hero","input_tokens":1500,"output_tokens":1200,"total":2700,"cumulative":4700}
```

### Alerts

| Threshold | Action |
|-----------|--------|
| Agent at 50% of allocation | Info log |
| Agent at 80% of allocation | Warning to director |
| Agent at 95% of allocation | Hard warning — wrap up current task |
| Agent at 100% | Hard stop — ship what exists |
| Project at 90% total budget | Director review: ship or tap reserve? |
| Reserve fully consumed | Ship immediately, document gaps |

---

## 6. Complexity Multipliers

When a PRD includes features beyond the base package, multiply the budget:

| Feature | Multiplier | Adds To |
|---------|-----------|---------|
| E-commerce (products, cart, checkout) | 1.3x | Development, Design |
| Blog/CMS (content management) | 1.2x | Development, Content |
| Multi-language (i18n) | 1.2x | Content, Development |
| Custom animations/transitions | 1.2x | Design, Development |
| Third-party API integration (each) | 1.1x | Development |
| User authentication/accounts | 1.3x | Development, Review |
| Search functionality | 1.1x | Development |
| Analytics dashboard | 1.15x | Development, Design |

### Calculation Example

**Client PRD:** "10-page bakery website with online ordering and a blog"

```
Base:        Business package (10 pages)    = 1,000,000 tokens
E-commerce:  Online ordering                × 1.3
Blog:        Blog section                   × 1.2
─────────────────────────────────────────────────────────
Final:       1,000,000 × 1.3 × 1.2         = 1,560,000 tokens
```

Allocation:
```
Strategy:    156,000  (10%)
Build:       936,000  (60%)
  Designer:    234,000  (25%)
  Developer:   327,600  (35%)
  Copywriter:  234,000  (25%)
  SEO:         140,400  (15%)
Review:      234,000  (15%)
Deploy:       78,000  (5%)
Reserve:     156,000  (10%)
```

---

## 7. Anti-Gaming Rules

Tokens are a constraint system. Here's how we prevent gaming:

### Client-Side
- **No infinite revisions.** Each revision round is a separate token purchase.
- **PRD changes after DEBATE = new project.** If the client rewrites the PRD after strategy is locked, that's a new intake (and new tokens).
- **Feature requests during BUILD = revision tokens.** "Can you also add X?" costs revision tokens, not build tokens.

### Agent-Side
- **No padding prompts.** Agents don't inflate context to justify token usage. Prompts should be minimal and precise.
- **No unnecessary retries.** Retry once, then try a different approach. Don't burn tokens on the same failed prompt 5 times.
- **No quality sandbagging.** Don't ship garbage at 50% budget and claim "out of tokens." Directors review for genuine effort.

---

## 8. Pricing Strategy (For Seth/Business to Decide)

Token costs to us (approximate):
- 500K tokens (80/20 haiku/sonnet mix): **~$2.40 in AI costs**
- Plus: compute, hosting, orchestration overhead: **~$1.00**
- **Total cost per simple site: ~$3.40**

Suggested markup tiers:
| Package | Our Cost | Suggested Price | Margin |
|---------|----------|-----------------|--------|
| Starter (500K) | ~$3.40 | $49-99 | 93-97% |
| Business (1M) | ~$6.80 | $149-199 | 95-97% |
| Professional (2M) | ~$13.60 | $299-499 | 95-97% |
| Theme (750K) | ~$5.10 | $99-199 | 95-97% |
| Plugin (300K) | ~$2.04 | $49-99 | 96-98% |
| Revision (100K) | ~$0.68 | $19-29 | 96-97% |

The margin is extremely high because the value isn't the AI cost — it's the orchestration, quality assurance, and speed. A human team building a 10-page Emdash site would charge $3,000-10,000 and take 2-4 weeks. We deliver in hours for under $200.

---

## 9. Implementation Priority

1. **Now:** STATUS.json schema + token logging format (this doc)
2. **Next:** PRD template with token calculator built in
3. **Then:** Per-agent token tracking in pipeline orchestrator
4. **Later:** Client-facing dashboard showing token burn in real-time
