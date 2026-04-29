# ClipCraft Backend — Locked Decisions
*Consolidated by the Zen Master, Great Minds Agency*

> "The strength of the team is each individual member. The strength of each member is the team."
>
> — Phil Jackson

---

## Executive Summary

The board has placed the project on **HOLD** (unanimous 1/10 scores). The Elon/Steve debates produced genuine strategic clarity, but **zero files shipped** — an empty deliverables directory is not a product. The board will lift HOLD only when six conditions are met: working backend, unit economics, a minimum viable moat, human-centered UX, retention hooks, and a published API.

This document separates what is **locked** (build it) from what is **open** (decide it) from what is **board-mandated** (non-negotiable to proceed).

---

## Decisions Log

### 1. Render Architecture: Cloudflare Workers + Decoupled Render Node
- **Proposed by:** Elon (Round 1)
- **Conceded by:** Steve (Round 2: "Elon is correct — provisioning headless Chrome, debugging Remotion, and designing API contracts in the same breath is madness.")
- **Winner:** Elon
- **Why:** A Cloudflare Worker is a V8 isolate — no Chrome, no FFmpeg, no Remotion. Video rendering inside a Worker violates physics. Workers handle API + queue + state. The renderer lives on a decoupled Node machine (Hetzner VPS / Fly.io) or Remotion Lambda. Steve conceded the architecture but demanded the node remain invisible infrastructure, never product.
- **Locked:** Queue message contract: `{ jobId, url, format }`. Renderer posts back to `POST /api/internal/complete`. Decouple so the renderer can be rewritten without touching the API.

### 2. Video Format: Vertical Only (9:16)
- **Proposed by:** Elon (Round 1: "Pick vertical only. One less test dimension.")
- **Endorsed by:** Steve (Round 2: "One format, zero settings. Vertical only. No toggles.")
- **Winner:** Consensus
- **Why:** Short-form content defaults to vertical. Removing a dimension removes a decision.
- **Locked:** Vertical 9:16. Zero configuration.

### 3. Zero User Configuration at Point of Creation
- **Proposed by:** Steve (Round 1). Endorsed by Elon (Round 2: "Where Steve Is Right — One format, zero settings.")
- **Winner:** Steve
- **Why:** The interface is a field, a button, and destiny. Every toggle is a confession that our taste failed. No music picker. No pacing slider. No orientation toggle. No retry button. No settings panels.
- **Locked:** Paste URL → receive movie. Three taps or fewer.

### 4. Rendering Model: Async-Only, No Fake Real-Time Preview
- **Proposed by:** Elon (Round 1, Round 2)
- **Partially conceded by:** Steve (Round 2: "Conceding the render architecture, not the experience.")
- **Winner:** Elon
- **Why:** A 60-second 1080p clip is ~1,800 frames. Puppeteer at 5 fps = 6 minutes. The 90-second SLA is fantasy for v1 without Lambda concurrency or pre-rendering the entire internet. Steve's "Polaroid blooming in your palm" real-time preview is theater, not product.
- **Locked:** No fake real-time preview. Sub-60s render target achieved via pre-composed templates, hard cuts, static slides + timed captions, FFmpeg muxing (images + audio), or Remotion Lambda with concurrency. Aggressive caching cheats the wait.

### 5. Job State UX: Honest Wait, Invisible Machinery
- **Proposed by:** Both (deadlock). Steve: "No user-facing job state." Elon: "Async rendering with honest status."
- **Winner:** Zen Master synthesis
- **Why:** Elon is right that hiding failures is gaslighting. Steve is right that progress bars kill magic. The synthesis honors both truths.
- **Locked:** Users see a single elegant holding state — "Creating your film..." with an ambient animation. No percentages. No queue depths. No job IDs. No technical vocabulary. When complete, the video appears like a gift. On failure, gentle copy and automatic retry behind the curtain. No factory aesthetics; no silent failures.

