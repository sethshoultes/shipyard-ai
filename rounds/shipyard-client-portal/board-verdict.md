# Board Verdict: Shipyard Client Portal
**Date:** April 15, 2026
**Reviewers:** Jensen Huang (Technology & Platform), Oprah Winfrey (Experience & Trust), Shonda Rhimes (Narrative & Retention), Warren Buffett (Capital & Revenue)
**Aggregate Score:** 3.75/10 (Jensen: 4/10, Oprah: 4/10, Shonda: 2/10, Buffett: 6/10)

---

## Overall Verdict: **HOLD**

**Do not proceed with current implementation. Pause feature work for strategic realignment.**

---

## Points of Agreement Across Board Members

### 1. **Solid Infrastructure, Missing Core Experience**
- **Unanimous:** Technical foundation is sound (Next.js, Supabase, Stripe stack is capital-efficient and scalable)
- **Unanimous:** Critical user-facing features are incomplete or absent
  - No visible intake flow on dashboard
  - No project status tracking
  - No analytics dashboard
  - No retainer management interface
- **Buffett:** "Real infrastructure, not theater—but incomplete at current funding stage"
- **Oprah:** "You're building infrastructure but forgetting experience"

### 2. **Onboarding Flow is Broken**
- **All reviewers** identified signup-to-value gap as critical failure
- **Oprah:** "First 5 minutes = confusion about how to use the portal"
- **Shonda:** "Signup → Empty dashboard. User arrives, creates account, sees... nothing"
- **Jensen:** Implied in missing AI-powered intake flow
- **Buffett:** Raises concern about conversion rates without addressing empty state

### 3. **No Retention Mechanisms**
- **All reviewers** noted absence of features that bring users back
- **Shonda:** "Nothing brings users back. Users log in once, see emptiness, never return" (2/10 retention score)
- **Jensen:** "No compounding. Every new client starts from zero"
- **Oprah:** Dashboard is static, no evolving content
- **Buffett:** "No retention loop documented. What keeps clients after project ends?"

### 4. **Zero Competitive Moat**
- **Jensen:** "None. Zero compounding. This is SaaS scaffolding... Webflow could clone this in a quarter"
- **Buffett:** "Zero technical moat. Stack available to anyone with $0 and a weekend"
- Agreement: Portal itself creates no defensibility—moat must come from delivery pipeline quality

### 5. **AI Leverage Untapped**
- **Jensen:** "AI leverage score: 2/10... You're selling AI-built websites through a human-era portal"
- Missed opportunities in intake, status updates, recommendations all identified
- Portal is 100% traditional CRUD despite being an AI company

### 6. **Visual Inconsistency Undermines Trust**
- **Oprah:** Three different color palettes across three pages (zinc/black, gray/indigo, slate/blue)
- **Referenced Jony Ive review:** "Three different brand colors for primary action. Unacceptable"
- Signals lack of attention to detail that damages credibility

---

## Points of Tension

### **Growth Strategy: Optimization vs. Transformation**

**Buffett (Conservative):** 6/10 score
- Views portal as distribution infrastructure for existing product
- Recommends proving retainer demand *before* building portal features
- "I'd rather see 10 retainer clients on a Google Sheet than a perfect portal with zero subscribers"
- Focus on unit economics and validation over innovation

**Jensen (Transformative):** 4/10 score
- Views portal as wrong product entirely
- Recommends 2-week sprint to prototype AI-first UX (intake + recommendations)
- "Pause feature work. Spend 2 weeks prototyping AI intake + recommendation engine"
- Focus on platform dynamics and compounding value

**Tension:** Should we complete existing feature set (intake forms, status tracking) or pivot to AI-native experience?

### **Prioritization: Experience vs. Platform**

**Oprah/Shonda (User Experience First):** 4/10 and 2/10 scores
- Prioritize completing promised features and emotional design
- Fix first-5-minutes experience, add warmth, build trust
- "First-5-minutes experience is everything. Fix that, everything else follows" (Oprah)
- Focus on retention hooks and narrative arc

