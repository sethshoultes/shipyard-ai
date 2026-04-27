# Shonda Rhimes Retention Roadmap
## WP Intelligence Suite — What Keeps Users Coming Back

---

## The Premise

Every user is the protagonist. The plugin is not a tool. It is the brilliant, slightly psychic colleague who arrives early, remembers everything, and never sleeps. Retention is not about features. It is about **relationship**. People do not unsubscribe from teammates. They unsubscribe from software.

The question is not *"What does v1.1 do?"* The question is: **What makes the user open the dashboard tomorrow because they have to know what happens next?**

---

## What Keeps Users Coming Back

### 1. The Accumulated Self (Pinned as Memory)
**The hook:** Every agreement saved, every checklist completed, every SOW pinned — that is backstory. The user has invested their institutional memory into this product. Uninstalling is not deleting an app. It is burning a diary.

**Retention mechanic:** Switching cost rises with every document pinned. The product becomes the source of truth. The longer it lives, the truer that becomes.

### 2. The Curiosity Loop (LocalGenius as Mirror)
**The hook:** Users do not just install a FAQ widget. They install a **listening device** that tells them what their customers are actually thinking. Every search term is a plot twist. *"They searched WHAT at 3 AM?"*

**Retention mechanic:** The visitor search log is a cliffhanger. Users check it the way showrunners check ratings. It is ego, insight, and paranoia in one feed. They come back to see the story their audience is writing.

### 3. Team Dependency (Dash as Ensemble Cast)
**The hook:** A solo protagonist gets boring. The product retains users when the *team* retains the product. When the designer checks Dash for their @mention. When the project manager lives by the status column. When the client asks, *"Is that in Pinned?"*

**Retention mechanic:** Network effects inside the org. One user installs it. Two users depend on it. By month three, removing it is a team decision, not a personal one.

### 4. The Weekly Cliffhanger
**The hook:** Users need a reason to return that is not an emergency. They need anticipation. *What did visitors ask this week? What agreement is about to expire? Who got mentioned and never answered?*

**Retention mechanic:** A digest that feels like a teaser trailer for next week's episode. Not a report. A preview.

### 5. Emotional Competence
**The hook:** WordPress users are battered. They have installed forty plugins that broke, nagged, or vanished. This product makes them feel **seen**. The language is warm. The limits are honest. The dashboard does not scream. It whispers.

**Retention mechanic:** Trust. In a market of grifters, the product that acts like a grown-up keeps the user.

---

## v1.1 Features: The Next Season

These features deepen the relationship. They do not add complexity for complexity's sake. They add **reasons to return**.

### Episode 1: "Previously On..." — Visitor Insights Dashboard
**What:** A lightweight analytics view inside wp-admin showing what visitors searched, what they found, and what they did not. Search terms. Unmatched queries. Resolution rates.

**Why it retains:** The user opens this the way a showrunner opens overnight ratings. It feeds ego and anxiety. *"I thought they cared about pricing. They care about integrations. I need to rewrite the story."*

**Scope:** No external analytics infrastructure. Read from existing LocalGenius query logs. One beautiful screen. Exportable CSV for the data-obsessed.

---

### Episode 2: "You Have a Message" — @Mention Notifications
**What:** When a team member is @mentioned in Dash, they get a WordPress notification (and optional email) with context and a direct link.

**Why it retains:** Turns Dash from a bulletin board into a conversation. People do not ignore mentions. It is social obligation encoded as software. The product becomes the place where things are decided.

**Scope:** WP-native notification API. One email template. Off by default, opt-in per user.

---

### Episode 3: "The Next Episode" — Lazy AI FAQ Generation
**What:** Steve's deferred magic. The user clicks a button and watches a brilliant loading state while the AI reads their site and suggests new FAQ entries. Review, edit, publish. Smart magic, not surprise magic.

**Why it retains:** This is the feature the user knew was coming. The anticipation is part of the hook. It transforms the product from static to **alive**. The FAQ grows with the business.

