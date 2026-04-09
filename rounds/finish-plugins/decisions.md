# Plugin System Completion — Locked Decisions

**Consolidated by:** Phil Jackson, Zen Master
**Debate Participants:** Steve Jobs (Design/Brand), Elon Musk (Engineering/Scale)
**Date:** Build Phase Blueprint

---

## Essence (North Star)

> A plugin system that disappears — electricity for small businesses, not software to configure.

**The feeling:** Relief. It just works.
**The critical moment:** The first 30 seconds. Install, and it's already running.
**Creative direction:** Invisible until needed.

---

## Decision 1: Ship Scope — All Six vs. One Perfect

| Aspect | Steve's Position | Elon's Position | **Winner** |
|--------|------------------|-----------------|------------|
| Approach | Ship EventDash alone first, prove architecture | Ship all six in parallel via regex surgery | **Elon** |
| Reasoning | Perfect one plugin to prove the system | Same three bugs repeated 338 times — mechanical fix | Velocity wins |

**Locked Decision:** Ship all six plugins simultaneously.

**Why Elon won:** Steve conceded that the deploy-verify loop requires infrastructure, not willpower. The "working reference" (EventDash) has 121 banned patterns — it's not actually working. Fixing one contaminated plugin doesn't prove architecture; it just polishes a prototype. The bugs are repetitive, so the fix should be systematic.

**Steve's concession (Round 2):** "One agent session can't do this. The deploy-verify loop requires infrastructure, not willpower."

---

## Decision 2: Acceptance Criteria — Grep vs. Visual Verification

| Aspect | Steve's Position | Elon's Position | **Winner** |
|--------|------------------|-----------------|------------|
| Ship criteria | Visual verification required (screenshots) | Grep + curl = done | **Split** |
| Reasoning | Screenshots are the contract; they prove UX | Console error hunting is polish; binary tests suffice | Both valid |

**Locked Decision:** Grep is the gate; visual is the record.

**Compromise:**
1. **Gate:** Zero banned patterns (grep proves this), build succeeds, deploy succeeds, API routes return JSON (curl proves this)
2. **Record:** One screenshot per plugin admin page — not as a blocker, but as the spec artifact for future reference

**Why split:** Steve is right that screenshots create the spec for "what working looks like" — future developers need this. Elon is right that screenshots shouldn't block deploy. Capture them post-deploy, not pre-ship.

---

## Decision 3: Plugin Naming

| Aspect | Steve's Position | Elon's Position | **Winner** |
|--------|------------------|-----------------|------------|
| Plugin names | Simple nouns: Rolls, Stars, Rank, Forms, Shop, Events | Internal names don't matter; users see dashboard labels | **Elon (for v1)** |
| Reasoning | Jargon is technical debt for marketing | Renames don't block deploy; rename in v2 | Ship now, name later |

**Locked Decision:** No renames before deploy. Current names ship (MemberShip, ReviewPulse, SEODash, FormForge, CommerceKit, EventDash).

**Why Elon won for now:** Steve acknowledged this is a "Tuesday afternoon discussion, not launch criteria." Users see "Events," "Members," "Reviews" in their dashboard — the internal module names don't surface to customers in v1.

**v2 consideration:** Steve's naming philosophy (single nouns: Rolls, Stars, Rank) should be revisited when plugins become externally marketed.

---

## Decision 4: Technical Approach — Surgical Fix Method

| Aspect | Steve's Position | Elon's Position | **Winner** |
|--------|------------------|-----------------|------------|
| Method | Clean EventDash first, use as template | Regex surgery across all plugins simultaneously | **Elon** |
| Reasoning | Need clean DNA to copy | Same bugs everywhere — transform mechanically | Efficiency |

**Locked Decision:** Regex surgery across all six plugins in parallel.

**The transforms:**
- `throw new Response(` → `throw new Error(`
- `rc.user` → remove auth checks entirely (Emdash handles auth)
- `JSON.stringify` in `kv.set()` → remove (auto-serializes)
- `JSON.parse` on `kv.get()` → remove

**Why Elon won:** Steve conceded in Round 2 that EventDash itself is "contaminated DNA" with 121 banned patterns. Can't use a broken reference as a template. The mechanical fix is correct.

---

## Decision 5: Authentication Architecture

| Aspect | Steve's Position | Elon's Position | **Winner** |
|--------|------------------|-----------------|------------|
| Auth handling | Platform handles it, period | Remove all plugin-level auth checks | **Both (agreement)** |

**Locked Decision:** Emdash handles authentication. Plugins must not check `rc.user`.

**Both agreed:** Every `rc.user` check is a plugin overstepping its role. This is good design AND the fastest path to clean code. Plugins are downstream of auth, like a lightbulb is downstream of the power grid.

---

## Decision 6: Parallelization Strategy

| Aspect | Steve's Position | Elon's Position | **Winner** |
|--------|------------------|-----------------|------------|
| Execution | Serial: one plugin at a time | Parallel: all six simultaneously | **Elon** |

