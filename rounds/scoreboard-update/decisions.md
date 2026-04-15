# Scoreboard Update — Consolidated Decisions
**The Zen Master's Verdict**

---

## 1. LOCKED DECISIONS: Who Proposed, Who Won, Why

### Decision 1.1: Product Name
- **Proposed by:** Steve Jobs
- **Verdict:** UNANIMOUS WIN (Steve)
- **Rationale:** "Scoreboard" — one word, perfect. Evocative, unambiguous, self-explanatory. Even Elon conceded with "No notes."

### Decision 1.2: Format Structure
- **Proposed by:** Steve (168 lines/project with full context) vs Elon (40 lines total, compact table)
- **Verdict:** SPLIT — Hybrid approach wins
- **Final structure:**
  - **Section 1 (Top):** Summary table. All projects, compact rows. One project = one row. Elon's metric wins here.
  - **Section 2 (Detail):** Top 5 recent projects get expanded context (deliverables, QA notes, board feedback). Steve's "meaning over speed" wins here.
- **Rationale:** Speed AND depth. Scannable in 10 seconds (Elon), contextual understanding for recent work (Steve). Steve conceded that 5,376 lines is unreadable. Elon conceded that pure data without story is a spreadsheet, not a mirror.

### Decision 1.3: Transparency Philosophy
- **Proposed by:** Steve ("Show ALL projects — failures included")
- **Challenged by:** Elon ("Premature transparency is weakness signaling")
- **Verdict:** STEVE WINS with timing caveat
- **Final position:**
  - Show ALL projects (successes AND failures) in the scoreboard
  - Internal transparency: always
  - External publishing: when success rate tells a strategic story (currently 94% — publish now)
  - Never filter or hide to "look good"
- **Rationale:** Steve is right that credibility requires unflinching honesty. Elon's concern about strategic timing is valid but doesn't apply at 94% success rate. The scoreboard is a mirror, not a brochure.

### Decision 1.4: Brand Voice
- **Proposed by:** Steve ("PASS / BLOCK / REJECT" — raw verdicts, no marketing speak)
- **Verdict:** UNANIMOUS WIN (Steve)
- **Final voice:**
  - "PASS on first try" not "Successfully validated with zero blockers"
  - "BLOCK (3 cycles)" not "Required iterative refinement"
  - "REJECT" not "Deferred pending strategic alignment"
  - Use "—" for missing data, not approximations or guesses
- **Rationale:** Engineers talking to engineers. Every word earns its place. Elon agreed: "We're engineers, not PR flacks."

### Decision 1.5: Automation vs Manual Updates (v1)
- **Proposed by:** Steve (manual v1, automate v2) vs Elon (automate from day 1)
- **Verdict:** ELON WINS
- **Final approach:** Build automated extraction script for v1
- **Rationale:** Elon is correct that manual updates create:
  - Forgotten updates during fast shipping
  - Inconsistent formatting
  - 20 minutes of busywork per update
  - Steve's "someone needs to care" is romantic but impractical. Automation forces standardization. Automated imperfection beats manual perfection because consistency compounds.

### Decision 1.6: Pipeline Duration Source
- **Proposed by:** Original PRD (extract from daemon logs)
- **Challenged by:** Elon (scope creep, log parsing is 3+ hours of work)
- **Verdict:** ELON WINS — Steve conceded
- **Final approach:**
  - Use round file timestamps (`created_at` vs `final_verdict_at`) for approximate duration
  - Write "—" if data unavailable
  - Daemon log parsing is v2, not v1
- **Rationale:** Don't let perfect data block good-enough data. If data isn't in `rounds/`, ship without it.

### Decision 1.7: Agent Count Metric
- **Proposed by:** Steve (include agent count as "complexity signal" and "forensic evidence")
- **Challenged by:** Elon ("vanity metric" that creates wrong incentives)
- **Verdict:** ELON WINS
- **Final position:** Cut agent count from v1 scoreboard
- **Rationale:**
  - Internally optimizes for low count instead of quality (wrong incentive)
  - Externally signals inefficiency to clients
  - Belongs in daemon logs for pipeline optimization, not public scoreboard
  - Steve didn't defend it strongly in Round 2

### Decision 1.8: Target Length/Scope
- **Proposed by:** Elon (≤50 lines, fits on one screen)
- **Challenged by:** Steve ("as long as needed to tell the truth")
- **Verdict:** STEVE WINS on principle, Elon wins on implementation constraint
- **Final target:**
  - Summary table: ~40 lines (32 projects + headers/totals/metadata)
  - Expanded details: 5 recent projects × ~25 lines = ~125 lines
  - **Total v1 scope: ~165 lines** (vs 5,376 if every project got full detail)
