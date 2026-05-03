# Standalone Apps Portfolio v2 — Task Checklist

**Project**: Standalone Apps Portfolio v2
**Build Agent**: Structured build preparation
**Status**: In Progress

---

## Phase 1: Setup and Analysis
- [ ] Read PRD at `/home/agent/shipyard-ai/prds/standalone-apps-portfolio-v2.md` — verify: all critical process rules understood
- [ ] Read plan at `/home/agent/shipyard-ai/.planning/phase-1-plan.md` — verify: build approach clear
- [ ] Read debate decisions at `/home/agent/shipyard-ai/rounds/standalone-apps-portfolio-v2/decisions.md` — verify: all locked decisions noted
- [ ] Read CLAUDE.md in repo root — verify: project rules understood
- [ ] Create deliverables directory structure — verify: `/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/` exists
- [ ] Create tests subdirectory — verify: `tests/` directory exists

## Phase 2: Project Analysis
- [ ] Analyze `projects/tuned/` directory structure — verify: identify key source files, package.json, README
- [ ] Analyze `projects/promptfolio/` directory structure — verify: identify key source files, package.json, README
- [ ] Analyze `projects/commandbar-prd/` directory structure — verify: identify deliverables, package.json, README
- [ ] Extract tech stack from each project's package.json — verify: dependency lists compiled
- [ ] Read at least 3 source files per project — verify: grounded feature understanding achieved
- [ ] Verify GitHub URL patterns for each project — verify: correct paths established

## Phase 3: Data File Creation
- [ ] Write `portfolio.ts` TypeScript schema — verify: AppEntry type matches PRD specification
- [ ] Create `tuned` app entry — verify: all required fields populated, features grounded in code
- [ ] Create `promptfolio` app entry — verify: all required fields populated, features grounded in code
- [ ] Create `commandbar` app entry — verify: all required fields populated, features grounded in code
- [ ] Validate accent color selections — verify: none conflict with existing `/work` colors
- [ ] Compile TypeScript to verify syntax — verify: `npx tsc --noEmit portfolio.ts` exits 0

## Phase 4: Component Development
- [ ] Write `work-section.tsx` component structure — verify: imports portfolio data, maps over apps
- [ ] Implement app card rendering — verify: matches existing `/work` visual style
- [ ] Add status badge logic — verify: SCAFFOLD entries get GitHub-only, others get both CTAs
- [ ] Implement GitHub links with target=_blank — verify: correct URL construction
- [ ] Implement "Read more" Next.js Link — verify: correct slug routing to `/portfolio/[slug]`
- [ ] Test TSX compilation — verify: `npx tsx --check work-section.tsx` exits 0

## Phase 5: Dynamic Page Template
- [ ] Write `portfolio-slug-page.tsx` basic structure — verify: imports, metadata export
- [ ] Implement `generateStaticParams` function — verify: returns array for non-SCAFFOLD apps only
- [ ] Implement `generateMetadata` function — verify: proper SEO metadata, canonical URLs
- [ ] Create page component hero section — verify: name, status badge, tagline display
- [ ] Add "About" paragraph rendering — verify: conditional content based on data
- [ ] Implement Features list section — verify: bullet point rendering
- [ ] Add Tech Stack chips section — verify: proper styling and display
- [ ] Create GitHub link card — verify: large, prominent call-to-action
- [ ] Add footer CTA to `/contact` — verify: proper Next.js Link implementation
- [ ] Test TSX compilation — verify: `npx tsx --check portfolio-slug-page.tsx` exits 0

## Phase 6: Test Suite
- [ ] Create `tests/portfolio-data.test.ts` structure — verify: imports portfolio data, test setup
- [ ] Write required fields validation test — verify: all entries have slug, name, tagline, status, github, features, techStack, accent
- [ ] Write GitHub URL pattern test — verify: matches `https://github.com/sethshoultes/shipyard-ai/tree/main/projects/.+`
- [ ] Write slug uniqueness test — verify: no duplicate slugs in array
- [ ] Write accent color conflict test — verify: none use `['blue','red','sky','purple','emerald','indigo']`
- [ ] Write feature count test — verify: each entry has ≥3 features
- [ ] Write feature length test — verify: each feature ≤200 characters
- [ ] Write tagline length test — verify: each tagline ≤120 characters
- [ ] Run test suite — verify: `node --test tests/portfolio-data.test.ts` exits 0

## Phase 7: Documentation
- [ ] Write `MIGRATION.md` header and overview — verify: clear purpose statement
- [ ] Document Step 1: Copy portfolio.ts — verify: exact destination path specified
- [ ] Document Step 2: Integrate work-section.tsx — verify: exact location in website/src/app/work/page.tsx identified
- [ ] Document Step 3: Create portfolio route — verify: correct directory structure for [slug] page
- [ ] Document Step 4: Update hero statistics — verify: which counters to increment specified
- [ ] Document Step 5: Build verification — verify: build command and expected output files
- [ ] Document Step 6: Final verification — verify: how to confirm static export success
- [ ] Review migration instructions — verify: human can complete in <10 minutes

## Phase 8: Final Validation
- [ ] Create `spec.md` with complete specification — verify: all goals, approach, criteria listed
- [ ] Verify all 7 required files exist — verify: file presence check passes
- [ ] Run TypeScript compilation on all TS/TSX files — verify: no syntax errors
- [ ] Execute full test suite — verify: all tests pass
- [ ] Verify content grounding — verify: features reflect actual code, no fabrication
- [ ] Check design compliance — verify: follows locked decisions, no gradients/pulses
- [ ] Validate GitHub URLs are live — verify: curl tests return 200 (optional)
- [ ] Review for banned content — verify: no lorem ipsum, TODO, coming soon placeholders
- [ ] Final file count verification — verify: exactly 7 files in deliverables directory

## Completion Criteria

Build is complete when:
- All 56 tasks above are checked as completed
- All verification steps pass their checks
- The deliverables directory contains exactly the 7 required files
- No implementation code has been written (only spec, todo, tests)
- All files are ready for the actual build agent to begin implementation

---

**Total Tasks**: 56
**Completed**: 0
**Remaining**: 56
**Status**: Ready to begin implementation phase