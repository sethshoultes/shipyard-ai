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
| 1.1 | **Inline pipeline step** — verification runs as a job step inside the existing deploy pipeline, not as a standalone microservice or post-deploy stage | Elon (R1) | Elon | Steve conceded fully in R2: "A CI step is the correct integration point; I just refuse to let it feel like a cron job." |
| 1.2 | **No `wrangler` CLI or HTML-grep dependencies** — machine-readable inputs only (env vars, config files). Do not shell out to `wrangler pages project list` or parse HTML bodies for build hashes. | Elon (R1/R2) | Elon | "Parsing `wrangler` CLI output collapses when Cloudflare updates the tool." Steve conceded in R2: "He's right that we shouldn't scrape `wrangler` CLI output like amateurs." |
| 1.3 | **Retry with exponential backoff in v1** — 5 attempts over 60 seconds. DNS propagation and CDN invalidation are physics; the check must respect physics. | Elon (R1/R2) | Elon | Elon's top non-negotiable. Steve conceded in R2: "Retry logic with exponential backoff is non-negotiable — DNS propagation and CDN cache invalidation will kill us otherwise." |
| 1.4 | **Check `/` only for v1** — root path is the v1 signal. Deep-route smoke tests (`/pricing`, `/checkout`) are deferred. | Elon (R1) | Elon (for v1) | Steve contested in R2 ("A green light on `/` while your checkout page 404s is a costume"), but Elon held: "If `/` 404s, the launch is dead." Route-level checks deferred to v1.1. |
| 1.5 | **Origin validation ships, or nothing ships** — validate that the response originates from the expected Cloudflare Pages origin, not merely HTTP 200. | Essence | Essence | DNS caches old records and returns 200 from the wrong server. A green check that lies is worse than no check at all. |
| 1.6 | **Cut build-ID body grep / meta-tag injection for v1** — do not pollute every page with verification metadata or scrape HTML bodies for build hashes. | Elon (R1/R2) | Elon (for v1) | "Checking that HTML contains the build hash requires touching the build system, bundler, and meta tag injection." Steve demanded build-ID verification in v1 (R2), but the locked scope defers identity verification to v2 to avoid blocking the ship. |

### Product & Experience

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 2.1 | **Name: "Proof"** | Essence (post-debate) | Essence | One word. Five letters. Hard consonant. Steve proposed "Canary" in both rounds and never conceded; Elon dismissed naming as "marketing theater." The post-debate essence locks "Proof" as the synthesis. Call it what the blueprint calls it. |
| 2.2 | **One breath, one answer** — success output is a single green signal + domain + timestamp. Failure output is exactly one plain-English sentence. No stack traces. No log dumps. | Steve (R1/R2) | Steve (with Elon concession) | "The verdict, not the courtroom." Elon conceded in R2: "the failure message should state the facts like a pilot... That is good taste in a high-stakes moment." |
| 2.3 | **No dashboards. No knobs. No configurable thresholds. No cron syntax.** | Steve (R1) + Elon (R2) | Both | Steve: "The customer already has a build ID and a domain — we verify them automatically, or we don't ship." Elon agreed: "NO configuration wizards... dead on." |
| 2.4 | **Primary experience is the terminal screen in v1** — the lock-click feeling happens where the deploy already lives. | Steve (R1) | Steve (for v1) | Steve: "The best interface is the one you never see — until something is wrong." Elon wants signals to surface where teams live (R2), but agreed v1 should fail the CI job. Notifications deferred to v1.1. |
| 2.5 | **Human voice, not sysadmin prose** — error messages read like a pilot reporting altitude: clear, calm, unarguable. One sentence, ≤140 characters. | Steve (R1/R2) | Steve (scoped) | "Your domain isn't pointing here" beats "DEPLOYMENT_NOT_FOUND." Elon's "raw failure" (`GET / → 404`) is the engineering floor; Steve's one-sentence clarity is the ceiling. Synthesis: one sentence, plain English, no jargon. |

### Distribution & Scope

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 3.1 | **Default-on in deploy template** — every customer deployment runs this automatically. Zero opt-in. | Elon (R1/R2) | Elon (with Steve caveat) | "Opt-in features die in every dataset I've ever seen. Zero friction or it doesn't exist." Steve warned in R2 that "make it impossible to skip is how you get shadow IT," but both agree on zero friction for v1. Enforcement-vs.-desire tension is a v1.1 cultural question. |
| 3.2 | **Proof is not a product; it is pipeline conscience** — do not price it, do not list it on a pricing page, do not make it a SKU. | Steve (R1) + Elon (R1) | Both | Steve: "We removed a fear." Elon: "This is infrastructure, not a growth feature. Nobody signs up for a deploy verification tool." |

