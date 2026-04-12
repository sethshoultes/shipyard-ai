# AgentBench — Final Decisions
## The Build Blueprint
**Consolidated by Phil Jackson, The Zen Master**
**Date:** 2026-04-12

*The triangle offense works because everyone knows their role. Every player knows where to be. This document is that playbook.*

---

## I. Locked Decisions

### 1. Product Name

| Aspect | Detail |
|--------|--------|
| **Proposed** | "Pulse" (Steve), "AgentBench" (default), "AgentProof" (Elon compromise) |
| **Champion** | Steve pushed "Pulse" — visceral, one syllable, verb and noun |
| **Winner** | **DEFERRED** — Ship as "AgentBench" |
| **Resolution** | Elon's argument won on pragmatics: "Names are mutable. Shipping dates are not." Steve's branding instincts are valid, but naming debates were consuming productive time. Codebase uses configurable brand constant for future rebrand. |

**Phil's Call:** Ship with "AgentBench." Rebrand to "Pulse" or "Proof" only after traction validates the concept. The product proves the name, not the reverse.

---

### 2. First-Run Experience

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | `npm init pulse` scaffolding with intelligent test generation, "60 seconds to revelation," first test designed to fail |
| **Elon's Position** | Copy-paste from README, no scaffolding, ship faster |
| **Winner** | **ELON** |
| **Why** | 2-3 days of scaffolding work delays core value. Time-to-ship beats time-to-belief for v1. |

**Concession Trade:** Steve did not explicitly concede, but Phil ruled. In exchange: Steve owns README experience. If copy-paste feels like homework, we failed.

**Phil's Call:** LOCKED. Copy-paste for v1. README must be immaculate.

---

### 3. Confidence Scores

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | "The thermometer is the product." Show 0.94 vs 0.51 — developers deserve to know margin quality. Color-coded, prominent, impossible to ignore. |
| **Elon's Position** | "Pass/fail is clearer." Scores require explanation. "What does 0.73 mean?" leads to documentation burden and user confusion. |
| **Winner** | **ELON for v1** |
| **Why** | Binary pass/fail matches mental models and CI pipelines. Clarity over nuance for launch. |

**Phil's Call:** LOCKED for v1. Pass/fail binary output. Confidence score logged internally for debugging but not displayed. Revisit in v1.1 based on user feedback.

---

