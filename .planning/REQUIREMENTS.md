# Requirements: Blog Plugin Pipeline
> **Project Slug:** blog-plugin-pipeline
> **Source:** PRD + Locked Decisions from Debate Phase
> **Generated:** 2026-04-15

---

## Executive Summary

Create a compelling blog post demonstrating how Shipyard AI built 7 production Emdash plugins through an autonomous pipeline that caught and fixed all hallucinated API implementations.

**Core Story:** AI hallucinated APIs → pipeline caught errors → fixed automatically → shipped 7 plugins

**Deliverable:** Single markdown file (~1500 words, 60% code blocks) published to Shipyard blog

**Architecture:** Blog post generator (TypeScript) OR manual curation with Claude assistance
**Files Created:** 1 markdown file in blog directory
**Execution Target:** <60 seconds

---

## The Essence (from decisions.md)

> *"Proof that AI can debug itself. Relief mixed with envy."*

Show broken code, then fixed code. Make it visceral. Engineers who shipped, not marketers who theorize.

---

## Atomic Requirements

### CONTENT REQUIREMENTS

#### Opening & Structure

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-C1 | Opening hook: "We asked an AI to build seven plugins. It hallucinated every API. Built against fantasies. Shipped zero working code. Then the pipeline caught every mistake, fixed everything, and delivered production-ready plugins. Here's how." | decisions.md Lines 70-72 | First paragraph matches hook structure |
| REQ-C2 | Word count: 1200-1800 words (~1500 target) | PRD Line 16, decisions.md Line 144 | Final count within range |
| REQ-C3 | Code-to-narrative ratio: 60% code blocks, 40% narrative | decisions.md Lines 66-68 | Character count of code ÷ total ≥ 0.60 |
| REQ-C4 | Structure: Problem → Code → Fix → Code → Result | decisions.md Lines 70-76 | Each section follows flow |
| REQ-C5 | Closing dare: "This pipeline built seven plugins in one session. What could it build for you?" | decisions.md Lines 77-79 | Final paragraph matches; no CTAs |