---

## 2. MVP Feature Set (What Ships in v1)

### Core Deliverables
1. **GitHub Actions workflow** `.github/workflows/deploy-website.yml` — triggers on `push` to `main` when `website/**` changes (DEPLOY-001, DEPLOY-002)
2. **Build step** — `npm ci && npm run build` in `website/` directory, producing `website/out/` (DEPLOY-003)
3. **Deploy step** — `wrangler pages deploy website/out/` to Cloudflare Pages project `shipyard-ai` using repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (DEPLOY-003, DEPLOY-004)
4. **Proof verification step** — inline post-deploy check, runs automatically (default-on, zero opt-in)

### Verification Behavior
- **Target**: Root path `/` via HTTPS
- **Method**: HTTP GET with origin validation (expected CF Pages IP/CNAME — non-negotiable per Essence)
- **Retry**: 5 attempts over 60 seconds with exponential backoff
- **Parallel**: Architecture supports parallel domain checks (single domain now, multi-domain ready)
- **Success output**: `Verified` + domain + timestamp
- **Failure output**: One plain-English sentence explaining exactly what is wrong (e.g., "Your domain isn't pointing here.") ≤140 characters
- **No output**: Stack traces, log dumps, charts, dashboards, configurable knobs, or retry spinners

### Explicitly NOT in v1
- Slack/Discord/PagerDuty integrations
- Multi-route verification (`/pricing`, `/checkout`, etc.)
- Build-ID body grep or HTML meta-tag verification
- `wrangler pages project list` runtime API calls
- Human approval gate
- Configurable retry policies, alert thresholds, or propagation windows
- Cron syntax or scheduled checks
- Standalone microservice

---

## 3. File Structure (What Gets Built)

```
github-issue-sethshoultes-shipyard-ai-98/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # Build + deploy + Proof (verification step inline)
├── scripts/
│   └── proof.js                    # Verification engine: origin check, retry logic, output formatting
├── domains.json                    # Domain list + expected Cloudflare origins (replaces wrangler API)
├── website/                        # Existing Next.js site (build context)
│   ├── package.json
│   └── ...
└── decisions.md                    # This document
```

### File Rationale
- **`deploy-website.yml`**: The pipeline. Must exist to satisfy DEPLOY-001 through DEPLOY-004. The Proof step is inlined as a job step post-deploy.
- **`scripts/proof.js`**: Separate from YAML for testability, readability, and replacement when the platform changes. Elon's "accountable" principle. Steve's "one word, one screen" logic lives here.
- **`domains.json`**: Human-readable, version-controlled, no runtime API fragility. Elon's cut of wrangler dependency.

---

## 4. Open Questions (What Still Needs Resolution)

| # | Question | Context | Proposed Resolution | Owner |
|---|----------|---------|---------------------|-------|
| 4.1 | **Build-ID verification: v1 or v2?** | Steve (R2) non-negotiable #1: "Build ID verification in v1. Not v2. Without it we are monitoring liveness, not correctness." Elon: "CUT build-id body matching for v1." | **Locked for v1**: Cut build-ID matching to unblock ship. Acknowledged as v1.1 or v2 requirement. When build system supports deterministic build-id injection (headers or meta tags), Proof will verify it. Escalate to Phil Jackson if re-opened. | Build Lead / Product |
| 4.2 | **Multi-route verification** | Steve (R2): "A green light on `/` while your checkout page 404s is a costume." Elon (R2): "If `/` 404s, the launch is dead." | Ship `/` only in v1. Add key-routes array to `domains.json` schema as v1.1 if post-launch telemetry proves need. | Build Lead |
| 4.3 | **Notification integration (Slack/Discord/PagerDuty)** | Elon (R2): "If the deploy fails, the signal must surface where the team already lives." Steve (R1/R2): "The notification is a whisper; the screen is the sermon." | v1 is terminal-only. Add optional `SLACK_WEBHOOK_URL` env var in v1.1 that fires on failure only. | Build Lead |
| 4.4 | **Project slug alignment** | QA requirements reference `github-issue-sethshoultes-shipyard-ai-99`. Round directory and this doc are `-98`. | Confirm canonical slug with PM before first commit. If requirements say `-99`, either rename round or document exception. **Do not ship to wrong directory again.** | PM / Build Lead |
| 4.5 | **DNS ownership migration** | Elon (R1): "The real 10x fix is owning the DNS record update inside the same pipeline step that publishes." Steve (R2): "Owning DNS is a six-month migration. Proof can save a customer tonight." | Document as v2 architectural north star. Do not block v1 ship on DNS migration. | Product (Steve) / Build Lead |
| 4.6 | **Expected origin configuration format** | Elon suggested hardcode or `domains.json`. Exact schema undefined in debate. | `domains.json` schema: `[{ "domain": "shipyard.company", "expected_origin": "pages.cloudflare.com" }]`. Start simple. | Build Lead |
| 4.7 | **Proof script runtime** | Shell vs Node vs Python? Elon showed `curl` examples; workflow runs in Ubuntu GitHub runner. | Node.js (`proof.js`) for consistent error formatting and testability. GitHub Actions Ubuntu runner has node by default. | Build Lead |
| 4.8 | **Error message voice calibration** | Steve wants "smart friend" prose. Elon wants `GET / → 404`. | One sentence, plain English, no jargon. If it exceeds 140 characters, cut it. | Build Lead |

