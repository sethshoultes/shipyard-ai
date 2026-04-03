# Shipyard AI — Operating Procedures Runbook

**Author:** Phil Jackson, Orchestrator  
**Date:** 2026-04-03  
**Version:** v1.0  
**Audience:** All agents, new operators, emergency playbooks

---

## Quick Reference: New PRD? Follow These 7 Steps

```
1. INTAKE      → PRD arrives, token budget assigned, project created
2. DEBATE      → Directors align on strategy (2 rounds max)
3. PLAN        → Sub-agents hired, assignments defined
4. BUILD       → Agents work in parallel on isolated tasks
5. REVIEW      → Margaret runs QA, directors review quality
6. DEPLOY      → Push to Cloudflare staging, verify, go live
7. HANDOFF     → Deliver, write case study, save learnings
```

**Time estimate:** 1-3 days per site (depends on complexity)  
**Token cost:** 500K–3M per project (varies by type)  
**Human oversight:** Phil (intake), Directors (debate/plan/review), Margaret (QA)  
**Sub-agent time:** Mostly parallel (can overlap debate with plan, build with review)

---

## Stage 1: INTAKE

### What Happens
A PRD arrives and Shipyard AI claims the project. Phil assigns a token budget, creates the workspace, and dispatches to the directors for debate.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Phil** | Parse PRD, calculate token budget, create workspace | `projects/{slug}/` |
| **Directors** | Read PRD, prepare for debate | Positions ready |

### How It Works

#### 1.1 PRD Receives

**Source:** PRD file in `prds/` directory or intake form.

**Example PRD path:** `prds/marias-kitchen.md`

**PRD must include:**
- Product type: site, theme, or plugin
- Page count (if site) or scope
- Target audience
- Brand assets (logo, color palette, fonts)
- Must-have features
- Nice-to-haves (explicitly marked)
- Timeline/urgency

**Quality gate:** If PRD is vague or incomplete, Phil requests clarification before proceeding.

#### 1.2 Token Budget Calculation

Phil uses the **token budget calculator** (in TOKEN-CREDITS.md) to determine the budget.

**Budget tiers:**
- Simple site (5 pages): 500K base
- Standard site (10 pages): 1M base
- Complex site (20+ pages): 2M base
- Theme: 750K base
- Plugin: 300K–750K base

**Complexity multipliers apply** (e.g., e-commerce = 1.3x, blog = 1.2x).

**Formula:**
```
final_budget = base_tokens × (multiplier_1 × multiplier_2 × ...)
```

**Example:**
```
PRD: 10-page bakery site with online ordering and blog
Base: 1,000,000 (standard site)
E-commerce: × 1.3
Blog: × 1.2
Final: 1,000,000 × 1.3 × 1.2 = 1,560,000 tokens
```

#### 1.3 Create Project Workspace

Phil creates the directory structure:

```bash
projects/{project-slug}/
  ├── STATUS.json          # Project status and token tracking
  ├── debate/
  │   └── decisions.md     # (created in Stage 2)
  ├── plan/
  │   ├── build-plan.md    # (created in Stage 3)
  │   └── team/            # (agent definitions)
  ├── build/
  │   ├── artifacts/       # (created during Stage 4)
  │   └── token-log.jsonl  # (token usage tracking)
  ├── review/
  │   └── qa-report.md     # (created in Stage 5)
  └── deploy/
      └── deploy-log.md    # (created in Stage 6)
```

#### 1.4 Initialize STATUS.json

```json
{
  "project": "marias-kitchen",
  "type": "site",
  "slug": "marias-kitchen",
  "pages": 5,
  "tokenBudget": 500000,
  "allocation": {
    "strategy": { "budget": 50000, "burned": 0 },
    "build": { "budget": 300000, "burned": 0 },
    "review": { "budget": 75000, "burned": 0 },
    "deploy": { "budget": 25000, "burned": 0 },
    "reserve": { "budget": 50000, "burned": 0 }
  },
  "agents": {},
  "stage": "intake",
  "warnings": [],
  "createdAt": "2026-04-03T12:00:00Z",
  "updatedAt": "2026-04-03T12:00:00Z"
}
```

#### 1.5 Dispatch to Debate

Phil updates STATUS.json: `"stage": "debate"` and notifies directors.

Directors read the PRD and prepare positions for Round 1.

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: PRD** | Client | Markdown file in `prds/` |
| **Input: Token budget** | Phil | Calculated, stored in STATUS.json |
| **Output: Project workspace** | Phil | Directory tree with STATUS.json |
| **Handoff: Ready for debate** | Phil | STATUS.json with `"stage": "debate"` |

### What Can Go Wrong

| Problem | Resolution |
|---------|-----------|
| PRD is incomplete (missing pages, features unclear) | Phil contacts client for clarification. Retry intake with updated PRD. |
| Token budget is wildly off (client disagrees) | Phil recalculates with client input. If still disputed, escalate to Elon. |
| Project slug conflicts (same name exists) | Phil appends timestamp or version suffix (e.g., `marias-kitchen-v2`). |

### Success Criteria

✓ Project workspace created in `projects/{slug}/`  
✓ STATUS.json initialized with token budget  
✓ Directors have read the PRD  
✓ STATUS.json updated to `"stage": "debate"`

---

## Stage 2: DEBATE

### What Happens
The two directors (Elon and Steve) read the PRD and stake positions on strategy. They debate for up to 2 rounds, then lock a decisions document.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Elon** | Tech approach, build parallelism, deployment strategy | Position doc |
| **Steve** | Design direction, content strategy, brand approach | Position doc |
| **Both** | Resolve disagreements, lock decisions | `decisions.md` |

### How It Works

#### 2.1 Round 1: Initial Positions

**Duration:** 1–2 hours

**Each director reads the PRD and writes a position document addressing:**

**Elon's position covers:**
- Tech stack (Astro, Cloudflare Workers, Portable Text schema)
- Which Emdash features to leverage (plugins, theming, content APIs)
- Data model (content types, structure)
- Build parallelism (which tasks can run simultaneously)
- Deployment approach (staging → production)

**Steve's position covers:**
- Design direction (custom vs. template-based)
- Visual identity (color palette, typography, imagery)
- Content strategy (AI-generated, client-provided, hybrid)
- UX approach (interaction patterns, mobile-first considerations)

**Location:** `projects/{slug}/debate/round-1-elon.md` and `projects/{slug}/debate/round-1-steve.md`

**Token cost:** ~2.5K tokens per position (total ~5K for both)

#### 2.2 Round 2: Resolution

**Duration:** 1 hour

Directors read each other's positions and write a **resolution document** that:
- Acknowledges areas of agreement
- Resolves disagreements with clear decisions (not compromises)
- If no agreement: Elon breaks the tie (engineering owns deploy risk)

**Location:** `projects/{slug}/debate/round-2-resolution.md`

**Token cost:** ~2.5K tokens

#### 2.3 Lock Decisions

The resolution document becomes the **decisions.md** — it's locked and frozen.

**decisions.md contains:**
1. Tech approach (which Emdash features, data model, deployment plan)
2. Design direction (brand spec, component library, content voice)
3. Build plan outline (which agents needed, rough parallelism)
4. Open questions (if any — these must be resolved before PLAN proceeds)

**Location:** `projects/{slug}/debate/decisions.md`

