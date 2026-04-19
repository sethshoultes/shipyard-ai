# Board Review: LocalGenius Lite (SPARK)
**Reviewer:** Oprah Winfrey, Board Member
**Date:** 2026-04-19
**Product:** SPARK AI Chat Widget

---

## First-5-Minutes Experience: 6/10

**What works:**
- Purple widget button appears instantly—visually striking
- Clean, Apple-inspired aesthetic feels premium
- Welcome message greets users warmly
- Streaming responses create sense of magic

**What breaks connection:**
- Zero onboarding. Widget just... appears
- No "What is this?" explanation on first encounter
- User must figure out it answers questions about *this page only*
- Landing page beautiful but too developer-focused
- "Try asking: What is SPARK?" — cold, transactional prompt

**Missing emotional bridge:**
- Where's the warmth? The invitation?
- Widget feels like a feature, not a friend
- No personality in AI responses beyond "helpful assistant"
- Typing indicator is mechanical—no humanity signal

**Would a visitor feel welcomed?**
Not yet. They'd feel *served*, not *seen*.

---

## Emotional Resonance: 5/10

**Fails to make people feel:**
- PRD says "zero configuration" like it's aspirational. It's functional.
- Landing page hero: "Your website, instantly brilliant." Corporate. Forgettable.
- AI responses factual, not conversational
- No moment of delight. No surprise. No "Oh wow!"
- Widget appears, answers questions, disappears. Transactional.

**Missing the spark (ironically):**
- Name is SPARK but experience is fluorescent bulb
- No story told. Why should small business owner care?
- Documentation obsesses over tech (Shadow DOM, 10KB gzip) — users don't feel tech specs
- "Privacy-first" buried in features. Could be emotional anchor ("We don't spy. Ever.")

**One glimmer:**
- "I don't see that information on this page" response shows humility
- Widget doesn't pretend to know everything—builds trust through honesty

But honesty alone isn't resonance.

---

## Trust: Would I Recommend This? 7/10

**Yes, but with reservations.**

**Why I'd recommend:**
- Does what it says. One script tag, widget appears, answers questions.
- No tracking/cookies stance aligns with values
- Price point ($9/mo) accessible for small businesses I champion
- Claude-powered = quality baseline
- Shadow DOM isolation shows technical care (won't break sites)

**Why I'd hesitate:**
- Feels half-finished emotionally
- No dashboard to see what visitors are asking—business owner blind
- Free tier only 100 questions/month—too stingy for trial
- No conversation history = can't build relationship over time
- "Powered by SPARK" branding in free tier feels extractive, not generous

**Trust gaps:**
- No domain verification. Anyone can scrape anyone's content?
- Rate limiting exists but abuse mitigation unclear
- What happens when Claude API goes down? No fallback mentioned.
- Who's behind this? Landing page has generic "hello@usespark.com"—no faces, no story

**Would recommend to:**
Tech-savvy small business owners willing to experiment.

**Would NOT recommend to:**
Anyone needing hand-holding or emotional design.

---

## Accessibility: Who's Being Left Out?

**Left out:**
- **Non-technical users:** "Paste this script tag" assumes HTML access. Wix/Squarespace users struggle.
- **Screenreader users:** No ARIA labels visible in widget code. Shadow DOM may cause issues.
- **Low-vision users:** Purple gradient beautiful but no high-contrast mode detected.
- **Keyboard-only users:** Enter key works but no visible focus states in components.
- **Non-English speakers:** Widget hardcoded English. AI responds in English only (Claude limitation).
- **Slow connections:** 10KB widget loads fast but no offline state handling.
- **Mobile users on small screens:** Panel is 380×520px. May overwhelm <375px phones.

**Financially left out:**
- Free tier 100 questions/month = ~3 questions/day. Blog with modest traffic burns through this.
- Jump to $9/mo for 1,000 questions steep for hobbyists.
- No "pay as you go" option for seasonal businesses.

**Cognitively left out:**
- No progressive disclosure. All features visible at once.
- Widget button has no label—just icon. Not obvious to click.
- Error messages technical: "Failed to fetch." Should say "Connection lost. Try again?"

**Emotionally left out:**
- Anyone who needs their hand held.
- Anyone who wants to feel special, not served.

---

## Score: **6.5/10**

**One-line justification:**
Technically solid but emotionally hollow—builds utility, not humanity.

---

## What This Needs to Become Recommendable

**Make it feel:**
1. Widget first appearance: friendly tooltip. "Hi! I can answer questions about this page. Try me!"
2. AI voice: less robot, more neighbor. "Great question! Here's what I found..."
3. Landing page: show real person/story. Who built this and why?
4. First-time magic moment: confetti or animation on first successful answer.

**Build trust:**
1. Dashboard even in free tier—show business owner what people ask.
2. Graceful degradation when API fails: "I'm having trouble right now. Try again in a moment?"
3. Faces/names on landing page. Real humans behind product.
4. Domain verification to prevent scraping abuse.

**Include everyone:**
1. ARIA labels everywhere.
2. High-contrast mode toggle.
3. Visual focus indicators for keyboard nav.
4. Multilingual support (at least Spanish).
5. WordPress/Wix plugins—no HTML required.
6. Pay-what-you-can tier for nonprofits.

**Create resonance:**
1. Rename features emotionally: "Privacy-first" → "We never track you. Ever."
2. Hero copy: "Your website, instantly brilliant" → "Every visitor gets instant answers. Like magic."
3. Welcome message: "Hi! I'm here to help..." → "Welcome! What are you curious about?"
4. Add personality toggle: "Professional" vs "Friendly" AI tone.

---

## Final Thought

This is a **refrigerator**, not a **kitchen**.

It works. It's clean. It keeps things cold. But nobody falls in love with their fridge.

People love kitchens where they gather, where warmth lives, where memories get made.

SPARK has potential to be where website visitors feel *welcomed*, not just *answered*.

Right now? It's efficient. But efficiency without empathy is just... code.

---

**Recommendation:** Ship, but immediately invest in emotional layer. Technical excellence means nothing if users feel nothing.

**Next board review:** Show me the moment a small business owner tears up because a visitor wrote "This widget helped me so much." That's when we've arrived.

---

*"People will forget what you said, people will forget what you did, but people will never forget how you made them feel." — Maya Angelou*
