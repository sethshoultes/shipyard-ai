# Phase 1 Plan — AgentBench Core MVP

**Generated:** April 12, 2026
**Project Slug:** agentbench
**Product Name:** AgentBench (working title — per decisions.md, name remains OPEN)
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 9
**Waves:** 3
**Status:** READY FOR BUILD

---

## The Essence

> **What this is really about:** Giving developers the confidence to ship AI agents — replacing prayer with proof.

> **The feeling:** Relief. The exhale after uncertainty.

> **The one thing that must be perfect:** The first test run. One command. Green checkmark. Done.

---

## Build Status

**Current State:** Greenfield — no code exists yet
**Build Reference:** `/home/agent/shipyard-ai/memory-store/` for CLI patterns (Commander.js, TypeScript, Vitest)
**Architecture:** Three core modules (~500 lines total per Decisions #5)

| Component | Target Lines | Status | Dependencies |
|-----------|-------------|--------|--------------|
| src/config.js | ~100 | NOT STARTED | js-yaml |
| src/executor.js | ~100 | NOT STARTED | Node child_process, fetch |
| src/evaluators.js | ~200 | NOT STARTED | Claude API |
| bin/agentbench.js | ~50 | NOT STARTED | None (process.argv) |

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-MVP-001: YAML Config Parsing | phase-1-task-1 | 1 |
| REQ-MVP-002: Agent Executor | phase-1-task-2 | 1 |
| REQ-MVP-003: Evaluators | phase-1-task-3 | 1 |
| REQ-MVP-004: CLI Runner | phase-1-task-4 | 2 |
| REQ-INFRA-002: README | phase-1-task-5 | 2 |
| REQ-INFRA-003: Example Config | phase-1-task-6 | 2 |
| REQ-INFRA-004: Dogfooding Tests | phase-1-task-7 | 3 |
| REQ-INFRA-001: npm Package | phase-1-task-8 | 3 |
| Sara Blakely Review | phase-1-task-9 | 3 |

---

## Documentation References

This plan cites specific sections from the source documents:

- **decisions.md Section "Locked Decisions":** Architecture (#5), Output format (#4), Default evaluation (#3)
- **decisions.md Section "MVP Feature Set":** CLI commands, evaluators, output format
- **decisions.md Section "File Structure":** Three files, ~500 lines total
- **decisions.md Section "Risk Register":** API rate limits, error messaging
- **prds/agentbench.md Section 1:** Test Definition Format (YAML schema)
- **prds/agentbench.md Section 2:** Expectation Types (contains, does_not_contain, matches_intent)
- **prds/agentbench.md Section 3:** CLI Interface (npx agentbench)
- **prds/agentbench.md Section 4:** Output Report (human-readable format)
- **memory-store/src/cli.ts:** Reference CLI implementation (~450 lines, Commander.js pattern)

---

## Wave Execution Order

### Wave 1 (Parallel) — Core Modules

Three independent modules that can be built simultaneously. No dependencies on each other.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Implement YAML config loader and validator</title>
  <requirement>REQ-MVP-001: YAML Config Parsing (P0-Blocker)</requirement>
  <description>
    Per decisions.md #5 and #8: Config loader parses YAML and validates schema.
    Target ~100 lines. Uses js-yaml library. Supports version: 1 field for
    future schema evolution per decisions.md Open Questions #4.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="YAML schema definition (Section 1)" />
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Architecture decisions (#5, #8)" />
    <file path="/home/agent/shipyard-ai/memory-store/src/cli.ts" reason="Reference pattern for file loading" />
  </context>

  <steps>
    <step order="1">Create project directory: mkdir -p projects/agentbench/src</step>
    <step order="2">Initialize package.json with name, version, bin entry</step>
    <step order="3">Add dependency: js-yaml</step>
    <step order="4">Create src/config.js with loadConfig(filePath) function</step>
    <step order="5">Implement YAML parsing with js-yaml.load()</step>
    <step order="6">Validate required fields: name, agent (command OR endpoint), tests[]</step>
    <step order="7">Validate each test has: name, input, expect[]</step>
    <step order="8">Support optional version: 1 field</step>
    <step order="9">Return clear error messages for validation failures</step>
    <step order="10">Export loadConfig function</step>
  </steps>

  <verification>
    <check type="test">Unit test: valid YAML loads correctly</check>
    <check type="test">Unit test: invalid YAML returns actionable error</check>
    <check type="test">Unit test: missing required field detected</check>
    <check type="test">Unit test: both command AND endpoint rejected</check>
    <check type="bash">wc -l src/config.js | verify under 100 lines</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(config): implement YAML config loader with validation

Per decisions.md #5:
- YAML parsing with js-yaml
- Schema validation for required fields
- Clear error messages on validation failure
- Support for version: 1 field
- Target: ~100 lines

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Implement agent executor (subprocess + HTTP)</title>
  <requirement>REQ-MVP-002: Agent Executor (P0-Blocker)</requirement>
  <description>
    Per decisions.md #5: "Two if-statements, not a plugin system."
    Subprocess via child_process.spawn, HTTP via native fetch.
    Target ~100 lines. No adapter abstraction.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Agent execution modes (Section 3)" />
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Architecture decision (#5)" />
  </context>

  <steps>
    <step order="1">Create src/executor.js</step>
    <step order="2">Implement executeAgent(agentConfig, input) function</step>
    <step order="3">If agent.command: spawn subprocess, write input to stdin, capture stdout</step>
    <step order="4">If agent.endpoint: POST to URL with JSON body { input }</step>
    <step order="5">Implement timeout handling (default 30s, configurable)</step>
    <step order="6">Handle subprocess errors: non-zero exit → "Agent exited with code X"</step>
    <step order="7">Handle HTTP errors: 4xx/5xx → "Agent endpoint returned HTTP X"</step>
    <step order="8">Handle connection refused → "Agent endpoint unreachable"</step>
    <step order="9">Return { output, error, executionTime } object</step>
    <step order="10">Export executeAgent function</step>
  </steps>

  <verification>
    <check type="test">Unit test: subprocess execution with stdin/stdout</check>
    <check type="test">Unit test: HTTP POST with JSON body</check>
    <check type="test">Unit test: timeout triggers error (not hang)</check>
    <check type="test">Unit test: non-zero exit captured as error</check>
    <check type="test">Unit test: connection refused captured as error</check>
    <check type="bash">wc -l src/executor.js | verify under 100 lines</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(executor): implement subprocess and HTTP agent execution

Per decisions.md #5:
- Two if-statements, not a plugin system
- Subprocess via child_process.spawn
- HTTP via native fetch
- Timeout handling (30s default)
- Clear error messages for failures
- Target: ~100 lines

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Implement evaluators (string matching + LLM batched)</title>
  <requirement>REQ-MVP-003: Evaluators (P0-Blocker)</requirement>
  <description>
    Per decisions.md #3 and #6: String matching is default, LLM is opt-in.
    Batch all semantic evaluations into single Claude API call.
    Target ~200 lines. Graceful degradation when LLM unavailable.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Evaluator types (Section 2)" />
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Evaluation strategy (#3, #6)" />
  </context>

  <steps>
    <step order="1">Create src/evaluators.js</step>
    <step order="2">Implement contains(output, expected) - case-insensitive substring check</step>
    <step order="3">Handle contains with array: any match = pass</step>
    <step order="4">Implement doesNotContain(output, forbidden) - substring exclusion</step>
    <step order="5">Handle doesNotContain with array: any match = fail</step>
    <step order="6">Implement collectSemanticChecks(tests) - gather all matches_intent</step>
    <step order="7">Implement batchEvaluateSemantic(checks) - single Claude API call</step>
    <step order="8">Format prompt: list all intents + outputs, ask for pass/fail per check</step>
    <step order="9">Parse Claude response into individual results</step>
    <step order="10">Implement graceful degradation: if API error, mark as skipped</step>
    <step order="11">Return { passed, error, skipped } for each check</step>
    <step order="12">Export evaluate(output, expectation) function</step>
  </steps>

  <verification>
    <check type="test">Unit test: contains single string</check>
    <check type="test">Unit test: contains array (any match)</check>
    <check type="test">Unit test: does_not_contain single string</check>
    <check type="test">Unit test: does_not_contain array (any match fails)</check>
    <check type="test">Unit test: matches_intent with mock Claude response</check>
    <check type="test">Unit test: LLM unavailable → skipped, not failed</check>
    <check type="test">Unit test: batched evaluation with multiple intents</check>
    <check type="bash">wc -l src/evaluators.js | verify under 200 lines</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundational task -->
  </dependencies>

  <commit-message>feat(evaluators): implement string matching and batched LLM evaluation

Per decisions.md #3, #6:
- String matching is default (contains, does_not_contain)
- LLM evaluation is opt-in (matches_intent)
- Batched Claude API call for all semantic checks
- Graceful degradation when LLM unavailable
- Binary pass/fail (no confidence scores in v1)
- Target: ~200 lines

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Integration and Documentation

Three tasks that integrate the core modules and create documentation.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Implement CLI runner with human-first output</title>
  <requirement>REQ-MVP-004: CLI Runner with Output (P0-Blocker)</requirement>
  <description>
    Per decisions.md #4 and #8: Human-first output, --json for CI.
    Entry point at bin/agentbench.js with shebang.
    Integrates config, executor, evaluators modules.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Output format (#4), architecture (#8)" />
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Output report format (Section 4)" />
    <file path="/home/agent/shipyard-ai/memory-store/bin/memory" reason="Reference bin wrapper pattern" />
  </context>

  <steps>
    <step order="1">Create bin/agentbench.js with #!/usr/bin/env node shebang</step>
    <step order="2">Parse process.argv for: config file path, --json flag, --help</step>
    <step order="3">Load config using src/config.js</step>
    <step order="4">For each test: execute agent, evaluate expectations</step>
    <step order="5">Track timing per test and total</step>
    <step order="6">Implement human output: checkmarks, test names, timing</step>
    <step order="7">Implement failure details: indented, shows expected vs actual</step>
    <step order="8">Implement summary line: "Results: X passed, Y failed"</step>
    <step order="9">Implement --json flag: structured JSON output</step>
    <step order="10">Implement exit codes: 0 (all pass), 1 (any fail), 2 (config error)</step>
    <step order="11">Add color output (green/red) if terminal supports</step>
    <step order="12">Update package.json bin entry</step>
  </steps>

  <verification>
    <check type="bash">./bin/agentbench.js --help shows usage</check>
    <check type="bash">./bin/agentbench.js examples/basic.yaml runs tests</check>
    <check type="bash">./bin/agentbench.js --json outputs valid JSON</check>
    <check type="test">Integration test: full test run with pass/fail</check>
    <check type="test">Exit code 0 when all pass</check>
    <check type="test">Exit code 1 when any fail</check>
    <check type="test">Exit code 2 when config invalid</check>
    <check type="manual">Output matches PRD Section 4 format</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs config loader" />
    <depends-on task-id="phase-1-task-2" reason="Needs executor" />
    <depends-on task-id="phase-1-task-3" reason="Needs evaluators" />
  </dependencies>

  <commit-message>feat(cli): implement human-first CLI runner with --json flag

Per decisions.md #4, #8:
- Human-readable output with checkmarks
- Failure details indented under test name
- --json flag for CI pipelines
- Exit codes: 0 (pass), 1 (fail), 2 (error)
- Color output for terminal
- Summary line with timing

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Write immaculate README with copy-paste examples</title>
  <requirement>REQ-INFRA-002: README with Examples (P1-Must)</requirement>
  <description>
    Per decisions.md #2 and #8: Steve owns brand voice.
    "Manifesto, not manual." Confident, spare, defiant.
    Copy-paste YAML examples that work immediately.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Brand voice (#8), onboarding (#2)" />
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Example YAML (Section 1)" />
  </context>

  <steps>
    <step order="1">Create README.md in project root</step>
    <step order="2">Write headline: "AgentBench — Replace prayer with proof."</step>
    <step order="3">Write one-line pitch: "Test your AI agents in one command."</step>
    <step order="4">Write Installation section: npm install -g agentbench</step>
    <step order="5">Write Quick Start with copy-paste YAML example</step>
    <step order="6">Show CLI subprocess example (command: "node ./agent.js")</step>
    <step order="7">Show HTTP endpoint example (endpoint: "http://...")</step>
    <step order="8">Document evaluators: contains, does_not_contain, matches_intent</step>
    <step order="9">Document --json flag for CI</step>
    <step order="10">Document ANTHROPIC_API_KEY requirement for semantic checks</step>
    <step order="11">Write "Why AgentBench?" section with confidence</step>
    <step order="12">Review for Steve Jobs voice: short sentences, no hedging</step>
  </steps>

  <verification>
    <check type="manual">README reads like a manifesto, not a manual</check>
    <check type="manual">Copy-paste YAML is syntactically valid</check>
    <check type="manual">No hedging language ("might", "could", "try to")</check>
    <check type="manual">Brand voice is confident, spare, defiant</check>
    <check type="manual">Installation is one command</check>
    <check type="manual">External user test: can run first test in 5 minutes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Need working CLI to verify examples" />
  </dependencies>

  <commit-message>docs: write immaculate README with copy-paste examples

Per decisions.md #2, #8:
- Steve Jobs voice: confident, spare, defiant
- "Manifesto, not manual"
- Copy-paste YAML that works immediately
- One-command installation
- Clear evaluator documentation
- No hedging, promises we keep

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Create example configuration files</title>
  <requirement>REQ-INFRA-003: Example Configuration (P1-Must)</requirement>
  <description>
    Per decisions.md #2: Copy-paste onboarding via examples.
    Create examples/basic.yaml demonstrating all evaluators.
    Include example agent scripts for testing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Example YAML (Section 1, Appendix)" />
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Onboarding (#2)" />
  </context>

  <steps>
    <step order="1">Create examples/ directory</step>
    <step order="2">Create examples/basic.yaml with full working example</step>
    <step order="3">Include name, agent.command, and 3+ tests</step>
    <step order="4">Demonstrate contains evaluator</step>
    <step order="5">Demonstrate does_not_contain evaluator</step>
    <step order="6">Demonstrate matches_intent evaluator</step>
    <step order="7">Create examples/http-agent.yaml for HTTP endpoint example</step>
    <step order="8">Create examples/mock-agent.js - simple echo agent for testing</step>
    <step order="9">Verify examples run without modification</step>
    <step order="10">Add comments in YAML explaining each section</step>
  </steps>

  <verification>
    <check type="bash">./bin/agentbench.js examples/basic.yaml runs successfully</check>
    <check type="bash">node examples/mock-agent.js echoes input</check>
    <check type="manual">YAML is self-documenting with comments</check>
    <check type="manual">Examples demonstrate all shipped evaluators</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Need working CLI to verify examples" />
  </dependencies>

  <commit-message>docs(examples): add working example configurations

Per decisions.md #2:
- examples/basic.yaml - CLI subprocess agent
- examples/http-agent.yaml - HTTP endpoint agent
- examples/mock-agent.js - Echo agent for testing
- All evaluators demonstrated
- Self-documenting with comments

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Testing, Publishing, and Review

Three tasks for final validation and release.

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Create dogfooding test suite</title>
  <requirement>REQ-INFRA-004: Dogfooding Tests (P1-Must)</requirement>
  <description>
    Per decisions.md #8: "Dogfood: test the tester."
    Use Vitest (per ecosystem pattern in memory-store).
    Test config parsing, execution, evaluation.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Dogfooding requirement (#8)" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/vitest.config.ts" reason="Vitest config pattern" />
  </context>

  <steps>
    <step order="1">Add vitest as devDependency</step>
    <step order="2">Create vitest.config.ts with globals enabled</step>
    <step order="3">Create tests/ directory</step>
    <step order="4">Create tests/config.test.js - test YAML parsing</step>
    <step order="5">Create tests/executor.test.js - test subprocess and HTTP</step>
    <step order="6">Create tests/evaluators.test.js - test all evaluators</step>
    <step order="7">Create tests/integration.test.js - end-to-end test run</step>
    <step order="8">Mock Claude API for deterministic semantic tests</step>
    <step order="9">Add npm test script: "vitest run"</step>
    <step order="10">Verify all tests pass before proceeding to publish</step>
  </steps>

  <verification>
    <check type="bash">npm test passes with 0 failures</check>
    <check type="test">Config tests cover: valid YAML, invalid YAML, missing fields</check>
    <check type="test">Executor tests cover: subprocess, HTTP, timeout, errors</check>
    <check type="test">Evaluator tests cover: contains, does_not_contain, matches_intent</check>
    <check type="test">Integration tests cover: full test run, exit codes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Need working CLI to test" />
    <depends-on task-id="phase-1-task-6" reason="Need examples for integration tests" />
  </dependencies>

  <commit-message>test: add dogfooding test suite with vitest

Per decisions.md #8:
- Vitest framework (ecosystem standard)
- Config parsing tests
- Executor tests (subprocess + HTTP)
- Evaluator tests (string + LLM mock)
- Integration tests (full run, exit codes)
- All tests pass before publish

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Prepare and publish npm package</title>
  <requirement>REQ-INFRA-001: npm Package (P1-Must)</requirement>
  <description>
    Per decisions.md #7 and PRD Section 5: Publish to npm.
    Package name: agentbench (working title per decisions.md #1).
    Verify npx agentbench works after publish.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="npm publish (#7)" />
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Distribution channel (PRD)" />
    <file path="/home/agent/shipyard-ai/memory-store/package.json" reason="Reference package.json structure" />
  </context>

  <steps>
    <step order="1">Verify package.json has correct metadata: name, version, description</step>
    <step order="2">Verify bin entry points to bin/agentbench.js</step>
    <step order="3">Verify dependencies are minimal (js-yaml only)</step>
    <step order="4">Create .npmignore to exclude tests, examples (keep examples for docs)</step>
    <step order="5">Run npm pack to verify package contents</step>
    <step order="6">Run npm publish --dry-run to verify before real publish</step>
    <step order="7">Authenticate with npm: npm login</step>
    <step order="8">Publish: npm publish</step>
    <step order="9">Verify: npx agentbench --help works</step>
    <step order="10">Verify: npx agentbench examples/basic.yaml works</step>
    <step order="11">Tag git release: git tag v1.0.0</step>
  </steps>

  <verification>
    <check type="bash">npm pack --dry-run shows correct files</check>
    <check type="bash">npm publish --dry-run succeeds</check>
    <check type="bash">npx agentbench --help shows usage (after publish)</check>
    <check type="bash">npx agentbench --version shows 1.0.0</check>
    <check type="manual">Package visible on npmjs.com</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="README must be complete" />
    <depends-on task-id="phase-1-task-7" reason="All tests must pass" />
  </dependencies>

  <commit-message>chore: publish agentbench v1.0.0 to npm

Per decisions.md #7, PRD Section 5:
- npm package published
- npx agentbench works immediately
- Minimal dependencies (js-yaml only)
- Version 1.0.0

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Sara Blakely customer gut-check</title>
  <requirement>SKILL.md Step 7: Customer value validation</requirement>
  <description>
    Per skill instructions: Spawn Sara Blakely agent for customer perspective.
    AgentBench customers are AI engineers building agents.
    "Would they pay for this? What feels like engineering vanity?"
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/phase-1-plan.md" reason="This plan" />
    <file path="/home/agent/shipyard-ai/rounds/agentbench/decisions.md" reason="Product decisions and essence" />
    <file path="/home/agent/shipyard-ai/prds/agentbench.md" reason="Product requirements" />
  </context>

  <steps>
    <step order="1">Spawn haiku sub-agent as Sara Blakely</step>
    <step order="2">Prompt: Read phase plan and AgentBench README</step>
    <step order="3">Answer: Would a developer actually use AgentBench?</step>
    <step order="4">Answer: What would make them say "finally, I can ship with confidence"?</step>
    <step order="5">Answer: What feels like engineering vanity vs. real value?</step>
    <step order="6">Answer: Is "replace prayer with proof" delivered or just promised?</step>
    <step order="7">Answer: Does the first test run feel like relief?</step>
    <step order="8">Answer: Would they tell a friend about it?</step>
    <step order="9">Write findings to .planning/sara-blakely-review.md</step>
    <step order="10">Review and address major gaps if any</step>
  </steps>

  <verification>
    <check type="bash">cat /home/agent/shipyard-ai/.planning/sara-blakely-review.md</check>
    <check type="manual">Customer perspective review complete</check>
    <check type="manual">Major gaps addressed if any</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Review after npm publish" />
  </dependencies>

  <commit-message>docs(planning): add Sara Blakely customer gut-check

Per SKILL.md: Validate customer value.
Would AI engineers choose AgentBench?
Engineering vanity vs. real value analysis.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Wave Summary

| Wave | Tasks | Description | Parallelism |
|------|-------|-------------|-------------|
| 1 | 3 | Core modules (config, executor, evaluators) | 3 parallel |
| 2 | 3 | CLI integration, README, examples | 3 parallel (after Wave 1) |
| 3 | 3 | Tests, npm publish, Sara review | Sequential (after Wave 2) |

**Total Tasks:** 9
**Maximum Parallelism:** Wave 1 (3 concurrent tasks)
**Timeline:** 3-5 days (greenfield build, ~500 lines total)

---

## Dependencies Diagram

```
Wave 1:  [task-1: Config] ──────────────────────────────────────────────────>
         [task-2: Executor] ────────────────────────────────────────────────>
         [task-3: Evaluators] ──────────────────────────────────────────────>

Wave 2:  [task-4: CLI] ───> (depends on 1,2,3) ─────────────────────────────>
         [task-5: README] ───> (depends on 4) ──────────────────────────────>
         [task-6: Examples] ───> (depends on 4) ────────────────────────────>

Wave 3:  [task-7: Tests] ───> (depends on 4,6) ─────────────────────────────>
         [task-8: npm Publish] ───> (depends on 5,7) ───────────────────────>
         [task-9: Sara Review] ───> (depends on 8) ─────────────────────────>
```

---

## Risk Notes

### Addressed in This Phase

| Risk | Mitigation | Task |
|------|------------|------|
| LLM evaluation reliability | Graceful degradation, batched calls | task-3 |
| API down breaks tests | Clear error messages, skip vs fail | task-3, task-4 |
| Schema evolution | version: 1 field from day one | task-1 |
| Copy-paste friction | Immaculate README, working examples | task-5, task-6 |
| No telemetry | Deferred to v1.1 (acknowledged risk) | — |

### Accepted for v1 (Not Blocking)

| Risk | Impact | Notes |
|------|--------|-------|
| Name confusion | Medium | Ship with "agentbench", rebrand later |
| No watch mode | Low | Explicitly cut per decisions.md |
| No custom evaluators | Low | Explicitly cut per decisions.md |
| No parallel execution | Low | Explicitly cut per decisions.md |

---

## Verification Checklist

- [x] All P0 requirements have task coverage
- [x] All P1 requirements have task coverage
- [x] Each task has clear verification criteria
- [x] Dependencies form valid DAG (no cycles)
- [x] Each task can be committed independently
- [x] Architecture follows decisions.md #5 (~500 lines)
- [x] Output format follows decisions.md #4 (human-first)
- [x] Evaluation follows decisions.md #3 (string default)
- [x] 3-5 day timeline achievable
- [x] Ship test defined: first test run feels like relief
- [x] Sara Blakely customer gut-check scheduled (task-9)

---

## Ship Test

> Does `npx agentbench run` execute tests with clear pass/fail output?
>
> Does the first test run feel like relief instead of frustration?
>
> Does the README make you want to try it immediately?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: prds/agentbench.md, rounds/agentbench/decisions.md*
*Project Slug: agentbench*
