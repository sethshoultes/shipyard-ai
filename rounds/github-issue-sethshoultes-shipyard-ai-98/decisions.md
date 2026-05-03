# Decisions — github-issue-sethshoultes-shipyard-ai-98
**Consolidator**: Phil Jackson — Zen Master, Great Minds Agency
**Date**: 2026-05-03
**Status**: Blueprint for Build Phase
**Mantra**: The strength of the team is each individual member. The strength of each member is the team.

---

## 1. Locked Decisions

### Architecture & Engineering

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1.1 | **Pipeline-native verification, not a standalone service.** Verification is a post-deploy step inside `.github/workflows/deploy-website.yml` (or an invoked script), not a container, queue, or microservice. | Elon (R1) | Both | Elon (R1): "The simplest system is a 15-line shell script in the deploy pipeline, not a new service." Steve (R2): "Starting as a GitHub Actions step is the right boundary." Locked as Elon's non-negotiable #1. |
| 1.2 | **Header-based verification.** Inject and assert `X-Shipyard-Build` against the commit SHA. No HTML body parsing, no `grep`, no framework-dependent scraping. | Elon (R1/R2) | Elon (with Steve concession) | Elon (R1): "`grep '$BUILD_ID'` breaks on every framework update. Use an HTTP header." Steve (R2): "Body parsing is brittle. The `X-Shipyard-Build` header is the correct injection point." Locked as Elon's non-negotiable #2. |
| 1.3 | **Default-on for every deploy.** Zero opt-in, zero toggles, zero "enable Proof." If you deploy, you verify. | Elon (R1/R2) | Elon (with Steve agreement) | Elon (R1): "Wire it into every customer deploy by default." Steve (R2): "If a developer has to remember to turn it on, we've already failed." Locked as Elon's non-negotiable #3. |
| 1.4 | **Pipeline halts on verification failure.** A failed check fails the deploy. The CI badge is the alert; there is no separate paging system. | Elon (R1) + Steve (R2) | Both | Elon (R1): "If the check fails, fail the deploy. A red CI badge is the alert. Building a paging system is scope creep." Steve (R2 non-negotiable #3): "Failure halts the pipeline with finality, not a to-do." |
| 1.5 | **Retry with exponential backoff.** DNS propagation is physics; the check must respect physics. | Elon (R1) | Both | Elon (R1): "DNS propagation takes 0–300 seconds; add retries with exponential backoff, not a fixed sleep." Steve (R2): "Retry logic with exponential backoff is non-negotiable — DNS propagation and CDN cache invalidation will kill us otherwise." |
| 1.6 | **Redirect following.** `https.get` must handle 301/302s. Apex → `www` redirects false-negative without it. | Elon (R1) | Elon | Elon (R1): "The current `https.get` doesn't follow 301/302s. Apex → `www` redirects will false-negative and burn retries." Steve does not contest. |
| 1.7 | **Parallel domain checks with a concurrency cap.** Sequential checks become a pipeline bottleneck at scale. | Elon (R1) | Elon (with Steve concession) | Elon (R1): "Parallelize with `xargs -P` or it becomes the pipeline bottleneck." Steve (R2): "Parallelization at scale is non-negotiable." Cap is required to avoid self-DoS. |
| 1.8 | **Check `/` only for v1.** Root path is the v1 signal. Deep-route checks deferred. | Elon (R1) | Elon (for v1) | Elon (R1): "Start with `/`. Checking `/about` and `/pricing` is v2 theater." Steve (R2) contests: "One route is hope. Three strategic routes is certainty." Locked for v1: `/` only. |
| 1.9 | **No HTML body matching / BUILD_ID grep for v1.** Do not scrape HTML for build hashes. | Elon (R1) | Both | Elon (R1): "`grep '$BUILD_ID'` breaks on every framework update." Steve (R2): "Body parsing is brittle." |
| 1.10 | **No QA handoff gate.** Margaret does not manually curl domains. | Elon (R1) | Elon | Elon (R1): "Margaret should not be manually curling domains. This is automation, not human process." |

### Product & Experience

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 2.1 | **Name: "Proof."** One word. Hard consonants. Definitive. | Steve (R1) | Steve (with Elon concession) | Steve (R1): "Nobody wants 'Deploy Verification Suite v2.1.' They want **Proof**." Steve (R2 non-negotiable #1): "The name is Proof." Elon (R2): "Steve, I love the name 'Proof.' It's good copy." Elon resists the *ceremony* around the name, not the name itself. |
| 2.2 | **Verdict output, not dashboards.** The user gets one authoritative signal: **Confirmed** or **Failed.** No charts, no health matrices, no log dumps. | Steve (R1/R2) | Steve (with Elon concession) | Steve (R2 non-negotiable #2): "The output is one word: Confirmed. Or Failed. No intermediate states." Elon (R2): "A single clean log line — `Proof: shipyard.company confirmed.` — is correct." |
| 2.3 | **No dashboards. No knobs. No configurable thresholds. No cron syntax.** | Steve (R1) + Elon (R2) | Both | Steve (R1): "NO to another monitoring dashboard. NO to latency percentile graphs. NO to configurable knobs." Elon (R2): "Premature productization is the enemy... If you build a dashboard before you build the gate, you have a very beautiful thing that lets broken code through." |
| 2.4 | **Primary experience is the CI terminal in v1.** The lock-click feeling happens where the deploy already lives. | Steve (R1) + Elon (R2) | Both (for v1) | Elon (R2): "The pipeline *is* the UI. A failed exit code and a clear sentence... is infinitely more useful than animated bulbs." Steve (R2): "The developer staring at that terminal output for thirty seconds after a deploy *is* the user." |
| 2.5 | **Human voice, not sysadmin prose.** One sentence. Plain English. No passive voice, no acronyms, no stack traces. | Steve (R1/R2) | Steve (scoped) | Steve (R1): "Speak like a human who cares. Confident, warm, absolute." Elon (R2) concedes on clean log lines but rejects "poetry" as a time cost. Synthesis: one authoritative sentence, plain English, no jargon. |

### Distribution & Scope

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 3.1 | **Proof is pipeline conscience, not a SKU.** Do not price it, do not list it, do not product-market it. It is infrastructure hygiene. | Steve (R1) + Elon (R1) | Both | Steve (R1): "It's about the joy of shipping without fear." Elon (R1): "This isn't a user-facing product; it's a pipeline gate. Nobody signs up for a 'deploy verification tool.'" |
| 3.2 | **Retention through reliability, not feature marketing.** The growth effect is a customer's launch not 404ing. | Elon (R1) | Both | Elon (R1): "You don't 'distribute' a smoke test; you wire it into every customer deploy by default. The growth effect is retention." Steve's tugged-handle metaphor aligns: certainty creates loyalty. |

---

## 2. MVP Feature Set (What Ships in v1)

### Core Deliverables
1. **`.github/workflows/deploy-website.yml`** — GitHub Actions workflow satisfying DEPLOY-001 through DEPLOY-004:
   - Trigger on `push` to `main` when paths under `website/**` change
   - Build Next.js site (`npm ci && npm run build`)
   - Deploy `website/out/` to Cloudflare Pages project `shipyard-ai` via `wrangler pages deploy`
   - Use `${{ secrets.CLOUDFLARE_API_TOKEN }}` and `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`
   - **Post-deploy Proof step** — runs automatically after `wrangler pages deploy`

2. **Proof verification step** (inline or as `scripts/proof.js`) with the following v1 behavior:
   - Reads custom domains from `wrangler pages project get --json`
   - Targets root path `/` via HTTPS
   - Follows 301/302 redirects (max 5 hops)
   - Validates `X-Shipyard-Build` header matches `$CF_PAGES_COMMIT_SHA`
   - Retries up to 5 times with exponential backoff
   - Parallelizes domain checks with a hard concurrency cap (e.g., 10)
   - Fails the pipeline on verification failure
   - Outputs a single authoritative line on success (`Proof: <domain> confirmed.` or equivalent)
   - Outputs one plain-English sentence on failure, no stack traces

### Explicitly NOT in v1
- Multi-route verification (`/about`, `/pricing`, etc.)
- BUILD_ID body grep or HTML meta-tag scraping
- Slack/Discord/PagerDuty/alerting integrations
- Monitoring dashboards, latency percentile graphs, or health matrices
- Configurable retry policies, alert thresholds, or propagation windows
- Cron syntax or scheduled checks outside the deploy pipeline
- Human approval gate or QA handoff step
- Standalone microservice, container, or queue

---

## 3. File Structure (What Gets Built)

```
/home/agent/shipyard-ai/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # MODIFY/CREATE — build + deploy + Proof step
├── website/                        # EXISTING — Next.js site (build context)
│   ├── package.json
│   └── ...
└── rounds/github-issue-sethshoultes-shipyard-ai-98/
    ├── round-1-elon.md
    ├── round-1-steve.md
    ├── round-2-elon.md
    ├── round-2-steve.md
    ├── essence.md
    ├── qa-pass-1.md
    ├── retrospective.md
    └── decisions.md                # This document
```

### File Rationale
- **`deploy-website.yml`**: The single integration point. Must satisfy all four QA requirements (DEPLOY-001 through DEPLOY-004). The Proof step lives as a post-deploy job step or as a called script. Per locked decision 1.1, no new services, no new infrastructure.
- **`website/`**: Existing Next.js application. The workflow builds from this directory and deploys `website/out/`.
- **No `domains.json` required for v1**: Elon (R1) specifies reading domains directly from `wrangler pages project get --json`. The workflow already has Cloudflare credentials; it queries the source of truth at deploy time rather than maintaining a separate config file.
- **No separate `scripts/proof.js` required if inline suffices**: The 15-line shell script Elon described can live inline in the workflow. If complexity grows beyond ~50 lines, extract to `scripts/proof.js`. Per locked decision: if it takes longer than 50 lines, scope is too broad.

---

## 4. Open Questions (What Still Needs Resolution)

| # | Question | Context | Proposed Resolution | Owner |
|---|----------|---------|---------------------|-------|
| 4.1 | **Project slug alignment: `-98` vs `-99`.** | QA Pass 1 detected a critical mismatch: requirements reference `github-issue-sethshoultes-shipyard-ai-99`, but the deliverables directory and this round are `-98`. The retrospective notes: "Slug mismatch. Requirements said `-99`; deliverables path was `-98`." | Confirm canonical slug with PM before first commit. If requirements say `-99`, either rename the round directory or document an explicit exception. **Do not ship to the wrong directory again.** | PM / Build Lead |
| 4.2 | **Multi-route verification: v1.1 or v2?** | Steve (R2): "One route is hope. Three strategic routes is certainty." Elon (R1): "Checking `/about` and `/pricing` is v2 theater." | Locked for v1: `/` only. Expand to `routes` array when telemetry proves sub-route failures are a real, frequent pattern. | Build Lead |
| 4.3 | **Notification integrations (Slack/Discord) for v1.1?** | Both say NO for v1. Steve (R1): "NO to Slack integrations that spam channels with noise." Elon (R1): "A red CI badge is the alert." | v1 is terminal-only. If post-v1 telemetry shows teams missing failures in crowded CI matrices, add an optional webhook env var that fires **only on failure** and **only after retries exhaust**. | Build Lead |
| 4.4 | **Exact retry timing and backoff formula.** | Elon (R1) says both "exponential backoff" and "Retry 5x with 10s backoff." These are not identical. 5x10s fixed = 50s wall time. 5-attempt exponential (e.g., 1→2→4→8→15s) = ~30s. | Ship exponential in v1: 1s → 2s → 4s → 8s → 15s (~30s total). If Cloudflare propagation telemetry shows frequent timeout false-negatives, escalate to Open Question 4.4.1. | Build Lead |
| 4.5 | **Concurrency cap exact value.** | Elon (R1) says "parallelize with `xargs -P`" but does not name a number. | Cap at 10 concurrent domain checks for v1. Tune if customer domain counts grow. | Build Lead |
| 4.6 | **Error message voice calibration.** | Steve wants "best friend who checked" prose. Elon wants factual clarity with minimal character count. | One sentence, plain English, no jargon. If it exceeds ~100 characters, cut it. Success: `Proof: <domain> confirmed.` Failure: `Proof: <domain> failed — <specific reason>.` | Build Lead |
| 4.7 | **Multi-region validation for v1 vs later.** | Steve (R2) concedes: "Single-point DNS from Virginia is false confidence. Proof must validate from multiple regions, invisibly." Elon (R1) says distributed checks are needed at 100×. | Document as v1.1 or v2 architectural requirement. Do not block v1 ship on multi-region checks. Single-region (GitHub Actions runner) is accepted for the current customer count. | Build Lead / Product |
| 4.8 | **Build system support for `X-Shipyard-Build` header injection.** | The header verification depends on the build system (Next.js / wrangler / Cloudflare Pages) reliably emitting `X-Shipyard-Build` containing the commit SHA. | Verify that `CF_PAGES_COMMIT_SHA` is available in the build environment and can be injected as a response header. If Pages does not support this natively, the build step may need to embed it (e.g., via `_headers` file or edge function). **If the header cannot be emitted, the verification logic must adapt or the feature does not ship.** | Build Lead |

---

## 5. Risk Register (What Could Go Wrong)

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 5.1 | **False negative from DNS cache / stale records / wrong origin.** | High | Critical | Origin validation is mandatory: validate the response originates from the expected Cloudflare Pages origin (via `CF-Worker` / `CF-Ray` headers or DNS resolution check), not merely HTTP 200. If origin cannot be reliably validated, the feature does not ship. | Build Lead / QA (Margaret) |
| 5.2 | **Scope creep into monitoring platform.** | Medium | Medium | Cultural guardrail: "Proof is the verdict, not the courtroom." Any PR adding dashboards, charts, configurable knobs, or cron syntax must cite an explicit Open Question resolution. | Phil Jackson (Agency) |
| 5.3 | **Empty deliverables / slug mismatch repeat.** | Low (already happened once) | Critical | Builder ritual from retrospective: verify slug against requirements before first keystroke. Run `ls` on deliverables before QA call. Commit incrementally. Empty directory should alarm builder, not inspector. | Build Lead |
| 5.4 | **Steve re-opens emotional-design debates during build.** | Medium | High | Steve's voice principle is real, but v1 ships one sentence, not a brand bible. If debate reopens, escalate to Phil Jackson. The existing `deploy-website.yml` + Proof step should be completable in one focused session. | Build Lead / Agency |
| 5.5 | **Self-DoS from unbounded parallel checks.** | Low (few domains now) | High | Concurrency cap is mandatory (locked decision 1.7). Replace bare `Promise.all` with a bounded pool. | Build Lead |
| 5.6 | **Retry timeout too short for slow DNS propagation.** | Medium | Medium | Ship exponential backoff (~30s total) in v1. If telemetry shows frequent timeout false-negatives, escalate to Open Question 4.4. Document that propagation beyond the backoff window is treated as a real failure. | Build Lead |
| 5.7 | **Redirect loop false-negative.** | Medium | Medium | Apex → `www` redirects are common. Redirect following (max 5) is mandatory in v1. | Build Lead / QA (Margaret) |
| 5.8 | **Green on `/`, 404 on sub-routes.** | Medium | Medium | Risk accepted for v1 per locked decision 1.8. Expansion to multi-route is v1.1 if telemetry proves need. | Product (Steve) |
| 5.9 | **Poetry delays the ship.** | Medium | Critical | v1 ships a working pipeline, not a manifesto. The `essence.md` captures the spirit; `deploy-website.yml` captures the execution. If the build exceeds one focused agent session, scope is too broad. | Phil Jackson (Agency) |
| 5.10 | **Build system cannot emit `X-Shipyard-Build` header.** | Medium | Critical | Per Open Question 4.8, verify header injection feasibility before writing verification logic. If Cloudflare Pages + Next.js cannot surface the commit SHA as a response header, the locked header-based verification is blocked. Have a fallback plan (e.g., `_headers` static file generation during build) or do not ship. | Build Lead |

---

## 6. Build Phase Mandate

> *"The soul of basketball is not in the highlight reel. It is in the pick-and-roll, done perfectly, ten thousand times."*

We are not shipping a cathedral. We are tightening a latch that already exists. The requirement is a GitHub Actions workflow that builds a Next.js site, deploys it to Cloudflare Pages, and then — automatically, invisibly, without knobs or dashboards — confirms the customer's domain is serving from the right origin.

**Non-negotiables for the builder:**
1. The workflow file ships, or nothing ships. (QA Pass 1 — DEPLOY-001 through DEPLOY-004)
2. Origin validation ships, or nothing ships. (Essence: "A green light from the wrong server is a lie.")
3. Header-based verification ships in v1. No HTML parsing. (Elon)
4. Retry with exponential backoff ships in v1. DNS is physics. (Elon + Steve consensus)
5. Redirect following ships in v1. Apex domains are real. (Elon + Steve consensus)
6. Concurrency cap ships in v1. Self-DoS is embarrassing. (Elon + Steve consensus)
7. The deliverables directory must contain files before QA is called. (Retrospective)
8. The slug must match the requirements document exactly. (QA Pass 1)
9. If it cannot be read in 30 seconds, it is too complex. (Steve)
10. When in doubt, cut it. Then cut it again. (Elon)

**Triangle offense of this build:**
- **Elon's corner**: Correctness, speed, default-on, inline architecture, header verification, retry with backoff, no grep, no dashboards, no microservices.
- **Steve's corner**: Dignity, one word, plain English, invisible seatbelt, the lock-click feeling, the verdict, no noise.
- **Margaret's corner**: Nothing ships untested. Empty directories are a P0 block. Slug mismatch is a P0 block. Verify your own hands before you call the inspector.

The championship is won in the fundamentals. Build.
