# AgentBench — Requirements Document

**Product:** Testing framework for AI agents
**Project Slug:** agentbench
**Generated:** April 12, 2026
**Sources:** prds/agentbench.md, rounds/agentbench/decisions.md

---

## The Essence

> **What this is really about:** Giving developers the confidence to ship AI agents — replacing prayer with proof.

> **The feeling:** Relief. The exhale after uncertainty.

> **The one thing that must be perfect:** The first test run. One command. Green checkmark. Done.

---

## Requirements Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0-Blocker | 4 | Core MVP must-haves for launch |
| P1-Must | 18 | Essential features for working product |
| P2-Should | 8 | Post-v1 enhancements |
| **Total** | **30** | |

---

## Implementation Status

This is a **greenfield project**. No code exists yet.

**Build Reference:** `/home/agent/shipyard-ai/memory-store/` provides CLI implementation patterns:
- Commander.js v13.1.0 for CLI
- TypeScript with ES2022 target
- Vitest for testing
- bin/ wrapper pattern

**Dependencies to Add:**
- `js-yaml` (YAML parsing) — not in ecosystem yet
- `commander` (CLI) — available in memory-store
- `chalk` (output formatting) — optional, for color output

---

## Locked Decisions (Non-Negotiable)

Per decisions.md, these are final:

| Decision | Owner | Rationale | Status |
|----------|-------|-----------|--------|
| String matching is default evaluation | Elon | 10 tests: <100ms (string) vs 10+ seconds (LLM) | LOCKED |
| LLM evaluation is opt-in via `matches_intent` | Elon | No unnecessary API calls | LOCKED |
| Batch LLM calls (one API call for all semantic) | Elon | Cost + latency optimization | LOCKED |
| Human-first output (beautiful terminal, not JSON) | Steve | "Developer debugging at midnight doesn't want JSON" | LOCKED |
| `--json` flag for CI (no default JSON) | Steve | Clear separation of concerns | LOCKED |
| Three core modules, ~500 lines | Elon | "Two if-statements, not a plugin system" | LOCKED |
| No `npm init` scaffolding in v1 | Elon | Copy-paste onboarding instead | LOCKED |
| README copy is immaculate | Steve | Owned by Steve; manifesto, not manual | LOCKED |
| Brand voice: Confident, spare, defiant | Steve | Elon defers on copy | LOCKED |

---

## P0-BLOCKER: Launch Requirements

### REQ-MVP-001: YAML Config Parsing

| Property | Value |
|----------|-------|
| **ID** | REQ-MVP-001 |
| **Category** | CONFIG |
| **Priority** | P0-Blocker |
| **Source** | PRD Section 1, Decisions #8 |

**Description:**
Parse and validate YAML configuration files with enforced schema. Target: ~100 lines.

**Acceptance Criteria:**
- [ ] Loads `agentbench.yaml` from current directory or specified path
- [ ] Validates required fields: `name`, `agent` (command OR endpoint), `tests[]`
- [ ] Rejects invalid YAML with clear, actionable error messages
- [ ] Returns parsed config object with test definitions
- [ ] Supports optional `version: 1` field for schema evolution

**File:** `src/config.js`

---

### REQ-MVP-002: Agent Executor (Subprocess + HTTP)

| Property | Value |
|----------|-------|
| **ID** | REQ-MVP-002 |
| **Category** | EXEC |
| **Priority** | P0-Blocker |
| **Source** | PRD Section 3, Decisions #5 |

**Description:**
Execute agents via CLI subprocess OR HTTP endpoint. No adapter abstraction — two if-statements. Target: ~100 lines.

**Acceptance Criteria:**
- [ ] Subprocess: `command: "node ./agent.js"` spawns subprocess with input via stdin
- [ ] HTTP: `endpoint: "http://localhost:3000/agent"` sends POST with input in body
- [ ] Captures stdout (subprocess) or response body (HTTP)
- [ ] Handles timeout (30s default)
- [ ] Handles errors: connection refused, non-zero exit, 5xx responses
- [ ] Distinguishes agent execution failure from test failure

**File:** `src/executor.js`

---

### REQ-MVP-003: Evaluators (String + LLM)