- **Rationale:** Constraint forces clarity. GitHub renders up to 500 rows instantly, so 165 lines is trivial. Elon's "one screen" is wrong constraint, but his compact format prevents bloat.

### Decision 1.9: Incomplete Data Handling
- **Proposed by:** Both (rare agreement)
- **Verdict:** UNANIMOUS
- **Final approach:** "—" is better than delay, better than guessing, better than blocking
- **Rationale:** Ship incomplete data with clear gaps. Scoreboard is living document. Fill gaps in v2.

---

## 2. MVP FEATURE SET: What Ships in V1

### Core Metrics (Top of scoreboard)
```
- Total shipped: [count]
- Total failed: [count]
- Success rate: [percentage]
- Average pipeline duration: [hours/minutes or "—"]
```

### Summary Table (All projects)
**Columns:**
1. Project Name (linked to PRD)
2. Ship Date
3. QA Verdict (PASS / BLOCK / REJECT / "—")
4. Board Score (0-10 or "—")
5. Deliverables (link to `/deliverables/{project}/` or "—")

**Rows:** One row per completed project (32 in current dataset)

**Sorting:** Reverse chronological (most recent at top)

### Expanded Details (Top 5 recent projects only)
For each of the 5 most recent projects:
- **Context:** What was built, what was delivered
- **QA Notes:** Key blockers, iterations, final verdict
- **Board Feedback:** Score rationale, strategic notes
- **Deliverables:** Bulleted list of key files/artifacts

### What's CUT from v1
❌ Agent count (vanity metric)
❌ Daemon log parsing (scope creep)
❌ File enumeration in deliverables (link to directory is enough)
❌ Full context for ALL 32 projects (only top 5 get expanded view)
❌ Charts/graphs (markdown only)

---

## 3. FILE STRUCTURE: What Gets Built

### Primary Deliverable
```
/SCOREBOARD.md
```
Location: Repo root (maximum visibility)

### Data Sources (Input)
```
/prds/completed/          → List of shipped projects
/rounds/{project}/        → QA verdicts, board scores
  - essence.md
  - round-1-*.md
  - round-2-*.md
  - final-verdict.md (if exists)
/deliverables/{project}/  → Proof of work
```

### Extraction Logic (To Build)
```
/scripts/update-scoreboard.sh  (or .py)
```
**Responsibilities:**
1. `ls prds/completed/` → parse project names
2. For each project, check if `rounds/{project}/` exists
3. Grep/parse round files for:
   - QA verdict (PASS/BLOCK/REJECT)
   - Board score (numerical)
   - Timestamps (approximate duration)
4. Generate markdown with:
   - Headline metrics
   - Summary table (all projects)
   - Expanded details (top 5)
5. Write to `/SCOREBOARD.md`

**Fallback logic:**
- If verdict not found → write "—"
- If board score not found → write "—"
- If timestamps missing → write "—"
- **Never block on missing data**

### Automation Trigger (v1)
Manual execution: `./scripts/update-scoreboard.sh`

**v2 consideration:** Git hook or CI/CD trigger after project completion

---

## 4. OPEN QUESTIONS: What Still Needs Resolution

### Q1: Standardized Metadata Format
**Question:** Should we create `meta.json` in each `rounds/{project}/` for structured data?

**Elon's position:** Yes, this is the 10x path. Parse JSON instead of grep/parsing freeform markdown.

**Status:** Deferred to v2. Don't block v1 on format standardization.

**Decision needed:** After v1 ships and we see extraction pain points, revisit structured metadata.

---

### Q2: Historical Projects (Pre-Pipeline)
**Question:** How do we handle projects shipped before the rounds/ pipeline was formalized?

**Current approach:** Write "—" for missing QA/board data.

**Status:** Acceptable for v1.

**Decision needed:** Do we backfill manually, or leave historical gaps visible?

---

### Q3: External Publishing Criteria
**Question:** At what success rate threshold do we publish SCOREBOARD.md externally (vs keeping it internal)?

**Elon's position:** Don't publish below 80% success rate (credibility risk).

**Steve's position:** Publish now at 94%. Radical transparency is the brand.

**Status:** Currently 94% — consensus to publish.

**Decision needed:** What happens if success rate drops below 80% in future? Do we unpublish or double down on transparency?

---

### Q4: Scoreboard Length at Scale
**Question:** At what project count do we need pagination/archival?

**Current state:** 32 projects = ~165 lines. Renders fine.

**Elon's threshold:** 500+ rows = UX issue. Need archive at that point.

**Status:** Not a v1 concern.

**Decision needed:** Define archival strategy when we hit 100+ projects.

---

## 5. RISK REGISTER: What Could Go Wrong

### Risk 5.1: Inconsistent Data Formats
**Risk:** QA verdicts and board scores are stored inconsistently across round files. Extraction logic becomes brittle spaghetti code.

