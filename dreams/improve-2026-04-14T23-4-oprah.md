# Board Review: Oprah Winfrey
**Cycle:** IMPROVE 2026-04-14T23:04
**Lens:** New User Confusion & First-5-Minutes

---

## Executive Summary

I've walked through all five products as a first-time user would. The truth is: **some of these products greet you warmly, and some of them leave you standing in the doorway wondering if you're in the right place.**

The best products make you feel smart within five minutes. The weakest ones make you feel like you're missing something. That feeling—"am I doing this wrong?"—is the death of retention.

---

## Product-by-Product First-5-Minutes Analysis

### 1. LocalGenius

**First Impression:** Promising but incomplete.

**What Works:**
- The 5-minute setup promise is clear
- The value proposition is immediately understandable ("AI marketing for local businesses")
- The WordPress plugin version (LocalGenius Lite) has a beautiful zero-config flow: install, select business type, done

**Where Users Get Lost:**
- **The frontend isn't built.** This is the core problem. A user installs the plugin and... nothing happens. The admin interface doesn't exist. The chat widget CSS isn't there. This isn't confusion—it's abandonment territory.
- **"Zero-config" may be a lie.** The homepage scanner extracts business name and phone, but if it fails (and it will fail on some sites), users see... what? A blank state? An error? The fallback experience isn't documented.
- **Generic FAQ responses.** A dentist asks "Do you take Delta Dental?" and gets "Please contact our office." This is the opposite of intelligence. It's a letdown moment.