**Jensen (Platform First):** 4/10 score
- Deprioritize CRUD features in favor of platform capabilities
- Build template marketplace, component ecosystem, API
- "Kill the CRUD, build the Intel Inside"
- Focus on network effects and developer ecosystem

**Tension:** Should we prioritize user delight (Oprah/Shonda) or platform dynamics (Jensen)?

### **Revenue Model Philosophy**

**Buffett:** Validate demand before scaling distribution
- Concerned about unproven conversion rates (project → retainer)
- "Portal enables self-service, but how do clients discover Shipyard?"
- Revenue targets assume conversion rates not yet proven

**Jensen:** Revenue follows platform value
- Build compounding mechanisms first, revenue will follow
- "What COULD compound: project pattern library, template marketplace, cross-client analytics"
- Focus on unfair advantages that drive long-term value

**Tension:** Data-driven validation (Buffett) vs. vision-driven innovation (Jensen)

---

## Conditions for Proceeding

The board requires **proof of concept validation** before approving full build-out. Choose ONE of the following paths:

### **Path A: Experience-First (Oprah + Shonda Priority)**
**Timeline:** 2 weeks
**Deliverables:**
1. Complete intake flow with Stripe integration (self-service project submission)
2. Live project status dashboard with progress visualization
3. Post-launch analytics stub (even if unpopulated)
4. Visual consistency fixes (single color palette, consistent components)
5. Onboarding narrative: welcome flow that guides new users to first action
6. Test with 5 existing clients; measure:
   - Time to first project submission
   - Clarity score (1-10 survey: "Did you understand how to use this?")
   - Trust score (1-10 survey: "Would you recommend this to a colleague?")

**Success Criteria:** >80% of test users successfully submit project within 5 minutes; average trust score >7/10

