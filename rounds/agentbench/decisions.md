# AgentBench/PROOF — Final Decisions
## Consolidated by Phil Jackson, The Zen Master

*The triangle offense works because everyone knows their role. This document is our playbook.*

---

## Locked Decisions

### 1. Product Name

| Proposed | Champion | Winner | Resolution |
|----------|----------|--------|------------|
| "PROOF" | Steve | **TBD — Compromise** | Elon proposed "AgentProof" as middle ground |

**The Conflict:**
- Steve: "PROOF" sells the promise. One word. Verb and noun. "I have PROOF."
- Elon: SEO nightmare. GitHub conflicts. "Google was nonsense until it wasn't" — but we don't have Google's distribution.

**Phil's Call:** Name remains **OPEN**. Both have valid points. Ship with working title, rename after traction proves concept. The codebase should use a configurable brand constant.

---

### 2. First-Run Experience (`npm init` vs Copy-Paste)

| Proposed | Champion | Winner | Why |
|----------|----------|--------|-----|
| `npm init proof` scaffolding | Steve | **Elon** | Time-to-ship beats time-to-belief for v1 |
| Copy-paste from README | Elon | ✓ | 2-3 days of scaffolding work delays core value |

**Steve's Concession:** Did not concede this explicitly.
**Elon's Argument:** Scaffolding is 2-3 days of work for a first-run experience while the evaluator sits unfinished.

**Phil's Call:** **Elon wins.** Copy-paste for v1. BUT — the README must be immaculate. Steve owns the README experience. If copy-paste feels like homework, we failed.

---

### 3. Default Evaluation Mode

| Proposed | Champion | Winner | Why |
|----------|----------|--------|-----|
| LLM evaluation primary | (implicit in PRD) | **Elon** | Performance and cost |
| String matching primary, LLM opt-in | Elon | ✓ | 10 tests: <100ms vs 10+ seconds |

**Steve's Concession:** "Philosophically annoying, practically correct. I'll take the L."

**Phil's Call:** **Locked.** String matching is default. LLM evaluation via `evaluator: semantic` opt-in.

---

### 4. Output Format

| Proposed | Champion | Winner | Why |
|----------|----------|--------|-----|
| JSON for CI only | Elon | **Steve** | Developers live in terminals, not CI |
| Human-first, `--json` flag for CI | Steve | ✓ | "A developer debugging at midnight doesn't want JSON" |

**Elon's Concession:** "Output clarity is UX... Verbose logging is a bug, not a feature."

**Phil's Call:** **Locked.** Beautiful, minimal terminal output by default. `--json` flag for CI pipelines.

---

### 5. Architecture

| Proposed | Champion | Winner | Why |
|----------|----------|--------|-----|
| Four layers (CLI, Runner, Adapter, Evaluator) | (PRD) | **Elon** | Adapter layer is premature |
| Three files, ~500 lines | Elon | ✓ | "Two if-statements, not a plugin system" |

**Phil's Call:** **Locked.** Three core modules:
1. Config loader (YAML parse + validate)
2. Executor (subprocess + HTTP, no adapter abstraction)
3. Evaluators (string ops + single LLM call for semantic)

---

### 6. LLM Evaluation Strategy

| Proposed | Champion | Winner | Why |
|----------|----------|--------|-----|
| One API call per evaluation | (implicit) | **Elon** | Batching is obvious optimization |
| Batch evaluations (one call for N tests) | Elon | ✓ | $0.15-0.30 and 5-15 seconds vs one call |

**Steve's Concession:** "One call for N evaluations is obviously better. Ship it that way from day one."

**Phil's Call:** **Locked.** Batch LLM evaluations from v1. Don't retrofit.

---

### 7. Features Cut from v1

| Feature | Who Cut It | Agreement |
|---------|------------|-----------|
| `--watch` mode | Elon | Steve concedes: "He's right. It's a luxury." |
| Custom evaluator support | Elon | No objection |
| `json_schema` validation | Elon | No objection |
| Multiple output formats | Elon | Steve won: human default + `--json` flag |
| Parallel test execution | Elon | No objection |
| Retry logic | Elon | No objection |
| Confidence scores | Elon | Steve disagrees (see Open Questions) |
| Multi-turn conversations | Steve | No objection |
| Web dashboard | Steve | No objection |
| Plugin ecosystems | Steve | Both agree |

---

### 8. Brand Voice

| Proposed | Champion | Winner | Why |
|----------|----------|--------|-----|
| "Confident. Spare. Slightly defiant." | Steve | **Steve** | Elon defers on copy |

**Elon's Concession:** "Brand voice matters... Our README should read like a manifesto, not a manual. I'll defer to Steve on copy."

**Phil's Call:** **Locked.** Steve owns brand voice. Short sentences. No hedging. Promises we keep.

---