**Likelihood:** HIGH (current round files are freeform markdown)

**Impact:** MEDIUM (extraction script requires manual fallbacks, slows automation)

**Mitigation:**
- Build robust grep patterns with multiple fallback attempts
- Use "—" liberally when data not found
- Track failed extractions to identify format standardization needs
- v2: Implement structured metadata (meta.json)

**Owner:** Engineering (whoever builds extraction script)

---

### Risk 5.2: Forgotten Manual Updates
**Risk:** Even with automated script, someone forgets to run it after shipping a project.

**Likelihood:** MEDIUM (depends on discipline)

**Impact:** LOW (scoreboard is stale but not broken)

**Mitigation:**
- Add reminder in project completion checklist
- v2: Git hook automation
- Accept that v1 may have 1-2 day lag

**Owner:** Project lead (whoever owns process)

**NOTE:** Elon's automation-from-day-1 decision reduces this risk significantly.

---

### Risk 5.3: Success Rate Drops Below 80%
**Risk:** Scoreboard becomes credibility liability if we hit a string of failures.

**Likelihood:** LOW (currently 94%, trending well)

**Impact:** HIGH (external perception damage if published)

**Mitigation:**
- Monitor success rate quarterly
- If drops below 80%, add context section explaining failures and learnings
- Never hide or filter — double down on transparency WITH context
- Steve's position: "Hiding failures is what WeWork did"

**Owner:** Leadership (decides communication strategy)

---

### Risk 5.4: Scope Creep to 5,000-Line Monster
**Risk:** Engineers add "just one more metric" until scoreboard becomes unreadable database dump.

**Likelihood:** MEDIUM (feature creep is universal)

**Impact:** HIGH (defeats entire purpose of scannable scoreboard)

**Mitigation:**
- Lock v1 format via this decisions doc
- Any additions require debate round + approval
- Elon's 50-line budget is the guardrail
- Reject additions unless they pass "would I read this in 30 seconds?" test

**Owner:** Phil Jackson (Zen Master enforces simplicity)

---

### Risk 5.5: Pipeline Duration Data Unavailable
**Risk:** Round file timestamps are missing/inconsistent, making duration calculation impossible.

**Likelihood:** MEDIUM (older projects may lack timestamps)

**Impact:** LOW (write "—" and move on)

**Mitigation:**
- Accept "—" as valid data point
- Don't block v1 on complete duration data
- v2: Add standardized timestamps to round file headers

**Owner:** Whoever builds extraction script

---

## 6. SYNTHESIS: The Build Blueprint

### What the Builder Needs to Know

**Objective:** Create SCOREBOARD.md that is scannable (Elon), meaningful (Steve), and unflinchingly honest (both).

**Success Criteria:**
1. ✅ 32 projects visible in summary table
2. ✅ Top 5 projects have expanded context
3. ✅ Failures visible (no hiding)
4. ✅ Missing data marked as "—" (no guessing)
5. ✅ Brand voice: PASS/BLOCK/REJECT (no corporate speak)
6. ✅ Total length ≤200 lines
7. ✅ Automated extraction script (no manual data entry)

**Non-Negotiables:**
- Show ALL projects (Steve wins)
- One row per project in summary (Elon wins)
- Automate from day 1 (Elon wins)
- Raw verdicts, no marketing speak (Steve wins)
- Use "—" for missing data (unanimous)

**Execution Plan:**
1. Build extraction script (`scripts/update-scoreboard.sh`)
2. Test on current 32 projects
3. Generate SCOREBOARD.md
4. Review for accuracy (not completeness)
5. Ship when honest, not when perfect
6. Iterate based on real usage

**Timeline:** 1 agent session, 2-3 hours max (per Elon's estimate)

---

## 7. FINAL VERDICT: THE ZEN MASTER'S CALL

Both Steve and Elon brought essential truths:

**Steve** understood that a scoreboard without meaning is just a spreadsheet. He fought for transparency, context, and brand voice. He won the soul of the product.

**Elon** understood that beauty without constraint becomes bloat. He fought for automation, simplicity, and shipping speed. He won the discipline of execution.

**The synthesis:** A compact, automated, brutally honest scoreboard that tells stories through numbers and expands context where it matters most.

- **Trophy case or dashboard?** Both. The numbers are the dashboard. The expanded details are the trophies.
- **40 lines or 5,000 lines?** Neither. ~165 lines: scannable summary + meaningful depth.
- **Manual or automated?** Automated. Steve's romanticism loses to Elon's pragmatism here.
- **Hide failures or show all?** Show all. At 94% success rate, transparency is strength.

**Ship it honest. Ship it automated. Ship it now.**

---

*"The scoreboard is a mirror, not a brochure."* — Steve Jobs
*"The numbers will tell the story — if we let them."* — Elon Musk

Both are true. Build accordingly.
