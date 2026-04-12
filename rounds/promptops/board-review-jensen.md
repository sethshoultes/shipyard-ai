# Board Review: PromptOps

**Reviewer:** Jensen Huang — CEO, NVIDIA; Board Member, Great Minds Agency
**Date:** 2026-04-12
**Deliverables Reviewed:** Drift (CLI + API), NERVE (Pipeline Daemon)

---

## Executive Summary

PromptOps ships two components: **Drift** (prompt versioning via CLI and Cloudflare Workers API) and **NERVE** (bash-based pipeline daemon). Clean engineering. Competent execution. Wrong thesis.

**The core problem:** You've built version control for static assets when prompts are dynamic programs. You're treating prompts like config files when they should be treated like neural network weights—living, optimizable, measurable.

The proxy position is the strategic asset. You're leaving it vacant.

---

## What's the Moat? What Compounds Over Time?

**Current moat: None.**

- **Drift:** Three SQL tables storing text blobs with version numbers. This is a weekend project for any competent engineer. The schema (`projects`, `prompts`, `versions`) is obvious. The CLI commands (`push`, `list`, `rollback`) are obvious. There's no proprietary intelligence.

- **NERVE:** Well-engineered bash scripts with lockfiles and queue management. Robust, deterministic, dependency-free. Also completely replicable. Job queues are solved infrastructure.

