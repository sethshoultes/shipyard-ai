# Decisions — `build-model-canary-glm`

**Role:** Phil Jackson, Zen Master — Great Minds Agency
**Purpose:** Blueprint for the build phase. No ambiguity. No decoration.
**Status:** LOCKED

---

## 1. Locked Decisions

### 1.1 Zero Dependencies, Zero Build Tools
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** This is an internal wiring test, not a runtime product. Dependencies are future failure modes. Steve conceded in Round 2: "Adding a bundler to seven string functions would be architectural cowardice."
- **Locked rule:** Raw TypeScript. `node --test`. No `package.json` scripts theater. No Prettier. No bundlers. No transpile step.

### 1.2 No README, No CI, No Prettier, No Publish Pipeline
- **Proposed by:** Elon (Round 1, Round 2)
- **Winner:** Elon
- **Why:** The canary never reaches a user. Steve conceded fully in Round 2 ("no CI pipelines, no Prettier configs, no `package.json` script theater"). Any artifact beyond the PRD mandate and test requirements is waste for a smoke test.
- **Locked rule:** Ship only what the PRD mandates and the tests require. Reject README, CI configs, and publish workflows on sight.

### 1.3 Zero Hollow Files; No TODOs, No Placeholders
- **Proposed by:** Steve (Round 1, Round 2 non-negotiable)
- **Winner:** Steve
- **Why:** Elon conceded in Round 2 ("no TODOs. No placeholders. No 'coming soon.' The output code should be clean, correct, and self-explanatory"). Steve's "quality is fractal" argument carried: what we tolerate in our smallest tests metastasizes into our largest products.
- **Locked rule:** Every file carries weight. Every character earns its place. Existence is not substance.

### 1.4 Native `node --test` with Clean Green Output
- **Proposed by:** Elon (Round 1 architecture); UX elevation by Steve (Round 1)
- **Winner:** Synthesis
- **Why:** Elon picked the tool for zero-config speed. Steve defined the experience: "flip a switch, pure white light." Both agree the only acceptable output is a silent green line — no noise, no warnings, no archaeology.
- **Locked rule:** One breath: run, green, done.

### 1.5 Aggressive Scope Pruning — ~80 Lines, 7 Files
- **Proposed by:** Elon (Round 1, Round 2); defended by Steve's "cut to bone" philosophy
- **Winner:** Synthesis
- **Why:** Steve agreed scope should be "aggressively pruned." Elon agreed small is not careless. The PRD's 7-file mandate is the hard boundary. The essence reads: "Cut to bone. Stay green."
- **Locked rule:** `slugify`, `truncate`, tests, `spec.md`, `todo.md`. Nothing else. Target ~80 lines of TypeScript total.

---

## 2. MVP Feature Set (What Ships in v1)

| Feature | Owner | Notes |
|---------|-------|-------|
| `slugify` | PRD | String normalization utility |
| `truncate` | PRD | String truncation utility |
| Test suite | Synthesis | Native `node --test` coverage of both utilities |
| `spec.md` | PRD (accepted) | Required by PRD/test protocol; Elon wanted it cut but accepted mandate |
| `todo.md` | PRD (accepted) | Required by PRD/test protocol; Elon wanted it cut but accepted mandate |

**Non-shipping (explicitly cut):** README, CI/CD, Prettier config, build tools, `package.json` scripts, naming ceremony, brand voice docs, `index.ts` unless PRD explicitly requires it.

---

## 3. File Structure (What Gets Built)

```
build-model-canary-glm/
├── slugify.ts          # Source: string normalization
├── truncate.ts         # Source: string truncation
├── slugify.test.ts     # Test: native node --test
├── truncate.test.ts    # Test: native node --test
├── index.ts            # Entry point (ONLY if PRD mandates; otherwise cut)
├── spec.md             # PRD-mandated specification
└── todo.md             # PRD-mandated task tracking
```

**Hard rule:** If the PRD specifies a different 7-file arrangement, the PRD wins. The locked principle is: **7 files, zero fat, every file earns its disk blocks.** No file exists without PRD mandate.

---

## 4. Open Questions (What Still Needs Resolution)

### 4.1 Product Naming
- **Steve's position:** Non-negotiable. One real word. "Slug" or "Canary." A product without a name is a product without a soul.
- **Elon's position:** Non-negotiable the other way. `build-model-canary-glm` is a diagnostic filename. Naming a smoke detector is "procrastination with better typography."
- **Status:** **Deadlock.** The tiebreak, if required, goes to the filesystem reality (directory is already `build-model-canary-glm`). Steve's aesthetic objection stands unresolved. **Do not let this block the build.**

### 4.2 `spec.md` and `todo.md` Long-Term
- **Elon's position:** Ritual overhead. Cut them if acceptance criteria ever allow.
- **Steve's position:** Implied acceptance if they carry weight (no hollow files).
- **Status:** Locked *in* for v1 because the PRD requires them. Open for re-evaluation in v2 if the PRD template changes.

### 4.3 Module Entry Point (`index.ts`)
- **Status:** Not explicitly debated. If the PRD requires an `index.ts`, it ships under the 7-file cap. If not, it is cut. No file exists without PRD mandate.

---

## 5. Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Owner | Mitigation |
|------|-----------|--------|-------|------------|
| **Agent wiring failure** — Model emits hollow JSON or fails `Write` tool calls | High (this is the canary's purpose) | Critical (blocks all downstream model evaluation) | Infrastructure | If this canary dies, debug the agent/model interface, not the code. The code is trivial; the wiring is the test. |
| **Hollow files with passing tests** — File exists but has no substance (e.g., empty `todo.md`, placeholder `spec.md`) | Medium | High (violates Steve's non-negotiable; rots culture) | Build Agent | Enforce "every character earns its place" during review. Reject files that are structural filler. |
| **Scope creep** — README, Prettier, CI, or build tools added despite lock | Low | Medium | Build Agent | Reject any artifact not in the 7-file PRD list. Elon's "absolutely no" is the gate. |
| **Process bloat > 10 min** — Agent session exceeds Elon's ceiling | Medium | Medium | Process | If it takes longer than 10 minutes, the process — not the code — is broken. Investigate agent loop or model latency. |
| **Naming deadlock delay** — Human or agent stalls build arguing "Slug" vs "Canary" vs barcode | Medium | Low | Facilitator | Table the debate. Ship with diagnostic filename. Name it later if it ever becomes a real product. |
| **False positive health signal** — Tests pass, model swap is declared healthy, but downstream product fails because canary was too simple | Low | High | QA | Accept that this is a wiring test, not a functional regression suite. Add heavier canary if needed downstream. |
| **Cultural rot** — "It's just internal" justifies sloppy output | Medium | High | Culture | Steve's rule stands: quality is fractal. The things we tolerate in our smallest tests metastasize into our largest products. |

---

*Locked by: Phil Jackson, Zen Master*
*Date: 2026-05-03*
*Mandate: Cut to bone. Stay green. Ship it.*
