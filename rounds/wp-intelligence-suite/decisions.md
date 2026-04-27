# WP Intelligence Suite — Locked Decisions
## Consolidated by the Zen Master

This document is the single source of truth for what was decided, what was killed, and what remains unresolved after two rounds of debate. Do not add scope without resolving an open question here first.

---

## Locked Decisions

| # | Decision | Proposed By | Winner | Why |
|---|----------|-------------|--------|-----|
| 1 | **WordPress.org as primary distribution** | Elon | Elon (Steve conceded) | The .org directory is the only scalable channel for free WP plugins. Direct-download ZIP = distribution to your LinkedIn network, not the market. The .org readme, screenshots, and one-sentence description are where brand emotion converts browsers into installers. |
| 2 | **No onboarding wizard** | Elon | Consensus | A 3-minute wizard is a funnel with drop-off points. Users install plugins to solve acute problems, not watch demos. Replace with pre-seeded defaults and one contextual tooltip. Target: zero-setup, 30-second time-to-value. |
| 3 | **Zero external API calls during plugin activation** | Elon | Elon (Steve conceded partially) | Shared hosting kills PHP at 30 seconds with 128MB memory limits. Auto-configuring via LLM on activation = white screens and 1-star reviews on 80% of real-world installs. |
| 4 | **No template marketplace in v1** | Steve | Consensus | Two-sided marketplaces require liquidity, payments infrastructure, seller onboarding, dispute resolution, and content moderation. That's a full startup, not a v1 feature. Defer to v3 at earliest. |
| 5 | **No agency white-label / cross-site dashboard in v1** | Steve | Consensus | Multi-tenant SaaS infrastructure for agencies managing 100 sites is a separate product. Agencies at scale want WP-CLI and license keys, not another web dashboard. Defer to v2+. |
| 6 | **Contextual nudges, not upgrade billboards** | Steve | Consensus | The dashboard is a cockpit, not Times Square. When a limit is hit, one clean, warm message: *"You're moving fast. Want me to keep up?"* No upgrade cards. No neon buttons. |
| 7 | **Annual billing hidden in checkout flow** | Steve | Consensus | Annual-only is a terms-of-service clause, not a product feature. It does not appear in the product story, dashboard, or marketing copy. It lives in Stripe Checkout. |
| 8 | **Hard limits on free tier** | Elon | Consensus | The math is lethal: 50 free responses/mo × 50K active users = 2.5M API calls/mo ≈ $5K/mo in inference costs before collecting a dollar. The free tier must be technically enforced, not a polite suggestion. |
| 9 | **Simple Stripe Checkout link, not billing engine** | Elon | Elon | The PRD's 1.45M token estimate is theatrical. Building Stripe subscriptions, webhooks, annual proration, and a self-service portal burns the entire engineering budget. One payment link + tier flag in the database = v1. Full billing engine = v2. |
| 10 | **No anonymous analytics / data flywheel** | Elon | Elon | "Opt-in anonymous analytics" gets ~3% opt-in in reality. That is not a flywheel — it is a dripping faucet of biased power-user data. Do not build telemetry infrastructure for v1. |
| 11 | **Invisible feature gating** | Elon | Elon (Steve unchallenged) | Freemium requires gates. The user must never see the toggle, the constants file, or the option check. They see the result: the feature works, or the contextual nudge appears. One product experience, regardless of what's under the hood. |
| 12 | **First 30 seconds are sacred** | Steve | Consensus | Alive at activation. Pre-seeded. Populated. Ready. No blank slate. No "configure me" screens. The user must feel competence the moment they land. |

---

## Open Questions (Block Build Until Resolved)

