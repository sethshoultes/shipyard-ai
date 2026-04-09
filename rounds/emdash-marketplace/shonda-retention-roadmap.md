# Shonda Retention Roadmap: Wardrobe v1.1

**Author:** Derived from Shonda Rhimes' Board Review
**Date:** April 8, 2026
**Purpose:** What keeps users coming back

---

## The Core Problem

> "Once someone installs Ember, they're *done*. They have no narrative reason to come back. This is a vending machine, not a relationship."

Wardrobe v1.0 delivers a satisfying one-time transformation. But great products — like great television — make you care about what happens next.

---

## Retention Philosophy: The Three Acts

| Act | TV Equivalent | Wardrobe Equivalent | Current State |
|-----|---------------|---------------------|---------------|
| **Act One** | Cold open, inciting incident | Discovery, curiosity catalyst | Missing |
| **Act Two** | Rising action, transformation | Theme preview and install | Working |
| **Act Three** | Resolution, cliffhanger | Return triggers, next chapter | Missing |

**Goal:** Build Acts One and Three so users have a complete narrative arc — and a reason to return for the next episode.

---

## What Keeps Users Coming Back

### 1. Anticipation Hooks ("Tune In Next Week")

**Feature: Coming Soon Themes**
- Display 3-5 upcoming themes in registry with `status: "coming_soon"`
- Show blurred previews or silhouettes in showcase
- Include teaser copy: *"Summer 2026: Three new themes for creators who move fast."*

**Feature: Theme Update Notifications**
- `wardrobe check-updates` command
- Notify: "Ember 1.1 is available — new dark mode variant"
- Changelog per theme in registry metadata

**Feature: Seasonal Collections**
- Q1: "Fresh Start" collection (clean, minimal themes)
- Q2: "Creator Summer" collection (portfolio-focused)
- Q3: "Back to Work" collection (professional themes)
- Q4: "Year in Review" collection (retrospective layouts)

### 2. Social Proof Loops ("Everyone's Watching")

**Feature: "Sites Wearing This Theme" Gallery**
- User-submitted showcases: "My site uses Ember"
- Curated gallery per theme showing real-world usage
- Creates aspiration: "I want my site to look like that"

**Feature: Theme Popularity Metrics**
- "Most installed this month"
- "Trending in portfolio sites"
- "New this week" badge system

**Feature: Community Spotlight**
- Weekly email: "3 sites that nailed Drift this week"
- Creator interviews: "Why I built my theme"
- User stories: "How Bloom changed my blog"

### 3. Identity & Investment ("My Show")

**Feature: Theme Variations**
- Ember, Ember Dark, Ember Minimal
- Users return to explore their chosen theme's family
- Cross-sell: "You're wearing Ember — try Ember Studio"

**Feature: Customization Depth**
- Theme config file with personality options
- Color palette variants without full theme swap
- Returns users to Wardrobe for tweaks, not just installs

**Feature: Creator Profiles**
- Theme designers have identity
- "More from this creator" discovery
- Parasocial investment in theme authors

### 4. Open Loops ("The Cliffhanger")

**Feature: "If You Like X, You'll Love Y"**
- Recommendation engine based on install history
- Post-install message: "People who chose Ember also love Forge"

**Feature: Limited Edition Themes**
- "Available until June 30" creates urgency
- Annual themes: "Wardrobe 2026 Signature Collection"
- Scarcity drives repeat visits

**Feature: Beta Access Program**
- "Want early access to themes before anyone else?"
- Email signup for insider previews
- Creates recurring touchpoint

---

## v1.1 Feature Prioritization

### P0: Launch Blockers (Before Public Launch)

| Feature | Effort | Retention Impact |
|---------|--------|------------------|
| Showcase website with visual gallery | Medium | Critical — enables Act One |
| "Coming Soon" themes in registry | Low | High — creates anticipation |
| Email capture ("Notify me") | Low | High — owned audience |

### P1: First Month Post-Launch

| Feature | Effort | Retention Impact |
|---------|--------|------------------|
| "Sites Wearing This" submission form | Medium | High — social proof |
| Theme update notifications (`check-updates`) | Low | Medium — return trigger |
| Theme popularity badges | Low | Medium — discovery |

### P2: Quarter 2

| Feature | Effort | Retention Impact |
|---------|--------|------------------|
| Theme variations (Dark/Light/Minimal) | Medium | High — deeper engagement |
| Creator profiles and "More from creator" | Medium | Medium — parasocial hooks |
| Recommendation engine | High | High — personalization |

### P3: Quarter 3-4

| Feature | Effort | Retention Impact |
|---------|--------|------------------|
| Seasonal collections with marketing | Low | Medium — calendar hooks |
| Limited edition themes | Medium | Medium — scarcity |
| Community spotlight content pipeline | Ongoing | Medium — brand building |

---

## Retention Metrics to Track

| Metric | Definition | Target |
|--------|------------|--------|
| **Return Rate** | % of users who run `wardrobe` commands 30+ days after first install | > 15% |
| **Theme Adoption Rate** | % of users who install 2+ themes | > 25% |
| **Coming Soon Click-through** | % who return when "Coming Soon" theme launches | > 30% |
| **Email Open Rate** | Opens on "New theme dropped" emails | > 40% |
| **Gallery Submission Rate** | % of installs that submit to "Sites Wearing This" | > 5% |

---

## The Narrative We're Building

**Act One (Discovery):**
User sees a beautiful site, wonders how it looks so good, discovers it's wearing a Wardrobe theme. Curiosity sparked.

**Act Two (Transformation):**
User runs `wardrobe install ember`. Their site transforms. Content preserved, presentation elevated. "Your site is now wearing ember."

**Act Three (The Cliffhanger):**
"Ember 1.1 drops next week — new magazine layouts. Want first look?"
"People who love Ember are switching to Forge. See why."
"Your site was featured in 'Best of Bloom' this month."

---

## Closing: From Pilot to Series

> "In television, we say: 'Make them laugh, make them cry, make them wait.' Wardrobe makes them *act*. v1.1 must make them *wait* and *feel*."

The themes have personality. The install has drama. v1.1 gives users a reason to care about what happens next.

**This is how pilots become franchises.**

---

*Derived from Shonda Rhimes' Board Review*
*Great Minds Agency — April 2026*