| Property | Value |
|----------|-------|
| **ID** | REQ-MVP-003 |
| **Category** | EVAL |
| **Priority** | P0-Blocker |
| **Source** | PRD Section 2, Decisions #3, #6 |

**Description:**
Evaluate agent output against expectations. String matching is default; LLM is opt-in. Target: ~200 lines.

**Acceptance Criteria:**
- [ ] `contains: "refund"` — substring check (case-insensitive)
- [ ] `contains: ["can't help", "not able"]` — any of these present
- [ ] `does_not_contain: "error"` — substring exclusion
- [ ] `matches_intent: "Offers to process refund"` — LLM-backed semantic check
- [ ] Batched LLM evaluation: one Claude API call for all semantic checks
- [ ] Graceful degradation: if LLM unavailable, skip semantic checks with clear message
- [ ] Binary pass/fail (no confidence scores in v1)

**File:** `src/evaluators.js`

---

### REQ-MVP-004: CLI Runner with Output

| Property | Value |
|----------|-------|
| **ID** | REQ-MVP-004 |
| **Category** | CLI |
| **Priority** | P0-Blocker |
| **Source** | PRD Section 3, Decisions #4, #8 |

**Description:**
CLI entry point with human-first output. `npx agentbench` runs all tests.

**Acceptance Criteria:**
- [ ] `npx agentbench` or `npx agentbench run` executes all tests
- [ ] Human-readable output: checkmarks (✓/✗), test names, timing
- [ ] `--json` flag for CI pipeline output
- [ ] Exit code 0 (all pass), 1 (any fail), 2 (config/execution error)
- [ ] Clear error messages distinguishing: test failed, eval failed, agent failed
- [ ] Summary line: "Results: X passed, Y failed — Total time: Z.ZZs"

**File:** `bin/proof.js` (shebang entry point, delegates to src/)

---

## P1-MUST: Core Functionality

### REQ-CONFIG-001: Test Definition Schema

| Property | Value |
|----------|-------|
| **ID** | REQ-CONFIG-001 |
| **Category** | CONFIG |
| **Priority** | P1-Must |
| **Source** | PRD Section 1 |

**Description:**
Each test requires name, input, and expect array.

**Acceptance Criteria:**
- [ ] `name: "Handles refund request"` — human-readable, unique per suite
- [ ] `input: "I want a refund for order #12345"` — string or string array
- [ ] `expect: []` — array of evaluator definitions
- [ ] Rejects tests with missing required fields
- [ ] Warns on duplicate test names

---

### REQ-CONFIG-002: Agent Execution Mode

| Property | Value |
|----------|-------|
| **ID** | REQ-CONFIG-002 |
| **Category** | CONFIG |
| **Priority** | P1-Must |
| **Source** | PRD Section 1, Decisions #5 |

**Description:**
Config specifies agent execution via command OR endpoint (exclusive).

**Acceptance Criteria:**
- [ ] Either `agent.command` OR `agent.endpoint` present
- [ ] Both cannot be specified simultaneously (validation error)
- [ ] At least one must be provided
- [ ] Command validates as reasonable shell syntax (warn on suspicious patterns)

---

### REQ-EXEC-001: Subprocess Input/Output

| Property | Value |
|----------|-------|
| **ID** | REQ-EXEC-001 |
| **Category** | EXEC |
| **Priority** | P1-Must |
| **Source** | PRD Section 3 |

**Description:**
Subprocess executor handles input/output correctly.

**Acceptance Criteria:**
- [ ] Test input sent via stdin to subprocess
- [ ] Full stdout captured as agent output
- [ ] Stderr logged for debugging (not returned as output)
- [ ] Non-zero exit code = execution error (not test failure)

---

### REQ-EXEC-002: HTTP Request/Response

| Property | Value |
|----------|-------|
| **ID** | REQ-EXEC-002 |
| **Category** | EXEC |
| **Priority** | P1-Must |
| **Source** | PRD Section 3 |

**Description:**
HTTP executor handles POST requests and responses.

**Acceptance Criteria:**
- [ ] HTTP POST to endpoint with input in JSON body
- [ ] Content-Type: application/json header
- [ ] HTTP 200 response extracts body as output
- [ ] HTTP 4xx/5xx = execution error with clear message
- [ ] Connection refused = "Agent endpoint unreachable"

