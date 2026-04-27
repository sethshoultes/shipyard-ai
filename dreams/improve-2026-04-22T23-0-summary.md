# IMPROVE Cycle Summary — Phil Jackson Consolidation
**Date:** 2026-04-22
**Cycle:** IMPROVE-2026-04-22T23-0
**Moderator:** Phil Jackson

---

## Board Member Reviews

| Board Member | Focus Area | Key Finding |
|--------------|------------|-------------|
| **Jensen Huang** | Moat Gaps | Insight persistence shipped ✅, but benchmark engine blocked 8 days. Shipyard showcase FAILED. Pipeline is building process IP faster than product moats. |
| **Oprah Winfrey** | First-5-Minutes | UX improvements keep getting rejected/blocked while infrastructure ships. Users need demonstration, not explanation. Demo video due tomorrow. |
| **Warren Buffett** | Revenue & Capital | LocalGenius annual billing committed EOW but frontend PRD rejected. Shipyard maintenance PRD written but not deployed. Capital allocation is backwards. |
| **Shonda Rhimes** | Retention Hooks | `insight_actions` table is the perfect narrative database — but we're not querying it for users. Retention PRDs are in a graveyard. |

---

## Cross-Board Consensus

### 1. The Pipeline Has an Improvement Delivery Problem
All four board members independently identified the same pattern: **code PRDs ship, experience PRDs stall.**

| PRD | Status | Days Stuck | Type |
|-----|--------|------------|------|
| localgenius-benchmark-engine | BLOCK | 8 | Data/Moat |
| shipyard-showcase | FAILED | 1 (Apr 21) | Content/Proof |
| monetization-mvp | HOLD | 6 | Lifecycle/Retention |
| shipyard-client-portal | BLOCK | 7 | Experience |
| localgenius-frontend-launch | REJECT | 7 | Experience |
| shipyard-post-delivery-v2 | BLOCK | 9 | Lifecycle |

**Verdict:** The pipeline is optimized for new code delivery. Content, data aggregation, lifecycle automation, and UX improvements are falling through cracks. This is not a product problem — it's a delivery discipline problem. We need a lightweight "Improvement Track" for non-code changes.

### 2. LocalGenius Is the Scorer — But It's Not Getting the Ball
All four board members agree: LocalGenius is the portfolio's only proven revenue engine (LTV/CAC 9.3x). Yet:
- Its benchmark engine is blocked
- Its frontend improvements get rejected
- Its annual billing is at risk
- Its engagement system PRD exists but isn't deployed

Meanwhile, Shipyard has consumed 5+ PRDs with minimal revenue output.

**Verdict:** LocalGenius needs executive priority and protected pipeline capacity. Every blocked LocalGenius PRD is a direct hit to the portfolio's primary cash flow engine.

### 3. Insight Persistence Shipped — Now Surface It
The single biggest technical win of this cycle is the `insight_actions` table (insight persistence). It creates institutional memory for LocalGenius and powers the entire retention narrative.

But: **we're using it for the AI, not the user.** Shonda's week-over-week digest line. Jensen's benchmark aggregation. Oprah's dashboard preview. All of them could query this table.

**Verdict:** The schema is the moat. The query is the product. Stop building tables and start surfacing stories.

---

## Top 3 Improvements Ranked by Impact

### #1: LocalGenius Revenue & Retention Sprint — Annual Billing + Weekly Digest Story Line
**Impact: CRITICAL** | **Effort: LOW** | **Ship: 3 days**

**What:**
- Add annual billing option with 20% discount (~$278/year vs $348/year) — simple Stripe plan + HTML toggle on existing pricing page
- Add "This Month vs. Last Month" comparison to weekly digest — query existing `insight_actions` table for 3 metrics

**Why:**
- Buffett: Annual billing pulls forward 2.4 months of revenue (if 30% adopt) and reduces churn 40%. The frontend PRD rejection was scope bloat — this is a radio button, not a redesign.
- Shonda: The data exists. The digest exists. One query converts a report into a narrative arc.
- Jensen: Using the `insight_actions` table for user-facing benchmarks is the first step toward the data moat.
- Oprah: The pricing page change removes plan-choice anxiety (annual = commitment = confidence).

**Combined Effect:** Highest-ROI revenue change + highest-ROI retention change + moat activation. All three use existing infrastructure.

**Who:** LocalGenius engineering (2 days for billing toggle, 1 day for digest query)
**Depends on:** Nothing. Bypass blocked frontend PRD. Use existing Stripe account and email template.

---

### #2: Shipyard Maintenance Subscription MVP — Deploy or Pause
**Impact: HIGH** | **Effort: LOW (reduced scope)** | **Ship: 3 days**

**What:**
- Deploy Shipyard maintenance tier as stripped-down MVP: "$500/month, 2 revision rounds, email support, priority queue"
- No client portal. No post-delivery automation. No showcase dependency.
- Stripe subscription + dedicated Slack channel + Notion tracker.

