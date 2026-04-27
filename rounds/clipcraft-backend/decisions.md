# ClipCraft Backend — Locked Decisions
*Consolidated by the Zen Master, Great Minds Agency*

> "The strength of the team is each individual member. The strength of each member is the team."
>
> — Phil Jackson

---

## Decisions Log

### 1. Render Architecture: Cloudflare Workers + Decoupled Render Node
- **Proposed by:** Elon (Round 1)
- **Conceded by:** Steve (Round 2: "Elon's right about Cloudflare Workers. You can't bend physics.")
- **Winner:** Elon
- **Why:** Cloudflare Workers run V8 isolates — no Chrome, no Node, no FFmpeg. Video rendering inside a Worker violates physics. Workers handle API + queue + state. The renderer lives on a decoupled Node machine (Hetzner CX21 / Fly.io) or Remotion Lambda. Steve conceded the architecture but demanded the node remain invisible infrastructure, never product.
- **Locked:** Queue message contract: `{ jobId, url, format }`. Renderer posts back to `POST /api/internal/complete`. Decouple so the renderer can be rewritten without touching the API.

### 2. Video Format: Vertical Only (9:16)
- **Proposed by:** Elon (Round 1: "Pick vertical"). Endorsed by Steve (Round 2: "One format, zero settings. Vertical only. No toggles.")
- **Winner:** Consensus
- **Why:** Steve rejected Elon's "intelligent auto-detection" as adding an ML dependency. Both agreed: pick one format, be done. Short-form content defaults to vertical. No toggles, no settings panel, no "horizontal vs vertical" dimension to test.
- **Locked:** Vertical 9:16. Zero configuration.

### 3. Zero User Configuration at Point of Creation
- **Proposed by:** Steve (Round 1). Endorsed by Elon (Round 2: "Where Steve Is Right — One format, zero settings.")
- **Winner:** Steve
- **Why:** The user pastes a URL and receives a finished film. Every toggle is a confession that our taste failed. No music picker. No pacing slider. No orientation toggle. No retry button. No settings panels.
- **Locked:** Paste URL → receive movie. Three taps or fewer.

### 4. Rendering Model: Async-Only, No Fake Real-Time Preview
- **Proposed by:** Elon (Round 1, Round 2). Partially conceded by Steve (Round 2: "Conceding the render architecture, not the experience.")
- **Winner:** Elon
- **Why:** A 60-second 1080p clip is ~1,800 frames. Puppeteer at 5 fps = 6 minutes. The 90-second SLA is fantasy for v1. Steve's "Polaroid blooming in your palm" real-time preview is theater, not product, without pre-rendering the entire internet. v1 ships async.
- **Locked:** No fake real-time preview. Sub-60s render target achieved via pre-composed templates, hard cuts, static slides + timed captions, FFmpeg muxing (images + audio), or Remotion Lambda with concurrency. Aggressive caching cheats the wait.

### 5. Job State UX: Honest Wait, Invisible Machinery
- **Proposed by:** Both (deadlock). Steve: "No user-facing job state." Elon: "Async rendering with honest status."
- **Winner:** Zen Master synthesis
- **Why:** Elon is right that hiding failures is gaslighting. Steve is right that progress bars kill magic. The synthesis honors both truths.
- **Locked:** Users see a single elegant holding state — "Creating your film..." with an ambient animation. No percentages. No queue depths. No job IDs. No technical vocabulary. When complete, the video appears like a gift. On failure, gentle copy and automatic retry behind the curtain. No factory aesthetics; no silent failures.

### 6. Brand Voice & Emotional Hook
- **Proposed by:** Steve (Round 1). Endorsed by Elon (Round 2: "Where Steve Is Right — Brand voice... The user should feel creative, not like they scheduled a cron job.")
- **Winner:** Steve
- **Why:** The product takes dead text and breathes life into it. "Content repurposing" signals a utility for marketers. Feeling *creative* changes categories. Category changes are how you win.
- **Locked:** Short sentences. Confident friend. No jargon. No exclamation-point desperation. We speak like we handed them the keys to a sports car. The user feels like they performed magic, not IT. Output makes them feel *creative*, not productive.

### 7. Caching Strategy: TTS + CDN
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** OpenAI TTS rate limits (100 RPM standard tier) and audio generation is slower than video composition. Egress costs spike if users download raw MP4s repeatedly.
- **Locked:** Cache TTS output per article content hash. CDN cache layer in front of R2 outputs. D1 handles writes; queue handles backpressure.

### 8. Idempotency Window
- **Proposed by:** Elon (Round 1: "6 hours is enough to prevent accidental double-clicks")
- **Winner:** Elon
- **Why:** 24 hours is arbitrary. 6 hours prevents double-clicks without maintaining ghost state overnight.
- **Locked:** 6-hour idempotency window.

