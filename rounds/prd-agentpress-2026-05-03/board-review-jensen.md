# Board Review — AgentPress
**Reviewer:** Jensen Huang (CEO, NVIDIA; Board, Great Minds Agency)
**Date:** 2026-05-03

---

## Verdict
Ships broken. Missing `class-rest-api.php`, `class-admin.php`, `readme.txt`. Autoloader references ghosts. Plugin will fatal on activation. SEOMeta agent excluded in spec yet present in code. Execution does not match PRD or spec.

---

## Moat & Compounding
- **No moat.** Thin API wrapper. Zero proprietary IP.
- No data flywheel. Logs prune; no insight extraction, no model fine-tuning.
- No network effects. Single-site plugin, not multi-tenant.
- Keyword router is trivial to replicate. No learning from past routing decisions.

## AI Leverage
- **Minimal.** Claude used for basic routing fallback and text generation — commodity usage.
- No 10x leverage: no agent collaboration, no memory, no planning, no tool use, no retrieval.
- Local keyword whitelist + Claude fallback is 200-level LLM architecture, not a system.
- Missing: caching layer for repeated prompts, embedding-based semantic routing, feedback loop on routing accuracy.

## Unfair Advantage We're Not Building
- **Inference at the edge.** No TensorRT, no local GPU acceleration, no quantized models running on-prem.
- **WordPress data gravity.** Not training on site content, not building embeddings from posts/media, not fine-tuning on customer's voice.
- **Agent marketplace.** No commerce layer, no discovery, no ratings. Just two hardcoded agents.
- **Real-time streaming.** Spec explicitly excludes streaming. Async REST in 2026 is dead on arrival.

## Platform vs Product
- **Currently a product.** Narrow plugin. Not extensible despite PRD claims.
- Platform gap: `agentpress_register_capability()` promised in PRD, missing in deliverables. Registry is hardcoded static array.
- CPT exists for capabilities but not used dynamically. Platform mechanics are theater.
- To become platform: live registry, agent marketplace, shared memory/context bus, billing APIs, streaming protocol, multi-site orchestration.

## Execution Gaps
- Missing REST API class. Core endpoint undeclared.
- Missing admin class. Settings/logs UI undeclared.
- Missing readme. Blocks WP.org submission.
- SEO agent present despite exclusion audit criterion.
- `agentpress_register_capability()` public API absent.

## Score
**4/10.** Good concept, incompetent execution. Platform promises unfulfilled, core files missing, no defensibility, commodity AI usage. Not shippable.
