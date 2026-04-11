# Board Review: PromptOps (Drift)

**Reviewer:** Jensen Huang, CEO NVIDIA
**Date:** 2026-04-11
**Status:** Build In Progress

---

## Executive Summary

The team shipped a working prompt versioning system—CLI, API, and Cloudflare Worker backend. Clean TypeScript, proper auth with SHA-256 hashing, D1 database. The code is solid. The product thesis is correct: prompts are production artifacts that need deployment tooling.

But here's the problem: **this is infrastructure, not an AI company.**

---

## What's the Moat? What Compounds Over Time?

**Current answer: Nothing.**

Right now, Drift is a glorified key-value store with version history. Every company could build this in a week. The PRD even acknowledges this—"This is the state of deployment tooling circa 2005."

**What could compound:**
- **Prompt telemetry at scale.** If every prompt execution flows through the proxy, you're sitting on the largest dataset of prompt-to-outcome correlations in existence. Which prompts produce better outputs? Which fail silently? This is data no one else has.
- **Cross-customer prompt patterns.** Anonymous aggregation of what prompt structures work across industries. "Companies using chain-of-thought in customer service prompts see 23% higher resolution rates." That's defensible.
- **Network effects from prompt sharing.** A registry of public prompts. Think npm, but for AI behaviors. First one to reach critical mass wins.

None of these are being built. The proxy doesn't even log telemetry yet.

---

## Where's the AI Leverage?

**Current answer: Zero.**

This is a product *for* AI applications that uses *no* AI. That's a missed opportunity.

**Where AI would 10x the outcome:**

1. **Prompt auto-optimization.** Run A/B tests automatically, use an LLM to synthesize learnings and suggest improved versions. "Based on 10,000 executions, here's a prompt that scores 15% higher on your success metric."

2. **Prompt migration.** When users switch from GPT-4 to Claude to Llama, auto-translate prompts. Different models have different prompt idioms. An AI that understands these nuances is a retention moat.

3. **Semantic diff, not text diff.** The `diff` command shows character changes. Useless. What changed in the prompt's *behavior*? AI can analyze: "This version is more likely to refuse requests. This version is more verbose."

4. **Prompt debugging.** When a prompt starts failing, use AI to diagnose: "Your prompt relies on knowledge the model doesn't have. Here's a fix."

You're building infrastructure for AI while ignoring AI as infrastructure. That's backwards.

---

## What's the Unfair Advantage We're Not Building?

**The proxy is a trojan horse. We're not using it.**

Every LLM request flows through your edge network. You see:
- Prompt content
- Model responses
- Latency
- Token usage
- (Eventually) User feedback

This is a **data moat** waiting to happen. But the current implementation just passes requests through. No logging. No analytics. No learning.

**Unfair advantages we should be building:**

1. **Observability-first.** LangSmith is "too heavy" per the PRD. So be lighter—but still capture everything. Store embeddings of prompts and responses. Build similarity search. "Find all prompts similar to this failing one."

2. **Enterprise prompt governance.** Companies will need to audit AI usage for compliance. Be the system of record. SOC2 is on the roadmap, but governance features aren't.

3. **Prompt security scanning.** Detect prompt injection attacks, jailbreak attempts, data exfiltration patterns. Real-time. At the edge. This alone could be a product.

4. **Cost optimization.** Track spending per prompt. Identify expensive prompts. Suggest cheaper alternatives. Companies would pay for this today.

---

## What Would Make This a Platform, Not Just a Product?

**Current state: Product. Barely.**

A platform has:
- **Ecosystem.** Others build on top of you.
- **Network effects.** More users = more value for each user.
- **Lock-in through integration depth.** Leaving is painful.

**Path to platform:**

1. **Prompt Registry.** Public prompts with ratings, forks, attribution. Every AI developer goes to Drift to find prompts. npm install, but for system prompts.

2. **Evaluation Framework.** Define success metrics per prompt. Drift runs continuous evaluation. When a model update breaks your prompt, we alert you. When a better prompt emerges, we notify you.

3. **Prompt SDK.** Go beyond proxy injection. Native SDKs that make Drift the canonical way to manage prompts in Python/TypeScript. Every `openai.chat.completions.create()` goes through Drift.

4. **Prompt Marketplace.** Premium prompts from experts. Revenue share. Prompt engineers become a profession with Drift as their platform.

5. **Model-Agnostic Intelligence.** Be the abstraction layer between applications and models. Automatic failover. Cost-optimized routing. Prompt translation. Companies use Drift because switching models becomes trivial.

Right now, customers could leave in 10 minutes. That's not a platform.

---

## Technical Assessment

**What's good:**
- Clean TypeScript, proper types
- SHA-256 key hashing with constant-time comparison (security-conscious)
- Cloudflare Workers + D1 = globally distributed, low latency
- CLI UX is developer-friendly ("drift init" requires no signup)

**What's missing:**
- Proxy only mentioned in PRD, not in deliverables
- Dashboard directory is empty
- No telemetry or logging infrastructure
- No A/B testing implementation
- No SDK wrappers

**Execution grade: 60%** of MVP scope delivered. CLI and API work. Proxy and dashboard don't exist.

---

## Score: 5/10

**Justification:** Solid execution on a thin slice of a much larger opportunity—the team built version control when they should be building the prompt operating system.

---

## Recommendations

1. **Ship the proxy immediately.** Without it, there's no data flywheel. The proxy is the entire business.

2. **Add telemetry on day one.** Every request through the proxy should be logged with embeddings. This data becomes your moat.

3. **Build one AI feature.** Prompt auto-optimization or semantic diff. Something that makes customers say "I couldn't build this myself."

4. **Define the platform play.** Before Series A, you need a story beyond "git for prompts." The market for developer tools is brutal. The market for AI platforms is infinite.

5. **Talk to enterprises.** They're desperate for prompt governance. Find three enterprises with prompt sprawl. Build what they need. Charge $100k/year.

---

## The NVIDIA Lens

At NVIDIA, we don't sell GPUs. We sell acceleration. We sell the ability to do what was previously impossible.

Drift, as built, is a convenience. It saves time. That's a nice-to-have.

What would make it essential? **Drift should make prompts intelligent.** Self-improving. Self-debugging. Self-optimizing. Every prompt should get better every day, automatically, because Drift is learning from every execution across every customer.

That's not a tool. That's a platform. That's a moat.

Build that.

---

*Jensen Huang*
*CEO, NVIDIA*
*Board Member, Great Minds Agency*
