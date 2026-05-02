# Decisions — github-issue-sethshoultes-shipyard-ai-98
**Consolidator**: Phil Jackson — Zen Master, Great Minds Agency
**Date**: 2026-04-28
**Status**: Blueprint for Build Phase
**Mantra**: The strength of the team is each individual member. The strength of each member is the team.

---

## 1. Locked Decisions

### Architecture

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1.1 | **Inline pipeline check** — verification runs as a step inside the existing deploy pipeline, not as a separate microservice or "post-deploy stage" | Elon | Elon | Accountability. You can read it in five seconds and replace it when the platform changes. A separate verification stage accumulates owners, documentation, and eventually a Jira board. Steve conceded. |
| 1.2 | **Origin-validated health check** — validate the response CNAME/A record against the expected Cloudflare Pages origin, not merely HTTP 200 | Elon | Elon | DNS caches the old A record and returns 200 from the old server (Vercel). A beautiful green "Verified" that lies is worse than no check at all. Steve conceded fully: "Speed and correctness are prerequisites for simplicity." |
| 1.3 | **Parallelize checks + exponential backoff retry (60s max)** | Elon | Elon | The bottleneck is DNS propagation and edge-cache poisoning, not CPU. Serial curls timeout the pipeline at 100 domains. Steve conceded. |
| 1.4 | **Cut `wrangler pages project list` dependency** | Elon | Both | Hardcode the domain or read from `domains.json`. Adding a runtime Cloudflare API call to discover what you already know is fragile, slow, and breaks at rate limits. Steve agreed. |
| 1.5 | **No human owner gate** | Elon | Both | Automation owns verification. If a human is the gate, you will have 6-day outages. Steve agreed on full automation; he was defending *voice*, not *ownership*. |

### Product & Experience

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 2.1 | **Name: "Proof"** | Steve | Steve | One word. Five letters. Hard consonant. Names create expectations, expectations create behavior, behavior creates trust. Elon called it theater but offered no alternative and conceded scope discipline. |
| 2.2 | **One word, one screen, one truth** | Steve | Steve | Success output is "Verified" + domain + timestamp. Failure output is a single plain-English sentence (e.g., "Your DNS points to the wrong place."). No stack traces. No log vomit. The verdict, not the courtroom. Elon conceded: plain English error messages are better than "an error was encountered." |
| 2.3 | **No dashboards. No knobs. No configurable thresholds. No cron syntax.** | Steve | Both | This is a moment of truth, not a monitoring platform. Both agree on absolute scope discipline. Saying NO to feature creep disguised as flexibility is the moat. |
| 2.4 | **Primary experience is the screen, not a notification channel** | Steve | Steve (with caveat) | The first 30 seconds after deploy should feel like closing a door and hearing the lock click. Slack/Discord/PagerDuty integrations are whispers; the screen is the sermon. However, Elon's point stands: if the deploy fails, the signal must surface where the team already lives. **Resolution**: v1 is terminal-only. Notifications are v1.1. |

### Distribution & Scope

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 3.1 | **Default-on in deploy template** | Elon | Both | Every customer deployment runs this automatically. Opt-in is the same as off. Steve conceded fully. |
| 3.2 | **Cut build-ID body grep** | Elon | Both | Injecting build metadata into every page to feed a verification script is v2 theater. Status 200 + origin validation is the v1 signal. Steve did not defend it. |
| 3.3 | **Cut "key routes" verification for v1** | Elon | Elon (for v1) | If `/` 404s, the launch is dead. Check `/`. Done. Steve argues users don't live at `/` and `/pricing` could still 404 while `/` is fresh. **Resolution**: Ship `/` only in v1. Multi-route is an open v1.1 candidate (see Open Questions). |

---

## 2. MVP Feature Set (What Ships in v1)

### Core Deliverables
1. **GitHub Actions workflow** `.github/workflows/deploy-website.yml` — triggers on `push` to `main` when `website/**` changes
2. **Build step** — `npm ci && npm run build` in `website/` directory, producing `website/out/`
3. **Deploy step** — `wrangler pages deploy website/out/` to Cloudflare Pages project `shipyard-ai` using repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
4. **Proof verification step** — inline post-deploy check, runs automatically (default-on, zero opt-in)

### Verification Behavior
- **Target**: Root path `/` via HTTPS
- **Method**: HTTP GET with origin validation (expected CF Pages IP/CNAME)
- **Retry**: Exponential backoff up to 60 seconds to account for DNS propagation
- **Parallel**: Architecture supports parallel domain checks (single domain now, multi-domain ready)
- **Success output**: `Verified` + domain + timestamp
- **Failure output**: One plain-English sentence explaining exactly what is wrong
- **No output**: Stack traces, log dumps, charts, dashboards, or configurable knobs

