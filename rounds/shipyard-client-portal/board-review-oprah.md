# Board Review: Shipyard Client Portal
**Reviewer:** Oprah Winfrey
**Date:** 2026-04-15
**Lens:** First-5-Minutes Experience, Emotional Resonance, Trust, Accessibility

---

## First Impression: Would You Feel Welcomed or Overwhelmed?

**Overwhelmed by absence.**

Landing page shows clean design but doesn't answer basic question: "How do I start?"

Copy says "Track your builds" and "Get notified when site goes live" — but where's intake form? Where's "Submit your PRD here"?

Two CTAs compete: "Get Started" and "Sign In to Your Portal." Same visual weight. New visitor doesn't know which one leads to project submission.

Click "Get Started" → signup form. Not intake. Still don't know how to request website.

Dashboard after login: Empty. "Projects will appear here when you submit project intake and complete payment." But no visible path to do that.

**First 5 minutes = confusion about how to use the portal.**

---

## Emotional Resonance: Does This Make You Feel Something?

**No.**

Copy flat. Generic SaaS language.

"Your Website Projects, Delivered & Managed" could be swapped with hundred competitors.

"Track your website builds in real-time" — clinical. Doesn't connect.

No moment that makes you exhale with relief. No "finally, someone gets it."

Dashboard shows email address and empty state message. Nothing that says "we're excited you're here."

Maya Angelou review nailed it: "Nobody cares about 'real-time.' They care about not being left in the dark."

**Missing warmth. Missing humanity.**

---

## Trust: Would You Recommend This to Your Audience?

**Not yet.**

Three red flags:

### 1. Inconsistent design signals unprofessionalism
- Landing page uses zinc colors + black buttons
- Login uses gray colors + indigo buttons
- Signup uses slate colors + blue buttons
- Border radius switches between `rounded-md` and `rounded-lg`

Jony Ive review caught this: "Three different brand colors for primary action. Unacceptable."

If they can't maintain visual consistency across 3 pages, can they maintain my website?

### 2. Missing core functionality
PRD requires:
- Project intake form with Stripe payment
- Retainer subscription management
- Post-launch analytics
- Project status tracking

Deliverables only show:
- Auth pages (signup, login, password reset)
- Empty dashboard
- API structure for webhooks

**Critical features absent.** Can't actually submit project or see status.

### 3. Copy lacks confidence
- "Projects will appear here when..." = apologizing for emptiness
- "Session expires after 7 days of inactivity" = unnecessary technical detail on welcome screen
- Placeholders like "you@example.com" feel patronizing

**Would not recommend. Feels half-built.**

---

## Accessibility: Who's Being Left Out?

### Color contrast concerns
Signup form uses:
- `text-gray-500` placeholder on `bg-slate-800` input
- `text-gray-400` body text

Likely fails WCAG AA for low vision users.

Login uses `text-gray-400` for link text. Borderline.

### No keyboard nav indicators visible
Forms don't show custom focus states in code review. Relying on browser defaults.

### Loading states inadequate
Dashboard loading: plain text "Loading..." centered. No ARIA label. Screen reader announces nothing until content appears.

### No skip links
Auth pages lack "skip to main content" for keyboard users.

### Positive notes
- Semantic HTML (labels properly associated with inputs)
- Form validation includes error messages
- Alt text pattern appears consistent

**Moderate accessibility. Passing basics but not thoughtful inclusion.**

---

## What's Missing for Trust

### Transparency gaps
No pricing displayed anywhere. PRD shows $500-1,500 for sites, $299/month retainer — but portal hides this.

User signs up blind. Won't discover cost until... when? After filling intake form?

### No social proof
No testimonials. No "27+ completed PRDs" mentioned in problem statement. No example sites.

If you've proven delivery, show it.

### No clear guarantee
What if build fails? What's refund policy? Terms/Privacy links in footer but no reassurance upfront.

---

## Score: 4/10

**Justification:** Foundation exists but house unfinished. Auth works, design shows taste, but can't actually do what PRD promises.

---

## Path to 8/10

### 1. Answer "How do I start?" in first 5 seconds
Add clear intake CTA on dashboard: "Start Your First Project" button that jumps to form.

Or: remove dashboard entirely for new users. Signup → immediately show intake form.

### 2. Inject warmth
Rewrite copy per Maya's suggestions. Replace clinical language with human voice.

Welcome message: "We're building your website. You'll know exactly where we are, every step."

### 3. Show pricing transparency
Add pricing page. Link from landing page. No surprises.

### 4. Build missing features
- Intake form with scope selection + Stripe checkout
- Project status view with progress indicators
- Basic analytics stub (even if data not flowing yet)

Showing work-in-progress better than showing nothing.

### 5. Fix visual inconsistency
One color palette. One button style. One border radius. Everywhere.

Per Jony: "Make one decision and repeat it everywhere."

### 6. Add proof
Show example project. Link to live site built by Shipyard. "See what we built for [Company X]."

### 7. Improve accessibility
- Bump text contrast to AA minimum
- Add visible focus indicators
- Include skip links
- Replace "Loading..." with proper skeleton + ARIA

---

## What I'd Tell the Team

You're building infrastructure but forgetting experience.

Database schema solid. Auth flow works. Webhook architecture makes sense.

But person who signs up doesn't see any of that. They see empty dashboard and wonder "what now?"

**PRD promises self-service intake. Deliver self-service intake.**

Right now this feels like internal tool pushed to users too early. Needs one more sprint focused purely on onboarding flow and emotional clarity.

Show me version where new user signs up and within 2 minutes understands:
1. How to submit project
2. What it costs
3. When they'll see progress
4. Why they should trust you

Then we talk about retainers and analytics.

**First-5-minutes experience is everything. Fix that, everything else follows.**
