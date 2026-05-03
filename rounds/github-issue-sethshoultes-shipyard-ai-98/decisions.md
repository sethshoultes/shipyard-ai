# Decisions — github-issue-sethshoultes-shipyard-ai-98
**Consolidator**: Phil Jackson — Zen Master, Great Minds Agency
**Date**: 2026-05-03
**Status**: Blueprint for Build Phase
**Mantra**: The strength of the team is each individual member. The strength of each member is the team.

---

## 1. Locked Decisions

### Architecture

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1.1 | **Inline pipeline step** — verification runs as a job step inside the existing deploy pipeline (`deploy-website.yml` → `scripts/proof.js`), not as a standalone microservice | Elon (R1) | Both (mechanism by Elon) | Elon: "One post-deploy line in `deploy.sh` — `node ../../scripts/proof.js` — covers 100% of customer launches." Steve (R2): "Integration is invisible and automatic. No opt-in, no switches... It just happens, beautifully, on every single deploy." |
| 1.2 | **No `wrangler` CLI scraping or HTML-grep dependencies** — machine-readable inputs only (env vars, `domains.json`). Do not shell out to `wrangler pages project list` or parse HTML bodies for build hashes. | Elon (R1/R2) | Elon | Elon (R1): "scrapes `wrangler` CLI output which breaks the moment Cloudflare changes formatting. Kill it." Steve (R2): "He's right that we shouldn't scrape `wrangler` CLI output like amateurs." |
| 1.3 | **Retry with exponential backoff in v1** — 5 attempts over ~30 seconds (1s → 2s → 4s → 8s → 15s). DNS propagation is physics; the check must respect physics. | Elon (R1/R2) | Elon | Elon (R1): "Cloudflare DNS can take 30–90 seconds to globally converge after a deploy. The deliverable's 5-attempt exponential backoff... is the right physics." Steve (R2): "Retry logic with exponential backoff is non-negotiable — DNS propagation and CDN cache invalidation will kill us otherwise." |
| 1.4 | **Redirect following (`maxRedirects: 5`)** — `https.get` must follow 301/302s. Apex → `www` redirects false-negative without it. | Elon (R1/R2) | Elon | Elon (R1): "the current `https.get` doesn't follow 301/302s. Apex → `www` redirects will false-negative and burn retries." Steve (R2): "redirect following is absolutely essential. Without it, we're not verifying — we're guessing." |
| 1.5 | **Concurrency cap of 10** — hard limit on parallel domain checks to avoid OS file-descriptor exhaustion at scale | Elon (R1/R2) | Elon | Elon (R1): "add a hard `Promise.all` concurrency limit of 10. Otherwise this becomes a deploy-time DOS of itself." Steve (R2): "`Promise.all` without a concurrency leash will DOS itself at roughly fifty domains." |
| 1.6 | **Check `/` only for v1** — root path is the v1 signal. Deep-route checks deferred. | Elon (R1/R2) | Elon (for v1) | Elon (R1): "Cut to `/` only. The homepage 404ing is the failure mode. More routes = more noise, same signal." Steve contested (R2): "One route is hope. Three strategic routes is certainty." Locked: `/` only ships in v1. |
| 1.7 | **Origin validation ships, or nothing ships** — validate that the response originates from the expected Cloudflare Pages origin, not merely HTTP 200. | Essence | Essence | Essence: "Origin validation. A green light from the wrong server is a lie." Already partially implemented in `scripts/proof.js` via CNAME/A-record checks and Cloudflare header validation. |
| 1.8 | **Cut BUILD_ID body matching / meta-tag injection for v1** — do not inject build hashes into page bodies or scrape HTML for them in this release. | Elon (R1/R2) | Elon (for v1) | Elon (R1): "Injecting a build hash into every Astro/Next.js build output is a cross-cutting build-system change. Cut it from v1." Steve (R2) declared it non-negotiable: "BUILD_ID body matching stays. Identity verification, not presence detection." Locked decision: defer to v2 to avoid blocking the ship. |

