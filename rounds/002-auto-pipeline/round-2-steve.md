# Round 2 — Steve Jobs

## PRD-002: Auto-Pipeline

**Date**: 2026-04-05
**Role**: Director of Design & Brand

---

## 1. Where I Agree with Elon

I will say this clearly so there is no ambiguity: Elon is right about the architecture.

Single GitHub Actions workflow. One job. Sequential steps. No orchestrator service. I read his reasoning on why a separate Cloudflare Worker doubles the surface area for zero benefit, and he is correct. I do not need to understand plumbing to know when the plumbing is elegant. His pipeline is three steps — parse, build+deploy, comment — and that is honest engineering. No vanity abstractions. No "what if we need to scale" theater. I respect it.

He is right about the 120-second target. My Round 1 said "under 2 minutes" and his breakdown shows 70-90 seconds realistic. We agree. The disagreement was never about speed — it was about what happens during those 90 seconds. More on that below.

He is right that the issue commenter stays. Ten lines of code, closes the feedback loop. Obviously.

He is right about failure modes. Every failure comments on the issue. Labels track state. A human can glance at the issue list and see everything. That is good design — not visual design, but system design. The issue as single source of truth is a strong principle and I adopt it fully.

His token budget is reasonable. 500K, 60% to build, parser gets the biggest allocation. I would have allocated differently, but I will make my case below rather than rejecting his numbers outright.

---

## 2. Where I Challenge Elon

### The Form Is Not Scope Creep — It Is the Product

Elon did not address my form proposal directly. He built his entire argument around GitHub as the interface, which tells me he thinks the form is a v2 concern. It is not.

Here is my concession: for v1, the trigger is a GitHub issue. I accept that. But here is what I will not accept: designing the PRD parser as if the input will always be a free-form GitHub issue written by an engineer.

The parser must accept structured input. Three fields: what the site is for, who it is for, what tone. If the GitHub issue body contains those three fields in any reasonable format, the parser extracts them. If someone writes a rambling paragraph, the parser still extracts them. But the schema is designed around those three fields from day one. That way, when the form exists — and it will exist, because this product dies if it requires GitHub literacy — the form simply writes a structured issue body, and the parser already knows what to do.

This costs nothing extra. It is a schema decision, not a feature. I am not asking for a web app in v1. I am asking for a parser that assumes structured input so that the web app in v2 is trivial.

### Content Moderation: He Is Right, and I Was Wrong — But Not Entirely

Elon challenged me directly on this. He said preview URLs are not production, and moderation before preview is unnecessary bureaucracy. He is correct on the logic. A preview URL that only the creator sees does not need content moderation. I concede this for v1.

But I want one thing on the record: the moment we add production promotion — and that is v2, not v3, not "someday" — content moderation is not optional. And it is not just text content. It is design quality moderation. A site that passes a profanity filter but looks like it was assembled by a randomizer still damages the Shipwright brand. When we build the promotion step, it includes both content safety and a design quality gate. I will define that gate. Elon can build the mechanism.

For v1, I accept: no moderation. Preview only. Ship it.

### Build Narration Is Not a Vanity Feature

Elon did not address the experience arc at all. He treated the pipeline as a backend concern. Parse, generate, deploy, comment. Done. The user gets a URL in a GitHub comment.

For the engineer user in v1, fine. The GitHub comment is the interface. But the build narration — the human-readable progress feed — is not a UI feature. It is a logging decision.

Each step in the workflow already logs output. I am asking that those logs be written in human-readable language, not just machine-readable language. Instead of `step: parse_prd, status: complete, duration: 4.2s`, write `Parsed your site description. Found: restaurant site, warm tone, targeting local families.` Same information. Same log. Different language.

This costs approximately zero additional tokens. It is a string template change in the step output. And it means that when we build the real-time feed in v2, the data already exists in a format we can stream to a UI. We are not retrofitting.

I am not asking for a WebSocket server in v1. I am asking for log messages that a human can read. That is a quality bar, not a feature.

### Beautiful URLs Are Non-Negotiable

