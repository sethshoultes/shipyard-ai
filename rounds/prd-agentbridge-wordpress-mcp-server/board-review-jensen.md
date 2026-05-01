# Board Review: AgentBridge — WordPress MCP Server

**Reviewer:** Jensen Huang
**Role:** CEO, NVIDIA; Board Member, Great Minds Agency
**Verdict:** Ship it, but recognize it is a feature, not a company.

---

## Moat & Compounding

- First-mover in MCP→WordPress bridge. Thin advantage.
- Zero network effects. Each install is isolated. No data flywheel.
- No learning loop. Plugin does not improve with usage.
- Moat evaporates if Automattic or WP Engine adds native MCP in Q3.
- Compounding potential exists only if we aggregate usage patterns across installs. Currently disabled by design (no telemetry).

## AI Leverage

- AI leverage is near zero.
- Product is a pipe. AI is the consumer, not the producer.
- No LLM inference, no embeddings, no computer vision on media uploads.
- Missing 10x opportunities: semantic search across post corpus, auto-content generation, intelligent metadata extraction, agent memory across sessions.
- We are building infrastructure for AI without using AI.

## Unfair Advantage We're Not Building

- No GPU-accelerated inference layer (NVIDIA angle).
- No fine-tuned model on WordPress schema / content patterns.
- No hosting-provider integration (WP Engine, Bluehost, Automattic).
- No multi-site orchestration dashboard. Agencies manage 50+ WP sites. We gave them one endpoint per site.
- No telemetry means no proprietary dataset. Blind to usage.
- No "App Store" for agent tools. Open protocol invites commoditization.

## Platform vs. Product

- Today: product. A plugin with 7 CRUD tools.
- Platform requires:
  - Hosted registry aggregating all customer MCP endpoints
  - Multi-site agent orchestration (one prompt, 50 blogs updated)
  - Tool marketplace where third-party devs sell WooCommerce / SEO / ACF tools
  - Billing layer for agent compute and tool usage
  - Analytics: what do agents actually do on WordPress?
- Without these, we are a GitHub repo, not a platform.

## Deliverables Gaps

- Missing `readme.md`, `readme.txt`.
- Missing `admin/js/dashboard.js` (empty directory).
- Missing distribution ZIP and GitHub release asset.
- Spec was cut from 10 tools to 7. Acceptable, but `upload_media` cut was cowardly. Malware risk is solvable with sandboxed scanning and signed URLs.

## Score

**6/10 — Clean tactical execution of a strategically shallow bridge. Ships on time, dies by Christmas unless platform layer is funded next cycle.**

---

**Recommended mandate for next cycle:** Build the multi-site orchestrator and a hosted registry. Otherwise abandon and allocate engineers to CUDA-accelerated inference products.
