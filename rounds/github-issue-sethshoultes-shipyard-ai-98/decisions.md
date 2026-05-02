# Decisions — github-issue-sethshoultes-shipyard-ai-98
**Consolidator**: Phil Jackson — Zen Master, Great Minds Agency
**Date**: 2026-05-02
**Status**: Blueprint for Build Phase
**Mantra**: The strength of the team is each individual member. The strength of each member is the team.

---

## 1. Locked Decisions

### Architecture

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1.1 | **Inline pipeline step** — verification runs as a job step inside the existing deploy pipeline, not as a standalone microservice or post-deploy stage | Elon (R1) | Elon | Accountability. A separate stage accumulates owners, documentation, and eventually a Jira board. Steve conceded fully: "Ship simple. No standalone microservice." |
| 1.2 | **No `wrangler` CLI or HTML-grep dependencies** — do not shell out to `wrangler pages project list` or `grep` HTML bodies for build IDs. Machine-readable inputs only | Elon (R1/R2) | Elon | CLI output formatting changes without semver. Parsing HTML with `grep` is "amateur hour." Steve conceded: "He's right to cut the wrangler dependency, the HTML body grep." |
| 1.3 | **No retry loops in v1** — fail fast and alert. Do not implement exponential backoff, propagation windows, or "dashboards" masquerading as verification | Elon (R2) | Elon | The 404s lasted 6 days because nobody got paged, not because the check lacked patience. Steve agreed: "No retry-loop dashboards." |
| 1.4 | **Check `/` only for v1** — root path is the v1 signal. Deep-route smoke tests (`/pricing`, `/checkout`) are deferred | Elon (R1) | Elon (for v1) | If `/` 404s, the launch is dead. Steve contested ("users don't live at `/`") but conceded for scope: "Deep-route smoke tests are v2." Resolution: ship `/` only. |
| 1.5 | **Origin validation or nothing ships** — validate that the response originates from the expected Cloudflare Pages CNAME/A record, not merely HTTP 200 | Essence / Elon (R1) | Essence | DNS caches the old A record and returns 200 from the wrong server (Vercel). A green check that lies is worse than no check at all. Steve: "Cannot lie." |

### Product & Experience

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 2.1 | **Name: "Proof"** | Steve (R1) | Steve | One word. Five letters. Hard consonant. "Did you Proof it?" Elon called it "marketing theater" but offered no alternative and conceded scope discipline. |
| 2.2 | **One breath, one answer** — success output is a single green signal + domain + timestamp. Failure output is exactly one plain-English sentence. No stack traces. No log vomit. | Steve (R1/R2) | Steve | "The verdict, not the courtroom." Elon conceded the binary constraint ("200 or page. That's it") and agreed the answer must fit in a push notification. |
| 2.3 | **No dashboards. No knobs. No configurable thresholds. No cron syntax.** | Steve (R1) | Both | "This is a moment of truth, not a monitoring platform." Elon agreed absolutely: "No graphs." Saying NO to feature creep disguised as flexibility is the moat. |
| 2.4 | **Primary experience is the terminal screen in v1** — the lock-click feeling happens where the deploy already lives. Notifications are v1.1. | Steve (R1) | Steve (with caveat) | Steve: "The best interface is the one you never see — until something is wrong." Elon: "If the deploy fails, the signal must surface where the team already lives." **Resolution**: v1 is terminal-only. Slack/Discord/PagerDuty fire on failure only in v1.1. |
| 2.5 | **Human voice, not sysadmin prose** — error messages read like a smart friend, not a Jira bot | Steve (R1/R2) | Steve (scoped) | "Your domain isn't pointing here" beats "DEPLOYMENT_NOT_FOUND." Elon's "raw failure" (`GET / → 404`) is the engineering floor; Steve's one-sentence clarity is the ceiling. v1 ships one sentence. No brand bible. |

### Distribution & Scope

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 3.1 | **Default-on in deploy template** — every customer deployment runs this automatically. Zero opt-in. | Elon (R1/R2) | Both | "Opt-in features die in every dataset I've ever seen. Zero friction or it doesn't exist." Steve conceded fully: "Default-on, zero friction." |
| 3.2 | **Cut build-ID body grep / meta-tag injection** — do not pollute every page with verification fodder | Elon (R1/R2) | Both | "Injecting build metadata into every page to feed a verification script is v2 theater." Steve did not defend it. |

---

## 2. MVP Feature Set (What Ships in v1)

### Core Deliverables
1. **GitHub Actions workflow** `.github/workflows/deploy-website.yml` — triggers on `push` to `main` when `website/**` changes
2. **Build step** — `npm ci && npm run build` in `website/` directory, producing `website/out/`
3. **Deploy step** — `wrangler pages deploy website/out/` to Cloudflare Pages project `shipyard-ai` using repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
4. **Proof verification step** — inline post-deploy check, runs automatically (default-on, zero opt-in)

