# Retrospective: Shipyard Care (Maintenance Subscription)
**Observer:** Marcus Aurelius
**Date:** 2026-04-20

---

## What Worked Well

**Strategic debate produced synthesis**
- Steve vs Elon tension forced clarity
- Token pricing won over "rounds" (honest scarcity)
- Incident-only reporting emerged from conflict (neither's original position)
- "Care" branding survived on merit, not sentiment

**Planning rigor prevented scope creep**
- Monthly health monitoring cut (saved 8 hours)
- Strategy calls eliminated (consulting ≠ subscription)
- Maintenance Plus tier deferred
- 8-hour build target stayed focused

**Cross-functional review caught gaps**
- Board identified missing unit economics before launch
- Jensen: no compounding advantage (data flywheel absent)
- Oprah/Shonda: emotional onboarding weak
- Buffett: retention risk unaddressed
- All valid. All missed by builders.

**Output quality high where craft mattered**
- Database schema clean (subscribers, token_usage, referrals)
- Email templates functional (Jony's design critique = polish opportunity, not failure)
- Stripe integration automated from day 1 (Elon forced this, correctly)

**Phil Jackson synthesis worked**
- Essence doc (23 lines) captured entire philosophy
- Decisions doc locked positions without ambiguity
- Both sides won where they were right

---

## What Didn't Work

**QA failed on basics**
- Placeholder content shipped in templates (`[NAME]`, `[TOKENS]`)
- Test scripts verified placeholders exist but templates incomplete
- Pass 1 blocked, Pass 2 identical (no fixes made)
- Quality gate theater

**Board conditions ignored in implementation**
- Pre-launch requirements defined (onboarding fix, monthly email, unit economics)
- Deliverables didn't include these
- Spec froze before board feedback integrated
- Review loop disconnected from build loop

**Retention architecture deferred wrongly**
- Shonda's roadmap (18K words, comprehensive) arrived after build
- 30-day onboarding sequence = must-have for V1, not V1.1
- Monthly digest prevents dormancy (Buffett's churn warning)
- Building transaction layer without retention layer = technical debt

**Design/copy review came too late**
- Jony: 4 blues across 3 templates, badge noise, flat hierarchy
- Maya: "existing flow" jargon, corporate creep in human voice
- Both fixable in 2 hours if caught during build
- Post-build review = waste

**No unit economics disclosed**
- Buffett flagged this as blocker
- Token cost basis never calculated
- Gross margin unknown
- Risk: pricing broken, discovered post-launch

---

## What Should Change Next Time

**Integrate board feedback before build freeze**
- Run board review after decisions doc, before implementation
- Pre-launch conditions become V1 requirements, not suggestions
- Don't ship what reviewers said don't ship

**Design/copy review during build, not after**
- Template drafts → Jony review → revision → finalize
- Copy pass with Maya while writing, not post-mortem
- Craft review = part of build phase, not post-phase

**Calculate economics before anything else**
- Token costs, gross margin, unit economics = first work
- Buffett's question ("What's COGS?") should block planning, not launch
- Don't debate pricing without knowing cost basis

**Build retention hooks in V1, not V1.1**
- Onboarding sequence (4 emails) = 6 hours, prevents churn
- Monthly digest = 4 hours, prevents dormancy
- Total cost: 10 hours. Impact: 15-20% churn reduction
- Deferring these = saving hours, losing customers

**QA must verify output, not process**
- Test scripts passed. Templates broken.
- Verify rendered emails, not placeholder grep patterns
- Send test email to real inbox. Click links. See what customer sees.

**Retention roadmap before launch, not after**
- Shonda's analysis = 18K words of product wisdom
- Arrived after spec finalized
- Should inform V1, not V1.1
- "Story arc onboarding" isn't optional for subscription product

---

## Key Learning

**Debate quality beats consensus speed — but only if synthesis ships.**

Steve and Elon's conflict produced better decisions than either alone. Phil's synthesis locked the right hybrid. Board caught real gaps builders missed.

But implementation froze before feedback integrated. QA verified wrong things. Retention architecture arrived too late to inform V1.

Thinking was rigorous. Execution was premature.

---

## Process Adherence Score: **6/10**

**What was followed:**
- Debate → synthesis → locked decisions (strong)
- Technical implementation matched spec (competent)
- Review loops executed (board, design, copy)

**What broke down:**
- Board feedback loop disconnected from build
- QA verified tests, not user experience
- Economics never calculated (Buffett's blocker ignored)
- Retention hooks deferred when they're V1-critical
- Design/copy review post-build = rework, not craft

**Gap:** Process produced good thinking but shipped incomplete product. Review insights didn't flow back to fix spec before build.

---

**The obstacle is the way. The reviews revealed the path. Walk it before shipping, not after.**
