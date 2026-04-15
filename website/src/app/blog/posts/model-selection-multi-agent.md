---
title: "Why One LLM Isn't Enough: Model Selection for Multi-Agent Pipelines"
description: "Haiku hallucinates APIs. Sonnet costs 15x more. The solution isn't choosing one model—it's choosing the right model for each phase."
date: 2026-04-15
tags: [ai, multi-agent, cost-optimization]
---

Haiku hallucinated 100+ API violations per plugin. The code compiled. Types checked. Then it crashed in production because the AI invented APIs that don't exist.

One bad build costs 4-6 fix cycles. Each cycle burns tokens, time, and trust. Using Sonnet for everything would prevent the hallucinations but costs 15x more per token. Using Haiku for everything saves money but ships broken code.

The solution isn't choosing one model. It's choosing the right model for each phase.

## The Cost Math: Why Wrong Models Are Expensive

When Haiku generates code, it hallucinates APIs. Consider what this costs:

```
Build Phase (Haiku):      $0.50 (fast, cheap, wrong)
QA Phase (detects bugs):  $0.25
Fix Cycle 1 (rebuild):    $0.50
Fix Cycle 2 (rebuild):    $0.50
Fix Cycle 3 (rebuild):    $0.50
Fix Cycle 4 (rebuild):    $0.50
─────────────────────────────────
Total cost:               $2.75

Sonnet from start:        $7.50 (slower, expensive, correct)
QA Phase:                 $0.25
Fix cycles:               $0 (no hallucinations)
─────────────────────────────────
Total cost:               $7.75
```

This looks like Haiku wins on cost. But add one more variable: **your time**.

Each fix cycle takes 20-30 minutes of debugging. Four cycles = 2 hours of wasted engineering time hunting hallucinated APIs. Sonnet's higher token cost is cheaper than your hourly rate.

The real insight: **different phases need different models**.

## The Model Selection Table

| Phase | Model | Why | Token Cost |
|-------|-------|-----|-----------|
| **Plan** | Sonnet | Architecture decisions require precision. Wrong abstractions compound. | Medium |
| **Build** | Sonnet | Code generation demands API accuracy. Hallucinations create cascading failures. | High |
| **Review** | Haiku | Pattern matching for known violations. Fast, cheap, effective at scale. | Low |
| **QA** | Sonnet | Must catch subtle bugs. False negatives ship broken code. | Medium |

The pattern: **use precision for creation, speed for validation**.

Plan and Build phases create new artifacts. Wrong decisions here cascade through the entire pipeline. Sonnet's accuracy prevents expensive rework.

Review and QA phases validate against known patterns. Haiku excels at pattern matching. Checking for `throw new Response` doesn't require deep reasoning. Fast, cheap validation catches 80% of issues.

This is the strategy that fixed our hallucination problem.

## Implementation: Claude Agent SDK Model Parameter

The Claude Agent SDK exposes model selection through a single parameter:

```typescript
import { Agent } from '@anthropic-ai/sdk';

// Planning phase - needs architectural precision
const planAgent = new Agent({
  model: 'sonnet',
  name: 'plan',
  instruction: 'Design system architecture...',
});

// Build phase - needs code accuracy
const buildAgent = new Agent({
  model: 'sonnet',
  name: 'build',
  instruction: 'Generate production code...',
});

// Review phase - pattern matching at scale
const reviewAgent = new Agent({
  model: 'haiku',
  name: 'review',
  instruction: 'TERSE: Check for known violations...',
});

// QA phase - catch subtle bugs
const qaAgent = new Agent({
  model: 'sonnet',
  name: 'qa',
  instruction: 'Validate against requirements...',
});
```

Each agent gets the model that matches its cognitive demands. Architectural decisions use Sonnet. Pattern matching uses Haiku.

The `model` parameter accepts three values:
- `'opus'` - Maximum capability, highest cost
- `'sonnet'` - Balanced precision and speed
- `'haiku'` - Fast pattern matching, lowest cost

For multi-agent pipelines, the selection logic is simple: **creation requires precision, validation requires speed**.