---

## 5. Risk Register (What Could Go Wrong)

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 5.1 | **False negative from DNS cache / wrong origin** | High | Critical | Origin validation (CNAME/A record check) is non-negotiable. HTTP 200 alone is insufficient. If origin check cannot be implemented, the feature does not ship. | Build Lead / QA (Margaret) |
| 5.2 | **Steve re-opens build-ID verification during build** | Medium | High | Steve declared it non-negotiable in R2. If he re-opens scope, escalate to Phil Jackson. v1 ships without build-ID injection. Do not negotiate with a locked decision. | Build Lead / Agency |
| 5.3 | **Green on `/`, 404 on sub-routes** | Medium | Medium | Risk accepted for v1 per locked decision 1.4. Document in `domains.json` schema comments that multi-route is planned. | Product (Steve) |
| 5.4 | **Scope creep into monitoring platform** | Medium | Medium | Cultural guardrail: "Proof is the verdict, not the courtroom." Any PR adding dashboards, charts, or knobs must cite an explicit Open Question resolution. | Phil Jackson (Agency) |
| 5.5 | **Empty deliverables / slug mismatch repeat** | Low (already happened once) | Critical | Builder ritual: run `ls deliverables/` before QA call. Verify slug against requirements before first keystroke. Commit incrementally. Empty directory should alarm builder, not inspector. | Build Lead |
| 5.6 | **Alert fatigue from transient failures** | Medium | High | v1 is terminal-only, so noise is contained to the deploy log. Retry with backoff absorbs transient DNS blips. When v1.1 adds Slack, implement deduplication and auto-resolution before scaling. | Build Lead |
| 5.7 | **Self-DoS at scale** | Low (now) | High | Keep checks async and rate-limited. Architecture supports parallel domain checks but v1 has single domain. | Build Lead |
| 5.8 | **Retry timeout too short for slow DNS propagation** | Medium | Medium | 60 seconds is Elon's proposal. If telemetry shows frequent timeouts, adjust to 90s in v1.1. Document that propagation beyond 60s is treated as real failure. | Build Lead |
| 5.9 | **Build phase produces requirements mismatch** | Medium | Critical | QA Pass 1 already failed on DEPLOY-001 through DEPLOY-004. The workflow MUST contain `on.push.paths: ['website/**']`, `npm ci`, `npm run build`, `wrangler pages deploy`, and secrets references. | Build Lead / QA (Margaret) |
| 5.10 | **Poetry delays the ship** | Medium | Critical | v1 ships one sentence, not a brand bible. Steve's voice principle is real, but "Did you Proof it?" is v3. v1 must ship in hours, not sprints. | Phil Jackson (Agency) |

---

## 6. Build Phase Mandate

> *"The soul of basketball is not in the highlight reel. It is in the pick-and-roll, done perfectly, ten thousand times."*

We are not shipping a cathedral. We are installing a door latch that clicks at 2 AM and removes the pit from your stomach.

**Non-negotiables for the builder:**
1. Origin validation ships, or nothing ships. (Essence)
2. Retry with exponential backoff ships in v1. DNS is physics. (Elon + Steve consensus)
3. The deliverables directory must contain files before QA is called. (Retrospective)
4. The slug must match the requirements document exactly. (QA Pass 1)
5. If it cannot be read in 30 seconds, it is too complex. (Steve)
6. When in doubt, cut it. Then cut it again. (Elon)

**Triangle offense of this build:**
- **Elon's corner**: Correctness, speed, default-on, inline architecture, retry with backoff, no grep.
- **Steve's corner**: Dignity, one word, plain English, invisible seatbelt, the lock-click feeling.
- **Margaret's corner**: Nothing ships untested. Empty directories are a P0 block. Slug mismatch is a P0 block.

The championship is won in the fundamentals. Build.
