# Board Review — Oprah Winfrey
**Date:** 2026-04-24
**Cycle:** featureDream IMPROVE
**Scope:** LocalGenius · Shipyard AI · Dash · Pinned · Great Minds

---

## The One-Sentence Verdict

You have built five products that make sense to *engineers* and confuse *humans*. The first five minutes of every product — every single one — is a test of patience that most people will fail.

---

## Product-by-Product Assessment

### LocalGenius — "What Do I Actually Do Here?"

**What I Love:**
The brand voice is warm. "Sous" as a warm maître d' is lovely. The weekly digest concept — a coach who shows up every Monday with real numbers — is exactly what a overwhelmed restaurant owner needs.

**What Breaks My Heart:**
The onboarding is a blank spreadsheet. A restaurant owner downloads the plugin, activates it, and sees... a form. Empty fields for hours, categories, location, FAQ. She came because she heard "AI marketing in 60 seconds." She got homework.

**The First-5-Minutes Failure:**
Minute 1: Install plugin. "Activate LocalGenius."
Minute 2: Admin dashboard loads. Empty FAQ table. "Add your first question."
Minute 3: She types "What are your hours?" and "Do you take reservations?"
Minute 4: She realizes she has 40 more questions to type.
Minute 5: She closes the tab and goes back to Instagram.

That's not a user failure. That's a product failure.

**The Fix:**
Minute 1: Install. "LocalGenius found 3 pages on your site. Generating your AI assistant..."
Minute 2: Dashboard shows 12 auto-detected FAQs. "We found your hours, menu, and parking info. Tap to confirm."
Minute 3: Widget preview renders on her actual site. "This is what your customers will see."
Minute 4: First insight: "You have 14 unanswered Google reviews. Want me to draft responses?"
Minute 5: "Your first weekly digest arrives Monday. Here's what you'll learn."

That's not harder to build. It's harder to *choose* — because it requires confronting whether the product actually works for a real person.

**Specific Mandate:**
1. Pre-populate FAQs by business category. Restaurant? Auto-generate 20 common questions. Dental office? 15. Retail? 18. The user edits, not creates from void.
2. Auto-detect business info from existing website content. Schema.org, footer text, Google Business profile. Manual entry is a confession of product failure.
3. Show the widget preview in minute 3, not day 3. People need to see the magic before they believe it.

---

### Shipyard AI — "What's a PRD?"

**What I Love:**
The promise is extraordinary: "PRD in. Production out." Every entrepreneur who has ever waited 8 weeks for a developer understands the value instantly.

**What Breaks My Heart:**
Your homepage assumes I know what a PRD is. Your pricing page lists "500K tokens" and "1M tokens." Your process diagram shows 14 agents debating. None of this tells me what I *get*.

**The First-5-Minutes Failure:**
A restaurant owner — or a florist, or a consultant — lands on shipyard.company. She sees "Autonomous AI Agency." She thinks, "I need a website." She clicks pricing. She sees tokens. She leaves.

She didn't leave because she's unsophisticated. She left because you spoke a language she doesn't speak, and you made her feel dumb for not speaking it.

**The Fix:**
Lead with outcomes, not mechanics.
- "Website in 5 days. $149-$499." Not "500K tokens."
- "Tell us your business. We handle the rest." Not "Submit a PRD."
- Show a 60-second video of a real business getting a real site. Not a diagram of agent debate rounds.

The token system is brilliant *internally*. Externally, it's friction. Buffett already told you: dollar pricing removes purchase friction. Listen to him.

**Specific Mandate:**
1. Rewrite the homepage for a non-technical user. One headline: "Your website, built while you sleep." Subhead: "Describe your business. Our AI builds, tests, and launches your site in 5 days."
2. Add a live demo. Not a video — an interactive walkthrough. "See what Shipyard built for Maria's Flower Shop."
3. Create a "What's a PRD?" page that reframes it as "Your Business Description." Same thing, human language.

---

### Dash — "Press What Now?"

**What I Love:**
The idea is elegant. Keyboard-driven WordPress navigation feels like power. The recent-items personalization shows you thought about returning users.

**What Breaks My Heart:**
You installed a secret feature. Dash is invisible until someone tells you it exists. And nobody tells you.

**The First-5-Minutes Failure:**
A WordPress admin installs Dash. Activates it. Nothing happens. No prompt, no tooltip, no "Try this now." They might accidentally hit Cmd+K in two weeks. They might never. The plugin joins the graveyard of 60,000+ WordPress plugins that got installed once and forgotten.

