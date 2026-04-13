# Consolidated Decisions — Build Blueprint

*Arbitrated by Phil Jackson, the Zen Master*

---

## Decision Register

### 1. Product Name

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve (Trace) vs Elon (AgentLog) |
| **Winner** | **DEFERRED** |
| **Rationale** | Steve's argument for "Trace" (one syllable, verb+noun, memorable) is compelling for brand equity. Elon's counterpoint about trademark conflicts (OpenTelemetry, AWS X-Ray, Google Cloud Trace) is valid. **Resolution: Build with working name "Trace" internally. Legal review before public launch. Fallback options: Glint, Span.** |

### 2. Storage Format

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon (NDJSON) vs Steve (SQLite) |
| **Winner** | **Elon — NDJSON** |
| **Rationale** | For v1 scope (~100-500 events/session), NDJSON wins on simplicity: zero dependencies, grep-able, portable, ~100 lines SDK. SQLite's queryability benefits (filtering across 50+ sessions) become relevant at scale we don't have yet. Steve's concern about "find yesterday's run" is valid but is a v2 problem. Ship first. |

### 3. `decision()` Method

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve (keep) vs Elon (cut) |
| **Winner** | **Elon — Cut it** |
| **Rationale** | Steve's philosophical argument ("shapes better thinking") is beautiful but not v1. Developers won't adopt a new habit during first use. Core primitives: `span()`, `tool()`, `thought()`. If users need narrative, they can use custom spans. Fewer primitives = faster adoption. |

### 4. Dashboard Architecture

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Both (virtual scrolling) |
| **Winner** | **Consensus — Virtual scrolling mandatory** |
| **Rationale** | Both agree: 500+ spans will kill React DOM rendering. Build with `react-window` from day one. Steve conceded this is v1-critical, not v2-optimization. ~50 extra lines prevents future rewrite. |

### 5. Timeline Design

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve (horizontal timeline, branches downward) |
| **Winner** | **Steve — Single timeline view** |
| **Rationale** | Both agree: one view, no tabs, no sidebar, no settings page. Timeline is the entire product. Elon conceded "single timeline view is correct." **Open question from Elon: Is this horizontal scroll with vertical branches (tree view) or vertical scroll with horizontal time axis? Needs Figma clarification before build.** |

### 6. Cloud Sync

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Both (kill it) |
| **Winner** | **Consensus — Remove entirely from docs** |
| **Rationale** | Steve: "Even mentioning it creates scope creep gravity." Elon: "Remove from architecture docs—creates cognitive load." Local-first is the philosophy. Cloud is a v2 feature when paying customers ask for it. |

### 7. Distribution Strategy

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon |
| **Winner** | **Elon — GIF-first README, Twitter virality** |
| **Rationale** | Steve conceded: "Developers decide in 5 seconds. A perfect GIF is worth 1,000 words." The hook: "Console.log is dead." Forget Product Hunt—win on GitHub stars and Twitter. |

### 8. Feature Cuts

| Aspect | Detail |
|--------|--------|
| **Proposed by** | Both |
| **Winner** | **Consensus** |
| **Cut from v1:** |
| - Token usage tracking | Derivable from Claude response metadata |
| - Search in dashboard | Ctrl+F works; real search is v2 |
| - Export to JSON | Storage IS NDJSON; redundant |
| - Auto-instrumentation | Only if <30 min to build |
| - Smart error messages ("Consider caching") | Requires ML; v2 feature |

---

## MVP Feature Set (v1 Ships With)

### SDK (~150-200 lines TypeScript)
- `trace.init(projectName)` — one argument, no config
- `trace.span(name)` — wrap operations
- `trace.tool(name, input, output)` — capture tool calls
- `trace.thought(content)` — log agent reasoning
- Writes NDJSON files, one per session

### CLI (~50 lines)
- `npx trace serve` — serves dashboard, reads NDJSON files
- Zero config, zero dependencies beyond Node

### Dashboard (~300-400 lines React)
- Single timeline view
- Expand/collapse spans (lazy-load content)
- Virtual scrolling (react-window)
- Error states glow red
- Instant load, smooth animations

### Total: ~600 lines of code

---

## File Structure (What Gets Built)

```
trace/
├── packages/
│   ├── sdk/
│   │   ├── src/
│   │   │   ├── index.ts          # Main exports
│   │   │   ├── trace.ts          # Core trace API
│   │   │   ├── span.ts           # Span implementation
│   │   │   └── writer.ts         # NDJSON file writer
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── cli/
│   │   ├── src/
│   │   │   └── index.ts          # npx trace serve
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── dashboard/
│       ├── src/
│       │   ├── App.tsx           # Main app
│       │   ├── Timeline.tsx      # Timeline component (virtual scroll)
│       │   ├── Span.tsx          # Expandable span
│       │   └── styles.css        # Minimal CSS
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── .trace/                        # Local data directory (gitignored)
│   └── sessions/
│       └── {session-id}.ndjson
│
├── package.json                   # Monorepo root
├── README.md                      # 20 lines + GIF
└── turbo.json                     # Build orchestration
```

---

## Open Questions (Require Resolution Before Build)

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | **Timeline axis orientation**: Horizontal scroll with vertical branches (tree) OR vertical scroll with horizontal time axis? | Steve | **YES** |
| 2 | **Color palette**: Background, foreground, accent — pick 3 colors | Steve | **YES** |
| 3 | **Final product name**: Trace (pending legal review) or fallback? | Both | No (use "Trace" for now) |
| 4 | **Session ID format**: UUID? Timestamp? Human-readable? | Elon | No |
| 5 | **Auto-prune old sessions**: `--max-sessions` flag or 30-day TTL? | Elon | No |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Trademark conflict on "Trace"** | Medium | High | Use working name; legal review before launch; fallback names ready |
| **Timeline design ambiguity** | High | High | Steve must provide Figma wireframe before build starts |
| **NDJSON file bloat** | Low | Medium | Add `--max-sessions` flag or auto-prune; 10 lines of code |
| **React-window learning curve** | Low | Low | Well-documented library; standard pattern |
| **Scope creep during build** | Medium | High | This document is the contract. If it's not here, it's not v1. |
| **Windows compatibility (file paths)** | Low | Medium | Test on Windows; use `path.join()` everywhere |
| **Large session rendering (1000+ spans)** | Medium | Medium | Virtual scrolling + lazy-load content mitigates this |

---

## Philosophy Lock

From `essence.md` — this is the north star:

> **What is this product REALLY about?**
> Turning the invisible thinking of AI agents into a story you can see.
>
> **The feeling it should evoke:**
> The relief of finally understanding — "oh, *that's* why."
>
> **The one thing that must be perfect:**
> The timeline. One view. Instant. Beautiful. Nothing else.
>
> **Creative direction:**
> See your AI think.

---

## Final Arbitration Notes

Both Steve and Elon brought essential perspectives. Steve's insistence on design quality and emotional resonance is non-negotiable for user love. Elon's ruthless scoping and technical pragmatism is non-negotiable for shipping.

The synthesis:
- **Ship Elon's architecture** (NDJSON, cut `decision()`, virtual scrolling)
- **With Steve's soul** (single perfect timeline, instant load, "confident and minimal" voice)

This is not compromise. This is integration. The triangle offense works because every player moves in harmony.

**The build can begin when:**
1. Steve provides timeline wireframe (axis orientation clarified)
2. Steve picks 3 colors

Everything else is locked.

---

*— Phil Jackson, April 2026*
