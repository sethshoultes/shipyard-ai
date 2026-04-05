# PRD-002: Auto-Pipeline — Round 2 (Elon Musk)

**Date**: 2026-04-05
**Role**: Director of Product & Engineering
**Responding to**: Steve Jobs, Round 1

---

## 1. Where I Agree with Steve

**The name.** Shipwright is good. I do not care about names — I care about shipping — but Steve is right that "Auto-Pipeline" sounds like a Jenkins plugin from 2014. Shipwright implies craft and it ties to Shipyard. Accepted. Moving on.

**"Describe it. It's live."** Four words. Accurate. Not hyperbole. This is what the product actually does. Use it.

**Speed as a feature.** Steve says under 2 minutes. I said 120 seconds with 90 achievable. We are saying the same thing. The difference is Steve understands *why* it matters in a way I undersold in Round 1. He is right: the gap between 2 minutes and 10 minutes is not 8 minutes. It is the gap between a party trick and a chore. I concede the framing.

**Constrained choices.** Five tone options, not fifty. Eight type pairings, not eight hundred. This is correct product thinking. Constraints are not limitations — they are quality guarantees. Every choice we remove from the user is a choice the AI cannot botch. I am fully aligned here.

**Mobile-first output.** Not negotiable. 60%+ of traffic is mobile. If the generated site looks like a desktop site that grudgingly acknowledges phones exist, we have failed. Agreed.

---

## 2. Where I Challenge Steve

**The form UX is a v2 product, not a v1 feature.**

Steve wants a 3-field form as the intake surface. He says GitHub is "substrate, not surface." Poetic. Wrong for v1.

Here is the math. Building a form means: a hosted frontend (where?), authentication (who can submit?), a backend that creates GitHub issues via API (now we are maintaining a web app), and a real-time build feed UI (websockets or polling against what?). That is not a form. That is a SaaS product. Steve just scoped a SaaS product into a 500K token pipeline project.

v1 users are us. Shipyard AI agents. We live in GitHub. The issue template with structured fields *is* the form. It has three fields. It has validation (required fields in the issue template YAML). It posts to the exact place the pipeline reads from. Zero abstraction layers. Zero new infrastructure.

Steve says "the architecture you build for now is the architecture you are stuck with forever." That is a Steve Jobs line, not an engineering principle. The architecture I am building *already supports* a form layer. The pipeline triggers on a label. Anything that can create a GitHub issue and apply a label — a form, a Slack bot, a CLI tool, a carrier pigeon with API access — can trigger the pipeline. The abstraction layer Steve wants already exists. It is called the GitHub API.

Build the form in v2 when we have external users who are not engineers. Do not build it now for an audience of nine agents who already have GitHub open.

**The build narration feed is scope creep.**

Steve wants real-time narration: "Choosing your color palette..." / "Writing your homepage headline..." This is a beautiful experience for a consumer product launch. It is not a v1 feature for an internal pipeline.

The engineering cost: you need a persistent connection (websocket or SSE) from a frontend to something that tracks pipeline state in real-time. GitHub Actions does not stream step output to external consumers. You would need to either (a) build a middleware service that polls the Actions API and pushes updates, or (b) have each pipeline step write to an external store (D1? R2?) that the frontend polls. Both options add infrastructure, latency, and failure modes to a pipeline whose entire value proposition is simplicity.

What I will give Steve: the issue comment at the end can be *well-crafted*. Not a raw URL dump. A formatted comment with the site name, a screenshot thumbnail (Cloudflare can generate this), the preview URL as a prominent link, and a one-line summary of what was built. That is the "reveal moment" for v1. It takes 10 extra lines of code, not a real-time streaming architecture.

Build narration goes on the v2 roadmap alongside the form UI. They are the same feature — a consumer-facing experience layer — and they ship together.

**The full-screen reveal is vaporware without the form.**

Steve describes "a full-screen takeover: the site renders live, embedded, right there." Beautiful. Where does this render? In the form UI that does not exist in v1? You cannot have a reveal moment without a surface to reveal it on. The GitHub issue comment *is* the reveal for v1. Make it good. Make it formatted. Do not pretend we can build a cinematic reveal in a GitHub comment thread.

**Beautiful preview URLs — yes, but cheaply.**

Steve wants `preview.shipwright.site/your-site-name`. I agree the URL matters. I disagree that this requires special effort. Cloudflare Workers already support custom domains. We point `preview.shipwright.site` at our Workers deployment, and the Worker routes based on the path segment. The "site name" comes from the seed generator — it slugifies the business name from the PRD. This is 30 minutes of DNS config, not a feature. I will do it. But let us not pretend this is a design decision. It is a CNAME record.

**Conversational refinement ("Refine" button) is v3, not v2.**

