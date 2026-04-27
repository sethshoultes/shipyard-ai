# Decisions — github-issue-sethshoultes-shipyard-ai-77

## Product Name

**Decision:** "Stage"
**Proposed by:** Steve (Round 1)
**Winner:** Steve — Elon explicitly accepts the name in Round 2 ("Steve, I love the name *Stage*... We are keeping it")
**Why:** One word, one syllable, instant verb. Implies performance, spotlight, the moment the curtain rises. Not "WP Stage." Just **Stage.**

---

## Interactive Demo Sandbox

**Decision:** CUT from v1, return in v2 with proper infrastructure
**Proposed by:** Elon (Round 1)
**Winner:** Elon — Steve concedes in Round 2 ("The containerized sandbox is a separate infrastructure product. V1 ships without live interactivity. I accept that.")
**Why:** Containerized, multi-tenant WP instances require orchestration, security audits, and hosting budget. It is 10x complexity for 2x value. A native-feeling sandbox is a separate SaaS product, not a plugin feature.

---

## Animation Approach

**Decision:** CSS-only transitions, zero JS animation libraries
**Proposed by:** Elon (Round 1 & 2)
**Winner:** Elon — Steve does not contest this directly, though he demands "gasp-worthy" visuals
**Why:** JS animation libraries add 200ms+ render tax and accessibility debt. Motion for motion's sake increases load time. Static HTML with CSS transitions loads in <1s on a $50 Android on 2G.

---

## API Strategy

**Decision:** One WP.org API fetch with 24-hour transient caching. No scraping.
**Proposed by:** Elon (Round 1 & 2)
**Winner:** Elon — Steve concedes ("He is right about API caching—non-negotiable technically")
**Why:** WP.org API latency is 300-800ms with rate limits. Scraping is fragile and breaks when WP.org updates markup. If WP.org does not provide a stable reviews endpoint, testimonials are cut from v1.

---

## Testimonials / Reviews

**Decision:** CUT from v1 unless WP.org provides a stable API endpoint
**Proposed by:** Elon (Round 1 & 2)
**Winner:** Elon — Steve concedes ("He is right that scraping WP.org reviews is fragile and we should cut testimonials from v1 if the API doesn't cooperate")
**Why:** Scraping is scope creep. If the API doesn't provide reviews in a stable format, testimonials are deferred to v2.

---

## Visual Design Standard

**Decision:** Gallery-grade, no beige, no WordPress-admin blue, no "powered by" badges
**Proposed by:** Steve (Round 1 & 2)
**Winner:** Compromise — Elon agrees that design quality matters but limits execution to CSS-only ("Taste in color, typography, and whitespace costs zero performance and delivers exactly the dignity you described")
**Why:** The demo page IS the product, not an accessory. A cheap-looking demo makes the plugin look cheap. Zero configuration means no "choose your template" — the first 30 seconds must feel like magic.

---

## Architecture

**Decision:** WordPress plugin only. No Docker, no Kubernetes, no container orchestration.
**Proposed by:** Elon (Round 1 & 2)
**Winner:** Elon — Steve concedes ("He is right that this must ship as a lean WordPress plugin, not a Kubernetes fever dream")
**Why:** ~500 lines of PHP, ~200 lines of CSS. The plugin directory handles distribution. Our server only handles API refreshes. At 100x scaling, the path is removing server load, not adding to it.

---

## MVP Feature Set (What Ships in v1)

1. **Custom post type** for plugin showcase pages
2. **Settings page** for entering plugin slugs
3. **Frontend template** — static HTML output, no JS frameworks
4. **WP.org API fetch** with 24-hour transient caching
5. **Social preview / OpenGraph tags** for shareable URLs
6. **Zero configuration** — no onboarding wizard, no template picker, no brand color configuration
7. **CSS-only styling** — no beige, no admin blue, no "powered by" badges

---

## File Structure (What Gets Built)

- **~500 lines PHP** — WordPress plugin (custom post type, admin settings, API client, transient caching, template renderer)
- **~200 lines CSS** — Gallery-grade stylesheet, CSS transitions only

---

## Open Questions (Still Needs Resolution)

1. **WP.org reviews endpoint stability** — If no stable API exists for reviews/testimonials, do we ship without them entirely or provide a fallback?
2. **"Gasp-worthy" without JS** — What specific CSS techniques achieve Steve's visual standard within Elon's no-JS-animation constraint? (e.g., subtle spotlight gradients, typographic precision, whitespace discipline)
3. **Share URL format** — What is the exact public URL structure for plugin authors to share? (`/stage/{slug}`? `/showcase/{slug}`?)