Elon implicitly dismissed this by specifying Cloudflare deploy with wrangler. The default output is something like `auto-pipeline-abc123.workers.dev`. That is not a URL anyone shares. That is a build artifact.

The fix is trivial: a custom domain on Cloudflare (`preview.shipwright.site`) with a path-based routing scheme (`preview.shipwright.site/marias-kitchen`). This is a DNS record and a route config. It is not a feature. It is a setting.

If the URL looks like infrastructure, people treat it like infrastructure. If it looks like a real website address, people share it. This is the difference between a demo and a product. I will not ship worker hashes as URLs.

---

## 3. Where I Refine My Own Positions

### Open Source Changes Everything — And Elon Saw It First

I did not address distribution in Round 1. Elon's open-source play is the single most important strategic decision in this document, and I missed it entirely. Credit where it is due.

A reusable workflow that anyone can fork changes my UX thinking significantly. If the workflow is the distribution mechanism, then the GitHub issue IS the interface for the open-source community. My form abstraction is for our hosted product. The open-source version lives in GitHub natively. Two surfaces, same parser, same pipeline.

This means the parser schema matters even more. It is the contract between any intake surface — our form, their GitHub issue, a Slack bot, a CLI tool — and the pipeline. The parser is the API. Everything upstream is a client.

### The Name

Shipwright stands. Elon did not challenge it, which means either he agrees or he does not care about naming. Either way, the name ships.

### Token Budget Adjustment

Elon allocated 0% to UX concerns — no tokens for URL routing, log message formatting, or the structured schema I am requesting. These are small items, but they are not zero.

I propose taking 5% from the reserve (25K tokens) and allocating it to what I will call "experience polish": custom domain setup, human-readable log templates, and structured parser schema. This leaves 5% reserve (25K) which is still adequate for a project this contained. If Elon's architecture is as simple as he claims — and I believe him — we will not need 50K in reserve.

---

## 4. Final Positions

| Topic | Round 1 Position | Round 2 Position | Changed? |
|-------|-----------------|-----------------|----------|
| Architecture | No strong position (deferred to Elon) | **Single GitHub Actions workflow. Agree fully.** | Aligned |
| Trigger UX | Form, not GitHub | **GitHub issue for v1. Parser schema designed for structured input from day one.** | Refined |
| Experience Arc | Real-time build feed, full-screen reveal | **Human-readable log messages in v1. Stream-ready for v2 feed.** | Scoped down |
| Content Moderation | Assumed necessary | **Cut from v1. Required for v2 production promotion, including design quality gate.** | Conceded |
| Quality Bar | Curated types, palettes, grid, imagery | **Unchanged. This is the seed generator's job. 20% of budget is enough.** | Held |
| URLs | Beautiful preview URLs | **Custom domain (`preview.shipwright.site`) required. Non-negotiable.** | Held |
| Distribution | Not addressed | **Open-source workflow. Parser as the universal API contract.** | Adopted from Elon |
| Naming | Shipwright | **Shipwright. "Describe it. It's live."** | Held |
| Token Budget | Not addressed | **500K total. Move 25K from reserve to experience polish. 5% reserve.** | Refined |
| Build Narration | Full real-time feed | **Human-readable step logs. No WebSocket in v1.** | Scoped down |

---

## What Needs Resolution Before Plan Phase

Two items remain genuinely unresolved:

1. **Custom domain for preview URLs.** I need Elon to confirm this is technically trivial (DNS + route config on Cloudflare) and agree to include it in v1 scope. If he pushes back, I want to hear why.

2. **Structured parser schema.** The parser should expect and prefer structured input (three fields) while gracefully handling free-form text. This is an architectural decision that affects v2 cost. I need Elon to agree the schema is designed for structured intake, even though v1 intake is unstructured GitHub issues.

Everything else is locked. We agree on architecture, timeline, budget, moderation deferral, and distribution strategy. Those two items are the only gap between debate and plan.

Let us lock this and build.

---

*Steve Jobs, Director of Design & Brand*
*Shipyard AI*