### Explicitly NOT in v1
- Slack/Discord/PagerDuty integrations
- Multi-route verification (`/pricing`, `/checkout`, etc.)
- Build-ID body grep or HTML meta-tag verification
- `wrangler pages project list` runtime API calls
- Human approval gate
- Configurable retry policies or alert thresholds
- Cron syntax or scheduled checks

---

## 3. File Structure (What Gets Built)

```
github-issue-sethshoultes-shipyard-ai-98/
├── .github/
│   └── workflows/
│       └── deploy-website.yml      # Build + deploy + Proof (verification step)
├── scripts/
│   └── proof.js                    # Verification engine: origin check, retry, output formatting
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
| 4.1 | **Multi-route verification** | Steve: "A green light on `/` while your checkout page 404s is a costume." Elon: "If `/` 404s, the launch is dead." | Ship `/` only in v1. Add key-routes array to `domains.json` schema as v1.1 if post-launch telemetry proves need. | Build Lead |
| 4.2 | **Notification integration (Slack)** | Elon: "If the deploy fails, the signal must surface where the team already lives." Steve: "The notification is a whisper; the screen is the sermon." | v1 is terminal-only. Add optional `SLACK_WEBHOOK_URL` env var in v1.1 that fires on failure only. | Build Lead |
| 4.3 | **Project slug alignment** | QA requirements reference `github-issue-sethshoultes-shipyard-ai-99`. Round directory and this doc are `-98`. | Confirm canonical slug with PM before first commit. If requirements say `-99`, either rename round or document exception. **Do not ship to wrong directory again.** | PM / Build Lead |
| 4.4 | **Expected origin configuration format** | Elon suggested hardcode or `domains.json`. Exact schema undefined in debate. | `domains.json` schema: `[{ "domain": "shipyard.company", "expected_origin": "pages.cloudflare.com" }]`. Start simple. | Build Lead |
| 4.5 | **Proof script runtime** | Shell vs Node vs Python? Elon showed `curl` examples; workflow runs in Ubuntu GitHub runner. | Node.js (`proof.js`) for consistent error formatting and testability. GitHub Actions Ubuntu runner has node by default. | Build Lead |

---

## 5. Risk Register (What Could Go Wrong)

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 5.1 | **False negative from DNS cache** | High | Critical | Origin validation (CNAME/A record check) is non-negotiable. HTTP 200 alone is insufficient. | Build Lead |
| 5.2 | **Pipeline timeout at scale** | Medium | High | Parallelize domain checks. 60s max retry window with exponential backoff. | Build Lead |
| 5.3 | **Scope creep into monitoring platform** | Medium | Medium | Cultural guardrail: "Proof is the verdict, not the courtroom." Any PR adding dashboards, charts, or knobs must cite an explicit Open Question resolution. | Phil Jackson (Agency) |
| 5.4 | **Empty deliverables / slug mismatch repeat** | Low (already happened once) | Critical | Builder ritual: run `ls deliverables/` before QA call. Verify slug against requirements before first keystroke. Commit incrementally. | Build Lead |
| 5.5 | **Green on `/`, 404 on sub-routes** | Medium | Medium | Risk accepted for v1 per locked decision 3.3. Document in `domains.json` schema comments that multi-route is planned. | Product (Steve) |
| 5.6 | **Wrangler API rate limits / fragility** | Low | Medium | Cut wrangler dependency entirely. Use `domains.json` + environment variables. | Build Lead |
| 5.7 | **"Verified" output lies to the user** | Low | Critical | Origin validation beats status code. This is the core non-negotiable. If origin check cannot be implemented, the feature does not ship. | Build Lead / QA (Margaret) |
| 5.8 | **Build phase produces requirements mismatch** | Medium | Critical | QA Pass 1 already failed on DEPLOY-001 through DEPLOY-004. The workflow MUST contain `on.push.paths: ['website/**']`, `npm ci`, `npm run build`, `wrangler pages deploy`, and secrets references. | Build Lead / QA (Margaret) |

---

## 6. Build Phase Mandate

> *"The soul of basketball is not in the highlight reel. It is in the pick-and-roll, done perfectly, ten thousand times."*

We are not shipping a cathedral. We are installing a door latch that clicks at 2 AM and removes the pit from your stomach.

**Non-negotiables for the builder:**
1. Origin validation ships, or nothing ships.
2. The deliverables directory must contain files before QA is called.
3. The slug must match the requirements document exactly.
4. If it cannot be read in 30 seconds, it is too complex.
5. When in doubt, cut it. Then cut it again.

**Triangle offense of this build:**
- **Elon's corner**: Correctness, speed, default-on, inline architecture.
- **Steve's corner**: Dignity, one word, plain English, invisible seatbelt.
- **Margaret's corner**: Nothing ships untested. Empty directories are a P0 block.

The championship is won in the fundamentals. Build.
