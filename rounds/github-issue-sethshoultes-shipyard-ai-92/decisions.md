# Reel — Locked Decisions

> *"The strength of the team is each individual member. The strength of each member is the team."*
> Consolidated by Phil Jackson, Zen Master. This document is the single source of truth for the build phase.

---

## 1. Locked Decisions

### 1.1 V1 is a web service, not a WordPress plugin
| | |
|:---|:---|
| **Proposed by** | Elon |
| **Winner** | **Elon** |
| **Why** | Steve explicitly conceded: "The web form pipeline is the right v1 technical scope. Build the core engine first." Elon's survival-probability argument prevailed: one runtime (Node.js), one deployment target, zero hosting-configuration support tickets. The WordPress plugin is a v2 wrapper, not v1 scope. |

### 1.2 Product name is **Reel**
| | |
|:---|:---|
| **Proposed by** | Steve |
| **Winner** | **Steve** |
| "ClipCraft" is dead. Steve made this non-negotiable: "The product dies with a bargain-bin name." Elon dismissed the debate as premature but did not block it ("call it whatever you want for the v1 web form"). The name is foundational to the brand thesis: one word, two syllables, film and attraction in a single breath. |

### 1.3 Zero-config first-run experience
| | |
|:---|:---|
| **Proposed by** | Steve |
| **Winner** | **Steve** |
| **Why** | Elon conceded: "First-run experience matters." The implementation path is **one sane default** that works for 80% of cases. The user pastes text and witnesses motion, voice, and rhythm. No onboarding wizard. No aspect-ratio selectors. No settings panels. One button, then cinema. Configuration is earned in v2, not offered in v1. |

### 1.4 Honest timing: "a few minutes," not "60 seconds"
| | |
|:---|:---|
| **Proposed by** | Elon |
| **Winner** | **Elon** |
| **Why** | Steve explicitly conceded: "'60 seconds' is fiction. A 2–4 minute realistic render time is honest, and honesty in the product is part of the brand." Trust is the first feature. We do not lie to users about physics. |

### 1.5 Curated design defaults — fonts and template
| | |
|:---|:---|
| **Proposed by** | Steve |
| **Winner** | **Steve** |
| **Why** | Elon conceded: "Default design quality matters." The path is one great font pair, one great voice, one great template. Users do not choose fonts; the product chooses for them. This is not paternalism — it is respect for the user's time. The design thesis stands: taste is the feature, but expressed through disciplined minimalism at v1. |

### 1.6 Single output format: one vertical MP4
| | |
|:---|:---|
| **Proposed by** | Elon |
| **Winner** | **Elon (by alignment)** |
| **Why** | Steve's own non-negotiables included "NO to exporting to seventeen platforms." Both sides agree: v1 ships one perfect format (9:16 vertical, 1080×1920). Download link only. Social publishing integrations are v3. |

### 1.7 Three curated TTS voices
| | |
|:---|:---|
| **Proposed by** | Steve |
| **Winner** | **Steve (adjudicated deadlock)** |
| **Why** | This was the single genuine deadlock. Elon made "one voice" a non-negotiable. Steve made "three voices" a non-negotiable. **The Zen Master rules for Steve** on these grounds: (a) the engineering cost is trivial — a `voice_id` parameter swap, not weeks of architecture, (b) three voices delivers the "authorship" emotional win that is central to the product thesis, (c) Elon's deeper concern was scope bloat, and three voices does not expand the hard surface area. We ship three human-sounding voices. Not forty. Three. |

