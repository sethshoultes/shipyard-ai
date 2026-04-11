# Wardrobe Retention Roadmap v1.1

**Author:** Based on Shonda Rhimes' Board Review
**Date:** April 11, 2026
**Focus:** What Keeps Users Coming Back

---

## The Core Problem

Wardrobe is currently a **one-transaction product**:

```
User has boring site → Discovers Wardrobe → Installs theme → Has nice site → [END]
```

This is a movie. We need a series.

> "Characters don't change once; they keep changing, and we keep watching because we want to see who they become next."

---

## Retention Philosophy

Users return when they have:
1. **Unfinished business** — Something they started but haven't completed
2. **Anticipated events** — Something coming they don't want to miss
3. **Community belonging** — A place where they're recognized
4. **Evolving identity** — New ways to express who they're becoming

---

## Current State Assessment

| Category | Score | Assessment |
|----------|-------|------------|
| Story Arc | 7/10 | Strong setup, evocative characters, invisible climax |
| Retention Hooks | 5/10 | Coming Soon and email exist, no post-install loop |
| Content Strategy | 5/10 | Good foundation, no flywheel mechanics |
| Emotional Cliffhangers | 6/10 | Season tease works, no episode hooks |
| **Overall** | **6/10** | *Pilot without a second episode* |

---

## What's Working Now

### The Transformation Moment
The narrative structure is cinematically clean:
1. **Inciting Incident:** "Every Emdash site looks the same."
2. **Rising Action:** User discovers Wardrobe, browses five themes with distinct personalities
3. **Climax:** `npx wardrobe install ember` — 3 seconds — transformation complete
4. **Resolution:** "Your site is now wearing ember. Try it on. If it doesn't fit, try another."

That final line is brilliant screenwriting. It reframes failure as iteration, not rejection.

### Theme Personalities
Each theme is an identity choice, not a feature list:
- *"Bold. Editorial. For people with something to say."* (Ember)
- *"Dark and technical. Built for builders."* (Forge)
- *"Warm and inviting. Where community feels at home."* (Bloom)
- *"Clean and professional. Trust at first glance."* (Slate)
- *"Minimal and airy. Let your content breathe."* (Drift)

You're casting yourself.

### Coming Soon Cliffhangers
Four themes with evocative names, personality teasers, and release windows:
- **Aurora:** "For brands that refuse to blend in" — Summer 2026
- **Chronicle:** "Stories deserve dignity" — Fall 2026
- **Neon:** "The future is now" — Summer 2026
- **Haven:** "Home on the internet" — Fall 2026

"Stories deserve dignity" makes you want to see it NOW.

---

## What's Broken

### 1. The Silent Payoff
The install completes with a terminal message. But the *actual* magic—seeing YOUR content transformed—requires the user to manually start their dev server and discover it alone.

> "We're cutting away before the reveal. In Grey's Anatomy, we never cut before showing someone's face when they see the flatline become a heartbeat."

### 2. No Flywheel
Content flows one direction: Emdash creates themes → users consume themes. No user contribution. No remix culture. No community voice.

**Current:**
```
Emdash creates themes → Users consume themes → [END]
```

**Target:**
```
User installs theme →
User customizes →
User shares their site →
Others see the gallery →
They discover Wardrobe →
They install →
They share →
[LOOP]
```

### 3. No Progress or History
Every visit is treated as a first visit. Returning audiences want acknowledgment of their history.

### 4. No Post-Install Relationship
After installation, Wardrobe has done its job. There's no:
- "How's Ember treating you?" follow-up
- Day-2 customization tips email
- Progress indicator ("You've tried 1 of 5 themes")

---

## V1.1 Features: The Retention Loop

### Feature 1: Post-Install Reveal

**Problem:** The aha moment happens off-screen.

**Solution:**
```bash
npx wardrobe install ember

✓ Theme installed.

Your site is now wearing ember.

┌─────────────────────────────────────────┐
│  View your transformation:              │
│  → http://localhost:4321                │
│                                         │
│  Open now? [Y/n]                        │
└─────────────────────────────────────────┘
```

**Implementation:**
- Detect if dev server is running
- Offer to open browser automatically (`open` command)
- If server not running, offer to start it

**Retention impact:** Ensures emotional payoff. Users who SEE the transformation are more likely to share it.

---

### Feature 2: Day-2 Engagement Email

**Problem:** After installation, Wardrobe has no relationship with the user.

