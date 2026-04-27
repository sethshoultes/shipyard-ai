# PRD: WordPress Intelligence Suite

**Author:** Phil Jackson (via IMPROVE Cycle 2026-04-24)
**Status:** Ready for Pipeline
**Priority:** P1
**Estimated Tokens:** 750K–1M (Standard Site complexity)

---

## Problem Statement

Shipyard AI has shipped three WordPress plugins — Dash (command palette), Pinned (team sticky notes), and LocalGenius Lite (AI marketing widget) — with zero monetization strategy. Each plugin is currently free, standalone, and invisible to the other two.

**The cost:**
1. **Revenue abandonment.** Three products with real utility generate $0 ARR.
2. **Plugin graveyard syndrome.** Free plugins without onboarding or retention hooks are installed once and forgotten. Dash has no "Press Cmd+K" tooltip. Pinned has no seed note. LocalGenius Lite has no auto-configuration.
3. **Missed data flywheel.** Dash search analytics, Pinned team workflows, and LocalGenius FAQ interactions never inform each other — or Shipyard's product roadmap.
4. **Distribution failure.** Three individual free plugins cannot afford promotion. One paid suite can.

**Board Verdict (Buffett):** *"Three free plugins are three liabilities. One bundle is an asset."*
**Board Verdict (Jensen):** *"Dash search analytics should inform LocalGenius. That's the data flywheel."*

---

## Proposed Solution

Launch the **WordPress Intelligence Suite** — a unified plugin ecosystem that bundles Dash, Pinned, and LocalGenius Lite into a single installable product with shared onboarding, cross-plugin intelligence, and clear upgrade paths.

### Tier Structure

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Dash basic command palette, Pinned single-user notes, LocalGenius Lite widget (up to 50 AI responses/month) |
| **Pro** | $99/year | Full Dash analytics + custom commands, Pinned team sync + Slack integration, LocalGenius Lite unlimited responses + priority support |
| **Agency** | $199/year | Everything in Pro, unlimited sites, white-label, template marketplace access, cross-site dashboard |

### Product Architecture

```
wordpress-intelligence-suite/
├── intelligence-suite.php          # Main plugin file (loader + license manager)
├── includes/
│   ├── class-suite-manager.php   # Feature toggles, tier enforcement
│   ├── class-onboarding.php      # Unified 3-minute wizard
│   ├── class-analytics.php       # Cross-plugin usage dashboard
│   └── class-licensing.php       # Freemius or EDD integration
├── dash/                           # Dash submodule
├── pinned/                         # Pinned submodule
├── localgenius-lite/               # LocalGenius Lite submodule
├── assets/
│   ├── css/                        # Shared design system (CSS variables)
│   └── js/                         # Shared onboarding + analytics
└── templates/                      # Agency onboarding templates
```

---

## Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | Unified Plugin Loader | One install activates all three capabilities. Users can toggle features on/off. | Must-have |
| 2 | 3-Minute Onboarding Wizard | Step 1: Detect business type → auto-configure LocalGenius. Step 2: Show Cmd+K demo → activate Dash. Step 3: Create seed note + team invite → activate Pinned. | Must-have |
| 3 | Shared Admin Dashboard | Single "Intelligence" page in wp-admin showing: Dash usage stats, Pinned team activity, LocalGenius widget preview, upgrade prompts. | Must-have |
| 4 | Cross-Promotion Engine | Natural upgrade triggers: Dash footer shows "Want analytics? Upgrade." Pinned @mentions show "Want team sync? Upgrade." LocalGenius Lite shows "50 responses used. Upgrade for unlimited." | Must-have |
| 5 | Dash Pro Analytics | Command usage dashboard, time-saved counter, custom commands API, multi-site sync. | Must-have |
| 6 | Pinned Team Tier | Cross-site note sync, Slack integration, team analytics (notes created/resolved, top contributors), template library. | Must-have |
| 7 | Agency License | Unlimited sites, white-label branding (remove "Powered by"), template marketplace (buy/sell onboarding templates), cross-site admin dashboard. | Must-have |
| 8 | LocalGenius Lite Activation | Auto-detect business info from site content. Pre-populate 20 FAQs by category. Show live widget preview. | Must-have |
| 9 | Annual Billing Only | Stripe annual subscription. No monthly churn risk. $99/year or $199/year. | Must-have |
| 10 | Template Marketplace | 5 seed templates (Client Handoff, Campaign Launch, Monthly Maintenance, Content Calendar, Bug Triage). Agency tier can create/sell custom templates. | Nice-to-have |
| 11 | Usage Data Flywheel | Opt-in anonymous analytics: Dash search terms inform LocalGenius feature priorities; Pinned team patterns inform Shipyard plugin roadmap. | Nice-to-have |

---

## Feature Details

### 3-Minute Onboarding Wizard