**Why:**
- Buffett: PRD exists but hasn't deployed. Existing scope is too heavy. Reduce to revenue-generating minimum.
- Shonda: Creates ongoing relationship without waiting for full lifecycle automation.
- Jensen: Stop writing Shipyard PRDs until this ships. One shipped subscription beats five blocked PRDs.
- Oprah: Customers understand "$500/month" better than tokens.

**Combined Effect:** Converts Shipyard from transactional to recurring. Unblocks capital allocation. Proves the model before building the platform.

**Who:** Shipyard engineering + business (1 day Stripe, 1 day comms, 1 day launch)
**Depends on:** Existing `shipyard-maintenance-subscription.md` PRD — but treat it as reference, not spec. This is a scope-reduction execution.

---

### #3: Product Demonstration Emergency — LocalGenius Demo Video + Shipyard Dollar Pricing
**Impact: MEDIUM-HIGH** | **Effort: LOW** | **Ship: 2 days**

**What:**
- Record 60-second LocalGenius demo on phone: owner asks question → AI suggests action → owner approves. Upload to homepage.
- Change Shipyard pricing page: "$500–$2,000 per project" instead of tokens. Add "What's a PRD?" link to Google Doc template.

**Why:**
- Oprah: Users can't visualize using the product. The frontend pipeline is blocked — bypass it with authentic video.
- Jensen: Video communicates differentiation faster than text.
- Buffett: Dollar pricing removes purchase friction.

**Combined Effect:** Converts "interesting" visitors to trial signups (LocalGenius) and qualified leads (Shipyard). Zero code. Zero PRD required.

**Who:** Marketing + founder (2 hours video, 1 hour copy)
**Depends on:** Nothing. Can ship today.

---

## Improvements Not Prioritized (Good Ideas, Pipeline-Corrected)

| Idea | Board Member | Why Deprioritized |
|------|--------------|-------------------|
| LocalGenius benchmark engine full build | Jensen | Unblock existing PRD first, don't build v2 |
| Shipyard showcase page | Jensen/Oprah | Failed once. Do blog post instead (no PRD). |
| Dash onboarding overlay | Oprah | Low impact vs. #3 above; 3 lines of placeholder text instead |
| Pinned welcome note | Oprah | Trivial (< 1 hour), do in same sprint as #1 |
| LocalGenius referral program | Buffett | Do after annual billing proves retention lift |
| Shipyard Post-Launch Pulse | Shonda | Do after maintenance subscription proves relationship model |
| Pipeline Improvement Track | Jensen | Process change, not product change; implement outside IMPROVE cycle |

---

## PRD Required?

**Yes — Improvement #1 (LocalGenius Annual Billing + Weekly Digest Line)** is significant enough to warrant a PRD.

Rationale:
- Cross-functional: requires engineering (billing + query), product (pricing psychology), and marketing (messaging)
- Affects core business model and unit economics
- Has a dependency risk (frontend PRD rejection) that requires explicit scope control
- Changes both revenue model (new Stripe plan) and retention mechanics (new digest query)

**PRD written to:** `/home/agent/shipyard-ai/prds/localgenius-revenue-retention-sprint.md`

Improvement #2 (Shipyard Maintenance MVP) does **not** need a new PRD — the existing `shipyard-maintenance-subscription.md` is sufficient reference. The fix is execution and scope reduction, not more planning.

Improvement #3 (Demo Video + Dollar Pricing) does **not** need a PRD — these are marketing tasks, not engineering projects.

---

## Next Actions

| Action | Owner | Due |
|--------|-------|-----|
| Ship LocalGenius annual billing toggle + digest query | Engineering | Apr 25 |
| Deploy Shipyard maintenance MVP (Stripe + Slack) | Engineering + Business | Apr 25 |
| Record & upload LocalGenius demo video | Marketing / Founder | Apr 23 |
| Update Shipyard pricing to dollar ranges | Marketing | Apr 23 |
| Unblock or close localgenius-benchmark-engine PRD | Engineering Lead | Apr 24 |
| Add Pinned welcome note (one seed row) | Engineering | Apr 24 |
| Manual post-launch check to last 5 Shipyard clients | Business | Apr 23 |

---

## Phil's Closing Thought

> "The Triangle Offense works because everyone knows their role. But it also works because the ball moves. LocalGenius is the scorer — protect it. Shipyard is the playmaker — but stop calling plays it can't execute. The plugins are role players — they don't need more touches. And the pipeline? The pipeline is the court. If the floor is cracked, nobody can run the offense."

This cycle's revelation is not a product gap — it's a delivery gap. We have the data (`insight_actions`). We have the plans (PRDs in `completed/`). We have the unit economics (9.3x LTV/CAC). What we need is the discipline to ship improvements with the same rigor we ship features.

**Execute #1 first. It pays for everything else.**

---

*Phil Jackson*
*Moderator, Great Minds Board*