## The TERSE Optimization: 75% Token Savings

Review phases generate massive outputs. Consider a code review that finds 100+ violations. The default response format is verbose:

```
I found a violation on line 47 where you use throw new Response().
This is incorrect because the Emdash platform doesn't support
Response objects in handler functions. Instead, you should return
a plain object with an error property...
```

Every violation gets 3-4 sentences of explanation. Multiply by 100 violations and the output tokens explode.

The TERSE prefix changes this:

```typescript
const reviewAgent = new Agent({
  model: 'haiku',
  name: 'review',
  instruction: `TERSE: Output only violations.

  Format: file:line:pattern
  Example: sandbox-entry.ts:47:throw_response

  No explanations. No suggestions. Just violations.`,
});
```

TERSE output for the same 100 violations:

```
sandbox-entry.ts:47:throw_response
sandbox-entry.ts:121:throw_response
sandbox-entry.ts:203:json_stringify_kv
sandbox-entry.ts:204:json_stringify_kv
...
```

One line per violation. No explanations. The next phase knows what `throw_response` means.

**Token savings: ~75% on review phases**.

The verbose review used 3,200 output tokens. The TERSE review used 800 tokens. Same information density. 4x cheaper.

This optimization works because review phases don't need to explain. They need to detect. Downstream phases handle remediation.

Combine TERSE formatting with Haiku pricing and review phases cost **~94% less** than verbose Sonnet reviews.

## The Results: Zero Hallucinations, Predictable Costs

After implementing model selection:

**Before:**
- Haiku build phase: 100+ hallucinated APIs per plugin
- 4-6 fix cycles per build
- 2+ hours debugging per plugin
- Unpredictable costs from retry loops

**After:**
- Sonnet build phase: Zero API hallucinations
- 0-1 fix cycles per build (only edge cases)
- 15 minutes from build to production
- Predictable costs from single-pass builds

The 7-plugin build that originally took 14 hours (with fixes) completed in 90 minutes. No hallucinated `throw new Response` calls. No double-encoded JSON in KV storage. No redundant auth checks.

**Cost per plugin:**
- Plan: $2.50 (Sonnet)
- Build: $7.50 (Sonnet)
- Review: $0.50 (Haiku + TERSE)
- QA: $3.00 (Sonnet)
- **Total: $13.50 per plugin**

Compared to the old approach:
- Build: $0.50 (Haiku, produces 100+ bugs)
- Fix cycles: $2.00 (4x rebuilds at $0.50)
- Extended QA: $5.00 (Sonnet debugging hallucinations)
- Engineering time: $200+ (2 hours at $100/hour)
- **Total: $207.50 per plugin**

The right model for each phase reduced pipeline costs by **93%** when you include engineering time.

## Match Models to Cognitive Load

The lesson generalizes beyond code generation:

**High-precision tasks need Sonnet:**
- Architectural decisions
- Code generation
- Requirements analysis
- Security reviews
- API design

**Pattern matching tasks need Haiku:**
- Linting and style checks
- Known violation detection
- Format validation
- Duplicate detection
- Simple classifications

**Research tasks need Opus:**
- Novel problem solving
- Complex reasoning chains
- Ambiguous requirements
- Cross-domain synthesis

Most multi-agent pipelines don't need Opus. The Sonnet/Haiku split handles 95% of automation tasks.

The mistake is treating LLM selection like database selection—pick one and use it everywhere. Multi-agent systems demand **per-phase optimization**.

## Your Move

If you're building multi-agent pipelines:

1. **Audit your phases** - Which create artifacts? Which validate?
2. **Match models to cognitive load** - Creation gets Sonnet, validation gets Haiku
3. **Add TERSE formatting** - Cut review output tokens by 75%
4. **Measure costs per phase** - Token usage × model pricing
5. **Test with real workloads** - One bad hallucination costs more than 1000 correct outputs

The Claude Agent SDK makes this trivial. Change the `model` parameter. Ship the phase. Measure the results.

We cut pipeline costs 93% and eliminated hallucinations. You have the same tools.

Build something.