### 6. Brand Voice & Emotional Hook
- **Proposed by:** Steve (Round 1). Endorsed by Elon (Round 2: "Where Steve Is Right — Brand voice... The user should feel creative, not like they scheduled a cron job.")
- **Winner:** Steve
- **Why:** The product takes dead text and breathes life into it. "Content repurposing" signals a utility for marketers. Feeling *creative* changes categories. Category changes are how you win. Maya Angelou: "Your words, alive." "Paste a story. Watch it move."
- **Locked:** Short sentences. Confident friend. No jargon. No exclamation-point desperation. We speak like we handed them the keys to a sports car. The user feels like they performed magic, not IT. Output makes them feel *creative*, not productive.

### 7. Caching Strategy: TTS + CDN
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** OpenAI TTS rate limits (100 RPM standard tier) and audio generation is slower than video composition. Egress costs spike if users download raw MP4s repeatedly.
- **Locked:** Cache TTS output per article content hash. CDN cache layer in front of R2 outputs. D1 handles writes; queue handles backpressure.

### 8. Idempotency Window: 6 Hours
- **Proposed by:** Elon (Round 1: "6 hours is enough to prevent accidental double-clicks")
- **Winner:** Elon
- **Why:** 24 hours is arbitrary. 6 hours prevents double-clicks without maintaining ghost state overnight.
- **Locked:** 6-hour idempotency window.

### 9. Cost Guardrails & Webhooks: Board-Mandated Enforcement
- **Previous debate:** Elon (Round 1): "Over-engineering. Set an OpenAI budget alert. Move on." Board overruled.
- **Winner:** Board (Board Verdict, Condition 1)
- **Why:** Buffett views every OpenAI API call as margin destruction. The board unanimously demands cost-ceiling enforcement and webhook notifications on completion/failure as a prerequisite to lift HOLD.
- **Locked:** Hard cost ceiling per render. Webhook notifications on completion and failure. Budget alert remains as secondary safety rail.

### 10. Workers AI Fallback: Cut
- **Proposed by:** Elon (Round 1: "YAGNI. OpenAI's uptime is fine.")
- **Winner:** Elon
- **Why:** Premature reliability theater. One fallback system doubles the test surface.
- **Locked:** Cut. No Workers AI fallback in v1.

### 11. Public Gallery: v2 Only
- **Proposed by:** Elon (Round 1: cut as "v2 feature masquerading as v1"). Endorsed by Steve (Round 2).
- **Winner:** Consensus
- **Why:** Ship the renderer first. A gallery is over-engineering for v1. Board mandates retention hooks (gallery included) as v1.1 scope (Board Verdict, Condition 5).
- **Locked:** Not in v1.0. Personal gallery + public gallery toggle scheduled for v1.1 per Shonda's retention roadmap.

### 12. No Editing Tools, No Timelines, No Trim Tools
- **Proposed by:** Steve (Round 1). Endorsed by Elon (Round 2).
- **Winner:** Consensus
- **Why:** If they want a timeline, let them buy Final Cut Pro. Great taste is our job, not theirs.
- **Locked:** No editing UI. No timeline. No trim.

### 13. Render Worker Technology: OPEN
- **Proposed by:** Elon (Round 1: Hetzner VPS or Remotion Lambda)
- **Winner:** Open (Elon proposed both; no concession or selection)
- **Why:** VPS ($5.35/mo) is debuggable and cheap but is a single point of failure. Remotion Lambda is boring, reliable, and pennies per render but AWS-locked and scales cost with usage. Steve conceded the render node exists but did not choose the implementation. Board demands only that the pipeline execute end-to-end.
- **Status:** Must be resolved in Session 0 of build phase.