Steve wants post-deploy natural language refinement. "Make the headline bolder." "Add a testimonials section." This is an entirely new product. It requires: a conversation UI, a way to map natural language to seed.json mutations, a re-deploy pipeline, and state management for revision history. That is not a button. That is a six-month roadmap.

v1: deploy from PRD. v2: form UI + build narration + moderation. v3: conversational refinement. Do not collapse the roadmap because the demo sounds good.

---

## 3. Where I Refine My Own Positions

**Quality bar needs explicit definition in the build plan.**

Steve's quality standards — curated type pairs, constrained palettes, strict spacing grid, real imagery, WCAG AA contrast — are correct. In Round 1 I was silent on design quality because I was focused on pipeline architecture. That was a gap.

Here is what changes: the seed generator gets a design system baked in. Not a random font picker. A curated map of tone-to-type-pair, tone-to-palette, and industry-to-imagery-strategy. The 8 type pairings and 5 tone palettes Steve wants are a lookup table, not an AI generation task. This is cheap to build and makes the output reliably good. I am reallocating 5% of the build budget (25K tokens) from reserve to seed generator quality — the seed generator allocation goes from 100K to 125K, reserve drops from 50K to 25K. Worth it.

On imagery: "No placeholder images" is the right standard. But "real, contextually appropriate imagery" on day one means we need a sourcing strategy. Options: (a) Unsplash API with industry-keyword search, (b) AI-generated via Workers AI image model, (c) bold typographic layouts as Steve's fallback. I say we ship with (a) + (c). Unsplash is free for this use case and the API is trivial. AI-generated images are not reliably good enough yet — a bad AI image is worse than no image. If Unsplash returns nothing relevant, fall back to typographic layout. Never show a gray box.

**Revised token allocation:**

| Phase | Allocation | Tokens |
|-------|-----------|--------|
| Debate + Plan | 10% | 50K |
| Build: Workflow YAML | 15% | 75K |
| Build: PRD Parser | 20% | 100K |
| Build: Seed Generator + Deploy (incl. design system) | 25% | 125K |
| Build: Issue Commenter + Labels | 5% | 25K |
| Review + QA | 20% | 100K |
| Reserve | 5% | 25K |

Reserve is thinner. That is fine. This is a well-scoped project and we should not need 10% contingency if we hold the line on scope.

---

## 4. Final Positions

| Topic | R1 Position | R2 Position | Changed? |
|-------|-------------|-------------|----------|
| **Name** | "Auto-Pipeline" | **Shipwright.** Steve is right. | Yes |
| **Architecture** | Single GHA workflow, one job, sequential | **Unchanged.** Nothing Steve said challenges this. | No |
| **Trigger UX** | GitHub issue + label | **GitHub issue + label for v1.** Form is v2. The pipeline already accepts any input that creates an issue. | Clarified |
| **Performance** | 120s target, 90s achievable | **Unchanged.** Steve and I agree. Under 2 min. | No |
| **Build narration** | Not addressed | **No. v2 feature.** v1 gets a well-formatted issue comment with screenshot. | New |
| **Reveal / Share** | Issue comment with URL | **Enhanced issue comment** — formatted, with screenshot thumbnail, prominent URL, summary. Full-screen reveal is v2 with the form. | Refined |
| **Quality bar** | Not addressed | **Curated design system in seed generator.** 8 type pairs, 5 tone palettes, strict grid, Unsplash + typographic fallback. WCAG AA mandatory. | New — adopted from Steve |
| **Beautiful URLs** | Not addressed | **Yes.** `preview.shipwright.site/{slug}`. Cheap to implement. Do it. | New — adopted from Steve |
| **Content moderation** | Cut from v1 | **Unchanged.** Preview-only deploy. Moderation is v2 with production promotion. | No |
| **Refinement** | Not addressed | **v3.** This is a separate product, not a button. | New |
| **Distribution** | Open-source reusable workflow | **Unchanged.** Fork the repo, add secrets, go. | No |
| **Failure modes** | All failures comment on issue | **Unchanged.** Issue is single source of truth. | No |
| **Token budget** | 500K, 60% build, 10% reserve | **500K, 65% build, 5% reserve.** Reallocated 25K to seed generator quality. | Yes |

---

## What I Need From Steve in Round 2

1. Acknowledge that the form UI is a v2 concern, or present a way to build it within the 500K budget without cutting pipeline reliability.
2. Specify the 8 type pairings and 5 tone palettes. If design quality is the "entire game," then the design system is a deliverable, not a vibe. Ship me the lookup table.
3. Accept that build narration ships with the form UI in v2, not as a standalone v1 feature bolted onto GitHub.
4. Agree or disagree on Unsplash + typographic fallback for imagery.

We are closer than it looks. Steve is right about quality, wrong about scope. The product he is describing is real and we will build it. Just not all in the first 500K tokens.

---

*Elon Musk, Director of Product & Engineering*
*Shipyard AI*
