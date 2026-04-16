# IMPROVE Cycle Review — Oprah Winfrey
**Date:** 2026-04-16
**Cycle:** IMPROVE-2026-04-16T03-1
**Lens:** New user confusion, first-5-minutes experience

---

## Portfolio Overview

Reviewing five shipped products through the lens of "what does a new user experience in their first 5 minutes?"

- **LocalGenius** — AI marketing platform for local businesses
- **Shipyard AI** — Autonomous site builder
- **Dash** — WordPress command palette
- **Pinned** — WordPress sticky notes
- **Great Minds Plugin** — Multi-agent orchestration daemon

---

## The First 5 Minutes: Product by Product

### LocalGenius: The Best First Impression

**Landing page:** "Your business, handled." This is a hug, not a pitch. It acknowledges the real pain: *you didn't open a business to do marketing*.

**First 5 minutes:**
1. Enter business name → auto-finds Google listing
2. See AI-generated website, social posts, review responses
3. One-tap publish

**What works:**
- Zero decisions required in the first flow
- Immediate tangible output (see your AI-generated site)
- "No credit card required" removes commitment anxiety

**What's missing:**
- **Pricing is hidden.** I have to click away from the magic to learn what it costs. For a small business owner, this creates "what's the catch?" anxiety.
- **Only one testimonial visible.** Maria's Kitchen is great, but where's the barbershop? The nail salon? The HVAC company? Diverse social proof matters.
- **No FAQ.** "Will it match my brand voice?" "What if I have multiple locations?" These questions are in every restaurant owner's head.

**Grade: B+** — Strong start, but anxiety creeps in around pricing and trust.

---

### Shipyard AI: Impressive But Intimidating

**Landing page:** "PRD in. Production out." This is clever for developers. For a small business owner who doesn't know what a PRD is? Alienating.

**First 5 minutes:**
1. Read "PRD in. Production out." → confusion
2. See token budgets (500K, 750K, 2M) → more confusion
3. Click "Start a Project" → unknown

**What works:**
- Clear value proposition (once you decode it)
- No meetings required (low friction)
- Visual pipeline explanation

**What's missing:**
- **What's a PRD?** The page assumes technical fluency. "Tell us what you want to build in plain English" would be more welcoming.
- **Token pricing without dollar amounts.** I don't know what 500K tokens costs. Is that $5 or $500? This is a deal-breaker for anyone with a budget to manage.
- **No examples of shipped work.** Where's the portfolio? Show me a site you actually built.
- **No clear "next step" after clicking.** What happens after I submit? How long until I hear back?

**Grade: C+** — Strong for technical users, but the first-5-minutes leaves non-technical users lost.

---

### Dash: Broken Before It Starts

**Installation:** Download plugin, activate in WordPress.