### 14. Product Name: REEL vs ClipCraft — DEADLOCK
- **Proposed by:** Steve (Round 1: "The codename was Reel. One word. Four letters. One syllable. That's the name.")
- **Rejected by:** Elon (Round 2: "REEL is a generic noun you cannot trademark, rank for, or defend. Poetry is nice; SEO poison is death.")
- **Defended by:** Steve (Round 2: "The name is Reel. One syllable. Own the category.")
- **Winner:** Open / Deadlock
- **Why:** Steve insists a one-syllable proper noun you can verb is category-defining. Elon insists the name is a variable and the architecture is the constant. The demo script itself is split: URL is `Reel.shipyard.company`, button says "Make Reel", but the closing line reads "ClipCraft. Dead text into living film."
- **Status:** Zen Master ruling required before first line of UI copy is written. Bikeshedding kills momentum — lock in hour one of build.

### 15. Distribution Mechanics: Watermark & End-Card CTA — DEADLOCK
- **Proposed by:** Elon (Round 2: non-negotiable). Rejected by Steve (Round 2: non-negotiable).
- **Winner:** Deadlock
- **Why:** Elon says every video must distribute the product; distribution *is* the product. Steve says a watermark is a tattoo that says "I am cheap" — people share what they love, not what advertises us. Both listed this in their Top 3 Non-Negotiables. No synthesis possible without executive override.
- **Status:** Deadlock. Zen Master must rule before composition code is written.

### 16. Accessibility: WCAG 2.1 AA — Board-Mandated
- **Mandated by:** Board (Oprah / Board Verdict, Condition 4)
- **Winner:** Board
- **Why:** Oprah: "Accessibility: Everyone left out. Missing: aria-live for status, focus traps on form, reduced-motion options, screen-reader context." The board will not lift HOLD without human-centered UX that includes accessibility.
- **Locked:** aria-live regions for render status, keyboard navigation, reduced-motion support, screen-reader context. WCAG 2.1 AA compliance.

### 17. Unit Economics & Pricing — Board-Mandated
- **Mandated by:** Board (Buffett / Board Verdict, Condition 2)
- **Winner:** Board
- **Why:** Buffett: "A business without prices is a charity." Elon calculated $0.15–$0.35 cost per 60s video and insists price must be >$1/video. The board demands a published pricing page, subscription tiers, usage caps, and a revenue floor exceeding variable cost per user within 30 days of sign-up.
- **Locked:** Pricing page with tiers. Unit-cost model showing margin per render at 100, 1,000, and 10,000 monthly videos. Capital-efficiency plan: no further funding tranche required until product-market fit signals appear.

### 18. Minimum Viable Moat — Board-Mandated
- **Mandated by:** Board (Jensen / Board Verdict, Condition 3)
- **Winner:** Board
- **Why:** Jensen: "No proprietary data asset. No feedback loop. No switching cost." The board demands proof that the product compounds. Buffett agrees thin margins get worse at scale without a moat.
- **Locked:** Feedback loop (every rendered video improves timing, outline structure, or voice selection for that user). User-specific asset layer (saved brand colors, voice preferences, intro/outro snippets). Exploration of proprietary model fine-tuning (voice embedding, style LoRA) as a v1.2 roadmap item — not a blocker for v1.0, but a proved commitment.

### 19. API as Platform Foundation — Board-Mandated
- **Mandated by:** Board (Jensen / Board Verdict, Condition 6)
- **Winner:** Board
- **Why:** Jensen: "Single-user, single-workflow, single-tenant is not a platform." The board demands API-first architecture even if the primary UI ships first.
- **Locked:** Authenticated REST API with rate limits and render-status endpoints. Webhook subscriptions for partners. Documented path to template marketplace and multi-tenant rendering.