**Step 1: Business Detection (60 seconds)**
- Scrape site title, schema.org data, footer text
- Detect business category (restaurant, dental, retail, services)
- Auto-generate 20 FAQs based on category
- User reviews and confirms — no blank slate

**Step 2: Power User Demo (60 seconds)**
- Highlighted tooltip: "Press Cmd+K to try Dash"
- Interactive search: "Type 'posts' to find Posts"
- Show recent items personalization

**Step 3: Team Setup (60 seconds)**
- Pre-load seed note: "Welcome to Pinned! Try @mentioning a teammate."
- Pre-populate checkbox: "Update homepage hero image"
- Invite team members via email

### Shared Admin Dashboard

Single wp-admin page: **Intelligence → Overview**

| Widget | Data |
|--------|------|
| Dash Stats | Commands this week, time saved, top searches, next milestone |
| Pinned Activity | Open notes, recent @mentions, team resolution streak, overdue alerts |
| LocalGenius Preview | Live widget preview, responses used / remaining, recent conversations |
| Upgrade Card | Contextual: "You're using 78% of your free responses. Upgrade for unlimited." |

### Cross-Promotion Engine

Upgrade triggers appear at natural friction points, not as banners:
- Dash: After 50th command → "You've used Dash 50 times. See your full analytics with Pro."
- Pinned: After first @mention → "Team sync available in Pro. Keep notes across all your sites."
- LocalGenius: At 45/50 responses → "5 responses left. Upgrade to Pro for unlimited AI."

---

## Design Direction

**Brand:** WordPress Intelligence Suite
**Colors:** Use existing plugin palettes unified under one system:
- Primary: `#1e1e1e` (WordPress admin charcoal)
- Accent: `#2271b1` (WordPress blue)
- Success: `#00a32a` (WordPress green)
- Warning: `#dba617` (WordPress yellow)

**Typography:** System fonts — `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`. No external fonts.

**Reference:** WordPress native admin UI. The suite should feel like WordPress built it, not like a third-party overlay.

---

## Integrations

- [x] Stripe (annual billing)
- [x] Freemius or Easy Digital Downloads (licensing + updates)
- [x] Slack webhook (Pinned Team tier)
- [x] WordPress native settings API
- [x] Optional: WordPress.org free version (Lite) for distribution

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Free installs | 500 | 90 days |
| Free → Pro conversion | 5% | 90 days |
| Agency licenses | 50 | 90 days |
| ARR from suite | $25,000 | 12 months |
| Dash activation rate | 60% of installs show first-use tooltip | 30 days |
| Pinned team activation | 40% of installs create first note within 7 days | 30 days |
| LocalGenius auto-config | 80% of installs complete wizard | 30 days |

---

## Must-Haves vs. Nice-to-Haves

**Must-Haves (will not ship without):**
1. Unified plugin loader with feature toggles
2. 3-minute onboarding wizard with auto-detection
3. Shared admin dashboard
4. Stripe annual billing integration
5. Dash Pro analytics + custom commands
6. Pinned team sync + template library
7. Agency license with white-label
8. LocalGenius Lite auto-configuration

**Nice-to-Haves (only if tokens allow):**
1. Template marketplace with buy/sell
2. Usage data flywheel analytics
3. Slack integration
4. WordPress.org Lite distribution

---

## Token Budget

| Item | Tokens |
|------|--------|
| Base: Standard Site (10 pages/features) | 1M |
| Multiplier: Plugin complexity (+20%) | +200K |
| Multiplier: Stripe billing integration (+15%) | +150K |
| Multiplier: Licensing system (+10%) | +100K |
| **Total Budget** | **~1.45M** |
| Revision credits (estimated 2 rounds) | 200K |

**Recommendation:** Scope to 1M tokens by deferring template marketplace and Slack integration to v1.1.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Three plugins in one = bloat | Modular architecture — each submodule can be toggled off. Lite version ships only core. |
| Licensing complexity | Use Freemius SDK. Proven in WordPress ecosystem. |
| Free version cannibalizes Pro | Generous free tier (50 AI responses, single-user Pinned, basic Dash) but clear upgrade triggers at friction points. |
| WordPress.org rejection if too "upselly" | Free version submitted to .org is genuinely useful. Upsells happen in admin dashboard, not frontend. |

---

## Related PRDs

- `localgenius-lite.md` — LocalGenius Lite widget architecture
- `shipyard-client-portal.md` — Licensing/auth patterns (reusable)

---

## Board Sponsorship

- **Buffett:** Primary sponsor — revenue model architect
- **Jensen:** Data flywheel and competitive moat
- **Oprah:** Onboarding clarity and first-5-minutes
- **Shonda:** Retention hooks and narrative arc ("The complete WordPress intelligence stack")

---

*"We didn't build three plugins. We built one suite that happens to ship in three boxes."*
