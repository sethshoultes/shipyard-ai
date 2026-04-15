# Retention Roadmap: What Keeps Users Coming Back
**Author:** Shonda Rhimes
**Date:** April 15, 2026
**Focus:** Narrative hooks, emotional engagement, and long-term retention strategy

---

## Core Problem

**Current portal has zero retention mechanisms.**

User journey today:
1. Sign up
2. See empty dashboard
3. (Somehow find and fill intake form)
4. Wait for build
5. Site launches
6. **Never return**

**Result:** One-time transaction. No relationship. No compounding value.

---

## What Keeps Users Coming Back: The Retention Stack

### **Tier 1: Daily Hooks (First 30 Days)**
*Goal: Create habit of checking portal*

#### 1. **Real-Time Build Progress**
**What it is:** Live status updates that create narrative tension

**Instead of:** "Your project is in BUILD phase"
**Show:**
- "Wave 2/4: Homepage design complete ✓ Product pages in progress..."
- Progress bar: 67% complete
- Estimated completion: "Going live in 18 hours"

**Why it works:** Cliffhanger. Users check back to see "what happens next"

**Implementation:**
- Webhook updates from build agents → database status changes
- Dashboard polls every 30 seconds during active builds
- Email notifications on phase transitions (PLANNING → BUILD → REVIEW → LIVE)

#### 2. **Staging Preview Link**
**What it is:** "See your site before it goes live"

**Show:**
- "Want a sneak peek? Preview staging site" button appears when BUILD phase is 80% complete
- Countdown: "Staging ready in 6 hours"

**Why it works:** Anticipation. Users want to see their creation early.

**Implementation:**
- Staging URL generated during BUILD phase
- Preview access gated by password (auto-generated, shown in portal)
- "Give feedback" button that submits comments back to build agents

#### 3. **Behind-the-Scenes Agent Activity Log**
**What it is:** Transparency into AI agents working on project

**Show:**
- "Your project team: Architect, Designer, QA Tester"
- Real-time activity feed:
  - "Architect: Analyzing PRD requirements..."
  - "Designer: Generating homepage layout options..."
  - "QA: Running accessibility audit..."

**Why it works:** Humanizes AI. Creates emotional connection to "team" building site.

**Implementation:**
- Agent logs emit events during DEBATE/PLAN/BUILD
- Portal subscribes to events, displays in collapsible activity panel
- Optional: Add agent avatars + personality ("Architect" = methodical, "Designer" = creative)

---

### **Tier 2: Weekly Hooks (Post-Launch)**
*Goal: Create ritual of checking site performance*

#### 4. **Site Analytics Dashboard**
**What it is:** Simple, visual performance metrics

**Show (Week 1 post-launch):**
- Visitor count: "Your site got 127 visitors this week"
- Top pages: "Homepage (42%), About (28%), Contact (18%)"
- Form submissions: "3 new contacts this week"
- Load speed: "Your site loads in 1.8s (faster than 76% of web)"

**Why it works:** Dopamine hit from seeing numbers go up. Becomes daily/weekly check-in ritual.

**Implementation:**
- Embed lightweight analytics (Plausible or simple pixel tracker)
- Portal fetches analytics API, renders charts
- Email weekly digest: "Your site this week: [key metrics]"

#### 5. **Recommendations Engine**
**What it is:** AI-powered suggestions for site improvements

**Show:**
- "Your CTA is below the fold on mobile—fixing this typically adds 8% conversions. Cost: 15K tokens. [Fix it →]"
- "Sites like yours see 23% more form submissions when they add testimonials. [Add testimonials →]"
- "Your homepage loads in 4.2s (slow). Switching to WebP images saves 1.8s. Cost: 8K tokens. [Optimize now →]"

**Why it works:**
- Creates ongoing value (site gets better over time)
- Drives retainer upsells (each fix = token spend)
- Positions Shipyard as strategic partner, not just builder

**Implementation:**
- AI analyzes live site weekly (accessibility audit, performance scan, conversion best practices)
- Generates 3-5 recommendations ranked by impact
- Recommendations panel on dashboard, refreshed weekly
- Click "Fix it" → auto-generates retainer request (if client has subscription) or prompts upgrade

---

### **Tier 3: Monthly Hooks (Retainer Clients)**
*Goal: Justify ongoing subscription, increase LTV*

#### 6. **Monthly Site Health Report**
**What it is:** Comprehensive "state of your site" email + dashboard view

**Show:**
- **Performance:** Load speed trends, uptime percentage, Core Web Vitals score
- **Traffic:** Visitor growth, top referral sources, geographic breakdown
- **Conversions:** Form submissions, email signups, CTA click rates
- **SEO:** Search rankings for key terms, backlink count, page indexing status
- **Security:** SSL status, vulnerability scans, backup confirmations

