# Relay — Build Blueprint
## Consolidated Decisions, MVP Scope & Risk Register
*Orchestrator: Phil Jackson (The Zen Master)*
*Source: essence.md | round-1-elon.md | round-1-steve.md | round-2-elon.md | round-2-steve.md*

---

## Locked Decisions

These choices carry consensus or a conceded winner. They are non-negotiable for v1.

| # | Decision | Proposed By | Winner | Why It Stands |
|---|----------|-------------|--------|---------------|
| 1 | **Product Name: Relay** | Steve | Steve | One-word verb and promise. "You don't buy 'iPhone Advanced Communication Device' — you buy iPhone." Both sides adopted it unanimously. |
| 2 | **Architecture: Direct PHP-to-Claude via `wp_remote_post`** | Elon | Elon | Steve conceded: "Cut it. Call Claude from PHP directly... But architect the API boundary cleanly so we can insert a Worker later." Eliminates 75K tokens, one deployment target, and one network hop. |
| 3 | **Processing Model: Async Classification** | Elon | Elon | Steve conceded: "He's absolutely right." Store submission instantly, return 200 OK in <100ms, classify in background via WP Cron. Synchronous 2–3s Claude latency kills conversion. |
| 4 | **Feature Cut: No Gutenberg Block** | Elon (explicit); Steve (via "NO to feature creep") | Consensus | Contact Form 7 and Gravity Forms exist. Relay handles what happens AFTER the form. Building another form builder is scope creep. |
| 5 | **Feature Cut: No CSV Export in v1** | Elon; Steve (explicit "NO") | Consensus | Copy-paste the table. Scope discipline per the scalpel philosophy. |
| 6 | **Feature Cut: No AI Reply Draft in v1** | Elon | Elon / Consensus | Nobody asked for it. v2 feature only if core routing is flawless. |
| 7 | **Feature Cut: No Slack Routing in v1** | Steve | Steve / Consensus | Core routing must be flawless before adding channels. "NO to every checkbox that turns Relay into a Swiss Army knife." |
| 8 | **Distribution: Target WordPress Agencies First** | Elon | Elon | Steve conceded agency channel is leverage. One agency × 50 sites. 200 agencies = 10,000 users. Build for the installer, not the SMB end-user. Direct SMB case studies still required to recruit agencies. |
| 9 | **Setup Philosophy: Zero Setup Wizard** | Steve | Steve / Consensus | Elon agreed: "No setup wizard... aligns perfectly with a dead-simple PHP plugin." Install, enter API key, submit a form, see a living classified lead. |
| 10 | **Design Philosophy: Scalpel, Not Swiss Army Knife** | Steve | Steve / Consensus | Elon agreed on ruthless feature cutting. "Ship one thing that works magically, not ten things that work adequately." When in doubt, remove. |
| 11 | **Scaling Guardrail: Classification Caching (Day 1)** | Elon | Elon / Consensus | Steve agreed: "We need classification caching from day one — don't re-classify 'unsubscribe' or 'spam' ten thousand times." Hash-based deduplication required to survive agency scale. |
| 12 | **Monetization Path: SaaS Pricing Per Classification at Scale** | Elon | Elon / Consensus | Steve agreed: "SaaS pricing per classification is the only sane path at 100x." 200K classifications/day ≈ $600/day at Claude 3.5 Sonnet rates without tiered pricing. |
| 13 | **Brand Voice: Confident Human Clarity** | Steve | Steve / Consensus | "This one goes to Sales. This one is spam. Done." No buzzwords, no whitepaper prose. Short sentences. Confident, human clarity. |
| 14 | **Emotional Requirement: Peace of Mind / Control** | essence.md + Steve | Steve / Consensus | "End of inbox dread." Every submission visible, classified, impossible to ignore. The first 30 seconds must feel like relief, not setup labor. |

---

## MVP Feature Set (What Ships in v1)

Based strictly on locked decisions above. If a feature is not listed here, it is explicitly cut.

1. **Form Interception Engine**
   - Hooks into existing WordPress form plugins (Contact Form 7, Gravity Forms, generic `admin_post` / REST hook).
   - Catches every submission before it hits the inbox abyss.

2. **Instant Storage & Acknowledge**
   - Stores submission metadata + content locally.
   - Returns 200 OK to the visitor in <100ms (no Claude blocking).