| # | Conflict | Elon's Position | Steve's Position | Zen Master's Note |
|---|----------|---------------|------------------|-------------------|
| OQ-1 | **Architecture: One plugin or three?** | Three independent plugin codebases with a shared constants file (`wis-tier.php`) checking `get_option('wis_tier')`. Decoupled failure domains. When LocalGenius breaks on PHP 5.6, Dash and Pinned survive. | One product. One name. One dashboard. One feeling. The user does not assemble their experience — we do. Three menus = three different ideas of what this is. | This is the single biggest blocker. Engineering cannot scaffold until this is decided. There is no middle ground that satisfies both. |
| OQ-2 | **Admin UI: Native WordPress or custom design system?** | Native WordPress UI. Future-proof against WP 6.6+ breaking custom admin themes. Users install plugins to solve problems in 10 seconds, not admire pixels. Byte count matters. | Custom UI system. WordPress admin is a "design war crime." In a sea of gray boxes, beauty is credibility and the only moat engineering cannot copy. The user should smile when they see the dashboard. | If Steve wins, every major WP update becomes a regression test. If Elon wins, the product risks indifference in a crowded AI plugin market. |
| OQ-3 | **Product name: WIS or rebrand?** | Keep "WordPress Intelligence Suite" for v1. Rebranding to NEXUS/SPARK requires trademark search, domain acquisition, and .org review queue reset — 2-4 weeks of zero-value work. Fix the .org description instead. | "WordPress Intelligence Suite" is six syllables of corporate white noise. One word only. NEXUS or SPARK. Burn the acronym. Burn the word "Suite." | Recommendation: Keep WIS as the slug and directory name for v1 to preserve .org momentum. Use Steve's one-word concept as the **customer-facing brand name** in the plugin header and .org description. Rebrand the slug later if the concept proves traction. |
| OQ-4 | **Dashboard structure: Unified or separate menus?** | Separate plugin menus under wp-admin. No unified dashboard querying three tables on every admin load (N+1 postmeta lookups without indexes). | One unified dashboard. One cockpit. Fragmentation is death. | Locked to OQ-1. If three plugins, separate menus is the logical outcome. If one product, a unified admin page is required. |
| OQ-5 | **FAQ content: Hand-written or lazy AI generation?** | Ship 5 hand-written FAQ templates per vertical today. No LLM dependency in v1. | Lazy generation with a brilliant loading state. The user opens the dashboard and sees a confident animation while the AI works. Smart magic, not no magic. | Steve conceded the activation-time scrape. Both agree on lazy loading. The dispute is whether v1 includes any LLM generation at all, or purely static templates with AI deferred to v2. |
| OQ-6 | **Licensing mechanism** | Constants file + option flag. No Freemius SDK (rate limits at scale, integration debt). Possibly a simple license key field. | (Not explicitly addressed) | If no Freemius, how does license validation work? Manual honor-system? Self-hosted validation API? This needs an engineering decision before Stripe integration can be wired. |

---

## MVP Feature Set (What Ships in v1)

The v1 is the **intersection of both visions** — what Elon will build and Steve will allow into the world.

### In
1. **WordPress.org distribution package** — readme.txt, banner, screenshots, plugin header
2. **Plugin activation with zero errors** — no white screens on shared hosting
3. **Pre-seeded defaults at activation** — no blank slate, no wizard
4. **LocalGenius** — a visitor-facing FAQ/chat module (static templates for v1)
5. **Dash** — a team tracking / notes module
6. **Pinned** — an agreements / memory module
7. **Tier gating** — free vs. pro differentiation via constants + database option
8. **Stripe Checkout link** — one payment URL, not a billing portal
9. **Hard usage limits** — technically enforced caps on free-tier usage
10. **One contextual tooltip** — single warm onboarding moment, not a wizard
11. **WP-CLI compatibility** — `wp wis activate` for agency/power-user workflows

### Out (Explicitly Killed)
- Template marketplace
- Agency white-label / cross-site dashboard
- Onboarding wizard
- AI LLM calls during activation
- Full Stripe billing engine (subscriptions, webhooks, proration)
- Anonymous analytics / data flywheel
- Upgrade billboards / dashboard ads
- Annual billing as product copy
- Freemius SDK (deferred pending licensing mechanism decision)

### Maybe (Depends on Open Questions)
- LLM-generated FAQ content (OQ-5)
- Custom admin CSS framework (OQ-2)
- Unified dashboard page (OQ-1, OQ-4)

---

## File Structure

> **Note:** File structure branches on OQ-1 (Architecture). Both paths are documented below. The Build Lead must pick one before scaffolding.

