# Board Verdict — Still (formerly Calm Commit)

## Board Members
- **Steve** — Chief Design & Brand Officer
- **Elon** — Chief Product & Growth Officer
- **Maya Angelou** — Voice & Poetry Review
- **Phil Jackson** — Arbiter (Locked Decisions)

---

## Points of Agreement

1. **One suggestion, zero configuration.** Both board members agree that presenting a single perfect suggestion is the correct interface. Multiple options are decision fatigue disguised as user choice. No onboarding wizards, no settings panels, no "learn your style" in v1.

2. **Voice and tone are product, not packaging.** The commit message itself is the primary interface. It must read like a calm senior engineer wrote it: declarative, precise, concise. No emojis, no exclamation points, no marketing speak. Taste is retention.

3. **Diff-hash caching is non-negotiable.** LLM round-trip latency (500ms–3s) is the real bottleneck. Caching by diff hash delivers <10ms on identical changes and acts as a cost firewall at scale. Both members adopt this unconditionally.

4. **Scope discipline for v1.** Both agree the following are out of v1: team style learning (embeddings/RAG), commit chunking (semantic understanding), web dashboards, team analytics, and onboarding wizards. These are v2 or research problems.

5. **Distribution cannot be organic prayer.** "npm/brew and developer Twitter" is not a strategy. The company needs a launch partner, a viral mechanic, or bundling into an unavoidable workflow before expecting 10,000 users.

6. **Pricing story before scale.** At 100× usage, LLM API costs break the business model before the code breaks. The board agrees monetization cannot be an afterthought. However, they reject a freemium local/cloud split for v1 as a support nightmare.

---

## Points of Tension

1. **CLI hook vs. ghost-line experience (highest tension).** Elon demands a `prepare-commit-msg` git hook as the *entire* v1 surface—universal, zero-dependency, works in vim over SSH. Steve insists the ghost-line UI (editor extension) is the soul of the product and must ship in v1 or immediately after ("weeks, not quarters"). Steve calls the hook "plumbing"; Elon calls editor extensions a "fragmentation tax." The arbiter ruled: hook ships now, ghost line follows.

2. **Local vs. cloud LLM.** Elon advocates a fast local model (e.g., Llama 3.1 8B quantized) for 90% of typical commits to solve latency and cost. Steve argues that a fast-but-wrong suggestion kills trust on first use: "Speed without quality is a broken promise." The arbiter ruled cloud-only for v1, with the LLM client abstracted for future local support.

3. **Brand vs. shipping speed.** Steve rebranded the product to "Still" and treats name, brand voice, and emotional hook as the moat. Elon views the rebrand before 10 users as bikeshedding: "Brand is paint; the engine is the product." The arbiter ruled the name is Still.

4. **Rebase workflow support.** Steve wrote "NO supporting rebase workflows we're not proud of." Elon countered: "If it doesn't work with rebase, it doesn't work for real developers." This tension is **unresolved** in the locked decisions and must be tested before launch.

5. **Minimalism vs. fit-and-finish.** Elon wants to ship a 50-line core in one session and iterate. Steve wants the "fit and finish that turns a script into a ritual." The arbiter split the difference: v1 ships the minimal working hook; the experience layer follows fast.

---

## Overall Verdict: **PROCEED**

The board has sufficient alignment on the v1 thesis: a zero-config, cloud-powered git hook that writes one perfect commit message in a calm, precise voice, backed by diff-hash caching. The emotional hook—turning embarrassing git history into a "museum of intent"—is compelling and differentiated. The technical feasibility is high (buildable in one session), and the scope is appropriately frozen.

The arbiter has resolved the major product disputes. What remains is execution risk, not thesis risk.

---

## Conditions for Proceeding

1. **Resolve rebase behavior before launch.** Test and document how the hook behaves during interactive rebase, squash, and amend flows. Do not launch with undefined behavior here.

2. **Lock pricing model before any scaling event.** Define cost per user, pricing tier, and revenue model before hitting 1,000 users or any Hacker News front-page moment. Do not scale into bankruptcy.

3. **Secure distribution insurance.** Identify a specific launch partner, influencer, or viral loop mechanism. If the primary channel falls through, have a backup plan before build completion.

4. **Maya Angelou voice pass on all CLI text.** The current help text and error messages are "cold metal." Rewrite every user-facing string with rhythm, restraint, and warmth. Example: `Error: a still-managed prepare-commit-msg hook already exists` → `Still is already here.`

5. **Hook conflict detection.** The installer must detect and chain with existing hooks (husky, commitlint, etc.) rather than overwriting them. Document conflict resolution clearly.

6. **Quality guardrail.** If the LLM returns low-confidence or malformed output, abort and leave the commit buffer empty. One bad suggestion = churn. Never poison the user's history to save face.

7. **Abstract the LLM client interface.** Keep the cloud provider swappable and local-model support pluggable so v1.1 or v2 can add on-premise options without a rewrite.

8. **Post-v1 ghost-line roadmap.** Within two weeks of v1 shipping, begin the editor extension(s) to deliver the "one line above your cursor" experience. Do not let the deferred vision become a forgotten promise.
