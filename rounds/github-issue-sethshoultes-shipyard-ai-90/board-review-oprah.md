# Board Review — Oprah Winfrey

**Issue:** sethshoultes/shipyard-ai#90
**Deliverable:** AgentPress WordPress Plugin v1
**Date:** 2026-05-03

---

## Verdict: Solid bones. Missing soul.

---

### First-5-Minutes Experience: Overwhelmed, not welcomed.

- Dream promised "Zapier for AI agents" with drag-drop canvas.
- Built: REST endpoint + settings page under Tools.
- New user installs, sees empty log table, reads "Use the API endpoint at…"
- Needs cURL knowledge. Needs API keys from two vendors.
- No guided setup. No first-run magic. No "Add Node → Run → Wow" moment.
- Developer tool disguised as a product.

### Emotional Resonance: Flat.

- No celebration when content generates.
- No encouragement in copy. No warmth.
- "AgentPress" name has energy. The UI drains it.
- Empty-state message is a command, not an invitation.
- Where is the *delight*?

### Trust: Conditional.

- Code is clean. WordPress-native patterns. Sanitization in place.
- Anthropic ToS disclosure present. Good.
- API key masked in password field. Good.
- But: only `manage_options` users can access. No rate limiting visible.
- No budget caps in plugin layer — relies entirely on external keys.
- Would not recommend to my audience without guardrails.

### Accessibility: Many left behind.

- Non-developers: excluded. cURL is a barrier.
- Small business owners without dev teams: excluded.
- Screen reader users: status pills lack ARIA labels.
- Non-English speakers: no i18n beyond WordPress boilerplate strings.
- Mobile-first users: no mobile workflow. Desktop admin only.
- Low-vision users: green/red status pills rely on color alone.

### Score: 5/10

Engineering is competent. The dream was a visual builder for non-developers. The deliverable is a backend API wrapper. Gap between promise and reality is canyon-wide. What got built is trustworthy infrastructure. What was needed was an invitation.

---

## Specific Notes

- **Admin page** is one screen under Tools. Clean, minimal. But feels like a configuration panel, not a creative studio.
- **REST API** requires Application Passwords or admin login. No simpler auth path.
- **Keyword routing** is smart and fast. Claude fallback is well-implemented.
- **Parser** has 14 test cases. Brace-matching extraction is genuinely good work.
- **Auto-pruning logs** shows operational maturity.
- **SEO Meta agent** is in file list but not wired in spec decisions. Dead code?
- **Decisions.md** talks about "Forge" web app, Cloudflare Pages, D1, R2. Deliverable is a WordPress plugin. Mismatch suggests scope collapse or confusion.

## What Would Move the Needle

1. **Visual task builder** — even a simple form, not cURL.
2. **Onboarding wizard** — "What do you want to create today?"
3. **Live preview** — see content before saving.
4. **Tone and length presets** with friendly names, not enums.
5. **Success celebrations** — confetti, toast, something human.
6. **Accessibility audit** — ARIA labels, color-blind safe indicators.

---

*You get in life what you have the courage to ask for. This team had the courage to dream big. Now they need the courage to build what people can actually touch.*