**No more changes allowed.** If the client changes their mind after debate, that's a revision (separate tokens).

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: PRD** | From Stage 1 | Markdown |
| **Input: Token budget** | From Stage 1 | In STATUS.json |
| **Output: Positions (Round 1)** | Elon + Steve | Markdown docs |
| **Output: Resolution (Round 2)** | Elon + Steve | Markdown |
| **Output: Locked decisions** | Both directors | `decisions.md` |

### Token Budget Allocation

**Total debate budget: 5% of project tokens (max 50K for a 1M-token project)**

- Director 1 (Elon): ~2.5K per round
- Director 2 (Steve): ~2.5K per round
- Round 1 + Round 2 = ~10K total

**Actual burn tracked in `projects/{slug}/build/token-log.jsonl`**

### What Can Go Wrong

| Problem | Resolution |
|---------|-----------|
| Directors disagree fundamentally on approach | Elon breaks the tie. Decision is final. (This is why Elon is the tie-breaker — deploy risk is his domain.) |
| Debate takes more than 2 rounds | After round 2, decisions lock. Open questions get noted. Client decides: accept or reopen PRD (new intake, new tokens). |
| Directors need client input to decide | Phil gathers client feedback between rounds. Retry that round. |
| Decisions are too vague (e.g., "modern design" without specifics) | Directors refine. Decisions must be operational (another agent can read them and know what to build). |

### Success Criteria

✓ Round 1 positions written (Elon + Steve)  
✓ Round 2 resolution written  
✓ `decisions.md` locked (no further changes)  
✓ STATUS.json updated to `"stage": "plan"`  
✓ Token burn logged in `token-log.jsonl`  
✓ All open questions documented

---

## Stage 3: PLAN

### What Happens
Directors define the sub-agent team, assign roles and token budgets, create the build plan, and identify dependencies.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Elon** | Hire developer, SEO specialist, deploy engineer | Agent definitions |
| **Steve** | Hire designer, copywriter, brand specialist | Agent definitions |
| **Both** | Define parallelism, dependencies, build plan | `build-plan.md` |

### How It Works

#### 3.1 Sub-Agent Hiring

Directors use the **decisions.md** to determine which agents to hire and what each should do.

**Standard team structure:**

| Role | Owned By | Model | Budget | Examples of Tasks |
|------|----------|-------|--------|-------------------|
| **Designer** | Steve | Haiku | 25% of build budget | Homepage layout, component designs, visual system |
| **Developer** | Elon | Haiku | 35% of build budget | Data model, Astro components, Portable Text generation |
| **Copywriter** | Steve | Haiku | 25% of build budget | Page copy, meta descriptions, image alt text |
| **SEO Specialist** | Elon | Haiku | 15% of build budget | Keyword research, content structure, metadata |

**Variations:** For complex projects, hire additional agents (e.g., e-commerce specialist, animation engineer).

#### 3.2 Write Agent Definitions

Each hired agent gets a definition in `team/{project-slug}/`:

**Example: `team/marias-kitchen/designer.md`**

```markdown
# Designer — Maria's Kitchen

## Owned by
Steve Jobs

## Token allocation
80,000 tokens (25% of build budget: 300K × 0.25)

## Goal
Create a cohesive visual identity for Maria's Kitchen bakery website. Design system with reusable components.

## Inputs
- PRD: prds/marias-kitchen.md
- Decisions: projects/marias-kitchen/debate/decisions.md
- Brand assets: Client logo, color preferences

## Outputs
- Design system (tokens.css, Tailwind config)
- Component sketches/specs (hero, card, form, footer)
- Homepage mockup
- Style guide (typography, spacing, colors)

## Quality Bar
- All designs consistent with decided brand approach
- Mobile-first responsive (320px, 768px, 1280px)
- Accessibility: WCAG 2.1 AA color contrast minimum
- Performance: No oversized design assets

## Dependencies
- None (can start immediately)

## Blockers
None expected. Flag if client brand assets are low-quality or conflicting.
```

#### 3.3 Build Plan

Directors write a high-level build plan documenting:
- **Parallelism:** Which tasks can run simultaneously
- **Dependencies:** What must complete before other tasks start
- **Phase breakdown:** Week 1, Week 2, etc. (rough estimates)
- **Revision strategy:** How to handle changes during build

**Location:** `projects/{slug}/plan/build-plan.md`

**Example flow:**
```
Phase 1 (Parallel):
  - Designer creates design system (no blockers)
  - Developer sets up data model (no blockers)
  - Copywriter drafts page copy (no blockers)

Phase 2 (Blocks on Phase 1):
  - Developer builds Astro components (waits for designer outputs)
  - Copywriter finalizes copy (waits for developer content types)

Phase 3 (Blocks on Phase 2):
  - Designer reviews component HTML (ensures accessibility, responsive)
  - Developer integrates all content (final assembly)

Phase 4 (Final):
  - SEO specialist optimizes metadata
  - All agents complete final QA
```

#### 3.4 Token Allocation

Phil updates STATUS.json with agent definitions:

```json
{
  "agents": {
    "designer": { "budget": 80000, "burned": 0 },
    "developer": { "budget": 120000, "burned": 0 },
    "copywriter": { "budget": 60000, "burned": 0 },
    "seo": { "budget": 40000, "burned": 0 }
  }
}
```

**Hard rule:** Sum of agent budgets ≤ 60% of project budget.

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: Decisions doc** | From Stage 2 | `decisions.md` |
| **Input: PRD** | From Stage 1 | Markdown |
| **Output: Agent definitions** | Elon + Steve | Markdown files in `team/{slug}/` |
| **Output: Build plan** | Both directors | `build-plan.md` |
| **Output: Token allocation** | Phil | Updated `STATUS.json` |

### Token Budget Allocation

**Total plan budget: 5% of project tokens (max 50K)**

- Director strategy/hiring: ~2.5K
- Build plan writing: ~2.5K

**Total debate + plan: 10% of project budget** (hard cap)

### What Can Go Wrong

| Problem | Resolution |
|---------|-----------|
| Agent allocations exceed build budget | Phil redistributes. Cut lowest-priority agent or reduce their scope. |
| Circular dependency (A waits for B, B waits for A) | Directors revise plan to break cycle. One task becomes sequential. |
| Not enough agents hired (too few for scope) | Elon hires more agents. Reduces per-agent token budget proportionally. |
| Build plan is unrealistic | Directors revise. Get feedback from hired agents on feasibility. |

### Success Criteria

✓ All agent definitions written (role, inputs, outputs, token budget, QA bar)  
✓ Build plan finalized (phases, dependencies, parallelism)  
✓ STATUS.json updated with agent allocations  
✓ No circular dependencies  
✓ Sum of agent budgets ≤ 60% of project budget  
✓ STATUS.json updated to `"stage": "build"`

---

## Stage 4: BUILD

### What Happens
Sub-agents work in parallel on assigned tasks. Elon and Steve monitor, unblock, and track token usage.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Sub-agents** | Execute assignments (haiku model) | Design/code/copy artifacts |
| **Elon** | Monitor tech delivery, track token burn | Blockers resolved |
| **Steve** | Monitor design quality, track token burn | Blockers resolved |
| **Phil** | Log token usage, watch for overruns | `token-log.jsonl` |

### How It Works

#### 4.1 Agent Kickoff