### 1.8 Render pipeline: Remotion for v1, with ffmpeg/compositing as the v2 scaling path
| | |
|:---|:---|
| **Proposed by** | Elon (with Steve's scaling concession) |
| **Winner** | **Elon (with Steve's grace)** |
| **Why** | Steve conceded: "Scaling is real. Remotion on headless Chrome doesn't scale linearly. We need queue architecture, render farms, or ffmpeg compositing by v2. I'll take the engineering hit here." V1 validates the magic with Remotion + headless Chrome. If a 30-second video render exceeds 60 seconds on standard 4-core compute, the architecture changes to ffmpeg compositing per Elon's non-negotiable. Total pipeline time is honestly communicated as "a few minutes." |

---

## 2. MVP Feature Set (What Ships in v1)

The smallest system that can deliver the first-run magic:

| Feature | Detail |
|:---|:---|
| **Input** | Paste text or blog URL. No file uploads. |
| **Extraction** | LLM prompt extracts 3–5 key points from the source text. ~5s, ~$0.001. |
| **Voice** | 3 curated TTS voices (human-sounding, not robotic). One pre-selected default. |
| **Design** | One vertical (9:16) template. Curated font pair. No user customization. |
| **Rendering** | Remotion pipeline on headless Chrome. 1080×1920 MP4. |
| **Output** | S3 upload → pre-signed download link. No social publishing. |
| **Timing** | Honest estimate: "a few minutes." No false promises. |
| **Config** | Zero. One button. Then cinema. |

**What is NOT in v1:** WordPress plugin, multiple export formats (TikTok, YouTube, LinkedIn), one-click social publishing, aspect ratio choice, font selector, template gallery, user auth, billing, admin dashboard.

---

## 3. File Structure (What Gets Built)

```
reel/
├── apps/
│   └── web/                      # Next.js web service (v1 engine)
│       ├── app/
│       │   ├── page.tsx          # Landing + paste form (one button)
│       │   └── api/
│       │       ├── extract/      # LLM key-point extraction
│       │       ├── render/       # Queue render job, return job ID
│       │       └── download/     # Pre-signed S3 URL
│       ├── components/
│       │   ├── PasteForm.tsx
│       │   ├── RenderStatus.tsx  # Honest progress: "a few minutes"
│       │   └── VoiceSelector.tsx # 3 curated voices, default pre-selected
│       └── lib/
│           ├── s3.ts
│           ├── queue.ts          # In-memory or Bull queue for v1
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
│       └── render.ts             # Server-side render entrypoint
├── infra/
│   └── docker-compose.yml        # App + Redis (queue) + Remotion renderer
└── README.md                     # Build + deploy instructions
```

**Key architectural choices:**
- **One runtime:** Node.js everywhere. No PHP, no WordPress hooks.
- **Queue:** Redis + Bull (or minimal in-memory queue if session-constrained). Render jobs must not crash the server.
- **Storage:** S3-compatible (MinIO for local, AWS for prod).
- **TTS abstraction:** Swappable provider. ElevenLabs default. Three `voice_id`s mapped to human-readable labels.

---

## 4. Open Questions (What Still Needs Resolution)

| # | Question | Stakes |
|:---|:---|:---|
| 4.1 | **Auth & billing model?** | Do we ship v1 completely open (no auth), or gate behind a simple email wall? Stripe billing is v2, but free vs. limited-credits affects queue abuse. |
| 4.2 | **TTS provider lock-in?** | ElevenLabs has the best human voices but strict rate limits. OpenAI TTS is cheaper and faster but less cinematic. Do we dual-source or commit to one? |
| 4.3 | **Queue depth & timeout UX?** | If 10 users render simultaneously, the 11th waits 10+ minutes. What does the UI say? Do we cap concurrent jobs or auto-scale? |
| 4.4 | **Input length limits?** | A 5,000-word blog post vs. a 500-word post. LLM context windows handle both, but TTS length directly impacts render time and cost. Cap at 1,000 words? 2,000? |
| 4.5 | **Error handling for bad URLs?** | If a user pastes a paywalled or JS-heavy blog URL, extraction fails. Do we fall back to manual text paste gracefully? |
| 4.6 | **Steve's "film studio" animation bar?** | Steve wants Apple-keynote-level transitions. Remotion can do this, but complex animations extend render time. Where is the line between "inevitable" and "expensive"? |
| 4.7 | **Hosting target for v1?** | Vercel (serverless) can't run Remotion well. We need persistent compute. Render.com? Fly.io? AWS ECS? Decision affects deploy complexity. |

---

## 5. Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|:---|:---|:---|:---|
| **R1: Render queue collapse under concurrent load** | High | Critical | Bull queue with max concurrent job limit. Hard cap of N renders at once. UI shows honest queue position. |
| **R2: Unit economics bleed money** | Medium | Critical | Track cost per video (LLM + TTS + compute + S3). If > $0.50/video, pivot to ffmpeg compositing or throttle free tier immediately. |
| **R3: Remotion memory exhaustion** | High | High | 500MB–1GB per render instance. Cap concurrent renders to RAM / 1GB. Never unbounded. |
| **R4: TTS API rate limits** | Medium | High | Abstract TTS provider. If ElevenLabs throttles, failover to OpenAI TTS. Cache audio segments where possible. |
| **R5: S3 egress costs at scale** | Low | Medium | Pre-signed URLs are cheap; egress adds up at 1,000+ users. Monitor. Move to CloudFront if needed in v2. |
| **R6: Users expect Hollywood, get a template** | Medium | High | Brand messaging must be precise: "Your ideas, in motion." Not "AI Hollywood." Under-promise, over-deliver. |
| **R7: No distribution engine** | High | Critical | Building in public on X/Twitter is the zero-dollar path. If no organic traction in 30 days, v2 needs paid distribution or partnership strategy. |
| **R8: One agent session can't finish the build** | High | High | Scope is deliberately cut to web form + one template + TTS + queue. If session ends mid-build, the codebase must be deployable at any commit. |
| **R9: WordPress plugin demand surprises us** | Low | Medium | The web service is API-first by design. A future WP plugin is a thin REST client. The architecture does not block it. |
| **R10: Steve vs. Elon deadlock on v2 scope** | Medium | Medium | v2 must be data-driven, not opinion-driven. Retention and repeat-usage metrics decide whether we add templates, voices, or WordPress integration. No features without usage signals. |

---

## Build Mantra

> **Paste text. One button. A few minutes. Cinema.**

Everything else is a distraction until the engine proves the magic.
