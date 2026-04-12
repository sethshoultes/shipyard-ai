# Shonda's Retention Roadmap — What Keeps Users Coming Back

**Product:** EmDash Plugin Suite (MemberShip & EventDash)
**Author:** Shonda Rhimes (Chief Retention & Narrative)
**Version:** 1.1 Feature Roadmap
**Target Users:** Small business owners — yoga instructors, bistro owners, craftspeople, creative entrepreneurs

---

## The Core Truth About Retention

Users don't return for features. They return for **feelings**.

These are creative people trapped in technical prisons. Every SaaS tool they've tried has a learning curve, a tutorial video, a help article maze. They start excited, feel overwhelmed, then quit.

The feeling we're selling: *"I did that. I built that. I can do this."*

When a yoga instructor sees members signing up through her site, she feels capable. That feeling is addictive. That feeling makes her tell every business owner she knows.

**We're not selling membership software. We're selling confidence that technology can serve them.**

---

## What Keeps Users Coming Back

### 1. Visible Progress
Users return when they can *see* their wins. A number going up. A chart trending right. A milestone achieved. Progress creates dopamine.

### 2. Emotional Payoffs
Milestones, celebrations, success notifications. "You've welcomed your 10th member!" is not just data — it's validation.

### 3. Low Friction Returns
Quick actions, mobile access, weekly summaries. Coming back must be easier than not coming back.

### 4. Social Proof Creation
Shareable moments. Screenshots of dashboards. "Look at my community." Each share creates an evangelist.

### 5. Passive Re-engagement
They don't have to remember us. We remind them. Weekly digest emails. Milestone notifications. We bring them back.

---

## V1.0 Retention Foundations (Ships Now)

These elements must be in v1 — they're the foundation of the retention loop.

### 1. The First 30 Seconds
- Empty state with clear, confident CTA: "Your first member is waiting."
- Stripe connects once. Colors inherit automatically.
- Admin sees progress immediately — not settings screens, not tutorials
- **Goal:** Confidence before competence.

### 2. Beautiful Admin Experience
- Admins spend 80% of plugin time in dashboard
- Must be as beautiful as customer-facing UI
- Not spreadsheet-like — signals we respect the person
- **Goal:** Every time they open the dashboard, they feel professional.

### 3. Terse, Warm Communication
- "You're in." not "Successfully submitted!"
- "Done. Saved. Live." not "Your changes have been confirmed."
- Three words where competitors use twelve
- **Goal:** Speak like you're texting a smart friend.

### 4. Zero-Config That Works
- Plugin feels like it was *always there*
- Colors match the site automatically
- No technical decisions forced on non-technical users
- **Goal:** They didn't read docs. They just... won.

### 5. Reliable Core Flows
- Payments work. Every time.
- Emails arrive. Every time.
- Webhook failures recover gracefully
- **Goal:** Never break trust. Ever.

---

## V1.1 Features — Deepening the Hook

### Theme: Make Success Visible

Users come back when they can *see* their progress. V1.1 surfaces wins and creates emotional payoffs that keep admins engaged.

---

### Feature 1: Weekly Digest Email

**What:** Every Monday at 9am, site owners receive a beautiful email summarizing their week.

**Contents:**
- New members/registrations this week
- Revenue processed through Stripe
- Upcoming events (if EventDash installed)
- One encouraging line: "Your community grew by 12% this week."

**Why It Retains:**
- Reminds them the plugin exists (passive re-engagement)
- Shows growth: "5 new members this week" feels like progress
- Creates shareable moments: screenshot → social proof
- Even zero-growth weeks framed positively: "Your 23 members are still with you."

**Implementation:**
- Data already exists in KV storage
- Template in Resend with dynamic content
- Opt-out preference in admin settings

**Effort:** Low
**Priority:** **P1 — Ships in v1.1a**

---

### Feature 2: Milestone Celebrations

**What:** Automatic celebration when admins hit meaningful milestones.

**Admin Milestones:**
- "You've welcomed your 10th member!"
- "100 members — your community is thriving."
- "$1,000 processed through your site this month."
- "One year since your first member joined."

**Member Milestones (visible to admin):**
- "Sarah has been a member for 1 year"
- "This month's top event had 47 attendees"

