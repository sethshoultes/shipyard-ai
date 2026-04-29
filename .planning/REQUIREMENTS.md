# Requirements Traceability Matrix
# Cut — Cinematic Changelog Renderer (v1 MVP)

**Generated**: 2026-04-29
**Source Documents**:
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-82.md` (PRIMARY — dream candidate PRD)
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-82/decisions.md` (LOCKED — overrides PRD where in conflict)
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-82/essence.md` (Creative direction)

**Project Slug**: `github-issue-sethshoultes-shipyard-ai-82`
**Total Requirements**: 10
**Status**: Phase 1 — v1 MVP Build

---

## Requirements Summary

| ID | Requirement | Priority | Source | Kill Switch |
|----|-------------|----------|--------|-------------|
| CUT-001 | Parse strict WordPress `readme.txt` changelog format (`== Changelog ==` header, `= 1.0 =` version lines) into structured array of versions with bullet points | P0 | decisions.md §2, §4 Q5 | **Non-negotiable** |
| CUT-002 | Render cinematic animated HTML page with curated typography (one typeface, breathing whitespace, editorial hierarchy) and restrained CSS motion (gentle slides, confident fades; nothing bounces, nothing wobbles) | P0 | decisions.md §2, §5 Q6 | **Non-negotiable** |
| CUT-003 | WordPress plugin scaffold: `cut.php` with headers, activation hooks, and clean asset enqueue for the client-side build | P0 | decisions.md §2, §3, §5 R3 | **Non-negotiable** |
| CUT-004 | WordPress admin page in `wp-admin` where user pastes changelog text; "Preview" button triggers client-side renderer in an iframe/modal | P0 | decisions.md §2, §3 | **Non-negotiable** |
| CUT-005 | Browser-native Web Speech API narration with curated voice preference list, calm pacing, off-by-default, triggered by user play button | P1 | decisions.md §2, §4 Q3, Locked #8, #11 | Cut if >20 min |
| CUT-006 | Self-contained standalone HTML page (`client/index.html`) that renders instantly on any device; zero server-side rendering | P0 | decisions.md §2, §6 | **Non-negotiable** |
| CUT-007 | WordPress shortcode `[cut changelog="..."]` to embed animated changelog on any post/page | P1 | decisions.md §2, §3 | Cut if >20 min |
| CUT-008 | WordPress Gutenberg block registration for embedding animated changelog | P2 | decisions.md §2, §3 | Cut if >20 min |
| CUT-009 | Dignified error handling with human, warm, proud copy voice; clear input format contract; graceful rejection of malformed changelog input | P0 | decisions.md §4 Q5, §5 R6, Locked #12 | **Non-negotiable** |
| CUT-010 | Client-side performance target 60fps on mid-range hardware; simplify motion if animation chokes | P0 | decisions.md §5 R7 | **Non-negotiable** |

---

## Technical Context (Verified)

### Architecture Lock
- **Platform**: WordPress plugin (thin PHP wrapper) + portable client-side JavaScript core, NOT Emdash/Cloudflare per locked decisions #2, #9
- **Rendering**: Client-side only (DOM/CSS + minimal Canvas if required) per locked decisions #2, #6
- **No server-side video generation**: Remotion, ffmpeg, MP4 export all cut from v1 per decisions #2, #3, #10
- **No templates / zero customization panels**: One hardcoded cinematic sequence per decisions #4
- **TTS**: Browser-native Web Speech API, optional, off-by-default per decisions #8, #11
- **Parser**: Strict WordPress `readme.txt` format only; no universal parser per decisions #5, §4 Q5

### Design Philosophy (Locked from decisions.md)
| Principle | Rule |
|-----------|------|
| Dignity | Error messages get dignity; no corporate litany |
| Restraint | One typeface, one scale, breathing whitespace |
| Taste | Output must evoke pride, not decoration |
| Motion | Gentle slides, confident fades; nothing bounces, nothing wobbles |
| Voice | Human, warm, proud copy everywhere |

### File Structure (Locked from decisions.md §3)
```
projects/github-issue-sethshoultes-shipyard-ai-82/
├── client/                     # The core asset — platform-agnostic renderer
│   ├── index.html             # Standalone hosted page entry point
│   ├── src/
│   │   ├── parser.js          # readme.txt changelog parser (strict)
│   │   ├── renderer.js        # CSS animation engine
│   │   ├── narrator.js        # Web Speech API wrapper (voice, pacing)
│   │   ├── sequence.js        # The curated cinematic timeline
│   │   ├── typography.css     # The one typeface, the one scale
│   │   └── motion.css         # Restrained transitions (fade, slide)
│   └── assets/
│       └── (none — no images, no audio files)
│
├── wordpress-plugin/           # Distribution wedge
│   ├── cut.php                # Main plugin file
│   ├── admin/
│   │   ├── page.php           # wp-admin "Cut" page
│   │   └── preview.php        # iframe wrapper for renderer
│   ├── public/
│   │   ├── shortcode.php      # [cut changelog="..."] handler
│   │   └── block.js           # Gutenberg block registration
│   └── assets/
│       └── (enqueues client/ build)
│
└── readme.txt                 # WP.org plugin readme
```

### Exclusions (Explicitly Cut in decisions.md §2)
- Server-side video generation (Remotion, ffmpeg, MP4 export)
- Template marketplace or theme switcher
- Customization panels (colors, fonts, speed, voice selection)
- Multi-format parsers (GitHub Releases, npm, Keep a Changelog)
- Enterprise tier / white-label / custom CSS injection
- Stock music or audio beds
- API-first architecture
- "Your last cut" library / retention layer
- Sharing layer / social export
- Server component (`server/` directory) — static hosting only

---

## Hindsight Risk Notes

- **No project-specific high-churn files** — this is a greenfield build. No existing codebase to conflict with.
- **Bug-associated file relevant to domain**: `prds/changelog-theatre-v2.md` appeared in bug-associated files list. This suggests prior iteration on this product concept encountered issues. Tread carefully on scope and do not resurrect cut features.
- **General repo risk**: HIGH (15 high-churn files, 20 bug-associated files). Key high-churn files that may conflict during planning:
  - `.planning/phase-1-plan.md` (49 changes)
  - `.planning/REQUIREMENTS.md` (45 changes)
  - `STATUS.md` (11 changes, bug-associated)
- **Uncommitted changes**: `rounds/github-issue-sethshoultes-shipyard-ai-82/decisions.md` and round transcripts are modified but not committed. Safe to build atop; do not commit these planning files until the build workspace is ready.
- **Planning file churn**: `.planning/phase-1-plan.md` and `.planning/REQUIREMENTS.md` are high-churn in the broader repo. Coordinate with other active projects to avoid simultaneous edits.

---

## Open Questions Resolved for Phase 1

| # | Question | Resolution | Rationale |
|---|----------|------------|-----------|
| 1 | Canvas vs. DOM/CSS animations? | **Hybrid: DOM/CSS primary, Canvas only if a specific effect demands it** | decisions.md §4 Q6. Faster to build, accessible, and the "web page" risk is mitigated by taste and restraint. |
| 2 | Auto-play policy vs. narration? | **TTS triggered by user click on Preview/Generate, never auto-play** | decisions.md §4 Q4. Respects browser policies and user agency. |
| 3 | Voice consistency across browsers? | **Curated preference list with fallback; accept "calm and intelligible" as v1 bar** | decisions.md §4 Q3. Perfect consistency is v2; v1 gets ranked preference + first calm English fallback. |
| 4 | Hosted permalink vs. local embed? | **Local embed (shortcode/block) is v1 standard. Hosted permalink is v1.5.** | decisions.md §4 Q2. Do not block v1 on infrastructure. |
| 5 | What creates the "gasp"? | **Build the first frame before the parser. If first 5 seconds do not evoke pride, stop and redesign.** | decisions.md §4 Q1. Steve's bar is the only bar. |

---

## Documentation Review

### Emdash CMS Reference (`docs/EMDASH-GUIDE.md`)
> Per `CLAUDE.md` mandate: "Before building, modifying, or debugging any Emdash site, theme, or plugin, agents MUST read `docs/EMDASH-GUIDE.md` first."

**Review completed.** This project is explicitly a **WordPress plugin with a portable client-side core**, not an Emdash plugin or Cloudflare Worker. The locked decisions (#2, #9) override any Emdash architectural assumptions from the original PRD. No Emdash APIs (`definePlugin`, `sandbox-entry.ts`, D1/R2, Astro templates) are used. The `EMDASH-GUIDE.md` §6 (Plugin System), §5 (Deployment), and §7 (Theming) were reviewed to confirm the architectural divergence is intentional and locked.
