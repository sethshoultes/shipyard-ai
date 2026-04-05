# PRD-002: Shipwright — Locked Decisions

**Date**: 2026-04-05
**Consolidated by**: Phil Jackson (Orchestrator)
**Source**: Round 1 + Round 2 debate transcripts (Steve Jobs, Elon Musk)

---

## Naming & Brand

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| Product name | **Shipwright** | Both (Steve proposed, Elon accepted) |
| Brand promise | **"Describe it. It's live."** | Both |

---

## Architecture

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| Pipeline engine | Single GitHub Actions workflow, one job, sequential steps | Both (Elon proposed, Steve adopted R2) |
| No external orchestrator | No separate Cloudflare Worker, queue, or middleware service | Both |
| Steps must be independently retriable | Job-level `if` conditions + artifact caching | Elon |
| Deploy target | Cloudflare Workers + D1 + R2 | Both |

---

## v1 Scope (3 pipeline steps)

| Step | What it does |
|------|-------------|
| 1. Parse PRD | Workers AI extracts structured data from GitHub issue body |
| 2. Generate seed + deploy | Build seed.json from parsed data, deploy to Cloudflare preview |
| 3. Comment URL on issue | Formatted comment with site name, screenshot thumbnail, preview URL, summary |

### Explicitly cut from v1
- Content moderation (v2 — required when production promotion is added)
- Form-based intake UI (v2 — with build narration feed)
- Real-time build narration / WebSocket streaming (v2)
- Full-screen reveal experience (v2 — ships with form UI)
- Conversational refinement / "Refine" button (v3 — separate product)
- Rate-limiting code (use GitHub Actions `concurrency` key for v1)

---

## Trigger UX

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| v1 trigger | GitHub issue with `prd-intake` label | Both |
| Parser schema | Designed for structured input (3 fields: what, who, tone) from day one | Steve proposed, Elon's architecture already supports it |
| Abstraction principle | The parser is the API. Any intake surface (form, Slack bot, CLI) is a client. | Both (converged R2) |

---

## Preview URLs

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| Custom domain | `preview.shipwright.site/{slug}` | Both (Steve proposed, Elon confirmed trivial — DNS + route config) |
| Slug source | Slugified business name from PRD | Elon |
| No worker hashes in URLs | Non-negotiable | Steve, Elon agreed |

---

## Design Quality Bar

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| Typography | 8 curated type pairings (lookup table, not AI-generated) | Both |
| Color | 5 tone-to-palette mappings, WCAG AA contrast mandatory | Both |
| Spacing | Strict 4px/8px grid, consistent vertical rhythm | Steve |
| Imagery | Unsplash API + typographic fallback. Never show gray boxes. No AI-generated images in v1. | Elon proposed, Steve's fallback strategy adopted |
| Mobile | Mobile-first. Must look intentional on phone, not "technically works." | Both |
| Quality gate | "Would I charge money for this?" — if no, it does not ship | Steve |
| Design system location | Baked into seed generator as lookup tables | Elon |

---

## Logging & Experience Polish

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| Human-readable logs | Step output in plain language, not machine format. Stream-ready for v2 feed. | Steve proposed R2, costs ~zero |
| Enhanced issue comment | Formatted with site name, screenshot, prominent URL, summary. Not a raw URL dump. | Elon proposed R2 |

---

## Failure Modes

| Decision | Detail |
|----------|--------|
| Principle | Every failure comments on the issue. Silent failures are unacceptable. |
| Malformed PRD | Comment with missing fields + link to template. Label `prd-parse-failed`. |
| AI timeout | Retry once. If retry fails, comment with "will retry in 10 min." |
| Deploy failure | Comment with wrangler error. Label `deploy-failed`. |
| Malicious input | HTML-escape all text in seed.json. Basic sanitization in v1. |
| GitHub API failure | Log to workflow output (can't comment if API is down). |
| State tracking | Labels on issues: `deploying`, `deployed`, `deploy-failed`, `prd-parse-failed` |

---

## Distribution

| Decision | Detail | Agreed by |
|----------|--------|-----------|
| Strategy | Open-source reusable GitHub Actions workflow | Elon proposed, Steve adopted R2 |
| Format | `.yml` file anyone can fork. `uses: shipyard-ai/auto-pipeline/.github/workflows/deploy.yml@main` | Elon |
| Not a GitHub App | No OAuth, no backend, no marketplace listing | Both |
| Growth loop | Fork → deploy → contribute templates → parser improves → EmDash deploys itself | Elon |

---

## Token Budget (500K)

| Phase | % | Tokens |
|-------|---|--------|
| Debate + Plan | 10% | 50K |
| Build: Workflow YAML | 15% | 75K |
| Build: PRD Parser | 20% | 100K |
| Build: Seed Generator + Deploy (incl. design system) | 25% | 125K |
| Build: Issue Commenter + Labels | 5% | 25K |
| Review + QA | 20% | 100K |
| Reserve | 5% | 25K |

Build total: 65%. Reserve reduced from 10% to 5% to fund design system quality in seed generator.

---

## Performance Target

| Metric | Target |
|--------|--------|
| End-to-end | 120 seconds (90s achievable) |
| Bottleneck | Cloudflare deploy (wrangler publish + D1 seed + R2 assets): ~30-45s |
| Optimization | Do not optimize prematurely. 90s PRD-to-live-site is already unprecedented. |

---

## Unresolved → Resolved

Steve's two open items from R2 were both resolved in Elon's R2 response:

1. **Custom domain for preview URLs** — Elon confirmed trivial (DNS + route config). Included in v1.
2. **Structured parser schema** — Elon's architecture already supports any intake surface via GitHub API. Schema designed for 3 structured fields while handling free-form text gracefully.

**All decisions are locked. Debate phase complete. Ready for PLAN.**

---

*Consolidated by Phil Jackson, Orchestrator*
*Shipyard AI*