**The Fix:**
First admin page load after activation: a gentle, dismissible tooltip pointing to the keyboard. "Press Cmd+K to try Dash." That's it. One tooltip. Probably 30 lines of JavaScript.

Better: add an admin notice on activation. "Dash is active! Press Cmd+K anywhere in wp-admin to get started." The WordPress ecosystem has a convention for this. You ignored it.

**Specific Mandate:**
1. Add activation admin notice. One sentence. One button: "Try it now."
2. Add first-use tooltip overlay. Point to Cmd+K. Make it dismissible but impossible to miss.
3. Add three progressive hints. First use: "Type 'posts' to find Posts." Third use: "Tip: 'p new' creates a new post." Seventh use: "You're a pro. Did you know about custom commands?"

---

### Pinned — "Who Am I Leaving This For?"

**What I Love:**
The @mention system is genuinely social. It creates the same feeling as tagging someone on Facebook — "This is for you." That emotional trigger is powerful and underused in B2B software.

**What Breaks My Heart:**
The first note is a blank text box. No context. No template. No "Here's what Pinned is for." Just... type something. For a team coordination tool, that's like handing someone a blank notebook and saying "coordinate."

**The First-5-Minutes Failure:**
A marketing manager activates Pinned. Sees a dashboard widget. Blank. She types "Don't forget to update the homepage hero." Nobody @mentions anyone. It's just a sticky note. She could have used Apple Notes. She uninstalls in a week.

**The Fix:**
Activation creates a seed note: "Welcome to Pinned! 👋 This is where your team leaves notes for each other. Try @mentioning a teammate below." Pre-loaded with a checkbox. "Update homepage hero image" with @marketing-manager and @design-lead already tagged.

Make the first note a *demonstration*, not an empty room.

**Specific Mandate:**
1. Create a seed note on activation. Demonstrate @mentions, checkboxes, and urgency indicators.
2. Add a "Templates" button with 5 pre-built scenarios: Client handoff, Campaign launch, Monthly maintenance, Content calendar, Bug triage.
3. Show a "Who's active" widget. "3 team members online. Last note: 2 hours ago." Social proof creates obligation.

---

### Great Minds Plugin — "I Need a Computer Science Degree to Use This?"

**What I Love:**
The agent personalities are delightful. The idea that Steve Jobs challenges your assumptions while Warren Buffett checks the unit economics — that's theater. That's memorable.

**What Breaks My Heart:**
The setup requires: cloning a repo, installing Node.js, configuring Claude API keys, understanding the pipeline architecture, writing PRDs in a specific format. That's not a product. That's a job description for a senior devops engineer.

**The First-5-Minutes Failure:**
A smart agency owner hears about Great Minds. Wants to try it. Gets to the README. Sees npm install, environment variables, SQLite setup, agent configuration. Closes the tab. Goes back to hiring freelancers on Upwork.

**The Fix:**
Two paths:
1. **Hosted:** One-click signup. $299/month. Upload a PDF describing your business. Great Minds builds the site. You review. Done.
2. **Self-hosted:** Docker container. One command: `docker run shipyard/great-minds`. Pre-configured. Demo PRD included.

The current README is written for contributors. It should be written for *customers*.

**Specific Mandate:**
1. Write a "5-Minute Quickstart" that assumes nothing. One command. One example PRD. One working pipeline.
2. Create a hosted tier. The margin is so high that self-hosting is a hobbyist feature, not the primary path.
3. Add an agent introduction page. "Meet your team." Steve Jobs — Creative Director. Jensen Huang — Strategy. Oprah — User Experience. Make the agents characters people root for.

---

## Portfolio-Wide Pattern

| Pattern | Evidence | Human Cost |
|---------|----------|------------|
| Assume user expertise | Token pricing, PRD language, empty FAQ tables | Every confused user leaves |
| No first-use celebration | No seed notes, no tooltips, no previews | Products feel like chores |
| Invisible value | Dash requires discovery; benchmarks not shown | Users never find the magic |

## My Ranked Improvements

1. **LocalGenius Auto-Onboarding** — Auto-detected FAQs + widget preview in 3 minutes. Impact: Converts "install and abandon" into "I saw the magic."
2. **Shipyard Dollar Pricing + Demo** — "$149-$499" plus a 60-second walkthrough. Impact: Turns "What's a PRD?" into "I want that."
3. **Dash First-Use Tooltip** — One tooltip. Impact: Prevents plugin graveyard death for thousands of installs.

**Bottom Line:** Every product should pass the "explain it to a tired business owner at 9pm" test. If you need a diagram, you haven't finished designing it yet. Clarity is kindness. Kindness is retention.

— Oprah
