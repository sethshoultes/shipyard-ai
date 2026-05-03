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
| 1.1 | **Inline pipeline step** — verification runs as a job step inside the existing deploy pipeline, not as a standalone microservice or post-deploy stage | Elon (R1) | Elon (consensus) | Accountability. A separate stage accumulates owners, documentation, and eventually a Jira board. Steve conceded fully in R2: "Ship simple. No standalone microservice. Bake it into the pipeline." |
| 1.2 | **No `wrangler` CLI or HTML-grep dependencies** — machine-readable inputs only (env vars, config files). Do not shell out to `wrangler pages project list` or `grep` HTML bodies for build IDs. | Elon (R1/R2) | Elon (consensus) | CLI output formatting changes without semver. Parsing HTML with `grep` is brittle. Steve conceded in R2: "He is right that brittle CLI scraping will break; use environment variables." |
| 1.3 | **Retry with exponential backoff in v1** — 5 attempts over 60 seconds. DNS propagation and CDN invalidation are physics; the check must respect physics. | Elon (R1/R2) | Elon (consensus) | Elon made this a top-3 non-negotiable in R2. Steve conceded explicitly: "He is right about retry logic — DNS propagation is physics, not philosophy." |
| 1.4 | **Check `/` only for v1** — root path is the v1 signal. Deep-route smoke tests (`/pricing`, `/checkout`) are deferred to v1.1. | Elon (R1) | Elon (for v1) | Steve contested ("A green light on `/` while your checkout page 404s is a costume") but conceded for scope discipline: ship `/` only now, expand later. |
| 1.5 | **Origin validation ships, or nothing ships** — validate that the response originates from the expected Cloudflare Pages origin (CNAME / A record), not merely HTTP 200. | Essence | Essence | DNS caches old records and returns 200 from the wrong server. A green check that lies is worse than no check at all. Steve: "Cannot lie." Elon never opposed deterministic network-layer checks. |
| 1.6 | **Cut build-ID body grep / meta-tag injection for v1** — do not pollute every page with verification fodder or scrape HTML bodies. | Elon (R1/R2) | Both | "Injecting build metadata into every page to feed a verification script is v2 theater." Steve did not defend HTML grep in R2; his "verify identity" non-negotiable is acknowledged as build-ID matching in v2, not v1. |

### Product & Experience

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 2.1 | **Name: "Proof"** | Steve (R1) | Steve | One word. Five letters. Hard consonant. "Did you Proof it?" Elon called it "marketing theater" but offered no alternative and conceded in R2: "Proof is a good name. One word. Unforgettable. I concede that immediately." |
| 2.2 | **One breath, one answer** — success output is a single green signal + domain + timestamp. Failure output is exactly one plain-English sentence. No stack traces. No log vomit. | Steve (R1/R2) | Steve | "The verdict, not the courtroom." Elon conceded the binary constraint ("200 or page. That's it") and agreed the answer must fit in a push notification. |
| 2.3 | **No dashboards. No knobs. No configurable thresholds. No cron syntax.** | Steve (R1) | Both | "This is a moment of truth, not a monitoring platform." Elon agreed absolutely: "No graphs." Saying NO to feature creep disguised as flexibility is the moat. |
| 2.4 | **Primary experience is the terminal screen in v1** — the lock-click feeling happens where the deploy already lives. Notifications are v1.1. | Steve (R1) | Steve (with caveat) | Steve: "The best interface is the one you never see — until something is wrong." Elon: "If the deploy fails, the signal must surface where the team already lives." **Resolution**: v1 is terminal-only. Slack/Discord/PagerDuty fire on failure only in v1.1. |
| 2.5 | **Human voice, not sysadmin prose** — error messages read like a smart friend, not a Jira bot. One sentence, ≤140 characters. | Steve (R1/R2) | Steve (scoped) | "Your domain isn't pointing here" beats "DEPLOYMENT_NOT_FOUND." Elon's "raw failure" (`GET / → 404`) is the engineering floor; Steve's one-sentence clarity is the ceiling. |

