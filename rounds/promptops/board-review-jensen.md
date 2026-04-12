# Board Review: PromptOps

**Reviewer:** Jensen Huang, CEO of NVIDIA
**Date:** 2026-04-12
**Deliverables:** Drift (CLI + API) + NERVE (Pipeline Daemon)

---

## Executive Summary

PromptOps ships two components: **Drift** (prompt versioning) and **NERVE** (pipeline operations). Drift is a competent CLI-first tool. NERVE is solid operational infrastructure. Together they represent good engineering—but they're building a feature, not a platform.

The fundamental question: **Where is the GPU?**

---

## What's the Moat? What Compounds Over Time?

**Current State:** Almost nothing compounds.

- **Drift** stores prompts and versions in D1. That's a database, not a moat. The schema is three tables. Anyone can replicate this in a weekend.
- **NERVE** is bash scripts with lockfiles. Robust, yes. Defensible, no.

**What Could Compound:**

1. **Prompt Performance Data** — If every request through the proxy logged (prompt_version, latency, token_count, user_rating), you'd have the dataset that matters. Which prompt versions actually work? That data compounds.

2. **Cross-Customer Intelligence** — If you see 10,000 companies iterating on "customer support" prompts, you know which patterns win. Aggregated learnings are your moat.

3. **The Proxy Position** — Every request flowing through you is training data. But only if you capture it. Right now the proxy is a pass-through. That's the opposite of compounding—you're facilitating value extraction for OpenAI.

**Verdict:** No moat. Prompt text is not differentiated data. Version numbers are not intelligence.

---

## Where's the AI Leverage? Are We Using AI Where It 10x's the Outcome?

**Current State:** Zero AI leverage.

This is a tool *about* AI that contains *no* AI. Think about that. You're building infrastructure for LLMs without using LLMs.

**Where AI Should Be (Non-Negotiable):**

1. **Prompt Analysis Engine**
   - "This prompt is 2400 tokens. Here's a 600-token version with the same semantic content."
   - "Warning: This prompt conflicts with your other prompt 'error-handler' at the persona level."
   - "Version 7 regresses on formatting instructions vs Version 5."

2. **Automated A/B Intelligence**
   - Don't just split traffic—predict winners. Use embeddings to identify meaningful differences.
   - "Version 12 adds guardrails that reduce variance. Recommend 100% rollout."

3. **Prompt Suggestions**
   - "Based on 50,000 similar prompts, you're missing few-shot examples. Add these."
   - "This prompt pattern has 3x higher failure rate than alternatives. Consider..."

4. **Semantic Diff, Not String Diff**
   - `promptops diff` shows text changes. Useless. Show semantic changes.
   - "This change makes the model more verbose and less likely to refuse."

**Verdict:** You're leaving 10x on the table. The proxy should be smart, not dumb. Every prompt that passes through should make the system smarter.

---

## What's the Unfair Advantage We're Not Building?

**The Proxy is the Prize—You're Ignoring It.**

You have the architectural position that every AI company wants: a proxy between applications and LLMs. And you're using it for... header injection.

**Unfair Advantages Available:**

1. **Real-Time Prompt Optimization**
   - Intercept requests, optimize prompts before they hit the LLM.
   - Reduce token usage 30-50% automatically. Customers save money. You capture value.

2. **Inference Cost Arbitrage**
   - Route to the cheapest model that can handle the prompt complexity.
   - GPT-4 for complex reasoning, Haiku for simple classification. Automatic.
   - You own the routing intelligence. That's proprietary.

3. **Semantic Caching**
   - Cache not by exact request, but by semantic similarity.
   - "This prompt is 94% similar to one from 30 seconds ago. Return cached response."
   - Inference costs drop. Latency drops. Your margin expands.

4. **Compliance & Audit Layer**
   - Every prompt logged. Every response auditable.
   - "Did the AI ever tell a customer X?" Answerable in seconds.
   - Sell to enterprises who need this for legal.

5. **Fine-Tuning Pipeline**
   - You see which prompts work. You see the production data.
   - "Your top 1000 prompt/response pairs are ready for fine-tuning."
   - One-click fine-tune deployment. That's a $10K/month feature.

**The Unfair Advantage:** Own the intelligence layer, not just the transport layer.

---

## What Would Make This a Platform, Not Just a Product?

**Current State:** Product. Specifically, a feature that should be part of something bigger.

**Platform Requirements:**

1. **Network Effects**
   - **Prompt Marketplace** — "Import the best customer-support prompt, rated by 500 companies."
   - **Shared Components** — Reusable prompt fragments (personas, guardrails, format specs).
   - **Community Benchmarks** — "Your prompt ranks 73rd percentile for helpfulness."