**Why It Retains:**
- Emotional payoff for the admin
- Reinforces that the plugin is *working*
- Creates screenshot-worthy moments → word of mouth

**Implementation:**
- Track member tenure, cumulative counts, revenue thresholds in KV
- Surface in admin dashboard as toast notification
- Optional email notification
- Beautiful, shareable card design

**Effort:** Medium
**Priority:** **P2 — Ships in v1.1b**

---

### Feature 3: One-Click Social Sharing

**What:** Share event or membership signup pages directly to social media from admin.

**Implementation:**
- Pre-formatted share text with intelligent defaults
- Open Graph meta tags optimized for each platform
- "Share to Facebook / Instagram / X" buttons in admin
- Copy link with preview of how it will appear

**Why It Retains:**
- Reduces friction to promotion
- More promotion → more signups → more success → more retention
- Admin feels empowered, not stuck figuring out URLs

**Effort:** Low
**Priority:** **P1 — Ships in v1.1a**

---

### Feature 4: Simple Progress Dashboard

**What:** Visual representation of members/events over time. Simple. Beautiful. Not overwhelming.

**Contents:**
- Monthly member count trend (line chart)
- Revenue trend if Stripe connected
- This week vs. last week comparison
- "Your busiest day was Thursday"

**Why It Retains:**
- Progress visualization creates dopamine
- "Line going up" keeps people engaged
- Answers "Is this working?" without needing Google Analytics
- Makes success tangible and visible

**Implementation:**
- Lightweight charting (no heavy libraries — inline SVG or Canvas)
- Just the basics, beautifully rendered
- No advanced analytics — that's v2+

**Effort:** Medium
**Priority:** **P2 — Ships in v1.1b**

---

### Feature 5: Quick Actions from Dashboard Home

**What:** Most common actions one click away from dashboard home.

**Actions:**
- "Send email to all members"
- "Create new event" (if EventDash installed)
- "View recent signups"
- "Copy signup link"
- "Download member list" (simple export)

**Why It Retains:**
- Reduces time-to-action → feels efficient
- Surfaces capabilities users might not discover
- Makes the plugin feel powerful without being complicated
- Dashboard becomes a command center, not a waiting room

**Effort:** Low
**Priority:** **P1 — Ships in v1.1a**

---

### Feature 6: Welcome Email Automation

**What:** Customizable welcome email that sends automatically when someone joins.

**Implementation:**
- Simple template editor (single template, not flows)
- Variable insertion: {first_name}, {membership_tier}, {site_name}
- Preview before save
- Default template ships ready to use

**Why It Retains:**
- Admin feels professional: "I have automated systems"
- Members feel welcomed → better downstream retention
- Sets expectation that communication continues
- Zero effort after initial setup

**Effort:** Medium
**Priority:** **P3 — Ships in v1.2**

---

### Feature 7: Mobile-Responsive Admin

**What:** Full admin functionality on phone and tablet.

**Why It Retains:**
- Business owners check their business constantly
- Mobile access = more frequent engagement
- "I can manage my membership from anywhere"
- Checking stats becomes a satisfying habit

**Effort:** Medium-High
**Priority:** **P3 — Ships in v1.2**

---

## V1.1 Ship Schedule

### V1.1a (2 weeks after v1.0 validation)

| Feature | Effort | Impact |
|---------|--------|--------|
| Weekly Digest Email | Low | High |
| One-Click Social Sharing | Low | Medium |
| Quick Actions Dashboard | Low | Medium |

**Total effort:** ~1 week of development
**Theme:** Low-effort, high-engagement quick wins

---

### V1.1b (4 weeks after v1.0 validation)

| Feature | Effort | Impact |
|---------|--------|--------|
| Milestone Celebrations | Medium | High |
| Simple Progress Dashboard | Medium | High |

**Total effort:** ~2 weeks of development
**Theme:** Visible progress and emotional payoffs

---

### V1.2 (After EventDash ships)

| Feature | Effort | Impact |
|---------|--------|--------|
| Welcome Email Automation | Medium | Medium |
| Mobile-Responsive Admin | High | Medium |

**Total effort:** ~3 weeks of development
**Theme:** Professional polish and accessibility

---