**First 5 minutes:**
1. Activate plugin → nothing visible happens
2. Press Cmd+K → maybe modal appears (if it works)
3. Try to search → no onboarding tooltip (it's broken)
4. No recent items (that feature is broken too)

**What works:**
- The *concept* is perfect: Cmd+K is muscle memory for power users
- Zero-config design intent is correct

**What's missing:**
- **The onboarding tooltip never shows** (dash-admin.js isn't enqueued)
- **Recent items don't work** (tracking code never fires)
- **No first-run guidance.** Even if bugs were fixed, there's no "Welcome to Dash! Here's what you can do" moment.

**Emotional reality:** A user who discovers Dash broken will assume it's abandonware. They'll deactivate within 60 seconds and leave a 1-star review.

**Grade: D** — Technical potential buried under broken first-run experience.

---

### Pinned: Delightfully Simple

**Installation:** Download plugin, activate in WordPress.

**First 5 minutes:**
1. Activate → dashboard widget appears automatically
2. Double-click → create a note (zero friction)
3. Type → note saves (debounced, no save button needed)
4. @mention colleague → they get notified

**What works:**
- **Immediate visibility.** Dashboard widget appears without configuration.
- **Double-click to create.** No modals, no forms, just type.
- **Age indicators.** Visual cues show which notes are fresh vs. stale.
- **@mentions work.** Team collaboration out of the box.

**What's missing:**
- **No welcome note.** The first-run should pre-populate with a sample note: "Welcome to Pinned! Double-click anywhere to create a note. Try @mentioning a colleague!"
- **No tour.** The features are discoverable, but first-time users might miss @mentions, pinning, and color options.

**Grade: A-** — Best first-5-minutes in the portfolio. Minor polish would make it perfect.

---

### Great Minds Plugin: Not For Casual Users (And That's OK)

**Installation:** `npx plugins add sethshoultes/great-minds-plugin`

**First 5 minutes:**
1. Run install command
2. Read documentation (12KB README, 11KB OPERATIONS.md)
3. Try `/agency-start my-project`
4. Write a PRD (requires understanding of PRD format)

**What works:**
- Comprehensive documentation exists
- Clear command structure (`/agency-*` namespace)
- Honest about complexity ("learning curve for new users")

**What's missing:**
- **This is a power-user tool.** The first-5-minutes is documentation reading. That's appropriate for the audience.
- **No sample PRD.** A "hello world" PRD that demonstrates the pipeline would help.
- **Daemon setup is complex.** Docker, systemd, environment variables—this is infrastructure work, not onboarding.

**Grade: B** — Appropriate for audience, but a guided tutorial would lower the barrier.

---

## First-5-Minutes Ranking

| Product | Time to Value | Emotional Outcome | Grade |
|---------|--------------|-------------------|-------|
| **Pinned** | 30 seconds | Delight | A- |
| **LocalGenius** | 5 minutes | Hope (with anxiety) | B+ |
| **Great Minds** | 30+ minutes | Overwhelmed (appropriate) | B |
| **Shipyard** | Unknown | Confused | C+ |
| **Dash** | Never | Frustrated | D |

---

## What New Users Need

### They Need Immediate Proof
- **LocalGenius:** Show me my AI-generated site before I commit
- **Shipyard:** Show me sites you've actually built
- **Dash:** Show me the palette working before I wonder if it's broken
- **Pinned:** You do this well (dashboard widget appears immediately)

### They Need Pricing Transparency
- **LocalGenius:** Put pricing on the landing page
- **Shipyard:** Convert tokens to dollars
- **Both:** Hidden pricing creates "what's the catch?" anxiety

### They Need Social Proof Diversity
- **LocalGenius:** One restaurant isn't enough. Show barbershops, dentists, gyms.
- **Shipyard:** Zero testimonials or case studies visible

### They Need Guided First Runs
- **Dash:** Welcome tooltip (fix the bug that breaks it)
- **Pinned:** Welcome note with @mention example
- **Great Minds:** Sample PRD for first-time users

---

## Recommendations by Urgency

### Fix Now (Blocking)
1. **Dash onboarding is broken.** The plugin fails its first impression. Fix the three P0 bugs before any marketing.
2. **Shipyard needs a portfolio page.** "We ship sites" means nothing without proof.

### Fix Soon (Trust-Building)
3. **LocalGenius pricing on landing page.** Transparency builds trust with small business owners.
4. **Pinned welcome note.** Pre-populate first-run with a sample note demonstrating features.

### Fix Eventually (Polish)
5. **LocalGenius diverse testimonials.** More industries, more social proof.
6. **Shipyard token-to-dollar calculator.** Help users budget.
7. **Great Minds sample PRD.** Lower the learning curve.

---

## The Deeper Truth

Every product in this portfolio was built by engineers for engineers. That's fine for Great Minds Plugin—it's explicitly a power-user tool. But LocalGenius and Pinned serve non-technical users who need emotional reassurance, not feature lists.

**The question isn't "what does this product do?"**
**The question is "how does this product make me feel in the first 5 minutes?"**

- Pinned makes me feel capable (I created something immediately)
- LocalGenius makes me feel hopeful (but anxious about hidden costs)
- Shipyard makes me feel confused (I don't understand the terms)
- Dash makes me feel frustrated (it doesn't work)

**Ship products that make people feel capable.** Everything else follows.

---

*"People will forget what you said. People will forget what you did. But people will never forget how you made them feel."*

— Oprah Winfrey, Board Member
