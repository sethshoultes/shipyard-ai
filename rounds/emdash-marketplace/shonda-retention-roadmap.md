# Shonda Retention Roadmap: Wardrobe v1.1

**Author:** Derived from Shonda Rhimes' Board Review
**Date:** April 9, 2026
**Purpose:** What keeps users coming back

---

## The Core Problem

> "Wardrobe is still designed to be a destination, not a habit. Users arrive, browse, install, leave. The product is *efficient* — it solves the problem in 3 seconds. But efficiency is the enemy of engagement."

Wardrobe v1.0 delivers a satisfying one-time transformation. But great products — like great television — make you care about what happens next.

---

## Current State Assessment

| Category | Previous | Current | Notes |
|----------|----------|---------|-------|
| Story Arc | 5/10 | 7/10 | Showcase website, clear transformation moment |
| Retention Hooks | 3/10 | 5/10 | Coming Soon themes, email capture |
| Content Strategy | 3/10 | 5/10 | Good READMEs, but no UGC flywheel |
| Emotional Cliffhangers | 4/10 | 6/10 | 4 upcoming themes with distinct personalities |
| **Overall** | **4/10** | **6/10** | **Pilot with a season order** |

---

## What's Working Now

1. **Coming Soon Themes with Personality Teasers:**
   - Aurora: "For brands that refuse to blend in" — Summer 2026
   - Chronicle: "Stories deserve dignity" — Fall 2026
   - Neon: "The future is now" — Summer 2026
   - Haven: "Home on the internet" — Fall 2026

2. **Email Capture:** "Get notified when new themes drop" with "No spam. Just themes."

3. **"Try Another" Philosophy:** CLI messaging invites experimentation.

4. **Showcase Website:** Visual gallery with screenshots, 3-step installation guide.

---

## What Keeps Users Coming Back

### Tomorrow (Immediate Return)

| Hook | Status | Action |
|------|--------|--------|
| "Try another" philosophy | Exists in CLI | Strengthen post-install |
| Email capture | Implemented | Send actual emails |
| Coming Soon anticipation | 4 themes teased | Communicate specific dates |

### Next Week (Short-Term Return)

| Hook | Status | Action |
|------|--------|--------|
| New theme release notifications | Email exists, no sends | Implement email pipeline |
| Showcase gallery discovery | Not built | v1.1 priority |
| Progress tracking | Not built | v1.2 |

### Next Month (Long-Term Return)

| Hook | Status | Action |
|------|--------|--------|
| Theme updates/changelogs | Not built | v1.1 |
| Community contributions | Not built | v1.2 |
| Seasonal/limited themes | Not conceptualized | v2.0 |

---

## v1.1 Feature Roadmap

### Priority 1: Post-Install Engagement (Retention Critical)

**After `wardrobe install [theme]` completes:**

```
Your site is now wearing Ember.

What's next?
  [1] Show off your site → wardrobe showcase submit
  [2] Get notified about new themes → wardrobe notify
  [3] Try another theme → wardrobe list
```

**New CLI Commands:**
- `wardrobe showcase submit` — Submit your live site URL to the gallery
- `wardrobe notify` — Subscribe to theme release notifications
- `wardrobe progress` — "You've tried 2 of 9 themes. 7 more to discover."

**Why This Matters:**
- Extends the narrative past installation
- Creates multiple paths to ongoing engagement
- Converts one-time users into community participants

---

### Priority 2: Showcase Gallery (Social Proof + Flywheel)

**New Page: `/showcase` on wardrobe.emdash.app**

Content:
- User-submitted sites organized by theme
- Before/after transformations (optional)
- "Sites Wearing Ember" / "Sites Wearing Forge" sections
- Featured site of the week

**Submission Flow:**
1. User runs `wardrobe showcase submit`
2. Prompted for site URL
3. Optional: brief description of site purpose
4. Submission reviewed (automated screenshot capture)
5. Added to public gallery

**The Flywheel (What It Should Be):**
```
User installs theme → User customizes → User shares result →
Other users discover → Those users install → They customize → They share...
```

**Why This Matters:**
- Creates user-generated content
- Social proof for new visitors
- Users return to see if they're featured
- Transformation stories drive conversions

---

### Priority 3: Install Analytics (Social Proof + Insights)

**Display on Showcase Website:**
- Install counts per theme: "1,247 installs"
- Trending indicator: "Ember — trending this week"
- "Most popular" badge on leading theme

