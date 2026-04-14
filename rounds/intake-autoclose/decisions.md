# Decisions: Intake Auto-Close (Closer)

> *"Invisible. Inevitable. Complete."*

---

## Locked Decisions

### 1. Architecture: Single Function in Existing File
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon (Round 1) |
| **Winner** | Elon |
| **Why** | No new files. One function (`closeSourceIssue()`) in `pipeline.ts`. One call site. ~15 lines. No abstractions, no state, no database. Minimal code = minimal attack surface, minimal breakage, minimal onboarding. Steve conceded: "This *is* achievable in a single session." |

### 2. Content Parsing Over Filename Parsing
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon (Round 1) |
| **Winner** | Elon (Steve explicitly conceded) |
| **Why** | Regex the markdown body for `Auto-generated from GitHub issue {repo}#{number}`. Content is authoritative. Filenames lie; content doesn't. Steve called this "a design principle, not just a technical detail." |

### 3. Comment Format
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve (Round 1), defended against Elon's "just 'Shipped'" suggestion |
| **Winner** | Steve |
| **Why** | "Shipped via Great Minds pipeline. Project: {name}" — Elon initially wanted to cut the project name as "noise." Steve argued context is respect, not noise. Elon conceded in Round 2: "keep it. It connects the closure to the work." |

### 4. Comment Tone: Professional, Minimal, No Embellishment
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve (Round 1) |
| **Winner** | Steve (Elon aligned) |
| **Why** | One line. No emojis. No exclamation points. No "We're excited to announce..." — Professional confidence without being robotic. Both agreed this is non-negotiable. |

### 5. Zero Configuration
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve (Round 1) |
| **Winner** | Unanimous |
| **Why** | No toggles. No opt-out. No "close after X days" settings. It closes on ship. Period. Elon: "When Steve Jobs and I agree on cutting scope, that scope is dead." |

### 6. Synchronous Execution, Fire-and-Forget
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon (Round 1) |
| **Winner** | Elon |
| **Why** | `execSync` with 15-second timeout. If it fails, log and continue. No retry queue. No async workers. No state management. Graceful failure via logging is the right pattern. |

### 7. No Retry Logic
| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve (Round 1: "We don't beg"), Elon (technical rationale) |
| **Winner** | Unanimous |
| **Why** | If GitHub is down, log it and move on. The system fails gracefully. Steve's phrasing was dramatic; Elon's reasoning was cleaner. Same conclusion. |

---

## MVP Feature Set (v1)

**What ships:**
1. Single function `closeSourceIssue()` in `pipeline.ts`
2. Content parsing via regex: `Auto-generated from GitHub issue {repo}#{number}`
3. Shell out to `gh issue close {repo}#{number} --comment "..."`
4. Comment text: `Shipped via Great Minds pipeline. Project: {name}`
5. 15-second timeout on `execSync`
6. Error logging on failure (no retry, no queue)
7. Single call site in archive success path

**What does NOT ship:**
- No new files (`closer.ts`, `issue-manager/`, etc.)
- No configuration options
- No retry logic / exponential backoff
- No async workers or queues
- No webhooks
- No status labels or transition states
- No elaborate comment templates
- No notifications beyond GitHub's built-in

---

## File Structure

```
pipeline.ts
├── closeSourceIssue(mdContent: string, projectName: string): void  [NEW ~15 lines]
│   ├── Regex parse: extract repo, issue number from content
│   ├── execSync: `gh issue close {repo}#{number} --comment "..."`
│   ├── Timeout: 15 seconds
│   └── Error handling: log and continue
│
└── [existing archive success path]
    └── Call closeSourceIssue() after successful archive  [NEW ~5 lines]
```

**Files modified:** 1 (`pipeline.ts`)
**Lines added:** ~20
**New dependencies:** 0 (uses existing `gh` CLI)

---

## Open Questions

| Question | Context | Suggested Resolution |
|----------|---------|---------------------|
| **Internal naming** | Steve wants "Closer" as internal vocabulary; Elon says "it's a private function, nobody types it" | Call the function `closeSourceIssue()` (descriptive), reference it as "Closer" in docs/discussions if desired. Pragmatic compromise. |
| **Log format on failure** | Not specified in debates | Follow existing pipeline.ts logging patterns. Keep it simple: `[Closer] Failed to close {repo}#{number}: {error}` |
| **What if markdown lacks the issue marker?** | Not discussed | Fail silently — no issue to close. Log as debug, not error. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **GitHub rate limiting** | Low | Low | Authenticated `gh` CLI gets 5,000 req/hour. At max 5,000 ships/day, we're within limits. |
| **`gh` CLI not installed/configured** | Low | Medium | Document as prerequisite. Fail gracefully with clear error message. |
| **Regex fails on malformed markdown** | Low | Low | Fail silently, log, continue. No issue closed = no harm. |
| **15-second timeout too short** | Very Low | Low | GitHub API is fast. If consistently timing out, indicates larger network issues. |
| **Feature creep post-ship** | Medium | High | **Document the "NO" list prominently.** Elon: "someone decides to 'improve' it with webhooks, queues, or retry logic. Don't." This decision doc is the defense. |
| **Sequential blocking at scale** | Low | Low | At 200 ships/hour with 2-second closes, ~7 min/hour blocking. Irrelevant — ships are async per-project. Daemon architecture is the real bottleneck at 100x, but that's out of scope. |

---

## Implementation Checklist

- [ ] Read `pipeline.ts` and `health.ts` (existing patterns)
- [ ] Add `closeSourceIssue()` function (~15 lines)
- [ ] Add call site in archive success path (~5 lines)
- [ ] Test with real issue (manual verification)
- [ ] Compile, commit, restart service

**Estimated time:** 2-4 hours (Elon: 2h functional, Steve: 4h "right")

---

## Final Alignment

**Elon:** "Ship the PRD as written, with Steve's comment format. Everything else is decoration."

**Steve:** "Ship it right. Then move on."

**Essence:** Relief. The quiet satisfaction of a door clicking shut.

---

*This document is the blueprint for the build phase. No new debates. Build what's locked.*