### Verification Behavior
- **Target**: Root path `/` via HTTPS
- **Method**: HTTP GET with origin validation (expected CF Pages IP/CNAME — non-negotiable)
- **Retry**: None in v1. Fail fast.
- **Parallel**: Architecture supports parallel domain checks (single domain now, multi-domain ready)
- **Success output**: `Verified` + domain + timestamp
- **Failure output**: One plain-English sentence explaining exactly what is wrong (e.g., "Your domain isn't pointing here.")
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
│   └── proof.js                    # Verification engine: origin check, output formatting
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
| 4.2 | **Notification integration (Slack)** | Elon (R2): "If the deploy fails, the signal must surface where the team already lives." Steve (R1/R2): "The notification is a whisper; the screen is the sermon. Slack, terminal, push." | v1 is terminal-only. Add optional `SLACK_WEBHOOK_URL` env var in v1.1 that fires on failure only. | Build Lead |
| 4.3 | **Project slug alignment** | QA requirements reference `github-issue-sethshoultes-shipyard-ai-99`. Round directory and this doc are `-98`. | Confirm canonical slug with PM before first commit. If requirements say `-99`, either rename round or document exception. **Do not ship to wrong directory again.** | PM / Build Lead |
| 4.4 | **DNS ownership migration** | Elon (R1): "The real 10x fix is owning the DNS record update inside the same pipeline step that publishes." Steve (R2): "Owning DNS is a six-month migration. Proof can save a customer tonight." | Document as v2 architectural north star. Do not block v1 ship on DNS migration. | Product (Steve) / Build Lead |
| 4.5 | **Expected origin configuration format** | Elon suggested hardcode or `domains.json`. Exact schema undefined in debate. | `domains.json` schema: `[{ "domain": "shipyard.company", "expected_origin": "pages.cloudflare.com" }]`. Start simple. | Build Lead |
| 4.6 | **Proof script runtime** | Shell vs Node vs Python? Elon showed `curl` examples; workflow runs in Ubuntu GitHub runner. | Node.js (`proof.js`) for consistent error formatting and testability. GitHub Actions Ubuntu runner has node by default. | Build Lead |
| 4.7 | **Error message voice calibration** | Steve wants "smart friend" prose. Elon wants `GET / → 404 on example.com`. | One sentence, plain English, no jargon. If it exceeds 140 characters, cut it. | Build Lead |

---

## 5. Risk Register (What Could Go Wrong)

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 5.1 | **False negative from DNS cache** | High | Critical | Origin validation (CNAME/A record check) is non-negotiable. HTTP 200 alone is insufficient. If origin check cannot be implemented, the feature does not ship. | Build Lead / QA (Margaret) |
| 5.2 | **Green on `/`, 404 on sub-routes** | Medium | Medium | Risk accepted for v1 per locked decision 1.4. Document in `domains.json` schema comments that multi-route is planned. | Product (Steve) |
| 5.3 | **Scope creep into monitoring platform** | Medium | Medium | Cultural guardrail: "Proof is the verdict, not the courtroom." Any PR adding dashboards, charts, or knobs must cite an explicit Open Question resolution. | Phil Jackson (Agency) |
| 5.4 | **Empty deliverables / slug mismatch repeat** | Low (already happened once) | Critical | Builder ritual: run `ls deliverables/` before QA call. Verify slug against requirements before first keystroke. Commit incrementally. Empty directory should alarm builder, not inspector. | Build Lead |
| 5.5 | **Alert fatigue from fail-fast noise** | Medium | High | v1 is terminal-only, so noise is contained to the deploy log. When v1.1 adds Slack, implement deduplication and auto-resolution before scaling. | Build Lead |
| 5.6 | **Self-DoS at scale** | Low (now) | High | Keep checks async and rate-limited. Architecture supports parallel domain checks but v1 has single domain. | Build Lead |
| 5.7 | **DNS propagation blamed for false alarms** | Medium | Medium | No retry loops in v1 means the check is honest about current state. If DNS hasn't propagated, the deploy is not "done" and the failure is real. Document this behavior. | Build Lead |
| 5.8 | **Build phase produces requirements mismatch** | Medium | Critical | QA Pass 1 already failed on DEPLOY-001 through DEPLOY-004. The workflow MUST contain `on.push.paths: ['website/**']`, `npm ci`, `npm run build`, `wrangler pages deploy`, and secrets references. | Build Lead / QA (Margaret) |
| 5.9 | **Poetry delays the ship** | Medium | Critical | v1 ships one sentence, not a brand bible. Steve's voice principle is real, but "Did you Proof it?" is v3. v1 must ship in hours, not sprints. | Phil Jackson (Agency) |

---

## 6. Build Phase Mandate

> *"The soul of basketball is not in the highlight reel. It is in the pick-and-roll, done perfectly, ten thousand times."*

We are not shipping a cathedral. We are installing a door latch that clicks at 2 AM and removes the pit from your stomach.

**Non-negotiables for the builder:**
1. Origin validation ships, or nothing ships. (Essence)
2. The deliverables directory must contain files before QA is called. (Retrospective)
3. The slug must match the requirements document exactly. (QA Pass 1)
4. If it cannot be read in 30 seconds, it is too complex. (Steve)
5. When in doubt, cut it. Then cut it again. (Elon)

**Triangle offense of this build:**
- **Elon's corner**: Correctness, speed, default-on, inline architecture, no retry loops, no grep.
- **Steve's corner**: Dignity, one word, plain English, invisible seatbelt, the lock-click feeling.
- **Margaret's corner**: Nothing ships untested. Empty directories are a P0 block. Slug mismatch is a P0 block.

The championship is won in the fundamentals. Build.