### 20. Error Handling: Silent Retry with Gentle User Surface
- **Previous debate:** Steve wants no failure surfaces. Elon wants honest status. Board wants webhook notifications.
- **Winner:** Zen Master synthesis
- **Why:** The board mandates webhooks (not silent). Steve mandates no user-facing panic. Elon mandates no gaslighting. The synthesis: automatic retry with exponential backoff behind the curtain; if all retries fail, a gentle message ("We hit a snag — your video will be ready shortly") and a webhook fires. No stack traces. No job IDs. No factory vocabulary.
- **Locked:** Max 3 retries with backoff. Dead-letter queue after failure. Webhook to external subscribers. User sees only calm reassurance.

### 21. Content Extraction: Library-Based with Graceful Degradation
- **Proposed by:** Elon (implied in cost/complexity analysis). Endorsed by board (Condition 4: "Graceful degradation on paywalls / JS-heavy sites.")
- **Winner:** Consensus
- **Why:** URL parsing fails on paywalls, JS-heavy sites, malformed HTML. Need a clear error taxonomy that aligns with Steve's "no failure surfaces" ideal.
- **Locked:** Library-based extraction (readability / mercury-parser) with fallback to raw text scraping. Clear error taxonomy. Gentle user-facing fallback copy: "We couldn't read that page clearly. Try a public article."

---

## MVP Feature Set (What Ships in v1.0)

### Core Flow
1. **Paste URL** — Single input. No authentication gate in v1.
2. **Extract** — URL content extraction (article text) via readability/mercury with graceful degradation.
3. **Outline** — GPT-4 generates scene outline and caption timing from article.
4. **Voiceover** — OpenAI TTS generates narration. Cached by content hash.
5. **Compose** — Pre-composed vertical template (9:16). Hard cuts. Static slides + timed captions. FFmpeg mux (images + audio) OR Remotion Lambda.
6. **Deliver** — MP4 stored in R2. CDN-cached. Single holding-state UX; video appears on completion. Webhook notification fires.
7. **Guardrails** — Cost-ceiling enforcement per render. Max retry logic. Dead-letter queue.

### Infrastructure
- **Cloudflare Workers** — API layer, job submission, status polling, webhook receiver
- **Cloudflare Queue** — Job queue with clear decoupled contract
- **Cloudflare D1** — Job state, metadata, idempotency tracking, feedback-loop data
- **Cloudflare R2** — Output storage
- **Cloudflare CDN** — In front of R2 outputs
- **Render Worker** — Node-based polling worker (VPS or Lambda) consuming queue jobs
- **Cost Ceiling** — Hard per-render cap enforced in API layer
- **Accessibility** — WCAG 2.1 AA compliant frontend (aria-live, reduced-motion, keyboard nav)

### API Surface (Platform Foundation)
- `POST /api/jobs` — Submit URL for rendering (rate-limited, authenticated)
- `GET /api/jobs/:id` — Poll render status
- `POST /api/internal/complete` — Renderer callback (protected)
- `POST /api/webhooks/subscribe` — Partner webhook registration
- `GET /api/pricing` — Public tiers and usage caps

### Deliberately Excluded from v1.0
- Public gallery (v1.1 per Shonda / Board Condition 5)
- Horizontal format
- Settings panel / toggles / music picker / voice-selection menus
- Real-time preview
- Workers AI fallback
- User authentication / accounts (if not strictly required for URL→video flow)
- Payment system integration (pricing page ships; billing gate deferred)
- Watermark / end-card (deadlocked — see Open Questions)
- Template marketplace (v1.2)
- Push notifications / streaks / weekly recap emails (v1.1)
- CMS plugins (WordPress, Ghost) (v1.1)

---

## File Structure (What Gets Built)

