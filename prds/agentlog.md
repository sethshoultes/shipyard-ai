# PRD: AgentLog
**Status:** Ready for Build
**Priority:** P0
**Origin:** DREAM Cycle 2026-04-13 (Unanimous Board Vote)

---

## Overview

AgentLog is a drop-in observability layer for AI agent workflows. It records every tool call, decision point, and output, then visualizes agent reasoning as an interactive timeline.

**One-liner:** See what your AI agent is thinking.

---

## Problem Statement

Building AI agents is hard. Debugging them is harder. When an agent makes a wrong decision, developers have no way to understand:
- What information the agent had at decision time
- Why it chose Tool A over Tool B
- Where in the reasoning chain things went wrong
- How long each step took and where bottlenecks exist

Current solutions are either:
- Console.log hell (unstructured, unsearchable)
- Generic APM tools (not built for agent patterns)
- Nothing (most developers)

---

## Target User

**Primary:** Developers building AI agents with Claude, GPT-4, or local models.

**Persona:** Alex, a senior developer at a startup. They're building an AI agent that helps with code reviews. The agent works 80% of the time but fails mysteriously 20% of the time. Alex spends hours adding print statements, running tests, and guessing. With AgentLog, Alex sees exactly where the agent went wrong in 30 seconds.

---

## Solution

### Core Components

1. **AgentLog SDK (npm package)**
   - `agentlog.init({ projectId })` — initialize
   - `agentlog.span(name, fn)` — wrap any async function
   - `agentlog.tool(name, input, output)` — log tool calls
   - `agentlog.decision(options, chosen, reasoning)` — log decision points
   - `agentlog.thought(content)` — log intermediate reasoning
   - Auto-instrumentation for common agent frameworks (LangChain, Claude SDK)

2. **AgentLog Dashboard (web app)**
   - Timeline view of agent execution
   - Expand/collapse spans
   - Search and filter by tool, time, content
   - Error highlighting
   - Token usage and latency metrics

3. **Local-first Storage**
   - SQLite by default (no external dependencies)
   - Optional: Push to AgentLog Cloud for team sharing

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Your Agent Code                      │
├─────────────────────────────────────────────────────────┤
│                    AgentLog SDK (npm)                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │  Spans  │  │  Tools  │  │Decisions│  │  Thoughts   │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘ │
│       └────────────┼───────────┼───────────────┘        │
│                    ▼                                     │
│              Event Collector                             │
├─────────────────────────────────────────────────────────┤
│                    Storage Layer                         │
│         ┌──────────────┬──────────────┐                 │
│         │   SQLite     │  Cloud Sync  │                 │
│         │   (local)    │  (optional)  │                 │
│         └──────────────┴──────────────┘                 │
├─────────────────────────────────────────────────────────┤
│                  AgentLog Dashboard                      │
│         ┌──────────────────────────────┐                │
│         │    Timeline Visualization    │                │
│         │    Search / Filter / Replay  │                │
│         └──────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## MVP Scope (One Session)

### Must Have
- [ ] npm package with init, span, tool, thought methods
- [ ] SQLite storage with automatic schema creation
- [ ] CLI command: `npx agentlog serve` — launches local dashboard
- [ ] Dashboard: timeline view with expand/collapse
- [ ] Dashboard: basic search
- [ ] README with quick start guide

### Nice to Have (if time permits)
- [ ] Auto-instrumentation for @anthropic-ai/sdk
- [ ] Token usage tracking
- [ ] Export to JSON

### Out of Scope (v2)
- Cloud sync
- Team features
- Alerts
- Multi-language SDKs

---

## User Experience

### Installation (30 seconds)
```bash
npm install agentlog
```

### Integration (2 minutes)
```typescript
import AgentLog from 'agentlog';
import Anthropic from '@anthropic-ai/sdk';

const log = AgentLog.init({ project: 'my-agent' });

async function runAgent(input: string) {
  return log.span('agent-run', async () => {
    log.thought(`Processing input: ${input}`);

    const response = await log.tool('claude-chat', { input }, async () => {
      return anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: input }]
      });
    });

    log.decision(
      ['respond', 'ask-clarification', 'use-tool'],
      'respond',
      'Input was clear, no tools needed'
    );

    return response;
  });
}
```

### Viewing Logs
```bash
npx agentlog serve
# Opens http://localhost:4040
```

---

## Success Metrics

**Week 1:**
- [ ] We use AgentLog on our own multi-agent system
- [ ] npm package published
- [ ] 10+ GitHub stars

**Month 1:**
- [ ] 100+ npm downloads
- [ ] 3+ external users provide feedback
- [ ] One blog post / Show HN

---

## Distribution Strategy

1. **Launch:** Product Hunt, Show HN, AI Twitter
2. **Content:** "How We Debug AI Agents" blog post with screenshots
3. **Dogfood:** Integrate into shipyard-ai, share learnings publicly
4. **Community:** Post in LangChain Discord, Claude Discord, AI agent communities

---

## Open Questions

1. **Pricing model?** — Start free/open source. Cloud features could be paid later.
2. **Framework integrations?** — Start with raw SDK, add LangChain later based on demand.
3. **Data retention?** — Local SQLite has no limits. Cloud would need a policy.

---

## Appendix: Competitive Landscape

| Product | Focus | Gap We Fill |
|---------|-------|-------------|
| LangSmith | LangChain-specific | Framework agnostic |
| Weights & Biases | ML training | Agent execution, not training |
| Datadog APM | Generic observability | Agent-specific visualizations |
| Console.log | Nothing | Everything |

---

*Approved by DREAM Board: Steve, Elon, Phil*
*Ready for autonomous build.*
