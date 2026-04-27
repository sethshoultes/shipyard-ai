# Board Verdict — Sous Frontend Sprint

*Consolidated from reviews by Jensen Huang, Jony Ive, and Maya Angelou.*

---

## Points of Agreement

**1. Ship the widget.**
All three board members agree the widget frontend is the strongest asset. Jensen calls it the only thing worth shipping. Jony sees "discipline" in the widget craft. Maya praises the KV seed copy as the one place the product truly sings. The consensus: the customer-facing surface is ready to stop the bleeding.

**2. The dashboard is the weakest link.**
There is unanimous dissatisfaction with the admin experience. Jensen dismisses the metrics as fake. Jony calls the dashboard "assembled, not composed." Maya says the dashboard copy "sleeps." No board member defends the current SaaS dashboard as launch-ready.

**3. Voice is a competitive advantage — when executed.**
Maya and Steve (per locked decisions) have been the loudest voices on concierge tone, but even Jony's design critique implies a respect for surfaces that feel human, not cataloged. The board agrees that tone is a feature; the disagreement is on whether the current product earns it.

**4. The underlying "AI" story is currently vapor.**
Jensen is explicit: " Ships without AI." The LLM fallback is unbuilt, the KV cache is static, and there is no learning loop. While Jony and Maya do not frame their critiques in engineering terms, their emphasis on the product feeling *alive* implies the same gap: a system that does not get smarter feels like a machine, and machines churn.

---

## Points of Tension

**1. Inference-first vs. Ship-now-pivot-later**
Jensen demands a 30-day replacement of fallback rules with an actual model, edge inference, and per-business LoRA fine-tuning. He views the current KV-only architecture as a weekend replication job with zero moat. The founders' locked decisions explicitly cut LLM from the default path, making it a "fire extinguisher." This is the central tension: Jensen will not support a Series A on keyword matching; the founders believe speed and voice win the first 1,000 users before inference does.

**2. Minimalism vs. Refinement**
Jony wants a stricter design system — four slate shades, fixed radius tokens, 44px touch targets, view transitions. The founders have locked "one toggle, one number, one button," which Jony treats as a compositional failure, not a strategic virtue. He does not dispute the *number* of elements; he disputes the *quality* of their assembly.

**3. Static answers vs. Compounding product**
Jensen: "What compounds? Nothing." Maya loves the *current* KV copy but does not address whether it will feel stale in month two. The founders' risk register admits that generic answers may fail the "maître d' test" at scale. The tension is between shipping a pre-seeded phone tree now and building a self-improving answer network later.

**4. Platform ambition vs. Product discipline**
Jensen wants developer APIs, template marketplaces, cross-business learning, and NIM inference at the edge. The founders have explicitly cut every feature that turns the plugin into a platform. The board is split on whether Sous should be a beautiful, narrow product or the first node of a network.

---

## Overall Verdict: **PROCEED — CONDITIONAL**

No board member calls for a full stop. Jensen, despite the 4/10 score, approves the frontend sprint explicitly "to stop the bleeding." Jony and Maya offer directional feedback that assumes continued development. The product has a clear job-to-be-done, a disciplined widget, and a locked-down scope that avoids the "15 products in a trench coat" failure mode.

However, the conditions are non-negotiable. The board does not believe the current architecture supports sustainable retention or fundraising.

---

## Conditions for Proceeding

### 1. Inference Roadmap (Jensen — Non-Negotiable)
- Within 30 days of frontend sprint completion, present a written plan to replace hardcoded fallback rules with an embeddings-based retrieval model.
- Target: semantic FAQ retrieval over keyword matching by v1.1.
- No Series A conversation without a working LLM fallback or edge inference demo.

### 2. Dashboard Redesign (Jony + Maya — Launch Gate)
- Consolidate the design system: four slate shades, 12px/24px radius only, 44px minimum touch targets.
- Remove inline styles and negative-margin hacks. Cascade properly.
- Add 150ms opacity fade for view transitions.
- Rewrite all dashboard copy per Maya's warmth standard. "Upgrade billing" and "We detected your business type" must be replaced with human alternatives before public launch.
- Expand metric card max-width to 560px and let it breathe.

### 3. Kill Fake Metrics (Jensen — Immediate)
- Remove any hardcoded or placebo analytics from the dashboard.
- The "one number" must be a real database query (questions answered this week) or it must not ship.
- If real data is not yet flowing, show a loading/empty state that is honest, not a fiction.

### 4. Voice Audit (Maya — Pre-Launch)
- Every customer-facing string must pass the "best employee" test: warm, brief, confident, zero chatbot clichés.
- Specific banned phrases: "Processing your request," "How can I help you today?," "Reach our team," "Upgrade billing."
- Fallback copy must feel like a human handoff, not hold music.

### 5. Widget Polish (Jony — Pre-Launch)
- Soften shadows to the specified `rgba(15,23,42,...)` values.
- Replace envelope icon with a speech or question mark.
- Fix arbitrary gaps (10px → 8px or 12px).
- Mute the fallback yellow to `#f8fafc` with a subtle border.

---

> *"Build fast. Build light. But what you build must feel inevitable."*