3. **Async Classification Pipeline**
   - WP Cron job sends submission to Claude API via `wp_remote_post`.
   - Receives category + urgency classification.
   - Updates stored lead with classification result.

4. **Classification Taxonomy (Minimal)**
   - Categories: `Sales`, `Support`, `Spam`, `General`.
   - Urgency: `High`, `Medium`, `Low`.
   - Stored as post-meta or taxonomy terms on a custom post type.

5. **Admin Command Center — Inbox View**
   - Displays classified leads with color-coded badges (Sales, Urgency, etc.).
   - One-click reply action.
   - Sort/filter by category and urgency.
   - *Rendering layer: see Open Question #1 — this is the unresolved tension.*

6. **Classification Cache**
   - Hash-based deduplication: identical submissions (subject + body hash) do not trigger redundant Claude calls.
   - TTL or invalidation strategy TBD.

7. **Settings Page**
   - Claude API key input (with encryption-at-rest recommendation).
   - Optional: enable/disable form integrations.
   - No 47 preferences. One screen.

8. **Shared-Hosting Compatibility**
   - PHP 7.4+ with zero exotic extensions.
   - No Node.js build step for core plugin.
   - Graceful failure: if Claude is down, store raw submission and surface a retry action.

---

## File Structure (What Gets Built)

Reflects the **locked** constraints: pure PHP plugin, no Worker, no build step for backend, async via WP Cron.

```
relay/
├── relay.php                          # Main plugin file: headers, activation hook
├── includes/
│   ├── class-relay.php                # Main controller / loader
│   ├── class-form-handler.php         # Intercept CF7 / GF / generic submissions
│   ├── class-claude-client.php        # wp_remote_post wrapper + retry logic
│   ├── class-storage.php              # Custom Post Type (Lead) + meta registration
│   ├── class-async-processor.php      # WP Cron hook: classify pending leads
│   ├── class-cache.php                # Hash-based classification cache
│   └── class-admin.php                # Menu registration, enqueue assets, caps
├── admin/
│   ├── views/
│   │   ├── inbox.php                  # Admin inbox render (PHP — TBD if React)
│   │   └── settings.php               # API key + integration toggles
│   ├── css/
│   │   └── relay-admin.css            # Color-coded badges, calm command center aesthetic
│   └── js/
│       └── relay-admin.js             # Vanilla JS: sort toggles, one-click reply, AJAX polling
├── assets/
│   └── relay-badge.svg                # Brand mark for wp-admin menu
├── languages/                         # i18n stubs (.pot)
└── readme.txt                         # WP.org readiness + agency install pitch
```

**Notes on structure:**
- `admin/views/inbox.php` is the contested zone. See Open Question #1.
- If the React command center wins, add `src/`, `build/`, and `package.json` to the root and replace `admin/views/inbox.php` with an app shell.
- If WP_List_Table wins, `admin/views/inbox.php` becomes a `WP_List_Table` subclass with custom CSS injected for color-coded badges.

---

## Open Questions (What Still Needs Resolution)

These block implementation detail. Resolve before cutting code.

### 1. Admin Inbox Rendering Layer — REACT vs PHP
**The central unresolved conflict. Both debaters made this their #1 non-negotiable.**

- **Elon's position:** `WP_List_Table` or custom PHP render. Zero React. Zero Webpack. Zero build step. If it needs a build step, it doesn't ship in v1. Shared hosting is the reality for 90% of WordPress.
- **Steve's position:** The React command center stays. `WP_List_Table` is "bureaucratic sludge." The feeling of control lives or dies in the first glance. "You cannot inspire peace of mind with a SQL table."

**Phil Jackson Tie-Breaker Recommendation:**
> Ship a PHP-rendered inbox with heavily customized CSS and vanilla JS for v1. It must feel *alive* (color-coded badges, smooth state transitions, heartbeat AJAX polling) but without a React build pipeline. This preserves Steve's emotional promise within Elon's feasibility constraint. Schedule a React rebuild for v2 once 50+ agency installs validate demand and revenue exists to fund frontend engineering.

**Action Required:** Build agent or product owner must confirm this tie-breaker before writing the first view file.

### 2. Data Storage: Custom Post Type vs Custom Database Table
- CPT is standard, auto-handles revisions/permissions, but bloats `wp_posts` at 200K entries/day.
- Custom table is cleaner for high-volume structured data but requires manual CRUD and migration logic.
- **Status:** Needs architectural lock. Recommend CPT for v1 (fastest to build, WP-native), with a v2 migration path if the SaaS tier demands it.

