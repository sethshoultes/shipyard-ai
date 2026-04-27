# Board Review: AgentPipe
**Reviewer:** Jensen Huang (CEO, NVIDIA; Board, Great Minds Agency)
**Date:** 2026-04-23
**Verdict:** Ship failed. PRD says WordPress MCP plugin. Deliverable is a Next.js SaaS billing page for "LocalGenius." Zero overlap. Not even close.

---

## Score: 1/10
**Mismatched deliverable. Wrong product shipped entirely.** Even evaluating PRD in isolation: commodity connector, no compounding advantage, negligible AI leverage.

---

## Moat & Compounding
- **None.** WordPress plugin ecosystem = race to bottom. Copy the MCP spec in a weekend.
- No data flywheel. Each site is an island; embeddings don't train a shared model.
- No lock-in. Uninstall plugin → MCP endpoint disappears → zero switching cost.
- Compounding: zero. Revenue scales linearly with installs. No network effects, no margin expansion.

## AI Leverage (10x Outcome?)
- **No.** PRD lists "Claude re-ranking" and "Workers AI embeddings" as fallback paths. That's API tourism, not AI leverage.
- Zero CUDA optimization. No model ownership. No inference efficiency gains.
- Real 10x would be: fine-tuned embedding model on 500M WordPress posts, served on TensorRT at 10ms latency. Not a SQL LIKE fallback.
- Deliverable has **literally no AI code.** It's React components and Stripe helpers.

## Unfair Advantage We're NOT Building
- **NVIDIA stack integration.** If I'm on the board, use it. Build embedding inference on Triton. Offer free credits via NVIDIA Inception. Make AgentPipe the reference MCP implementation for RTX AI PCs.
- **Aggregated semantic graph.** Connect 10k sites → build largest CMS knowledge graph. Sell insights back to publishers. Becomes data business, not plugin business.
- **Hardware-software co-design.** Optimize MCP SSE transport for DPU offload. Competitors can't copy without silicon.

## Platform vs. Product
- **Currently:** Product. Single-site plugin. $9/month = SMB tool.
- **Platform path missing:**
  - MCP server registry (discovery marketplace)
  - Cross-site agent orchestration (federated queries across client portfolios)
  - Agent app store (pre-built WordPress agents: SEO auditor, content planner, security scanner)
  - Embedding CDN (cached vectors at edge, pay per query)
- Without platform thesis, this is a feature. WordPress core will add MCP native in 18 months.

---

## Directives
1. **Halt this build.** Verify repository mapping. Current deliverable is not AgentPipe.
2. If PRD is the real target: add NVIDIA AI stack dependency (Triton/TensorRT), federated search architecture, and platform revenue model (take rate on agent marketplace).
3. If deliverable is the real product: rewrite PRD entirely. Don't mask SaaS billing code as an MCP plugin.

---

*"We don't build wrappers. We build accelerated computing platforms. This is a wrapper without acceleration."*