### 9. Cost Guardrails
- **Proposed by:** Elon (Round 1: "Over-engineering. Set an OpenAI budget alert. Move on.")
- **Winner:** Elon
- **Why:** Automatic cost-ceiling guardrails are reliability theater in v1. The margin is thin ($0.15–$0.35 per 60s video at cost), but pricing models are pre-revenue.
- **Locked:** No automatic cost ceiling guardrails. OpenAI budget alert only.

### 10. Workers AI Fallback
- **Proposed by:** Elon (Round 1: "YAGNI. OpenAI's uptime is fine")
- **Winner:** Elon
- **Why:** Premature reliability theater. One fallback system doubles the test surface.
- **Locked:** Cut. No Workers AI fallback in v1.

### 11. Public Gallery
- **Proposed by:** Elon (Round 1). Cut by Elon in same round ("Nice-to-have masquerading as v1")
- **Winner:** Elon
- **Why:** Distribution is critical, but a gallery is over-engineering for v1. Watermark/end-card was proposed as cheaper distribution, but that decision deadlocked.
- **Locked:** Not in v1.

### 12. Render Worker Technology
- **Proposed by:** Elon (Round 1: Hetzner VPS or Remotion Lambda)
- **Winner:** Open (Elon proposed both; no concession or selection)
- **Why:** VPS ($5.35/mo) is debuggable and cheap but is a single point of failure. Remotion Lambda is boring, reliable, and pennies per render but AWS-locked and scales cost with usage. Steve conceded the render node exists but did not choose the implementation.

### 13. Product Name
- **Proposed by:** Steve (Round 1: "FLINT"). Rejected by Elon (Round 2: "FLINT before Flint exists... classic bikeshedding")
- **Winner:** Open
- **Why:** Steve insists a one-syllable proper noun you can verb is category-defining. Elon insists the name is a variable and the architecture is the constant. No resolution. No branding, domain, or repo naming can proceed without this call.

### 14. Distribution Mechanics: Watermark & End-Card CTA
- **Proposed by:** Elon (Round 2: non-negotiable). Rejected by Steve (Round 2: non-negotiable)
- **Winner:** Deadlock
- **Why:** Elon says every video must distribute the product; distribution *is* the product. Steve says people don't share billboards — graffiti on their art kills dignity and shareability. Both listed this in their Top 3 Non-Negotiables. No synthesis possible without executive override.

---

## MVP Feature Set (What Ships in v1)

### Core Flow
1. **Paste URL** — Single input. No authentication gate in v1.
2. **Extract** — URL content extraction (article text). Graceful degradation on paywalls / JS-heavy sites.
3. **Outline** — GPT-4 generates scene outline and caption timing from article.
4. **Voiceover** — OpenAI TTS generates narration. Cached by content hash.
5. **Compose** — Pre-composed vertical template (9:16). Hard cuts. Static slides + timed captions. FFmpeg mux (images + audio) OR Remotion Lambda.
6. **Deliver** — MP4 stored in R2. CDN-cached. Single holding-state UX; video appears on completion.

### Infrastructure
- **Cloudflare Workers** — API layer, job submission, status polling, webhook receiver
- **Cloudflare Queue** — Job queue with clear decoupled contract
- **Cloudflare D1** — Job state, metadata, idempotency tracking
- **Cloudflare R2** — Output storage
- **Cloudflare CDN** — In front of R2 outputs
- **Render Worker** — Node-based polling worker (VPS or Lambda) consuming queue jobs

### Deliberately Excluded from v1
- Public gallery
- Horizontal format
- Settings panel / toggles / music picker
- Real-time preview
- Workers AI fallback
- Automatic cost guardrails
- User authentication / accounts (if not strictly required for URL→video flow)
- Payment system (pricing model deferred)
- Watermark / end-card (deadlocked — see Open Questions)

---

## File Structure (What Gets Built)