### 4. Default Evaluation Mode

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | (Implicit acceptance of PRD's LLM-primary approach) |
| **Elon's Position** | String matching default, LLM opt-in only. 10 tests: <100ms vs 10+ seconds. Cost and speed matter. |
| **Winner** | **ELON** |
| **Steve's Concession** | "Philosophically annoying, practically correct. I'll take the L." |

**Phil's Call:** LOCKED. String matching (`contains`, `does_not_contain`) is default. Semantic evaluation via `matches_intent` is explicit opt-in.

---

### 5. Output Format

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | Human-first terminal output. "A developer debugging at midnight doesn't want JSON." Beautiful, minimal, clinical precision. |
| **Elon's Position** | JSON only — parseable, machine-readable, CI-friendly. |
| **Winner** | **STEVE** |
| **Elon's Concession** | "Output clarity is UX... Verbose logging is a bug, not a feature." |

**Phil's Call:** LOCKED. Human-readable output by default with checkmarks, colors, timing. `--json` flag for CI pipelines.

---

### 6. Architecture

| Aspect | Detail |
|--------|--------|
| **PRD Proposal** | Four layers: CLI, Runner, Adapter, Evaluator |
| **Elon's Position** | Three files, ~500 lines. "Two if-statements, not a plugin system." Adapter layer is premature abstraction. |
| **Winner** | **ELON** |

**Phil's Call:** LOCKED. Three core modules:
1. **config.js** — YAML parse + validate (~115 lines)
2. **executor.js** — Subprocess + HTTP execution, no adapter abstraction (~77 lines)
3. **evaluators.js** — String ops + batched LLM call (~162 lines)

---

### 7. LLM Evaluation Strategy

| Aspect | Detail |
|--------|--------|
| **Implicit PRD** | One API call per evaluation |
| **Elon's Position** | Batch evaluations. One call for N tests. 20x faster, 20x cheaper. |
| **Winner** | **ELON** |
| **Steve's Concession** | "One call for N evaluations is obviously better. Ship it that way from day one." |

**Phil's Call:** LOCKED. Batch LLM evaluations from v1. Don't retrofit later.

---

### 8. Parallel Test Execution

| Aspect | Detail |
|--------|--------|
| **PRD Position** | Phase 2 feature |
| **Elon's Position** | "Without parallelism, this tool is unusably slow. It's v1 or nothing." |
| **Steve's Concession** | "Elon's right. Sequential tests at 500ms each means 50 tests take 25 seconds. That's death." |
| **Winner** | **ELON** |

**Phil's Call:** LOCKED. Parallel execution ships in v1. Non-negotiable for usability.

---

### 9. Brand Voice

| Aspect | Detail |
|--------|--------|
| **Steve's Position** | "Clinical precision with quiet confidence." Like a senior engineer who's seen a thousand failures. Diagnostic, respectful. |
| **Elon's Concession** | "Brand voice matters... Our README should read like a manifesto, not a manual. I'll defer to Steve on copy." |
| **Winner** | **STEVE** |

**Phil's Call:** LOCKED. Steve owns brand voice. Error format: "Sentiment expected: firm. Actual: apologetic." Short sentences. No hedging. Promises we keep.

---

### 10. Features Cut from v1

| Feature | Who Cut It | Status |
|---------|------------|--------|
| `--watch` mode | Elon | Steve conceded: "He's right. It's a luxury." |
| Custom evaluator plugins | Both | Consensus: "That's v3." |
| JSON Schema validation | Elon | No objection |
| Multiple output formats | Resolved | Human default + `--json` flag |
| Retry logic | Elon | No objection |
| Multi-turn conversations | Steve | Both agree: "tar pit" |
| Web dashboard | Steve | Both agree: "Terminal is sacred" |
| `npm init` scaffolding | Elon | Steve did not concede; Phil ruled |
| CLI subprocess adapter | Deferred | HTTP-only for v1; 95% of agents are APIs |

---

### 11. API Key Policy

| Aspect | Detail |
|--------|--------|
| **Elon's Position** | "User provides their own API key. We don't subsidize LLM costs." `ANTHROPIC_API_KEY` in env or error. Only sustainable scaling model. |
| **Steve** | No objection |
| **Board** | Buffett: "Excellent unit economics for free tool." |

**Phil's Call:** LOCKED. User's own API key required for semantic evaluation. Graceful degradation to string-only mode if unavailable.

---

## II. MVP Feature Set (What Ships in v1)

### Core Functionality
- [x] YAML config parsing with schema validation
- [x] CLI subprocess executor (`command` type)
- [x] HTTP executor (`http` type with `endpoint`)
- [x] String evaluators: `contains`, `does_not_contain`
- [x] Semantic evaluator: `matches_intent` (LLM-backed, opt-in)
- [x] Batched LLM evaluation (one API call for all semantic checks)
- [x] Parallel test execution
- [x] Human-first terminal output with checkmarks and timing
- [x] `--json` flag for CI output
- [x] Exit codes: 0 (pass), 1 (fail), 2 (config error)

### User Experience
- [x] README with copy-paste YAML examples (Steve owns)
- [x] One command to run tests: `npx agentbench config.yaml`
- [x] Clear error messages distinguishing test failure vs eval failure
- [x] Graceful degradation when Claude API unavailable
- [x] Clinical, precise error format per Steve's specification

### Distribution
- [x] npm publish as `agentbench`
- [ ] HN launch post with real case study
- [ ] 10 named DMs to AI developers/influencers

---

## III. File Structure (What Gets Built)

```
/agentbench
├── package.json           # npm config, bin entry, dependencies
├── package-lock.json      # Locked dependencies
├── README.md              # Steve owns copy. Manifesto, not manual.
├── bin/
│   └── agentbench.js      # CLI entry point (~406 lines)
├── src/
│   ├── config.js          # YAML loader + schema validation (~115 lines)
│   ├── executor.js        # Subprocess + HTTP execution (~77 lines)
│   └── evaluators.js      # String matchers + batched LLM (~162 lines)
├── tests/
│   └── agentbench.test.js # Dogfood: test the tester (vitest format)
└── examples/
    ├── basic.yaml         # Comprehensive starter (~119 lines)
    ├── http-agent.yaml    # HTTP endpoint example (~110 lines)
    └── mock-agent.js      # Test agent for examples (~59 lines)
```

**Total Core Code:** ~354 lines (config + evaluators + executor)
**Target:** ~500 lines including CLI
**Status:** Within acceptable range

---

## IV. Open Questions (Require Resolution)

### OQ-1: Product Name (Final Decision Needed)

**Options:**
- `agentbench` (current, safe, SEO-friendly)
- `pulse` (Steve's choice — visceral, memorable)
- `proof` (strong verb/noun, but GitHub conflicts)
- `agentproof` (Elon's compromise)

**Blocker Level:** Low for v1, Medium for marketing
**Recommendation:** Ship as `agentbench`. Marketing can alias to `pulse` later if traction warrants.
**Owner:** Founder decision

---

### OQ-2: Which Semantic Evaluator Ships?

**Context:** Elon said "One LLM evaluator (sentiment OR matches_intent, not both)"
**Options:**
- `matches_intent` — More general, evaluates if output matches described intent
- `sentiment` — Evaluates emotional tone (firm, apologetic, neutral)

**Recommendation:** Ship `matches_intent` only. It subsumes sentiment checking ("Agent should respond with firm, professional tone"). `sentiment` as dedicated evaluator is v1.1.
**Owner:** Engineering

---

### OQ-3: YAML Schema Versioning

**Elon's Position:** "Version your YAML schema from day one: `version: 1`"
**Current State:** Not addressed in implementation
**Recommendation:** Add `version: 1` field to schema. Trivial to implement, critical for future evolution.
**Owner:** Engineering (5-minute fix)

---

### OQ-4: Telemetry

**Board Consensus:** "Cannot make informed decisions without data" (Jensen, Buffett)
**Recommendation:** Add opt-in anonymous telemetry in v1.1:
- Tests run per week
- Evaluator types used
- Pass/fail rates
- CI vs manual execution
**Owner:** Product (v1.1 scope)

---

## V. Risk Register

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Claude API rate limits** | High at scale | High | Graceful degradation to string-only; exponential backoff |
| **LLM evaluation latency** | Medium | High | String matching default; batch API calls; parallel execution |
| **YAML schema evolution** | High | Medium | Version schema from day one (`version: 1`) |
| **API outage = wrong failures** | Medium | High | Clear error messages: "Evaluation skipped (API unavailable)" vs "Test failed" |
| **Batch hallucination** | Low | Medium | Single-test fallback if batch results seem inconsistent |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Name confusion** | Medium | Medium | Ship working product; name can change |
| **Copy-paste onboarding friction** | Medium | Medium | Steve owns README; make examples flawless |
| **No telemetry = flying blind** | High | Medium | Add opt-in usage tracking v1.1 |
| **Plugin requests before stable** | High | Medium | Say no. "That's v3." Refer to roadmap |
| **Confidence score requests** | Medium | Low | Log internally; surface in v1.1 if demand proven |

### Strategic Risks (per Board)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **No monetization path** | Certain | High | Define hosted tier or explicit loss-leader strategy before v1.1 |
| **No competitive moat** | High | High | Community evaluator library; test case corpus; CI integrations |
| **No retention mechanics** | High | High | Streak tracking, CI wizard, notifications (see retention roadmap) |
| **LangChain/Anthropic ships competing tool** | Medium | Critical | Speed to market; community lock-in; partnership conversation |

### Distribution Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **HN launch fizzles** | Medium | Medium | Real case study with metrics, not vaporware demo |
| **Framework integration blocked** | Medium | Medium | Ship standalone first; integrations are v2 |
| **Influencer outreach ignored** | Medium | Low | Ship something worth talking about |

---

## VI. QA Blockers (Must Resolve Before Ship)

Per Margaret Hamilton's QA Pass 2:

| ID | Severity | Issue | Resolution |
|----|----------|-------|------------|
| GIT-001 | P0 | Uncommitted deliverable files | `git add deliverables/agentbench/ && git commit` |
| TEST-001 | P0 | `npm test` fails (no vitest-compatible tests) | Rename/rewrite test-loader.js or remove vitest |
| EXAMPLE-001 | P1 | basic.yaml test 8 fails (mock agent mismatch) | Fix mock-agent.js or adjust expectations |
| DOC-001 | P1 | README says `agentbench test config.yaml`, actual is `agentbench config.yaml` | Update README |

**Ship Criteria:** All P0 resolved. P1 should be resolved.

---

## VII. Board Conditions for Proceeding

The Board issued a **PROCEED (with conditions)** verdict. Average score: 5.5/10.

### Required Before v1.1
1. **Monetization Decision** — Hosted tier, enterprise features, or explicit loss-leader (Buffett)
2. **Opt-in Telemetry** — Track usage to inform decisions (Jensen)
3. **CI Integration Guide** — Guided GitHub Actions setup (Shonda)
4. **README Tone Polish** — Add warmth, celebrate success (Oprah)

### Required Before v2.0
5. **Platform vs Tool Decision** — Stay minimal or pursue ecosystem play (Jensen)
6. **Retention Mechanisms** — Streaks, alerts, digests (Shonda)
7. **Content Infrastructure** — Blog, Discord, test library (Shonda)
8. **Anthropic Partnership Conversation** — Co-marketing, ecosystem listing (Buffett)

### Board Member Verdicts

| Reviewer | Score | Key Concern |
|----------|-------|-------------|
| **Buffett** | 5/10 | "This is currently a hobby, not a business" |
| **Jensen** | 6/10 | "You've built a good v1 tool. You haven't built a business." |
| **Oprah** | 7/10 | "Built for people who already know they need it" |
| **Shonda** | 4/10 | "Solid bones but no heartbeat. Nothing brings users back." |

---

## VIII. The Essence (Don't Lose Sight)

> **What this is really about:**
> Replacing prayer with proof when you ship AI.

> **The feeling:**
> The exhale. Relief. The confidence to deploy.

> **The one thing that must be perfect:**
> The first test run. One command. Truth.

> **Creative direction:**
> Quiet certainty.

---

## IX. Decision Accountability

### Steve's Non-Negotiables

| Position | Outcome |
|----------|---------|
| "The Name Is Pulse/PROOF" | DEFERRED — Ship as AgentBench, rebrand later |
| `npm init` scaffolding in v1 | ELON WINS — README must be immaculate |
| Human-First Output | **LOCKED** ✓ |
| Confidence Scores Prominent | ELON WINS for v1 — Binary pass/fail, scores logged |
| Brand Voice | **LOCKED** ✓ — Steve owns copy |

### Elon's Non-Negotiables

| Position | Outcome |
|----------|---------|
| String Matching Default | **LOCKED** ✓ |
| No `npm init` Scaffolding v1 | **LOCKED** ✓ |
| Three Core Files, ~500 Lines | **LOCKED** ✓ |
| Parallel Execution v1 | **LOCKED** ✓ |
| No Custom Evaluator Plugins | **LOCKED** ✓ |
| User's Own API Key | **LOCKED** ✓ |

---

## X. Next Actions

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| P0 | Resolve QA blockers (GIT-001, TEST-001) | Engineering | Before ship |
| P0 | Fix example test mismatch (EXAMPLE-001) | Engineering | Before ship |
| P0 | Update README CLI commands (DOC-001) | Engineering | Before ship |
| P1 | Add `version: 1` to YAML schema | Engineering | Before ship |
| P1 | Decide final semantic evaluator name | Product | Before ship |
| P2 | Monetization strategy decision | Leadership | 1 week post-ship |
| P2 | Implement opt-in telemetry | Engineering | 2 weeks post-ship |
| P2 | GitHub Actions integration guide | DevRel | 2 weeks post-ship |
| P3 | Retention features spec (per Shonda roadmap) | Product | 45 days post-ship |

---

## XI. Process Retrospective (per Marcus Aurelius)

**Process Adherence Score: 6/10**

### What Worked
- Dialectic debate produced clarity
- Scope discipline was maintained
- Essence survived from ideation to QA
- Multi-perspective board review revealed blind spots

### What Didn't Work
- Strategic direction deferred, not decided
- Retention was afterthought
- Name never resolved
- Emotional polish sacrificed for speed
- Example test suite shipped with failing test

### Key Learning
> "A product that works is necessary but not sufficient; a product must also have a reason to exist as a business, a reason for users to return, and a name its makers believe in."

---

*The game is won in the spaces between plays. This document defines the plays. Now execute.*

*Build the simple thing. Make it work. Make it beautiful. Ship.*

— Phil Jackson
The Zen Master