**What could compound (but doesn't):**

| Asset | Current State | Compounding State |
|-------|---------------|-------------------|
| Prompt versions | Text diffs | Performance correlation: "v7 has 23% lower latency than v6" |
| Proxy traffic | Pass-through | Learning signal: Which prompts work? Which fail? |
| User base | Individual projects | Cross-customer intelligence: "The best support prompts share these patterns" |
| NERVE jobs | Empty queue | Automated optimization: Continuous prompt compression, A/B resolution |

**The compounding opportunity:** You see every prompt. You see every request. You could build the dataset that answers "What makes a good prompt?"—not philosophically, but empirically, at scale. That's a moat.

Instead, you're building storage. Storage is commodity. Intelligence is moat.

---

## Where's the AI Leverage? Are We Using AI Where It 10x's the Outcome?

**AI leverage: Zero.**

This is the most striking gap. You're building infrastructure for AI applications using zero AI. Examine the code:

- `drift/api/src/routes/prompts.ts` — Pure CRUD operations. No intelligence.
- `drift/cli/src/commands/push.ts` — Reads file, posts to API. No analysis.
- `nerve/daemon.sh` — Bash polling loop. No learning.

**Where AI should be creating 10x outcomes:**

1. **Semantic Diff (Not Text Diff)**
   ```
   Current: "Version 4 changed 47 characters"
   AI-leveraged: "Version 4 adds error handling instructions and removes
   the apologetic tone. Expect 15% fewer refusals, 8% longer responses."
   ```

2. **Prompt Quality Scoring**
   ```
   Current: No quality gate
   AI-leveraged: "Warning: This prompt has 3 injection vulnerabilities,
   2 ambiguous instructions, and exceeds recommended token count by 40%."
   ```

3. **Automatic Optimization**
   ```
   Current: Manual prompt editing
   AI-leveraged: "Your 2,400-token system prompt compressed to 600 tokens
   with 98% semantic equivalence. Saves $0.03 per request."
   ```

4. **A/B Test Intelligence**
   ```
   Current: Traffic splitting (not even implemented)
   AI-leveraged: "Based on 500 samples, v3 outperforms v2 with 95% confidence.
   Auto-promoting in 2 hours unless you intervene."
   ```

5. **Regression Detection**
   ```
   Current: Manual monitoring
   AI-leveraged: "v5 increases refusal rate 3x on financial questions.
   Auto-rollback to v4 completed. Review required."
   ```

**The proxy sits in the inference path.** Every request flows through. This is the perfect position for AI-powered intervention. Instead, it's a dumb pipe.

---

## What's the Unfair Advantage We're Not Building?

**The Intelligence Layer.**

You have the architectural position every AI infrastructure company wants: a proxy between applications and LLMs. You're using it for header injection and pass-through.

**Advantages available but ignored:**

1. **Prompt Caching at the KV Level**
   - Same system prompt across requests? Cache the key-value state.
   - This is what NVIDIA does with TensorRT-LLM. 40% latency reduction for repeated prefixes.
   - You have the proxy position. You're not using it.

2. **Intelligent Routing**
   - Simple classification → Haiku ($0.25/M tokens)
   - Complex reasoning → Claude Sonnet ($3/M tokens)
   - Math problems → GPT-4o
   - You could save customers 60% on inference costs. They'd never leave.

3. **Security Scanning**
   - Jailbreak detection in real-time
   - PII leakage prevention
   - Prompt injection identification
   - Enterprises will pay $10K/month for this. You're leaving it on the table.

4. **Compliance Logging**
   - Full audit trail of every prompt/response
   - "Did our AI ever say X to a customer?" — answerable in seconds
   - HIPAA, SOC2, GDPR compliance out of the box
   - This is enterprise revenue.

**NERVE is the wrong investment.** Bash job queues are solved. The intelligence layer is not.

---

## What Would Make This a Platform, Not Just a Product?

**Current state:** Single-player developer tool. Individual pushes prompts, individual rolls back.

**Platform requirements:**

1. **Network Effects**
   - **Prompt Marketplace:** Publish, rate, and monetize prompts. "The top-rated customer support prompt, used by 500 companies." Take 30% of transactions.
   - **Shared Components:** Reusable personas, guardrails, format specs. Import and compose.
   - **Benchmarks:** "Your prompt ranks 73rd percentile for helpfulness among e-commerce prompts."

2. **Ecosystem Gravity**
   - **SDKs that own the interface:**
     ```python
     from promptops import client
     response = await client.chat("support-agent", user_message)
     ```
   - You become the API, not OpenAI. That's platform lock-in.
   - GitHub Actions, Terraform providers, Vercel integrations.

3. **Multi-Model Abstraction**
   - Swap OpenAI for Anthropic for Llama without code changes
   - You own the abstraction layer
   - Models become commodities beneath your platform

4. **Team Workflows**
   - Prompt review flows (like code review)
   - Staging environments for prompts
   - Canary deploys with automatic rollback
   - Approval gates before production

5. **Third-Party Extensibility**
   - Plugin architecture for the proxy
   - Custom analyzers, loggers, transformers
   - **Can others build businesses on your platform?** Not today.

**The test:** Can a third party build a company on top of PromptOps? The answer is no. That means it's a product, not a platform.

---

## Score: 5/10

**Justification:** Solid engineering execution on a thin product thesis—builds reliable infrastructure for a problem that doesn't require custom infrastructure, while ignoring the AI-native opportunities that would create defensibility.

---

## What I'd Do If This Were An NVIDIA Investment

1. **Instrument the Proxy Immediately**
   - Log: prompt_version, model, tokens_in, tokens_out, latency_ms, status_code, user_rating (if available)
   - This data is your future. You should have been collecting it from day one.

2. **Ship Semantic Diff in 48 Hours**
   - Use Claude to explain what changed between prompt versions
   - "Version 4 adds stricter formatting requirements and removes the apologetic persona"
   - This is a weekend feature. It demonstrates AI leverage.

3. **Build the Optimization Engine**
   - Prompt compression: Reduce tokens while preserving semantics
   - Show users: "This optimization saves you $X/month"
   - Now they can't leave—you're making them money.

4. **Deprecate NERVE or Repurpose It**
   - The queue should be processing prompt optimization jobs
   - Continuous background compression of stored prompts
   - A/B test resolution and auto-promotion
   - Connect it to Drift or kill it

5. **Launch with Marketplace Vision**
   - Even if v1 is just "share prompts publicly," plant the flag
   - Network effects require network expectations
   - Be ambitious about the platform story

---

## The NVIDIA Partnership Angle

You're building infrastructure for AI applications. We're building infrastructure for AI compute. There's convergence:

- **Model routing to NIM endpoints** — Route complex prompts to our optimized inference
- **Accelerated semantic operations** — Embeddings, similarity search, compression run on GPU
- **Edge deployment** — Your proxy on Cloudflare; enterprise version on NVIDIA DGX

The prompt is the new program. You're building the deployment layer. We want to power the inference beneath it.

---

## Final Assessment

The team can ship. That's clear from the code quality—NERVE's atomic locking is genuinely well-engineered, Drift's TypeScript is clean and idiomatic. The architecture decisions (Cloudflare Workers + D1, bash for portability) are sound.

But you're building a feature, not a company. "Git for prompts" is table stakes. In 18 months, this will be a checkbox on every AI observability platform.

The question isn't "Can you build prompt versioning?" You answered that. It's: **"What do you know about prompts that nobody else does?"**

The answer has to come from the data. From the proxy position. From seeing millions of prompts and learning which ones work.

Stop building storage. Start building intelligence.

---

*"Software is eating the world. AI is eating software. Prompts are eating AI. Own the prompt layer—not as a filing cabinet, but as a learning system."*

— Jensen Huang
CEO, NVIDIA

---

**Review Status:** Complete
**Recommendation:** Conditional approval. Pivot focus from storage to intelligence. The proxy position is strategic—monetize it with AI, not with CRUD.
