# Review — Shipyard Revenue Deployment

## Verdict

Promising structure. Heavy formatting noise obscures intent. Test scripts lack shared DNA. A quieter presentation would make the architecture feel inevitable, not argued.

---

## spec.md

- **Visual hierarchy: weak.** Every goal (lines 10–17) is bolded. Equal weight = no weight. Let the numbers carry hierarchy; remove `**`.
- **Whitespace: suffocated.** Horizontal rules (`---`) at lines 8, 20, 22, 129, 187, 257, 269 appear every ~25 lines. They fragment reading. Remove all but two: after title and before risks.
- **Architecture table (lines 26–33):** dense, ragged columns. The scope column is the most important but visually identical to layer/technology. Right-align or indent scope so the eye slides to it.
- **SQL block (lines 36–84):** monolithic. No language hint on fence. Add `sql`. Break with inline comments between tables so the schema breathes.
- **"Explicitly Cut from V1" (lines 116–127):** critical signal buried mid-page. Elevate to a blockquote `>` or sub-section under Goals. It should be the first thing a builder reads after goals.
- **Verification tables (lines 131–186):** 50+ rows of equal weight. The most important criteria (build & quality gates at 177–186) arrive last. Group into collapsible sections or numbered lists with only the feature name visible; detail on demand.
- **Success criteria (lines 273–283):** buried at bottom. Move to top, under Goals. A checkbox is a promise; promises belong at the start.
- **File tree (lines 193–242):** useful but visually flat. Indent the tree 4 spaces so it sits inside the section, not beside it.

## todo.md

- **Wave headers (lines 8, 26, 42, 56, 73, 85):** same weight as tasks. Add two blank lines before each wave header. Use `##` not `---` separators; rules create visual clutter where air should be.
- **Task density: crushing.** Lines 10–21 are 12 tasks with no paragraph break. Group by table or area (DB, config, SDK) with a single blank line between.
- **Verify strings (e.g., line 28):** longer than the tasks. Inverted hierarchy. Put verify strings in a second column or italicized below the task, not inline.
- **Post-Ship Deferred (lines 98–109):** more visually prominent than active waves because it sits at the bottom, isolated. Add a horizontal rule above it only, nowhere else.

## Tests

- **Consistency: fractured.** `test-structure.sh`, `test-nextjs.sh`, `test-worker.sh`, `test-migration.sh`, `test-banned-patterns.sh` all define their own `require_file` or `check_banned` helpers. Lines 15–23 in `test-structure.sh`, 15–23 in `test-nextjs.sh`, 20–25 in `test-worker.sh` — identical intent, divergent form.
  - Extract a single `test-lib.sh` with `pass()`, `fail()`, `require_file()`, `require_pattern()`.
  - All scripts would shrink by 30% and speak with one voice.
- **Output rhythm:** `[PASS]` / `[FAIL]` prefixes vary in indentation. `test-banned-patterns.sh` uses two spaces; `test-nextjs.sh` uses two spaces but wraps some lines. Standardize on two spaces, always.
- **test-nextjs.sh:56–66:** landing-page price check is clever but nested `if` blocks create visual stagger. Flatten: early `continue` on missing file, then main logic at one indent level.
- **test-banned-patterns.sh:23–29:** loop over paths repeated inside `check_banned` on every call. Move `paths` array to top level; pass as argument. Cleaner. Quieter.
- **test-migration.sh:33–45:** sqlite3 validation is the craft moment. It deserves a `[PASS]` or `[FAIL]`, not a `[SKIP]` that looks like an afterthought. If sqlite3 is missing, the test should probably fail, not skip.

## What Would Make It Quieter but More Powerful

- **Remove 80% of formatting.** spec.md has ~12 horizontal rules. Cut to 3. Remove bold from goals. Let structure speak.
- **Unify the test voice.** One helper library. One indent. One prefix. Repetition is elegance; duplication is noise.
- **Elevate constraints.** "Explicitly Cut" and "No auth system code" should be the loudest things on the page. They are the design boundaries.
- **Give the schema room.** `001_initial.sql` will be read hundreds of times. Separate each `CREATE TABLE` with a blank line and a `--` comment naming the domain (customers, sites, etc.).
- **One typeface rule for code.** Fence blocks without language hints render as plain text. Every block should have a hint: `sql`, `bash`, `tsx`.
- **Success criteria at the top.** A builder should know the finish line before they read the route.