## The Retention Flywheel

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   1. INSTALL                                              │
│      └── Feel capable (first 30 seconds)                  │
│                                                           │
│   2. CREATE                                               │
│      └── First member/event → immediate win               │
│                                                           │
│   3. SEE PROGRESS                                         │
│      └── Dashboard analytics, milestones (v1.1)           │
│                                                           │
│   4. SHARE SUCCESS                                        │
│      └── One-click social sharing (v1.1)                  │
│                                                           │
│   5. GET REMINDED                                         │
│      └── Weekly digest email (v1.1)                       │
│                                                           │
│   6. RETURN                                               │
│      └── Open dashboard, see growth                       │
│                                                           │
│   7. EVANGELIZE                                           │
│      └── Tell a friend, they install                      │
│                                                           │
│   8. LOOP                                                 │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Anti-Retention Patterns to Avoid

### Don't Add Complexity
- No granular permissions
- No enterprise features masquerading as "flexibility"
- No settings pages with 47 options
- If you need more than 5 settings, you've failed at defaults

### Don't Break Trust
- Payments must never fail silently
- Emails must always arrive
- Webhooks must recover gracefully
- One broken payment = lost customer forever

### Don't Lose the Feeling
- Never make admins feel inadequate
- Never use jargon they don't understand
- Never surface errors without clear next steps
- Never show empty states that feel like failure

### Don't Optimize for Power Users First
- Design for the yoga instructor. Power users figure it out.
- Every interaction should take half the steps users expect
- Invisible complexity is the philosophy

---

## Success Metrics for V1.1

| Metric | Target | How We Measure |
|--------|--------|----------------|
| Weekly Active Admins | 60% of installed base | Dashboard visits per week |
| Weekly Digest Open Rate | >40% | Resend email analytics |
| Social Shares per Month | >10 per active site | Share button clicks |
| Time to First Member | <5 minutes from install | Onboarding timestamp |
| Return Visit Rate | >3 visits/week | Dashboard session tracking |
| Support Tickets per User | <0.5/month | Support system metrics |
| Net Promoter Score | >50 | Post-milestone survey |

---

## The Narrative Arc of Retention

Great retention tells a story. Each user's journey should feel like a narrative:

**Act 1: Discovery** (v1.0)
> "This is easier than I expected. It just... works."

**Act 2: Early Wins** (v1.0 → v1.1a)
> "My first member signed up! And another. This is real."

**Act 3: Visible Growth** (v1.1b)
> "Look at this chart. Look at these milestones. My business is growing."

**Act 4: Mastery** (v1.2+)
> "I run my membership from my phone. I have automated welcome emails. I'm a professional."

**Epilogue: Evangelism**
> "You have to try this. It made me feel like I actually know what I'm doing."

---

## The North Star

> **Users come back because we make them feel successful.**

Not because we have the most features.
Not because we're the cheapest.
Not because we're the most powerful.

Because every time they open our dashboard, they see evidence that their business is working.

That feeling — *competence without complexity* — is what keeps them coming back.

---

## Prerequisite: Ship V1 First

The yoga instructor isn't overwhelmed by our UX. She doesn't even know we exist yet. She's using Squarespace with a broken Stripe embed because that's what shipped.

Before we can retain users, we need users.

**Ship MemberShip v1. Then this roadmap activates.**

---

## V1.1 Feature Summary

| Priority | Feature | Effort | When |
|----------|---------|--------|------|
| P1 | Weekly Digest Email | Low | v1.1a |
| P1 | One-Click Social Sharing | Low | v1.1a |
| P1 | Quick Actions Dashboard | Low | v1.1a |
| P2 | Milestone Celebrations | Medium | v1.1b |
| P2 | Simple Progress Dashboard | Medium | v1.1b |
| P3 | Welcome Email Automation | Medium | v1.2 |
| P3 | Mobile-Responsive Admin | High | v1.2 |

---

## Final Note

When v1.1 ships, it won't just keep users — it will turn them into evangelists.

> *"They won't just use these plugins. They'll tell every business owner they know."*

That's retention. That's growth. That's the goal.

---

**Next Step:** Ship MemberShip v1. Then execute this roadmap.

**Document Updated:** April 12, 2026