**Scope:** Lazy loading only. Explicit user consent before first scrape. Hard timeout (15s) with graceful fallback to template suggestions. No activation-time calls.

---

### Episode 4: "The Writers' Room" — Curated Template Packs
**What:** A seasonal drop of pre-built FAQ packs, Dash note templates, and Pinned agreement frameworks. eCommerce Summer. Nonprofit Grant Season. Agency Onboarding Fall.

**Why it retains:** Binge-worthy content drops. Users return to see what is new. It makes the product feel **current**, not abandoned. It is the Netflix release model applied to B2B software.

**Scope:** Not a marketplace. Curated by the team. JSON import packs. One-click install. No payments, no sellers, no two-sided complexity.

---

### Episode 5: "The Recurring Guest" — Pinned Reminders & Renewals
**What:** Agreements with expiration dates. Automatic reminders 30, 14, and 7 days before expiry. Status changes to "Needs Renewal." One-click duplicate for re-upping.

**Why it retains:** The product becomes the calendar the team was never disciplined enough to keep. Users do not just store agreements. They **depend** on the product to manage them.

**Scope:** WP Cron. One admin notice. No external calendar sync in v1.1.

---

### Episode 6: "The Cold Open" — Weekly Digest Email
**What:** Every Monday, a single email: what visitors asked for, what the team resolved in Dash, and what agreements expire soon. Subject line: *"Your week in 30 seconds."*

**Why it retains:** The product steps out of WordPress and into the inbox. It becomes a habit before the user opens wp-admin. The best retention is the habit the user does not know they formed.

**Scope:** WP Cron + wp_mail. One beautiful template. Unsubscribe link required. No external ESP.

---

### Episode 7: "The Crossover" — Agency Export / Import
**What:** Export all Pinned agreements and Dash notes as a JSON bundle. Import into a new site in one click. WP-CLI support: `wp wis export --site=client-a`.

**Why it retains:** Agencies managing ten sites do not want to rebuild the workspace every time. This makes the product **sticky at the portfolio level**. The more sites use it, the harder it is to leave.

**Scope:** JSON schema. WP-CLI command. No cloud sync. Local file only.

---

### Episode 8: "The Slow Burn" — Smart Upgrade Nudges
**What:** Instead of hitting a hard wall at 50/50, the product starts a conversation at 35. *"Your visitors are chatty this month. Want me to keep listening?"* At 45: *"Five answers left. I can stay up all night if you upgrade."*

**Why it retains:** Warmth converts better than walls. The user feels guided, not trapped. It turns the paywall into a dialogue.

**Scope:** Invisible tier check + contextual message. No new infrastructure.

---

## What v1.1 Says NO To

- **Two-sided template marketplace.** Still a startup. Still not a feature.
- **Live chat support integration.** Documentation-first. Scale support later.
- **Advanced AI chatbot.** v1.1 is intelligence, not conversation. The FAQ is the product.
- **Mobile app.** The admin is wp-admin. The audience is site visitors. A separate app is a separate product.
- **Third-party integrations (Slack, Notion, etc.).** Every integration is a support burden. The product must stand alone before it connects.

---

## The Arc

| Phase | Theme | Retention Engine |
|-------|-------|------------------|
| **v1.0** | The Pilot | Zero-setup first impression. The user falls in love in 30 seconds. |
| **v1.1** | The Ensemble | Team dependency, visitor curiosity, and weekly habit loops form. |
| **v1.2** | The Twist | AI generation goes live. The product becomes alive, not just useful. |
| **v2.0** | The Event | Template marketplace, agency dashboards, and multi-site sync. The universe expands. |

---

## Final Note from the Showrunner

The user does not wake up wanting to manage a WordPress plugin. They wake up wanting to feel **on top of things**. They want to believe their business knows what it is doing. They want to sleep through the night while someone else answers the 11 PM email.

Retention is not a feature list. It is the feeling the user gets at 3 AM when they check their phone and see that the visitor already found their answer. That is the episode they will come back for.

**Make them feel like the main character. The rest is just plot.**