### Product & Experience

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 2.1 | **Name: "Proof"** | Essence | Essence | Essence locks "Proof" as the synthesis: "The latch that clicks after deploy." Steve proposed "Beacon" (R1); Elon dismissed naming as premature productization (R2): "'Beacon' is a great name for a customer-facing SaaS. This is a pipeline gate. Naming it doesn't make it more reliable." The existing script is already named `proof.js`. |
| 2.2 | **One breath, one answer** — success output is a single green signal + domain + timestamp. Failure output is exactly one plain-English sentence. No stack traces. No log dumps. | Steve (R1/R2) | Steve (with Elon concession) | Essence: "The verdict, not the courtroom." Steve (R1): "Just proof. It should feel like watching dominoes fall perfectly in slow motion, not like debugging DNS at 3am." Elon conceded (R2): "the log line shouldn't read 'Deployment verification completed with status code 200.' It should say 'Your ship is in the water.' Human-readable output matters, even in CI." |
| 2.3 | **No dashboards. No knobs. No configurable thresholds. No cron syntax.** | Steve (R1) + Elon (R2) | Both | Steve (R1): "NO to 'advanced configuration' screens. NO to cron job mentality." Elon (R2): "Premature productization is the enemy... If you build a dashboard before you build the gate, you have a very beautiful thing that lets broken code through." |
| 2.4 | **Primary experience is the CI terminal in v1** — the lock-click feeling happens where the deploy already lives. | Steve (R1) + Elon (R2) | Both (for v1) | Elon (R2): "The pipeline *is* the UI. A failed exit code and a clear sentence... is infinitely more useful than animated bulbs." Steve (R2): "The developer staring at that terminal output for thirty seconds after a deploy *is* the user." Notifications deferred to v1.1. |
| 2.5 | **Human voice, not sysadmin prose** — error messages read like a best friend who checked: clear, warm, absolute. One sentence. No passive voice. No acronyms. | Steve (R1/R2) | Steve (scoped) | Steve (R1): "We say: 'Your ship is in the water. Your users see it.' Speak like a human who cares. Confident, warm, absolute." Elon's floor is raw HTTP facts; Steve's ceiling is emotional clarity. Synthesis: one sentence, plain English, no jargon. The existing `formatFailure()` in `proof.js` already aims for this but may need voice calibration. |

### Distribution & Scope

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 3.1 | **Default-on in deploy template** — every customer deployment runs this automatically. Zero opt-in. | Elon (R1/R2) | Elon (with Steve agreement) | Elon (R1): "If it's opt-in, adoption will be under 10%. Make it impossible to skip. Trust compounds faster than marketing spend." Steve (R2): "Integration is invisible and automatic... It just happens, beautifully, on every single deploy. If a developer has to remember to turn it on, we've already failed." |
| 3.2 | **Proof is pipeline conscience, not a SKU** — do not price it, do not list it on a pricing page, do not make it a product line. | Steve (R1) + Elon (R1) | Both | Steve (R1): "This isn't about DevOps metrics or pipeline hygiene or MTTR. It's about the joy of shipping without fear." Elon (R1): "This isn't a user-facing product; it's a pipeline gate. Nobody signs up for a 'deploy verification tool.'" |

---

## 2. MVP Feature Set (What Ships in v1)

### Core Deliverables
1. **Enhanced `scripts/proof.js`** — verification engine with the following v1 additions:
   - Redirect following (`maxRedirects: 5`) for apex → `www` handling
   - Exponential backoff retry (5 attempts: 1s → 2s → 4s → 8s → 15s)
   - Concurrency cap of 10 for parallel domain checks
   - Calibrated human voice in success/failure output
2. **`domains.json`** — domain list + expected Cloudflare origins (already exists; schema stable)
3. **`.github/workflows/deploy-website.yml`** — already exists and already calls `proof.js` post-deploy. Workflow satisfies DEPLOY-001 through DEPLOY-004 from QA requirements.
4. **No new files beyond the above** — the delta is logic inside `proof.js`, not new infrastructure.