Each agent:
1. Reads the PRD
2. Reads the decisions.md
3. Reads their agent definition
4. Starts work

**Working directory:** `projects/{slug}/build/`

**All outputs stored per-agent:**
```
projects/{slug}/build/
  ├── designer/
  │   ├── design-system.css
  │   ├── components.md
  │   └── homepage-mockup.png
  ├── developer/
  │   ├── data-model.ts
  │   ├── components/
  │   └── seed-data.json
  ├── copywriter/
  │   ├── pages.md
  │   └── metadata.json
  └── token-log.jsonl
```

#### 4.2 Parallel Execution

Agents work simultaneously. Directors monitor:
- **Quality:** Does output match decisions.md?
- **Token burn:** Is any agent burning too fast?
- **Blockers:** Are any agents stuck waiting for inputs?

**Daily check-in (if multi-day project):**
- Phil reviews token-log.jsonl
- Directors confirm no blockers
- Update STATUS.json with progress

#### 4.3 Token Logging

**Every AI task logs tokens to `projects/{slug}/build/token-log.jsonl`:**

```jsonl
{"ts":"2026-04-03T12:05:00Z","agent":"designer","model":"haiku","task":"design-system","input_tokens":1200,"output_tokens":800,"total":2000,"cumulative":2000}
{"ts":"2026-04-03T12:05:30Z","agent":"designer","model":"haiku","task":"hero-component","input_tokens":1500,"output_tokens":1200,"total":2700,"cumulative":4700}
{"ts":"2026-04-03T12:10:00Z","agent":"developer","model":"haiku","task":"data-model","input_tokens":2000,"output_tokens":1500,"total":3500,"cumulative":3500}
```

**Alerts trigger:**
- Agent at 50% allocation: Info log
- Agent at 80% allocation: Warning to director
- Agent at 100% allocation: **Hard stop** — ship what exists

#### 4.4 Blocking Issues

If an agent encounters a blocker:
1. Agent **flags it in STATUS.json** — never silently fails
2. Directors decide: unblock or reroute work
3. While blocked, agent works on unblocked tasks (if any)

**Example blocker:**
```
"blockers": [
  {
    "agent": "developer",
    "task": "seed-data",
    "reason": "Waiting for copywriter final page list",
    "since": "2026-04-03T12:30:00Z",
    "impact": "Cannot finalize Portable Text structure"
  }
]
```

#### 4.5 Revision During Build

**If director spots an issue during build:**
1. Director decides: critical (breaks design) or cosmetic (can defer)?
2. If critical: route back to responsible agent (consumes BUILD tokens)
3. If cosmetic: log for REVIEW phase (uses REVIEW tokens)

**Example:**
```
Director review: "Designer's hero image is too dark for text readability"
Action: Critical — director asks designer to adjust contrast
Cost: ~500 tokens from designer's allocation
```

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: Agent definitions** | From Stage 3 | Markdown |
| **Input: Decisions doc** | From Stage 2 | Markdown |
| **Output: Design artifacts** | Designer | CSS, Tailwind config, mockups |
| **Output: Code artifacts** | Developer | TypeScript, Astro components, data model |
| **Output: Copy artifacts** | Copywriter | Markdown pages, metadata |
| **Output: SEO artifacts** | SEO specialist | Keyword mapping, metadata suggestions |
| **Output: Token log** | All agents | JSONL file |

### Token Budget Allocation

**Build budget: 60% of project tokens**

Example (1M-token project):
```
Build total: 600K tokens
  Designer: 150K
  Developer: 210K
  Copywriter: 150K
  SEO: 90K
```

**Directors can reallocate if an agent hits 80% allocation** (with director approval).

### What Can Go Wrong

