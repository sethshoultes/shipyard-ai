# Aria — Locked Decisions

> Consolidated by the Zen Master. Elon brought physics. Steve brought soul. Both are necessary; neither is sufficient alone.

---

## 1. Decisions by Debate

### Product Name: Aria
- **Proposed by:** Steve (Round 1)
- **Winner:** Steve
- **Why:** Elon conceded in Round 2: "That's the best thing in your brief." The specification name "Changelog Theatre" is retired.

### Architecture: Workers API + Decoupled Queue + External Renderer
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Steve conceded in Round 2: "Workers cannot render MP4s. Physics wins." The API, queue, and state live on Cloudflare Workers. The renderer is a separate service.

### Renderer Target: Non-Worker Component (Fly.io VPS or Remotion Lambda)
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Physical necessity. Workers are V8 isolates—no Chrome, no FFmpeg. One $5–20/mo Node instance (or Lambda) handles Remotion + Puppeteer + FFmpeg.

### Output Format: Real MP4 File
- **Proposed by:** Elon (Round 2)
- **Winner:** Elon
- **Why:** Steve wants cinema; a file that can be downloaded, shared, and embedded is cinema. "A video that can't travel is a diary entry." Elon's non-negotiable stands.

### Queue Interface
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Steve accepted clean interfaces in Round 2. Queue message: `{ jobId, repo, since, until }`. Renderer posts back to `POST /api/internal/complete` with `{ outputUrl }`. Decoupled so renderer can swap from VPS to Lambda without touching API code.

### No Celebrity Voice Clone / Use OpenAI TTS (alloy, echo, onyx)
- **Proposed by:** Elon (Round 1 / Round 2)
- **Winner:** Elon
- **Why:** Steve conceded: "We do not need a celebrity voice clone." Legal liability and technical impossibility. OpenAI's actual voices are the boundary.

### Voice + Score Are Non-Cuttable Core
- **Proposed by:** Steve (Round 1 / Round 2)
- **Winner:** Steve
- **Why:** Elon agrees the emotional hook is everything. Without narration and music, this is a utility, not a product. Both accept that a directed OpenAI voice + simple score meets the emotional requirement without licensing fantasy.

### Single-Button Happy Path
- **Proposed by:** Steve (Round 1)
- **Winner:** Steve
- **Why:** Elon agrees it's correct for the 80% case. Sacred minimalism: paste repo, press button, curtain drops. No settings panels, no config.

### No D1 Database / R2 for Job State
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Overkill for v1. JSON blob in R2 keyed by `jobId`. Steve did not contest.

### Scene Complexity: 3 Scenes for v1
- **Proposed by:** Elon (Round 1)
- **Winner:** Zen Master adjudication
- **Why:** Steve wants full cinema; Elon wants scope control. Compromise: v1 is exactly three scenes — Title Card, Commit Narrative, Outro. Text on curated backgrounds. No custom animation engine. Cinematic through typography + pacing + voice + score, not through motion graphics.

### Free Render Caps + Paid Tier
- **Proposed by:** Elon (Round 1 / Round 2)
- **Winner:** Elon
- **Why:** Steve conceded on burn: "Free cannot mean infinite." Standard tier: 3 free renders/day. Paid tier unlocks more. TTS + GPT-4 + render ≈ $0.15–$0.50/minute per video.

### Distribution: Public Gallery (Organic)
- **Proposed by:** Elon (Round 1) / Rejected bots by Steve (Round 2)
- **Winner:** Zen Master adjudication
- **Why:** Elon is right that a product nobody sees is a hobby. Steve is right that watermarks and reply bots are graffiti. Compromise: public gallery indexed by repo name for SEO and sharing. No auto-tweet bots. No reply bots. No visual watermarks. End card says "Made by Aria" — part of the film, not a stamp.

### Waiting Experience: Progress Indicator Framed as Curtain Rising
- **Proposed by:** Elon (Round 2) / Rejected by Steve (Round 2)
- **Winner:** Zen Master adjudication
- **Why:** 6–12 minutes of wall time is physical reality. A black screen with "The curtain rises..." and a slow, minimal progress indicator is honest without breaking the spell. Steve's "no preview" is user-hostile at these render times.

---

## 2. MVP Feature Set (What Ships in v1)

**Core Experience**
- Paste a GitHub repository URL
- One button triggers generation
- Black-screen "curtain rising" waiting experience with honest progress
- ~60-second MP4 delivered with download link

**Content Pipeline**
- GitHub API: fetch commits in date range (default: last 7 days)
- GPT-4: generate dramatic narrative script from commit messages
- OpenAI TTS: generate narration audio (alloy/echo/onyx, directed with weight/cadence)
- Simple ambient music bed (licensed or generated loop, not silence)

**Video Composition**
- 3 scenes rendered via Remotion + Puppeteer + FFmpeg:
  1. **Title Card:** Repo name as film title, black background, single shaft of light (subtle gradient)
  2. **Commit Narrative:** Narrated summary of the week's commits as cinematic text overlays
  3. **Outro:** "That was you. That mattered." + "Made by Aria" end card
- Vertical 9:16 format (mobile-first)

**Infrastructure**
- Cloudflare Workers: API routes, queue, polling, state storage (R2)
- Fly.io VPS (or Remotion Lambda): queue consumer, browser rendering, MP4 export
- Public gallery page: browse rendered videos by repo name

**Constraints**
- No settings panel
- No voice selector (OpenAI voices only, directed by script)
- No commit hashes on screen
- No preview-before-render mode
- No D1 database
- No custom animation engine