### Verification Behavior (v1)
- **Target**: Root path `/` via HTTPS
- **Method**: HTTP GET with origin validation (DNS CNAME/A-record check + Cloudflare headers)
- **Retry**: 5 attempts with exponential backoff (~30s total wall time)
- **Redirects**: Follow 301/302 up to 5 hops
- **Parallel**: Max 10 concurrent domain checks
- **Success output**: One line. Format: `Verified <domain> <timestamp>` (or Elon's conceded human variant: "Your ship is in the water.")
- **Failure output**: One plain-English sentence explaining exactly what is wrong. No stack traces. No JSON.
- **No output**: Charts, dashboards, knobs, retry spinners, or Slack blocks

### Explicitly NOT in v1
- BUILD_ID body grep or HTML meta-tag verification
- Multi-route verification (`/pricing`, `/checkout`, etc.)
- Slack/Discord/PagerDuty integrations
- `wrangler pages project list` runtime API calls
- Human approval gate
- Configurable retry policies, alert thresholds, or propagation windows
- Cron syntax or scheduled checks
- Standalone microservice

---

## 3. File Structure (What Gets Built)

```
/home/agent/shipyard-ai/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # EXISTING — build + deploy + Proof step (lines 41–45)
├── scripts/
│   └── proof.js                    # MODIFY — add redirect following, retry backoff, concurrency cap, voice polish
├── domains.json                    # EXISTING — config: domain, expected_origin, routes
├── website/                        # EXISTING — Next.js site (build context)
│   ├── package.json
│   └── ...
└── rounds/github-issue-sethshoultes-shipyard-ai-98/
    └── decisions.md                # This document
```

### File Rationale
- **`deploy-website.yml`**: Already satisfies DEPLOY-001 through DEPLOY-004. No structural changes needed for v1. The Proof step at lines 41–45 is the integration point.
- **`scripts/proof.js`**: Already exists with DNS, HTTPS, and Cloudflare header checks. v1 work is additive: redirect handling inside `checkHttps()`, backoff wrapper around `verifyDomain()`, and `p-limit` style concurrency control replacing bare `Promise.all`.
- **`domains.json`**: Already exists. Human-readable, version-controlled, no runtime API fragility. Elon's cut of `wrangler` dependency is already realized.

---

## 4. Open Questions (What Still Needs Resolution)

| # | Question | Context | Proposed Resolution | Owner |
|---|----------|---------|---------------------|-------|
| 4.1 | **BUILD_ID verification: v1 or v2?** | Steve (R2) non-negotiable #1: "BUILD_ID body matching stays. Without it, we're not solving the problem." Elon (R2) non-negotiable #1: "`/ ` only, no BUILD_ID matching in v1." | **Locked for v1**: Cut build-ID matching to unblock ship. When build system supports deterministic build-id injection (headers or meta tags), Proof will verify it. Escalate to Phil Jackson if reopened during build. | Build Lead |
| 4.2 | **Multi-route verification** | Steve (R2): "One route is hope. Three strategic routes is certainty." Elon (R2): "If `/` 404s, the launch is dead." | Ship `/` only in v1. Add `routes` array expansion to `domains.json` schema as v1.1 if telemetry proves need. | Build Lead |
| 4.3 | **Notification integration (Slack/Discord/PagerDuty)** | Elon (R2): "If the deploy fails, the signal must surface where the team already lives." Steve (R1/R2): terminal-first. | v1 is terminal-only. Add optional `SLACK_WEBHOOK_URL` env var in v1.1 that fires on failure only. | Build Lead |
| 4.4 | **Project slug alignment** | QA requirements reference `github-issue-sethshoultes-shipyard-ai-99`. Round directory and this doc are `-98`. Retrospective flagged slug mismatch. | Confirm canonical slug with PM before first commit. If requirements say `-99`, either rename round or document exception. **Do not ship to wrong directory again.** | PM / Build Lead |
| 4.5 | **Error message voice calibration** | Steve wants "best friend who checked" prose. Elon wants factual clarity. | One sentence, plain English, no jargon. If it exceeds 140 characters, cut it. Steve's "Your ship is in the water" is the reference tone. | Build Lead |
| 4.6 | **DNS ownership migration** | Elon (R1): "The real 10x fix is owning the DNS record update inside the same pipeline step that publishes." Steve (R2): "Owning DNS is a six-month migration. Proof can save a customer tonight." | Document as v2 architectural north star. Do not block v1 ship on DNS migration. | Product / Build Lead |
| 4.7 | **Retry timeout calibration** | Elon proposes 30s total (1+2+4+8+15). Cloudflare DNS can take 30–90s. | Ship 30s in v1. If telemetry shows frequent timeouts, adjust to 60s in v1.1. Document that propagation beyond backoff window is treated as real failure. | Build Lead |

---

## 5. Risk Register (What Could Go Wrong)

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 5.1 | **False negative from DNS cache / wrong origin** | High | Critical | Origin validation (CNAME/A-record check + Cloudflare headers) is non-negotiable. HTTP 200 alone is insufficient. If origin check cannot be relied upon, the feature does not ship. | Build Lead / QA (Margaret) |
| 5.2 | **Steve re-opens BUILD_ID verification during build** | Medium | High | Steve declared it non-negotiable in R2. If reopened, escalate to Phil Jackson. v1 ships without build-ID injection. Do not negotiate with a locked decision. | Build Lead / Agency |
| 5.3 | **Green on `/`, 404 on sub-routes** | Medium | Medium | Risk accepted for v1 per locked decision 1.6. The existing `domains.json` schema supports `routes` array; expansion is v1.1. | Product (Steve) |
| 5.4 | **Scope creep into monitoring platform** | Medium | Medium | Cultural guardrail: "Proof is the verdict, not the courtroom." Any PR adding dashboards, charts, or knobs must cite an explicit Open Question resolution. | Phil Jackson (Agency) |
| 5.5 | **Empty deliverables / slug mismatch repeat** | Low (already happened once) | Critical | Builder ritual: verify slug against requirements before first keystroke. Run `ls` on deliverables before QA call. Commit incrementally. Empty directory should alarm builder, not inspector. | Build Lead |
| 5.6 | **Alert fatigue from transient failures** | Medium | High | v1 is terminal-only, so noise is contained to the deploy log. Retry with backoff absorbs transient DNS blips. When v1.1 adds Slack, implement deduplication before scaling. | Build Lead |
| 5.7 | **Self-DoS at scale** | Low (single domain now) | High | Concurrency cap of 10 already mandated. Existing `proof.js` uses bare `Promise.all`; v1 must replace with bounded concurrency. | Build Lead |
| 5.8 | **Retry timeout too short for slow DNS propagation** | Medium | Medium | 30 seconds is Elon's proposal (1+2+4+8+15). If telemetry shows timeouts, escalate to Open Question 4.7. Document that propagation beyond window is treated as real failure. | Build Lead |
| 5.9 | **Redirect loop false-negative** | Medium | Medium | Apex → `www` redirects are common. Without redirect following, every such deploy false-negatives. `maxRedirects: 5` is mandatory in v1. | Build Lead / QA (Margaret) |
| 5.10 | **Poetry delays the ship** | Medium | Critical | v1 ships one sentence, not a brand bible. Steve's voice principle is real, but "Did you Proof it?" is v3. The existing `proof.js` is ~200 lines; v1 delta should be <50 lines. If the build exceeds one agent session, scope is too broad. | Phil Jackson (Agency) |

---

## 6. Build Phase Mandate

> *"The soul of basketball is not in the highlight reel. It is in the pick-and-roll, done perfectly, ten thousand times."*

We are not shipping a cathedral. We are tightening a latch that already exists. The pipeline, the script, and the config are already in place. The v1 work is physics and voice: redirects, backoff, concurrency, and a sentence that lets Margaret sleep.

**Non-negotiables for the builder:**
1. Origin validation ships, or nothing ships. (Essence)
2. Retry with exponential backoff ships in v1. DNS is physics. (Elon + Steve consensus)
3. Redirect following ships in v1. Apex domains are real. (Elon + Steve consensus)
4. Concurrency cap ships in v1. Self-DoS is embarrassing. (Elon + Steve consensus)
5. The deliverables directory must contain files before QA is called. (Retrospective)
6. The slug must match the requirements document exactly. (QA Pass 1)
7. If it cannot be read in 30 seconds, it is too complex. (Steve)
8. When in doubt, cut it. Then cut it again. (Elon)

**Triangle offense of this build:**
- **Elon's corner**: Correctness, speed, default-on, inline architecture, retry with backoff, no grep, no dashboards.
- **Steve's corner**: Dignity, one word, plain English, invisible seatbelt, the lock-click feeling, the best friend who checked.
- **Margaret's corner**: Nothing ships untested. Empty directories are a P0 block. Slug mismatch is a P0 block. Verify your own hands before you call the inspector.

The championship is won in the fundamentals. Build.
