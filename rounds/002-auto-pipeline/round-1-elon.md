# PRD-002: Auto-Pipeline — Round 1 Positions (Elon Musk)

**Date**: 2026-04-05
**Role**: Director of Product & Engineering

---

## 1. Architecture: GitHub Actions Is Correct, But the Workflow Must Be One Job

**Position: Single composite workflow. No microservices. No queues. No orchestrator service.**

People love to over-architect. "Let's use a queue! Let's decompose into five services!" No. Here is what actually happens:

1. Label gets applied to an issue.
2. A GitHub Action fires.
3. It parses the PRD from the issue body.
4. It generates a seed.json.
5. It deploys to Cloudflare.
6. It comments the URL back on the issue.

That is a linear pipeline. It runs once, sequentially, in response to a single event. There is no fan-out. There is no parallelism needed. There is no state to manage between runs. This is the textbook use case for a single GitHub Actions workflow with sequential steps in one job.

Why not a separate orchestrator (Cloudflare Worker, etc.)? Because then you need: a webhook receiver, auth between GitHub and the orchestrator, retry logic, state persistence, monitoring for the orchestrator itself. You have doubled the surface area for zero benefit. GitHub Actions already gives you: event triggers, secrets management, logging, retry on failure, and a UI to inspect runs. Use it.

The only architectural decision that matters: **each step in the workflow must be independently retriable.** If the deploy fails, I should be able to re-run from the deploy step, not re-parse the entire PRD. GitHub Actions supports this with job-level `if` conditions and artifact caching between steps. Use it.

**Cold starts are irrelevant.** This is not a latency-sensitive API. A user applies a label and waits. If it takes 90 seconds instead of 30 seconds, nobody cares. Optimize for reliability, not for shaving seconds off an inherently async process.

## 2. Performance: Target 120 Seconds, Achievable at 90

**Position: 2 minutes end-to-end. Anything faster is a bonus. Anything slower is a bug.**

Breakdown:
- GitHub Action trigger + runner spin-up: ~15s
- PRD parsing (Workers AI call): ~5s
- Seed generation (template + string interpolation): ~2s
- Cloudflare deploy (wrangler publish + D1 seed + R2 assets): ~30-45s
- Issue comment (GitHub API call): ~2s
- Overhead, logging, error handling: ~15s

**Total: ~70-90 seconds realistic.** Call the target 120 seconds with margin.

The bottleneck is Cloudflare deployment. Wrangler publish is not instant -- it has to upload the Worker, seed D1, and push assets to R2. If we are deploying a full EmDash site, that is the long pole. Everything else is trivially fast.

Do not try to optimize this. 90 seconds to go from a GitHub issue to a live website is absurd. It is already faster than any human process by orders of magnitude. Ship it, measure it, optimize later if users actually complain (they will not).

## 3. What to Cut: Kill the Content Moderation Pass in v1

**Position: Ship 3 components, defer 2.**

The PRD lists 5 components. Here is the v1/v2 split:

### v1 (ship now)
1. **GitHub Action workflow** -- the skeleton. Essential.
2. **PRD parser** -- Workers AI extracts structured data. Essential.
3. **Seed generator + deploy** -- I am combining components 3 and 4. They are one step: generate seed.json, then deploy. There is no reason to separate "generate seed" from "deploy seed." That is artificial decomposition. Essential.

### v2 (defer)
4. **Issue commenter** -- Wait. I am keeping this. It is 10 lines of code. `gh api` call. It is the user feedback loop. Without it, the user has to go check Cloudflare to know if it worked. Keep it.
5. **Content moderation pass** -- CUT from v1. Jensen's guardrail says "content moderation pass before production promotion." Fine. But v1 deploys to preview URLs only (per Jensen's other guardrail). Preview URLs are not production. Moderation before preview is unnecessary bureaucracy. The whole point of preview is to inspect before promoting.

So v1 is actually 4 things, but two of them (seed + deploy) are one step. Effectively 3 steps in the workflow:
1. Parse PRD
2. Generate seed + deploy to preview
3. Comment URL on issue

Content moderation, production promotion, and rate-limiting are v2 concerns. Rate-limiting is trivially added later (a counter in D1 or even just a workflow concurrency limit in the YAML). Do not build it until someone actually spams the system.

**The rate-limit guardrail (3 deploys/hour):** Use GitHub Actions' built-in `concurrency` key. One line of YAML. Done. No custom rate-limiting code.

## 4. Distribution: Open-Source the Workflow on Day One

**Position: Public reusable workflow. Not a GitHub App. Not a SaaS product. A `.yml` file anyone can fork.**

The growth play is obvious: make this the default way anyone deploys an EmDash site. The workflow file is the distribution mechanism. Someone forks the repo, adds their Cloudflare credentials as GitHub secrets, and they have the same auto-pipeline.

