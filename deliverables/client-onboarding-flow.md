# Shipyard AI — Client Onboarding Flow

*A guide to the complete first-time client experience from initial contact through launch and beyond.*

---

## Overview

When a client comes to Shipyard AI, they're buying speed, quality, and certainty. Our onboarding flow reflects this: clear milestones, transparent communication, and a finish line that ships.

The journey spans 5-7 days from initial contact to live production. Here's how we make that experience seamless.

---

## Stage 1: Discovery (Day 0)

**Goal:** Understand what the client needs to build, assess scope, calculate cost.

**What happens:**
1. Client discovers Shipyard via website, referral, or direct outreach
2. Client submits PRD via one of two paths:
   - **Web form:** Quick intake form at `shipyard.ai/submit-prd`
   - **Email:** Direct to `projects@shipyard.company`

**Required Information:**

The intake form collects:

- **Project Name** — What are we building?
- **Product Type** — Site, theme, plugin, or hybrid?
- **Scope Summary** — Description of the product (2-3 sentences)
- **Pages/Components** — If a site: how many pages? Key sections?
- **Design Requirements** — Brand guidelines? Color palette? Or "modern/minimal"?
- **Content** — Copy provided by client, or do we write it?
- **Integrations** — Payment, analytics, email, third-party APIs?
- **Timeline Preference** — When do you need it? (Informs token budget)
- **Budget Range** — What's your ceiling? (Sets expectations)
- **Contact Info** — Email, phone, timezone, primary contact name

**What we ask in follow-up (if needed):**
- Who are the end users?
- What's the success metric? (signups, sales, engagement)
- Competitors or inspiration sites?
- Any technical constraints or must-haves?

**Deliverable:** Structured intake document in `prds/{client-name}-{date}.md`

---

## Stage 2: Scoping (Day 0-1)

**Goal:** Quote the project, get approval, begin pipeline.

**Process:**

1. **Phil reviews the PRD** (within 4 hours of submission)
   - Calculates token budget based on scope
   - Identifies potential scope creep or missing info
   - Determines timeline (usually 5-7 days)
   - Assigns project to debate leaders (Elon + Steve)

2. **Phil sends scoping email** (see template below)
   - **Tone:** Professional, warm, precise
   - **Contains:**
     - Scope summary (what we understood from the PRD)
     - Token breakdown (debate 10%, build 60%, review 20%, reserve 10%)
     - Estimated timeline (Day 1 kickoff → Day 5-7 launch)
     - What's included vs. excluded
     - Pricing (if paid tier) or token cost
     - Next step: approval & payment/contract

3. **Client approves** (via email, Slack, or dashboard link)
   - Client signs contract (if required)
   - Client makes payment (if applicable)
   - Project moves to READY state

**Email Template: Scoping Quote**

```
Subject: [Shipyard] Your Project Quote — {Project Name}

Hi {Client Name},

Thanks for the PRD! We've reviewed {Project Name} and put together a quote below.

---

SCOPE SUMMARY:
We're building {1-2 sentence description} with {N} pages, {feature list}.

TOKEN BUDGET:
• Total: {X}K tokens
• Debate & Planning: {10%}
• Building: {60%}
• Review & QA: {20%}
• Reserve: {10%}
• Price: ${X} (or: Uses {X}K of your prepaid tokens)

TIMELINE:
• Kickoff: Day 1 (after approval)
• Staging preview: Day 3-4
• Launch: Day 5-7

WHAT'S INCLUDED:
✓ Full design & development
✓ Content optimization
✓ Mobile responsive
✓ SEO basics
✓ One round of revisions (post-launch)
✓ 7-day support window

WHAT'S EXCLUDED:
✗ Advanced integrations beyond scope (costs revision tokens)
✗ Ongoing content updates (separate service)
✗ Custom plugin development (separate service)

NEXT STEPS:
1. Reply "approved" to this email (or sign the attached contract if required)
2. We'll create your project workspace and kick off debate
3. You'll get a Slack channel and email updates at each milestone

Questions? Reply to this email or schedule a 15-min call: {calendly_link}

—

Shipyard AI
```

---

## Stage 3: Kickoff (Day 1)

**Goal:** Officially start the project. Client knows work has begun.

**Process:**