**Why it works:** Justifies retainer expense. Shows ongoing value even in quiet months.

**Implementation:**
- Automated monthly report generation
- Email digest with link to full dashboard view
- "This month's updates" section showing token usage + completed fixes

#### 7. **Token Budget Gamification**
**What it is:** Make token usage visible and rewarding

**Show:**
- "You have 150K tokens remaining this month (75% left)"
- "You saved 50K tokens this month by catching issues early!"
- Progress bar with milestones: "Use 100K tokens → unlock priority support"
- Rollover: "Unused tokens rollover up to 100K next month"

**Why it works:**
- Prevents "use it or lose it" waste
- Creates sense of value (seeing unused tokens = money saved)
- Encourages proactive requests (use tokens before expiry)

**Implementation:**
- Real-time token counter on dashboard
- Monthly email: "Your token summary: used X, saved Y, remaining Z"
- Push notification when nearing monthly limit: "You're at 90% tokens—submit requests now"

#### 8. **Changelog + New Features**
**What it is:** Ongoing content showing Shipyard is improving

**Show:**
- "What's new this month" section on dashboard
- "New capability unlocked: AI image optimization now available for retainer clients"
- "Case study: How we helped [Client X] increase conversions 34%"

**Why it works:**
- Demonstrates platform evolution (creates FOMO for non-retainer clients)
- Educates users on available capabilities
- Builds brand trust (active development = reliable partner)

**Implementation:**
- Blog/changelog feed embedded in portal
- Email digest of monthly updates
- "Try this new feature" CTAs that drive engagement

---

### **Tier 4: Quarterly Hooks (Long-Term Engagement)**
*Goal: Transform from vendor to strategic partner*

#### 9. **Quarterly Business Review (QBR)**
**What it is:** Proactive strategy session (human or AI-powered)

**Show:**
- "It's been 3 months since launch. Let's review what's working."
- Automated QBR report:
  - Traffic trends (up/down/flat)
  - Conversion rate analysis
  - Competitor benchmarking ("Sites in your industry average 2.3% conversion—you're at 1.8%")
  - Strategic recommendations ("Consider adding blog to improve SEO ranking")
- **Optional:** Live QBR call with Shipyard team for high-LTV clients

**Why it works:**
- Moves relationship from transactional to strategic
- Identifies upsell opportunities (blog, ecommerce, integrations)
- High-value clients feel VIP treatment

**Implementation:**
- Automated QBR generation at 90 days post-launch
- Email invitation: "Your 90-day review is ready"
- Dashboard view with downloadable PDF
- "Book strategy call" CTA for retainer clients

#### 10. **Community + Peer Learning**
**What it is:** Connect Shipyard clients to each other

**Show:**
- "Recently launched sites" gallery (with client permission)
- "Sites like yours" recommendations with performance metrics
- Optional: Shipyard client Slack/Discord community
- Monthly webinar: "Best practices from top-performing Shipyard sites"