2. **Ecosystem Extensibility**
   - **Plugin Architecture** — Let others build on your proxy. Rate limiters. PII redaction. Logging integrations.
   - **Webhook System** — "When prompt performance drops 20%, trigger Slack alert."
   - **MCP Integration** — Expose prompts as MCP resources. Let AI agents discover and use prompts.

3. **Multi-Model Support**
   - Abstract the LLM. Let companies swap OpenAI for Anthropic for Llama without code changes.
   - **You become the API**, not OpenAI. That's platform thinking.

4. **SDK Gravity**
   - Python SDK. TypeScript SDK. Go SDK.
   - Once the SDK is in the codebase, you're sticky. Right now you're just a CLI and a header.

5. **Compute Integration**
   - Where's the edge? This runs on Cloudflare Workers.
   - Partner with GPU providers. Route inference to the best available compute.
   - **That's where NVIDIA comes in.** We have the chips. You have the traffic. Let's talk.

**Platform Test:** Can third parties build businesses on top of you? Not yet.

---

## Technical Assessment

**Drift:**
- Clean TypeScript. Cloudflare Workers + D1 is the right architecture.
- API design is sensible. Auth is simple (API key hash).
- Missing: Proxy is incomplete. A/B testing not implemented. No analytics.

**NERVE:**
- Impressive bash engineering. Atomic locking with mkdir. Proper signal handling.
- Zero dependencies is a feature. Deterministic execution is the right goal.
- Missing: Connection to the broader system. What does NERVE actually process? The queue is empty of meaning.

**Architecture Gap:**
- Drift and NERVE feel like separate projects.
- Where's the integration? NERVE should be processing Drift operations—auto-rollback on latency spike, auto-promote on A/B test completion.
- The pieces don't compose into something greater.

---

## Score: 5/10

**Justification:** Solid engineering on the wrong problem—builds prompt storage when the value is in prompt intelligence.

---

## Recommendations

### Immediate (This Week)

1. **Instrument the Proxy**
   - Log every request: prompt_version, model, tokens_in, tokens_out, latency_ms, status.
   - This data is your future. Start collecting now.

2. **Add Semantic Diff**
   - Use an LLM to explain what changed between versions in plain English.
   - "Version 4 adds stricter formatting requirements and removes the apology persona."

3. **Connect NERVE to Drift**
   - NERVE should monitor Drift metrics.
   - Auto-rollback if version N has 2x latency of version N-1.

### Medium-Term (30 Days)

4. **Build the Optimization Engine**
   - Prompt compression. Token reduction. Model routing.
   - This is where the margin lives.

5. **Implement Semantic Caching**
   - Vector similarity on prompts. Return cached responses for near-matches.
   - Show customers their cost savings. That's your sales pitch.

6. **Launch the Marketplace**
   - "Import the top-rated customer support prompt."
   - Network effects start here.

### Long-Term (90 Days)

7. **SDK Launch**
   - Python and TypeScript SDKs that abstract the LLM entirely.
   - `from promptops import client; client.complete("support-agent", user_message)`
   - You become the interface, not OpenAI.

8. **Enterprise Compliance Package**
   - Full audit logs. PII redaction. Response validation.
   - SOC2 certification. HIPAA compliance.
   - This is where the revenue is.

---

## The NVIDIA Angle

You're building infrastructure for AI applications. We're building infrastructure for AI compute. There's a partnership here:

1. **Model Routing to NVIDIA Inference**
   - Route complex prompts to NIM endpoints running on our GPUs.
   - Cost-effective inference, integrated into your proxy.

2. **Accelerated Semantic Operations**
   - Embedding computation. Similarity search. Token optimization.
   - These are GPU workloads. We can help.

3. **Edge Deployment**
   - Your proxy runs on Cloudflare. What about on-premise?
   - NVIDIA DGX as the deployment target for enterprise.

The prompt is the new program. You're building the deployment infrastructure. We want to be under the hood.

---

## Final Thoughts

The team can build. That's clear. NERVE is genuinely well-engineered bash. Drift is clean TypeScript. The architecture decisions are sound.

But you're solving yesterday's problem. "Git for prompts" is table stakes. Everyone will have this. The question is: **What do you know that others don't?**

The answer has to come from the data. From the proxy position. From seeing millions of prompts and learning which ones work.

Stop building storage. Start building intelligence.

---

*"Software is eating the world. AI is eating software. The prompt is eating AI. Own the prompt layer."*

— Jensen Huang
CEO, NVIDIA

---

**Review Status:** Complete
**Recommendation:** Conditional approval—pivot focus from storage to intelligence before next funding round.