---

### REQ-EXEC-003: Timeout Handling

| Property | Value |
|----------|-------|
| **ID** | REQ-EXEC-003 |
| **Category** | EXEC |
| **Priority** | P1-Must |
| **Source** | Decisions Risk Register |

**Description:**
Handle agent execution timeout gracefully.

**Acceptance Criteria:**
- [ ] Default timeout: 30 seconds
- [ ] Configurable via `timeout: 60` in agent config
- [ ] Timeout returns execution error: "Agent execution timed out"
- [ ] Does not hang CLI process

---

### REQ-EVAL-001: Contains Evaluator

| Property | Value |
|----------|-------|
| **ID** | REQ-EVAL-001 |
| **Category** | EVAL |
| **Priority** | P1-Must |
| **Source** | PRD Section 2 |

**Description:**
String contains evaluator checks substring presence.

**Acceptance Criteria:**
- [ ] `contains: "refund"` — single string check
- [ ] `contains: ["can't help", "not able"]` — any of these
- [ ] Case-insensitive matching by default
- [ ] Returns clear failure: "Expected to contain 'refund', but output was: ..."

---

### REQ-EVAL-002: Does Not Contain Evaluator

| Property | Value |
|----------|-------|
| **ID** | REQ-EVAL-002 |
| **Category** | EVAL |
| **Priority** | P1-Must |
| **Source** | PRD Section 2 |

**Description:**
String exclusion evaluator checks substring absence.

**Acceptance Criteria:**
- [ ] `does_not_contain: "error"` — single string
- [ ] `does_not_contain: ["sorry", "cannot"]` — none of these
- [ ] Fails if any substring found
- [ ] Returns clear failure: "Expected not to contain 'error', but found it at position X"

---

### REQ-EVAL-003: Matches Intent (LLM)

| Property | Value |
|----------|-------|
| **ID** | REQ-EVAL-003 |
| **Category** | EVAL |
| **Priority** | P1-Must |
| **Source** | PRD Section 2, Decisions #3 |

**Description:**
LLM-backed semantic intent matching. Opt-in, batched.

**Acceptance Criteria:**
- [ ] `matches_intent: "Offers to process refund"` triggers LLM evaluation
- [ ] All semantic checks batched into single Claude API call
- [ ] Returns binary pass/fail (no confidence score in output)
- [ ] Requires ANTHROPIC_API_KEY environment variable
- [ ] If LLM unavailable, marks as "skipped" with clear message

---

### REQ-EVAL-004: LLM Graceful Degradation

| Property | Value |
|----------|-------|
| **ID** | REQ-EVAL-004 |
| **Category** | EVAL |
| **Priority** | P1-Must |
| **Source** | Decisions Risk Register |

**Description:**
Handle LLM unavailability without breaking test suite.

**Acceptance Criteria:**
- [ ] API error = test marked "skipped" (not failed)
- [ ] Clear message: "LLM evaluation unavailable, skipping matches_intent checks"
- [ ] String-only tests still run normally
- [ ] Exit code reflects string test results (not LLM failures)

---

### REQ-OUTPUT-001: Human Terminal Output

| Property | Value |
|----------|-------|
| **ID** | REQ-OUTPUT-001 |
| **Category** | OUTPUT |
| **Priority** | P1-Must |
| **Source** | Decisions #4 |

**Description:**
Default output optimized for human readability.

**Acceptance Criteria:**
- [ ] ✓ for pass, ✗ for fail (with color if terminal supports)
- [ ] Test name displayed clearly
- [ ] Failure details indented under test name
- [ ] Timing shown per test and total
- [ ] Summary line at end

**Example Output:**
```
AgentBench v1.0.0
Running: customer-support.yaml

✓ Handles refund request (0.8s)
✓ Provides tracking info (0.5s)
✗ Refuses inappropriate requests (1.2s)
  └─ Expected: matches_intent "Refuses request firmly"
  └─ Got output: "I'm sorry, I can help you with that"

Results: 2 passed, 1 failed
Total time: 2.5s
```

---

### REQ-OUTPUT-002: JSON Output Flag