```
clipcraft-backend/
├── src/
│   ├── api/                          # Cloudflare Worker handlers
│   │   ├── index.ts                  # Hono router / main entry
│   │   ├── jobs.ts                   # POST /jobs, GET /jobs/:id
│   │   └── webhooks.ts             # POST /api/internal/complete
│   ├── queue/
│   │   ├── types.ts                  # JobMessage: { jobId, url, format }
│   │   └── producer.ts               # Enqueue jobs to Cloudflare Queue
│   ├── db/
│   │   ├── schema.sql                # D1 tables: jobs, cache, idempotency
│   │   └── jobs.ts                   # D1 queries
│   ├── extract/
│   │   └── article.ts                # URL → article text (readability / mercury)
│   ├── ai/
│   │   ├── outline.ts                # GPT-4 → scene outline + captions
│   │   └── tts.ts                    # OpenAI TTS → audio buffer
│   ├── compose/
│   │   ├── templates/                # Pre-composed 9:16 templates
│   │   ├── render.ts                 # Slide + caption → frame logic
│   │   └── mux.ts                    # FFmpeg or Remotion Lambda invocation
│   └── types.ts                      # Shared TypeScript types
├── renderer/                         # Decoupled render worker (Node.js)
│   ├── index.ts                      # Poll queue, process jobs
│   ├── worker.ts                     # Job processing orchestrator
│   ├── ffmpeg.ts                     # FFmpeg muxing utilities
│   └── remotion/                     # Optional Remotion Lambda wrapper
├── migrations/                       # D1 migrations
├── wrangler.toml
├── package.json
└── README.md
```

---

## Open Questions (What Still Needs Resolution)

| # | Question | Blocker Severity | Context |
|---|----------|------------------|---------|
| 1 | **Product Name: FLINT vs ClipCraft** | HIGH | Steve says FLINT is category-defining. Elon says it's bikeshedding. Every branded string, domain, and repo name depends on this. |
| 2 | **Watermark / End-Card CTA** | HIGH | Elon's #3 non-negotiable vs Steve's #2 non-negotiable. Template design and output composition cannot proceed without a ruling. |
| 3 | **Render Technology: VPS vs Remotion Lambda** | MEDIUM | Elon proposed both. VPS is cheaper but ops-heavy and single-point-of-failure. Lambda is hands-off but AWS-coupled and costlier at scale. Infrastructure provisioning blocked. |
| 4 | **Error Handling: Silent Retry vs User Notification** | MEDIUM | Steve wants no failure surfaces. Elon wants honest status. If OpenAI rate-limits or Puppeteer segfaults, do we auto-retry silently or surface a gentle message? UX copy and retry logic depend on this. |
| 5 | **Pricing & Free Tier** | MEDIUM | Elon calculated $0.15–$0.35 cost per 60s video, insists price must be >$1/video. No payment system is in v1 scope. Is v1 invite-only? Trial-limited? Unlimited free? Burn rate depends on this call. |
| 6 | **Content Extraction Strategy** | LOW | How do we handle paywalls, SPA-rendered sites, and malformed HTML? Need a fallback or error taxonomy that aligns with Steve's "no failure surfaces" ideal. |

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Render times exceed user patience** | High | High | Even with templates + FFmpeg, a 60s video may take 2–5 min. The "Polaroid" feeling is impossible with async rendering. Mitigation: aggressive TTS caching, pre-composed templates, and an elegant holding state that feels like anticipation, not waiting. |
| **Single render node bottleneck** | High | High | One VPS rendering serially is a hard ceiling. If it dies, queue backs up indefinitely. Mitigation: monitor queue depth; design renderer to be horizontally scalable in v1.1. Consider Remotion Lambda if VPS proves brittle in first week. |
| **OpenAI TTS rate limits** | Medium | High | 100 RPM standard tier. Burst traffic creates backlog. Audio generation is the slowest pipeline stage. Mitigation: content-hash caching, queue backpressure, and retry with exponential backoff. |
| **Cost overrun before revenue** | Medium | High | $0.15–$0.35/video + infra. If content goes viral, burn rate spikes before pricing is implemented. Mitigation: OpenAI budget alerts; hard daily job limit (manual kill switch) until payment gate exists. |
| **Content extraction fragility** | Medium | Medium | URL parsing fails on paywalls, JS-heavy sites, malformed HTML. Mitigation: library-based extraction (readability / mercury) with clear error taxonomy and gentle user-facing fallback copy. |
| **Steve's "no failure surfaces" vs reality** | Medium | Medium | Silent failures or infinite retry loops create zombie jobs, inflated costs, and user confusion. Mitigation: internal observability (job status in D1) even if not user-facing; max retry limits; dead-letter queue. |
| **Naming deadlock infecting build morale** | Low | Low | If FLINT vs ClipCraft isn't resolved, Steve may reject output on branding grounds alone. Mitigation: Zen Master ruling required before first line of UI copy is written. |
| **Cloudflare Worker bundle limits** | Low | Medium | Large dependencies (AI SDKs, parsers) may exceed Worker size limits or cold-start thresholds. Mitigation: tree-shake aggressively; move heavy logic to the render node. |

---

## The Zen Master's Closing Word

Elon brought physics and economics. Steve brought soul and category. Both are right where it matters and wrong where it costs us speed.

Build what works. Make it feel like magic. The rest is noise.

— PJ