| Problem | Resolution |
|---------|-----------|
| Agent burns tokens faster than expected | Director reviews quality (is it gold-plating?) and either approves reallocation or asks agent to cut scope. |
| Agent is blocked waiting for another agent | Directors either: (a) unblock the dependency, or (b) have blocked agent work on unblocked tasks. |
| Agent produces low-quality output | Director asks for revision (costs tokens from that agent's allocation). If out of tokens, escalate to Elon/Steve. |
| Agent exhausts token allocation | Hard stop. Ship what they have. Directors decide: reallocate from reserve, or proceed to review with gaps. |
| Client requests changes during build | Phil documents in TASKS.md as revision request. Cost evaluated. If accepted, charges revision tokens (separate purchase). BUILD pauses until decision. |

### Success Criteria

✓ All agents complete assigned tasks  
✓ Output artifacts present in `projects/{slug}/build/`  
✓ Token usage logged in `token-log.jsonl`  
✓ No agent in "blocked" state (all blockers resolved or waived)  
✓ STATUS.json updated with token burn  
✓ Directors confirm quality matches decisions.md  
✓ STATUS.json updated to `"stage": "review"`

---

## Stage 5: REVIEW

### What Happens
Margaret (QA) runs automated checks. Directors review design and engineering quality. Issues route back to BUILD or get logged for post-launch.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Margaret** | Run automated QA (build, a11y, performance, security) | QA report |
| **Steve** | Review design quality, content voice | Design sign-off |
| **Elon** | Review engineering, PRD compliance, deploy readiness | Engineering sign-off |
| **Both** | Decide: SHIP, REVISE, or BLOCK | Final verdict |

### How It Works

#### 5.1 Automated QA (Margaret)

Margaret runs the QA checklist (in `pipeline/qa/checklist.md`):

**Build & Integration:**
- [ ] Site directory exists (Astro project structure)
- [ ] Dependencies installed
- [ ] `astro build` succeeds → `dist/` created
- [ ] TypeScript check passes (`astro check`)
- [ ] No fatal console errors

**Functionality:**
- [ ] Homepage returns 200
- [ ] All critical pages return 200
- [ ] Dynamic content pages render
- [ ] All links valid (no 404s)
- [ ] Images have alt text

**Accessibility (WCAG 2.1 AA):**
- [ ] Color contrast 4.5:1 (normal text) / 3:1 (large text)
- [ ] Touch targets >= 44px
- [ ] Keyboard navigation works (Tab through all interactive elements)
- [ ] Form labels present and associated
- [ ] Heading hierarchy correct (no skipped levels)
- [ ] Page landmarks present (header, nav, main, footer)

**Mobile & Responsive:**
- [ ] Viewport meta tag present
- [ ] Layout responsive at 320px (mobile)
- [ ] Layout responsive at 768px (tablet)
- [ ] Layout responsive at 1280px (desktop)
- [ ] Images scale without distortion

**SEO:**
- [ ] Every page has unique `<title>`
- [ ] Every page has meta description
- [ ] Homepage has OG tags (og:title, og:description, og:image, og:url)
- [ ] Blog/product pages have canonical URL
- [ ] robots.txt present
- [ ] sitemap.xml present (if 10+ pages)

**Performance (Lighthouse):**
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Lighthouse Performance score >= 90
- [ ] Lighthouse Accessibility score >= 90
- [ ] Lighthouse Best Practices score >= 90
- [ ] Lighthouse SEO score >= 90

**Security:**
- [ ] No exposed secrets (API keys, tokens, passwords)
- [ ] CSP header present
- [ ] HTTPS enforced
- [ ] No mixed content
- [ ] Security headers present (X-Frame-Options, X-Content-Type-Options)
- [ ] No vulnerable dependencies (`npm audit` clean)

**Output:** `projects/{slug}/review/qa-report.md`

```markdown
# QA Report — Maria's Kitchen

**Date:** 2026-04-03  
**Inspector:** Margaret Hamilton  
**Result:** PASS with 2 minor notes

## Automated Checks

### Build & Integration
- [x] Site directory: ✓ Astro 6 project
- [x] Dependencies: ✓ Installed
- [x] astro build: ✓ Succeeds
- [x] TypeScript: ✓ 0 errors
- [x] Console: ✓ No fatal errors

### Functionality
- [x] Homepage: 200 OK
- [x] /about: 200 OK
- [x] /menu: 200 OK
- [x] /contact: 200 OK
- [x] All links: ✓ Valid
- [x] Images: ✓ Alt text present

### Accessibility
- [x] Color contrast: 4.5:1+ ✓
- [x] Touch targets: 44px+ ✓
- [x] Keyboard nav: ✓ Full
- [x] Form labels: ✓ All present
- [x] Heading hierarchy: ✓ Correct
- [x] Page landmarks: ✓ All present

### Mobile & Responsive
- [x] 320px: ✓ No horizontal scroll
- [x] 768px: ✓ Tablet layout works
- [x] 1280px: ✓ Desktop layout works
- [x] Images: ✓ Maintain aspect ratio

### SEO
- [x] Page titles: ✓ Unique
- [x] Meta descriptions: ✓ Present
- [x] OG tags: ✓ Homepage only (correct)
- [x] Canonical URLs: ✓ Product pages
- [x] robots.txt: ✓ Present
- [x] sitemap.xml: ✓ Valid

### Performance (Lighthouse)
- [x] LCP: 1.8s ✓ (< 2.5s)
- [x] CLS: 0.05 ✓ (< 0.1)
- [x] INP: 120ms ✓ (< 200ms)
- [x] Performance: 94/100 ✓
- [x] Accessibility: 95/100 ✓
- [x] Best Practices: 92/100 ✓
- [x] SEO: 96/100 ✓

### Security
- [x] No exposed secrets: ✓
- [x] CSP header: ✓ Restrictive
- [x] HTTPS: ✓ Enforced
- [x] Mixed content: ✓ None
- [x] Security headers: ✓ All present
- [x] Dependencies: ✓ npm audit clean

## Manual Review Notes

**Steve (Design):**
- Typography is clean and on-brand ✓
- Color palette matches bakery aesthetic ✓
- Layout is professional and organized ✓
- Minor: Product card images could be 2-3px taller (optional, low priority)

**Elon (Engineering):**
- Code quality is solid, no hacks ✓
- PRD compliance: all requirements met ✓
- Deploy readiness: ✓ Ready for staging
- Minor: SEO specialist could add schema.org markup for recipes (optional, post-launch)

## Verdict

**PASS** — Ready for deployment to staging.

**Known issues for post-launch (low-priority):**
1. Product card image height (cosmetic)
2. Recipe schema.org markup (SEO enhancement)

**Deploy to:** Cloudflare Pages (staging)  
**Next:** Run deploy.sh, verify staging URL, promote to production
```

#### 5.2 Director Review

**Steve (Design) reviews:**
- Visual quality matches brand spec
- Typography consistent and readable
- Color palette faithful to decisions
- Layout clean and professional
- Tone and voice consistent in copy
- Images professional quality

**Elon (Engineering) reviews:**
- Code quality (no hacks, patterns consistent)
- PRD compliance (all requirements met)
- No technical debt or shortcuts
- Deploy readiness (can push to Cloudflare without issues)
- Token efficiency (agent worked within budget, no waste)

#### 5.3 Revision Decision

**Three possible verdicts:**

1. **PASS** — All checks pass, directors approve. Proceed to DEPLOY.

2. **PASS WITH NOTES** — Checks pass, but minor improvements noted for post-launch. Proceed to DEPLOY.

3. **REVISE** — Specific issues found. Route back to BUILD (costs revision tokens from reserve).

**Revision process:**
- Margaret documents specific failures
- Directors assign to responsible agent
- Agent revises (burns tokens from reserve)
- Margaret re-runs QA on revised work
- Max 2 revision rounds before shipping as-is with gaps documented

**Example revision request:**
```
Issue: Lighthouse Performance score is 87/100. Need >= 90.
Assigned to: Developer
Cause: Hero image not optimized for mobile
Fix: Generate WebP variant, add responsive srcset, lazy-load below-fold images
Estimated tokens: 2,000 (from 50K reserve)
Timeline: 30 minutes
```

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: Build artifacts** | From Stage 4 | Code, design, copy in `build/` |
| **Output: QA report** | Margaret | `qa-report.md` with detailed results |
| **Output: Design sign-off** | Steve | Inline notes in QA report |
| **Output: Engineering sign-off** | Elon | Inline notes in QA report |
| **Output: Verdict** | Both directors | PASS / REVISE / BLOCK |

### Token Budget Allocation

**Review budget: 15% of project tokens**

Example (500K-token project):
```
Review total: 75K tokens
  Automated QA: ~10K
  Director design review: ~20K
  Director engineering review: ~20K
  Revisions (if needed): From reserve
```

### What Can Go Wrong

| Problem | Resolution |
|---------|-----------|
| QA fails on something outside project scope | Margaret flags it, directors decide if it's a deal-breaker. Usually: log for post-launch, proceed with PASS WITH NOTES. |
| Multiple revision rounds needed | Max 2 rounds. On 3rd failure: ship as-is, document gaps, offer post-launch revision (new tokens). |
| Performance scores borderline (88/100) | Directors decide: revise for 90+, or ship with known limitation. Usually accept 88+. |
| Director disagrees on quality | Elon/Steve discuss. If unresolved, Elon breaks tie. Decision is final. |
| Discovered blocker (e.g., data model wrong) | Route back to developer for critical fix. If out of tokens, ship with workaround, offer revision. |

### Success Criteria

✓ QA report generated (`qa-report.md`)  
✓ All automated checks pass (or approved as "pass with notes")  
✓ Directors sign off (Steve on design, Elon on engineering)  
✓ Verdict documented: PASS, PASS WITH NOTES, or REVISE  
✓ If revisions needed: assigned, completed, QA re-run  
✓ STATUS.json updated to `"stage": "deploy"`  
✓ No critical blockers remaining

---

## Stage 6: DEPLOY

### What Happens
Site pushed to Cloudflare Pages staging, verified, then promoted to production. Live.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Elon** | Run deploy script, verify staging, promote to production | Live site |
| **Margaret** | Smoke test staging URL (pages render, no errors) | Deployment confirmation |
| **Phil** | Log deployment, tag release, update STATUS.json | Release notes |

### How It Works

#### 6.1 Pre-Deploy Checklist

Before deploying:
- [ ] QA report verdict = PASS (or PASS WITH NOTES)
- [ ] All build artifacts committed to git
- [ ] Project directory is a valid Astro site
- [ ] `npm install` runs cleanly
- [ ] `npm run build` succeeds locally
- [ ] `.env` variables set (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

#### 6.2 Deploy to Staging

Elon runs the deploy script:

```bash
cd /home/agent/shipyard-ai
./pipeline/deploy/deploy.sh projects/{slug}/build/{astro-site} {project-slug}
```

**Script does:**
1. Validate site directory (Astro structure)
2. Check Node version >= 22
3. Install dependencies if needed
4. Run `astro build` → creates `dist/`
5. Create Cloudflare Pages project (if needed)
6. Deploy to Cloudflare Pages: `{project-slug}.pages.dev`
7. Output live staging URL

**Example output:**
```
✓ {project-slug} deployed: https://{project-slug}.pages.dev
```

#### 6.3 Smoke Test Staging

Margaret verifies the staging site:

**Smoke tests (quick, not full QA):**
- [ ] Homepage loads (no 500 errors)
- [ ] Key pages load (about, contact, etc.)
- [ ] Images render
- [ ] No console errors
- [ ] Mobile viewport works (320px test)

**Log results in `projects/{slug}/deploy/staging-test.md`:**

```markdown
# Staging Smoke Test

**URL:** https://{project-slug}.pages.dev  
**Date:** 2026-04-03  
**Tester:** Margaret Hamilton

- [x] Homepage: Loads in 2.1s, no errors
- [x] /about: Loads, content renders
- [x] /menu: Loads, product grid displays
- [x] /contact: Form renders
- [x] Mobile test (320px): No horizontal scroll
- [x] Console: Clean (no errors)

**Result:** PASS — Ready for production
```

#### 6.4 Promote to Production

After staging passes, Elon promotes to production:

```bash
# Cloudflare Pages automatically makes the deployment live on the project URL
# Custom domain setup (if specified in PRD) is done via Cloudflare dashboard
```

**If custom domain specified in PRD:**
```
Domain: marias-kitchen.com
CNAME: {project-slug}.pages.dev
Status: Configured in Cloudflare DNS
```

#### 6.5 Release & Tag

Phil creates a git tag for the release:

```bash
git tag v1.0.0-{project-slug}
git push origin v1.0.0-{project-slug}
```

**Tag naming convention:**
- `v1.0.0-{project-slug}` — initial deploy
- `v1.0.1-{project-slug}` — revision/patch
- `v2.0.0-{project-slug}` — major redesign

#### 6.6 Generate Deploy Log

Phil creates `projects/{slug}/deploy/deploy-log.md`:

```markdown
# Deploy Log — Maria's Kitchen

**Project:** marias-kitchen  
**Type:** Site  
**Pages:** 5  
**Deployed by:** Elon Musk  
**Date:** 2026-04-03 at 14:30 UTC

## Deployment Details

| Item | Value |
|------|-------|
| Staging URL | https://marias-kitchen.pages.dev |
| Production URL | https://marias-kitchen.com |
| Custom Domain | Yes, configured via Cloudflare |
| Build time | 45 seconds |
| Deploy time | 12 seconds |
| Total time | ~2 minutes |
| Status | LIVE |

## Pre-Deploy Verification

- [x] QA report: PASS
- [x] Build succeeds locally
- [x] Dependencies clean
- [x] Secrets not exposed
- [x] Staging smoke test: PASS

## Staging Smoke Test

- [x] Homepage: 200 OK, 2.1s load
- [x] /about: 200 OK
- [x] /menu: 200 OK
- [x] /contact: 200 OK, form functional
- [x] Mobile (320px): Responsive, no scroll
- [x] Console: Clean

## Production Verification

- [x] Production URL live
- [x] Custom domain resolves
- [x] Homepage renders
- [x] Critical pages load
- [x] SSL certificate active
- [x] No 500 errors

## Lighthouse Scores (Production)

- Performance: 94/100
- Accessibility: 95/100
- Best Practices: 92/100
- SEO: 96/100

## Release Info

- Tag: `v1.0.0-marias-kitchen`
- Commit: abc123def456
- Branch: main
- Live as of: 2026-04-03 14:32 UTC

## Next Steps

- Client notified of live URL
- Domain pointed to production
- Analytics configured
- Post-launch monitoring enabled

**Deployed by:** Elon Musk  
**Reviewed by:** Margaret Hamilton  
**Signed off:** Phil Jackson
```

#### 6.7 Update STATUS.json

Phil updates the status:

```json
{
  "project": "marias-kitchen",
  "stage": "done",
  "liveUrl": "https://marias-kitchen.com",
  "stagingUrl": "https://marias-kitchen.pages.dev",
  "releaseTag": "v1.0.0-marias-kitchen",
  "deployedAt": "2026-04-03T14:32:00Z",
  "totalTokensBurned": 487000,
  "tokenBudget": 500000,
  "tokensRemaining": 13000,
  "estimatedCost": 2.95
}
```

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: Build artifacts** | From Stage 4 | Astro project in `build/` |
| **Input: QA report** | From Stage 5 | Markdown |
| **Output: Staging URL** | Elon (deploy script) | https://{project-slug}.pages.dev |
| **Output: Production URL** | Elon (Cloudflare) | https://{domain} or pages.dev |
| **Output: Deploy log** | Phil | `deploy-log.md` |
| **Output: Release tag** | Phil | Git tag `v1.0.0-{project-slug}` |

### Token Budget Allocation

**Deploy budget: 5% of project tokens**

Example (500K-token project):
```
Deploy total: 25K tokens
  Staging setup: ~5K
  Testing: ~5K
  Production promotion: ~5K
  Monitoring setup: ~10K
```

### What Can Go Wrong

| Problem | Resolution |
|---------|-----------|
| Build fails during deploy.sh | Check Node version, dependencies, build errors. Fix locally, retry deploy. |
| Staging site has 500 errors | Check Cloudflare logs. Usually: missing env vars, build issue. Fix and redeploy. |
| Custom domain not resolving | Check DNS CNAME configuration in Cloudflare dashboard. Wait for DNS propagation (5-30 min). |
| Production smoke test fails | Rollback: point domain back to previous version. Debug. Redeploy. |
| Performance degrades in production | Check Cloudflare cache settings, image optimization. Likely client images too large. Minor issue, can optimize post-launch. |

### Success Criteria

✓ Staging URL live and working  
✓ Margaret smoke test passes  
✓ Production URL live and working  
✓ Custom domain configured (if applicable)  
✓ Release tag created and pushed  
✓ Deploy log generated  
✓ STATUS.json updated to `"stage": "done"`  
✓ Client notified of live URL  
✓ Analytics/monitoring configured

---

## Stage 7: HANDOFF

### What Happens
Final deliverable packaged, case study written, learnings saved to memory for future projects.

### Who Does What

| Role | Task | Output |
|------|------|--------|
| **Phil** | Prepare final deliverable, collect artifacts | Deliverable package |
| **Elon** | Write technical case study (architecture, decisions, lessons) | Case study doc |
| **Steve** | Write design case study (process, iterations, constraints) | Case study doc |
| **Margaret** | Document QA findings, automation improvements | QA lessons |

### How It Works

#### 7.1 Final Deliverable Package

Phil assembles a complete deliverable:

```
deliverables/marias-kitchen/
  ├── README.md                    # Project summary
  ├── final/
  │   ├── site/                    # Production Astro site
  │   ├── design-system/           # CSS, Tailwind config
  │   ├── content.json             # All Portable Text content
  │   └── theme.json               # Theme configuration
  ├── case-study/
  │   ├── overview.md              # High-level summary
  │   ├── technical.md             # Elon's engineering notes
  │   ├── design.md                # Steve's design notes
  │   └── qa-findings.md           # Margaret's QA insights
  ├── decisions.md                 # Locked debate decisions
  ├── build-plan.md                # Original plan
  ├── qa-report.md                 # Final QA report
  ├── deploy-log.md                # Deployment record
  └── learnings.md                 # Insights for future projects
```

#### 7.2 Technical Case Study (Elon)

Elon writes the technical retrospective:

```markdown
# Technical Case Study — Maria's Kitchen

## Project Overview
- Type: E-commerce bakery website
- Pages: 5 (home, menu, about, contact, order)
- Complexity: Standard (1M tokens)
- Actual tokens burned: 487K (97% efficiency)
- Time to deploy: 6 hours

## Architecture Decisions

### Data Model
Used Portable Text for flexible content:
- Products (with pricing, image, description)
- Menu sections (categories for filtering)
- Contact form (simple, no database)

**Decision rationale:** Portable Text allows client to edit product copy and images without code changes.

### Tech Stack
- Astro 6 (static generation + edge rendering)
- TypeScript (strict mode, full type safety)
- Tailwind CSS 4 (design tokens)
- Cloudflare Pages + Workers (edge rendering for forms)

**Trade-offs considered:**
- Considered Next.js: Rejected (more overhead, Astro simpler for static site)
- Considered WordPress: Rejected (EmDash philosophy: code-first)

### Component Architecture
- 12 reusable Astro components (Hero, Card, Form, Nav, Footer, etc.)
- One layout template (Base.astro) for all pages
- Dynamic content via Portable Text rendering

**Decision rationale:** Atomic components + data-driven rendering = maximum flexibility, minimum code duplication.

## Build Execution

### Team Composition
- Designer: 80K tokens
- Developer: 120K tokens
- Copywriter: 60K tokens
- SEO specialist: 40K tokens

### Parallelism
- Phase 1 (0-2 hours): Designer creates design system, Developer sets up data model, Copywriter drafts copy (all parallel)
- Phase 2 (2-4 hours): Developer builds components (waits on design), Copywriter refines copy
- Phase 3 (4-5 hours): Final integration and QA
- Phase 4 (5-6 hours): Staging, smoke test, production deploy

### Token Efficiency
- Designer: 80K budget, 76K burned (95% efficiency)
- Developer: 120K budget, 118K burned (98% efficiency)
- Copywriter: 60K budget, 58K burned (97% efficiency)
- SEO: 40K budget, 35K burned (88% efficiency)

**Insight:** Copywriter could have shipped in less time. Task was straightforward, no rework needed.

## Challenges & Resolutions

### Challenge 1: Image Optimization
**Issue:** Initial hero image was 2.5MB, slowed page load to 3.2s LCP.  
**Resolution:** Developer auto-generated WebP variant, added responsive srcset, lazy-loaded below-fold images.  
**Cost:** 3K tokens  
**Result:** LCP improved to 1.8s, Lighthouse Performance 94/100

### Challenge 2: SEO Metadata Duplication
**Issue:** 5 pages, SEO specialist had to write meta descriptions for each manually.  
**Resolution:** Provided template + key focus keywords, SEO specialist wrote descriptions in batch.  
**Cost:** 2K tokens  
**Result:** All descriptions unique, 120-160 characters each

## Lessons Learned

1. **Better prompts for copywriter:** If we provided a content template upfront (character limits, tone guide), copywriter could work in parallel with designer instead of waiting on page layout.

2. **Image format decision upfront:** Asking client for images in WebP or providing compression guidelines before project saves revisions.

3. **SEO metadata as part of content seed:** Instead of separate SEO task, include metadata in Portable Text schema upfront. Reduces parallelism loss.

4. **Token allocation accuracy:** 40K for SEO was overkill for 5-page site. 25K would be better. 15K used, 25K buffer unused.

## Recommendations for Future Projects

- For sites 5-10 pages: Use template as starting point (saves 30% build tokens)
- For sites with lots of products: Pre-structure content seed in PRD (saves developer time)
- For any site: Include SEO requirements in Designer handoff (title, description char limits)

## Metrics

| Metric | Value |
|--------|-------|
| Total time (intake to live) | 6 hours |
| Tokens budgeted | 500K |
| Tokens burned | 487K |
| Efficiency | 97.4% |
| Cost per site | ~$2.95 |
| Pages per hour | 0.83 |
| Token cost per page | 97.4K |

## Sign-Off

Technical review complete. Site meets all PRD requirements, passes security/performance/accessibility audits, ready for production.

**Approved by:** Elon Musk  
**Date:** 2026-04-03
```

#### 7.3 Design Case Study (Steve)

Steve writes the design retrospective:

```markdown
# Design Case Study — Maria's Kitchen

## Design Challenge
Create a warm, inviting bakery brand identity for a local neighborhood business.

### Brand Brief
- Audience: Local community, foodies, special occasion shoppers
- Tone: Warm, handmade, personal (not corporate)
- Aesthetic: Rustic elegance with modern simplicity
- Constraints: 80K tokens (tight but achievable)

## Design System

### Color Palette
- Primary: Warm brown (#8B7355) — baked goods, warmth
- Secondary: Cream (#FAF6F1) — flour, softness
- Accent: Rose gold (#D4A574) — special occasions
- Text: Dark gray (#2C2C2C) — readability

**Decision:** Warm, earthy palette vs. bright neon. Matches bakery aesthetic without feeling dated.

### Typography
- Headings: Merriweather (serif, warm, classic) — invokes tradition
- Body: Inter (sans-serif, modern, clean) — ensures readability

**Decision:** Serif for headings (tradition) + sans-serif for body (modern). Balance old + new.

### Spacing & Layout
- 8px base grid
- Max content width: 1200px (no overwhelming layouts)
- Mobile-first responsive: 320px, 768px, 1280px breakpoints

## Component Library

Built 12 core components:
1. Hero (banner with background image + text overlay)
2. Card (product/menu item display)
3. Form (contact, order inquiry)
4. Navigation (sticky header, mobile hamburger)
5. Footer (minimal, links + social)
6. Gallery (image grid, lazy-loaded)
7. CTA (call-to-action buttons)
8. Testimonial (customer quote)
9. Stats counter (animated numbers)
10. Breadcrumb (navigation aid)
11. Tabs (menu categories)
12. Modal (image lightbox)

**Process:** Started with wireframes (rough layout), then high-fidelity mockups in Figma, then HTML/CSS implementation.

## Key Design Decisions

### Homepage Layout
- Hero with bakery image + "Welcome to Maria's Kitchen"
- Product showcase grid below
- Testimonial section (social proof)
- CTA to order / contact

**Rationale:** Hero establishes brand immediately, product grid drives sales, social proof builds trust.

### Menu Page
- Category tabs (Breads, Pastries, Cakes)
- Product cards with images, descriptions, prices
- Each card has "Learn more" modal

**Rationale:** Tabs allow filtering without page reload. Modals let customers explore without leaving page.

### Mobile Optimization
- 320px: Single-column layout, touch-friendly spacing
- 768px: 2-column product grid
- 1280px: 3-column grid + sidebar navigation

**Rationale:** Progressive enhancement — mobile first, scale up gracefully.

## Challenges & Resolutions

### Challenge 1: Hero Image Responsiveness
**Issue:** Client provided landscape photo, but mobile needed portrait-friendly crop.  
**Resolution:** Generated 3 image variants (desktop, tablet, mobile) with art direction.  
**Impact:** Hero looks intentional on all devices, not squeezed.

### Challenge 2: Typography on Baked Goods
**Issue:** Product cards needed titles on top of images. Text was hard to read.  
**Resolution:** Added semi-transparent dark overlay behind text, improved contrast.  
**Result:** Text readable on any image, no re-photography needed.

### Challenge 3: Color Contrast for Accessibility
**Issue:** Rose gold accent on cream background failed WCAG AA (3:1 ratio).  
**Resolution:** Used rose gold for decorative elements only. Dark text for all functional elements.  
**Result:** WCAG AA compliant, still on-brand.

## Iterations

### Version 1: Too minimal
- Clean design but felt corporate
- Feedback: "Doesn't feel like a warm bakery"
- Fix: Added warmer color palette, serif headlines, more whitespace

### Version 2: Too ornate
- Added decorative borders, illustrations, flourishes
- Feedback: "Feels dated, not modern"
- Fix: Stripped back to essential elements, kept warm colors, minimal ornamentation

### Version 3: Final (APPROVED)
- Warm color palette (earthy browns, creams)
- Serif headlines + sans-serif body
- Minimal decoration (trust the beautiful product photos)
- Generous whitespace
- Accessible, mobile-friendly, fast

**Total iterations:** 3 rounds  
**Token cost:** ~75K (within 80K budget)

## Design System Handoff

Delivered to Developer:
- Tailwind config (colors, spacing, typography)
- tokens.css (CSS custom properties)
- Component specs (Figma file with Inspect mode for dimensions)
- Responsive breakpoints documented

**Quality:** Developer could build with confidence. No back-and-forth on sizing/spacing.

## Lessons Learned

1. **Warm color feedback early:** First version was too minimal. Showing client options (warm vs. cool) upfront would avoid iteration.

2. **Accessibility constraints upfront:** WCAG AA requirements affected color choices. Building in from start, not fixing after.

3. **Image strategy in planning:** Knowing client would provide landscape photos, we could've discussed art direction in PLAN phase.

4. **Typography samples early:** Showing 2-3 font combinations with the PRD helps lock in direction before design work.

## Recommendations

- Always request brand assets (logo, existing color palette) in PRD intake
- Design system should include responsive image strategy
- Component specs should include accessibility checklist (color contrast, touch targets)
- For bakeries/food: Beautiful photography is 70% of design — invest there

## Metrics

| Metric | Value |
|--------|-------|
| Components designed | 12 |
| Figma artboards | 18 |
| Responsive breakpoints | 3 |
| Accessibility audit score | 95/100 |
| Designer tokens burned | 76K / 80K |
| Efficiency | 95% |
| Iteration rounds | 3 |

## Sign-Off

Design is cohesive, on-brand, accessible, and responsive. Client very happy with warmth and modern elegance.

**Approved by:** Steve Jobs  
**Date:** 2026-04-03
```

#### 7.4 QA Findings Summary (Margaret)

Margaret documents QA insights:

```markdown
# QA Findings & Process Improvements

## Final Metrics
- Automated QA pass rate: 100% (all 35 checks passed)
- Manual review findings: 0 critical, 2 minor
- Revisions required: 0
- Deploy-blocking issues: 0
- Security vulnerabilities: 0

## Automation Coverage

**What worked well:**
- Lighthouse scoring (caught performance issues early)
- WCAG contrast checking (prevented accessibility failures)
- Broken link detection (ensured internal navigation works)
- TypeScript strict mode (caught type errors before deploy)

**What was slow:**
- Manual keyboard navigation testing (30 min per site)
- Responsive testing at 3 breakpoints (manual screenshot review)

## Recommendations for Automation

1. **Keyboard navigation testing:** Use Playwright to auto-test Tab key through interactive elements. Would save 20 min per project.

2. **Screenshot regression testing:** Store baseline screenshots, compare new builds. Catches layout shifts automatically.

3. **Content validation:** Check that all Portable Text blocks are actually present in HTML output. Would catch rendering bugs early.

4. **Dead links in external resources:** Some clients link to external docs that might disappear. Add periodic link checking.

## Per-Site Insights

**Maria's Kitchen:**
- Clean build, no issues
- Strongest performer on Lighthouse (94+ on all metrics)
- SEO metadata well-structured
- No security vulnerabilities

**Consistency:**
- All sites passed accessibility on first try (good sign — accessibility built-in, not added after)
- Performance scores vary by image optimization (client images matter more than code)
- Security always clean (no hardcoded secrets, proper env var usage)

## Automation Investment Opportunity

**Current:** Manual QA, ~10K tokens per site  
**Potential:** Add Playwright test suite for keyboard navigation + responsive screenshots  
**Estimated:** Save 3-5K tokens per site by automating slow checks  
**Effort:** 20K tokens upfront (write tests), then ~2K per site  
**Payoff:** Break-even after 10 sites

**Recommendation:** Invest in test automation after 5 more projects (enough patterns to write robust tests).

## Sign-Off

Quality bar is high. Automation is catching issues. Manual review is fast. No technical debt.

**QA Lead:** Margaret Hamilton  
**Date:** 2026-04-03
```

#### 7.5 Learnings Document

Phil consolidates all learnings to `MEMORY.md` (persistent knowledge base):

```markdown
# Memory: Maria's Kitchen Bakery (2026-04-03)

## What Worked
1. **Warm color palette:** Client very satisfied. Differentiated from corporate websites.
2. **Serif + sans-serif pairing:** Professional yet personal. Reuse for other bakeries.
3. **Portable Text for products:** Easy for client to update prices, descriptions post-launch.
4. **3-agent model (design, dev, copy):** Perfect parallelism, no blocking.

## What Was Suboptimal
1. **SEO specialist underutilized:** 40K tokens budgeted, 35K used. 5K wasted. Reduce to 25K next time.
2. **Image format conversation late:** Should discuss art direction + formats in PLAN phase.
3. **Content template not provided upfront:** Copywriter could've worked in parallel with designer.

## Metrics Worth Repeating
- 5 pages: ~490K tokens (98% of 500K budget)
- Time to deploy: 6 hours
- Token cost per page: ~98K
- Lighthouse performance: 94/100 (high bar, likely due to image optimization)
- Zero revisions needed (first-pass QA pass)

## Template Opportunity
**Design system artifacts from Maria's Kitchen are reusable:**
- Warm bakery color palette (browns, creams, rose gold)
- Serif headline + sans-serif body typography
- Product card component
- Hero + CTA template

**Potential:** Save 50% on design phase for next bakery project. Budget template approach next time.

## Client Satisfaction
- Delivery time: 6 hours (exceeded expectations)
- Quality: No complaints (design, performance, functionality all approved first-pass)
- Price: Happy with value
- Likelihood of repeat: High (future revisions, new pages likely)

## Next Bakery/Restaurant
Use Maria's Kitchen as starting template. Estimate:
- Base tokens: 500K → 300K (with template)
- Design phase: 80K → 40K (reuse design system)
- Developer: 120K → 100K (less customization)
- Copywriter: 60K → 50K (more structured content input)
- SEO: 40K → 20K (template SEO already in place)
- **Total: 300K instead of 500K** (40% savings)

---

## Key Decisions Log

**Decision 1: Astro 6 over Next.js**
- Rationale: Static site generation, simpler deployment, faster builds
- Outcome: Right choice. Site deployed in 2 min, zero issues.
- Reuse: Yes, for all static content-heavy sites

**Decision 2: Portable Text for content**
- Rationale: Client can edit without code, flexible schema
- Outcome: Client very happy. Already asking about updating prices post-launch.
- Reuse: Yes, for all client-facing content

**Decision 3: Cloudflare Pages for hosting**
- Rationale: Fast global CDN, serverless, integrated edge functions
- Outcome: Perfect. No performance issues, easy deployment.
- Reuse: Yes, for all EmDash sites

---

## Tools / Commands to Keep

- `./pipeline/deploy/deploy.sh` works perfectly — no changes needed
- `astro check` catches TypeScript issues early
- Lighthouse on desktop + mobile catches perf/a11y issues

---

## Anti-Patterns to Avoid

1. **Overscoping design:** First version was minimal, required 2 iterations. Next time: share warm bakery inspo board upfront.
2. **Late image discussion:** Ended up re-cropping one hero image. Discuss image strategy in PLAN phase.
3. **Underestimating copywriter:** Could use copywriter feedback in design phase (not just sequential).

---

Last updated: 2026-04-03  
For next project: Reference this when similar client appears (bakery, restaurant, food).
```

### Inputs & Outputs

| Item | Who Provides | Format |
|------|--------------|--------|
| **Input: All artifacts** | Stages 1–6 | Markdown, code, logs |
| **Output: Final deliverable** | Phil | `deliverables/{slug}/` directory |
| **Output: Technical case study** | Elon | Markdown doc |
| **Output: Design case study** | Steve | Markdown doc |
| **Output: QA findings** | Margaret | Markdown doc |
| **Output: Learnings** | Phil | Added to `MEMORY.md` |

### What Gets Handed Off

**To the client:**
1. Live production URL
2. Admin access (if applicable)
3. Deployment documentation
4. Post-launch support contact info

**To Shipyard AI internal:**
1. Deliverable package (archive for reference)
2. Case studies (reuse insights)
3. Learnings (improve process for next projects)
4. Code/design artifacts (template library candidates)

### Success Criteria

✓ Final deliverable packaged (`deliverables/{slug}/`)  
✓ Technical case study written by Elon  
✓ Design case study written by Steve  
✓ QA findings documented by Margaret  
✓ Learnings added to MEMORY.md  
✓ Client notified of completion  
✓ All artifacts archived for reference  
✓ Bill/invoice generated (if applicable)

---

## Common Issues & Resolution Guide

### Issue: Token Overrun

**Symptom:** Agent burns through budget too fast.

**Resolution:**
1. Director reviews: Is agent gold-plating? Or is scope larger than expected?
2. If gold-plating: Ask agent to cut scope, focus on PRD requirements only.
3. If scope issue: Reallocate from reserve (max 10% of project budget) with director approval.
4. If reserve exhausted: Ship with gaps, document, offer revision (separate tokens).

### Issue: Blocker (Agent Stuck)

**Symptom:** Agent can't proceed waiting for input from another agent.

**Resolution:**
1. Agent flags in STATUS.json (never silently fails).
2. Directors unblock: either speed up dependent task, or provide alternate input.
3. While blocked: Agent works on unblocked tasks (if any).
4. Max 2 hours blocked: Escalate to Phil/directors for override decision.

### Issue: Quality Dispute

**Symptom:** Director rejects agent output ("This doesn't match decisions.md").

**Resolution:**
1. Director provides specific feedback (not vague criticism).
2. Agent revises (costs tokens from that agent's allocation or reserve).
3. Director re-approves.
4. If agent disagrees with feedback: Both present to Elon, he decides.

### Issue: PRD Changes During Build

**Symptom:** Client requests new feature mid-build ("Can you also add...?").

**Resolution:**
1. Phil documents as revision request in TASKS.md.
2. Phil evaluates token cost (see TOKEN-CREDITS.md revision pricing).
3. Get client approval + payment for revision tokens.
4. Either: (a) integrate into ongoing build (if budget allows), or (b) queue for post-deploy revision.
5. Never silently add scope to existing budget.

### Issue: Deploy Failure

**Symptom:** Staging site 500 errors.

**Resolution:**
1. Check Cloudflare logs for specific error.
2. Common causes: missing env var, Node version mismatch, build issue.
3. Fix locally, re-run `astro build`, retry deploy.sh.
4. If persistent: Elon escalates to Cloudflare support.

### Issue: Performance Regression

**Symptom:** Staging smoke test shows LCP > 2.5s or Lighthouse < 90.

**Resolution:**
1. Identify cause: usually unoptimized images or large JavaScript.
2. Developer optimizes (image format, lazy loading, code splitting).
3. Re-run QA.
4. If fix takes too long: Ship with known limitation (log in QA report), offer post-launch optimization (revision tokens).

---

## Glossary

| Term | Definition |
|------|-----------|
| **Tokens** | Unit of AI inference cost (input + output). 1 token ≈ 1 token in Anthropic API pricing. |
| **PRD** | Product Requirements Document. Client's specification of what to build. |
| **Build artifact** | Output from sub-agent (design file, code, content, etc.). |
| **Portable Text** | EmDash's content format (JSON). Flexible, type-safe, allows rich formatting. |
| **Astro** | Static site generator. Our go-to for EmDash theme building. |
| **Haiku / Sonnet** | Claude model variants. Haiku is fast/cheap, Sonnet is slow/expensive. |
| **Workdays** | A worktree isolates agent work. One worktree per agent per project. |
| **Smoke test** | Quick validation (does it load, no 500 errors). Not exhaustive. |
| **QA** | Quality Assurance. Margaret's role. Automated + manual checks. |
| **Revision** | Post-deploy changes. Separate token purchase from client. |
| **MEMORY.md** | Persistent learnings document. Updated after every project. |

---

## Quick Command Reference

```bash
# Check project status
cat projects/{slug}/STATUS.json

# View token spending
cat projects/{slug}/build/token-log.jsonl

# Run QA checklist manually
cd projects/{slug}/build/{astro-site}
npm run build
npx astro check
npm audit

# Deploy to staging
./pipeline/deploy/deploy.sh projects/{slug}/build/{astro-site} {project-slug}

# View live site
open https://{project-slug}.pages.dev

# Create release tag
git tag v1.0.0-{project-slug}
git push origin v1.0.0-{project-slug}

# Update project status
# (Edit projects/{slug}/STATUS.json directly)
```

---

## Emergency Contacts

| Role | Name | Escalation |
|------|------|-----------|
| **Orchestrator** | Phil Jackson | phil@shipyard.company |
| **Product/Engineering** | Elon Musk | elon@shipyard.company |
| **Design/Brand** | Steve Jobs | steve@shipyard.company |
| **QA Lead** | Margaret Hamilton | margaret@shipyard.company |
| **Cloudflare Support** | – | https://dash.cloudflare.com/support |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-04-03 | Phil Jackson | Initial runbook. 7-stage pipeline, token budgeting, all procedures. |

---

**This runbook is the source of truth for executing Shipyard AI projects. Update after every project with new learnings. Distribute to all new agents on day 1.**