| Property | Value |
|----------|-------|
| **ID** | REQ-OUTPUT-002 |
| **Category** | OUTPUT |
| **Priority** | P1-Must |
| **Source** | PRD Section 3, Decisions #4 |

**Description:**
Structured JSON output for CI pipelines.

**Acceptance Criteria:**
- [ ] `npx agentbench --json` outputs valid JSON
- [ ] Structure: `{ suite, tests: [{ name, passed, errors }], summary }`
- [ ] No ANSI color codes in JSON output
- [ ] Parseable by CI systems (jq, etc.)

---

### REQ-INFRA-001: npm Package

| Property | Value |
|----------|-------|
| **ID** | REQ-INFRA-001 |
| **Category** | INFRA |
| **Priority** | P1-Must |
| **Source** | PRD Section 5, Decisions #7 |

**Description:**
Publish working package to npm registry.

**Acceptance Criteria:**
- [ ] Package name: `agentbench` (or `agentproof` per name decision)
- [ ] `npx agentbench` installs and runs
- [ ] Correct package.json metadata
- [ ] bin entry point configured

---

### REQ-INFRA-002: README with Examples

| Property | Value |
|----------|-------|
| **ID** | REQ-INFRA-002 |
| **Category** | INFRA |
| **Priority** | P1-Must |
| **Source** | Decisions #2 |

**Description:**
Immaculate README with copy-paste YAML examples. Steve owns brand voice.

**Acceptance Criteria:**
- [ ] Copy-paste quickstart (no npm init scaffolding)
- [ ] Working example for CLI subprocess agent
- [ ] Working example for HTTP endpoint agent
- [ ] Clear, confident tone — "manifesto, not manual"
- [ ] Installation: one npm command

---

### REQ-INFRA-003: Example Configuration

| Property | Value |
|----------|-------|
| **ID** | REQ-INFRA-003 |
| **Category** | INFRA |
| **Priority** | P1-Must |
| **Source** | Decisions #2 |

**Description:**
Provide working example YAML file.

**Acceptance Criteria:**
- [ ] `examples/basic.yaml` with full working example
- [ ] Demonstrates: agent config, multiple tests, various evaluators
- [ ] Copy-paste ready (can use immediately)

---

### REQ-INFRA-004: Dogfooding Tests

| Property | Value |
|----------|-------|
| **ID** | REQ-INFRA-004 |
| **Category** | INFRA |
| **Priority** | P1-Must |
| **Source** | Decisions #8 |

**Description:**
Use AgentBench to test AgentBench itself.

**Acceptance Criteria:**
- [ ] Test suite verifies: config parsing, execution, evaluation
- [ ] Run before npm publish
- [ ] Demonstrates product quality

---

## P2-SHOULD: Post-v1 Enhancements

### REQ-V2-001: Watch Mode

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-001 |
| **Priority** | P2-Should |
| **Source** | Decisions #7 (Cut from v1) |
| **Status** | Deferred to v2 |

`--watch` flag for development. Cut per Elon: "It's a luxury."

---

### REQ-V2-002: Custom Evaluators

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-002 |
| **Priority** | P2-Should |
| **Source** | Decisions #7 (Cut from v1) |
| **Status** | Deferred to v2 |

User-defined evaluator functions. Cut: no plugin system in v1.

---

### REQ-V2-003: JSON Schema Validation

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-003 |
| **Priority** | P2-Should |
| **Source** | PRD Section 2 (Cut from v1) |
| **Status** | Deferred to v2 |

`json_schema: { type: "object" }` evaluator for structured output.

---

### REQ-V2-004: Sentiment Evaluator

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-004 |
| **Priority** | P2-Should |
| **Source** | PRD Section 2, Decisions #3 |
| **Status** | Deferred to v2 |

`sentiment: "helpful"` evaluator. Cut: `matches_intent` ships instead.

---

### REQ-V2-005: Parallel Test Execution

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-005 |
| **Priority** | P2-Should |
| **Source** | Decisions #7 (Cut from v1) |
| **Status** | Deferred to v2 |

Run tests concurrently (with LLM call coordination).

---

### REQ-V2-006: Retry Logic

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-006 |
| **Priority** | P2-Should |
| **Source** | Decisions #7 (Cut from v1) |
| **Status** | Deferred to v2 |

