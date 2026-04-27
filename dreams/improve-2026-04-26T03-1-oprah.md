# Board Review — Oprah Winfrey
**Date:** 2026-04-26
**Cycle:** featureDream IMPROVE
**Focus:** New user confusion, first-5-minutes

---

## Executive Summary

I have watched thousands of people sit down with a product for the first time. I know the micro-expression when someone feels welcomed versus when they feel judged by their own confusion. Right now, four of our five products create confusion within the first five minutes. Only one — Pinned — passes the "someone's glad you're here" test.

**Verdict:** We are building for engineers and hoping users will catch up. That is backwards.

---

## Product-by-Product Assessment

### 1. LocalGenius — MINUTE 5: SHE CLOSES THE TAB

**The scenario:** A restaurant owner hears about LocalGenius. She installs the WordPress plugin. She clicks "LocalGenius" in the admin menu. She sees...

What does she see? Based on current deliverables: an incomplete dashboard with no preview panel, no widget visible, no confirmation that anything works, and a configuration screen that assumes she knows what "D1 database" means.

**The specific failures:**
- **No auto-detected welcome:** The business detector code exists but the wizard is incomplete. She should see "Bella's Bistro — Italian, 247 Main St" with a single "Yes, that's me" button. Instead she sees blank fields.
- **No live preview:** The activation sprint was held at 6/10 specifically because the preview panel was missing. She cannot see the chat widget as her customers would see it. She has to imagine it.
- **No confirmation of success:** After configuration, there's no "Your widget is live" moment. No test question she can ask to watch it work.
- **Category templates exist but are invisible:** The FAQ pre-population for restaurants, dental, retail exists in code but never surfaces to the user.

**Oprah's directive:** The 60-second onboarding is not a feature. It is the product. Without it, we are asking a busy restaurant owner to do engineering. She will not. She will close the tab and go handle a customer.

**Fix:** Ship the onboarding wizard with auto-detection + live preview + one-button activation. Nothing else matters until this works.

---

### 2. Dash / Beam — A DOOR WITH NO HANDLE

**The scenario:** A WordPress user installs Beam. They activate the plugin. They look for a settings page. There isn't one. They look for a menu item. There isn't one. They don't know Cmd+K works because no one told them.

**The specific failures:**
- **Zero onboarding:** The locked decision says "Zero onboarding — no tutorials." That decision was strategic suicide. Zero onboarding is not minimalism; it's exclusion.
- **No discoverability hint:** No first-run overlay saying "Press Cmd+K to teleport." No subtle indicator in the admin bar. No pulsating dot. Nothing.
- **No mobile consideration:** WordPress admin on tablet has no Cmd key. How does this user discover Beam? They don't.
- **No empty state guidance:** When the palette opens, it shows a blank search box. No suggested commands. No "Try searching for 'Posts' or 'Users'." Just emptiness.

**Oprah's directive:** Add a one-time hint overlay on first admin page load: "Press Cmd+K to teleport anywhere." It disappears after first use. That single line transforms exclusion into invitation. Also: add a visible search icon in the admin bar for discoverability.

---

### 3. Pinned — WARM, BUT NOT WELCOMING

**The scenario:** A team member logs into WordPress. They see the Pinned dashboard widget with sticky notes. There's a sample agreement seeded on activation. They read it. They see checkboxes. They don't know they can create new notes.

**The specific failures:**
- **Double-click empty space is not discoverable:** The readme says "Zero-friction creation — double-click empty space, start typing." But no one reads readmes. A user sees notes and assumes they're admin-generated.
- **No color meaning:** Five colors (yellow, blue, green, pink, orange) with no semantic labels. Users don't know if yellow means "urgent" or "idea" or "meeting notes." Colors without meaning create anxiety.
- **No guided first note:** The sample agreement is legal text. It doesn't teach. The first note should be a welcome note from "Pinned" explaining: "Double-click to create. @mention someone to notify. Check the box to acknowledge."

**Oprah's directive:** Replace the sample agreement with a welcome note that teaches by doing. Add a "New Note" button that is always visible. Give colors default meanings (yellow = general, red = urgent, blue = idea, green = done, pink = meeting) that users can override.

---

### 4. Great Minds Plugin — WHICH ONE AM I?

**The scenario:** A developer hears about Great Minds. They go to the repo. They see three installation methods: Full Agency, Lite, DXT. They don't know which they need. They read 390 lines of README and still aren't sure.

**The specific failures:**
- **Three paths, no guidance:** The README presents all three as equals. There is no decision tree. No "Start here if..." No "You want this if..."
- **Cowork vs. Code vs. Desktop:** The DXT path mentions "Desktop app bundle" but doesn't explain when that's preferable to Claude Code plugin.
- **No first-run wizard:** After installation, there's no "Let's set up your first project" flow. The user must read docs to understand the `prds/` directory convention.

**Oprah's directive:** Add a 3-line decision tree at the top of the README:
> - **Technical team + autonomous builds?** → Full Agency (Claude Code plugin)
> - **Solo developer, manual control?** → Lite (Cowork/Code)
> - **Non-technical stakeholder?** → Desktop (DXT bundle)

Also: add a `great-minds init` CLI command that asks 3 questions and generates the first PRD template.

---

### 5. Shipyard AI — BROKEN HANDSHAKE

**The scenario:** A potential customer visits www.shipyard.company. They're on their phone. They see the site. They want to learn more. They tap "Contact." The form submits nowhere. They tap the hamburger menu. It doesn't exist.

**The specific failures:**
- **Contact form is decorative:** QA Report #001 identified the contact form submits via GET to nowhere. It is a wall without a door.
- **No mobile navigation:** The site is unusable on mobile below the fold. On a phone, navigation simply doesn't exist.
- **No interactive demo:** We claim "autonomous site builder" but there's no "See it build a site in 2 minutes" demo. The user must imagine.
- **No client portal link:** We built a client portal but never deployed it. Customers can't see their project status.
- **No maintenance subscription CTA:** We built a $199-500/month maintenance offering but there's no way to buy it on the site.

**Oprah's directive:** Fix the contact form and mobile nav immediately — these are not improvements, they are repairs. Then add an interactive demo: a 90-second video or live build walkthrough. Finally, deploy the client portal and maintenance subscription CTAs. The user should feel invited, not abandoned.

---

## Top First-5-Minutes Improvements

| Rank | Improvement | Product | User Moment |
|------|-------------|---------|-------------|
| 1 | Fix contact form + mobile nav | Shipyard AI | "They actually respond" |
| 2 | Ship onboarding wizard + live preview | LocalGenius | "Yes, that's me" |
| 3 | Add Cmd+K hint overlay + admin bar icon | Beam | "Oh, that's how" |
| 4 | Welcome note + visible "New Note" button | Pinned | "I can do this too" |
| 5 | README decision tree + `init` CLI | Great Minds | "I know where to start" |

---

## Oprah's Closing Thought

> "Every product is a first impression. You don't get to explain yourself later. If someone feels stupid in minute three, they will not stay for minute five. The highest-leverage work you can do is not add features. It is remove the fear of not knowing what to do next."