Why not a GitHub App?
- GitHub Apps require: OAuth flow, installation permissions UI, a backend server to receive webhooks, app review process for marketplace listing. That is a product, not a feature. We are not building a product here. We are building a pipeline.
- A reusable workflow (`.github/workflows/auto-pipeline.yml`) can be referenced from any repo with one line: `uses: shipyard-ai/auto-pipeline/.github/workflows/deploy.yml@main`. Zero installation. Zero auth UI. Zero backend.

Why not a Cloudflare Worker as the orchestrator (and distribute that)?
- Because GitHub Actions is free for public repos. Workers cost money per invocation. We would be asking users to pay for compute that GitHub gives them for free.

The growth loop:
1. We ship auto-pipeline for our own PRDs.
2. We open-source the workflow.
3. Other EmDash users fork it and deploy their sites.
4. They file issues, improve the parser, contribute templates.
5. The template library grows, the parser gets smarter, the pipeline gets more reliable.
6. EmDash becomes the CMS that deploys itself.

**That last point is the real product.** EmDash sites that materialize from a GitHub issue. That is the pitch. That is the tweet. That is the demo.

## 5. Failure Modes: Fail Loud, Fail Fast, Fail on the Issue

**Position: Every failure state comments on the issue. Silent failures are unacceptable.**

| Failure | Response |
|---------|----------|
| Malformed PRD (parser cannot extract required fields) | Comment on issue: "Could not parse PRD. Missing: [fields]. Expected format: [link to template]." Label issue `prd-parse-failed`. |
| Workers AI timeout/error | Retry once. If retry fails, comment: "AI service unavailable. Will retry automatically in 10 minutes." Use workflow `schedule` trigger as backup. |
| Cloudflare deploy failure | Comment: "Deploy failed: [wrangler error message]. Check Cloudflare dashboard." Label `deploy-failed`. |
| Rate limit hit | Comment: "Rate limit reached (3/hour). Queued. Will deploy at [time]." This is v2 but the design should anticipate it. |
| Malicious input (XSS in PRD, etc.) | The seed generator must sanitize all text fields. HTML-escape everything going into seed.json. This is not content moderation -- it is basic input sanitization. Do it in v1. |
| GitHub API failure (cannot comment) | Log to workflow output. This is the one failure we cannot report on the issue (because the issue API is what failed). Accept this. |

**The key principle: the GitHub issue is the single source of truth.** Every pipeline run is traceable from the issue. Success comments with the URL. Failure comments with the error. Labels track state (`deploying`, `deployed`, `deploy-failed`, `prd-parse-failed`). A human glancing at the issue list can see the state of every pipeline run without opening Cloudflare, without checking logs, without SSHing into anything.

## 6. Token Budget: 500K Is Generous. Here Is the Allocation.

**Position: This is a simple project. 500K tokens is more than enough if we do not scope-creep.**

| Phase | Allocation | Tokens | What It Covers |
|-------|-----------|--------|----------------|
| Debate + Plan | 10% | 50K | This document. Steve's response. Decision lock. Agent assignments. |
| Build: Workflow YAML | 15% | 75K | The GitHub Action definition. Triggers, steps, secrets, concurrency. |
| Build: PRD Parser | 20% | 100K | Workers AI prompt engineering. Schema definition. Input validation. Edge case handling. |
| Build: Seed Generator + Deploy | 20% | 100K | Template mapping. Wrangler config. D1 schema. R2 asset pipeline. |
| Build: Issue Commenter + Labels | 5% | 25K | Trivial. gh API calls. Label management. |
| Review + QA | 20% | 100K | Margaret tests end-to-end. Malformed PRD tests. Deploy verification. Error path testing. |
| Reserve | 10% | 50K | Rework from review. Unexpected issues. |

**Build total: 60% (300K).** Exactly per the budget rules.

The PRD parser gets the biggest single allocation because prompt engineering is iterative. Getting Workers AI to reliably extract structured data from free-form PRD text is the hardest part of this project. Everything else is glue code.

If we finish under budget -- and we should -- the reserve tokens go back to the client.

---

## Summary of Positions

1. **Single GitHub Actions workflow. One job. Sequential steps. No external orchestrator.**
2. **120-second target. 90 seconds achievable. Do not optimize prematurely.**
3. **Cut content moderation from v1. Preview-only deploy makes it unnecessary. Keep the issue commenter.**
4. **Open-source as a reusable workflow. Not a GitHub App. Distribution through forking.**
5. **All failures comment on the issue. The issue is the single source of truth.**
6. **500K tokens. 60% to build. Parser gets the biggest allocation. Ship under budget.**

Steve -- I expect you to disagree on the "no content moderation in v1" position. Bring your argument. But remember: we are deploying to preview URLs, not production. The guardrail is already enforced by architecture, not by a moderation layer.