### Path A: Elon's Decoupled Architecture (Three Plugins)
```
wp-intelligence-suite/
├── wis-core/                       # Shared constants + tier logic
│   ├── wis-core.php
│   ├── includes/class-tier.php     # get_option('wis_tier') + feature gates
│   └── assets/
├── localgenius/                    # Visitor FAQ/chat widget
│   ├── localgenius.php
│   ├── includes/
│   ├── public/css/
│   ├── public/js/
│   └── templates/
├── dash/                           # Team tracking
│   ├── dash.php
│   ├── includes/
│   ├── admin/
│   └── assets/
├── pinned/                         # Agreements / memory
│   ├── pinned.php
│   ├── includes/
│   ├── admin/
│   └── assets/
└── org-assets/
    ├── readme.txt
    ├── banner-772x250.png
    └── screenshot-1.png
```

### Path B: Steve's Unified Architecture (One Plugin)
```
wp-intelligence-suite/
├── wp-intelligence-suite.php       # Main plugin file
├── includes/
│   ├── class-core.php              # Loader + tier logic
│   ├── class-localgenius.php
│   ├── class-dash.php
│   └── class-pinned.php
├── admin/                          # Custom UI (if OQ-2 resolves to Steve)
│   ├── css/
│   ├── js/
│   └── views/
├── public/                         # Visitor-facing widget
│   ├── css/
│   ├── js/
│   └── templates/
├── languages/
├── org-assets/
│   ├── readme.txt
│   ├── banner-772x250.png
│   └── screenshot-1.png
└── wp-cli/
    └── class-wis-cli.php
```

### Shared Regardless of Path
- `readme.txt` optimized for .org SEO and conversion (Steve's copy, Elon's distribution strategy)
- `composer.json` (optional) — do not introduce build steps unless absolutely necessary
- `phpunit.xml` — test coverage for tier gating and activation routines
- `.github/workflows/` — CI for PHP linting and WordPress Coding Standards

---

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation / Owner |
|----|------|------------|--------|-------------------|
| R-1 | **Shared hosting fragility** — PHP 5.6-8.3 matrix, 30s timeouts, 128MB memory limits | High | High | Zero external API calls at activation. Lazy-load everything heavy. Test on cheapest shared host before .org submission. |
| R-2 | **AI inference cost explosion** — Free tier limits bypassed or set too high | Medium | Critical | Hard limits enforced in code, not TOS. Count every API call. If using LLM, rate-limit per site. |
| R-3 | **WordPress.org review delays** — Plugin rejected or stuck in queue | Medium | Medium | Follow .org guidelines exactly. No obfuscation. No phoning home. Submit early; queue is unpredictable. |
| R-4 | **Support burden outpaces revenue** — 3 plugins/features × WP hosting matrix = ticket avalanche | High | High | $99/yr price point minimum. No live chat support. Documentation-first support strategy. |
| R-5 | **GDPR / compliance exposure** — Scraping + LLM without explicit consent | Medium | High | Do not scrape on activation. If lazy-loading, require explicit user consent before first LLM call. EU law is not a suggestion. |
| R-6 | **Architecture deadlock** — OQ-1 unresolved when build starts | High | Critical | Phil Jackson resolves within 24 hours. If no consensus, Elon's architecture wins for v1 (ship fast), Steve's vision becomes v2 north star. |
| R-7 | **Custom UI breaking on WP updates** | Medium (if Steve wins) | Medium | If custom admin UI ships, budget 20% of sprint time for WP update regression testing. Future-proofing is not free. |
| R-8 | **Conversion failure** — <5% of free users upgrade after 1,000 installs | Medium | Critical | The entire unit economics model depends on 5% conversion at $99/yr. If conversion fails, neither beauty nor engineering saves the product. Monitor from day one. |
| R-9 | **Stripe Checkout friction** — No self-service downgrade, proration, or invoice access | Medium | Medium | Acceptable for v1. Budget support time for manual billing requests. Build self-service portal in v2. |
| R-10 | **Naming confusion** — Slug says WIS, brand says NEXUS, users search wrong term | Low | Low | Pick one public-facing name for .org and stick to it. Do not A/B test the plugin name. |

---

## Build Phase Mandate

1. **Resolve OQ-1 and OQ-2 before writing a single class.** Architecture and UI philosophy determine every file that follows.
2. **Ship the intersection.** If a feature is not in both Elon's and Steve's v1, it does not ship.
3. **Optimize for the first 30 seconds.** Everything that happens before the user feels competence is waste.
4. **Build for .org review from line one.** The review queue is your real launch gate.
5. **Test on the worst host you can find.** If it survives Bluehost basic, it survives the market.

*"The strength of the team is each member. The strength of each member is the team."*