### **Path B: AI-First (Jensen Priority)**
**Timeline:** 2 weeks
**Deliverables:**
1. AI-powered intake: "Describe your site in 3 sentences" → generates PRD draft
2. Smart recommendations engine: analyzes project, suggests improvements with token costs
3. Token predictor: shows estimated cost + comparable past projects before submission
4. Keep existing auth/dashboard as-is (don't invest in traditional CRUD)
5. Test with 5 existing clients; measure:
   - % who prefer AI intake vs. manual form
   - Accuracy of AI-generated PRDs (client edits required)
   - Conversion rate on AI recommendations

**Success Criteria:** >60% prefer AI intake; <20% edit rate on AI PRDs; >30% accept at least one recommendation

### **Path C: Validation-First (Buffett Priority)**
**Timeline:** 1 week
**Deliverables:**
1. Survey 20 past clients:
   - Would you use self-service portal? (Y/N + why)
   - Would you pay $299/month for retainer? (Y/N/Maybe)
   - What's missing from current client experience?
2. Interview 5 prospects who didn't convert:
   - Why didn't you move forward?
   - Would portal change decision?
3. Manual onboarding flow using Typeform + Stripe Payment Links:
   - Test self-service conversion without building portal
   - Measure: inquiry → payment conversion rate
4. 30-day manual retainer pilot with 3 existing clients:
   - Track: token usage, request types, satisfaction, renewal intent

**Success Criteria:** >40% of past clients express interest in portal; >20% express retainer interest; manual self-service converts at >25%

---

## Recommended Path: **Path C (Validation-First), then Path A (Experience-First)**

### Rationale:
1. **Lowest risk, fastest learning:** 1 week to validate demand before investing 5+ weeks in build
2. **Addresses Buffett's core concern:** "Prove the product has repeatable demand, then scale distribution"
3. **Aligns with unanimous agreement:** Portal infrastructure is sound but user experience is broken
4. **Defers Jensen's platform vision:** Valid long-term strategy, premature for current stage
   - Template marketplace requires critical mass of projects
   - API/integration hub requires proven core product
   - Recommendation engine requires conversion data (get data from Path C first)

### Execution Plan:
**Week 1:** Path C validation
**Week 2-3:** If validation succeeds (>40% interest), execute Path A (complete core features)
**Week 4:** Retest with validated interested users
**Month 2-3:** Monitor retention, gather conversion data
**Month 4:** Revisit Path B (AI features) using real usage data

**If Path C fails (<40% interest):**
- Do NOT build portal
- Investigate: Is problem with portal concept or with core product delivery?
- Consider: Manual high-touch service may be better business model at current scale

---

## Unanimous Rejection of Current State

**All four board members agree:** Shipping current deliverables would damage brand credibility.

**Why unanimous "no" to launch:**
- Incomplete features create broken promises (PRD says "intake form," user sees empty dashboard)
- Visual inconsistency signals unprofessionalism
- No clear onboarding path creates confusion and abandonment
- Missing retention hooks mean one-time login, then churn
- No competitive differentiation vs. existing solutions

**Oprah:** "Would not recommend. Feels half-built."
**Shonda:** "Portal is a filing cabinet. Not a relationship."
**Jensen:** "You built a beautifully-executed MVP for the wrong product."
**Buffett:** "Building the car before proving people want to drive."

---

## Strategic Questions Requiring Answers

Before any path proceeds, leadership must answer:

1. **Target Customer:** Who is ideal portal user?
   - Solo founders building MVP? (Low LTV, high volume)
   - Small businesses needing web presence? (Medium LTV, medium volume)
   - Agencies white-labeling Shipyard builds? (High LTV, low volume)

2. **Acquisition Strategy:** How do users discover portal?
   - SEO content marketing? (slow, cheap, compounds)
   - Paid ads? (fast, expensive, doesn't compound)
   - Referrals from existing clients? (requires existing delight)

3. **Core Differentiation:** Why choose Shipyard vs. Webflow/Framer/Wix?
   - Speed? (5-7 day turnaround vs. 30+ days for agencies)
   - Price? ($500-1,500 vs. $3K-10K for agencies)
   - Quality? (AI-built with human review vs. templates vs. custom code)
   - Ongoing support? (retainer model vs. one-time project)

4. **Retention Strategy:** What creates long-term value post-launch?
   - Analytics dashboard showing site performance?
   - Recommendation engine suggesting improvements?
   - Content/SEO updates via retainer?
   - Community of Shipyard site owners?

**Until these are answered with data (not assumptions), any portal build is speculative.**

---

## Final Recommendation

**HOLD on current implementation.**

**Immediate next steps (Week 1):**
1. Run Path C validation (surveys + manual self-service test)
2. Answer 4 strategic questions above with research + competitive analysis
3. Reconvene board with validation data

**If validation succeeds (Week 2-3):**
- Execute Path A: Complete core features (intake, status, analytics)
- Fix visual consistency
- Add retention hooks (email notifications, progress visualization)
- Test with validated interested users

**If validation fails:**
- Pivot to high-touch service model
- Use portal as internal tool for client communication (not self-service)
- Revisit self-service strategy once delivery pipeline scales to 50+ projects/month

**Long-term (Month 4+):**
- Incorporate Jensen's platform vision once core product proves retention
- Build on proven conversion data, not assumptions
- Phase in AI features as enhancement, not replacement

---

**Board Status:** Awaiting validation data before approving proceed.

---

**Signatures:**

**Warren Buffett** — Capital & Revenue
*"Prove people want to drive before building the car."*

**Jensen Huang** — Technology & Platform
*"Willing to support Path C → A → B sequence if validation is rigorous."*

**Oprah Winfrey** — Experience & Trust
*"Fix first-5-minutes or don't launch. Period."*

**Shonda Rhimes** — Narrative & Retention
*"No story, no stickiness, no business. Start with why users come back."*
