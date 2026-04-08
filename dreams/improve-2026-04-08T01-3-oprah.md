# IMPROVE Cycle: Oprah Winfrey Review
**Date:** 2026-04-08 | **Focus:** New User Confusion & First-5-Minutes Experience

---

## The First-5-Minutes Test

*"People will forget what you said, people will forget what you did, but people will never forget how you made them feel."*

I'm evaluating each product through the lens of a new user's emotional journey in their first five minutes. Do they feel confident? Confused? Empowered? Overwhelmed?

---

## LocalGenius

### First-5-Minutes Experience

**Entry Point:** localgenius.company

**Current Flow:**
1. Landing page with "virtual employee" messaging
2. Pricing visible immediately ($29/$79/mo)
3. 14-day free trial CTA
4. Setup: "Just enter your business name"
5. Auto-pulls Google Business Profile

**What's Working:**
- "Virtual employee" is relatable. Everyone knows what an employee does.
- Price transparency builds trust. No hidden gotchas.
- Auto-import from Google is magic — removes the "where do I start?" anxiety.

**Confusion Points:**

1. **"What will you actually DO?"** — The demo shows a restaurant. If I'm a dentist, will this work for me? The persona mismatch creates doubt.

2. **Conversational UI is unfamiliar** — Most users expect dashboards, not chat. "Talk to your marketing" sounds innovative but... what do I say? Where's the tutorial?

3. **Three pricing tiers, unclear differences** — Base vs Pro: what's "Google Business Profile optimization"? I already have one. Is it broken?

**Emotional State at 5 Minutes:** Curious but uncertain. "This looks cool but I'm not sure it's for MY business."

### Improvement Opportunities

- **Industry-specific demos** — Toggle between "See it for: Restaurant | Dental | Salon | Retail" on landing page
- **Prompt suggestions in chat** — "Try asking: 'Post about our spring special' or 'Reply to my latest review'"
- **First message from LocalGenius** — System should message YOU first with a warm welcome and suggested first action
- **"Your Business at a Glance" dashboard** — Show the data you found on Google before asking for action. "We found your business! Here's what we see..."

---

## Dash (WP Command Palette)

### First-5-Minutes Experience

**Entry Point:** WordPress plugin directory or GitHub

**Current Flow:**
1. Install plugin
2. See "Dash is ready — try Cmd+K!" admin notice
3. Press Cmd+K
4. Empty search bar appears
5. ???

**What's Working:**
- Instant activation — no settings page to configure
- Keyboard shortcut is universally understood (Spotlight, Alfred, VS Code)
- Clean, minimal UI matches WP admin aesthetic

**Confusion Points:**

1. **"Now what?"** — Blank search bar with no hints. What can I search for? What can I DO?

2. **Mode switching is hidden** — `>` for commands and `@` for users requires documentation. First-timers won't discover this.

3. **No celebration moment** — First successful action should feel rewarding. Currently it just... navigates. No acknowledgment.

**Emotional State at 5 Minutes:** Mild interest, likely forgotten. "Oh, that's kind of useful." No habit formed.

### Improvement Opportunities

- **Welcome tour on first Cmd+K** — "Here's what you can do: Search anything, Type > for commands, Type @ for users" — then dismiss forever
- **Placeholder text that rotates** — `Search posts, pages, settings... or try ">" for commands`
- **Popular searches for YOUR site** — "Based on your content: Posts (47) | Pages (12) | Products (156)"
- **Success micro-animation** — Small confetti or checkmark when command executes. Dopamine matters.

---

## Pinned (WP Sticky Notes)

### First-5-Minutes Experience

**Entry Point:** Plugin install → Dashboard widget

**Current Flow:**
1. Install plugin
2. Dashboard widget appears
3. Empty board with "Double-click to add a note"
4. User creates note
5. Note appears in colorful sticky format

**What's Working:**
- Zero configuration — it just works
- Visual metaphor (sticky notes) is universally understood
- Double-click to create is discoverable

**Confusion Points:**

1. **Empty state is lonely** — Just "Double-click to add a note" on a blank board. No warmth, no example, no "here's how teams use this."

2. **@mentions undiscoverable** — How would anyone know you can @mention teammates? There's no hint.

3. **Who is this for?** — Solo WordPress user sees this and thinks "why would I note myself?" Team use case isn't communicated.

**Emotional State at 5 Minutes:** Underwhelmed. "Cute, but I already have sticky notes on my desk."

### Improvement Opportunities

- **Starter note from "Pinned Team"** — Pre-populated welcome note: "Welcome! Use Pinned to leave notes for your team. Try @mentioning someone, or pin this note to keep it at the top."
- **Empty state illustration** — Show 3-4 sample notes with different colors, one with @mention visible, one with acknowledgment checkmarks
- **Solo user value prop** — "Even flying solo? Use Pinned to remind yourself of todos, client feedback, or content ideas."
- **Feature discovery tooltips** — On hover: "Tip: Type @ to mention a teammate"

---

## Great Minds Plugin

### First-5-Minutes Experience

**Entry Point:** GitHub README or `npx plugins add`

**Current Flow:**
1. Read extensive README (2000+ words)
2. Install via npx
3. Run `/agency-start my-project`
4. Create PRD file
5. Run `/agency-daemon` or `/agency-launch`
6. Watch terminal output

**What's Working:**
- Clear installation command
- Slash commands are intuitive for Claude Code users
- README is comprehensive (maybe too comprehensive)

**Confusion Points:**

