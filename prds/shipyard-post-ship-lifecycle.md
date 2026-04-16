# PRD: Shipyard Post-Ship Lifecycle System

**Author:** Phil Jackson (IMPROVE Cycle Consolidation)
**Date:** 2026-04-16
**Source:** IMPROVE-2026-04-16T03-1 Board Reviews
**Priority:** P1

---

## Problem Statement

Shipyard AI currently treats every project as a transaction. Projects end at deployment. There is no ongoing relationship, no reason for customers to return, and no data compounding from shipped projects.

**Board findings that triggered this PRD:**

- **Shonda Rhimes:** "Retention grade: D — No retention mechanics. Each project is an ending, not a beginning. Memory decay means a client who used Shipyard 6 months ago might not remember when they need their next site."

- **Jensen Huang:** "Shipyard builds sites but doesn't learn from them. There's no feedback loop between shipped projects and future recommendations. No operational data, no compounding."

- **Warren Buffett:** "Each project is a transaction, not a story. Competitive vulnerability—if another agency appears at the right moment, Shipyard has no lock-in."

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Repeat customer rate | Unknown (no tracking) | 30% within 12 months |
| Post-ship email open rate | N/A | 50%+ |
| Revision/update orders from lifecycle emails | 0 | 20% of shipped projects |
| Customer relationship duration | Single project | 12+ months |

---

## User Stories

### As a Shipyard customer:
1. I want to know how my site is performing after launch so I can trust the quality of work.
2. I want to be reminded when my site needs updates so I don't fall behind on security.
3. I want to maintain a relationship with Shipyard so I know who to call for my next project.

### As Shipyard:
1. We want to stay in touch with customers so they remember us for future work.
2. We want to learn from shipped projects so we can improve recommendations.
3. We want to create recurring revenue opportunities from maintenance and updates.

---

## Proposed Solution

### Phase 1: Post-Ship Lifecycle Email Sequence

A automated email sequence that maintains relationship after deployment:

**Day 7: "Your Site is Live"**
- Confirmation that deployment is complete
- Links to site, admin, and any documentation delivered
- Invitation to leave feedback

**Day 30: "30-Day Health Report"**
- Basic performance metrics (if we can measure: uptime, page speed)
- "How's it going?" check-in
- Link to request revisions (revenue opportunity)

**Day 90: "Quarterly Check-In"**
- Reminder about security updates if applicable
- Industry trends relevant to their site type
- Case study of another similar project (social proof)
- One-click "Schedule an update" CTA

**Day 180: "6-Month Review"**
- Summary of web standards changes since launch
- "Is your site still meeting your needs?" prompt
- Special offer for returning customers

**Day 365: "Happy Anniversary"**
- Celebration of the 1-year milestone
- Retrospective: "Here's how the web has changed in the past year"
- "Time for a refresh?" prompt with returning customer pricing

### Phase 2: Project Telemetry (Future)

After email sequence is validated, add:
- Time-per-phase tracking across projects
- Token efficiency metrics by project type
- Revision frequency analysis
- Pattern detection: "Sites with X framework ship 40% faster"

This data becomes a competitive moat—operational insights that traditional agencies can't match.

---

## Technical Requirements

### Email Infrastructure
- Transactional email service (Postmark, SendGrid, or Resend)
- Email templates with personalization (project name, site URL, customer name)
- Scheduled send system (can use Cloudflare Workers + KV for simple scheduling)
- Unsubscribe handling (CAN-SPAM compliance)

### Data Model
```typescript
interface ShippedProject {
  id: string;
  customerEmail: string;
  customerName: string;
  projectName: string;
  siteUrl: string;
  shippedAt: Date;
  projectType: 'site' | 'theme' | 'plugin';
  tokenBudget: number;
  tokensUsed: number;
  lifecycleEmails: {
    day7: { sent: boolean; sentAt?: Date; opened?: boolean };
    day30: { sent: boolean; sentAt?: Date; opened?: boolean };
    day90: { sent: boolean; sentAt?: Date; opened?: boolean };
    day180: { sent: boolean; sentAt?: Date; opened?: boolean };
    day365: { sent: boolean; sentAt?: Date; opened?: boolean };
  };
}
```

### Scheduling Worker
Daily cron job that:
1. Queries shipped projects
2. Calculates which lifecycle emails are due
3. Sends appropriate email via transactional service
4. Updates project record with sent timestamp

---

## Implementation Approach

### MVP (2 weeks)
1. Set up transactional email service
2. Create 5 email templates (Day 7, 30, 90, 180, 365)
3. Build shipped project tracking database
4. Build daily email scheduler
5. Manual entry of shipped projects initially (before full pipeline integration)

### V1.1 (2 weeks)
1. Auto-populate shipped projects from pipeline completion
2. Add email open tracking
3. Add click tracking for revision CTAs
4. Dashboard for viewing email performance

### V2 (Future)
1. Project telemetry integration
2. Performance metrics in emails (requires site monitoring)
3. Personalized recommendations based on project type

---

## Out of Scope

- Site monitoring/uptime tracking (too complex for MVP)
- Automated performance audits (requires external service integration)
- Customer portal (future consideration)
- SMS notifications (email first)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Emails marked as spam | Medium | High | Use reputable transactional service, proper SPF/DKIM |
| Low engagement | Medium | Medium | A/B test subject lines, optimize send times |
| Manual project entry overhead | High | Low | Automate in V1.1 |
| Customer finds emails annoying | Low | Medium | Clear unsubscribe, max 5 emails/year |

---

## Timeline

- **Week 1:** Email service setup, template design, database schema
- **Week 2:** Scheduler implementation, testing, first manual project entry
- **Week 3-4:** Pipeline integration, tracking dashboard (V1.1)

---

## Definition of Done

- [ ] 5 lifecycle email templates written and designed
- [ ] Transactional email service configured with proper deliverability
- [ ] Shipped project database created
- [ ] Daily scheduler running in production
- [ ] At least 1 real project entered and receiving lifecycle emails
- [ ] Unsubscribe handling implemented
- [ ] Email open/click tracking operational
- [ ] Dashboard showing email performance metrics

---

## Appendix: Board Review Excerpts

**Shonda Rhimes (Full Retention Analysis):**
> "There's no reason to return unless you have another project. That's not retention—that's repeat purchase... Memory decay means a client who used Shipyard 6 months ago might not remember when they need their next site."

**Jensen Huang (Compounding Advantage):**
> "Add project telemetry to Shipyard builds. Track time-per-phase, token efficiency per agent, revision frequency by project type. This becomes your differentiation against agencies and DIY tools."

**Warren Buffett (Revenue Impact):**
> "Transforms project transactions into ongoing relationships. Creates recurring revenue opportunities from maintenance and updates."

---

*PRD generated from IMPROVE-2026-04-16T03-1 board review cycle.*
