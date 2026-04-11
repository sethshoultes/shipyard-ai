# Drift — Final Decisions
## Consolidated by Phil Jackson, The Zen Master

*Two brilliant minds. One product. These are the locked decisions.*

---

## Decision Log

### 1. Product Name: **Drift**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Why** | Unanimous. Elon conceded explicitly: "Drift > PromptOps. It's not close." The name is a verb, a feeling, one word. `drift push`, `drift rollback` — these feel like actions, not bureaucracy. PromptOps dies here. |

---

### 2. Proxy Architecture in V1: **CONTESTED — REQUIRES RESOLUTION**
| | |
|---|---|
| **Steve's Position** | Proxy ships in v1. "Change your base URL" is the entire value proposition. One-line integration. Instant rollback without redeployment. Non-negotiable. |
| **Elon's Position** | No proxy in v1. Users fetch prompts client-side at startup. Proxy adds latency, complexity, failure modes. Non-negotiable. |
| **Winner** | **DEADLOCK** |
| **Resolution Required** | This is the central architectural dispute. Both marked it as non-negotiable. The build cannot proceed without a decision. See Open Questions. |

---

### 3. Dashboard Scope: **Minimal**
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (Steve conceded) |
| **Why** | Steve admitted: "I got carried away." Three views only: list prompts, view content, rollback. No performance metrics. No charts. No analytics. |

---

### 4. `drift diff` Command: **CUT**
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (Steve conceded) |
| **Why** | "Don't rebuild Unix." Users have `diff`. Unnecessary scope. |

---

### 5. CLI Open Source: **YES — MIT Licensed**
| | |
|---|---|
| **Proposed by** | Elon Musk |
| **Winner** | Both (Steve conceded, called it "the Vercel model") |
| **Why** | Proprietary developer tools don't spread. CLI and client SDK are MIT-licensed. Backend/hosted service is the business. |

---

### 6. Onboarding: **30 Seconds to First Rollback**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Why** | `npm install -g drift && drift init && drift push` must work without signup forms, email verification, or OAuth. Friction is death for developer tools. Elon did not contest this. |

---

### 7. Brand Voice: **Confident, Direct**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (Elon explicitly endorsed) |
| **Why** | "Rolled back to v3. Live now." Speaks like a senior engineer. No cutesy copy. No apologies. Direct and helpful without coddling. |

---

### 8. A/B Testing: **CUT from V1**
| | |
|---|---|
| **Proposed by** | Both |
| **Winner** | Both |
| **Why** | Feature creep disguised as sophistication. Ship versioning first. |

---

### 9. Prompt Templates: **CUT from V1**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Why** | Users already have Jinja, Handlebars, etc. Version the output, not the machinery. |

---

### 10. Team Features: **CUT from V1**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Why** | One person, one project, one API key. Collaboration is a v2 problem. |

---

### 11. Native LLM Provider Integrations: **CUT**
| | |
|---|---|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Why** | We're the layer before the model, not married to it. Pass headers, stay dumb. |

---

## MVP Feature Set (What Ships in V1)

### Locked Features
1. **CLI (`drift`)** — MIT licensed, npm installable
   - `drift init` — Get API key, no signup friction
   - `drift push <name> --file <path>` — Push prompt with version
   - `drift rollback <name> <version>` — Rollback to specific version
   - `drift list` — List all prompts
   - `drift get <name>` — Fetch current active prompt

2. **API** — Simple REST endpoints
   - `GET /prompts/:name` — Fetch active prompt
   - `POST /prompts/:name` — Push new version
   - `POST /prompts/:name/rollback` — Rollback to version
   - `GET /prompts` — List all prompts

3. **Dashboard** — One-page, three views
   - List all prompts
   - View prompt content + version history
   - One-click rollback

4. **Authentication** — Single project token per user, no project management UI

### Contested (Requires Resolution)
- **Proxy** — Steve says ship it, Elon says cut it. See Open Questions.

### Explicitly Cut
- `drift diff`
- A/B testing
- Performance metrics/analytics
- Prompt templates
- Team features
- Multi-provider integrations
- Project management UI
- ProductHunt launch (Elon: "worthless for developer tools")

---

## File Structure (What Gets Built)

