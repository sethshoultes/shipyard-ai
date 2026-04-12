# Tuned — Final Decisions Document
*Consolidated by Phil Jackson, The Zen Master*

---

## Locked Decisions

### 1. Product Name: **Tuned**
- **Proposed by:** Steve Jobs (Round 1)
- **Winner:** Steve Jobs
- **Why:** "PromptOps" sounds like IT middleware. "Tuned" is one word, musical, works as verb and noun. "My prompts are Tuned." It evokes mastery, not infrastructure. Elon conceded in Round 2: "genuinely better... memorable, verbs naturally, doesn't scream enterprise middleware."

### 2. Architecture: **SDK-Only, No Proxy**
- **Proposed by:** Elon Musk (Round 1)
- **Winner:** Elon Musk
- **Why:** Proxy adds 15-80ms latency to every LLM call — commercial suicide. SDK fetches from edge KV, caches locally (5-min TTL), injects prompt. Logging happens async AFTER call completes. Zero latency impact. Steve conceded in Round 2: "Critical path dependency is commercial suicide... I was wrong to ignore this."

### 3. Time Constraint: **Ship in One Session (7 Hours)**
- **Proposed by:** Elon Musk (Round 1)
- **Winner:** Elon Musk
- **Why:** If it can't be built in 7 hours, it's cut. No AI-powered analysis. No React. No side-by-side comparisons. Steve agreed: "Works in <5 minutes is the right bar."

### 4. CLI Is The Product
- **Proposed by:** Elon Musk (Round 2)
- **Winner:** Elon Musk
- **Why:** `tuned push` must work in under 60 seconds from install. Developers discover via `npm install`, not dashboards. Dashboard is read-only visibility. SDK is silent. CLI is the experience.

### 5. Brand Voice: Direct, Confident, Not Robotic
- **Proposed by:** Steve Jobs (Round 1)
- **Winner:** Steve Jobs
- **Why:** "This prompt has a problem. Here's the fix." — not "Perhaps you might consider..." Elon endorsed: "This costs us nothing and differentiates us from AWS-style documentation."

### 6. Pricing: One Tier, Usage Limits Only
- **Proposed by:** Steve Jobs (Round 1)
- **Winner:** Steve Jobs (Elon agreed)
- **Why:** No feature walls. No pricing anxiety. One price, full product. Aligns with adoption-first strategy.

### 7. First Experience: Value Before Effort
- **Proposed by:** Steve Jobs (Round 2)
- **Winner:** Contested — Partially Deferred
- **Why:** Steve's vision (no signup wall, prompt analysis before commitment) requires AI features outside 7-hour scope. The *principle* is locked (value in <60 seconds), but implementation is MVP-scoped: immediate CLI utility, not AI-powered analysis.

---

## MVP Feature Set (What Ships in V1)

### CLI Commands
| Command | Description |
|---------|-------------|
| `tuned init` | Initialize project, create config |
| `tuned push` | Push prompt to registry with auto-versioning |
| `tuned list` | List all prompts and versions |
| `tuned rollback` | Revert to previous version |

### API (Cloudflare Worker + D1)
- CRUD operations for prompts and versions
- Edge KV for active prompt reads (<5ms latency)
- D1 for writes and dashboard reads only
- Async logging endpoint (fire-and-forget to queue)

### SDK
- `getPrompt(name)` — single function
- Aggressive caching (5-min TTL)
- Local injection, no proxy in request path

### Dashboard
- Static HTML (no React)
- Read-only visibility
- Shows: prompt name, version number, timestamp, content
- No buttons, no actions

---

## What's CUT from V1

| Feature | Reason | Target Version |
|---------|--------|----------------|
| A/B testing | Adoption before optimization | V2 |
| Dashboard rollback button | CLI is sufficient | V2 |
| Proxy architecture | Latency killer | Never (SDK-only) |
| `tuned diff` | Nice-to-have | V2 |
| Prompt analysis/parsing | Requires AI layer | V2/V3 |
| Side-by-side comparison UI | React complexity | V2 |
| React dashboard | 7-hour constraint | V2 |
| Collaboration/teams | Individuals first | V2 |
| Integrations (Slack, OAuth) | Copy-paste is MVP | V2 |
| Prompt libraries/templates | Users want *their* prompts better | Never |
| Analytics dashboards | "Charts are a crutch" | V2+ |
| npm publish automation | Do manually post-build | V1.1 |

---

## File Structure (What Gets Built)