---

## 3. File Structure (What Gets Built)

```
aria/
├── packages/
│   ├── api/                          # Cloudflare Workers
│   │   ├── src/
│   │   │   ├── index.ts              # Hono app, CORS, route mount
│   │   │   ├── routes/
│   │   │   │   ├── jobs.ts           # POST /api/jobs
│   │   │   │   ├── poll.ts           # GET /api/jobs/:id
│   │   │   │   └── gallery.ts        # GET /api/gallery
│   │   │   ├── services/
│   │   │   │   ├── github.ts         # GitHub API client
│   │   │   │   ├── narrative.ts      # GPT-4 script generation
│   │   │   │   ├── tts.ts            # OpenAI TTS client
│   │   │   │   ├── queue.ts          # Cloudflare Queue producer
│   │   │   │   └── storage.ts        # R2 read/write
│   │   │   └── types.ts              # Job, QueueMessage, RenderResult
│   │   ├── wrangler.toml
│   │   └── package.json
│   │
│   ├── renderer/                     # Fly.io VPS (Node.js)
│   │   ├── src/
│   │   │   ├── index.ts              # Queue consumer loop
│   │   │   ├── render.ts             # Remotion render + FFmpeg
│   │   │   ├── api.ts                # POST /api/internal/complete
│   │   │   └── env.ts                # Config validation
│   │   ├── remotion/
│   │   │   ├── index.ts              # Register compositions
│   │   │   ├── Video.tsx             # Root 3-scene sequence
│   │   │   ├── scenes/
│   │   │   │   ├── TitleCard.tsx
│   │   │   │   ├── CommitList.tsx
│   │   │   │   └── Outro.tsx
│   │   │   └── styles/
│   │   │       └── theme.ts          # Typography, colors, pacing
│   │   ├── public/
│   │   │   └── music-bed.mp3         # Licensed/generated ambient loop
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── web/                          # Static site (Cloudflare Pages)
│       ├── index.html
│       ├── src/
│       │   ├── main.ts               # One-button app, polling logic
│       │   └── style.css             # Black screen, minimal UI
│       └── package.json
│
├── decisions.md                      # This document
└── package.json                      # Workspace root
```

Total: **~20 files** across 3 packages. The 10-file PRD mandate is recognized as bureaucratic padding and ignored. The actual problem requires separation of concerns (API / renderer / web).

---

## 4. Open Questions (What Still Needs Resolution)

1. **Render target: Fly.io VPS vs. Remotion Lambda**
   - Fly.io is cheaper and keeps us AWS-free per constraints, but requires Docker + server maintenance.
   - Remotion Lambda is faster to set up but violates "NO AWS" constraint and has cold-start costs.
   - **Decision needed before build starts.**

2. **Music source**
   - Licensed royalty-free ambient track (legal safe, static file)?
   - AI-generated music (brand-ownable, risk of generic output)?
   - **Decision needed before asset collection.**

3. **Gallery scope**
   - Is it a separate static page or part of the web app?
   - Do we store metadata (repo, date, views) or just video URLs?
   - **Decision needed during web build.**

4. **Date range logic**
   - Default last 7 days is accepted, but what if repo has < 3 commits in range?
   - Fallback: expand range, or render "no commits found" screen?
   - **Decision needed during API build.**

5. **Rate limiting / abuse**
   - 3 free renders/day per IP? Per GitHub user? Per email?
   - How do we track the cap without D1?
   - **Decision needed during API build.**

6. **Vertical 9:16 vs. horizontal 16:9**
   - 9:16 is mobile-native but GitHub repos are code (horizontal thinking).
   - Steve wants cinema; cinema is horizontal. But social distribution is vertical.
   - **Decision needed before Remotion composition is built.**

---

## 5. Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Render time kills UX** | High | High | Queue + honest progress UI. Consider async delivery (email/notification) if render exceeds 10 min. |
| **Single render node chokes** | High | High | Queue depth monitoring. Hard cap concurrent renders at 2. Plan for horizontal scaling (more VPS instances) in v2. |
| **OpenAI TTS rate limits** | Medium | High | 100 RPM standard tier. Cache TTS by script hash. Queue handles backpressure. |
| **OpenAI cost burn** | Medium | High | 3 free renders/day cap. GPT-4 narrative capped at 150 tokens. Paid tier required for survival at >100 videos/day. |
| **Remotion + Puppeteer fragility** | Medium | High | Puppeteer is brittle. Pin Chrome + Remotion versions. Build health-check endpoint on renderer. |
| **GitHub API rate limits** | Low | Medium | Cache commit fetches. Most repos fit in single unauthenticated request; auth token for larger repos. |
| **Music licensing strike** | Low | High | Use royalty-free or AI-generated tracks only. No mainstream music. No Hans Zimmer. |
| **No distribution = ghost town** | Medium | High | Public gallery is built-in, not bolted-on. Gallery indexed by repo name for SEO. Every shareable MP4 is organic distribution. |
| **Scope creep to ClipCraft fate** | High | Critical | 3 scenes only. No animation engine. No preview mode. No settings panel. This is the wall. |

---

## Zen Master's Closing Note

Elon brought physics. Steve brought soul. Both are necessary; neither is sufficient alone. Aria ships as a real MP4 with a real voice and a real score — but it ships through a queue, on a VPS, with honest progress, and a tight scope. We do not LARP about render pipelines. We do not strip the cinema until it is a PowerPoint. We build the factory that makes the cathedral, then we make the cathedral beautiful.

The build phase begins now. No more debate. Execute.
