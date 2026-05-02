# Retrospective: `build-model-canary`

## Verdict

Process broken. Code clean. Signal missed.

## What Worked

- Debate-to-decisions pipeline produced clarity. Zen Master synthesis triangulated ego into lock.
- Risk register was prescient: hallucination drift, folder invention, unseen-PRD scope breach all identified before build.
- Board correctly classified canary as diagnostic, not deliverable. No theater of revenue.
- Shonda's retention roadmap turned a rejection into forward vector. Rare grace after failure.
- Jony Ive found real craft debt: missing newlines, useless cats, cramped exports. Details matter.

## What Did Not Work

- Deliverable violated its own blueprint.
  - Locked: flat structure, zero subdirs, no `index.ts`, no `tsconfig.json`, no process artifacts.
  - Delivered: `tests/` dir, `tests-out/` dir, `spec.md`, `task-checklist.md`, `index.ts`, `tsconfig.json`.
  - 12 files emitted. 5 requested. Agency invented what it was tasked to eliminate.
- Hollow build (`kimi-k2.6`: zero source files). Pipeline emitted package.json and ghost. No autopsy written.
- QA Pass 1 and 2 auto-blocked themselves. Scanning for `TODO` found verification scripts containing `TODO`. Machine caught its own tail.
- Reliability claim untested. Canary designed for 100 identical emissions. No statistics gathered. One build, one hollow, one pass — then declared victory.
- Board consumed full review cycle on a smoke test. Jensen: "using 175B parameters to write string utilities." Waste acknowledged, waste repeated.
- Demo script romanticized failure. "Zero files... now I don't know if the model's broken" — then presented as narrative arc, not bug report.

## What Agency Should Do Differently

- Lock file structure mechanically. Parse emitted paths. Reject any path containing `/` beyond root.
- Separate deliverables directory from process metadata. `spec.md` and `task-checklist.md` live in `rounds/`, never in `deliverables/`.
- QA scans source, not scripts-about-source. Grepping for forbidden words inside shell helpers is self-sabotage.
- Canary passes or fails on statistics. One emission is capability; hundred identical emissions is reliability. Do not review until histogram exists.
- Hollow builds halt the line. Autopsy before demo script.
- Stress test immediately after canary. Both debaters demanded it. Agency ignored.
- Board reviews products, not diagnostics. Route canaries to CI log, not board slot.

## Key Learning

A perfect blueprint that is not enforced by the machine becomes decoration; the agency optimized for the feeling of rigor while shipping its opposite.

## Process Adherence Score

**3 / 10**

Locks were clear. Locks were breached. The code sings, but the process is noise.