```
tuned/
├── worker/
│   ├── index.ts              # Cloudflare Worker entry
│   ├── routes/
│   │   ├── prompts.ts        # CRUD endpoints
│   │   └── log.ts            # Async logging endpoint
│   └── wrangler.toml         # Worker config
│
├── cli/
│   ├── bin/tuned.ts          # CLI entry point
│   ├── commands/
│   │   ├── init.ts           # tuned init
│   │   ├── push.ts           # tuned push
│   │   ├── list.ts           # tuned list
│   │   └── rollback.ts       # tuned rollback
│   ├── config.ts             # Local config handling
│   └── package.json
│
├── sdk/
│   ├── index.ts              # getPrompt() export
│   ├── cache.ts              # 5-min TTL caching
│   └── package.json
│
├── dashboard/
│   ├── index.html            # Static HTML
│   ├── styles.css            # Minimal styling
│   └── script.js             # Fetch and render prompts
│
├── schema/
│   └── d1.sql                # D1 database schema
│
└── docs/
    └── quickstart.md         # 60-second setup guide
```

### Database Schema (D1)
```sql
-- Prompts table
prompts (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Versions table
versions (
  id TEXT PRIMARY KEY,
  prompt_id TEXT REFERENCES prompts(id),
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

### Edge KV Structure
```
Key: prompt:{name}
Value: { version: number, content: string }
```

---

## Open Questions (Need Resolution)

### 1. Logging Backend
- **Question:** Workers Analytics Engine vs. Logpush vs. external service?
- **Context:** D1 cannot handle write volume at scale (1000+ writes/day). Elon flagged this breaks at 100x usage.
- **Needed by:** Build phase

### 2. Authentication Model
- **Question:** API keys per project? Per user? How generated/stored?
- **Context:** Neither debate addressed auth specifics. Required for push/SDK operations.
- **Needed by:** Build phase

### 3. SDK Distribution
- **Question:** npm publish timing? Package name availability?
- **Context:** Elon cut automated npm publish. Manual process needs definition.
- **Needed by:** Post-build

### 4. Dashboard Hosting
- **Question:** Cloudflare Pages? Embedded in Worker? Separate static hosting?
- **Context:** Static HTML simplifies options. Decision affects deploy config.
- **Needed by:** Build phase

### 5. Steve's "First Experience" Vision
- **Question:** How much of the "value before effort" UX can fit in 7 hours?
- **Context:** No signup wall is achievable. Prompt analysis is not. What's the middle ground?
- **Needed by:** Build phase

### 6. CLI Error Messages
- **Question:** Who writes the copy? What's the voice guide?
- **Context:** Steve mandated brand voice. Need concrete examples for implementation.
- **Needed by:** Build phase

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **7-hour scope creep** | High | Critical | Ruthless cuts. Static HTML only. No React. No AI features. |
| **Edge KV cold start latency** | Medium | High | Aggressive SDK caching. 5-min TTL is floor, not ceiling. |
| **D1 write limits at scale** | High | High | Logging to Analytics Engine/Logpush from day 1. D1 for prompts only. |
| **Name collision ("tuned" npm)** | Medium | Medium | Check availability before build. Have backup: `@tuned/sdk` |
| **Auth complexity explosion** | High | High | Simplest possible: project-level API key, generated on init. |
| **Developer trust (latency concerns)** | Medium | Critical | Zero-latency architecture is non-negotiable. Prove with benchmarks in docs. |
| **First impression failure** | Medium | Critical | 60-second rule. If setup fails, users leave forever. |
| **Steve's vision vs. Elon's scope** | High | Medium | Principle locked (value fast), implementation scoped to 7 hours. |

---

## Build Phase Priorities

1. **Worker + D1 Schema** — Foundation (2 hours)
2. **CLI (4 commands)** — The product (2 hours)
3. **SDK skeleton** — `getPrompt()` with caching (1 hour)
4. **Static Dashboard** — Read-only visibility (1 hour)
5. **Polish/Deploy** — Docs, error messages, voice (1 hour)

---

## The Essence (From essence.md)

> **What it's really about:** Closing the gap between knowing AI is powerful and knowing how to wield it.
>
> **The feeling:** Competence. The relief of finally understanding what you're saying.
>
> **The one thing that must be perfect:** First touch — value before effort, in under 60 seconds.
>
> **Creative direction:** Instrument, not control panel.

---

*"The strength of the team is each individual member. The strength of each member is the team."*

*Steve brought the soul. Elon brought the scalpel. The product is better for the tension.*

*Now we build.*

— Phil Jackson
