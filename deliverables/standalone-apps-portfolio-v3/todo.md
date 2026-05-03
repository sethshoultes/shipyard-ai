# Standalone Apps Portfolio v3 — Task Checklist

**Total Tasks:** 18
**Estimated Time:** 45 minutes
**All tasks should complete in <5 minutes each**

---

## File Creation Tasks

### Core Data & Types

- [ ] Create `portfolio.ts` with AppEntry type and apps array — verify: file contains exactly 62 lines and 3 app entries (tuned, promptfolio, commandbar)
- [ ] Verify portfolio.ts content matches PRD exactly — verify: `diff portfolio.ts /dev/stdin` shows no differences when pasting PRD content

### React Components

- [ ] Create `work-section.tsx` with AppsAndToolsSection component — verify: file renders without React errors and imports from ./portfolio
- [ ] Create `portfolio-slug-page.tsx` dynamic route page — verify: file generates static params and exports default async function
- [ ] Verify React components compile cleanly — verify: `npx tsc --noEmit work-section.tsx portfolio-slug-page.tsx portfolio.ts` exits 0

### Test Infrastructure

- [ ] Create `tests/portfolio-data.test.ts` with node test assertions — verify: `node --test tests/portfolio-data.test.ts` exits 0
- [ ] Create test scripts in tests/ directory — verify: all .sh files are executable (`chmod +x tests/*.sh`)

### Documentation

- [ ] Create `spec.md` specification document — verify: file exists and contains complete specification with verification criteria
- [ ] Create `MIGRATION.md` with 6-line integration instructions — verify: file contains exactly 6 lines with migration steps

---

## Verification & Quality Tasks

### Content Verification

- [ ] Verify no banned content in any files — verify: `grep -riE 'TODO|FIXME|lorem|coming soon|placeholder' .` returns no matches
- [ ] Verify all required files exist — verify: `ls -1 | wc -l` returns 7 (spec.md, todo.md, portfolio.ts, work-section.tsx, portfolio-slug-page.tsx, tests/, MIGRATION.md)

### Data Integrity

- [ ] Verify GitHub URLs match expected pattern — verify: `grep -o 'https://github.com/sethshoultes/shipyard-ai/tree/main/projects/[a-z-]*' portfolio.ts` returns exactly 3 matching URLs
- [ ] Verify app slugs are unique — verify: `grep -o '"slug": "[^"]*"' portfolio.ts | sort | uniq -d` returns no duplicate lines
- [ ] Verify tagline length limits — verify: all taglines are ≤ 140 characters

### Build & Type Safety

- [ ] Run TypeScript compilation check — verify: `npx tsc --noEmit *.ts *.tsx` exits 0 with no errors
- [ ] Run test suite validation — verify: `node --test tests/portfolio-data.test.ts` shows "pass" for all tests
- [ ] Verify line count requirement — verify: `cat portfolio.ts work-section.tsx portfolio-slug-page.tsx | wc -l` ≥ 200

### Test Script Execution

- [ ] Execute file existence test — verify: `tests/check-files.sh` exits 0
- [ ] Execute banned content test — verify: `tests/check-no-banned-content.sh` exits 0
- [ ] Execute line count test — verify: `tests/check-line-count.sh` exits 0

---

## Final Integration Tasks

### Static Export Verification

- [ ] Test Next.js static export compatibility — verify: Components use only Server Components, no client-side hooks
- [ ] Verify import paths are correct — verify: All imports resolve correctly (portfolio.ts, next/link, etc.)

### Quality Gates

- [ ] Review all files for final polish — verify: No trailing whitespace, consistent indentation, proper formatting
- [ ] Verify brand voice consistency — verify: Copy follows "We craft tools we wish existed" tone
- [ ] Confirm debate decisions honored — verify: No SCAFFOLD entries, no status badges above fold, specific CTAs only

---

## Integration Preparation

### Migration Readiness

- [ ] Verify MIGRATION.md instructions are actionable — verify: Each step is clear and can be executed by a human
- [ ] Test component drop-in compatibility — verify: Components can be imported without modification to main site

### Documentation Completion

- [ ] Update todo.md completion status — verify: This checkbox is checked last
- [ ] Final review of all deliverables — verify: All acceptance criteria from spec.md are satisfied

---

## Acceptance Criteria Checklist

### Core Requirements
- [ ] **AC1:** All 7 files exist in deliverables directory
- [ ] **AC2:** portfolio.ts matches PRD verbatim (no improvisation)
- [ ] **AC3:** Node test passes (`node --test --import tsx tests/portfolio-data.test.ts` exits 0)
- [ ] **AC4:** TypeScript compiles (`npx tsc --noEmit` exits 0)
- [ ] **AC5:** No banned content (`grep` returns nothing)
- [ ] **AC6:** Line count sanity check (≥ 200 total lines)

### Quality Gates
- [ ] **QG1:** All test scripts execute successfully
- [ ] **QG2:** No TypeScript errors or warnings
- [ ] **QG3:** Content matches brand voice and debate decisions
- [ ] **QG4:** Migration path is clear and actionable

---

## Done When

All 18 checkboxes are checked and all acceptance criteria pass. The deliverable is then ready for human integration per MIGRATION.md.

*Each task is designed to be completable in under 5 minutes with clear verification steps.*