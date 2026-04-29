# Decisions — `github-issue-sethshoultes-shipyard-ai-99`
**Zen Master**: Phil Jackson
**Date**: 2026-04-29
**Status**: LOCKED — Blueprint for Build Phase

---

## The Court

| Mind | Role | Stance |
|------|------|--------|
| Elon | Engineering / Velocity | Ship the rocket. Polish the seats after orbit. |
| Steve | Design / Brand | If the user can feel the machinery, we failed. |
| Margaret Hamilton | QA | 0/4 requirements met = BLOCK. No exceptions. |

---

## Locked Decisions

### 1. Delivery Vehicle: GitHub Actions Workflow File
- **Proposed by**: Elon (Round 1)
- **Winner**: Elon — unanimous agreement by Round 2.
- **Why**: The previous cycle delivered only a spec and a failing test. QA blocked the ship because `.github/workflows/deploy-website.yml` was absent. Steve conceded in Round 2: "GitHub Actions as the backbone is correct. Code wins over dashboard clicks *as implementation*." The existing `auto-pipeline.yml` proves the pattern. Replicate it; do not reinvent.
- **What ships**: A version-controlled, diffable YAML file. No dashboard-native connections. No tribal knowledge.

### 2. v1 Scope: No PR Previews
- **Proposed by**: Elon (Round 1)
- **Winner**: Elon.
- **Why**: Steve argued previews are "the soul of the product," but his Round 2 non-negotiables did not include them for v1. TheQA failure proved we cannot ship intention. Previews are a v2 feature. The only gate is a green build on `main`.

### 3. No Pre-Deploy QA Gates Blocking Deploy
- **Proposed by**: Elon (Round 1)
- **Winner**: Elon — Steve conceded in Round 2.
- **Why**: "You cannot argue for speed and then erect barriers." The previous manual process was already broken; adding gates before automation is premature. Gate *after* metrics exist. The build itself is the only required green light.

### 4. No `--commit-dirty=true`
- **Proposed by**: Elon (Round 1)
- **Winner**: Joint lock — Steve agreed in Round 2.
- **Why**: Both minds called it a lie. Build from clean commits only. If local process is broken, fix the process. Lying to the deployment system guarantees pain at scale.

### 5. Performance Target: <90 Seconds End-to-End
- **Proposed by**: Elon (Round 1)
- **Winner**: Elon — Steve agreed speed matters.
- **Why**: Every second in CI is a developer context-switching to Twitter. Steve conceded: "A slow build breaks the spell." Optimize `npm ci` and cache `wrangler` (use `npx wrangler@latest` or cache it; do not install globally on every run).

### 6. Replicate `auto-pipeline.yml` Pattern
- **Proposed by**: Elon (Round 1)
- **Winner**: Joint lock — Steve agreed in Round 2.
- **Why**: Reinvention is not a virtue. The existing workflow is proven. Copy the structure, adapt the paths and project name.

### 7. Product Naming: Shipyard Holds for v1
- **Proposed by**: Elon (Round 2 rebuttal)
- **Winner**: Elon — deferred.
- **Why**: The issue is a technical workflow deliverable, not a rebrand. Steve wants "Vessel" now; Elon correctly identified it as a v2 distraction that touches DNS, docs, repo paths, and mental models for zero user-facing velocity. The name debate is real but it does not unblock the build. **Decision**: Ship the feature. Name it later if metrics justify the churn.

---

## MVP Feature Set (What Ships in v1)

- [ ] `.github/workflows/deploy-website.yml` exists in the repository.
- [ ] Trigger: `push` to `main` branch, filtered to `website/**` path changes.
- [ ] Build step: `npm ci && npm run build` (Next.js).
- [ ] Deploy step: Upload `out/` directory to Cloudflare Pages project `shipyard-ai`.
- [ ] Secrets consumed from repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- [ ] No PR previews.
- [ ] No manual QA gates before deploy.
- [ ] No `--commit-dirty=true`.
- [ ] Caching strategy for Node modules and Wrangler to keep runs under 90 seconds.
- [ ] Automated test passes: the workflow file exists and is valid YAML.

---

## File Structure (What Gets Built)

```
.github/
  workflows/
    deploy-website.yml       ← core deliverable (new)
    auto-pipeline.yml        ← reference pattern (existing, do not modify)
```

No additional directories. No meta-documentation committed as a substitute for the artifact. No `todo.md` with unchecked items in the deliverables folder.

---

## Open Questions (What Still Needs Resolution)

1. **Brand Rename: Shipyard → Vessel**
   - Steve: "The name is the first feature. Own it."
   - Elon: "Paint goes on after the hull floats."
   - **Status**: Defer to post-v1. Does not block this issue.

2. **PR Previews for v2**
   - Steve considers them "the soul of the product."
   - Elon considers them scope creep.
   - **Status**: Revisit after v1 ships and metrics exist.

3. **Observability vs. Invisibility**
   - Steve: "If the user can feel the machinery, we failed."
   - Elon: "Invisibility is a luxury purchased with observability."
   - **Status**: The YAML is the engineering truth. Error message copy and CLI output design are Steve's domain for external-facing tooling, but the workflow itself must be debuggable at 3 AM. Need a lightweight notification or log-link step without breaking the "push and live" feeling.

4. **Verification of Deploy Success**
   - Issue #98 covers verification separately. Do not couple.
   - **Status**: Out of scope for #99. Ensure the workflow completes without error; smoke-test separately.

---

## Risk Register (What Could Go Wrong)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Missing workflow file again** | High (already happened once) | BLOCK — 0/4 requirements fail | Run the test script *before* QA. Do not commit until `test_file_exists.sh` exits 0. |
| **Build time exceeds 90s** | Medium | Breaks the "fast" promise; developer friction | Audit `node_modules` bloat. Cache wrangler. Use `npm ci` with cache. Profile `next build`. |
| **Cloudflare Pages project config mismatch** | Medium | Deploy appears to succeed but serves 404 or wrong site | Confirm project name is exactly `shipyard-ai`. Confirm `out/` is the correct build output directory. |
| **Secrets missing or expired** | Medium | Workflow fails at deploy step with auth error | Verify `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set in repo settings before merge. |
| **Path trigger misconfiguration** | Low | Changes to `website/**` do not trigger deploy | Double-check `paths:` filter in YAML. |
| **No rollback mechanism defined** | Medium | Bad push goes live with no quick revert | Document `git revert` + re-push as immediate rollback. Consider Cloudflare Pages built-in rollback for v2. |
| **Naming debate derails next sprint** | Medium | Energy diverted from feature work to rebranding | Lock the deferral. Schedule a separate branding session post-ship. |
| **Committing unchecked todo lists** | High (already happened) | QA treats it as incomplete work | Do not commit `todo.md` with `[ ]` items. Either finish the work or delete the file before commit. |

---

## Final Word from the Zen Master

> "The strength of the team is each individual member. The strength of each member is the team."

Elon brings the engine. Steve brings the soul. Margaret brings the truth. This blueprint honors all three: we ship a clean, fast, invisible deploy — but we ship it *as code*, not as poetry about code. The build must pass. The test must go green. The file must exist. Everything else is a conversation for after the buzzer sounds.

**Push. Live. Nothing else.**
