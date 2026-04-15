# PRD: Blog Post — "Shipping 7 Emdash Plugins With an Autonomous Pipeline"

> Priority: p2

## Problem
Shipyard built 7 Emdash CMS plugins (EventDash, MemberShip, ReviewPulse, FormForge, SEODash, CommerceKit, AdminPulse) through an autonomous AI pipeline. This is a compelling case study but it's not documented anywhere public.

## Requirements

Write a blog post for the Shipyard website blog. The post should:
- Tell the story: 7 plugins, all built against a hallucinated API, all fixed through the pipeline
- Cover the banned patterns problem: throw new Response, JSON.stringify on KV, rc.user
- Show how the pipeline caught and fixed issues: QA blocks, auto-fix cycles, Margaret Hamilton QA
- Highlight the board review process: Jensen on moats, Warren on economics, Shonda on retention
- Tone: case study format, results-driven, with before/after code comparisons
- Length: 1200-1800 words

Source material:
- Read `plugins/eventdash/src/sandbox-entry.ts` and `plugins/membership/src/sandbox-entry.ts`
- Read `docs/EMDASH-GUIDE.md` for the correct patterns
- Read `BANNED-PATTERNS.md` for what was wrong
- Read deliverables in `deliverables/eventdash-fix/` and `deliverables/membership-fix/`
- Read board verdicts in `rounds/eventdash-fix/board-verdict.md` and `rounds/membership-fix/board-verdict.md`

Write the post as a markdown file in the Shipyard blog content directory.

## Success Criteria
- [ ] Blog post published to the correct directory
- [ ] Matches existing blog post format/frontmatter
- [ ] 1200-1800 words
- [ ] Includes before/after code comparisons
- [ ] Committed and pushed