**Display in CLI:**
```
wardrobe list

Available Themes:
  ember     Bold editorial design           1,247 installs
  forge     Dark technical theme              892 installs
  slate     Clean professional look         2,103 installs ★ Most Popular
  drift     Minimal and airy                  634 installs
  bloom     Warm community feel               445 installs
```

**Implementation:**
- Anonymous install counter (no PII)
- Simple increment on each `wardrobe install` success
- Display counts in registry.json, refreshed daily

---

### Priority 4: Theme Evolution Communication

**New Content:**
- Changelogs for each theme update
- "What's new in Ember 1.1" announcements
- Roadmap visibility: "Ember dark mode toggle coming Q3"

**New CLI Command:**
```
wardrobe changelog ember

Ember Changelog:
  v1.1.0 (June 2026)
    - Added dark mode toggle
    - Improved mobile navigation
    - New accent color options
  v1.0.0 (April 2026)
    - Initial release
```

**Email Touchpoint:**
- Monthly "Wardrobe Update" email to subscribers
- What's new, what's coming, featured showcase sites

---

### Priority 5: Progress Tracking (Gamification Lite)

**CLI Feature:**
```
wardrobe progress

Your Wardrobe Journey:
  ✓ ember    — Installed April 2026
  ✓ slate    — Installed April 2026
  ○ forge    — Not yet tried
  ○ drift    — Not yet tried
  ○ bloom    — Not yet tried

You've tried 2 of 5 themes. Three more to discover.
Tip: Forge is perfect for developer portfolios.
```

**Why This Matters:**
- Creates completionist motivation
- Surfaces themes user hasn't tried
- Personalizes the experience

---

## v1.2 Features (Future)

1. **Theme Customization Presets** — "Ember with purple accents" saved configs
2. **Community Discord** — Support, customization tips, feature requests
3. **Theme Creator Program** — Third-party designers submit themes with revenue share
4. **Before/After Generator** — Automated comparison images for social sharing
5. **Seasonal Collections** — "Winter 2026 Collection" limited-time themes
6. **Theme Variations** — Ember, Ember Dark, Ember Minimal
7. **Creator Profiles** — "More from this creator" discovery

---

## Retention Metrics to Track

| Metric | Definition | Target |
|--------|------------|--------|
| **Return Rate** | Users who run wardrobe commands 30+ days after first install | > 30% |
| **Theme Exploration** | Average installs per unique user | 2.5 themes |
| **Multi-Theme Users** | Users who install 2+ different themes | > 25% |
| **Email Open Rate** | Opens on "New theme dropped" emails | > 40% |
| **Showcase Submissions** | Gallery submissions per month | 100/month |
| **Coming Soon Click-through** | Users who return when teased theme launches | > 30% |

---

## The Emotional Arc (Revised)

| Stage | Experience | Retention Hook |
|-------|------------|----------------|
| **Discovery** | Showcase website, "Instant dignity" | Coming Soon anticipation |
| **Transformation** | `wardrobe install`, "now wearing" | "Try another" prompt |
| **Celebration** | Showcase gallery submission | Featured site recognition |
| **Anticipation** | Email notifications, Coming Soon | New theme releases |
| **Belonging** | Community gallery, Discord | Peer connection |

---

## Implementation Timeline

| Phase | Features | Timeline |
|-------|----------|----------|
| v1.1a | Post-install prompts, showcase submit flow | 2 weeks |
| v1.1b | Showcase gallery page, install counts | 3 weeks |
| v1.1c | Progress tracking, changelogs | 2 weeks |
| v1.2 | Community Discord, theme presets | Q3 2026 |

---

## The Path to 8/10

To reach an 8, Wardrobe needs:

1. **User showcase gallery** — Make the transformation shareable and visible
2. **Community layer** — Where do users connect, share modifications, request features?
3. **Theme evolution communication** — Changelogs, update announcements, roadmap visibility
4. **Social proof** — Install counts, trending indicators, testimonials

The foundation is solid. The characters (themes) have voice. The transformation moment is emotional. Now we need the ensemble cast — the community that turns individual stories into a shared universe.

---

## Summary

Wardrobe currently tells a complete first episode. Users arrive, transform, and... credits roll.

v1.1 turns this into a series:
- Post-install engagement keeps the conversation going
- Showcase gallery makes transformations shareable and visible
- Install counts create social proof and FOMO
- Progress tracking gamifies exploration
- Theme evolution communication creates ongoing narrative

> "In television, we say: make them laugh, make them cry, make them wait. Wardrobe now makes them wait. Next step: make them belong."

— Shonda Rhimes

---

*Derived from Shonda Rhimes' Board Review*
*Great Minds Agency — April 2026*
