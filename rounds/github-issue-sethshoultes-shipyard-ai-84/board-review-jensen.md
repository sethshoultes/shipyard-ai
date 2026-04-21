# Board Review — Poster Child (Issue #84)
**Reviewer:** Jensen Huang
**Verdict:** Ship nothing. This is not a product.

---

## State of Deliverable

- `src/` contains one file: `types.d.ts`
- Zero source files: no `index.ts`, no `github.ts`, no `template.ts`, no `renderer.ts`, no `cache.ts`
- No `scripts/warm-cache.ts`
- No `README.md`
- Tests assert files that do not exist. Will all fail.
- `node_modules` committed to repo. 1,500+ files of dead weight.

Build is scaffolding, not execution.

---

## Moat

None.

- Stateless image generator with no data gravity
- No user accounts, no history, no network effects
- Cache is R2 TTL; anyone can replicate in one afternoon
- Open-source repos are public data; no proprietary dataset

What compounds: nothing. What erodes: everything.

---

## AI Leverage

Zero. Deliberately cut.

- Spec removes Claude tagline generation — "cut for speed + cost"
- PRD promised AI-generated taglines. Deliverable bans them.
- Without AI, this is SVG string interpolation + `resvg-wasm`. Commodity infra.
- No 10x outcome anywhere. Not even 1.1x.

---

## Unfair Advantage Not Built

- **No inference at the edge.** NVIDIA Triton / TensorRT on Cloudflare GPU Workers. Missing.
- **No model fine-tuned on code aesthetics.** Could own "design language for software."
- **No real-time generative layout.** Single static SVG template. Boring.
- **No viral data flywheel.** Every poster URL could train next-gen layout model. Not collected.

---

## Platform Path

Product today: dumb image pipe.

Platform tomorrow requires:
- API + webhooks for CI/CD (GitHub Actions, Vercel, etc.)
- Custom template marketplace
- Generated design system exports (Figma, Sketch, CSS)
- Analytics on what posters get shared / clicked
- Fine-tuned diffusion model trained on best-performing cards

Current architecture: `GET /:owner/:repo` → fetch → SVG → PNG. Dead end.

---

## Score

**2 / 10 — Spec is coherent. Execution is air. AI explicitly removed. No moat. No platform thesis. Not shippable.**

---

## Directives

1. Complete source files or kill the issue.
2. Re-enable AI tagline generation. Differentiator lives there.
3. Add telemetry / sharing analytics. Build data asset.
4. Do not commit `node_modules`.
5. Deliver working Worker + passing tests before next review.
