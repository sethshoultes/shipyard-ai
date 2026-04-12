# Consolidated Decisions — Post-Delivery System (Anchor)

> *Blueprint for Build Phase*
> *Consolidated by Phil Jackson, The Zen Master*

---

## Product Essence

**What it is:** Making clients feel watched over after their site launches.
**What it evokes:** "Someone's got my back."
**What must be perfect:** The emails. They are the entire product.
**Creative direction:** Trust before transaction.

---

## Locked Decisions

### 1. Product Name

| Aspect | Decision | Proposed By | Won By | Reasoning |
|--------|----------|-------------|--------|-----------|
| Name | **Anchor** | Steve Jobs | Steve Jobs | "Post-Delivery System" takes five syllables to say nothing. "Anchor" takes two syllables to say everything. The thing that keeps ships from drifting away. Elon conceded: "Anchor is a better name." |
| Tier Names | Basic Anchor / Pro Anchor | Steve Jobs | Steve Jobs | Consistent naming hierarchy |
| Implementation Timing | Use internally now, brand publicly at v2 | Elon Musk | Compromise | Ship v1 first, rename at v2 launch after model is proven |

### 2. Architecture (v1)

| Aspect | Decision | Proposed By | Won By | Reasoning |
|--------|----------|-------------|--------|-----------|
| Stack | Cron + PageSpeed API + JSON + Email + Stripe | Elon Musk | Elon Musk | Steve conceded: "Infrastructure should follow traction, not precede it." |
| Database | **None until 100 customers** — Store data in JSON | Elon Musk | Elon Musk | Steve agreed explicitly |
| Dashboard | **No dashboard in v1** | Both (consensus) | Both | Steve: "Build the relationship first. Earn the right to ask for a login." Elon: "Email so good they don't need a dashboard." |
| Hosting | Static site on Cloudflare Pages + Cron worker | Elon Musk | Elon Musk | Zero servers, minimal cost |
| Lighthouse Frequency | **Once per week** | Elon Musk | Elon Musk | Steve conceded: "Daily is vanity. Weekly is useful." |
| Analytics | **First-party only** (Cloudflare Analytics or Plausible) | Elon Musk | Elon Musk | Steve conceded: "OAuth for Google Analytics is a dead end. 60% won't complete it." |

### 3. Token Budget

| Aspect | Decision | Proposed By | Won By | Reasoning |
|--------|----------|-------------|--------|-----------|
| v1 Scope | **300K tokens max** in one Claude session | Elon Musk | Elon Musk | Steve conceded: "The 900K token estimate is fantasy. 270K is real." |
| Breakdown | Landing page (50K) + Stripe (100K) + Email cron (80K) + PageSpeed API (40K) | Elon Musk | Elon Musk | Feasible in single session |

### 4. Email Design

| Aspect | Decision | Proposed By | Won By | Reasoning |
|--------|----------|-------------|--------|-----------|
| Quality Bar | **A+ copy or don't ship** | Steve Jobs | Steve Jobs | "The email IS the entire product. Copy is not decoration." |
| Voice | Confident friend who's also an expert. Not salesy, not corporate, not desperate. | Steve Jobs | Steve Jobs | Uncontested |
| CTAs | **One CTA per email, embedded naturally** | Steve Jobs | Both (consensus) | Elon agreed: "The P.S. lines are desperate." |
| Personalization | Real personalization or none — no half-automated merge fields | Steve Jobs | Steve Jobs | "{{REFRESH_SUGGESTION}} requires creativity. Half-automated feels worse than manual." |
| First Line Test | Must make recipient feel *seen*, not processed | Steve Jobs | Steve Jobs | Example: Not "Your site is live" but "You built something real." |

### 5. Tracking & Operations

| Aspect | Decision | Proposed By | Won By | Reasoning |
|--------|----------|-------------|--------|-----------|
| Spreadsheet Columns | Three only: **Last Contact / Next Touch / Status** | Steve Jobs | Steve Jobs | "Five emails don't need five checkbox columns. Bureaucracy vs. instinct." |
| Operations | Automation for scale, human warmth in copy | Compromise | Compromise | Steve wanted rituals; Elon proved at 200+ customers, manual breaks |

### 6. Pricing Tiers

| Aspect | Decision | Proposed By | Won By | Reasoning |
|--------|----------|-------------|--------|-----------|
| Number of Tiers | **Two maximum** | Elon Musk | Elon Musk | Cut complexity. Three tiers is v2 complexity. |

---

## Unresolved: Card Collection Timing

| Position | Advocate | Argument |
|----------|----------|----------|
| **Card at project start** (default-on trial) | Elon Musk | "This is the distribution unlock. Preventing cancellation > closing sales. 5x attach rate." |
| **No card until trust is earned** | Steve Jobs | "Collecting a card when trust is lowest plants the seed of extraction. That's not a relationship. That's a hostage situation with a countdown. Trust before transaction—always." |

**Status:** DEADLOCKED. This is a fundamental philosophical disagreement about trust vs. conversion optimization. Requires founder decision.

---

## MVP Feature Set (What Ships in v1)

