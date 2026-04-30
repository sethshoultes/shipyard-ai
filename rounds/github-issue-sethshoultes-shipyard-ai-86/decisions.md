# Anvil — Locked Decisions

> *"If it doesn't make someone grin when their first request streams back from 200 cities, cut it."*
> — Essence.md

---

## Decision Registry

### 1. Name: Anvil
- **Proposed by:** Steve Jobs (Round 1)
- **Winner:** Steve
- **Why:** Essence.md locks it: "One word. Strike once." Two syllables, hard consonant, implies precision and permanence. Elon argued naming is post-ship, but offered no competing name and Essence overruled him.

### 2. One LLM template, streaming only — cut multimodal
- **Proposed by:** Elon Musk (Round 1, "What to CUT")
- **Winner:** Elon
- **Why:** Steve conceded in Round 2: "image and audio models are V2 masquerading as V1. Focus wins." Essence.md reinforces: "One LLM template. Streaming only." Keeps the build to a single session.

### 3. Dynamic generation from Cloudflare spec — zero hand-written templates
- **Proposed by:** Elon Musk (Round 1 Scaling, Round 2 Non-Negotiables)
- **Winner:** Elon
- **Why:** Steve explicitly conceded in Round 2: "you're right that hand-written templates rot — generate from Cloudflare's spec dynamically. That's smart. Those are real engineering constraints, not opinion." Prevents 200+ annual maintenance events (template janitor scenario).

### 4. Brand voice — plainspoken, human, zero corporate jargon
- **Proposed by:** Steve Jobs (Round 1 Design Philosophy / Brand Voice)
- **Winner:** Steve
- **Why:** Elon conceded in Round 2: "Taste matters at the edges: plainspoken voice, no config hell, no multi-cloud support... Steve's 'Say NO' list is essentially my cut list with better adjectives. I concede that." Essence.md: "If a sentence sounds like it could live on an IBM landing page, delete it."

### 5. The "grin" moment / emotional payoff is the core metric
- **Proposed by:** Steve Jobs (Round 1 "First 30 Seconds" / "Emotional Hook")
- **Winner:** Steve
- **Why:** Essence.md locks it: "That first streaming response hitting the terminal" and "If it doesn't make someone grin... cut it." Elon's "magic is not a metric" was overruled by product essence. Time-to-magic beats time-to-deploy if the deploy feels like filing taxes.

### 6. Production metric = 100 concurrent streaming requests, stable
- **Proposed by:** Elon Musk (Round 1 challenged "production-ready" as meaningless)
- **Winner:** Elon
- **Why:** Steve conceded in Round 2: "I also concede 'production-ready' is meaningless without a real metric: 100 concurrent streaming requests, stable." Replaces marketing fluff with physics. This is the v1 ceiling test.

