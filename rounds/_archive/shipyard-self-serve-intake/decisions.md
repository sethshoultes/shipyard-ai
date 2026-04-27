# Shipyard Self-Serve Intake: Locked Decisions
*Blueprint for Build Phase*

---

## Executive Summary

**Core Vision:** Turn GitHub issues into shipped code without user thinking about it. Zero-click default path. System reads minds, not forms.

**Guiding Principle:** Invisible power. Open issue, make coffee, PR appears.

**Ship Date:** Friday EOD (non-negotiable)

---

## I. Locked Decisions

### Decision 1: Interface = GitHub Issues (No Forms)
**Proposed by:** Steve Jobs (refined by Elon's pragmatism)
**Winner:** Steve
**Why:** GitHub is already the lingua franca. Users know issues, labels, comments. Don't invent new interfaces when the right one exists.

**Implementation:**
- Primary intake = opening a GitHub issue
- No web forms, no dropdowns, no configuration UI
- Labels and comments are the only user inputs
- System infers intent from issue content

**Rationale:** Forms feel administrative. GitHub issues feel native. The best interface is the one users already use daily.

---

### Decision 2: Zero-Click Default Path
**Proposed by:** Steve Jobs
**Winner:** Steve
**Why:** Self-serve means invisible, not self-service. The moment users choose between options, we've failed.

**Implementation:**
- Issue opened → automatically analyzed
- Priority inferred from content (p0/p1/p2 detection)
- Pipeline type determined from context
- PRD generated and linked back to issue
- Bot comments immediately with PRD link and status

**Rationale:** Speed to value > speed to ship. A system that requires 8 fields and dropdown decisions isn't self-serve—it's bureaucracy with a UI.

---

### Decision 3: Ship This Week, Iterate Forever
**Proposed by:** Elon Musk
**Winner:** Elon (with Steve's quality constraints)
**Why:** Perfect is the enemy of shipped. Real user feedback > internal taste debates.

**Implementation:**
- Basic flow live by Friday EOD
- Hardcoded rules for v1 (no extensibility framework)
- Ship minimal required fields
- Add sophistication based on ACTUAL usage patterns

**Compromise:** Spend ONE day making the core experience not janky. The first impression trains culture, but we're not founding a design system in week 1.

---

### Decision 4: Tech Stack = Postgres + GitHub Only
**Proposed by:** Elon Musk
**Winner:** Elon
**Why:** Zero new infrastructure. No sync delays, no API limits, no vendor lock-in.

**Implementation:**
- One Postgres table for intake submissions
- GitHub API for issue monitoring and comments
- No Airtable, no custom form builders, no third-party services
- Email via existing Resend/Postmark setup

**Rationale:** While others debate integration strategies, this ships. Use the 20 years of solved problems in established tools.

---

### Decision 5: Intelligent Defaults Over Configuration
**Proposed by:** Steve Jobs
**Winner:** Steve
**Why:** Humans write, machines categorize. Users shouldn't need to know our internal taxonomy.

**Implementation:**
- Content analysis detects:
  - "urgent bug in production" → p0
  - "nice-to-have feature" → p2
  - "feature request" → auto-queued
- No dropdowns for pipeline type or execution mode
- Advanced users CAN override via labels, but defaults work 90% of the time

**Rationale:** The intake system is a Trojan horse for culture. Teach teams what quality feels like by making it automatic.

---

### Decision 6: Immediate Visible Feedback
**Proposed by:** Steve Jobs
**Winner:** Steve
**Why:** Users trust what they can see. Silent background processing breeds anxiety.

**Implementation:**
- Bot comments on GitHub issue within 30 seconds
- Comment includes:
  - Link to generated PRD
  - Detected priority and reasoning
  - Estimated ship time
  - How to override if needed
- No silent failures—log errors, notify user

**Rationale:** Trust is built through visibility. The system should feel like a responsive colleague, not a black box.

---

### Decision 7: Fail Gracefully, Never Block
**Proposed by:** Elon Musk
**Winner:** Elon
**Why:** Intake should be optimistic: assume success, log failure, never block the user.

**Implementation:**
- If PRD generation fails → comment on issue with error, create basic PRD
- If priority detection unclear → default to p2, ask user
- If GitHub API timeout → queue for retry, don't crash
- Every error logged to observability, but user gets response

**Rationale:** A partially working intake is better than a perfectly failing one.

---

## II. MVP Feature Set (What Ships Friday)

### Must Have (v1)
1. **GitHub Webhook Listener**
   - Monitors issues opened in target repo(s)
   - Filters by label (e.g., `intake-request`)

2. **Content Analysis Engine**
   - Detects priority signals (p0/p1/p2)
   - Extracts project description
   - Identifies urgency keywords

3. **PRD Generator**
   - Creates structured PRD in Postgres
   - Links back to source GitHub issue
   - Generates unique PRD ID

4. **Bot Responder**
   - Comments on GitHub issue with:
     - PRD link
     - Detected priority
     - Next steps
   - Response time: <30 seconds

5. **Basic Dashboard (Read-Only)**
   - View all intake requests
   - See PRD status
   - Filter by priority

### Nice to Have (v2+)
- Custom label handling
- Multi-repo support
- Slack notifications
- Advanced NLP for requirement extraction
- Auto-assignment to engineers
- Integration with project management tools
- Analytics dashboard

### Explicitly Out of Scope for v1
- Web forms
- Custom configuration UI
- User authentication (leverages GitHub auth)
- Custom form validation frameworks
- Beautiful animations and microcopy debates
- Email marketing integrations

---

## III. File Structure (What Gets Built)

```
/app/intake/
├── webhook/
│   ├── github-listener.ts       # Receives GitHub webhook events
│   ├── event-parser.ts           # Extracts relevant data from webhook payload
│   └── validator.ts              # Validates webhook authenticity
│
├── analyzer/
│   ├── content-analyzer.ts       # Main analysis orchestrator
│   ├── priority-detector.ts      # Detects p0/p1/p2 signals
│   ├── requirement-extractor.ts  # Pulls out key requirements
│   └── classification.ts         # Categorizes request type
│
├── prd/
│   ├── generator.ts              # Creates structured PRD
│   ├── templates.ts              # PRD format templates
│   └── storage.ts                # Postgres operations
│
├── responder/
│   ├── bot-comment.ts            # Posts GitHub comments
│   ├── templates.ts              # Response message templates
│   └── formatter.ts              # Formats status messages
│
├── dashboard/
│   ├── routes.ts                 # API routes for dashboard
│   ├── queries.ts                # Postgres queries
│   └── views.tsx                 # Simple read-only UI
│
└── db/
    ├── schema.sql                # Postgres table definitions
    └── migrations/               # Schema version control

/config/
├── github-config.ts              # Repo targets, label filters
└── priority-rules.ts             # Keyword→priority mappings

/tests/
├── webhook.test.ts
├── analyzer.test.ts
└── integration.test.ts
```

### Database Schema (Single Table v1)

```sql
CREATE TABLE intake_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_issue_id INTEGER NOT NULL,
  github_issue_url TEXT NOT NULL,
  repo_name TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  raw_content TEXT NOT NULL,

  -- Classification
  priority TEXT CHECK (priority IN ('p0', 'p1', 'p2')),
  detected_type TEXT,
  confidence_score DECIMAL(3,2),

  -- PRD
  prd_content JSONB,
  prd_url TEXT,

  -- Metadata
  requested_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Tracking
  bot_comment_url TEXT,
  error_log JSONB
);

CREATE INDEX idx_github_issue ON intake_requests(github_issue_id);
CREATE INDEX idx_status ON intake_requests(status);
CREATE INDEX idx_priority ON intake_requests(priority);
CREATE INDEX idx_created_at ON intake_requests(created_at DESC);
```

---

## IV. Open Questions (What Needs Resolution)

### Technical Decisions
1. **Webhook Delivery Reliability**
   - Q: What happens if GitHub webhook fails to deliver?
   - Options: Polling fallback vs. retry queue
   - Owner: Elon
   - Deadline: Before Friday deploy

2. **Priority Detection Algorithm**
   - Q: What keywords trigger p0 vs p1 vs p2?
   - Options: Hardcoded rules vs. simple ML
   - Owner: Steve
   - Deadline: Wednesday for testing

3. **PRD Format**
   - Q: JSON blob vs. structured Markdown vs. hybrid?
   - Options: Use existing Shipyard PRD template
   - Owner: Steve
   - Deadline: Tuesday

4. **Multi-Repo Strategy**
   - Q: One webhook per repo or single endpoint?
   - Options: Single endpoint, filter by repo_name
   - Owner: Elon
   - Deadline: Not blocking v1

### Product Decisions
5. **What Happens When Priority Detection Fails?**
   - Q: Default to p2 and ask? Or require label?
   - Recommendation: Default to p2, comment asking for clarification
   - Owner: Steve
   - Deadline: Before Friday

6. **Override Mechanism**
   - Q: How do users override auto-detected priority?
   - Options: Comment `/priority p0` or add label
   - Owner: Steve
   - Deadline: Wednesday

7. **Error Communication**
   - Q: What does bot comment say when PRD generation fails?
   - Recommendation: "I couldn't generate a full PRD, but I've logged your request. You'll hear from the team within 24 hours."
   - Owner: Steve
   - Deadline: Thursday

8. **Dashboard Access Control**
   - Q: Who can see all intake requests?
   - Options: Internal team only (leverage existing auth)
   - Owner: Elon
   - Deadline: Not blocking v1

---

## V. Risk Register (What Could Go Wrong)

### High Impact, High Probability
1. **GitHub API Rate Limits**
   - Risk: Webhook volume exceeds API limits
   - Mitigation: Queue comments, batch where possible
   - Owner: Elon
   - Contingency: Implement exponential backoff

2. **Ambiguous Issue Content**
   - Risk: User writes vague issue, system can't classify
   - Mitigation: Default to p2, ask clarifying questions
   - Owner: Steve
   - Contingency: Manual review queue

3. **Webhook Authentication Failure**
   - Risk: Invalid webhook signature bypasses security
   - Mitigation: Validate HMAC signature on every request
   - Owner: Elon
   - Contingency: Fail closed, log attempt

### High Impact, Low Probability
4. **Postgres Outage During Intake**
   - Risk: Can't save request, user sees nothing
   - Mitigation: Still comment on issue, retry save
   - Owner: Elon
   - Contingency: Graceful degradation

5. **Bot Account Suspension**
   - Risk: GitHub flags bot for spam behavior
   - Mitigation: Rate limit comments, human-like delays
   - Owner: Elon
   - Contingency: Fallback to email notifications

### Medium Impact, Medium Probability
6. **Priority Keyword Collisions**
   - Risk: "Urgent" in wrong context triggers false p0
   - Mitigation: Context-aware detection (NLP v2)
   - Owner: Steve
   - Contingency: Users can override via label

7. **Scale: 100+ Issues Opened Simultaneously**
   - Risk: System overwhelmed, slow response times
   - Mitigation: Background queue processor
   - Owner: Elon
   - Contingency: Batch processing, async responses

8. **Confusing Bot Messages**
   - Risk: Users don't understand next steps
   - Mitigation: User test bot comments before launch
   - Owner: Steve
   - Contingency: Iterate based on user questions

### Low Impact, High Probability
9. **Edge Cases in Issue Format**
   - Risk: Empty body, only emoji, links instead of text
   - Mitigation: Validation rules, ask for more info
   - Owner: Elon
   - Contingency: Log edge cases, handle manually

10. **Slow PRD Generation**
    - Risk: Takes 2+ minutes, user thinks it failed
    - Mitigation: Immediate ack comment, then update
    - Owner: Steve
    - Contingency: Set expectations in first comment

---

## VI. Success Metrics (How We Know It Works)

### Launch Week Targets (Friday → Next Friday)
- **10+ intake requests processed** without manual intervention
- **<30 second bot response time** on 95% of issues
- **<5% error rate** (successful PRD generation)
- **Zero manual PRD creation** for intake-labeled issues
- **Positive user feedback** from Seth and team

### V2 Expansion Criteria
- If we hit 50+ requests/week → build analytics dashboard
- If error rate >10% → invest in better NLP
- If users ask for features 3+ times → prioritize for v2

---

## VII. The Philosophy (Why This Matters)

### From Elon:
> "Speed IS quality. A working intake form in production by Friday is higher quality than a pixel-perfect mockup you're still iterating on next month. Real user feedback > internal taste debates."

### From Steve:
> "Design isn't polish. Design is teaching your team what users deserve. The intake system is a Trojan horse for culture. When Seth sees it auto-queued correctly without touching a form, he learns what quality feels like."

### The Synthesis (Phil's Call):
Ship fast. Make it feel intelligent. No forms, no bureaucracy. Just GitHub issues that auto-convert into action. The best intake system is the one users don't notice—they just see results.

**The bar:** Seth opens an issue, makes coffee, comes back to find a PR shipped. He doesn't think about intake. He thinks: "Shipyard works."

---

## VIII. Day-by-Day Build Plan

### Monday
- Schema definition and Postgres setup
- Webhook endpoint scaffold
- GitHub bot account provisioning

### Tuesday
- Content analyzer with basic keyword detection
- PRD generator using existing templates
- Bot comment formatter

### Wednesday
- Integration testing: issue → PRD → comment
- Priority detection algorithm tuning
- Error handling implementation

### Thursday
- Dashboard read-only views
- End-to-end testing with real GitHub issues
- User testing bot messages (Seth + team)

### Friday
- Deploy to production
- Monitor first real intake requests
- Celebrate shipped code

### Following Week
- Gather feedback
- Log edge cases for v2
- Iterate based on actual usage

---

## IX. Point People

**Overall Owner:** Phil Jackson (orchestration)
**Technical Lead:** Elon Musk (infrastructure, speed, pragmatism)
**Experience Lead:** Steve Jobs (user invisibility, intelligent defaults)
**First User:** Seth (real-world validation)

---

**Status:** LOCKED FOR BUILD
**Next Step:** Assign engineering resources and ship
**Last Updated:** 2026-04-16

---

*This document is the contract between debate and build. Everything here is decided. Everything else waits for v2.*