### Included
1. **Landing page** — Explains Anchor, shows tiers
2. **Stripe checkout** — Two-tier subscription (Basic/Pro)
3. **Email cron system** — Automated sends on schedule
4. **PageSpeed Insights API integration** — Weekly performance data
5. **Five core emails:**
   - Launch Day email
   - Week 1 check-in
   - Month 1 report
   - Q1 refresh prompt
   - Anniversary email
6. **Uptime monitoring** — Via free BetterUptime
7. **One "Request Update" button** — Simple support path

### Explicitly Cut (v2 or Later)
- Dashboard (all pages)
- Benchmark comparison
- Recommendation engine (use 10 hardcoded tips instead)
- Support ticket system (use email)
- Dark mode
- Token visibility in client-facing materials
- Third tier
- Quarterly strategy calls
- Competitor monitoring
- OAuth-based Google Analytics
- Self-hosted Lighthouse

---

## File Structure (What Gets Built)

```
anchor/
├── site/                          # Cloudflare Pages static site
│   ├── index.html                 # Landing page
│   ├── pricing.html               # Two-tier breakdown
│   └── assets/
│       ├── styles.css
│       └── logo.svg
│
├── workers/
│   ├── cron-pagespeed.js          # Weekly PageSpeed API calls
│   ├── cron-email-scheduler.js    # Checks due emails, triggers sends
│   └── stripe-webhook.js          # Handles subscription events
│
├── emails/
│   ├── launch-day.html            # A+ copy required
│   ├── week-1.html                # A+ copy required
│   ├── month-1.html               # A+ copy required
│   ├── q1-refresh.html            # A+ copy required
│   └── anniversary.html           # A+ copy required (emotional peak)
│
├── data/
│   └── customers.json             # No database until 100 customers
│
├── lib/
│   ├── pagespeed.js               # PageSpeed API wrapper
│   ├── email.js                   # Email sending logic
│   └── stripe.js                  # Stripe API wrapper
│
└── README.md                      # Internal docs only
```

---

## Open Questions (Need Resolution Before Build)

| # | Question | Context | Impact |
|---|----------|---------|--------|
| 1 | **Card collection timing** | Elon: project start. Steve: after trust earned. | Fundamentally changes signup flow and conversion funnel |
| 2 | **Email service provider** | Not specified in debates | Affects email delivery, templating, analytics |
| 3 | **Exact copy for 5 emails** | Steve demands A+ quality. Who writes them? | Build cannot proceed without final copy |
| 4 | **Support email address** | "Use email" for support — what address? | Customer communication channel |
| 5 | **BetterUptime configuration** | How many sites per account? Alert thresholds? | Affects monitoring costs and noise |
| 6 | **Stripe pricing** | Exact dollar amounts for Basic Anchor / Pro Anchor | Cannot build checkout without prices |
| 7 | **PageSpeed API key management** | Free tier rate limits at scale | May need batching strategy documented |
| 8 | **What triggers enrollment?** | Manual? Auto on project completion? | Affects cron logic and data entry |

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|------|------------|--------|------------|-------|
| 1 | **PageSpeed API rate limits at scale** | High (at 1000+ sites) | Medium | Batch at 3am, cache aggressively, one run/week | Engineering |
| 2 | **Email deliverability** | Medium | High | Use established ESP, warm up domain, monitor spam scores | Engineering |
| 3 | **B+ copy ships anyway** | Medium | High (per Steve: kills the product) | Steve reviews all templates before launch | Steve Jobs |
| 4 | **Support volume overwhelms** | Medium (at scale) | High | Calculate support cost per tier pre-launch. If margin <50% after support, raise prices or cut scope | Operations |
| 5 | **JSON storage fails at scale** | Low (v1 scope is 100 customers) | Medium | Monitor file size, plan database migration trigger | Engineering |
| 6 | **Card-at-start damages trust** | Medium (if Elon wins) | High (per Steve) | A/B test with subset before full rollout | Growth |
| 7 | **No card = low conversion** | Medium (if Steve wins) | High (per Elon) | Track attach rate obsessively, pivot quickly if <10% | Growth |
| 8 | **Scope creep during build** | High | High (delays ship) | Hard lock at 300K tokens. Everything else is v2. No exceptions. | Phil Jackson |
| 9 | **Enterprise tier margin trap** | High (at scale) | High | 8 hrs/month × 100 customers = 800 hours = 5 FTEs. Model economics before offering | Finance |
| 10 | **Name confusion during transition** | Low | Low | Use "Anchor" internally now, brand publicly at v2 | Marketing |

---

## The Bottom Line

**What we agree on:**
- No dashboard in v1
- Email-only relationship
- JSON storage until 100 customers
- Cloudflare + Stripe + Cron architecture
- Weekly PageSpeed runs
- First-party analytics only
- 300K token budget
- Two pricing tiers
- A+ copy is mandatory

**What we disagree on:**
- When to collect the card (trust vs. conversion)

**What ships:**
Landing page + Stripe checkout + Email cron + PageSpeed API + 5 emails + BetterUptime integration

**What doesn't ship:**
Everything else.

---

*"The strength of the team is each individual member. The strength of each member is the team."*

*Steve brings the soul. Elon brings the speed. The product needs both—but v1 needs to exist before it can be perfected.*

*— Phil Jackson*
