# Reel (fka ClipCraft) — Build Spec

> Issue: sethshoultes/shipyard-ai#92
> Derived from PRD, locked decisions, and project rules.

---

## 1. Goals (from PRD)

Turn any blog post into a polished short-form video in a few minutes.

| Goal | Detail |
|------|--------|
| **Input** | Paste text or blog URL — no file uploads |
| **Extraction** | LLM extracts 3–5 key points from source text |
| **Voice** | Human-sounding TTS (3 curated voices, 1 pre-selected default) |
| **Design** | One vertical 9:16 template with a curated font pair — zero user customization |
| **Rendering** | Remotion on headless Chrome → 1080×1920 MP4 |
| **Output** | S3 upload → pre-signed download link |
| **Timing** | Honest estimate: "a few minutes" — no false promises |
| **Config** | Zero. One button. Then cinema. |

### What v1 Deliberately Does NOT Include
- WordPress plugin (v2 wrapper)
- Multiple export formats (TikTok, YouTube Shorts, LinkedIn)
- One-click social publishing
- Aspect-ratio choice, font selector, template gallery
- User auth, billing, admin dashboard

---

## 2. Implementation Approach (from Locked Decisions)

### 2.1 Architecture Principles
- **One runtime:** Node.js everywhere. No PHP, no WordPress hooks.
- **Zero-config first run:** One sane default that works for 80% of cases.
- **Honest timing:** Communicate 2–4 minute render time, not "60 seconds."
- **Single output format:** One vertical MP4 (1080×1920). Download link only.
- **Three curated TTS voices:** Not one, not forty. Three human-sounding options.
- **Render pipeline:** Remotion + headless Chrome for v1. If render exceeds 60s on 4-core, v2 pivots to ffmpeg compositing.
- **Queue safety:** Render jobs must not crash the server. Redis + Bull (or minimal in-memory queue if session-constrained) with a hard concurrent cap.

### 2.2 Monorepo Layout

```
reel/
├── apps/
│   └── web/                      # Next.js web service (v1 engine)
│       ├── app/
│       │   ├── page.tsx          # Landing + paste form (one button)
│       │   ├── layout.tsx        # Root layout
│       │   └── api/
│       │       ├── extract/route.ts   # LLM key-point extraction
│       │       ├── render/route.ts    # Queue render job, return job ID
│       │       └── download/route.ts  # Pre-signed S3 URL
│       ├── components/
│       │   ├── PasteForm.tsx
│       │   ├── RenderStatus.tsx  # Honest progress: "a few minutes"
│       │   └── VoiceSelector.tsx # 3 curated voices, default pre-selected
│       └── lib/
│           ├── s3.ts             # S3-compatible storage abstraction
│           ├── queue.ts          # Bull or in-memory job queue
│           └── tts.ts            # ElevenLabs / OpenAI TTS abstraction
├── packages/
│   └── remotion/                 # Remotion composition + template
│       ├── src/
│       │   ├── compositions/
│       │   │   └── ReelVertical.tsx   # ONE 9:16 template
│       │   ├── components/
│       │   │   ├── TitleCard.tsx
│       │   │   ├── BulletReveal.tsx   # 3-5 key points, timed to audio
│       │   │   └── OutroCard.tsx
│       │   └── fonts/            # Curated font pair (loaded once)
│       ├── render.ts             # Server-side render entrypoint
│       ├── package.json
│       └── tsconfig.json
├── infra/
│   └── docker-compose.yml        # App + Redis (queue) + Remotion renderer
├── package.json                  # Workspace root
└── README.md                     # Build + deploy instructions
```

### 2.3 Key API & Component Contracts

| Layer | Contract |
|-------|----------|
| **Extract API** | Accepts `{ text: string }` or `{ url: string }`. Returns `{ keyPoints: string[], title?: string }` in ~5s. |
| **Render API** | Accepts `{ keyPoints: string[], voiceId: string, title?: string }`. Returns `{ jobId: string }`. Queues job. |
| **Download API** | Accepts `?jobId=string`. Returns `{ url: string \| null, status: 'pending' \| 'done' \| 'failed' }`. |
| **TTS** | `tts(text, voiceId) → Promise<Buffer \| URL>`. Swappable provider. ElevenLabs default. Three `voice_id` mappings. |
| **Queue** | `queue.add(jobData)` → job ID. Max concurrent capped to `floor(RAM_GB / 1)`. No unbounded concurrency. |
| **S3** | `upload(buffer, key) → Promise<string>` (pre-signed URL). MinIO for local, AWS for prod. |
| **Remotion Composition** | `ReelVertical` at 1080×1920, 30fps. Duration derived from TTS audio length + bullet stagger. |
| **BulletReveal** | Props: `items: string[], audioDurationSeconds: number`. Staggers text reveals across the audio timeline. |

---

## 3. Verification Criteria

### 3.1 Structural Verification

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V1 | Monorepo directories exist | `test -d reel/apps/web && test -d reel/packages/remotion && test -d reel/infra` |
| V2 | All planned files are present | Run `tests/test_file_structure.sh` — exits 0 |
| V3 | Only one Remotion composition | `ls reel/packages/remotion/src/compositions/*.tsx | wc -l` equals `1` |
| V4 | Font directory is non-empty | `ls reel/packages/remotion/src/fonts/ | wc -l` is ≥ 2 |