**Solution:** Automated email sequence triggered by theme installation.

**Email 1: Installation +24 hours**
```
Subject: How's Ember treating you?

You installed Ember yesterday. Here's what most Ember users do next:

1. Customize the accent color
   → Edit src/styles/theme.css, line 12

2. Add your logo
   → Replace public/logo.svg

3. Adjust the header layout
   → See our customization guide: [link]

Wearing Ember well? Share your site with us:
→ Submit to the gallery: [link]

Trying on something else? That's what wardrobes are for:
→ wardrobe list

— The Wardrobe Team
```

**Email 2: Installation +7 days**
```
Subject: 127 sites are wearing Ember this week

You're part of the Ember community now. Here's what's happening:

• New this week: 3 Ember sites joined the gallery
• Most popular customization: Dark mode variant
• Coming soon: Ember 1.1 with pull-quote components

See the gallery → [link]
Submit your site → [link]
```

**Implementation:**
- Capture email at install (optional, privacy-first)
- Use existing Cloudflare Workers infrastructure
- KV storage for subscriber management
- Drip sequence via scheduled workers

**Retention impact:** Creates ongoing relationship. Users who receive value post-purchase return.

---

### Feature 3: Theme Versioning & Updates

**Problem:** Once installed, a theme is frozen. No reason to return.

**Solution:** Version tracking with update notifications.

**CLI Enhancement:**
```bash
npx wardrobe list

Installed Themes:
┌─────────┬───────────┬────────────┬─────────────────┐
│ Theme   │ Installed │ Latest     │ Status          │
├─────────┼───────────┼────────────┼─────────────────┤
│ ember   │ 1.0.0     │ 1.1.0      │ Update available│
└─────────┴───────────┴────────────┴─────────────────┘

Run `wardrobe update ember` to get the latest.
```

**Update Command:**
```bash
npx wardrobe update ember

Updating ember: 1.0.0 → 1.1.0

What's new in Ember 1.1:
• Pull-quote component for editorial emphasis
• Dark mode variant (prefers-color-scheme support)
• Performance improvements (-200ms load time)

Proceed? [Y/n]
```

**Implementation:**
- Add `version` field to theme registry
- Store installed version in local `.wardrobe` config
- Compare on `wardrobe list`
- Non-destructive updates (preserve customizations)

**Retention impact:** Creates return visits. Users check for updates like checking for new episodes.

---

### Feature 4: Site Gallery

**Problem:** No social proof. No community. No way to see what's possible.

**Solution:** Curated gallery of sites using each theme.

**Gallery Structure:**
```
/gallery
  /ember
    - Site 1: "The Morning Brief" (news blog)
    - Site 2: "Studio Volta" (design agency)
    - Site 3: "Chef's Table Portland" (restaurant)
  /forge
    - Site 1: "DevTools Weekly" (developer newsletter)
    ...
```

**Submission Flow:**
```bash
npx wardrobe submit

Submit your site to the Wardrobe Gallery

Site URL: https://example.com
Your name: Jane Smith
Brief description: A newsletter about sustainable fashion
Screenshot captured ✓

Submitted for review. We'll email you within 48 hours.
```

**Gallery Page Features:**
- Filterable by theme
- Screenshot + live link
- "Sites wearing this" counter
- Featured/Staff Pick badges

**Implementation:**
- Static gallery page (Astro)
- Submission via CLI → Worker → KV queue
- Manual curation (initially)
- Cloudflare R2 for screenshot storage

**Retention impact:**
- Submitters return to see their site featured
- Browsers return to see new submissions
- Creates aspirational motivation ("My site could be here")

---

### Feature 5: Behind-the-Scenes Content

**Problem:** Coming Soon themes are a season cliffhanger, but no episode-to-episode engagement.

**Solution:** Monthly "Design Diary" content showing theme creation process.

**Content Calendar:**
```
April 2026: "Chronicle: How We're Designing for Long-Form"
- Typography exploration
- Reading rhythm research
- Early wireframes

May 2026: "Aurora: Finding the Line Between Bold and Obnoxious"
- Color theory for attention
- A/B test results from user research
- Component sketches

June 2026: "Chronicle Progress Update"
- Beta screenshots
- User feedback integration
- Launch date confirmation
```

**Distribution:**
- Email to subscribers
- Blog post on showcase site
- Social media excerpts

