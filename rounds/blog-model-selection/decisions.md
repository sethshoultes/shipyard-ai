# Blog Model Selection — Consolidated Decisions
**The Zen Master's Synthesis**

This document captures the locked decisions from the Great Minds debate. Use this as the build blueprint.

---

## CORE ESSENCE

**What this is:** Teaching engineers to stop burning money on wrong-sized models.

**Success metric:** 50+ engineers implement model selection after reading (not 10K vanity views).

**The test:** Does one engineer change their architecture after reading?

---

## LOCKED DECISIONS

### 1. CONTENT STRUCTURE (Winner: Steve, Refined by Elon)

**Who proposed:** Steve defined the emotional arc, Elon forced discipline.

**Decision:** The post follows this exact structure:

1. **Hook** (First 30 seconds)
   - Opening line: "Haiku hallucinated 100+ API violations per plugin"
   - Pain point: One bad build = 4-6 fix cycles
   - Cost math with real numbers from pipeline.ts

2. **The Hero** (Center position)
   - Model selection table (phase → model → why)
   - This sits in the MIDDLE, not buried
   - Gets its own section header
   - Designed as a screenshot-worthy artifact

3. **Implementation** (Show, don't explain)
   - SDK parameter example: `model: 'sonnet'`
   - Copy-paste ready code snippets
   - No over-explaining the Claude Agent SDK

4. **Results** (Proof)
   - 75% token savings
   - Real data from source files
   - Zero invented numbers

5. **Ending** (Empowerment)
   - Reader feels competent, equipped, smarter
   - Not "Shipyard is great" but "I'm great now that I know this"

**Why this won:** Combines Steve's emotional impact with Elon's execution discipline. Fast to build, powerful to read.

---

### 2. VOICE & TONE (Winner: Steve)

**Who proposed:** Steve insisted on earned authority.

**Decision:**
- **Earned authority. Zero hedging.**
- Short sentences. Active voice only.
- "Use Sonnet for build phases" (not "we recommend considering")
- "Haiku fails at precision tasks" (not "may underperform")
- No explaining what LLMs are (respect audience intelligence)
- No journey framing, no false modesty
- Tables and code are first-class citizens

**Why this won:** Engineers respond to confident, battle-tested advice. Hedging kills trust.

---

### 3. THE OPENING (Winner: Steve)

**Who proposed:** Steve demanded the gut punch, Elon initially resisted, then conceded.

**Final decision:** "Haiku hallucinated 100+ violations per plugin"

**Why this beat alternatives:**
- "Cost us $X" is abstract money
- "100+ violations" is visceral, lived pain
- Creates immediate recognition: "oh fuck, I've done this"
- Wound before you heal

**Elon's concession (Round 2):** "I was wrong to treat the hook as secondary. Engineers are humans. The pain point has to connect emotionally before they care about the solution."

---

### 4. EXECUTION SPEED (Winner: Elon)

**Who proposed:** Elon's non-negotiable.

**Decision:** 5-minute agent session maximum.

**How this works:**
1. Agent reads 1 existing blog post (copy frontmatter format)
2. Agent reads pipeline.ts and agents.ts (extract real data)
3. Agent populates pre-designed template
4. Agent writes markdown file
5. Commit + push

**Why this won:** Forces clarity, prevents scope creep, proves system works. Steve conceded: "If the agent has exact paths, one example post, and clear structure, this doesn't need to be a 30-minute research expedition."

---

### 5. TEMPLATE VS CRAFT (Winner: Compromise)

**Elon's position:** 90% predetermined template, agent fills data.

**Steve's position:** Template produces "competent" but we need "great."

**Final compromise:**
- **Template the structure** (Elon wins on execution)
- **Craft the framing** (Steve wins on impact)
- Agent fills a well-designed template, not a generic one
- The table gets manual design attention
- Voice guidelines are pre-specified, not discovered

**Why this won:** Fast execution of a carefully designed artifact. Both speed AND impact.

---

### 6. TITLE/NAMING (Winner: Elon)

**Steve's proposal:** "The Right Tool" (product-style naming)

**Elon's counter:** This isn't a product launch, it's a blog post.

**Final decision:** SEO-optimized title format:
- "Multi-Agent Model Selection: 75% Cost Reduction"
- OR similar data-driven title

**Why Elon won:** Findability > aesthetics for blog posts. Steve was romanticizing a format that doesn't warrant it.

---

### 7. DATA INTEGRITY (Winner: Elon)

**Who proposed:** Elon's non-negotiable #2.

**Decision:** Real data only. Zero invention.
- Agent extracts actual numbers from pipeline.ts, agents.ts
- No "approximately," "around," "we estimate"
- If data doesn't exist in code, we don't claim it
- Cite real hallucination count, cost delta, token savings

**Why this won:** Trust is built on precision. Steve agreed this supports credibility.

---

### 8. SCOPE CUTS (Winner: Elon)

**What got CUT from V1:**
- ❌ Researching multiple blog posts to infer format patterns
- ❌ Custom analytics integration
- ❌ Newsletter cross-posting automation
- ❌ Social media auto-scheduling
- ❌ Optimizing blog discoverability features
- ❌ Explaining what LLMs are
- ❌ Journey framing ("we embarked on...")
- ❌ Any sentence that doesn't teach, persuade, or punch

**What SHIPS in V1:**
- ✅ One markdown file
- ✅ Standard frontmatter (title, date, author, description)
- ✅ Model selection table (designed)
- ✅ Code snippets from source
- ✅ Real performance data
- ✅ Commit to git

**Why these cuts won:** Steve conceded "V2 masquerading as V1 — brutal but accurate."

---

### 9. DISTRIBUTION REALITY (Winner: Elon)

**Steve's initial assumption:** Great content reaches 10K organically.

**Elon's reality check:** "Won't. A blog post doesn't distribute itself."

**Final decision:**
- **Target:** 500 high-quality readers who implement (not 10K vanity views)
- **Actual distribution channels:**
  - Post on X/Twitter with hallucination number in first line
  - Reddit r/LocalLLaMA
  - HackerNews (if math is compelling)
  - SEO: "multi-agent model selection" + "claude agent sdk cost optimization"
- **Accept:** Need HN front page, influencer shares, OR paid distribution for 10K
- **Better metric:** 50 engineers implement = high-value outcome

**Steve's concession (Round 2):** "Harsh but true. I was romanticizing organic reach."

---

### 10. THE TABLE DESIGN (Winner: Steve)

**Who proposed:** Steve's non-negotiable #2.

**Decision:** The model selection table is THE HERO.
- Sits in center of post (middle position, not buried)
- Gets its own section header
- Designed to be screenshot-worthy
- Shows: Phase → Model → Why
- First-class citizen, not appendix

**Elon's concession (Round 2):** "I undervalued this. The table should be designed, formatted, easy to read — not just markdown ASCII art. If we're shipping one thing with care, make it the table."

**Compromise:** Steve designs the table. Elon designs the system.

---

## MVP FEATURE SET (What Ships in V1)

### Content Requirements
1. **Markdown file** with standard frontmatter
2. **Hook section** with "100+ hallucinations" opening
3. **Model selection table** (designed, centered)
4. **Code snippets** showing SDK parameter usage
5. **Real data** extracted from pipeline.ts and agents.ts
6. **Results section** with 75% token savings claim
7. **Word count:** 1000-1500 words

### Technical Requirements
1. **Agent reads:**
   - 1 existing blog post (for format)
   - pipeline.ts (for cost data)
   - agents.ts (for model configuration)

2. **Agent writes:**
   - Single markdown file
   - Target location: Shipyard blog content directory (exact path TBD)

3. **Agent commits:**
   - Git commit with standard message
   - Push to repo

### Quality Gates
- [ ] 5-minute agent session maximum
- [ ] Zero invented data (all numbers from source)
- [ ] Opening is "Haiku hallucinated 100+ violations"
- [ ] Table is visually clear and centered
- [ ] Voice has no hedging (declarative statements only)
- [ ] Code examples are copy-paste ready
- [ ] No 101-level explanations

---

## FILE STRUCTURE (What Gets Built)

```
/home/agent/shipyard-ai/
├── [EXACT PATH TBD]/blog/
│   └── multi-agent-model-selection.md  ← THE DELIVERABLE
├── rounds/blog-model-selection/
│   ├── essence.md
│   ├── round-1-elon.md
│   ├── round-1-steve.md
│   ├── round-2-elon.md
│   ├── round-2-steve.md
│   └── decisions.md  ← THIS FILE
└── [source files to read]
    ├── pipeline.ts
    └── agents.ts
```

**BLOCKER:** PRD must specify exact blog directory path. Is it:
- `/home/agent/shipyard-ai/blog`?
- Separate repo?
- Gatsby/Next.js/Hugo directory?

Agent will waste time searching without this.

---

## OPEN QUESTIONS (What Still Needs Resolution)

### Critical Path Blockers
1. **Where is the blog directory?** (exact path required)
2. **Do existing blog posts exist to copy format from?** (need 1 example)
3. **Do pipeline.ts and agents.ts exist at expected paths?**
4. **Do they contain the claimed data?** (100+ hallucinations, 75% savings, cost deltas)

### Secondary Questions
5. **Who approves before merge?** (editorial review process)
6. **What is the exact frontmatter schema?** (can infer from example post)
7. **Should agent create branch → PR or commit to main?**
8. **What if source files don't have the numbers?** (abort or use placeholders?)

### Distribution Questions (Post-V1)
9. Who posts to X/Twitter?
10. Who submits to HackerNews?
11. Paid distribution budget?

---

## RISK REGISTER (What Could Go Wrong)

### High Probability, High Impact
**RISK 1: Source data doesn't exist**
- **Scenario:** pipeline.ts doesn't contain hallucination count or cost deltas
- **Impact:** Can't use real data, credibility destroyed
- **Mitigation:** Agent reads files FIRST, validates data exists, aborts if missing
- **Owner:** Elon's non-negotiable requires this

**RISK 2: Blog directory path unknown**
- **Scenario:** Agent spends 10+ minutes searching for blog location
- **Impact:** Blows 5-minute session target, wastes time
- **Mitigation:** PRD specifies exact path before agent runs
- **Owner:** Elon flagged this explicitly

### Medium Probability, High Impact
**RISK 3: Frontmatter format is non-standard**
- **Scenario:** Existing blog uses custom schema, agent can't infer
- **Impact:** Published post breaks blog build/rendering
- **Mitigation:** Agent reads 1 existing post first, copies exact format
- **Owner:** Elon recommended, Steve conceded

**RISK 4: Table formatting breaks in markdown**
- **Scenario:** Complex table doesn't render correctly
- **Impact:** The hero element (table) is unreadable
- **Mitigation:** Test table syntax before writing, use standard markdown tables
- **Owner:** Steve's non-negotiable depends on this

### Low Probability, Medium Impact
**RISK 5: No editorial review catches errors**
- **Scenario:** Post ships with typos, bad data, broken links
- **Impact:** Credibility damage
- **Mitigation:** Define review process (who approves?)
- **Owner:** Unassigned

**RISK 6: Distribution assumptions fail**
- **Scenario:** Post gets <100 views, no HN/Reddit traction
- **Impact:** Learning opportunity wasted
- **Mitigation:** Already addressed — expect 200-500 organic, plan distribution separately
- **Owner:** Elon set realistic expectations, Steve conceded

### Low Probability, Low Impact
**RISK 7: Agent session exceeds 5 minutes**
- **Scenario:** Template not clear enough, agent reasons too long
- **Impact:** Proves system doesn't work, but post still ships
- **Mitigation:** Refine template, add exact file paths, test run
- **Owner:** Elon's speed metric

**RISK 8: Voice guidelines produce "competent but not great"**
- **Scenario:** Template approach creates boring post
- **Impact:** Lower reader conversion
- **Mitigation:** Steve's voice rules are pre-specified in template
- **Owner:** Steve/Elon compromise addresses this

---

## IMPLEMENTATION TEMPLATE (For Agent Execution)

### Pre-Session Checklist
- [ ] Exact blog directory path specified
- [ ] 1 example blog post identified for format
- [ ] pipeline.ts and agents.ts paths confirmed
- [ ] Data validation: files contain hallucination count, cost data, token savings

### Agent Task Specification
```
GOAL: Write blog post about model selection in 5 minutes

INPUTS:
- Example post: [PATH]
- Data sources: pipeline.ts, agents.ts at [PATHS]
- Template: [STRUCTURE BELOW]

OUTPUT:
- File: [EXACT_BLOG_PATH]/multi-agent-model-selection.md
- Commit message: "Add multi-agent model selection blog post"

STRUCTURE:
1. Frontmatter (copy from example)
2. Hook: "Haiku hallucinated 100+ API violations per plugin"
3. Pain point: cost math with real numbers
4. Hero: Model selection table (Phase | Model | Why)
5. Implementation: code snippet with model: 'sonnet'
6. Results: 75% token savings from source
7. Ending: empowerment message

VOICE RULES:
- Declarative statements only (no hedging)
- Short sentences, active voice
- No LLM explanations
- Tables = first-class citizens
- Copy-paste ready code

DATA REQUIREMENTS:
- Extract actual numbers from source files
- No approximations or inventions
- Cite: hallucination count, cost delta, token savings
```

### Post-Session Validation
- [ ] File exists at correct path
- [ ] Frontmatter matches example format
- [ ] Opening line is "Haiku hallucinated 100+ violations"
- [ ] Table is present and centered
- [ ] All data points have source citations
- [ ] No hedging language detected
- [ ] Word count: 1000-1500
- [ ] Session time: <5 minutes

---

## FINAL SYNTHESIS

**Elon's wins:**
- 5-minute execution (forces discipline)
- Template-based approach (speed + consistency)
- Real data only (trust)
- Scope cuts (V2 features eliminated)
- Distribution reality check (500 vs 10K target)
- SEO title over product naming

**Steve's wins:**
- Opening must wound ("100+ violations")
- Table is the hero (center position, designed)
- Voice has authority (zero hedging)
- End state: reader feels competent
- Craft matters within the template
- No 101-level content

**The Compromise:**
Fast execution of a carefully designed artifact. Steve designs the table. Elon designs the system. Ship it today, iterate tomorrow.

**The Truth:**
Both were right. Elon prevented scope creep and execution bloat. Steve prevented mediocre content that doesn't convert. The synthesis is stronger than either position alone.

---

**Build Phase Directive:** Use this document as the single source of truth. Every decision above is locked. Anything not specified here is out of scope for V1. Ship the markdown, watch what happens, iterate on V2.

— Phil Jackson, Zen Master