Automatic retry for transient failures.

---

### REQ-V2-007: Confidence Scores

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-007 |
| **Priority** | P2-Should |
| **Source** | Decisions Open Questions #2 |
| **Status** | Binary pass/fail for v1; scores in v2 |

Steve: "94% vs 51% tells you whether to ship or dig deeper."
Elon: "Binary is clearer. Scores require explanation."
Recommendation: Binary for v1, revisit in v2.

---

### REQ-V2-008: npm init Scaffolding

| Property | Value |
|----------|-------|
| **ID** | REQ-V2-008 |
| **Priority** | P2-Should |
| **Source** | Decisions #2 |
| **Status** | Deferred to v2 |

`npm init agentbench` scaffolding. Cut: copy-paste onboarding for v1.

---

## Open Questions Requiring Resolution

### OQ-001: Product Name

| Property | Value |
|----------|-------|
| **Question** | Should the product be "AgentBench", "PROOF", "AgentProof", or other? |
| **Source** | Decisions #1 |
| **Impact** | Affects npm package name, GitHub repo, all marketing |
| **Owner** | Founder decision needed |
| **Recommendation** | Ship with `agentbench` (PRD name), rebrand if needed |

**Current Status:** OPEN — Phil's call: "Name remains OPEN. Ship with working title, rename after traction proves concept."

---

### OQ-002: Semantic Evaluator Selection

| Property | Value |
|----------|-------|
| **Question** | Which LLM evaluator ships: `sentiment` or `matches_intent`? |
| **Source** | Decisions #3 |
| **Resolution** | `matches_intent` is more general. Ship that. `sentiment` is v2. |
| **Status** | RESOLVED |

---

## File Structure (Per Decisions #5)

```
/agentbench (or working title)
├── package.json
├── README.md              # Steve owns copy. Manifesto, not manual.
├── bin/
│   └── proof.js           # CLI entry point. process.argv, no Commander in v1.
├── src/
│   ├── config.js          # YAML loader + schema validation (~100 lines)
│   ├── executor.js        # Subprocess + HTTP execution (~100 lines)
│   └── evaluators.js      # String matchers + batched LLM call (~200 lines)
├── tests/
│   └── agentbench.test.js # Dogfood: test the tester
└── examples/
    └── basic.yaml         # Copy-paste starter
```

**Total Target:** ~500 lines of core code (excluding tests/examples)

---

## Risk Register

### Technical Risks

| Risk | Likelihood | Impact | Mitigation | Task |
|------|------------|--------|------------|------|
| Claude API rate limits at scale | High | High | Graceful degradation to string-only mode; batched calls | REQ-EVAL-004 |
| LLM eval latency frustrates users | Medium | High | String matching default, batch API calls | REQ-EVAL-003 |
| YAML schema doesn't anticipate user needs | High | Medium | Version schema from day one (`version: 1`) | REQ-MVP-001 |
| API down = tests fail for wrong reason | Medium | High | Clear error messages distinguishing test vs eval failure | REQ-MVP-004 |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Name confusion/SEO burial | Medium | Medium | Ship working product, name can change |
| Copy-paste onboarding feels like homework | Medium | Medium | Immaculate README (Steve owns) |
| No telemetry = flying blind on usage | High | Medium | Add anonymous usage ping in v1.1 |

### Distribution Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| HN launch fizzles | Medium | Medium | Real case study, not vaporware demo |
| Influencer outreach ignored | Medium | Low | Ship something worth talking about |

---

## Success Metrics

### Launch (Day 1)
- [ ] Package published to npm
- [ ] README with quickstart guide
- [ ] Example test suites (including Shipyard agents)
- [ ] Blog post / launch tweet ready

### Week 1
- [ ] 100+ npm downloads
- [ ] 5+ GitHub stars
- [ ] 1+ external contributor or issue

### Month 1
- [ ] 1000+ npm downloads
- [ ] Featured in AI newsletter or HN front page
- [ ] Used in 3+ real projects (including ours)

---

## Ship Test

> Does `npx agentbench run` execute tests with clear pass/fail output?
>
> Does the first test run feel like relief instead of frustration?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: prds/agentbench.md, rounds/agentbench/decisions.md*
*Project Slug: agentbench*