**Why it works:**
- Creates network effects (clients benefit from each other's success)
- Social proof (seeing peer sites builds confidence)
- Reduces churn (community investment = stickiness)

**Implementation:**
- Opt-in showcase gallery on portal homepage
- Anonymous performance benchmarking ("You're in top 25% for speed")
- Monthly "Site of the Month" feature with case study

---

## V1.1 Feature Roadmap (Next 90 Days)

### **Must-Have (Addresses Board Feedback)**

#### **Week 1-2: Foundation**
1. **Fix onboarding flow**
   - Add "Start Your First Project" CTA on dashboard (addresses Oprah's "how do I start?" feedback)
   - Intake form with Stripe integration (self-service project submission)
   - Confirmation page: "Your site is in queue. Here's what happens next."

2. **Build status tracking**
   - Live progress visualization (addresses Shonda's "no narrative arc" feedback)
   - Phase indicators: INTAKE → PLANNING → BUILD → REVIEW → LIVE
   - Progress bars with estimated completion time

3. **Email notifications**
   - Status change alerts ("Your site is now in BUILD phase")
   - Staging preview ready notification
   - Launch confirmation with site URL

#### **Week 3-4: Post-Launch Value**
4. **Analytics dashboard**
   - Basic metrics: visitors, top pages, form submissions
   - Simple charts (last 7 days, last 30 days)
   - "Your site this week" summary card

5. **Recommendations panel (v1)**
   - Manual seed recommendations based on site type
   - "Common next steps" (add testimonials, add blog, optimize images)
   - Links to retainer request form

#### **Week 5-6: Retainer Experience**
6. **Retainer subscription management**
   - Stripe subscription integration
   - Token usage dashboard
   - Monthly billing history

7. **Retainer request form**
   - Self-service update requests
   - Token cost estimator (manual ranges initially)
   - Status tracking for retainer tasks

---

### **Should-Have (Retention Hooks)**

#### **Month 2:**
8. **Agent activity log**
   - Live feed of build agent actions
   - Collapsible panel on project detail page
   - Adds transparency + emotional connection

9. **Weekly email digest**
   - "Your site this week" automated email
   - Analytics summary + recommendations
   - Token usage for retainer clients

10. **Staging preview access**
    - Password-protected staging URL
    - Feedback submission form
    - Visual diff showing changes since last update

#### **Month 3:**
11. **Token gamification**
    - Real-time token counter
    - Monthly summary: used/saved/remaining
    - Rollover logic (up to 100K tokens)

12. **Monthly health report**
    - Automated site performance audit
    - SEO + accessibility scores
    - Security status

13. **Changelog section**
    - "What's new" feed on dashboard
    - Feature announcements
    - Case studies

---

### **Nice-to-Have (Platform Vision)**

#### **Month 4-6 (Post-Validation):**
14. **AI-powered recommendations (v2)**
    - Automated site analysis (performance, accessibility, conversion optimization)
    - 3-5 ranked suggestions with impact estimates
    - One-click deploy for approved fixes

15. **Template gallery**
    - "Sites like yours" showcase
    - Performance benchmarks ("This layout gets 18% conversion vs. 12% average")
    - Template selection for new projects

16. **Community features**
    - Recently launched sites gallery
    - Client testimonials + case studies
    - Optional Slack/Discord integration

17. **QBR automation**
    - 90-day automated review reports
    - Competitor benchmarking
    - Strategic recommendations

18. **Integration hub (v1)**
    - Pre-built connectors: Cal.com, Stripe, Shopify
    - One-click install for retainer clients
    - Token-based pricing for premium integrations

---

## Success Metrics: How We Know It's Working

### **Week 1-4 (Foundation Validation):**
- **Onboarding completion rate:** >80% of signups complete intake form
- **Time to first submission:** <5 minutes from signup to intake submission
- **Dashboard return rate:** >60% of users log in 2+ times during build

### **Month 2-3 (Post-Launch Retention):**
- **Weekly active users (WAU):** >40% of launched clients check dashboard weekly
- **Analytics engagement:** >50% of clients view analytics dashboard monthly
- **Recommendation click rate:** >20% click at least one recommendation

### **Month 4-6 (Retainer Validation):**
- **Project → retainer conversion:** >25% of completed projects convert to retainer
- **Retainer churn:** <10% monthly churn
- **Token utilization:** Retainer clients use >60% of monthly tokens (indicates value perception)
- **QBR engagement:** >70% of retainer clients view 90-day review

### **Month 7-12 (Long-Term Health):**
- **12-month retention:** >60% of retainer clients still active after 1 year
- **LTV:CAC ratio:** >3:1 (validates business model)
- **NPS score:** >50 (clients would recommend to peers)
- **Organic growth:** >30% of new clients from referrals

---

## The North Star: Compounding Engagement

**What success looks like in 12 months:**

A retainer client logs in on Monday morning:

1. **Dashboard shows:**
   - "Your site got 847 visitors last week (+12% from previous week)"
   - "3 new form submissions (here's who contacted you)"
   - Recommendations panel: "Your CTA is below fold on mobile—fixing this typically adds 8% conversions. Cost: 15K tokens. [Fix it →]"

2. **Client clicks "Fix it":**
   - System auto-generates retainer request
   - AI estimates 2-hour turnaround
   - Client approves

3. **2 hours later, email notification:**
   - "Your mobile CTA is now fixed. Preview changes: [staging link]"
   - Client approves staging → deploys to production
   - Dashboard updates: "Token usage: 135K used, 65K remaining this month"

4. **Friday email digest:**
   - "This week's updates: CTA fix deployed, homepage load speed improved 0.3s"
   - "Your site this week: 847 visitors, 3 form submissions, 2.8% conversion rate"
   - "Next week's recommendation: Add testimonials section (sites like yours see 23% more conversions)"

5. **Monthly health report (Day 1 of next month):**
   - "March site performance: 3,421 visitors, 12 leads, 3.1% conversion"
   - "Token summary: Used 180K, saved 20K (rollover applied)"
   - "This month's improvements: Mobile optimization, image compression, accessibility fixes"
   - "What's new: AI image generation now available for retainer clients"

**That's retention. That's a relationship. That's compounding value.**

**Without these hooks, portal is a vending machine. With them, it's a growth partner.**

---

## Final Note: Story First, Features Second

Every feature in this roadmap serves one goal: **Give users a reason to come back tomorrow.**

Not because they have to. Because they *want* to.

Because checking the dashboard has become a morning ritual.
Because seeing the numbers go up feels rewarding.
Because the recommendations make them smarter.
Because the site keeps getting better without them thinking about it.

**That's the story we're telling.**

Build that story, and retention takes care of itself.

—Shonda Rhimes
