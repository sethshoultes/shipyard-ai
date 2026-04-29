# Decisions — GitHub Issue #97 QA Gate

*Consolidated by the Zen Master. What follows is the truth, not poetry.*

---

## Locked Decisions

### 1. No Auto-Fix
- **Proposed by:** Elon (Round 1)
- **Winner:** Consensus
- **Why:** Magic that moves code breeds ignorance. If the developer does not understand why static export kills an Edge route, they do not deserve to ship. TRUE stops them. They learn. Then they ship. Both minds agreed this is non-negotiable.

### 2. Binary Output Only — No Warnings
- **Proposed by:** Steve (Round 1, "What We Say NO To")
- **Winner:** Steve (codified in `essence.md`)
- **Why:** Yellow is fear. Steve's emotional framing — "Yellow is where fear lives, the coward's color for 'maybe someone will notice'" — carried. The contract is binary: `Ready.` or one sentence explaining death. No info levels, no "we detected an issue."

### 3. Zero Config
- **Proposed by:** Steve (Round 1), affirmed by Elon (Round 1)
- **Winner:** Consensus
- **Why:** Both agree the tool reads `next.config.ts` and the filesystem. If a `.truerc` is required, the tool has failed. Elon phrased it as "reads two files, run two regexes"; Steve phrased it as product philosophy. Same result.

### 4. CI Gate First, Not a Product
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Steve conceded in Round 2: "Ship the CI gate first. Dashboards are v2 fantasy." The primary customer is this repo's deploy pipeline. Close #97. Move on. 10k npm users is irrelevant if the pipeline here is unprotected.

### 5. Zero Dependencies
- **Proposed by:** Elon (Round 1, Round 2)
- **Winner:** Elon
- **Why:** Steve conceded. Boring code survives turnover. No dependencies to rot. The gate must be deletable without a migration guide.

### 6. No Dashboard / No Telemetry
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** "If you build a web UI for this, you have already failed." Steve agreed dashboards are v2 fantasy. There will be no metrics, no badges, no web UI.

### 7. No Auto-Routing to CF Pages Functions
- **Proposed by:** Elon (Round 1, "What to Cut — Hard")
- **Winner:** Elon
- **Why:** Requires path mapping, import rewriting, and opinions the team does not yet hold. Elon called it v2 fantasy; Steve agreed in Round 2. If a phantom route is detected, the tool tells the human where to move the file. The human moves it.