```
clipcraft-backend/
├── src/
│   ├── api/                          # Cloudflare Worker handlers (Hono router)
│   │   ├── index.ts                  # Main entry, middleware (auth, rate limits)
│   │   ├── jobs.ts                   # POST /jobs, GET /jobs/:id
│   │   ├── pricing.ts                # GET /pricing (public tiers)
│   │   └── webhooks.ts             # POST /api/webhooks/subscribe, /api/internal/complete
│   ├── queue/
│   │   ├── types.ts                  # JobMessage: { jobId, url, format }
│   │   └── producer.ts               # Enqueue jobs to Cloudflare Queue
│   ├── db/
│   │   ├── schema.sql                # D1 tables: jobs, cache, idempotency, user_assets, feedback_log
│   │   └── jobs.ts                   # D1 queries + idempotency checks
│   ├── extract/
│   │   └── article.ts                # URL → article text (readability / mercury / raw fallback)
│   ├── ai/
│   │   ├── outline.ts                # GPT-4 → scene outline + captions
│   │   └── tts.ts                    # OpenAI TTS → audio buffer, content-hash cache
│   ├── compose/
│   │   ├── templates/                # Pre-composed 9:16 templates (vertical only)
│   │   ├── render.ts                 # Slide + caption → frame logic
│   │   └── mux.ts                    # FFmpeg or Remotion Lambda invocation
│   ├── guardrails/
│   │   ├── cost-ceiling.ts           # Per-render cost enforcement
│   │   └── retries.ts                # Exponential backoff + dead-letter logic
│   ├── platform/
│   │   ├── keys.ts                   # API key generation, rate-limit config
│   │   └── rate-limits.ts            # Token bucket / request throttling
│   └── types.ts                      # Shared TypeScript types
├── renderer/                         # Decoupled render worker (Node.js)
│   ├── index.ts                      # Poll queue, process jobs
│   ├── worker.ts                     # Job processing orchestrator
│   ├── ffmpeg.ts                     # FFmpeg muxing utilities
│   └── remotion/                     # Optional Remotion Lambda wrapper
├── migrations/                       # D1 migrations
├── wrangler.toml
├── package.json
└── README-INFRA.md                   # Manual provisioning steps (board-mandated documentation)
```

**Design tokens & frontend:** Jony Ive review demands extracted styles (`globals.css`, `theme.css`), single source of truth for tokens (`packages/ui/tokens.css`), and a `page.tsx` hierarchy. Maya Angelou review demands the metadata be cut by 40%: "Paste a story. Watch it move."

---

## Open Questions (What Still Needs Resolution)