1. **Project workspace created** in `projects/{project-slug}/`
   - Debate folder created: `projects/{slug}/debate/`
   - Debate begins (2 rounds max, running in parallel)

2. **Client communication:**
   - Client invited to Slack channel: `#shipyard-{slug}`
   - Automated welcome email (see template below)
   - Client receives:
     - Project dashboard link (future feature—see Portal section below)
     - Slack channel invite
     - FAQ + how to give feedback
     - Support email: `support@shipyard.company`

3. **Internal kickoff:**
   - Elon & Steve start debate (Day 1, asynchronous)
   - Phil monitors token burn
   - Status updated in STATUS.md

**Email Template: Kickoff Notification**

```
Subject: We've started building {Project Name}!

Hi {Client Name},

Your project is now live in our pipeline. Here's what happens next:

---

WHAT WE'RE DOING RIGHT NOW:
Our team (Elon & Steve, our architects) are debating the best approach for
{project}. This takes about 6-12 hours. We're making decisions about design,
tech stack, and content strategy.

TIMELINE:
• Day 1 (now): Debate phase
• Day 1-2: Build plan + agent assignments
• Day 2-3: Build phase (parallel work)
• Day 3-4: Review & QA
• Day 4-5: Staging preview (you'll see it here)
• Day 5-7: Launch

YOUR NEXT STEP:
Join our Slack channel: {slack_invite_link}
This is where you'll get status updates and can ask questions.

IMPORTANT:
One round of feedback/revisions is included in your token budget.
Additional revisions cost revision tokens ($X per round).
We'll ask for feedback at the staging preview (Day 4).

Questions? Reply to this email or message us in Slack.

—

Shipyard AI
```

---

## Stage 4: Build Updates (Day 1-3)

**Goal:** Keep client informed without requiring their action. Transparency builds trust.

**Automated Status Updates:**

Client receives **automated email + Slack notification** at each pipeline milestone:

**Day 1 Evening: Debate Complete**
```
Subject: [Shipyard] Debate phase complete for {Project Name}

Hi {Client Name},

Our architects just locked down the approach:

✓ Design system: {description}
✓ Tech stack: {description}
✓ Content strategy: {description}

Build starts tomorrow morning.

Next update: Day 2, 5pm PT
```

**Day 2 Morning: Build Started**
```
Subject: [Shipyard] Build phase started — {Project Name}

Hi {Client Name},

The team is now building. We've spun up {N} agents working in parallel on:
• {Component/Page 1}
• {Component/Page 2}
• {Integration/Feature}

Live progress: {link_to_dashboard} (future feature)

Next update: Day 3, 5pm PT
```

**Day 3 Morning: Build Complete, QA Started**
```
Subject: [Shipyard] QA phase started — {Project Name}

Hi {Client Name},

Build phase is complete. All components are now in QA.

Margaret Hamilton (our QA lead) is running:
✓ Automated tests
✓ Accessibility audit (WCAG AA)
✓ Performance check
✓ Cross-browser testing
✓ PRD compliance review

Staging preview coming tomorrow.

Next update: Day 3, 5pm PT
```

**Slack Channel Updates (async):**
Brief daily standup in the client Slack channel, posted at 10am PT:
```
Daily standup for {Project}:

✓ Debate: Complete
✓ Build: Pages 1-5 done, working on pages 6-10
✓ Token burn: 42% (on track)
✓ Blockers: None
✓ Next: Finish build, begin QA

Staging preview tomorrow evening.
```

---

## Stage 5: Review (Day 3-4)

**Goal:** Get client feedback while QA is fresh. One revision round is included.

**Process:**

1. **Staging link sent** (Day 3 evening or Day 4 morning)
   - Client gets email with staging URL
   - Client gets admin credentials (if Emdash site)
   - Client gets walkthrough video (2-3 min, auto-recorded) showing:
     - How to navigate the site
     - Where content lives
     - How to edit (if applicable)

2. **Client review window** (48 hours)
   - Client gives feedback via email, Slack, or form
   - Feedback template provided to structure requests:
     ```
     FEEDBACK TEMPLATE:
     
     Page/Feature: [which page?]
     Issue: [what's wrong or what's missing?]
     Priority: [must-fix / nice-to-have]
     Notes: [any other details?]
     ```

3. **Revision execution** (Day 4)
   - If revisions fit in the 10% reserve or included tokens: build them
   - If revisions exceed budget: quote revision tokens (100K per round)
   - Client approves → build executes → staging updated
   - Quality check by Margaret

