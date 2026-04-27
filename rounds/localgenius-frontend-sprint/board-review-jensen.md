# Board Review — Jensen Huang

**Verdict: Ship the widget. Scrap the strategy. Rebuild around inference.**

**Score: 4/10.** Ships without AI. No LLM integration in the "AI" product. Hardcoded string matching replaces the model. Dashboard metrics are fake. This is a chat bubble with if-statements.

- **Moat:** Zero. Keyword FAQ lookup replicates in a weekend. No data flywheel. No proprietary training signal. Each site is an island.
- **What compounds:** Nothing. KV cache does not improve with usage. No embedding space. No fine-tuning loop. Usage does not make the product smarter.
- **AI leverage:** Missing. v1.1 "LLM proxy" is vapor. The spec cuts the only 10x feature. We are selling AI infrastructure without AI.
- **Unfair advantage ignored:** No on-device inference. No edge GPU personalization. No RAG over business documents. No semantic FAQ retrieval. We build the chips; this product does not use them.
- **Platform potential:** None. No developer API. No template marketplace. No cross-business learning. No plugin ecosystem. Product, not platform.
- **What to build instead:** Embeddings-based FAQ retrieval. Per-business LoRA fine-tuning on conversation logs. NVIDIA NIM inference at the edge. A network where every answered question improves every other business in the same category.

**Decision:** Approve frontend sprint to stop the bleeding. Allocate 30 days to replace fallback rules with an actual model. No Series A without inference.