| # | Question | Blocker Severity | Context |
|---|----------|------------------|---------|
| 1 | **Product Name: REEL vs ClipCraft** | **HIGH** | Steve: "The name is Reel." Elon: "Generic noun you cannot trademark." Demo script uses both (`Reel.shipyard.company` vs `ClipCraft` closing line). Every branded string, domain, and repo name depends on this. **Zen Master ruling required before first line of UI copy.** |
| 2 | **Watermark / End-Card CTA** | **HIGH** | Elon's #3 non-negotiable vs Steve's #2 non-negotiable. Template design and output composition cannot proceed without a ruling. Watermark = distribution; no watermark = brand purity. |
| 3 | **Render Technology: VPS vs Remotion Lambda** | **MEDIUM** | VPS is debuggable and cheap but ops-heavy and a single point of failure. Lambda is hands-off but AWS-coupled and costlier at scale. Board demands end-to-end pipeline regardless of choice. Must resolve in Session 0. |
| 4 | **Pricing & Free Tier Structure** | **MEDIUM** | Board mandates pricing page + revenue floor. Elon insists >$1/video. Is v1 invite-only? Trial-limited? Unlimited free until payment gate? Burn rate depends on this call. |
| 5 | **Voice Selection: One Voice vs Curated Set** | **LOW** | Steve: "We choose the voice, they choose the idea." Elon: "OpenAI's default voice is wrong for half of all content." Board mandates user-specific asset layer (v1.2) which implies voice prefs eventually. v1 ships one voice, but which one? |
| 6 | **Authentication: Anonymous vs Accounts** | **LOW** | v1.0 core flow may work without auth. But feedback loop, user-specific assets, gallery, streaks, and API keys all require accounts. Where is the auth gate inserted? |

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Zero deliverables; build theater continues** | **High** | **Critical** | QA Pass 1: empty directory. Retrospective: "Ship before reviewing. Reviews on nothing are vanity." **Mitigation:** Cap planning at 20 minutes. Two agent sessions max (Session 1 = API + queue + state; Session 2 = render node + Remotion pipeline). Build the artifact before the next review cycle. |
| **Board HOLD is not lifted** | **High** | **Critical** | Six conditions must be demonstrated in a working staging environment. Missing any one = continued HOLD. **Mitigation:** Build to the board conditions, not to the PRD. Use the board verdict as the acceptance criteria. |
| **Render times exceed user patience** | High | High | Even with templates + FFmpeg, a 60s video may take 2–5 min. The "Polaroid" feeling is impossible with async rendering. **Mitigation:** aggressive TTS caching, pre-composed templates, and an elegant holding state that feels like anticipation, not waiting. |
| **Single render node bottleneck** | High | High | One VPS rendering serially is a hard ceiling. If it dies, queue backs up indefinitely. **Mitigation:** monitor queue depth; design renderer to be horizontally scalable in v1.1. Have Remotion Lambda as backup plan if VPS proves brittle in first week. |
| **OpenAI TTS rate limits** | Medium | High | 100 RPM standard tier. Burst traffic creates backlog. Audio generation is the slowest pipeline stage. **Mitigation:** content-hash caching, queue backpressure, and retry with exponential backoff. |
| **Cost overrun before revenue** | Medium | High | $0.15–$0.35/video + infra. If content goes viral, burn rate spikes before pricing is implemented. **Mitigation:** Cost-ceiling enforcement per render (board-mandated). Hard daily job limit (manual kill switch) until payment gate exists. OpenAI budget alert as secondary rail. |
| **Content extraction fragility** | Medium | Medium | URL parsing fails on paywalls, JS-heavy sites, malformed HTML. **Mitigation:** library-based extraction (readability / mercury) with clear error taxonomy and gentle user-facing fallback copy. |
| **Steve's "no failure surfaces" vs reality** | Medium | Medium | Silent failures or infinite retry loops create zombie jobs, inflated costs, and user confusion. **Mitigation:** internal observability (job status in D1) even if not user-facing; max 3 retries; dead-letter queue; webhook notifications on failure (board-mandated). |
| **Naming deadlock infecting build morale** | Low | Medium | If REEL vs ClipCraft isn't resolved, Steve may reject output on branding grounds alone. The demo script already uses both names. **Mitigation:** Zen Master ruling required before first line of UI copy is written. Lock it in hour one. |
| **Cloudflare Worker bundle limits** | Low | Medium | Large dependencies (AI SDKs, parsers) may exceed Worker size limits or cold-start thresholds. **Mitigation:** tree-shake aggressively; move heavy logic (rendering, muxing) to the render node. Keep the Worker thin: route, queue, DB, cache. |
| **No competitive moat; replicable in a weekend** | High | High | Jensen: "Any teenager with a weekend and a credit card replicates this stack." Buffett: "No switching costs, no network effects." **Mitigation:** Board-mandated feedback loop + user asset layer in v1. Proprietary model fine-tuning (LoRA, voice embedding) committed as v1.2 roadmap. Ship the moat plan with the code. |
| **Economics get worse with scale** | Medium | High | Buffett: "Costs rise linearly with users. Economics get worse, not better, as we grow." **Mitigation:** Pricing >$1/video. Unit-cost model at 100/1k/10k monthly videos published before HOLD is lifted. Caching reduces marginal cost per duplicate article. |

---

## The Zen Master's Closing Word

Elon brought physics and economics. Steve brought soul and category. The board brought accountability. Margaret Hamilton brought the truth: *an empty directory is not a deliverable.*

**Build what works. Make it feel like magic. Hit the board's six conditions. The rest is noise.**

Stop naming. Start rendering.

— PJ
