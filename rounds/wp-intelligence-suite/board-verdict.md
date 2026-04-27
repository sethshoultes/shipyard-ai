# WP Intelligence Suite — Board Verdict

**Date:** Post-Round 2
**Board:** Elon Musk (Engineering), Steve Jobs (Design)
**Consolidated by:** Zen Master

---

## Points of Agreement

The board is aligned on what matters most for v1. These are non-negotiable and locked:

1. **WordPress.org as primary distribution.** Steve conceded completely. The .org directory is the only scalable channel. Direct-download ZIP files are not a go-to-market strategy.
2. **No onboarding wizard.** Consensus. Replace with pre-seeded defaults and a single contextual tooltip. Users install plugins to solve acute problems, not watch demos.
3. **Zero external API calls during plugin activation.** Shared hosting reality (30s timeouts, 128MB RAM) wins over magic. No white screens. No 1-star reviews.
4. **No template marketplace in v1.** Two-sided marketplaces are startups, not features. Defer to v3 at earliest.
5. **No agency white-label / cross-site dashboard in v1.** Agencies want WP-CLI and license keys, not another web UI. Defer to v2+.
6. **Contextual nudges, not upgrade billboards.** The dashboard is a cockpit, not Times Square. Warm language at limits: *"You're moving fast. Want me to keep up?"*
7. **Annual billing hidden in checkout flow.** A terms-of-service clause, not a product feature. Does not appear in marketing copy.
8. **Hard limits on free tier.** The math is lethal: 50K free users × 50 responses = 2.5M inference calls ≈ $5K/mo in subsidized AI costs. Limits must be technically enforced.
9. **Simple Stripe Checkout link, not a billing engine.** One payment URL + tier flag in the database. Self-service portal is v2.
10. **No anonymous analytics / data flywheel.** 3% opt-in is not a flywheel. Do not build telemetry infrastructure for v1.
11. **Invisible feature gating.** The user sees one product, not three plugins in a trenchcoat. Gates are physics; they should be invisible.
12. **The first 30 seconds are sacred.** Alive at activation. Pre-seeded. Populated. Ready. No blank slate. No "configure me" screens.
13. **WP-CLI compatibility.** Agencies and power users need `wp wis activate` and scripted workflows.

---

## Points of Tension

Three conflicts remain unresolved. They are ranked by severity:

### 1. Architecture: One Plugin or Three? (CRITICAL — BLOCKS SCAFFOLDING)
- **Elon:** Three independent plugin codebases with a shared constants file (`wis-tier.php`). Decoupled failure domains. When LocalGenius breaks on PHP 5.6, Dash and Pinned survive. No unified dashboard querying N+1 postmeta lookups on every admin load.
- **Steve:** One product. One name. One dashboard. One feeling. The user does not assemble their experience — we do. Three menus = three different ideas of what this is. Fragmentation is death.
- **Status:** No middle ground satisfies both. Engineering cannot write a single class until this is decided.

### 2. Admin UI: Native WordPress or Custom Design System? (HIGH)
- **Elon:** Native WordPress UI. Future-proof against WP 6.6+ breaking custom admin themes. Users install plugins to solve problems in 10 seconds, not admire pixels. Byte count matters on shared hosting.
- **Steve:** Custom UI system. WordPress admin is a "design war crime." In a sea of gray boxes, beauty is credibility and the only moat engineering cannot copy. The user should smile when they see the dashboard. If they do not smile, we have failed.
- **Status:** If Steve wins, every major WP update becomes a regression test. If Elon wins, the product risks indifference in a crowded AI plugin market.

### 3. FAQ Content: Hand-Written Templates or Lazy AI Generation? (MEDIUM)
- **Elon:** Ship 5 hand-written FAQ templates per vertical today. No LLM dependency in v1. Static templates ship today; AI loads tomorrow.
- **Steve:** Lazy generation with a brilliant loading state. The user opens the dashboard and sees a confident animation while the AI works. Smart magic, not no magic.
- **Status:** Steve conceded activation-time scraping. Both agree on lazy loading. The dispute is whether v1 includes any LLM generation at all, or purely static templates with AI deferred to v2.

**Secondary tension:** Product naming. Elon wants to keep "WordPress Intelligence Suite" for v1 to preserve .org momentum. Steve wants a one-word rebrand (NEXUS or SPARK) and calls WIS "six syllables of corporate white noise." The Zen Master recommends a compromise: WIS as the .org slug, Steve's one-word concept as the customer-facing brand name in headers and descriptions.

---

## Overall Verdict: PROCEED

The fundamentals are sound. The business model is validated by both directors. The scope has been appropriately amputated. The risks are identified and mitigatable. The product has a clear emotional hook and a defensible distribution strategy.

**However, proceed does not mean proceed blindly.** The architecture deadlock is a hard blocker to engineering. The board has consensus on *what* to ship and *why*, but not yet on *how* to build it.

---

## Conditions for Proceeding

### 1. Resolve OQ-1 and OQ-2 within 24 hours.
Phil Jackson (Build Lead) must broker a decision on architecture and UI philosophy before a single class is written. If no consensus is reached, **Elon's architecture wins for v1** (three independent plugins, native WordPress UI, ship fast), and **Steve's vision becomes the v2 north star** (unified dashboard, custom design system, time-to-love).

### 2. WIS slug + Steve's brand name as customer-facing identity.
Use "WordPress Intelligence Suite" for the .org slug and repository name to avoid review-queue delays. Use Steve's one-word concept (NEXUS or SPARK) as the display name in plugin headers, readme descriptions, and screenshots. Do not A/B test the plugin name on .org.

### 3. Ship the intersection only.
If a feature is not in both Elon's and Steve's v1, it does not ship. No exceptions. The locked MVP list is the ceiling, not the floor.

### 4. Test on the worst host before .org submission.
If the plugin does not survive a $5/month shared host (PHP 5.6-8.3 matrix, 30s timeout, 128MB RAM), it does not survive the market. Bluehost basic is the acceptance test.

### 5. Monitor the 5% conversion cliff from day one.
The unit economics depend on 5% of free users converting at $99/yr. If 1,000 installs do not produce ~50 paid conversions, no amount of onboarding wizards or analytics dashboards will save the product. Track this metric before building v1.1.

### 6. GDPR compliance is not v1.1.
If lazy AI generation ships in any form, explicit user consent must precede the first LLM call. EU law is not a feature flag. Build the consent gate now or remove the LLM entirely.

---

*"Ship something people love. The rest is just optimization."*
*— Steve*

*"Strip it down or die shipping nothing."*
*— Elon*

Both are right. The path forward is the overlap.