### 7. Build product, not a demo — optimize for delight, not HN upvotes
- **Proposed by:** Steve Jobs (Round 2 rebuttal to Elon's distribution strategy)
- **Winner:** Steve
- **Why:** Elon advocated "demo first; product secondary." Steve rebutted: "A beautiful demo that delivers a mediocre product is a fraud." Essence.md targets "superpower" and "freedom from infrastructure," not virality. Organic growth is the exhaust of delight.

### 8. Convention over configuration — one way to deploy, one model
- **Proposed by:** Steve Jobs (Round 1 Design Philosophy)
- **Winner:** Steve
- **Why:** Elon conceded in Round 2: "convention over configuration is correct *if* the convention is ruthlessly tight. One way to deploy. One template. One model. That's not design philosophy; that's engineering necessity."

---

## MVP Feature Set (What Ships in v1)

- [ ] **Single-command LLM worker scaffolding:** `npx anvil create --llm`
- [ ] **Dynamic code generation from live Cloudflare Workers AI OpenAPI spec**
  - Fetch spec at scaffold time
  - Parse default LLM model and required bindings
  - Emit worker code — no bundled static templates
- [ ] **One generated `index.ts`** — streaming inference handler (WebSocket/text streaming)
- [ ] **One generated `wrangler.toml`** — model binding, minimal config, no hand-tuning required
- [ ] **Wrangler deploy integration** — one keystroke from generated code to live worker
- [ ] **Zero-install onboarding path** — GitHub template + "Deploy to Workers" button for first-timers
- [ ] **Streaming-only responses** — no blocking/batch mode, no multimodal
- [ ] **One default LLM model** — convention over configuration; no model picker
- [ ] **Plainspoken CLI output and error messages** — human voice, no stack traces as UI
- [ ] **Target experience:** 60 seconds from command to first streaming response that makes the user grin

### Explicitly CUT from v1
- Rate limiting, caching, monitoring (unresolved — see Open Questions)
- Image and audio models
- Multi-cloud support (AWS/GCP/Azure)
- Dashboards, web UI, 47 CLI flags
- Model picker / multimodal logic
- Static/cookiecutter hand-written templates

---

## File Structure (What Gets Built)

### The Anvil CLI (the tool)
```
anvil/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   └── create.ts         # `anvil create --llm` orchestration
│   ├── generators/
│   │   ├── spec.ts           # Fetch & parse Cloudflare Workers AI OpenAPI spec
│   │   └── worker.ts         # Emit index.ts + wrangler.toml dynamically
│   └── utils/
│       └── deploy.ts         # Wrangler deploy wrapper & auth edge-case handling
├── github-template/            # Zero-install fork target
│   ├── src/
│   │   └── index.ts          # Bootstrap placeholder (replaced by generator)
│   ├── wrangler.toml         # Base config
│   ├── package.json          # Minimal deps
│   └── README.md             # "Deploy to Workers" button + 10-second path
├── package.json
├── tsconfig.json
└── bin/
    └── anvil                   # Executable entry
```

### The Generated Worker (the artifact)
```
my-llm-worker/
├── index.ts          # Streaming LLM handler (generated from live spec)
├── wrangler.toml     # Worker config with AI binding (generated)
└── package.json      # Minimal dependencies
```

**Design rule:** `index.ts` and `wrangler.toml` only. If a third file is required, the generator is wrong.

---

## Open Questions (What Still Needs Resolution)

### 1. Rate limiting, caching, monitoring: In v1 or post-MVP?
- **Steve:** "That's the difference between a toy and a tool." Keep them.
- **Elon:** "Rate limiting, caching, monitoring — these are three separate products. Cut them."
- **Status:** **UNRESOLVED.** This is the highest-risk scope question. If included, v1 becomes a framework; if cut, the 100-concurrent-stream metric may fail in the wild.

### 2. Primary deploy path: CLI vs. GitHub button
- **Steve:** Terminal-first. `npx anvil create --llm`. "Your code, your machine, your control. The terminal is sacred ground."
- **Elon:** Zero-install first. GitHub template + "Deploy to Workers" button. "The CLI is secondary, not primary."
- **Status:** **UNRESOLVED.** Essence.md locks "Zero-install deploy path" but Steve calls the terminal "sacred ground." Need executive decision on which path is primary vs. secondary onboarding.

### 3. Auth friction mitigation
- **Elon** identified `wrangler auth` as a first-time user drop-off point (30–90s bottleneck).
- No specific solution debated beyond the GitHub button bypassing local auth.
- **Status:** Needs design. If CLI is primary, we need an auth flow that doesn't kill the grin.

### 4. Default model selection
- "One model" is agreed, but **which** one? Cloudflare changes Workers AI model names quarterly.
- **Status:** Needs selection logic in the spec parser (e.g., highest-version text-generation model at scaffold time).

### 5. Distribution execution
- **Elon:** HN #1, Cloudflare template gallery, viral video — demo-first tactics.
- **Steve:** Organic growth is "exhaust of delight" — build the product so obviously right that people *have* to share it.
- **Status:** Tactics undecided. Product quality is the agreed foundation, but the launch mechanism is not locked.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Spec drift / Generation failure** | Medium | High | Version-pin spec parser; add smoke test that fails CI if generator output doesn't `wrangler deploy` cleanly. |
| **`npm install` / `wrangler auth` drop-off** | High | High | Zero-install button must work flawlessly; if CLI is kept, auth flow needs explicit hand-holding (not raw wrangler errors). |
| **Scope creep into framework territory** | High | Medium | Reject any feature that doesn't serve the 60-second grin. Steve's "Say NO" list is law. |
| **Template rot via static fallbacks** | Low | High | **Never hand-write a template.** If dynamic generator fails, fail loudly. Static "backup" templates create 200+ maintenance events/year. |
| **Demo-quality product** | Medium | High | Optimizing for HN upvotes instead of daily use kills retention. Steve's rule: if users don't grin and come back, it's not shipped. |
| **100 concurrent stream ceiling** | Medium | High | If the generated worker can't handle the agreed production metric, trust breaks. Load test the generated output before tagging v1. |
| **Name/brand dilution** | Low | Medium | Ship as Anvil, voice locked, no IBM sentences. Delaying naming or shipping without intention = abandonware energy. |

---

*This document is the contract for the build phase. If it's not in here, it's not in v1.*
