# PRD Template — Code / Internal Work

> Use this template for any PRD that produces source code (TypeScript, Python, PHP, Go, etc.) instead of a client website.
> Examples: daemon fixes, internal tooling, library work, agent improvements, integration adapters.
> Client website/theme/plugin work uses `TEMPLATE.md` instead.

> **Lessons baked in (2026-05-03):** Vague PRDs make builders write markdown instead of code. PRDs that say "READ each X then synthesize Y" produce zero source files even on the best models. This template forces the author to embed concrete data so the builder only has to write what's already specified.

---

## Frontmatter

```
slug: <kebab-case-slug>           # filename minus .md
project: <where the work lands>   # e.g., website, daemon, plugins/membership
type: <feature | bugfix | refactor | docs>
priority: <P0 | P1 | P2>
date: <YYYY-MM-DD>
rock: <#1 | #2 | ... | none + justification>
```

---

## Background

One paragraph. WHY this PRD exists. What problem are we solving? What's broken or missing?

If this supersedes a prior PRD, name it and explain what failed.

---

## Required Files

Every file the build agent MUST produce, with absolute path inside `deliverables/<slug>/`. Include:

- `spec.md` — restate the acceptance criteria
- `todo.md` — checklist with one item per file + per acceptance criterion
- At least 3 source files (`.ts`, `.tsx`, `.js`, `.py`, `.php`, `.go`, etc.) — required by the hollow-build gate
- `tests/<test-file>` — runnable test that exits 0 on pass
- `MIGRATION.md` — if work integrates with existing code, explain how a human merges it

Example:
```
deliverables/<slug>/
├── spec.md
├── todo.md
├── module.ts
├── helpers.ts
├── tests/module.test.ts
└── MIGRATION.md
```

---

## EXACT contents (or precise specifications)

For each source file in Required Files, give ONE of:

- **Verbatim contents** — literal code blocks the builder copies. Best for content-heavy work.
- **Precise specification** — function signatures, type definitions, exact behavior. The builder writes the implementation.

Do NOT say "implement a function that does X" without giving the signature.
Do NOT say "READ the existing code at Y and replicate the pattern" without embedding the pattern here.

If the work needs context from existing code (e.g., a config file or a CLAUDE.md rule), **paste the relevant sections directly into this PRD**. Do not delegate the read-and-synthesize step to the builder.

---

## Acceptance Criteria

Numbered list of testable assertions. Each one must be verifiable by running a command.

Bad: "The code should work correctly."
Good: "`npm run build` exits 0 in `<project>/`."

Minimum 3 criteria. Aim for 5–8.

---

## Test Commands

Exact shell commands a reviewer can run to verify the build:

```bash
cd /home/agent/shipyard-ai/deliverables/<slug>

# 1. Files exist
test -f spec.md && test -f todo.md && [other required files]

# 2. Tests pass
node --test tests/

# 3. Type check
npx tsc --noEmit *.ts
```

---

## Out of Scope

Things this PRD will NOT do. Examples:

- Not editing files outside `deliverables/<slug>/`
- Not adding dependencies beyond what's in package.json
- Not changing public APIs
- Follow-up work goes in a separate PRD

---

## Risks

What could go wrong, and the mitigation. Keep it short.

---

## Done When

The condition for the PRD to move to `prds/completed/`. Usually:

- All Acceptance Criteria pass
- Tests are green
- Retrospective at `memory/<slug>-retrospective.md` documenting what was learned

---

## Anti-patterns (lint will reject these)

- "READ the existing project at X" without embedding the data
- "Synthesize a description of Y" — describe what YOU want, don't ask the builder to invent
- Unbacked promises ("Should work in all browsers") — make claims testable
- Missing Required Files section
- File <500 chars (too thin)
- No source-code file extensions in Required Files (will fail hollow-build gate)
- Vague Acceptance Criteria ("looks good", "works correctly")
