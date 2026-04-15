# PRD: Blog Post — "The Daemon That Ships While You Sleep"

> Priority: p2

## Problem
Shipyard has a blog at /blog but no content about how the autonomous pipeline actually works. This is our most differentiated technology — an AI daemon that processes PRDs through debate, plan, build, QA, creative review, board review, and ship phases automatically.

## Requirements

Write a blog post for the Shipyard website blog. The post should:
- Explain the daemon architecture: PRD watcher → debate → plan → build → QA → review → ship
- Include real numbers: 20+ PRDs shipped, 48 OOM kills survived, 5-minute heartbeat cycle
- Cover the hard lessons: OOM from parallel agents, dead code that was never called, wrong directory for PRDs
- End with what's next: model selection per phase, terse output optimization
- Tone: technical but accessible, written for developers and founders interested in AI automation
- Length: 1200-1800 words
- Include code snippets from the actual daemon (pipeline.ts, health.ts)

Source material:
- Read `daemon/src/pipeline.ts` and `daemon/src/config.ts` for architecture
- Read `daemon/src/health.ts` for heartbeat and intake
- Read deliverables in `deliverables/daemon-fixes/` and `deliverables/daemon-stagger-review/` for the stability story
- Read rounds for any retrospectives

Write the post as a markdown file in the Shipyard blog content directory. Check the existing blog structure first to match the format.

## Success Criteria
- [ ] Blog post published to the correct directory
- [ ] Matches existing blog post format/frontmatter
- [ ] 1200-1800 words
- [ ] Includes real code snippets
- [ ] Committed and pushed