### 3.2 Behavioral Verification

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V5 | Next.js app boots | `cd reel/apps/web && npm install && npm run build` exits 0 |
| V6 | Landing page renders paste form | `curl -s http://localhost:3000 | grep -qi "paste\|text\|url"` |
| V7 | Extract API returns key points | POST sample text to `/api/extract`, response JSON contains `keyPoints` array with 3–5 items |
| V8 | Render API returns job ID | POST to `/api/render`, response JSON contains `jobId` string |
| V9 | Download API returns status | GET `/api/download?jobId=xxx`, response JSON contains `status` field |
| V10 | TTS abstraction accepts 3 voices | `grep -c 'voice_id\|voiceId' reel/apps/web/lib/tts.ts` ≥ 3 |
| V11 | Queue has concurrency cap | `grep -q 'concurrency\|max.*render\| Bull' reel/apps/web/lib/queue.ts` |
| V12 | Remotion composition is 1080×1920 | `grep -q '1080.*1920\|1920.*1080' reel/packages/remotion/src/compositions/ReelVertical.tsx` |
| V13 | Docker Compose includes Redis | `grep -qi 'redis' reel/infra/docker-compose.yml` |

### 3.3 Constraint Verification (v1 Guardrails)

| # | Criterion | How to Prove |
|---|-----------|--------------|
| V14 | No WordPress references in v1 web service | `grep -ri 'wordpress' reel/apps/web/` returns empty |
| V15 | No "60 seconds" promise in UI copy | `grep -ri '60 seconds' reel/apps/web/components/` returns empty |
| V16 | No social platform export code | `grep -ri 'tiktok\|linkedin.*publish\|youtube.*shorts.*upload' reel/apps/` returns empty |
| V17 | No auth or billing code | `grep -ri 'stripe\|auth\|login\|billing' reel/apps/web/` returns empty |
| V18 | RenderStatus says "a few minutes" | `grep -q 'a few minutes' reel/apps/web/components/RenderStatus.tsx` |

---

## 4. Files to Create or Modify

### 4.1 New Directories

- `reel/`
- `reel/apps/`
- `reel/apps/web/`
- `reel/apps/web/app/`
- `reel/apps/web/app/api/`
- `reel/apps/web/app/api/extract/`
- `reel/apps/web/app/api/render/`
- `reel/apps/web/app/api/download/`
- `reel/apps/web/components/`
- `reel/apps/web/lib/`
- `reel/packages/`
- `reel/packages/remotion/`
- `reel/packages/remotion/src/`
- `reel/packages/remotion/src/compositions/`
- `reel/packages/remotion/src/components/`
- `reel/packages/remotion/src/fonts/`
- `reel/infra/`

### 4.2 New Files

| Path | Purpose |
|------|---------|
| `reel/package.json` | Workspace root — declares `apps/*` and `packages/*` workspaces |
| `reel/README.md` | Build instructions, env vars, deploy notes |
| `reel/apps/web/package.json` | Next.js + React + TypeScript dependencies |
| `reel/apps/web/next.config.js` (or `.mjs`) | Next.js configuration |
| `reel/apps/web/app/layout.tsx` | Root layout |
| `reel/apps/web/app/page.tsx` | Landing page with PasteForm |
| `reel/apps/web/app/api/extract/route.ts` | LLM key-point extraction endpoint |
| `reel/apps/web/app/api/render/route.ts` | Render job queue endpoint |
| `reel/apps/web/app/api/download/route.ts` | Pre-signed S3 URL endpoint |
| `reel/apps/web/components/PasteForm.tsx` | Text/URL input + submit button |
| `reel/apps/web/components/RenderStatus.tsx` | Progress + honest timing message |
| `reel/apps/web/components/VoiceSelector.tsx` | 3 curated voice radio/select |
| `reel/apps/web/lib/s3.ts` | S3-compatible upload + pre-signed URL utility |
| `reel/apps/web/lib/queue.ts` | Job queue wrapper (Bull or in-memory) |
| `reel/apps/web/lib/tts.ts` | TTS provider abstraction with 3 voice mappings |
| `reel/packages/remotion/package.json` | Remotion + React dependencies |
| `reel/packages/remotion/tsconfig.json` | TypeScript config for package |
| `reel/packages/remotion/src/compositions/ReelVertical.tsx` | One 9:16 Remotion composition |
| `reel/packages/remotion/src/components/TitleCard.tsx` | Opening title card |
| `reel/packages/remotion/src/components/BulletReveal.tsx` | Timed bullet reveal component |
| `reel/packages/remotion/src/components/OutroCard.tsx` | Closing card |
| `reel/packages/remotion/src/fonts/` | Curated font files / CSS |
| `reel/packages/remotion/render.ts` | Server-side Remotion render entrypoint |
| `reel/infra/docker-compose.yml` | App + Redis + Remotion renderer services |

### 4.3 No Files Modified (Greenfield Build)

This is a net-new project under `reel/`. No existing repo files are modified.
