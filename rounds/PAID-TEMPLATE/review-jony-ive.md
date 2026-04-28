# Jony Ive — Review of PAID-TEMPLATE Deliverables

Verdict: Functional but noisy. Deliberation without restraint. Documents the process; doesn't honor the reader.

## spec.md

- **Line 1–16**: Goals block is a wall of bold. Every goal screams equally. Nothing signals "start here."
- **Line 19**: Horizontal rule adds clutter, not separation. Remove all `---`.
- **Line 23–56**: Wave headers buried inside body text. Promote to H3 so the rhythm of the page becomes scannable.
- **Line 60–79**: Verification table is 15 rows of identical weight. The hard limits (≤20 lines, ≤50 lines, zero commercial fields) drown in noise.
  - Collapse into 5 grouped headings. Move `grep` proof commands to tests, not the spec.
- **Line 82–95**: Directory tree redundant with files table below. Pick one. The table at line 97 is more useful; give it room.
- **Line 97–118**: 18-row table is exhausting. Convert to grouped lists by wave, with a blank line between groups. File path in code span, purpose in plain text.
- **Line 120–124**: "Modified files" table cell contains a manifesto. A table should not hold paragraphs. Extract to a callout.
- **Line 128–136**: Banned patterns block repeats what verification table already says. Eliminate.
- **Line 139–150**: Success criteria duplicates todo.md entirely. One source of truth. Delete.

## todo.md

- **Line 3–60**: 57 identical checkboxes. No landmarks. Reader cannot gauge progress at a glance.
  - Add a single "Definition of Done" stanza at top.
  - Strip all inline `verify:` commands. They are implementation noise in an intent document.
- **Wave headers** (lines 3, 15, 25, 34, 42, 49): Use H2, not bold. The rhythm of the document depends on hierarchy.

## tests/

- **test-structure.sh line 1**, **test-prd-compliance.sh line 1**, **test-banned-patterns.sh line 1**: Three different comment styles. Standardize to `#!/usr/bin/env bash` + one-line purpose. No more.
- **test-structure.sh lines 44–60**: `for` loops with echo PASS/FAIL are verbose. A single `find` or `test` failure should speak once.
- **test-banned-patterns.sh lines 36–58**: Nested `for` loops print per-pattern failure. Aggregate errors. One summary line at end.

## What would make it quieter but more powerful

1. Merge spec and todo into one document: "Contract" and "Checklist." The separation is artificial; the repetition is deafening.
2. Reduce total line count by 40%. Every sentence that explains the obvious is an insult to the builder.
3. Replace tables with grouped lists and breathing room. Whitespace is not emptiness; it is confidence.
4. Move all shell commands, grep patterns, and verify logic out of prose. They belong in executable files, not reading material.
5. Make the hard constraints (50 lines, 20 lines, zero commercial fields) the only bold text on the page. Everything else should be quiet.

A specification should feel inevitable, not argumentative. These deliverables argue.
