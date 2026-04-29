# PRD: QA gate: static export + Edge API route ships broken without warning

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#97
> https://github.com/sethshoultes/shipyard-ai/issues/97

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #97
- **Author:** sethshoultes
- **Labels:** bug, p1
- **Created:** 2026-04-28T03:22:19Z

## Problem
## What happened

On 2026-04-27, I added an Edge runtime API route at `website/src/app/api/intake/route.ts` to handle paid-customer intake submissions. The project's `website/next.config.ts` has `output: "export"` (static-only). Static export does not support server routes — but `next build` produced a 20/20 successful build with no error or warning about the unrunnable route.

Build output:
```
├ ƒ /api/intake
```

The `ƒ` flag silently labels it Dynamic, but produces no functioning artifact in `out/`. Site shipped to CF Pages with a phantom API route. Anyone POSTing to `/api/intake` would get 404. I caught it manually only because the smoke test failed — Margaret didn't.

## Why this is a Margaret-class bug

Margaret's QA gate is supposed to fail builds with this kind of correctness gap: a route is declared in source but cannot serve traffic in the deployment target. *"It compiled"* is not a sufficient pass condition. A paying customer's launch could ship the same way — broken endpoint, no warning, deploy passes, customer reports the bug 12 hours later.

## Repro

1. Add a route at `src/app/api/anything/route.ts` with `export const runtime = "edge"`
2. Keep `output: "export"` in `next.config.ts`
3. Run `next build`
4. Observe success with no warning about the unservable route

## Expected behavior

Build verification step should detect Edge/Server runtime routes when `output: "export"` is set, and either:
- Fail the build with a clear message: *"/api/intake declared as Edge runtime but project is static export — move to functions/ or remove output: export"*
- OR auto-route it into a CF Pages Function pattern under `functions/api/`

## Suggested fix

Add a pre-deploy QA check that:
- Greps `src/app/**/route.ts` for `runtime = "edge"` or `runtime = "nodejs"`
- Cross-references against `next.config.ts` for `output: "export"`
- Fails the deploy if both are present without an accompanying CF Pages Function in `functions/`

Owner: Margaret Hamilton (QA).

---

Discovered while wiring shipyard.company's intake form. Hand-fixed in commit 44e4b0e by moving the route to `functions/api/intake.ts` (CF Pages Function). Filing this so Margaret picks it up as a real pipeline gap rather than the operator continuing to pinch-hit.

## Success Criteria
- Issue sethshoultes/shipyard-ai#97 requirements are met
- All tests pass