#### Code Examples

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-C6 | 2-3 before/after code comparisons | PRD, decisions.md | Each shows: (1) broken code, (2) board verdict, (3) fixed code, (4) result |
| REQ-C7 | Cover banned pattern: `throw new Response` (should be `return`) | PRD Line 12, Codebase Scout (235+ violations) | At least one example shows this |
| REQ-C8 | Cover banned pattern: `JSON.stringify` on KV (platform handles serialization) | PRD Line 12, Codebase Scout (150+ violations) | At least one example shows this |
| REQ-C9 | Cover banned pattern: defensive `rc.user` checks (framework provides auth) | PRD Line 12, Codebase Scout (16+ violations) | At least one example shows this |
| REQ-C10 | Code blocks use actual source code (not synthesized) | Technical integrity | Each snippet traceable to source files |
| REQ-C11 | Code blocks have syntax highlighting (```typescript) | decisions.md Line 229 | Language identifiers present |

#### Seven Plugins & Board Verdicts

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-C12 | List all 7 plugins: EventDash, MemberShip, ReviewPulse, FormForge, SEODash, CommerceKit, AdminPulse | PRD Line 6, Codebase Scout | Explicit statement + list of 7 names |
| REQ-C13 | Feature board verdicts from: Jensen (moats), Warren (economics), Shonda (retention), Margaret Hamilton (QA) | PRD Line 14 | At least one verdict per example |
| REQ-C14 | Board verdicts integrated into narrative (not separated) | decisions.md Lines 217-224 | Verdicts flow with before/after examples |
| REQ-C15 | Show pipeline catch & fix process: QA blocks, auto-fix cycles, Margaret Hamilton QA | PRD Line 13, decisions.md | At least 2 examples of intervention |

#### Voice & Tone

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-C16 | Emotional tone: "relief mixed with envy" — "I just watched this thing debug itself" | decisions.md Lines 99-101 | Language demonstrates self-correction |
| REQ-C17 | Voice: "engineers who shipped, not marketers who theorize" | decisions.md Lines 84-87 | Zero "might," "could," "potentially" |
| REQ-C18 | Results-driven case study format (outcomes over methodology) | PRD Line 15, decisions.md | Emphasis on RESULTS not process |
| REQ-C19 | Confident declarative language | decisions.md | No hedging language |

### TECHNICAL REQUIREMENTS

#### File Format

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-T1 | Output: single `.md` file | decisions.md Line 183 | Well-formed markdown |
| REQ-T2 | YAML frontmatter with: title, date (YYYY-MM-DD), tags | decisions.md Lines 184-190 | Valid YAML between `---` delimiters |
| REQ-T3 | Frontmatter title: "Seven Plugins, Zero Errors: AI That Debugs Itself" (or variant) | decisions.md Line 186 | Title field matches |
| REQ-T4 | Tags include: `ai`, `code-generation`, `autonomous-debugging` | decisions.md Line 188 | Tags array contains these |
| REQ-T5 | Match existing Shipyard blog format | PRD Line 28 | Compare against existing posts |

#### Source Materials

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-T6 | Read `/plugins/eventdash/src/sandbox-entry.ts` | PRD Line 19 | File read successfully |
| REQ-T7 | Read `/plugins/membership/src/sandbox-entry.ts` | PRD Line 19 | File read successfully |
| REQ-T8 | Read `/docs/EMDASH-GUIDE.md` for correct patterns | PRD Line 20 | File read successfully |
| REQ-T9 | Read deliverables in `/deliverables/eventdash-fix/` | PRD Line 21 | All files read |
| REQ-T10 | Read deliverables in `/deliverables/membership-fix/` | PRD Line 22 | All files read |
| REQ-T11 | Read `/rounds/eventdash-fix/board-verdict.md` | PRD Line 23 | File read successfully |
| REQ-T12 | Read `/rounds/membership-fix/board-verdict.md` | PRD Line 24 | File read successfully |

#### Execution

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-T13 | Parallel file I/O (all source files read concurrently) | decisions.md Lines 38-50 | Total execution <60 seconds |
| REQ-T14 | Write to correct Shipyard blog directory | PRD Line 26 | File in proper location |
| REQ-T15 | Git commit with clear message | PRD Line 32 | `git log` shows commit |
| REQ-T16 | Git push to remote | PRD Line 32 | Changes on remote |

### NEGATIVE SCOPE (What Does NOT Ship)

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-N1 | No pipeline visualizations | decisions.md Line 24 | None built |
| REQ-N2 | No interactive demos | decisions.md Line 25 | None built |
| REQ-N3 | No voice assistant/audio version | decisions.md Line 26 | None built |
| REQ-N4 | No case study template generator | decisions.md Line 27 | None built |
| REQ-N5 | No analytics dashboard | decisions.md Line 28 | None built |
| REQ-N6 | No video walkthroughs | decisions.md Line 29 | Deferred to v2 |

---

## Traceability Matrix

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-T6-T12 (Source material reads) | Task 1 (Survey & collect source materials) | 1 |
| REQ-C6-C11 (Code examples) | Task 2 (Extract before/after code examples) | 1 |
| REQ-C13-C15 (Board verdicts) | Task 3 (Extract board verdicts & feedback) | 1 |
| REQ-C1-C5, REQ-C16-C19 (Content structure) | Task 4 (Write blog post content) | 2 |
| REQ-C12 (Seven plugins) | Task 4 (included in content) | 2 |
| REQ-T1-T5 (File format) | Task 5 (Format as markdown with frontmatter) | 2 |
| REQ-T14 (Write to blog directory) | Task 6 (Write file to correct location) | 3 |
| REQ-T15-T16 (Git commit & push) | Task 7 (Commit and push) | 3 |
| REQ-N1-N6 (Negative scope) | Verification (nothing extra built) | All waves |

---

## Technical Context

### Critical Source Files (from Codebase Scout)

**Plugin Source Code:**
- `/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts` (3,442 LOC)
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (3,600 LOC)
- `/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts` (1,289 LOC)
- `/home/agent/shipyard-ai/plugins/commercekit/src/sandbox-entry.ts` (1,420 LOC)
- `/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts` (796 LOC)
- `/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts` (796 LOC)
- `/home/agent/shipyard-ai/plugins/adminpulse/` (location TBD)

**Board Verdicts & Decisions:**
- `/home/agent/shipyard-ai/rounds/eventdash-fix/decisions.md` (lists 443 violations with counts)
- `/home/agent/shipyard-ai/rounds/eventdash-fix/board-verdict.md` (board approval)
- `/home/agent/shipyard-ai/rounds/membership-fix/board-verdict.md` ("Bones are good, give it a heartbeat")

**Fixed Code Examples:**
- `/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts`
- `/home/agent/shipyard-ai/deliverables/membership-fix/auth.ts` (JWT implementation)
- `/home/agent/shipyard-ai/deliverables/membership-fix/email.ts` (email templates)

**Narrative Blueprint:**
- `/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/essence.md` (core narrative)
- `/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/decisions.md` (430-line blueprint)

**Documentation:**
- `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (51,975 bytes - Emdash API reference)

### Blog Publication Path

**Target Directory:** `/home/agent/shipyard-ai/website/src/app/blog/`

**Method:** Add new post object to `posts` array in `page.tsx`

### Hallucinated API Patterns (from Codebase Scout)

Five core patterns the AI hallucinated:

1. **`throw new Response()`** — 121 instances in eventdash, 114 in membership (235 total)
   - Used `throw` instead of `return new Response()`
   - Caused admin crashes

2. **Manual JSON Serialization** — 150+ violations
   - Double `JSON.stringify/parse` when platform handles automatically
   - Corrupted member records

3. **Redundant Auth Checks** — 16+ violations
   - Added defensive `rc.user` checks framework already handles
   - Unnecessary complexity

4. **Wrong Parameter Access** — Multiple instances
   - Used non-existent `rc.pathParams` instead of `rc.input`
   - API mismatch

5. **Error Response Formatting** — Pattern violations
   - Returned plain strings instead of structured JSON
   - Inconsistent error handling

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Writing quality falls short | Medium | High | 80% effort on content, 20% on tech; human review |
| Insufficient before/after examples | Medium-High | High | Survey git history; use QA pass files if needed |
| Board verdicts too sparse | Medium | Medium-High | Cross-reference QA passes; infer from decisions.md |
| Scope creep during implementation | High | Medium | Lock deliverable: ONE markdown file only |
| Auto-commit without review | Low | Medium | Generate to output first, review before commit |
| Execution exceeds 60 seconds | Low | Low | Parallel I/O; optimize file reads |

---

## Open Questions

1. **Which 2-3 plugins for featured examples?**
   - Recommendation: EventDash (most dramatic - admin crash), MemberShip (clearest before/after - corrupted records), FormForge (simplest to explain)

2. **How to source board verdicts for other 5 plugins?**
   - Only EventDash and MemberShip have complete board-verdict.md files
   - Use QA pass files from finish-plugins round for others

3. **Exact publication directory path?**
   - Codebase Scout found: `/home/agent/shipyard-ai/website/src/app/blog/page.tsx`
   - Confirm this is correct location

4. **Publication date in frontmatter?**
   - Use today's date (2026-04-15) or projected publication date?

5. **How to demonstrate "auto-fix cycles"?**
   - Show multiple iterations or is each before/after pair sufficient?

---

## Success Criteria

### Technical Success
- ✅ Execution time: <60 seconds
- ✅ All source files successfully read
- ✅ Valid markdown with frontmatter
- ✅ Clean git commit
- ✅ Pushed to remote

### Content Success
- ✅ First paragraph passes "stop scrolling" test
- ✅ 60%+ code blocks by character count
- ✅ 2-3 before/after examples included
- ✅ Board verdicts visible in narrative
- ✅ Closing dare instead of CTA
- ✅ Zero hedging language ("might," "could," "potentially")

### Distribution Success (Post-Ship)
- Target: 1,000+ views in first week
- Target: 10+ shares on HN/Reddit
- Target: 5+ inbound questions about the pipeline
- Measure: Google Analytics + social referrals

---

## Requirements Summary

**Total Requirements:** 45
- **Content:** 19
- **Technical:** 16
- **Negative Scope:** 6
- **Implicit/Derived:** 4

**Must-Have:** 35
**Should-Have:** 10
**Nice-to-Have:** 0 (scope locked tight)

**Critical Path:** Quality of opening hook → availability of clear hallucination examples → narrative clarity on pipeline intervention

**Content Risk:** HIGH (quality is hard; board verdicts are sparse)
**Technical Risk:** LOW (architecture is sound; codebase is clean)
**Timeline Risk:** MEDIUM (scope creep precedent from finish-plugins round)

---

## Key Insights from Research

1. **Content is the critical path.** All must-have requirements relate to narrative quality and code examples. (Per Elon: "The hard part is the writing quality, not the technical execution.")

2. **Code authenticity is paramount.** Before/after code must be sourced from actual project artifacts, not synthesized.

3. **Scope is deliberately locked.** Single markdown file only — no interactive demos, visualizations, or analytics. (Per Elon: "Ship the markdown file.")

4. **Only 2 of 7 plugins have complete documentation.** EventDash and MemberShip have full before/after + board verdicts. Others require git archaeology or inference.

5. **The hallucination patterns are GOLD for narrative.** 235+ violations of `throw new Response`, 150+ manual JSON wrapping, 16+ redundant auth checks — these are visceral, dramatic, and easy to visualize.

---

*This document is the specification for the build phase. No new debates. Build what's locked.*