### 3. Form Plugin Integration Priority
- Locked: use existing forms. Unlocked: which plugin gets the first hook?
- **Status:** Recommend Contact Form 7 (widest free install base) + one generic `admin_post` / REST handler for custom HTML forms. Gravity Forms hook is v1.1.

### 4. Real-Time Admin Updates Mechanism
- Steve wants heartbeat or AJAX polling so the inbox feels alive as classifications complete.
- Elon warns polling is another failure mode on cheap hosting.
- **Status:** If PHP inbox wins, simple 30s AJAX polling is acceptable. If React wins, polling is mandatory. Define polling interval and backoff strategy.

### 5. Classification Taxonomy Exact Schema
- Locked: categories + urgency. Unlocked: exact labels, colors, and whether taxonomy is hierarchical.
- **Status:** Need hex codes and label copy locked before CSS is written.

---

## Risk Register

| # | Risk | Severity | Probability | Mitigation | Owner |
|---|------|----------|-------------|------------|-------|
| 1 | **Token Budget Overrun / Shipping Failure** | Critical | High | React inbox + Webpack debugging consumes 150K+ tokens. Hard ceiling: allocate max 40% of session tokens to the inbox layer. If it exceeds, auto-revert to PHP-rendered. | Build Agent |
| 2 | **Shared Hosting Incompatibility** | Critical | Medium | Test on cheapest shared host (Bluehost/HostGator). Keep PHP 7.4+, no exotic extensions. Provide fallback manual "Classify Now" button if WP Cron is disabled. | QA / Build Agent |
| 3 | **Async UX = "Dead Lead" Gap** | High | High | User submits form, sees "Unclassified" for minutes until cron fires. Kills Steve's 30-second magic. **Mitigation:** Fire an inline optimistic classification with a 500ms timeout on form submit; if it fails, fall back to async. Or trigger `spawn_cron` immediately on submission event. | UX / Build Agent |
| 4 | **Claude API Cost at Scale** | Critical | Low (now) / High (later) | 200K classifications/day ≈ $600/day. Caching ships v1. Architect SaaS metering hooks from day one (option table counters + upgrade path to external billing). | Architect |
| 5 | **Agency Distribution Fantasy** | High | Medium | 200 agencies is a channel hypothesis, not a guarantee. **Mitigation:** Build 5–10 direct SMB case studies first. Use those testimonials to recruit agency partners. Do not bet 100% on B2B2C. | GTM / Relay |
| 6 | **Form Plugin Fragmentation** | Medium | High | Supporting CF7, GF, WPForms, Ninja Forms creates N integration paths. **Mitigation:** Ship CF7 + generic hook in v1. Add premium integrations based on usage telemetry (if ethical) or support requests. | Product |
| 7 | **API Key Exposure on Shared Hosting** | High | Medium | Key stored in `wp_options` on multi-tenant or poorly secured hosts. **Mitigation:** Encrypt at rest (openssl). Recommend `wp-config.php` define only — UI settings page warns if key is writable via DB. Never log the key. | Security |
| 8 | **Brand Promise vs Technical Reality Gap** | High | Medium | Steve promises "peace of mind." If the plugin breaks on cheap hosts or loses a submission, trust evaporates. **Mitigation:** Never drop a lead. If Claude fails, store raw submission and surface an admin notice. Every failure path must end with the lead preserved. | QA |
| 9 | **WP Cron Reliability** | High | Medium | Budget hosts disable or throttle cron. Classifications never fire. **Mitigation:** Add a server-side cron option in docs. Admin UI shows "Pending classifications" count with manual "Process Now" button. | Build Agent |
| 10 | **Heartbleed / Dependency Rot** | Medium | Low | No external JS build dependencies mitigates this for v1. If React is introduced later, lock `package.json` versions and audit quarterly. | Architect |

---

## Final Word from the Zen Master

> "The strength of the team is each individual member. The strength of each member is the team."
>
> Elon shipped us feasibility and survival. Steve shipped us the reason to survive. The blueprint above keeps both truths in tension where it belongs — and resolves it where the build phase cannot afford ambiguity.
>
> **The one thing that cannot happen:** we ship neither a cathedral nor a food truck because we debated the menu until sundown. Lock the inbox decision in the first 15 minutes of build phase, or the session dies here.
