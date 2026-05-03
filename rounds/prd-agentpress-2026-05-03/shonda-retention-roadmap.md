# AgentPress — Retention Roadmap & v1.1 Features
**Version:** 1.1 Vision (Post-MVP Bridge)
**Date:** 2026-05-03

---

## What Keeps Users Coming Back

Retention is not a feature. It is the byproduct of **trust compounded by speed**.

### 1. The First 30 Seconds (Activation)
- **Mechanic:** Type human words → hit return → prose or image appears in under 2 seconds (for mapped intents).
- **Why it sticks:** The emotional hook is "superpowers at 3 AM." Users brag about it. Word-of-mouth in WordPress communities is the cheapest acquisition.
- **v1.1 upgrade:** Cache the 50 most common intent patterns locally. If the user asks for something similar to a past task, skip the network entirely.

### 2. Memory = Accountability (Week 1–4)
- **Mechanic:** The Activity Log CPT shows exactly what AgentPress did while the user slept: timestamp, agent used, latency, status.
- **Why it sticks:** WordPress admins are paranoid about plugins that "do things" invisibly. Logs turn paranoia into confidence. A product without memory is a product without accountability.
- **v1.1 upgrade:** Log pruning settings (retain N days / N entries) + lightweight analytics dashboard: tasks per week, average latency, most-used agent. Users optimize what they can measure.

### 3. The Site Learns Your Voice (Month 2–3)
- **Mechanic:** AgentPress indexes the site’s existing posts, tags, categories, and media to generate on-brand prose and relevant featured images.
- **Why it sticks:** Generic AI content is interchangeable. Content that sounds like *your* previous writing is irreplaceable. This is the data flywheel.
- **v1.1 upgrade:** Build a local embedding index of post content. Route generation prompts with site context (top 3 similar posts, tone vector, keyword frequency). No fine-tuning yet—just retrieval-augmented generation (RAG) using WordPress data gravity.

### 4. Agent Marketplace Curiosity (Month 3+)
- **Mechanic:** A third-party developer ships a new agent. The user discovers it inside wp-admin, one-click install, no code.
- **Why it sticks:** Network effects for a single-site plugin are weak, but the *perception* of an expanding cortex creates stickiness. Users keep the plugin installed because "the next agent might solve my new problem."
- **v1.1 upgrade:** Open `agentpress_register_capability()` to vetted third-party plugins. Publish a simple agent boilerplate on GitHub.

### 5. Speed Compounding (Ongoing)
- **Mechanic:** The more posts a user creates via AgentPress, the faster their overall workflow becomes: bulk generation, scheduled publishing, auto-tagging.
- **Why it sticks:** Habit formation. AgentPress becomes the default interface for content creation rather than the classic WordPress editor. Switching back feels like manual labor.
- **v1.1 upgrade:** Bulk task endpoint (`/wp-json/agentpress/v1/batch`) and Action Scheduler integration for background processing.

---

## v1.1 Feature Set

**Mandate:** Bridge the gap between v1 MVP and v2 platform. Fix the deepest pain points surfaced by board review without introducing bloat.

### Routing & Performance
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Semantic Keyword Map v1.1** | Local keyword routing + embedding-based intent similarity for near-misses ("draft a post" ≈ "write a blog"). | Cuts 40–60% of LLM routing calls. Speed = delight. |
| **Routing Accuracy Feedback** | Thumbs up/down on every completed task. Feedback feeds the local map whitelist. | Users feel in control. Accuracy improves weekly. |
| **Prompt Result Cache** | Redis/transient cache for identical intents + site context. TTL: 24 hours for content, 1 hour for images. | Repeat tasks feel instant. Shared hosting friendly. |
| **Streaming Endpoint** | `/wp-json/agentpress/v1/stream` for long-form prose generation. SSE instead of async REST wait. | "Async REST in 2026 is dead on arrival." Modern feel. |

### Agents & Capabilities
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Third Agent: Publisher** | Auto-scheduling, category/tag suggestions, excerpt generation, slug optimization. Does NOT compete with Yoast on meta schema. | Fills the "last mile" gap: users generate content but still manually publish. |
| **Site Voice Embedding Index** | Indexes site content into a lightweight vector store (SQLite or custom table). Injects tone + top-k similar posts into prompts. | Output feels personal. Churn drops when content is unique. |
| **Developer Hooks (Public Beta)** | `agentpress_register_capability()`, `agentpress_before_task`, `agentpress_after_task`, `agentpress_filter_prompt`. Documented, filter-based, no SaaS. | Third-party devs start building. Ecosystem gravity begins. |

### Infrastructure & Trust
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Async Action Scheduler** | WP Cron / Action Scheduler queue for image generation, bulk tasks, and large site indexing. | Shared hosts stop timing out. Users on cheap hosting stay. |
| **Log Analytics Mini-Dashboard** | One-screen stats: tasks this week, avg latency, cache hit rate, routing accuracy %. No charts libraries—HTML + CSS only. | Users see value compound. Justifies the API cost emotionally. |
| **BYOK Toggle** | Site admin can override the shared API key with their own Claude key. Falls back to shared key if blank. | Power users (the ones who write reviews) feel respected. Scales cost away from host. |
| **JSON Parser v1.1** | Schema validation, markdown-fence stripping, hallucination recovery (auto-retry with stricter prompt). Prevents pipeline collapse. | Reliability. Users forgive slow; they do not forgive broken. |

### Distribution & Onboarding
| Feature | Description | Retention Impact |
|---------|-------------|------------------|
| **Demo Mode** | Plugin ships with a sandbox API key capped at 10 requests/day. Users test before configuring their own key. | Removes the "will this even work?" friction. |
| **Agent Marketplace Teaser** | Admin screen shows "Available Agents" grid (2–3 third-party agents, vetted by core team). One-click install via standard WP plugin dependency. | Ecosystem promise becomes tangible. |
| **WordPress.org Compliance Pack** | readme.txt, assets/screenshots, banner, tested-up-to tags, API-usage disclosure. | Organic install flow from wp-admin "Add Plugin" search. |

---

## v1.1 What We Still Say NO To

To preserve focus, the following remain **v2**:
- SaaS tiers, billing dashboards, or "Pro" badges
- Real-time front-end chat widget (still no)
- Multi-site orchestration
- TensorRT / local GPU acceleration
- Full fine-tuning on customer voice (RAG is enough for v1.1)
- Agent ratings/commerce layer (marketplace is discovery-only in v1.1)

---

## Retention Flywheel Summary

```
Week 1:   Speed surprise → emotional hook → plugin stays installed
Week 2-4: Logs build trust → user brags → organic referral
Month 2:  Site voice index → output feels irreplaceable → habit forms
Month 3:  Third agent + dev hooks → ecosystem curiosity → lock-in deepens
Ongoing:  Bulk/async + cache → workflow default → switching costs rise
```

**Rule:** A beautiful product that buckles at 10,000 users is a better problem to have than an ugly product that never reaches ten. v1.1 is the polish that turns the first into reality.