### Distribution & Scope

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 3.1 | **Default-on in deploy template** — every customer deployment runs this automatically. Zero opt-in. | Elon (R1/R2) | Both | "Opt-in features die in every dataset I've ever seen. Zero friction or it doesn't exist." Steve conceded fully: "Default-on, zero friction." |
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
- **Retry**: 5 attempts over 60 seconds with exponential backoff (Elon's physics; Steve's concession)
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
| 4.1 | **Multi-route verification** | Steve (R2): "A green light on `/` while your checkout page 404s is a costume." Elon (R2): "If `/` 404s, the launch is dead." | Ship `/` only in v1. Add key-routes array to `domains.json` schema as v1.1 if post-launch telemetry proves need. | Build Lead |
| 4.2 | **Notification integration (Slack/Discord/PagerDuty)** | Elon (R2): "If the deploy fails, the signal must surface where the team already lives." Steve (R1/R2): "The notification is a whisper; the screen is the sermon." | v1 is terminal-only. Add optional `SLACK_WEBHOOK_URL` env var in v1.1 that fires on failure only. | Build Lead |
| 4.3 | **Project slug alignment** | QA requirements reference `github-issue-sethshoultes-shipyard-ai-99`. Round directory and this doc are `-98`. | Confirm canonical slug with PM before first commit. If requirements say `-99`, either rename round or document exception. **Do not ship to wrong directory again.** | PM / Build Lead |
| 4.4 | **DNS ownership migration** | Elon (R1): "The real 10x fix is owning the DNS record update inside the same pipeline step that publishes." Steve (R2): "Owning DNS is a six-month migration. Proof can save a customer tonight." | Document as v2 architectural north star. Do not block v1 ship on DNS migration. | Product (Steve) / Build Lead |
| 4.5 | **Expected origin configuration format** | Elon suggested hardcode or `domains.json`. Exact schema undefined in debate. | `domains.json` schema: `[{ "domain": "shipyard.company", "expected_origin": "pages.cloudflare.com" }]`. Start simple. | Build Lead |
| 4.6 | **Proof script runtime** | Shell vs Node vs Python? Elon showed `curl` examples; workflow runs in Ubuntu GitHub runner. | Node.js (`proof.js`) for consistent error formatting and testability. GitHub Actions Ubuntu runner has node by default. | Build Lead |
| 4.7 | **Error message voice calibration** | Steve wants "smart friend" prose. Elon wants `GET / → 404`. | One sentence, plain English, no jargon. If it exceeds 140 characters, cut it. | Build Lead |
| 4.8 | **Build-ID verification for v2** | Steve's non-negotiable #1: "It must verify identity, not just pulse." Elon: "Build-id verification is v2 optimization." | Acknowledged as v2 requirement. When build system supports deterministic build-id injection (headers or meta tags), Proof will verify it. Do not block v1. | Build Lead / Product |

---

## 5. Risk Register (What Could Go Wrong)

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 5.1 | **False negative from DNS cache / wrong origin** | High | Critical | Origin validation (CNAME/A record check) is non-negotiable. HTTP 200 alone is insufficient. If origin check cannot be implemented, the feature does not ship. | Build Lead / QA (Margaret) |
| 5.2 | **Green on `/`, 404 on sub-routes** | Medium | Medium | Risk accepted for v1 per locked decision 1.4. Document in `domains.json` schema comments that multi-route is planned. | Product (Steve) |
| 5.3 | **Scope creep into monitoring platform** | Medium | Medium | Cultural guardrail: "Proof is the verdict, not the courtroom." Any PR adding dashboards, charts, or knobs must cite an explicit Open Question resolution. | Phil Jackson (Agency) |
| 5.4 | **Empty deliverables / slug mismatch repeat** | Low (already happened once) | Critical | Builder ritual: run `ls deliverables/` before QA call. Verify slug against requirements before first keystroke. Commit incrementally. Empty directory should alarm builder, not inspector. | Build Lead |
| 5.5 | **Alert fatigue from transient failures** | Medium | High | v1 is terminal-only, so noise is contained to the deploy log. Retry with backoff absorbs transient DNS blips. When v1.1 adds Slack, implement deduplication and auto-resolution before scaling. | Build Lead |
| 5.6 | **Self-DoS at scale** | Low (now) | High | Keep checks async and rate-limited. Architecture supports parallel domain checks but v1 has single domain. | Build Lead |
| 5.7 | **Retry timeout too short for slow DNS propagation** | Medium | Medium | 60 seconds is Elon's proposal. If telemetry shows frequent timeouts, adjust to 90s in v1.1. Document that propagation beyond 60s is treated as real failure. | Build Lead |
| 5.8 | **Build phase produces requirements mismatch** | Medium | Critical | QA Pass 1 already failed on DEPLOY-001 through DEPLOY-004. The workflow MUST contain `on.push.paths: ['website/**']`, `npm ci`, `npm run build`, `wrangler pages deploy`, and secrets references. | Build Lead / QA (Margaret) |
| 5.9 | **Poetry delays the ship** | Medium | Critical | v1 ships one sentence, not a brand bible. Steve's voice principle is real, but "Did you Proof it?" is v3. v1 must ship in hours, not sprints. | Phil Jackson (Agency) |
| 5.10 | **Steve's "verify identity" demand resurrects build-ID scope** | Medium | High | Locked decision 1.6 explicitly cuts build-ID grep for v1. If Steve re-opens this in build, escalate to Phil Jackson. v1 ships without build-ID injection. | Build Lead / Agency |

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