**Locked Decision:** Parallelize everything.

- Grep validation: all 6 plugins simultaneously
- Deploys: all 6 to different test sites simultaneously (sunrise-yoga, bella-bistro, peak-dental, craft-co, +2)
- Steve conceded in Round 2: "Parallel grep validation is obviously correct."

---

## MVP Feature Set (What Ships in v1)

### Scope
- **6 plugins:** MemberShip, ReviewPulse, SEODash, FormForge, CommerceKit, EventDash
- **Total codebase:** ~13,313 lines across 6 plugins
- **Bugs to fix:** 338 banned patterns (`throw new Response`), 58 auth anti-patterns (`rc.user`)

### Ship Criteria (Binary)
1. Zero banned patterns (grep validation)
2. Build succeeds
3. Deploy succeeds
4. API routes return valid JSON (curl validation)

### Post-Ship Artifact
- One screenshot per plugin admin page (captured after deploy, not blocking)

### Cut from v1
- Full Playwright test coverage (v2)
- Console error hunting (v2)
- Plugin renaming (v2)
- Block Kit response format investigation (separate ticket)

---

## File Structure (What Gets Built)

```
emdash-plugins/
├── membership/          # Fix: remove throw new Response, rc.user
├── reviewpulse/         # Fix: remove throw new Response, rc.user
├── seodash/             # Fix: remove throw new Response, rc.user
├── formforge/           # Fix: remove throw new Response, rc.user
├── commercekit/         # Fix: remove throw new Response, rc.user
├── eventdash/           # Fix: remove throw new Response, rc.user (121 instances)
└── scripts/
    ├── regex-surgery.sh       # Automated find-replace across all plugins
    ├── grep-validation.sh     # Zero banned patterns check
    └── parallel-deploy.sh     # Deploy all 6 to test sites
```

### Test Sites for Parallel Deploy
1. sunrise-yoga
2. bella-bistro
3. peak-dental
4. craft-co
5. [TBD - need 2 more test sites]
6. [TBD]

---

## Open Questions (What Still Needs Resolution)

### 1. Two More Test Sites Needed
Elon's parallel deploy strategy requires 6 test sites. Only 4 are named. **Action:** Identify 2 additional test sites before deploy phase.

### 2. Block Kit Response Format
EventDash PRD notes: "Figure out the exact Block Kit response format Emdash expects." This is a bug investigation, not part of the fix scope. **Action:** Create separate ticket.

### 3. SDK Documentation
Both agreed: plugins were built against a "hallucinated API." After fixes ship, we need documentation. **Action:** Post-v1 — document the correct patterns: "Don't serialize. We do it for you."

### 4. Regex Surgery Edge Cases
Steve warned: "Regex won't fix conceptual errors — it'll just move them around." **Action:** After regex surgery, grep for any remaining anti-patterns. Manual review if non-zero.

### 5. Console Errors
Steve: "Console errors are the user's first signal that something is wrong." Elon: "Console error hunting is polish." **Action:** Deferred to v2, but document any observed console errors during screenshot capture.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Regex surgery breaks functional code | Medium | High | Grep validation catches structural issues; curl validates JSON responses | Engineering |
| Conceptual bugs survive regex fix | Medium | Medium | Manual review of any non-trivial transform failures | Engineering |
| Test sites unavailable for parallel deploy | Low | High | Identify backup sites before deploy phase | Ops |
| One plugin has unique bugs not covered by regex patterns | Medium | Low | Plugin-specific manual fixes post-surgery | Engineering |
| Visual artifacts reveal UX issues that passed grep | Medium | Medium | Screenshots captured post-deploy; creates v2 backlog | Design |
| Auth removal causes permission escalation | Low | Critical | Platform auth layer must be verified as comprehensive before plugin auth removal | Security |
| KV auto-serialization has edge cases plugins depend on | Low | Medium | Test with real data in staging before production | Engineering |

### Critical Risk: Auth Removal
Both agreed plugins shouldn't handle auth. But: if Emdash's auth layer has gaps, removing `rc.user` checks could expose admin functionality to unauthorized users. **Mitigation:** Verify Emdash platform auth is comprehensive before stripping plugin-level checks.

---

## Summary: The Play

1. **Regex surgery** across all 6 plugins (30 min)
2. **Grep validation** confirms zero banned patterns (2 min)
3. **Parallel build** all 6 plugins
4. **Parallel deploy** to 6 test sites (need 2 more sites)
5. **Curl validation** all API routes return JSON
6. **Screenshot capture** one per admin page (post-deploy, non-blocking)
7. **Ship**

**Timeline:** Hours, not weeks.

**The Zen:** Elon brings velocity. Steve brings standards. The winning play uses Elon's machine to hit Steve's floor — then Steve's screenshots to define the ceiling for v2.

---

*"The strength of the team is each individual member. The strength of each member is the team."*
— Phil Jackson
