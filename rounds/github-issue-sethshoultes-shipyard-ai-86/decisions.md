# Anvil — Locked Decisions

> *"One command. Live LLM worker. No config. No install. Sixty seconds."*
> — Essence.md

---

## Decision Registry

### 1. Name: Anvil
- **Proposed by:** Essence.md (pre-locked)
- **Steve argued:** "Nova" — one word, star-born, magic.
- **Elon argued:** Renaming before shipping is bikeshedding; offered no competing name.
- **Winner:** Anvil (Essence overrules).
- **Why:** The name was locked before the debate began. "One word. Strike once." Steve's "Nova" is beautiful but the product is a striking tool, not a celestial event. Changing it burns scarce hours.

### 2. One LLM template, streaming only — multimodal CUT
- **Proposed by:** Elon Musk (Round 1, Round 2 Non-Negotiable #1)
- **Steve argued:** "Multimodal v1 is death" (conceded) but held firm on **three LLMs** being perfect.
- **Winner:** Elon.
- **Why:** Steve conceded multimodal is scope suicide, but three LLMs is still a framework, not a tool. Essence.md locks "One LLM. Streaming only." You do not prove three loops; you prove one. If one cannot make them grin, three will not help.

### 3. Dynamic generation from live Cloudflare spec — zero hand-written templates
- **Proposed by:** Elon Musk (Round 1 Scaling, Round 2)
- **Steve conceded in Round 2:** "You're right that hand-written templates rot — generate from Cloudflare's spec dynamically. That's smart. Those are real engineering constraints, not opinion."
- **Winner:** Elon.
- **Why:** Hand-written templates create the "template janitor" scenario (50 templates × 4 breaking Cloudflare changes/year = 200 maintenance events). Dynamic generation makes the CLI immortal. If the generator fails, it fails loudly; static fallbacks are forbidden.

### 4. Brand voice — plainspoken, confident, zero corporate jargon
- **Proposed by:** Steve Jobs (Round 1 "Brand Voice" / "Say NO" list)
- **Elon conceded in Round 2:** "Taste matters at the edges: plainspoken voice, no config hell, no multi-cloud support... Steve's 'Say NO' list is essentially my cut list with better adjectives. I concede that."
- **Winner:** Steve.
- **Why:** Engineers are exhausted by infrastructure-speak. Every sentence must sound like it was written by a sharp developer at 2am, not a Solutions Architect at IBM.

### 5. The "grin" / "gasp" moment is the core success metric
- **Proposed by:** Steve Jobs (Round 1 "First 30 Seconds" / "Emotional Hook"); reinforced by Essence.md
- **Elon conceded in Round 2:** "The emotional hook of 'I can't believe that just worked' is real, and we should engineer for it."
- **Winner:** Steve.
- **Why:** Essence.md states: "That first streaming response hitting the terminal" and "If it doesn't make someone grin... cut it." Time-to-magic beats time-to-deploy. But — and this is critical — the magic must come from **reliability**, not theater. A tool that works every time beats a tool that sparkles once and collapses under load.

### 6. Production metric = 100 concurrent streaming requests, stable
- **Proposed by:** Steve Jobs (Round 2, replacing "production-ready" marketing fluff)
- **Elon effectively accepted:** By challenging Steve to replace vague language with physics, Elon forced this number into existence. He did not dispute it.
- **Winner:** Steve.
- **Why:** "Production-ready" is meaningless without a number. 100 concurrent streams is the v1 ceiling test. If the generated worker cannot pass this, it does not ship.

### 7. Build product, not demo — optimize for delight and retention, not virality alone
- **Proposed by:** Steve Jobs (Round 2 rebuttal to Elon's "demo first" distribution strategy)
- **Steve:** "A beautiful demo that delivers a mediocre product is a fraud."
- **Winner:** Steve (with Elon's tactics preserved).
- **Why:** Essence.md targets "superpower" and "freedom from infrastructure," not Hacker News upvotes. Organic growth is the exhaust of delight. However, Elon's specific distribution tactics (HN #1 launch, SEO blog posts, `create-cloudflare` partnership) are retained as the **launch execution plan**, subordinate to product quality.

### 8. Convention over configuration — one way to deploy, one model
- **Proposed by:** Steve Jobs (Round 1 Design Philosophy)
- **Elon conceded in Round 2:** "Convention over configuration is correct *if* the convention is ruthlessly tight. One way to deploy. One template. One model. That's not design philosophy; that's engineering necessity."
- **Winner:** Steve.
- **Why:** Every config option is a fracture in the user experience. We choose. They create.

---

### Executive Decisions — Zen Master Tie-Breaks

The following were not fully resolved in debate. I break the ties:

### 9. CLI is primary; GitHub zero-install button is secondary onboarding
- **Steve argued:** Terminal-first. "Your code, your machine, your control. The terminal is sacred ground."
- **Elon argued:** Zero-install first. GitHub template + "Deploy to Workers" button. "The CLI is secondary, not primary."
- **Winner:** Both paths ship, but CLI is primary.
- **Why:** Essence.md says "One command." That implies a CLI invocation. The 60-second promise is measured from `npx anvil create --llm` to streaming response. The GitHub button is the **onboarding ramp** for non-terminal users and the Hacker News demo — it does not replace the CLI. If the CLI path is not the hero, the product becomes a template repo, not a tool.

### 10. Flags-only CLI — no interactive wizard
- **Elon argued:** `npx anvil create --llm --stream`. Zero prompts. No ceremony.
- **Steve argued:** The wizard is the interface. "A flag is a chore; a wizard is a performance."
- **Winner:** Elon.
- **Why:** A wizard adds state machines, prompts, validation loops, and test surface. "One command, zero prompts" is the 60-second path. However, we preserve Steve's emotional payoff through **rich CLI output** — color, a single spinner, and a triumphant success message. Theater without state.

### 11. Rate limiting INCLUDED via native Cloudflare bindings; caching and monitoring CUT
- **Steve argued:** "Thirty seconds to a live, production-ready endpoint. We ship with rate limiting, caching, streaming, and monitoring baked in. No exceptions."
- **Elon argued:** "Rate limiting, caching, monitoring — these are three separate products. Cut them."
- **Winner:** Split decision — rate limiting stays; caching and monitoring go.
- **Why:** Rate limiting in Cloudflare Workers is a single binding line in `wrangler.toml` (`[[unsafe.bindings]]` or native `limits`). It is not a separate product — it is a toggle. Including it prevents the "toy" accusation and protects the 100-concurrent-stream metric without framework bloat. Caching (edge cache rules, KV, R2) and monitoring (observability dashboards, log pipelines) are genuinely separate systems. They get cut.

---

## MVP Feature Set (What Ships in v1)

### Included
- [ ] **Single-command scaffolding:** `npx anvil create --llm`
- [ ] **Dynamic code generation from live Cloudflare Workers AI OpenAPI spec**
  - Fetch spec at scaffold time
  - Parse highest-version text-generation model and required AI binding
  - Emit worker code — no bundled static templates
- [ ] **Exactly two generated files:**
  - `index.ts` — streaming LLM inference handler (Web Streams API, `fetch`-based)
  - `wrangler.toml` — AI binding + minimal rate limit config, no hand-tuning
- [ ] **Wrangler deploy wrapper** — invokes `wrangler deploy` in the user's shell with human-friendly error translation (no hidden auth flows, no account-selection hell)
- [ ] **GitHub template repo** — fork target with "Deploy to Workers" button for zero-install onboarding
- [ ] **Streaming-only** — no blocking/batch mode
- [ ] **One default LLM model** — auto-selected from spec; no model picker
- [ ] **Plainspoken CLI output** — human voice, no stack traces as UI
- [ ] **Target experience:** 60 seconds from command to first streaming response that makes the user grin

### Explicitly CUT from v1
- Image and audio models
- Interactive wizard / prompts
- Caching layer (edge cache, KV, R2)
- Monitoring / dashboards / observability pipelines
- Multi-cloud support (AWS/GCP/Azure)
- Web UI
- Model picker / multimodal logic
- Static/cookiecutter hand-written templates
- 47 CLI flags

---

## File Structure (What Gets Built)

### The Anvil CLI (the tool)
```
anvil/
├── src/
│   ├── index.ts              # CLI entry point — parse flags, route command
│   ├── commands/
│   │   └── create.ts         # `anvil create --llm` orchestration
│   ├── generators/
│   │   ├── spec.ts           # Fetch & parse Cloudflare Workers AI OpenAPI spec
│   │   └── worker.ts         # Emit index.ts + wrangler.toml dynamically
│   └── utils/
│       └── deploy.ts         # Wrangler deploy wrapper; human-friendly error handling
├── github-template/          # Zero-install fork target
│   ├── src/
│   │   └── index.ts          # Bootstrap placeholder (replaced by generator)
│   ├── wrangler.toml         # Base config
│   ├── package.json          # Minimal deps (wrangler only)
│   └── README.md             # "Deploy to Workers" button + 10-second path
├── package.json
├── tsconfig.json
└── bin/
    └── anvil                 # Executable entry
```

### The Generated Worker (the artifact)
```
my-llm-worker/
├── index.ts          # Streaming LLM handler (generated from live spec)
├── wrangler.toml     # Worker config with AI binding + rate limit (generated)
└── package.json      # Minimal dependencies (wrangler, optionally @cloudflare/workers-types)
```

**Design rule:** `index.ts` and `wrangler.toml` only. If a third file is required, the generator is wrong.

---

## Open Questions (What Still Needs Resolution)

### 1. Auth friction mitigation
- **Problem:** Elon identified `wrangler auth` as a first-time user drop-off point (30–90s bottleneck).
- **Status:** Needs design. If the CLI path is primary, we need an auth flow that doesn't kill the 60-second grin. Options: pre-flight auth check with a one-line `wrangler login` prompt, or auto-opening the browser. Must not swallow raw wrangler errors.

### 2. Default model selection algorithm
- **Problem:** "One model" is agreed, but **which** one? Cloudflare changes Workers AI model names quarterly.
- **Status:** Needs logic in the spec parser. Proposal: select the highest-version `text-generation` model at scaffold time, with a pinned fallback if the spec fetch fails. The fallback must be dynamically fetched from a separate repo (per Elon's template rot mitigation), never hard-coded in the CLI.

### 3. Distribution execution
- **Problem:** Tactics are undecided. Elon proposed HN #1, SEO blog posts, `create-cloudflare` partnership. Steve argued organic growth is "exhaust of delight."
- **Status:** The *strategy* is locked (product quality first). The *tactics* (launch sequence, blog calendar, partnership outreach) need an owner and timeline post-build.

### 4. Wizard for v2?
- **Problem:** Steve's vision of a "breathing terminal" was overruled for v1. This is not killed, only deferred.
- **Status:** If v1 hits the 100-concurrent-stream metric and sustains daily use, a wizard can be revisited as a premium experience layer. Until then, flags-only is law.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Spec drift / Generation failure** | Medium | High | Version-pin spec parser; add CI smoke test that fails if generator output doesn't `wrangler deploy` cleanly. Never ship static "backup" templates. |
| **`npm install` / `wrangler auth` drop-off** | High | High | Zero-install GitHub button must work flawlessly. CLI path needs explicit auth hand-holding — clear one-line prompts, not raw wrangler stack traces. |
| **Scope creep into framework territory** | High | Medium | Reject any feature that doesn't serve the 60-second grin. Steve's "Say NO" list is law. If it adds a third file, it's cut. |
| **Template rot via static fallbacks** | Low | High | **Never hand-write a template.** If dynamic generator fails, fail loudly. Static backups create 200+ maintenance events/year and guarantee abandonment. |
| **Demo-quality product** | Medium | High | Optimizing for HN upvotes instead of daily use kills retention. The 100-concurrent-stream load test is the gate before tagging v1. |
| **Generated worker fails 100-concurrent ceiling** | Medium | High | Load test the generated output before v1 tag. If the output cannot handle 100 streams, the generator logic is broken, not the user. |
| **Name/brand dilution** | Low | Medium | Ship as Anvil, voice locked, no IBM sentences. Delaying naming or shipping without intention = abandonware energy. |
| **Cloudflare API breaking change mid-launch** | Medium | High | Dynamic spec parsing is the mitigation. If the spec changes, the next scaffold picks it up automatically. Pin only the parser logic, not the model names. |

---

*This document is the contract for the build phase. If it's not in here, it's not in v1.*