**Email Template: Staging Preview**

```
Subject: [Shipyard] Preview your site — feedback due by {date}

Hi {Client Name},

Your site is ready to preview. Here's the link:

🔗 Staging: {staging_url}
📧 Admin login: {email} / {temp_password}

WHAT TO LOOK FOR:
• Does it match the PRD?
• Are all pages here?
• Does the design feel right?
• Are there any broken links or missing content?
• Mobile experience — does it work on phone?

GIVE FEEDBACK:
Reply to this email with feedback formatted like this:

---
Page: Services
Issue: The hero image is stretched
Priority: Must-fix
---

Page: Contact Form
Issue: Nice-to-have: Add a phone field
Priority: Nice-to-have
---

INCLUDED:
You have one round of revisions included in your budget.
We'll make any "must-fix" changes at no extra cost.
"Nice-to-haves" that don't fit your budget will become revision items.

TIMELINE:
• You: Give feedback by {date}
• Us: Build revisions (Day 4)
• You: Approve final version (Day 4 evening)
• Us: Launch to production (Day 5)

Questions? Ask in Slack.

—

Shipyard AI
```

---

## Stage 6: Launch (Day 4-5)

**Goal:** Deploy to production. Client has a live site with credentials.

**Process:**

1. **Client approves final staging** (or all revisions complete)
2. **Automated deploy:**
   - Build is tagged in git
   - Deployed to Emdash production
   - DNS updated (if new domain)
   - SSL cert verified
   - Smoke tests run
   - Monitoring enabled

3. **Launch email sent** (see template below)
   - Live URL
   - Admin credentials (if applicable)
   - Brief admin walkthrough
   - Support contact info
   - What happens next (7-day support window)

4. **Post-launch QA:**
   - Margaret runs final production checks
   - Links verified
   - Analytics enabled
   - Uptime monitoring active

**Email Template: Launch Notification**

```
Subject: [Shipyard] Your site is live!

Hi {Client Name},

🚀 {Project Name} is now live in production.

---

YOUR LIVE SITE:
🔗 {production_url}

ADMIN DASHBOARD:
📊 {admin_dashboard_url}
📧 Email: {email}
🔑 Password: {temp_password}

FIRST STEPS:
1. Visit your site and make sure everything looks good
2. Log in to your admin dashboard
3. Update your password (click "Settings")
4. Check out our admin walkthrough video: {video_link}

WHAT YOU CAN DO IN ADMIN:
✓ Edit pages and content
✓ Update images and media
✓ Manage SEO settings
✓ View analytics
✓ Invite team members

SUPPORT:
You have 7 days of included support. If you find bugs or have questions:
📧 Email: support@shipyard.company
💬 Slack: #shipyard-{slug}

NEXT STEPS:
• Share the link with your team, customers, friends
• Set up your analytics (Google Analytics, etc.)
• Configure email (for contact forms, etc.)

Excited to see what you build next!

—

Shipyard AI
```

---

## Stage 7: Post-Launch Support (Day 5+)

**Goal:** Ensure smooth handoff. Fix bugs. Plant seeds for future work.

**7-Day Support Window:**
- Response time: within 4 hours
- Scope: bug fixes, critical issues, admin onboarding
- Out of scope: feature requests, design changes (→ revision tokens)

**Support Channels:**
- Email: `support@shipyard.company`
- Slack: Client's project channel
- 30-min call available upon request

**Support Workflow:**
1. Client reports issue
2. Margaret triages (bug vs. feature vs. user error)
3. If bug: fix + re-deploy same day
4. If feature: quote revision tokens or offer for Phase 2
5. Resolve + document in MEMORY.md (continuous improvement)

**Day 7 Follow-up Email:**

```
Subject: [Shipyard] Your 7-day support window closes tomorrow

Hi {Client Name},

One week in! How's {Project Name} performing?

Your included support window closes on {date}. After that:
✓ You keep full admin access
✓ We're here for critical bugs (at standard support rates)
✓ Want changes? Buy revision tokens or plan a Phase 2

OPTIONAL NEXT STEPS:
We can help with:
• Content management service ($X/month)
• Additional pages or features (Phase 2)
• Custom integrations
• Landing page A/B testing

Interested? Schedule a 15-min call: {calendly_link}

Otherwise, you're all set. Enjoy your new site!

—

Shipyard AI
```