```
drift/
├── cli/                          # MIT licensed
│   ├── package.json
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── commands/
│   │   │   ├── init.ts
│   │   │   ├── push.ts
│   │   │   ├── rollback.ts
│   │   │   ├── list.ts
│   │   │   └── get.ts
│   │   ├── api.ts                # API client
│   │   └── config.ts             # Local config handling
│   └── README.md
│
├── api/                          # Cloudflare Worker
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts              # Router
│   │   ├── routes/
│   │   │   ├── prompts.ts
│   │   │   └── auth.ts
│   │   ├── db/
│   │   │   └── schema.sql        # D1 schema
│   │   └── middleware/
│   │       └── auth.ts
│   └── README.md
│
├── dashboard/                    # Static site or CF Pages
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx         # List view
│   │   │   └── prompt/[name].tsx # Detail + rollback view
│   │   └── components/
│   └── README.md
│
├── proxy/                        # IF INCLUDED (contested)
│   ├── wrangler.toml
│   └── src/
│       └── index.ts              # Request rewriting + prompt injection
│
└── docs/
    └── quickstart.md
```

---

## Open Questions (What Still Needs Resolution)

### 1. THE PROXY QUESTION (Critical — Blocks Build)
**Steve's case:** The proxy IS the product differentiation. One-line integration (`change your base URL`). Instant rollback without redeployment. Without it, "we're Vercel environment variables with a CLI."

**Elon's case:** The proxy adds latency to every LLM call. It's a critical failure point. Nobody routes production traffic through an unproven startup's proxy on day one. "Build the proxy when you have 100 users begging for it."

**Proposed resolution options:**
1. **Ship without proxy** — Elon wins. Build in one session. Validate demand first.
2. **Ship with simple proxy** — Steve wins. Accept scope risk. Proxy has limitations but works.
3. **Ship both paths** — SDK can fetch prompts OR use proxy. User chooses. Double the integration work.

**Decision needed from:** Product owner / CEO / tiebreaker

---

### 2. SDK vs CLI-Only
Should there be a JavaScript/TypeScript SDK for programmatic prompt fetching, or is CLI + raw API enough for v1?

---

### 3. Polling vs Webhooks
If no proxy, how do apps get prompt updates? Polling interval? Webhooks? Manual refresh?

---

### 4. Log Retention
Elon raised: At 10M requests/month, logs hit D1's 10GB limit in ~6 months. Need log rotation or R2 storage from day one?

---

### 5. Domain Choice
Steve proposed `drift.sh/v1`. Is `drift.sh` available? Backup options?

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Proxy adds unacceptable latency** | Medium | High | Measure real latency in staging. Have fallback to SDK-only mode. |
| **7-hour build estimate is too aggressive** | High | Medium | Cut proxy if running behind. Ship CLI + API + minimal dashboard only. |
| **D1 write contention at scale** | Low (v1) | Medium | Batch log writes. Plan R2 migration path. |
| **"Drift" trademark conflict** | Unknown | High | Check trademark before public launch. Have backup name. |
| **Onboarding takes >30 seconds** | Medium | High | Test with real users. Cut any friction discovered. |
| **CLI npm publish fails** | Low | High | Test publish to npm before launch. Have backup distribution (GitHub releases). |
| **CF Worker cold starts** | Low | Medium | Edge workers are fast. Monitor P99 latency. |
| **Nobody wants this** | Medium | Critical | Launch on HN fast. Get signal before over-building. |

---

## The Essence (From Steve)

> **What it's really about:** The undo button for your AI's soul.
>
> **The feeling:** Peace of mind. The terror of "what changed?" dissolves into control.
>
> **The one thing that must be perfect:** 30 seconds to first rollback. Zero friction.
>
> **Creative direction:** Craftsmanship, not configuration.

---

## Distribution Plan (From Elon)

1. **HN Launch** — "Show HN: Git for prompts" — controversial framing drives engagement
2. **Dev Twitter** — Demo videos, threading the "undo button for AI's personality" angle
3. **r/LocalLLaMA** — 500K+ subscribers who obsess over prompts
4. **AI Newsletters** — Ben's Bites, The Rundown (100K+ exact target audience)
5. **Skip** — ProductHunt (worthless for developer tools)

---

## Final Notes from the Zen Master

The triangle offense works because everyone knows their role. Steve brings the vision — the name, the feeling, the 30-second magic. Elon brings the discipline — cut scope, ship fast, measure reality.

The proxy debate is real. Both are right in their own frame. Steve is right that one-line integration is magical. Elon is right that unvalidated complexity kills startups.

**My recommendation:** Ship without the proxy. Get 100 users. Ask them if they'd use a proxy. If yes, build it in week 2. If no, Steve learns something. Either way, we ship.

But that's a recommendation, not a decision. The build awaits the tiebreaker.

---

*"The strength of the team is each individual member. The strength of each member is the team."*

— Phil Jackson