1. **README overwhelm** — 14 agents, 17 commands, daemon modes, token budgets... This isn't onboarding, it's a textbook.

2. **"Where do I even start?"** — Quick Start exists but is buried. New users scroll past architecture diagrams looking for "Step 1."

3. **PRD format unclear** — "Create a PRD" — what format? How detailed? What's required vs optional?

4. **No feedback during execution** — Daemon runs but what's happening? Is it working? How long will this take?

**Emotional State at 5 Minutes:** Intimidated. "This looks powerful but I don't have time to learn this."

### Improvement Opportunities

- **One-page quickstart** — Separate QUICKSTART.md: "Your first project in 3 commands" with a sample PRD included
- **PRD template with annotations** — Show exactly what each section should contain, with examples
- **Progress visualization** — Real-time status: "Debate round 1/2... Plan phase... Building feature 3/5..."
- **"Hello World" project** — Pre-packaged demo PRD that builds something trivial in <5 minutes so users see the magic before committing to real projects

---

## Shipyard AI

### First-5-Minutes Experience

**Entry Point:** shipyard.company

**Current Flow:**
1. Land on homepage
2. Read about 7 AI agents
3. See pricing tiers (500K-2M tokens)
4. Find "Get Started" form
5. Fill out project details
6. Wait for quote

**What's Working:**
- Agent personas are memorable and differentiating
- Token pricing is transparent
- "No meetings required" speaks to real pain

**Confusion Points:**

1. **Tokens mean nothing to non-technical buyers** — "500K tokens" — is that a lot? How does that translate to pages/features?

2. **Emdash dependency unclear** — If I don't know Emdash, I might bounce. "What's Emdash? Is this only for that platform?"

3. **No portfolio or examples** — "100% ship rate" but... show me? Where are the sites you've built?

4. **Quote delay creates dropout** — "Quote within 24 hours" is eternity in internet time. Momentum lost.

**Emotional State at 5 Minutes:** Interested but skeptical. "Sounds great, but can they really do this?"

### Improvement Opportunities

- **Token translator** — "500K tokens = approximately a 5-page marketing site with custom design and content"
- **"Built with Shipyard" showcase** — Gallery of shipped sites with before (PRD) and after (live site)
- **Instant ballpark estimate** — "Based on your description, this looks like a Standard Site (~1M tokens, ~$X). Want a detailed quote?"
- **Emdash explainer** — Brief callout: "Emdash is a modern CMS built on Astro. Lightning fast, developer-friendly. [Learn more]"

---

## Cross-Product Patterns

### Universal First-5-Minutes Problems

| Problem | Affected Products | Pattern |
|---------|------------------|---------|
| Empty states don't welcome | Dash, Pinned | Add starter content or examples |
| Feature discovery buried | LocalGenius, Dash, Pinned | Onboarding hints, tooltips, rotating placeholders |
| Technical jargon alienates | Shipyard, Great Minds | Translate to human outcomes |
| No immediate win | All | First action should deliver dopamine |

### The "Aha Moment" Gap

Every product needs a clear "Aha moment" — the instant when a user thinks "OH, I get why this is valuable."

| Product | Current Aha | Ideal Aha |
|---------|-------------|-----------|
| LocalGenius | Seeing auto-imported business data | First AI-generated review response goes live |
| Dash | First search result found | "I just did in 2 seconds what used to take 6 clicks" |
| Pinned | Creating first note | Teammate acknowledges a note you wrote |
| Great Minds | First `/agency-status` output | Seeing merged PR from autonomous agent |
| Shipyard | Receiving quote | Live preview of homepage design |

---

## Top 3 First-5-Minutes Fixes

### 1. LocalGenius: Industry Selector + First Message (HIGH PRIORITY)

**Problem:** New users unsure if it works for their business type
**Fix:**
- Landing page toggle: "I'm a: Restaurant | Dentist | Salon | Other"
- Demo content updates to match selection
- System sends first message: "Welcome [Business Name]! I found your Google profile. You have 23 reviews with a 4.2 average. Want me to draft responses to your 3 unanswered reviews?"

**Impact:** Reduces bounce rate, accelerates trust, delivers immediate value

### 2. Shipyard: Token Translator + Portfolio Gallery (HIGH PRIORITY)

**Problem:** Token pricing meaningless to buyers; no proof of capability
**Fix:**
- Convert token tiers to plain English outcomes
- Add "Built with Shipyard" gallery with 5-10 live examples
- Each example shows: PRD summary → Live site → Token cost → Timeline

**Impact:** Converts skeptics, builds credibility, justifies pricing

### 3. Universal: Starter Content in Empty States (MEDIUM PRIORITY)

**Problem:** Empty dashboards feel dead; features undiscoverable
**Fix:**
- Dash: Rotating placeholder hints, welcome modal on first open
- Pinned: Pre-populated welcome note with feature callouts
- Great Minds: Sample "Hello World" PRD that runs in <5 minutes

**Impact:** Reduces abandonment, teaches by showing not telling

---

## Emotional Design Principles Going Forward

1. **Never leave users alone** — First interaction should feel like a warm handshake, not an empty room
2. **Show, don't tell** — Demo content > documentation
3. **Celebrate small wins** — Micro-interactions reward progress
4. **Speak human, not technical** — Tokens → outcomes, features → benefits
5. **Reduce time-to-aha** — Whatever the magic moment is, get there faster

---

*Oprah Winfrey | Shipyard AI Board*
*"Turn your wounds into wisdom, and your confusion into clarity."*
