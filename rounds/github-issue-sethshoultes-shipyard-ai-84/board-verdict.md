# Board Verdict — Poster Child (Issue #84)

## Points of Agreement

- **Deliverable is incomplete.** Both reviewers score the issue 2/10 and agree the code is scaffolding, not a product. Jensen notes the repo contains only `types.d.ts`, missing source files, and committed `node_modules`. Shonda calls it a "skeleton without a heartbeat."
- **AI tagline generation must be restored.** Cutting Claude-generated taglines removed the primary differentiator and emotional hook. Both reviewers identify this as a critical error.
- **Zero retention / no reason to return.** The current design produces a one-time PNG with no user accounts, history, gallery, or ongoing value.
- **No moat or compounding advantage.** Stateless image pipe on public data with an R2 TTL cache. Anyone can replicate it in an afternoon.
- **Missing viral/distribution mechanics.** No watermark, no social sharing, no GitHub Actions integration, no embeddable widget. The output cannot drive a content flywheel.
- **Telemetry and analytics are absent.** The spec explicitly banned database, auth, and analytics. Both reviewers agree this prevents building a data asset or understanding user behavior.

## Points of Tension

- **Technical depth vs. product storytelling.** Jensen evaluates through an infrastructure lens (edge GPU inference, TensorRT/Triton, fine-tuned diffusion models, real-time generative layout). Shonda evaluates through a narrative/UX lens (story arc, emotional cliffhangers, recurring characters, season two). The tension is not disagreement, but priority: hard-tech moat first vs. retention hooks first.
- **Platform thesis divergence.** Jensen wants a long-term platform path (API/webhooks, template marketplace, Figma exports, diffusion model training). Shonda wants immediate emotional and social loops (watermarks, trending feeds, weekly digests). Both are valid but imply different sequencing and resource allocation.

## Overall Verdict

**HOLD** — Reject the current deliverable. Do not ship. The issue is paused until the conditions below are met.

## Conditions for Proceeding

1. **Complete the build.** Deliver all missing source files (`index.ts`, `github.ts`, `template.ts`, `renderer.ts`, `cache.ts`, `scripts/warm-cache.ts`), a working Worker, passing tests, and a `README.md`. Remove committed `node_modules`.
2. **Restore AI magic.** Re-enable Claude tagline generation. This is the stated differentiator and the "how did it know?" moment.
3. **Add retention architecture.** Implement user gallery/history, "your posters" dashboard, and per-poster view stats. The product must have a reason for a second visit.
4. **Inject viral mechanics.** Watermark every output with a "Made with Poster" branded footer and backlink. Add social sharing buttons and an embeddable README widget.
5. **Build the data asset.** Add telemetry, sharing analytics, and sharing notifications. Track what posters get shared and clicked.
6. **Integrate distribution.** Ship a GitHub Action that auto-generates or refreshes posters in CI/CD.
7. **Platform foundation.** Expose an API with webhooks. Add a second template and a discovery loop (trending repos, weekly digest).
8. **Re-review gate.** Bring the updated deliverable back to the board with a working demo and test suite before merging to main.
