# Blog Infrastructure — Risk Scan Executive Summary

**Project:** Blog Infrastructure (Markdown-Driven, Dynamic Routing)
**Status:** Ready for implementation with conditions
**Risk Level:** MEDIUM-HIGH (3 CRITICAL blockers, 8 HIGH-severity items)

---

## RECOMMENDATION: DO NOT START IMPLEMENTATION YET

**Three critical blockers must be resolved before coding begins:**

1. **RISK-001: Conflicting Tech Stack Decisions**
   - PRD specifies `remark-html` (outputs HTML string)
   - Decisions specify `react-markdown` (React components)
   - These are mutually exclusive; using one violates the other
   - **Resolution needed:** Confirm final approach, update PRD/Decisions to match

2. **RISK-002: fs Module Access in Static Export**
   - Current approach uses `fs.readdirSync()` at build-time
   - Must be absolutely certain this runs during static generation, not request-time
   - Cloudflare Pages will fail if fs is called after deploy
   - **Resolution needed:** Explicit code review of fs usage patterns

3. **RISK-003: Missing `generateStaticParams` Implementation**
   - Required for dynamic routes in static export
   - Omission would result in blog posts not being pre-rendered
   - **Resolution needed:** Make this non-optional in implementation

---

## KEY FINDINGS

### High-Risk Items (8 total)

| # | Risk | Root Cause | Mitigation |
|---|------|-----------|------------|
| RISK-004 | Frontmatter schema mismatch | Existing files have inconsistent YAML | Normalize all files before build |
| RISK-005 | Missing `published` field logic | PRD doesn't mention content gating | Update PRD, add `.filter(post => published)` |
| RISK-006 | RSS feed not in PRD | Decisions require RSS, PRD has no code | Add RSS generation route to PRD |
| RISK-007 | Bundle size impact unknown | No baseline measurement | Measure before/after, set monitoring |
| RISK-008 | Markdown special characters | Code blocks with backticks may fail | Test each post rendering locally |
| RISK-009 | Design consistency undefined | "Calm aesthetic" not specified | Copy existing prose styles to post pages |
| RISK-010 | Cloudflare deploy validation | No health checks after deploy | Add post-deploy curl/validation script |
| RISK-011 | Post migration gaps | 3 hardcoded posts have no .md files | Audit content, decide source of truth |
| RISK-012 | Incomplete TypeScript types | BlogPost interface missing `published`, `author` | Update interface with all fields |

### Medium-Risk Items (9 total)

- Syntax highlighting plugin compatibility
- fs.readdirSync performance at scale (deferred to V2)
- Pagination not implemented (intentional)
- And 6 others (see full register)

### Low-Risk Items (4 total)

- Next.js API stability
- RSS format validation
- SEO meta tag implementation
- And 1 other

---

## PRE-IMPLEMENTATION CHECKLIST

**Before code is written, complete these tasks:**

### Documentation & Decisions (must be done by project owner)
- [ ] DECIDE: react-markdown vs. remark-html (call Steve/Elon)
- [ ] UPDATE: PRD to reflect chosen markdown approach
- [ ] UPDATE: Add `published` field to frontmatter schema
- [ ] UPDATE: Add RSS generation to file structure section
- [ ] ADD: Example RSS route code

### Content Audit (must be done before build)
- [ ] Normalize all existing `.md` files to canonical schema:
  - [ ] Add `published: true` to all human-written posts
  - [ ] Convert dates from numbers to quoted strings
  - [ ] Add `description` field where missing
  - [ ] Verify `author`, `tags` are present where needed
- [ ] Resolve content ownership:
  - [ ] 3 hardcoded posts missing `.md` files → create or remove from view?
  - [ ] "Seven Plugins, Zero Errors" exists in both forms → which is canonical?
- [ ] Establish bundle size baseline: `npm run build && du -sh out/`

### Code Review Prep
- [ ] Create stub `lib/blog.ts` with function signatures
- [ ] Create stub `blog/[slug]/page.tsx` with `generateStaticParams()`
- [ ] Share for review before full implementation

---

## ESTIMATED EFFORT IMPACT

### If All Blockers Are Resolved
- **Implementation time:** 2-3 hours (per PRD estimate)
- **Testing & validation:** 1 hour
- **Deploy & verification:** 30 minutes
- **Total:** ~4 hours

### If Blockers Remain Unresolved
- **Rework due to wrong tech choice:** +2-4 hours
- **Post-deploy fixes:** +1-2 hours
- **Potential revert/rollback:** +30 minutes
- **Total:** 8-10 hours (2-3x longer)

---

## RISK ACCEPTANCE STATEMENT

This project is technically feasible with Next.js 16.2.2 and Cloudflare Pages. The identified risks are manageable and well-documented.

**Proceed with caution:** Resolve the 3 CRITICAL blockers first, then follow the implementation checklist in RISK-CHECKLIST-blog-infrastructure.md.

---

## DELIVERABLES

Three documents have been created:

1. **RISK-REGISTER-blog-infrastructure.md** (21 detailed risks)
   - Full description of each risk
   - Probability/Impact/Severity ratings
   - Mitigation strategies
   - Detection methods

2. **RISK-CHECKLIST-blog-infrastructure.md** (actionable checklist)
   - Pre-implementation requirements
   - Build-time validation steps
   - Deployment verification
   - Post-deployment monitoring

3. **RISK-EXECUTIVE-SUMMARY.md** (this document)
   - High-level overview
   - Critical blockers
   - Key findings
   - Recommendation

---

## NEXT STEPS

### Day 1 (Now)
1. Share this summary with project stakeholders
2. Call to resolve CRITICAL blockers (1 hour)
3. Begin content normalization (post migration)

### Day 2
1. Implementer reviews full RISK-REGISTER
2. Implementer walks through RISK-CHECKLIST
3. Code implementation begins (with blockers resolved)

### Day 3
1. Local build and testing
2. Pre-deployment validation
3. Cloudflare Pages deploy

### Days 4-5
1. Post-deployment smoke tests
2. 24-48 hour monitoring
3. Sign-off when all criteria met

---

## QUESTIONS FOR STAKEHOLDERS

Before implementation, get explicit answers to:

1. **Which markdown rendering approach?** (react-markdown or remark-html)
2. **Is `published` field required for V1?** (content gating for AI posts)
3. **Is RSS feed required for V1?** (Decisions say yes, PRD doesn't show it)
4. **What's the content source of truth?** (hardcoded array vs. markdown files)
5. **Who reviews draft posts?** (if `published: false` is enforced)

---

## RISK REGISTER LOCATIONS

- **Full register:** `/home/agent/shipyard-ai/RISK-REGISTER-blog-infrastructure.md`
- **Checklist:** `/home/agent/shipyard-ai/RISK-CHECKLIST-blog-infrastructure.md`
- **This summary:** `/home/agent/shipyard-ai/RISK-EXECUTIVE-SUMMARY.md`

All files are committed to the repository and ready for review.

---

**Scan completed:** 2026-04-15
**Severity assessment:** MEDIUM-HIGH (implementable with proper risk mitigation)
**Recommendation:** CONDITIONAL GO (after blockers are resolved)