## MVP Feature Set (What Ships in v1)

### Core Functionality
- [ ] YAML config parsing with schema validation
- [ ] CLI subprocess executor (`command` type)
- [ ] HTTP executor (`http` type)
- [ ] String evaluators: `contains`, `does_not_contain`
- [ ] One semantic evaluator: `matches_intent` (LLM-backed, opt-in)
- [ ] Batched LLM evaluation (one API call for all semantic checks)
- [ ] Pass/fail output with checkmarks
- [ ] `--json` flag for CI output

### User Experience
- [ ] README with copy-paste YAML examples
- [ ] One command to run tests: `npx proof run` (or working title)
- [ ] Clear error messages: "test failed" vs "evaluation failed"
- [ ] Graceful degradation when LLM unavailable (string-only mode)

### Distribution
- [ ] npm publish
- [ ] HN launch post with real case study
- [ ] 10 named DMs to AI developers/influencers

---

## File Structure (What Gets Built)

```
/proof (or working title)
├── package.json
├── README.md              # Steve owns copy. Manifesto, not manual.
├── bin/
│   └── proof.js           # CLI entry point. process.argv, no Commander.
├── src/
│   ├── config.js          # YAML loader + schema validation (~100 lines)
│   ├── executor.js        # Subprocess + HTTP execution (~100 lines)
│   └── evaluators.js      # String matchers + batched LLM call (~200 lines)
├── tests/
│   └── proof.test.js      # Dogfood: test the tester
└── examples/
    └── basic.yaml         # Copy-paste starter
```

**Total Target:** ~500 lines of core code (excluding tests/examples)

---

## Open Questions (Require Resolution)

### 1. Product Name
- **Options:** PROOF, AgentBench, AgentProof, other
- **Blocker:** Affects npm package name, GitHub repo, all marketing
- **Owner:** Needs founder decision
- **Recommendation:** Ship with `agentproof`, rebrand if traction warrants

### 2. Confidence Scores
- **Steve's Position:** "94% vs 51% tells you whether to ship or dig deeper. We're testing probabilistic systems."
- **Elon's Position:** "Binary pass/fail is clearer. Scores require explanation and tuning."
- **Resolution Needed:** Does semantic evaluator return score or binary?
- **Recommendation:** Binary for v1 with score logged for debugging. Revisit in v2.

### 3. `sentiment` vs `matches_intent` — Which Semantic Evaluator Ships?
- **Elon:** "One LLM evaluator (sentiment OR matches_intent, not both)"
- **Not explicitly resolved**
- **Recommendation:** `matches_intent` is more general. Ship that. `sentiment` is v2.

### 4. YAML Schema Versioning
- **Elon:** "Version your YAML schema from day one"
- **Not addressed by Steve**
- **Recommendation:** Add `version: 1` field to schema. Trivial to implement.

---

## Risk Register (What Could Go Wrong)

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude API rate limits at scale | High | High | Graceful degradation to string-only mode |
| LLM eval latency frustrates users | Medium | High | String matching default, batch API calls |
| YAML schema doesn't anticipate user needs | High | Medium | Version schema from day one |
| API down = tests fail for wrong reason | Medium | High | Clear error messages distinguishing test vs eval failure |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Name confusion/SEO burial | Medium | Medium | Ship working product, name can change |
| Copy-paste onboarding feels like homework | Medium | Medium | Immaculate README (Steve owns) |
| No telemetry = flying blind on usage | High | Medium | Add anonymous usage ping in v1.1 |
| Plugin requests before core is stable | High | Medium | Say no. "That's v3." |

### Distribution Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| HN launch fizzles | Medium | Medium | Real case study, not vaporware demo |
| Framework integration blocked | Medium | Medium | Ship standalone first, integrations are v2 |
| Influencer outreach ignored | Medium | Low | Ship something worth talking about |

---

## The Essence (Don't Lose Sight)

> **What this is really about:**
> Giving developers the confidence to ship AI agents — replacing prayer with proof.

> **The feeling:**
> Relief. The exhale after uncertainty.

> **The one thing that must be perfect:**
> The first test run. One command. Green checkmark. Done.

---

## Sign-Off

**Steve's Non-Negotiables (Honored):**
1. ~~The Name Is PROOF~~ → **OPEN** (compromise needed)
2. ~~`npm init proof` Ships in v1~~ → **Elon wins** (README must be immaculate)
3. Human-First Output → **LOCKED** ✓

**Elon's Non-Negotiables (Honored):**
1. String Matching Is Default → **LOCKED** ✓
2. No `npm init` Scaffolding in v1 → **LOCKED** ✓
3. Three Core Files, ~500 Lines → **LOCKED** ✓

---

*The game is won in the spaces between plays. Build the simple thing. Make it work. Make it beautiful. Ship.*

— Phil Jackson
