# AgentPress v1 — Locked Decisions

**Orchestrator:** Phil Jackson, Great Minds Agency
**Round concluded:** 2026-05-03
**Status:** Blueprint for build phase. No further debate. Execute what is written.

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name:** AgentPress. One word. Zero suffixes. | Steve | Steve (unanimous) | "It sounds like something that *does* something." Elon conceded outright. No "Pro", no "Suite", no "AI" appended. The name is the product. |
| 2 | **Router architecture stays.** | Steve | Steve (with Elon's graft) | The orchestration layer is the soul. "The product is one mind, not a bag of tools." However, Elon's performance optimization is adopted: local PHP keyword maps for the built-in trio short-circuit the LLM call on obvious tasks (`str_contains($intent, 'image')` → image_generator). Claude routing reserved strictly for ambiguous input and third-party agents. |
| 3 | **Admin UI: one crafted screen.** | Steve | Steve | "Minimal does not mean ugly." One settings page, no tabs, no wizards, no manual runner textarea — but also no raw `<table class="form-table">` hell. Native WordPress structure elevated with sparse, confident styling. The dashboard exists to reassure, not to demand attention. |
| 4 | **Two agents ship; three max.** | Elon / Steve (converged) | Consensus | ContentWriter and ImageGenerator are the wedge. Room for a third agent only if it ships without bloat. SEOMeta is dead — "commodity battlefield owned by Yoast and RankMath." Everything else is v2 paint. |
| 5 | **Kill the manual task runner UI.** | Elon | Consensus | Both minds agreed: a textarea with a "Run" button is "scope creep wearing a lab coat." Test against the REST endpoint with cURL or Postman. The REST endpoint is the only interface that matters. |
| 6 | **API key storage: standard options or `wp-config.php` constants.** | Elon | Elon | `wp_hash` + `base64_encode` is security theater. Steve never defended pseudo-encryption. If the server is compromised, theater breaks in 30 seconds. Clean, honest storage. |
| 7 | **CPT-based memory (activity logs + capability registry) stays.** | Steve | Steve | "A product without memory is a product without accountability." Users need to see what their colleague did at 3 AM. Logs are trust. Flat files are invisible to WordPress admins who expect a dashboard heartbeat. Elon's DB-bloat warning is noted and mitigated in the risk register. |
| 8 | **Developer API and SaaS tiers are v2.** | Elon / Steve (converged) | Consensus | "Developer API is a v2 distribution multiplier, not a v1 hook." No billing dashboards, no "Pro" badges, no SaaS tiers in v1. |
| 9 | **Front-end chat UI: NO.** | Steve | Consensus | "WordPress already has an interface; it's called the REST API." No chat widgets, no onboarding wizards, no real-time streaming in MVP. |
| 10 | **Brand voice: master craftsman.** | Steve | Steve (unanimous) | Confident. Sparse. Every word earns its place. If a sentence could live on a Salesforce landing page, delete it. The README is three paragraphs. The demo does the talking. |
| 11 | **Scaling architecture deferred.** | Steve | Steve for v1; Elon logged | Async queues, BYOK keys, flat-file logs — all architecturally correct and product-wise premature. "Build for the 1x." Elon's scaling warnings are carried in the risk register as v2 triggers. |
| 12 | **JSON parser hardening is non-negotiable.** | Elon | Consensus | Edge cases (markdown fences, truncated responses, hallucinated slugs) will sink the entire pipeline if not budgeted. 30 minutes minimum for parser hardening. |

---

## MVP Feature Set (What Ships in v1)

### Core
- **Single REST endpoint** — accepts human-language intent, returns executed result. Primary interface.
- **Router layer** — orchestrates agents. Local PHP keyword map for built-in trio; Claude fallback for ambiguity.
- **ContentWriter agent** — generates prose from intent. The killer wedge.
- **ImageGenerator agent** — generates featured images/media from intent.
- **Activity Log (CPT)** — timestamped record of every task, agent used, and result. Visible in wp-admin.
- **Capability Registry** — registers built-in and third-party agent capabilities. CPT-based for persistence.

### Admin
- **One settings screen** — API key configuration, activity log viewer, minimal status indicators.
- **Crafted but native** — uses WordPress form-table and meta-box patterns, elevated with tight spacing and precise typography. No custom CSS frameworks. No tabs.

### What Is NOT in v1
- SEOMeta agent
- Manual task runner textarea/UI
- Onboarding wizard
- Front-end chat interface
- Developer API / third-party registration hooks
- SaaS tiers, billing, "Pro" badges
- Real-time streaming
- Async queue / background processing
- BYOK (bring-your-own-key) model
- Encrypted API key storage theater

---

## File Structure (What Gets Built)

```
agentpress/
├── agentpress.php              # Main plugin file. Bootstrap, constants, loader.
├── includes/
│   ├── class-router.php        # Orchestration layer. Local keyword map + Claude fallback.
│   ├── class-rest-api.php      # Single endpoint. Intent in, result out.
│   ├── class-agents.php        # Agent base class + capability registry loader.
│   ├── class-logger.php        # CPT activity log. Write on task complete. Read in admin.
│   ├── class-parser.php        # JSON / markdown fence hardening. No pipeline collapse.
│   └── agents/
│       ├── class-content-writer.php
│       ├── class-image-generator.php
│       └── class-agent-third.php       # Reserved slot. Ships only if zero bloat.
├── admin/
│   ├── class-admin.php         # One screen: settings + log viewer.
│   └── css/
│       └── agentpress-admin.css  # Minimal. Tight. Native-but-elevated.
└── readme.txt                  # Three paragraphs. Demo does the talking.
```

**Build discipline:** One session. Aggressive scope enforcement. If a file isn't on this list, it doesn't get created.

---

## Open Questions (Needs Resolution Before Code)

1. **Third agent identity.** Slot is reserved. What fills it? If undefined by build kickoff, the slot stays empty. No default.
2. **Local keyword map exact scope.** Which keywords trigger ContentWriter vs ImageGenerator? Needs a locked whitelist before REST endpoint goes live.
3. **Admin page visual language.** "Crafted but native" needs a style guide or mock. Where is the line between "server config panel" and "tuxedo at a barbecue"?
4. **Activity log CPT schema.** What post-meta fields? What retention / prune policy? Elon flagged 500 as a pain point.
5. **Image handling flow.** Generated images stored in Media Library? Custom directory? What about shared-hosting file limits and timeouts?
6. **Parser hardening strategy.** JSON schema validation? JSON5? Regex stripping of markdown fences? Needs a concrete approach, not just a budget line.
7. **Error surfaced to user vs. logged silently.** When Claude fails or parser chokes, what does the REST endpoint return? JSON error shape needs definition.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Owner | Mitigation |
|------|------------|--------|-------|------------|
| **JSON parsing collapses pipeline** | High | Critical | Builder | Budget 30 min for parser hardening. Test with markdown-fenced responses, truncated JSON, and hallucinated slugs before any other feature. |
| **Built-in keyword map misses intent** | Medium | High | Builder | Fallback to Claude must exist. If local map fails, user waits 4–8s. Monitor miss rate; if >10%, expand whitelist or retrain local map. |
| **CPT logging strains shared hosting** | Medium | High | Builder | Every task writes a post + meta. Under concurrent load, cheap hosts will choke. Mitigate: keep meta minimal, no auto-save, no revisions. |
| **Claude API rate limits / pricing shock** | Medium | High | Product | Single vendor dependency. v1 uses shared/site key. If site volume spikes, external API degrades experience. v2 trigger: implement BYOK when daily tasks exceed 500. |
| **WordPress.org rejection** | Low | High | Distribution | Plugins dependent on external AI APIs face TOS and review scrutiny. Ensure readme discloses API usage. Prepare for extended review queue. |
| **Third agent scope creep** | Medium | Medium | Zen Master | Undefined slot invites "just one more feature." Rule: if it adds a file, a setting, or an option, it doesn't ship in v1. |
| **Image generation timeout / memory** | Medium | Medium | Builder | Shared hosts with 30s PHP limits and 64MB memory will fail on large image generation. Need fallback: external generation + URL return? Size limits? |
| **Admin UI falls into the ugly-premium gap** | Medium | Medium | Design | Too designed = alien to wp-admin. Too raw = commodity shareware. The crafted/native balance needs review before merge. |
| **Revenue model undefined for v2** | Low | Medium | Product | v1 has no monetization. If organic growth stalls, runway matters. BYOK + hosted routing SaaS is the likely v2 model, but unproven. |

---

## Final Word from the Zen Master

> "The strength of the team is each individual member. The strength of each member is the team."

Elon won on speed, cost, and technical honesty. Steve won on soul, taste, and the reason to care. The blueprint above is not a compromise — it is a championship rotation. Elon's keyword map guards the baseline. Steve's router runs the offense. Both agree on what matters: the first 30 seconds must feel like snapping your fingers and watching the lights obey.

Build exactly what is written. No more. No less. The triangle offense only works when every player knows their spot.

**Locked. Non-negotiable. Execute.**
