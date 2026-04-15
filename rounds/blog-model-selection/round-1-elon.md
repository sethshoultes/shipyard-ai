# Elon's Position: Blog Model Selection PRD

## Architecture
**Simplest system:** Static markdown file + code snippets from source. No dynamic generation. One agent session reads 2-3 files, writes one markdown file with frontmatter. Done. Don't overthink it.

The post structure is obvious:
1. Hook: "Haiku burned $X in wasted cycles"
2. Math: Show the actual cost delta (need real numbers from pipeline.ts)
3. Solution: The table + code snippet
4. Implementation: SDK parameter example
5. Results: 75% token savings

**Anti-pattern to avoid:** Don't build a "blog post generator system." That's scope creep. Write one good post manually (via agent).

## Performance
**Real bottleneck:** Research time. If the agent has to hunt through 10+ files, this becomes a 30-minute session. The PRD gives exact paths — use them.

**10x path:** Template the frontmatter. Template the structure. Agent fills in: actual numbers from code, actual hallucination count, actual cost math. 90% of the post is predetermined. Agent does research + assembly, not creative writing from scratch.

**Speed target:** 5-minute agent session max. Read 3 files, extract data, populate template, write file. If it takes longer, the task is poorly specified.

## Distribution
**How this reaches 10K without ads:**

Won't. A blog post doesn't distribute itself. This is educational content, not viral content.

**What actually works:**
- Post on X/Twitter with the hallucination number in the first line ("Haiku cost us $X in bad builds")
- Developer communities: Reddit r/LocalLLaMA, HackerNews (if the math is compelling)
- SEO: "multi-agent model selection" + "claude agent sdk cost optimization"

**Reality check:** Expect 200-500 organic readers in month 1. To hit 10K you need paid distribution, influencer shares, or HN front page. Don't plan on any of those.

**Better metric:** 50 engineers implement model selection after reading = high-value outcome. Focus on depth, not reach.

## What to CUT

**Scope creep I see:**
- "Matches existing blog post format/frontmatter" — this implies researching multiple existing posts to infer a pattern. Cut it. Just use standard markdown frontmatter: title, date, author, description. 2 minutes not 20.

**V2 masquerading as V1:**
- Anything about "optimizing blog discoverability"
- Custom analytics integration
- Newsletter cross-posting automation
- Social media auto-scheduling

**Core scope:** One markdown file, correct content, pushed to git. Everything else is post-launch.

## Technical Feasibility
**Can one agent session build this?**

Yes, easily — if the agent has:
1. Exact file paths (✓ PRD provides them)
2. Clear target location (✓ "Shipyard blog content directory")
3. Word count target (✓ 1000-1500)
4. Content outline (✓ implied by requirements)

**Failure modes:**
- Agent can't find the blog directory → PRD should specify exact path
- Frontmatter format is non-standard → needs one example post
- Source files don't contain the claimed data → would need to invent numbers (bad)

**Mitigation:** Agent should read one existing blog post first to copy format. Add this to requirements.

## Scaling
**What breaks at 100x usage?**

This is a one-off task. There's no "usage" to scale. Wrong question for this PRD.

**Better question:** What if we write 100 blog posts this way?

Then you need:
- Frontmatter template (reusable)
- Post structure templates by category (how-to, case study, announcement)
- Automated git workflow (branch → commit → PR)
- Editorial review process (who approves before merge?)

None of this is needed for post #1. Build it when you're at post #10.

**Current blocker:** PRD doesn't specify WHERE the blog directory is. Is it `/home/agent/shipyard-ai/blog`? A separate repo? Gatsby? Next.js? Hugo? The agent will waste 10 minutes searching. Fix this.

## Bottom Line
This is a 5-minute task dressed up as a project. The agent should:
1. Read 1 existing blog post (get format)
2. Read pipeline.ts and agents.ts (get data)
3. Write markdown file with real numbers
4. Commit + push

If it takes longer, you're overthinking it. Ship it today.
