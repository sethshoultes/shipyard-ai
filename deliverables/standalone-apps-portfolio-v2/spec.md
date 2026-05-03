# Standalone Apps Portfolio v2 — Implementation Spec

**Project**: Standalone Apps Portfolio v2
**Scope**: Three-app portfolio section for shipyard.company
**Status**: Ready for build

---

## Goals (from PRD)

1. Create a portfolio section on `/work` showcasing exactly 3 apps: `tuned`, `promptfolio`, `commandbar`
2. Build static, zero-runtime pages using Next 16 with `output: 'export'`
3. Generate detail pages for each non-SCAFFOLD app using `generateStaticParams`
4. Maintain honest, grounded descriptions based on actual code analysis
5. Follow locked decisions: no gradients, no search, no SCAFFOLD on `/work`, restraint in design

## Implementation Approach (from Plan)

### Architecture
- Single `portfolio.ts` data file consumed by all routes
- Server Components only, no client-side JavaScript
- Static export via Next 16 `output: 'export'`
- Direct write to `website/src/` (no deliverables handoff)

### Key Components
- `work-section.tsx` - Drop-in JSX section for `/work` page
- `portfolio-slug-page.tsx` - Dynamic `[slug]` page template
- `portfolio.ts` - TypeScript data schema and entries
- Test suite for data validation

### Design Principles
- Gallery aesthetic: white space, matte weight, no decoration
- Cold, clean, certain copy voice
- Status badges for internal use only (not rendered publicly)
- Curated scarcity: only shipped/demo-able tools get real estate

## Verification Criteria

### File Creation Tests
- [ ] All required files exist in deliverables directory
- [ ] `portfolio.ts` compiles without TypeScript errors
- [ ] `work-section.tsx` parses as valid TSX
- [ ] `portfolio-slug-page.tsx` parses as valid TSX
- [ ] Test script exits 0 when run

### Data Validation Tests
- [ ] Exactly 3 app entries: `tuned`, `promptfolio`, `commandbar`
- [ ] Every entry has all required fields (slug, name, tagline, status, github, features, techStack, accent)
- [ ] All GitHub URLs match pattern: `https://github.com/sethshoultes/shipyard-ai/tree/main/projects/.+`
- [ ] Slugs are unique within the array
- [ ] Accent colors are not in used set: `['blue','red','sky','purple','emerald','indigo']`
- [ ] Each entry has ≥3 features, each ≤200 characters
- [ ] All taglines ≤120 characters

### Content Grounding Tests
- [ ] Features are based on actual code (verified by source file reading)
- [ ] Tech stack entries derived from package.json dependencies
- [ ] No fabricated features or placeholder content
- [ ] Honest status labeling (SHIPPED/BUILD/SCAFFOLD)

### URL Liveness Tests
- [ ] All GitHub URLs return HTTP 200
- [ ] URLs are accessible and resolve to correct project directories

### Integration Tests
- [ ] Components can be imported into Next.js app structure
- [ ] TypeScript compilation succeeds with strict mode
- [ ] Static generation would produce valid HTML

## Files to Create or Modify

1. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/spec.md`** - This specification file
2. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/todo.md`** - Task checklist with verification steps
3. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/portfolio.ts`** - Data file with TypeScript schema and 3 app entries
4. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/work-section.tsx`** - JSX section for `/work` page integration
5. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/portfolio-slug-page.tsx`** - Dynamic page template for `[slug]` routes
6. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/tests/portfolio-data.test.ts`** - Node test script for data validation
7. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/MIGRATION.md`** - Human integration instructions

## Success Metrics

1. **File Completeness**: All 7 required files present and parseable
2. **Data Integrity**: TypeScript validation passes, all constraints met
3. **Code Grounding**: Features reflect actual implementation, no fabrication
4. **URL Validity**: All GitHub links are live and correct
5. **Integration Ready**: Components can be dropped into `website/src/` without modification
6. **Zero Bloat**: No meta-files ship with product, clean architecture
7. **Design Compliance**: Follows locked decisions on aesthetics and restraint

## Test Commands

```bash
cd /home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2

# File presence verification
test -f spec.md && test -f todo.md && test -f portfolio.ts \
  && test -f work-section.tsx && test -f portfolio-slug-page.tsx \
  && test -f tests/portfolio-data.test.ts && test -f MIGRATION.md \
  || { echo "FAIL: Missing required files"; exit 1; }

# Data validation
node --test tests/portfolio-data.test.ts

# TypeScript compilation
npx tsx --check portfolio.ts work-section.tsx portfolio-slug-page.tsx

# URL liveness (if desired)
# curl -s -o /dev/null -w "%{http_code}" https://github.com/sethshoultes/shipyard-ai/tree/main/projects/tuned
```

## Exit Criteria

Build is complete when:
1. All files are created and pass syntax checks
2. Data validation test exits 0
3. Features are grounded in actual code analysis
4. Components are ready for direct integration
5. Migration instructions are clear and complete
6. Zero banned content or fabricated features
7. Design follows all locked decisions from debate

The deliverable will be a self-contained mini-project ready for human merge into `website/src/`.