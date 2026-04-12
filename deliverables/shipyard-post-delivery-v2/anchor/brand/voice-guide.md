# Anchor Brand Voice Guide

**Purpose:** Ensure all Anchor emails feel human, warm, and consistent.
**Mitigates Risk:** "Emails feel robotic despite intentions" (MEDIUM/HIGH)

---

## Core Tone

**Confident, warm, slightly irreverent.**

We know what we built. We're proud of it. But we're not corporate—we're builders who happen to run a business. We talk like people, not press releases.

---

## The Core Hook

### Primary

> **"We don't disappear."**

Use this phrase (or a variation) in the first paragraph of every email. It's our differentiator. Every freelancer, agency, and dev shop vanishes after launch. We stay.

### Variations

- "We're still here."
- "Still watching out for you."
- "Not going anywhere."
- "We stick around."
- "Your site has a team behind it—still."

**Rule:** Never bury the hook. First paragraph. Always.

---

## Voice Examples

### DO sound like this:

- "Look what we built together."
- "Your site's been working for you 24/7."
- "Got questions? Hit reply."
- "We're not going anywhere."
- "Need something? We're a reply away."
- "Here if you need us."

### DON'T sound like this:

- "We are pleased to inform you that your website has been deployed."
- "Please do not hesitate to reach out should you require assistance."
- "We hope this email finds you well."
- "As per our previous correspondence..."
- "We would like to take this opportunity to..."
- "Please be advised that..."

---

## Before/After Examples

### Example 1: Project Delivery

**BEFORE (robotic):**
> Dear Client, We are pleased to inform you that your website project has been successfully completed and deployed to the production environment. The deliverable includes 12 pages of content as specified in the project requirements document.

**AFTER (Anchor voice):**
> Your site is live. We built something real together—12 pages, mobile-ready, SEO-optimized. Take a look: {{URL}}. We're not disappearing. Need anything? Reply here.

### Example 2: Check-in

**BEFORE (robotic):**
> This email is to follow up on the status of your recently launched website. Please let us know if you have encountered any issues or require any modifications to the delivered product.

**AFTER (Anchor voice):**
> It's been a week since we launched {{URL}}. How's it going? Anything feel off? We're still here—just reply if you need us.

### Example 3: Upsell

**BEFORE (robotic):**
> We would like to inform you of our maintenance service offerings. Our Basic tier is available at $79 per month and includes content updates, bug fixes, and 48-hour response times.

**AFTER (Anchor voice):**
> Want us to keep watching your site? Anchor Basic is $79/month—content updates, bug fixes, we stay on call. Think of it as peace of mind, not a contract.

---

## Sign-Off Format

Use one of these closings:

**Standard:**
> — The Shipyard AI team

**Personal (for warmer emails):**
> — Shipyard

**With context:**
> — Still here,
> Shipyard

**Never use:**
- "Best regards"
- "Sincerely"
- "Warm regards"
- "Respectfully"

---

## CTA Strategy

Different emails need different energy:

| Email | CTA Type | Example |
|-------|----------|---------|
| Launch Day (Day 0) | **Hard CTA** | "Want us to handle ongoing updates? Anchor starts at $79/mo." |
| Day 7 Check-in | **Soft CTA** | "Here if you need us." |
| Day 30 Refresh | **Hard CTA** | "Ready for updates? Anchor Basic: {{MAINTENANCE_LINK}}" |
| Month 6 Review | **Soft CTA** | "Ready when you are." |

**Hard CTA:** Direct link to payment, specific pricing, clear ask.
**Soft CTA:** Open door, no pressure, relationship-first.

---

## Merge Fields (Approved)

Use these merge fields only:

| Field | Description | Example |
|-------|-------------|---------|
| `{{NAME}}` | Client's first name | Sarah |
| `{{URL}}` | Live site URL | bellabistro.com |
| `{{PAGE_COUNT}}` | Number of pages built | 12 |
| `{{TOKENS_USED}}` | Tokens consumed by project | 245K |
| `{{MAINTENANCE_LINK}}` | Stripe payment link | https://buy.stripe.com/... |

---

## Banned Merge Fields

**Never use these—they become lies or grocery receipts:**

- `{{FEATURE_LIST}}` — Nobody writes custom features. Use "Mobile responsive, SEO optimized" for all.
- `{{REFRESH_SUGGESTION}}` — Nobody writes custom suggestions. Use standardized questions instead.

---

## Anti-Patterns (What NOT to Write)

1. **Opening with logistics**
   - Bad: "Your project code is XYZ-123 and was deployed at 14:32 UTC..."
   - Good: "Your site is live!"

2. **Corporate hedging**
   - Bad: "We believe you may find value in..."
   - Good: "This will help you."

3. **Passive voice**
   - Bad: "Your site has been deployed by our team."
   - Good: "We deployed your site."

4. **Jargon**
   - Bad: "Optimized for Core Web Vitals performance metrics"
   - Good: "Fast on every device"

5. **Empty enthusiasm**
   - Bad: "We're SO excited to share this AMAZING news!!!"
   - Good: "Look what we built."

---

## The Test

Before sending any email, ask:

1. **Would I forward this to a friend?** If not, rewrite.
2. **Does it evoke relief?** Not stress, not obligation—relief.
3. **Could a robot have written this?** If yes, rewrite.
4. **Is "We don't disappear" in paragraph one?** If not, fix it.

---

*Voice guide created per decisions.md Risk Register mitigation.*
*"Confident, warm, slightly irreverent."*