---

## Email Templates Summary

| Touchpoint | Subject | Primary Goal |
|-----------|---------|--------------|
| Scoping | `[Shipyard] Your Project Quote` | Transparency on cost, scope, timeline |
| Kickoff | `We've started building` | Excitement, clarity on next steps |
| Debate Complete | `Debate phase complete` | Confidence we have a solid plan |
| Build Started | `Build phase started` | Transparency on progress |
| Build Complete | `QA phase started` | Status update, staging preview imminent |
| Staging Preview | `Preview your site` | Feedback collection, revision scope |
| Launch | `Your site is live!` | Excitement, admin onboarding, support info |
| Post-Launch | `7-day support closes` | Celebration, upsell for Phase 2 |

---

## Client Dashboard / Portal (Future Feature)

**What it is:**
A web portal where clients can:
- See real-time project status
- View staging/production links
- Provide feedback (structured form)
- Track token usage
- Download invoices/contracts
- Schedule support calls

**Dashboard Sections:**

### 1. Project Overview
```
Project: {Name}
Status: [DEBATE → PLAN → BUILD → REVIEW → STAGING → LIVE]
Timeline: Day X of Y
Token burn: 42% (on track)
```

### 2. Milestones
```
✓ Kickoff (Day 1)
✓ Debate Complete (Day 1 evening)
✓ Build Started (Day 2)
→ QA Started (Day 3)
→ Staging Preview (Day 3 evening)
→ Launch (Day 5)
```

### 3. Links
```
Staging: [link] | Live: [link] | Admin: [link]
```

### 4. Feedback & Revisions
```
Feedback submitted: 2
Revisions included: 1 round
Revisions used: 0
Status: Ready for revision review
```

### 5. Billing
```
Budget: 1M tokens
Spent: 420K tokens
Remaining: 580K tokens
Revision tokens: Available upon purchase
```

### 6. Support
```
Support window: 7 days from launch (6 days remaining)
Open tickets: 0
Contact support: [form / email / Slack invite]
```

**Design Principles:**
- Clean, readable status
- No surprises (show burn rate, projections)
- Mobile-friendly
- Integrates with Slack for notifications

---

## Key Metrics to Track

Measure what matters for continuous improvement:

### Speed Metrics
- **Time to first response:** Target <4 hours from PRD submission
- **Time to quote:** Target <8 hours
- **Time to staging link:** Target <72 hours (Day 3)
- **Time to live:** Target 5-7 days average

### Quality Metrics
- **Client satisfaction score:** Post-launch survey (target: 4.5/5)
- **Bugs in staging:** Target <3 per project
- **Bugs in production:** Target 0 (within 7-day support window)
- **Revisions used:** Track vs. included (improve estimation)

### Efficiency Metrics
- **Token burn rate:** Are we within budget? (target: on-track)
- **Scope creep:** PRD drift during build (target: <5% drift)
- **Agent efficiency:** Tokens per deliverable (track per sub-agent)

### Business Metrics
- **Client retention:** Do they come back for Phase 2? (target: >60%)
- **Referral rate:** % of new clients from referrals (target: >30%)
- **Support cost:** Tickets per project, resolution time (optimize for efficiency)
- **Upsell conversion:** % who buy revision tokens or Phase 2 (target: >40%)

**Dashboard:** Phil maintains a real-time tracking doc linking to project statuses, burn rates, and satisfaction scores.

---

## Tone & Voice Guidelines

**Client-facing communications should be:**

1. **Clear** — No jargon. "Debate phase" is fine; "token optimization" is not.
2. **Warm** — We're excited to build with you. Show it.
3. **Professional** — We know what we're doing. Be confident, not casual.
4. **Transparent** — Budget, timeline, trade-offs. No surprises.
5. **Actionable** — Each email tells the client what to do next (or nothing).

**Voice examples:**

✓ "Your site is ready to preview. Here's what to look for..."
✗ "Staging instance deployed. QA phase initiated."

✓ "One round of revisions is included. Additional rounds cost 100K tokens ($X)."
✗ "Revision budget allocation available upon request."

✓ "Join our Slack channel — this is where we'll keep you in the loop."
✗ "Slack integration configured for project notifications."