**Implementation:**
- Markdown content in `/content/diary/`
- Rendered on showcase site
- Email via Workers

**Retention impact:** Creates appointment content. Users check in monthly to see progress on themes they're anticipating.

---

### Feature 6: Progress & Achievement System

**Problem:** No sense of journey. Installation is the end, not the beginning.

**Solution:** Light gamification that recognizes user milestones.

**Achievements:**
```
┌─────────────────────────────────────────────────────┐
│ Your Wardrobe Journey                               │
├─────────────────────────────────────────────────────┤
│ ✓ First Fit       - Installed your first theme     │
│ ✓ Adventurous     - Tried 3 different themes       │
│ ○ Curator         - Submitted to the gallery       │
│ ○ Early Adopter   - Installed a theme on launch day│
│ ○ Feedback Friend - Submitted a feature request    │
└─────────────────────────────────────────────────────┘
```

**Implementation:**
- Local tracking in `.wardrobe/journey.json`
- Optional sync to account (future)
- Display on `wardrobe status`

**Retention impact:** Creates unfinished business. Users return to complete their journey.

---

### Feature 7: Seasonal Collections

**Problem:** Theme releases feel random, not like events.

**Solution:** Group themes into seasonal collections.

**Example:**
```
FALL 2026 COLLECTION
"Cozy themes for autumn"

  Haven — Home on the internet
  Chronicle — Stories deserve dignity

Available September 15, 2026
```

**Why it works:**
- Fashion metaphor extended naturally
- Creates "appointment viewing"
- Gives users a reason to check back seasonally
- Batch releases feel like events, not trickles

**Implementation:**
- Group Coming Soon themes by season
- Coordinated release dates
- Launch email to subscribers
- Update showcase with seasonal messaging

---

## The Retention Loop (Complete)

```
User installs theme
    ↓
CLI shows transformation (Feature 1)
    ↓
Day-2 email with customization tips (Feature 2)
    ↓
User customizes, shares site
    ↓
Gallery submission (Feature 4)
    ↓
Site featured, user notified
    ↓
User checks for theme updates (Feature 3)
    ↓
Behind-the-scenes email arrives (Feature 5)
    ↓
User anticipates new theme
    ↓
New theme launches (Feature 7)
    ↓
User installs new theme
    ↓
[LOOP]
```

---

## Implementation Priority

### Sprint 1 (Immediate)
| Feature | Effort | Impact |
|---------|--------|--------|
| Post-Install Reveal | Low | High |
| Wire Email Capture | Low | Critical |

### Sprint 2 (Next 2 Weeks)
| Feature | Effort | Impact |
|---------|--------|--------|
| Theme Versioning | Medium | High |
| Day-2 Email Sequence | Medium | High |

### Sprint 3 (Month 2)
| Feature | Effort | Impact |
|---------|--------|--------|
| Gallery MVP (static) | Medium | Medium |
| Gallery Submission Flow | Medium | Medium |
| Behind-the-Scenes Content | Low | Medium |

### Future
| Feature | Effort | Impact |
|---------|--------|--------|
| Progress System | Medium | Low-Medium |
| Seasonal Collections | Low | Medium |
| Account System | High | High (enables all) |

---

## Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target |
|--------|--------|
| Email signups | 100+ in first month |
| Gallery submissions | 10+ sites |
| Second-theme installs (same user) | 20% of users |

### Lagging Indicators (Month 2+)
| Metric | Target |
|--------|--------|
| Return visitor rate (showcase) | 30%+ |
| Theme update adoption rate | 50%+ within 7 days |
| User-to-evangelist conversion | 10% share or submit |

### Q3 2026 Targets
| Metric | Target |
|--------|--------|
| Email capture rate | 15% of installs |
| Day-2 email open rate | 45% |
| 30-day retention | 25% |
| Theme diversity | 20% tried 2+ themes |
| Gallery submissions | 50 sites |

---

## Closing Principle

> "In television, we say: make them laugh, make them cry, make them wait.
> Wardrobe has the wait. Now it needs the reasons to stay."

The goal isn't to trap users. It's to give them reasons to return because they *want* to—because there's always something new to see, something to contribute, something to anticipate.

A wardrobe isn't something you visit once. It's something you return to every morning, wondering who you want to be today.

Because the best transformations aren't endings. They're beginnings.

---

*Retention Roadmap v1.1*
*Wardrobe Theme Marketplace*
*Great Minds Agency*