**First-5-Minutes Score: 2/10** (because the frontend doesn't exist)
**Potential Score: 8/10** (if built as designed)

**Fix:** Ship the frontend. This is blocking everything. After that, add a "first message" tutorial: "Try asking me something! Here are examples customers like yours commonly ask..."

---

### 2. Dash (Command Palette)

**First Impression:** Delightful discovery moment.

**What Works:**
- **The onboarding tooltip is perfect.** "Press Cmd+K to Dash" appears for 6 seconds on first admin visit. It's non-intrusive, memorable, and immediately actionable.
- **The payoff is instant.** User presses Cmd+K, sees a Spotlight-like palette, types "settings," and jumps directly there. That's a "wow" moment.
- **Rotating placeholder text.** "Where to?", "Jump anywhere..." This is warm. It feels like a conversation, not a tool.

**Where Users Get Lost:**
- **Mode switching isn't obvious.** Users who don't read documentation won't know that `>` activates command mode or `@` activates user search. They'll type "new post" instead of ">new post" and get navigation results, not the action.
- **No guided tour of features.** The tooltip teaches the shortcut but not the capabilities. A user could use Dash for a year and never discover they can create posts, search users, or clear cache from it.
- **Large sites may feel broken.** On sites with 100K+ posts, search may timeout (known bug). A user on a large site presses Cmd+K, searches, waits... waits... and assumes the plugin is broken.

**First-5-Minutes Score: 7/10**

**Fix:**
1. Add a "Learn more" button in the empty state that shows: "Try typing `>` for actions, `@` for users"
2. Show a loading indicator during search so users know something is happening
3. Surface 3 random "Did you know?" tips in the placeholder rotation

---

### 3. Pinned Notes

**First Impression:** Instant understanding.

**What Works:**
- **Double-click to create is magical.** There's no "Add Note" button to find. Users discover the interaction by accident—they double-click, and a note appears. This feels native, like the dashboard has always done this.
- **Visual metaphor is universal.** Sticky notes. Everyone understands sticky notes. No learning curve.
- **Color options are self-explanatory.** Yellow, blue, green, pink, orange. No labels needed.

**Where Users Get Lost:**
- **Multi-user features aren't discoverable.** @mentions exist, but new users won't know. Acknowledgments exist, but there's no indication that teammates can see them.
- **Note aging may feel like a bug.** Notes fade over time. A user sees a 4-day-old note looking faded and thinks "Why does this look weird?" The aging is intentional, but it's not explained.
- **No empty-state guidance.** On a fresh install, the dashboard widget is... empty? Blank? What does a user see before they create their first note?

**First-5-Minutes Score: 8/10**

**Fix:**
1. Add a subtle welcome card in the empty state: "Double-click anywhere to leave a note. @mention teammates to notify them."
2. Add a tooltip on the first acknowledgment: "Your teammates will see you've read this."
3. Consider a brief visual legend for aging: "Fresh notes are bright. Older notes fade."

---

### 4. Great Minds Plugin

**First Impression:** This is a power-user tool, and that's okay.

**What Works:**
- **Clear command structure.** `/agency-start`, `/agency-launch`, `/agency-debate`. Users who read the documentation know exactly what to type.
- **SCOREBOARD.md provides validation.** "17 projects shipped" tells new users this system works. Social proof built into the tool.

**Where Users Get Lost:**
- **Too many commands to start.** 17 slash commands. A new user has no idea which one to begin with. The entry point isn't clear.
- **No "hello world" example.** There's no "run this PRD and watch what happens" tutorial. New users have to write a PRD from scratch without seeing one succeed first.
- **Pipeline terminology is specialized.** "Debate R1/R2," "Essence," "Wave-based execution"—these mean nothing to someone who hasn't read the docs.

**First-5-Minutes Score: 5/10**

**Fix:**
1. Create a `/agency-tutorial` command that walks through a sample PRD (e.g., "build a Hello World landing page")
2. On first run, suggest: "Try `/agency-start my-first-project` to create a workspace"
3. Add a "Quickstart" section to the README showing the 3 commands a new user needs: `start`, `launch`, `status`

---

### 5. Shipyard AI

**First Impression:** Confident and clear, but passive.

**What Works:**
- **The promise is compelling.** "PRD in. Production site out." That's a bold claim, and the website delivers it with confidence.
- **Pricing is transparent.** Token budgets by deliverable type. No hidden costs. Users know what they're buying.
- **Example sites are live.** Bella's Bistro, Peak Dental—users can click and see real output.

**Where Users Get Lost:**
- **How do I actually start?** The website explains what Shipyard does but doesn't have a clear "Submit your PRD here" CTA. Where does the journey begin?
- **No self-service.** Users can't sign up, create an account, and paste a PRD. It's a service, not a product. That's fine, but the handoff point is unclear.
- **Client dashboard doesn't exist.** Users who've submitted a project can't see progress. They rely on Slack/email. This is acceptable but not delightful.

**First-5-Minutes Score: 6/10**

**Fix:**
1. Add a "Start a Project" button that leads to a simple intake form (name, scope, budget)
2. Build a minimal client portal showing project status: "DEBATE → PLAN → BUILD → REVIEW → LIVE"
3. On the homepage, show a video of the pipeline in action: "Watch how a PRD becomes a website"

---

## Cross-Product Patterns

### Pattern 1: Empty States Are Neglected
Dash, Pinned, LocalGenius—none of them have considered what a brand-new user sees before they've done anything. An empty state is your first conversation with a user. Make it count.

**Recommendation:** Every product should have a welcome card/tutorial that appears on first use and disappears after one action.

### Pattern 2: Advanced Features Are Hidden
Dash's command modes. Pinned's @mentions. LocalGenius Lite's voice customization. These features exist but aren't surfaced. Power users will find them; everyone else won't.

**Recommendation:** Use progressive disclosure. After a user completes their first action, surface the next feature: "Did you know you can also...?"

### Pattern 3: The "Aha!" Moment Needs to Happen Faster
- Dash: Cmd+K → instant search → "Aha!" (within 10 seconds)
- Pinned: Double-click → note appears → "Aha!" (within 5 seconds)
- LocalGenius: Install → ... → (no "Aha!" because frontend isn't built)
- Shipyard: Read website → ... → (no "Aha!" because there's no interactive element)

**Recommendation:** Every product should deliver value within 60 seconds. If that's impossible, show a video of value being delivered.

---

## Top Recommendations

### 1. Ship LocalGenius Frontend (CRITICAL)
This product cannot create a first impression because it doesn't render. The architecture is beautiful. The experience is non-existent. Fix this before anything else.

### 2. Add Welcome Cards to All Products
Every product should greet new users with:
- One sentence: what this does
- One action: what to do next
- One invitation: "Explore more"

### 3. Create a "30-Second Demo" Video for Shipyard
The website explains; it doesn't show. Record a screencast: "Here's a PRD. Here's the pipeline running. Here's the site that came out." That video is worth 10 paragraphs of copy.

### 4. Add Progressive Feature Discovery
After users complete their first action, introduce the next capability. Dash after first search: "Pro tip: Type > to execute commands." Pinned after first note: "Tag teammates with @username."

---

## Final Assessment

Two products (Dash, Pinned) nail the first-5-minutes. Users discover value immediately and feel smart.

Two products (Great Minds, Shipyard) are powerful but require commitment. That's acceptable for B2B tools targeting developers and agencies.

One product (LocalGenius) fails the first-5-minutes because it physically cannot be used. This is the highest-priority fix across the entire portfolio.

**The unifying theme: Make users feel successful, not confused.** Every minute spent wondering "Am I doing this right?" is a minute that erodes trust. These products are capable of delivering delight—make sure users get there.

---

*Oprah Winfrey*
*IMPROVE Cycle 2026-04-14*
