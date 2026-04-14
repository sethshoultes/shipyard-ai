# Board Review: FormForge — Form Builder Plugin

**Reviewer:** Oprah Winfrey, Board Member
**Date:** 2026-04-14
**Deliverable:** github-issue-sethshoultes-shipyard-ai-33

---

## First-5-Minutes Experience

**Verdict: Welcomed, not overwhelmed** ✨

I put myself in the shoes of someone who's never built a form before — maybe a small business owner who's finally ready to connect with her customers. And you know what? This could work for her.

The "Ask something" feature is the star here. Instead of staring at a dropdown of field types wondering "what's the difference between text and textarea?", she can simply type: "What's your email?" That's *human*. That's meeting people where they are.

The Contact Form template is a thoughtful starting point — it doesn't presume expertise. Three fields: Name, Email, Message. Done. She's not drowning in options.

**However**, I have one concern: There's no onboarding flow documented. When she lands in this admin panel for the first time, does she see an empty list saying "No forms yet"? That's functional, but it's not *welcoming*. A first-time user should feel guided, not abandoned.

---

## Emotional Resonance

**Does this make people feel something?** Yes — but it's subtle.

The success message "Thank you! We'll get back to you soon" is warm. The email notifications with that gradient header and clean typography — someone cared about making that *feel* professional. When a small business owner sees that email come through, she'll feel legitimate. That's not nothing.

The confidence indicators ("High confidence," "Low confidence") during field inference are *honest*. I love that. We're saying to the user: "We're trying to help, but we might not get it perfect." That builds trust.

What's missing is *delight*. Where's the moment that makes someone smile? A micro-celebration when the first submission comes in? A little congratulations when they publish their first form? The functional bones are here, but the soul needs more warmth.

---

## Trust

**Would I recommend this to my audience?** With caveats.

Here's what I'd tell them:

**The good:** This is built with integrity. The code is clean, well-documented, handles errors gracefully. The validation is solid — emails get checked, phone numbers get verified, required fields are enforced. When someone fills out your form, you won't lose their data. That's the promise, and based on what I see, it keeps it.

**The concerns:**
1. **Status: UNTESTED** — This hasn't been run against a real Emdash instance yet. I can't recommend something to millions of people that hasn't been battle-tested. The PRD says it clearly: "Has NOT been tested against a real Emdash instance." That's a non-starter for a public recommendation.

2. **Email dependency** — If someone doesn't have an email plugin configured, they're flying blind on submissions. The warning banner is there, but will a non-technical user understand what "Install an email plugin (like Resend or SMTP)" means?

3. **No spam protection mentioned** — I see IP address collection, but where's the honeypot? The rate limiting? The CAPTCHA option? My audience includes people with *audiences* — they'll get hammered by bots.

---

## Accessibility

**Who's being left out?**

Let me be direct: **I don't see accessibility considered at all.**

- No ARIA labels documented in the admin UI
- No mention of keyboard navigation for the form builder
- No color contrast requirements for the theming
- No screen reader considerations for the "Ask something" inference feedback
- The phone validation assumes a specific format — what about international users?

When someone uses a primary color of `#3B82F6` (blue) on white, is that WCAG AA compliant? What if they pick yellow? There's no guardrails.

This is a form builder. Forms are how people *ask for help*, *make appointments*, *apply for opportunities*. If someone can't navigate this form with a screen reader, we've told them they don't matter. That's not acceptable.

**Specific gaps:**
- Visually impaired users may struggle with the color-based theme preview
- Users with motor disabilities need keyboard-accessible drag-and-drop for field reordering
- Non-English speakers? No i18n support visible
- The confidence indicators rely on color/text — what about users who can't perceive that distinction?

---

## Score: 6/10

**One-line justification:** Solid technical foundation with genuinely human-centered design choices, but untested status and absent accessibility considerations prevent this from being ready for the people who need it most.

---

## Recommendations Before Public Release

1. **Test it.** Actually deploy this against Emdash. Get real submissions. Find the edge cases.

2. **Accessibility audit.** Every form field, every admin control needs ARIA labels, keyboard navigation, and focus states. This isn't optional.

3. **Add onboarding.** A simple "Welcome! Let's create your first form" wizard would transform the first-5-minutes experience.

4. **Spam protection.** At minimum, add honeypot fields and rate limiting. Consider offering CAPTCHA as an option.

5. **Delight moments.** Celebrate first form creation, first submission. Small things that make people feel successful.

6. **Internationalization.** Even basic support for different phone formats and eventually translated strings.

---

*"The biggest adventure you can take is to live the life of your dreams." And for many small business owners, connecting with their customers through a simple form IS part of that dream. Let's make sure we're not leaving anyone behind.*

— Oprah
