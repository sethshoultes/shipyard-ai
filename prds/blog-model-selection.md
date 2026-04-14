# PRD: Blog Post — "Why One LLM Isn't Enough: Model Selection for Multi-Agent Pipelines"

> Priority: p2

## Problem
We learned the hard way that using a single model for all agent phases wastes money on reviews and produces hallucinations on code. The model selection strategy (sonnet for code, haiku for opinions) is a valuable lesson for anyone building multi-agent systems.

## Requirements

Write a blog post for the Shipyard website blog. The post should:
- Start with the problem: Haiku hallucinated 100+ API violations per plugin
- Show the cost math: one bad build = 4-6 fix cycles, more expensive than sonnet once
- Present the solution: model selection per phase with a clear table
- Include the terse output optimization: ~75% output token savings on review phases
- Explain the Claude Agent SDK model parameter: `model: 'sonnet' | 'haiku' | 'opus'`
- Tone: practical, opinionated, aimed at AI engineers building agent systems
- Length: 1000-1500 words

Source material:
- Read `daemon/src/pipeline.ts` for model selection implementation
- Read `daemon/src/agents.ts` for TERSE prefix
- Read deliverables in `deliverables/model-selection-per-phase/` if they exist

Write the post as a markdown file in the Shipyard blog content directory.

## Success Criteria
- [ ] Blog post published to the correct directory
- [ ] Matches existing blog post format/frontmatter
- [ ] 1000-1500 words
- [ ] Includes the model selection table
- [ ] Committed and pushed
