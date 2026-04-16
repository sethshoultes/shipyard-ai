# Jony Ive Design Review
**Deliverables:** `/home/agent/shipyard-ai/deliverables/shipyard-post-ship-lifecycle/`
**Date:** 2026-04-16

---

## resend-setup-guide.md

**Visual Hierarchy: FAILS**
- Title buried (line 1) — no visual weight
- "Purpose" at line 3 competes with title
- 706 lines — overwhelming, no breathing room
- Phase headers (lines 27, 65, 100) identical weight to subsections

**What I'd change:**
- Remove lines 3-10 (pre-summary clutter) — summary is enough
- Collapse provider-specific DNS instructions (lines 149-174) — single example, not three
- Lines 230-235 (DMARC value explanation) — inline, not separate paragraph
- Lines 451-465 (warm-up table) — simplify to prose, table is overkill
- Lines 553-570 (DNS summary) — redundant, already in Phase 3
- Cut 40% of words — say it once, not three times

**Craft issues:**
- Checkboxes (lines 73-86) use ugly `- [ ]` syntax — inconsistent with later checklists
- Lines 152-173 repeat pattern identically — GoDaddy, Cloudflare, Route 53 — show one, imply rest
- Line 19 emoji checkmarks (✅) clash with later checkbox style

**Consistency:**
- Code blocks inconsistent — some bash (line 281), some dns (line 553), some typescript (line 419)
- Headers inconsistent depth — some Phase > Step, others jump levels

**Verdict:** Functional but noisy. Too many words defending choices already made. Remove explanations, keep actions.

---

## config-decisions.md

**Visual Hierarchy: BETTER**
- Clear decision headers (lines 12, 39)
- Good use of whitespace around sections
- Checklists (lines 72-95) cleanly structured

**What I'd change:**
- Lines 22-28 (domain setup required) — move to implementation section, not rationale
- Lines 48-53 (operational details) — too granular for "decisions" doc, belongs in runbook
- Lines 115-119 (risk mitigation for deliverability) — wrong doc, put in setup guide
- Lines 147-154 (success metrics) — beautiful, keep this

**Craft:**
- Line 30 "Bearer token + domain authentication" — jargon leak
- Line 174 attribution quotes — charming, human touch, keep

**Verdict:** Good bones. Trim operational detail. This is "what we decided," not "how to do it."

---

## AUDIT_REPORT.md

**Visual Hierarchy: GOOD**
- Executive summary (lines 9-21) — clear, verdict-first
- Table (lines 48-61) — scannable, dense with meaning
- Checklist (lines 68-89) — clean, purpose-driven

**Whitespace: EXCELLENT**
- Section breaks clear
- Table doesn't crowd
- Checklist breathes

**What I'd change:**
- Lines 26-31 (data discovery bullet list) — compress to single line: "Scanned PRDs, projects, examples, git history"
- Lines 33-40 (validation steps) — compress to: "Validated email format, name presence, URL validity, date format, ID uniqueness"
- Lines 77-82 (sample valid emails) — one example is enough, not three
- Lines 158-160 — redundant close, already said at line 150

**Consistency:**
- Checkbox style matches config-decisions.md ✓
- Uses ✅ emoji consistently for status

**Verdict:** Best of the three. Information-dense, no filler. Model this.

---

## templates/day-007.txt

**Visual Hierarchy: PERFECT**
- Subject first (line 1)
- Greeting, body, close — classic email structure
- Unsubscribe tucked at bottom, not intrusive

**Whitespace: EXCELLENT**
- Single-line paragraphs breathe
- No crowding
- Footer separated with em-dash (line 15)

**Voice:**
- Line 5 "Seven days. Your site shipped seven days ago" — rhythm, confidence
- Line 9 "That's pride-worthy. Seriously." — human, not corporate
- Line 11 "If something feels off—a page loads weird" — conversational em-dash use

**What I'd change:**
- Line 19 unsubscribe URL shows `aftercare.shipyard.ai` — inconsistent with `homeport@shipyard.ai` brand decision (config-decisions.md line 14)
- Should be `homeport.shipyard.ai/unsub?token={email}`

**Craft:** Flawless. Every word earns its place.

---

## templates/day-030.txt

**Consistency:**
- Matches day-007 structure perfectly
- Footer format identical (line 17)
- Same unsubscribe URL issue (line 19) — should say `homeport.shipyard.ai`

**Voice:**
- Line 7 "Not obsessing—just checking in" — em-dash rhythm again, good
- Line 9 "real people are using it" — grounded, not abstract

**Verdict:** Clean. Fix domain inconsistency.

---

## templates/day-090.txt

**Consistency:**
- Matches template siblings
- Footer identical
- Same URL issue (line 23)

**Voice:**
- Line 5 "Most web agencies disappear around now. They've moved on" — confident contrast
- Line 11 "Ninety days reveals the problems" — authority without arrogance
- Line 14 "Real data from real usage teaches you what actually matters" — philosophy, not sales

**Verdict:** Strongest template. Keep as-is (fix domain only).

---

## Overall Assessment

**What works:**
- Email templates (day-*.txt) — **world-class craft**
- AUDIT_REPORT.md — **information-dense, no waste**
- config-decisions.md — **clear thinking documented**

**What doesn't:**
- resend-setup-guide.md — **too many words, too much explanation**
- Unsubscribe URL inconsistency — **brand confusion**

**To make quieter but more powerful:**

1. **resend-setup-guide.md** — cut 40%, remove redundant DNS provider examples (pick Cloudflare, cut GoDaddy/Route53)
2. **All templates** — change `aftercare.shipyard.ai` → `homeport.shipyard.ai` (lines 19 in day-007, 19 in day-030, 23 in day-090)
3. **resend-setup-guide.md lines 149-216** — show one DNS provider example, not three identical patterns
4. **resend-setup-guide.md lines 553-570** — delete DNS summary section (already covered exhaustively in Phase 3)
5. **config-decisions.md lines 115-131** — move risk mitigation detail to setup guide where it belongs

**Final verdict:**
Templates are perfect. Documentation is functional but verbose. Cut explanations, keep instructions. Trust the reader.

---

**"Simplicity is the ultimate sophistication."**
The email templates understand this. The guides do not.