---

## Handling Edge Cases

### What if the client goes dark?

**Response:**
- Day 2: Send reminder email ("We're waiting for approval to kick off")
- Day 3: Send reminder + offer call
- Day 4: Mark project as "paused" until client responds
- If >1 week: Close PRD, refund if applicable

### What if scope creep happens mid-build?

**Response:**
- Flag in STATUS.md immediately (no silent failures)
- Contact client: "We found X in the PRD that's bigger than expected. This will cost Y extra tokens. Proceed?"
- Client decides: absorb cost, cut scope, or buy revision tokens

### What if the client wants major changes post-launch?

**Response:**
- Changes outside 7-day support window cost revision tokens (100K per round)
- If major: quote a Phase 2 project instead
- Frame as opportunity: "You've learned what works. Let's expand on that."

### What if a critical bug is found in production?

**Response:**
- Fix immediately (within support window)
- Root cause analysis
- Document in MEMORY.md to prevent recurring issues
- No token cost (it's a bug, not a feature)

---

## Revision Token Pricing & Process

**Revision tokens:** 100K tokens per round of changes (post-launch)

**What counts as a revision:**
- Copy changes (up to 500 words)
- Layout tweaks (reorder sections, adjust spacing)
- Color/font changes (within existing design)
- Single-page addition (if budget allows)

**What doesn't count:**
- Bug fixes (included in 7-day support)
- Admin changes client makes themselves
- Feature requests (become Phase 2 projects)

**Process:**
1. Client proposes changes via email/form
2. Phil assesses if within 100K token budget
3. Client approves cost
4. Build executes in 1-2 business days
5. Staging preview for approval
6. Deploy to production

**Upsell pitch:**
"Want more changes? A few options:
- Buy another revision token bundle (100K = $X)
- Plan Phase 2 with new features (let's talk scope + budget)
- Ongoing content management service ($X/month)"

---

## Success Handoff Checklist

**By Day 5, the client should have:**

- [ ] Live production URL
- [ ] Admin dashboard access + credentials
- [ ] Admin walkthrough video (2-3 min)
- [ ] Slack channel with support contact
- [ ] Support email address
- [ ] FAQ/help doc (if complex site)
- [ ] 7-day support window confirmation
- [ ] Post-launch survey link (scheduled for Day 6)

**By Day 8, we should have:**

- [ ] Client feedback (survey)
- [ ] Project retrospective in MEMORY.md (what we learned)
- [ ] Token burn analysis (did we estimate well?)
- [ ] Upsell opportunity identified (Phase 2, content service, etc.)
- [ ] Project archived, team debriefed

---

## Continuous Improvement Loop

Every project feeds back into the system:

1. **MEMORY.md** updated with learnings (scope estimation, design patterns, integration gotchas)
2. **Persona knowledge bases** updated with new examples
3. **Revision token pricing** adjusted if data shows patterns
4. **Email templates** refined based on client feedback
5. **Pipeline stages** optimized (timeline adjustments, quality gates)

This is how we get faster, better, and more predictable over time.

---

## Questions & Troubleshooting

### "How do clients give feedback?"

Email, Slack, or the portal form (when built). We provide a template so feedback is structured and actionable.

### "What if revisions aren't done by launch day?"

We launch with what's ready. Remaining revisions become paid revision tokens post-launch. (This is rare if we estimate well.)

### "Can the client talk to the agents?"

Only through Phil or the Slack channel. Agents stay focused on building, not meetings.

### "What if the PRD is missing critical info?"

Phil flags it during scoping. We ask clarifying questions. If client doesn't respond, we build to the best interpretation and revisit during review.

### "Do we offer a guarantee?"

Implicit: the site ships on time within token budget. If we fail to ship or ship broken code, we fix it free. If client changes scope mid-project, that's a separate negotiation.

---

## Summary

Shipyard AI's onboarding flow is a promise:

- **Day 0:** We understand what you need and tell you the cost.
- **Day 1:** We start working, transparently.
- **Day 3:** You see it on staging and give feedback.
- **Day 5:** Your site is live, and you have the keys.
- **Day 5+:** We support you for a week, then you own it.

**Our competitive advantage isn't any single feature.** It's this flow—clear, fast, predictable. We treat client communication like we treat code: tested, refined, and continuously improved.

Welcome to the Shipyard.