### 8. Error Message Style — One Crisp Sentence
- **Proposed by:** Steve (Round 1, brand voice)
- **Winner:** Steve (with Elon's concession in Round 2)
- **Why:** Elon — the advocate for boredom — explicitly stole Steve's line: "Your Edge route cannot fly in static export. Move it or lose it." The voice is direct, uncompromising, respectful of intelligence, allergic to excuses. No stack traces. No committees.

### 9. Pass Output = `Ready.`
- **Proposed by:** Steve (Round 1), codified in `essence.md`
- **Winner:** Steve
- **Why:** Essence adopted it. Not silence. One word certifies the parachute was packed by Margaret herself. You do not hope. You know.

---

## MVP Feature Set (What Ships in v1)

1. **Pre-build gate script** that runs before `next build` in CI.
2. **Reads `next.config.ts`** to detect `output: 'export'`.
3. **Scans the filesystem** for API route files (`route.ts` / `route.js`) that declare Edge runtime.
4. **Binary output:**
   - Pass → exit `0`, print `Ready.`
   - Fail → exit `1`, print one crisp sentence identifying the phantom route.
5. **Zero configuration** required by the user.
6. **Zero runtime dependencies**.
7. **No side effects** — does not rewrite, move, or auto-fix code.
8. **Packaged as a `package.json` script** (`build:check`) that can be invoked locally and in CI.

---

## File Structure (What Gets Built)

```
scripts/
  verify-routes.ts       # The gate implementation. Internal-only script.
package.json             # Adds "build:check": "tsx scripts/verify-routes.ts"
```

**Notes:**
- If the project uses TypeScript for scripts, `tsx` or equivalent may be used to run the script, but this is a dev-dependency, not a runtime dependency of the gate itself.
- No separate npm package in v1. The script lives in-repo.
- No CI workflow file is explicitly required by this decision doc; the consuming repo wires `npm run build:check` into its existing pipeline before `next build`.

---

## Open Questions (What Still Needs Resolution)

### Q1: Regex vs. AST — The Architectural Fork
- **Elon's position:** Two literal regex patterns, 5 ms, zero dependencies. "Regex scales linearly." This is a lint, not a compiler.
- **Steve's position:** Parse structure, not text. Regex matches comments, misses dynamic re-exports, breaks on odd formatting. "A gate that cries wolf gets unplugged. A gate that misses a phantom route is a toy."
- **Status:** **UNRESOLVED.** This is the single decision blocking the build phase. Recommend: start with regex for v1 to ship today, with a hard acceptance test suite that must pass before merge. If the regex misses a known phantom route in testing, upgrade to lightweight AST parsing (e.g., `acorn` or `@babel/parser`) in a fast-follow PR.

### Q2: Name — TRUE vs. Descriptive
- **Steve's position:** `TRUE`. One word. Four letters. The truth your build refuses to tell you.
- **Elon's position:** Unsearchable on npm, ungreppable in logs, probably trademarked by a 1990s boy band. `margaret-check` is dull but discoverable.
- **Status:** **UNRESOLVED, LOW URGENCY.** Since v1 is an internal CI gate (not an external npm package), the name does not block build. Defer until externalization. Use a boring internal filename (`verify-routes.ts`) for now.

### Q3: Scope of Route Detection
- The debate centers on API routes (`route.ts`) with `runtime = 'edge'`. What about:
  - `page.tsx` files with Edge runtime in static export?
  - `middleware.ts`?
  - Re-exports or dynamic `export const runtime` declarations?
- **Status:** **IMPLIED, NOT EXPLICITLY LOCKED.** The MVP targets the specific Margaret-class bug: Edge runtime inside `route.ts` files when `output: 'export'` is set. Expand scope only after the core case is bulletproof.

### Q4: Monorepo / Large Repo Performance
- **Elon's position:** Add an `ignore` list if 10k files slow the scan to 200 ms.
- **Steve's position:** Did not address.
- **Status:** **OPEN, V1 DEFER.** If scan time exceeds 100 ms in the target repo, add an exclusion list. Do not build it until it hurts.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Regex false positive** (flags a comment or string matching `runtime = 'edge'`) | Medium | High (gate cries wolf, team bypasses it) | Acceptance test suite with 20+ fixture files before merge. If any false positive surfaces, escalate to AST fork immediately. |
| **Regex false negative** (misses a phantom route due to formatting, dynamic export, or re-export) | Medium | High (gate gives false confidence) | Same as above. Build a fixture library of edge-case syntax. Test-driven gate. |
| **Next.js version drift** (`next.config.ts` schema or route conventions change) | Medium | High (gate silently breaks) | Pin supported Next.js versions in a comment. Add a smoke test that verifies the gate still catches a known-bad fixture on every dependency update. |
| **Scope creep to product** (team tempted to add dashboard, telemetry, auto-fix) | Medium | Medium | This doc is the wall. Any PR adding config files, web UI, or auto-fix must cite explicit stakeholder override of locked decisions. |
| **Name unsearchability / trademark** (if externalized as `TRUE`) | Low (v1 is internal) | Low | Defer. If externalized, run npm search and trademark scan before publish. |
| **Gate performance degradation in large repos** | Low | Low | Measure scan time in CI. Add ignore-list only if observed scan > 500 ms. |
| **The gate itself has a bug** and passes when it should fail | Medium | **CATASTROPHIC** | The gate is the last line of defense. It must have its own test suite. A Margaret-class bug inside Margaret is irony we cannot afford. |

---

## The One Thing

> The failure message: one crisp sentence, zero ambiguity, zero noise.

Everything else is implementation. Build the gate. Test the gate. Trust the gate.
