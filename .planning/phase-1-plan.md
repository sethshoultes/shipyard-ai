# Phase 1 Plan — Blog Plugin Pipeline

**Generated**: 2026-04-15
**Project Slug**: blog-plugin-pipeline
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 7
**Waves**: 3
**Estimated Timeline**: 3-4.5 hours

---

## The Essence

From decisions.md:

> *"Proof that AI can debug itself. Relief mixed with envy."*

Show broken code, then fixed code. Make it visceral. Engineers who shipped, not marketers who theorize.

**Core Story:** AI hallucinated APIs → pipeline caught errors → fixed automatically → shipped 7 plugins

**Deliverable:** ONE markdown file (~1500 words, 60% code blocks)

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-T6-T12 (Source material reads) | phase-1-task-1, phase-1-task-2, phase-1-task-3 | 1 |
| REQ-C6-C11 (Code examples) | phase-1-task-2 | 1 |
| REQ-C13-C15 (Board verdicts) | phase-1-task-3 | 1 |
| REQ-C1-C5, REQ-C16-C19 (Content structure & voice) | phase-1-task-4 | 2 |
| REQ-C12 (Seven plugins) | phase-1-task-4 | 2 |
| REQ-T1-T5 (File format) | phase-1-task-5 | 2 |
| REQ-T14 (Write to blog directory) | phase-1-task-6 | 3 |
| REQ-T15-T16 (Git commit & push) | phase-1-task-7 | 3 |
| REQ-N1-N6 (Negative scope) | All tasks (verification) | All |

---

## Wave Execution Order

### Wave 1 (Parallel) — Source Material Collection

These three tasks can run in parallel to gather all source materials needed for writing the blog post.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Survey & Collect Plugin Source Files</title>
  <requirement>REQ-T6, REQ-T7: Read plugin source code to extract before/after examples</requirement>
  <description>
Read and catalog the source code for all 7 Emdash plugins, focusing on EventDash and MemberShip which have complete before/after documentation. Identify the hallucinated API patterns in the original code and their fixes in the deliverables.

This task establishes the foundation for code examples that will comprise 60% of the blog post content.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts" reason="EventDash plugin source - 3,442 LOC, primary example plugin" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts" reason="MemberShip plugin source - 3,600 LOC, secondary example plugin" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="FormForge plugin source - 1,289 LOC, simplest example" />
    <file path="/home/agent/shipyard-ai/plugins/commercekit/src/sandbox-entry.ts" reason="CommerceKit plugin source - 1,420 LOC" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/sandbox-entry.ts" reason="ReviewPulse plugin source - 796 LOC" />
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="SEODash plugin source - 796 LOC" />
    <file path="/home/agent/shipyard-ai/plugins/adminpulse/" reason="AdminPulse plugin directory" />
    <file path="/home/agent/shipyard-ai/deliverables/eventdash-fix/sandbox-entry.ts" reason="Fixed EventDash code showing corrections" />
    <file path="/home/agent/shipyard-ai/deliverables/membership-fix/auth.ts" reason="Fixed MemberShip JWT auth implementation" />
    <file path="/home/agent/shipyard-ai/deliverables/membership-fix/email.ts" reason="Fixed MemberShip email templates" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Emdash API reference showing correct patterns (51KB)" />
  </context>

  <steps>
    <step order="1">Read all 7 plugin source files using Glob tool: `/home/agent/shipyard-ai/plugins/*/src/sandbox-entry.ts`</step>
    <step order="2">Read fixed versions in deliverables: `/home/agent/shipyard-ai/deliverables/eventdash-fix/` and `/home/agent/shipyard-ai/deliverables/membership-fix/`</step>
    <step order="3">Read EMDASH-GUIDE.md to understand correct API patterns</step>
    <step order="4">Identify the 5 hallucinated patterns: (1) `throw new Response`, (2) manual JSON.stringify, (3) rc.user checks, (4) rc.pathParams vs rc.input, (5) error formatting</step>
    <step order="5">Extract 2-3 compelling before/after code snippets (10-20 lines each) showing the most dramatic fixes</step>
    <step order="6">Document line numbers and file paths for each code snippet for traceability</step>
    <step order="7">Write findings to `/home/agent/shipyard-ai/.planning/code-examples.md` with annotated snippets</step>
  </steps>

  <verification>
    <check type="manual">Verify code-examples.md contains 2-3 before/after pairs</check>
    <check type="manual">Each example shows: original broken code + fixed code + line references</check>
    <check type="manual">Examples cover at least 3 of the 5 hallucinated patterns</check>
    <check type="manual">All code snippets are authentic (traceable to actual source files)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>docs(blog-pipeline): extract code examples for blog post

Survey plugin source files and deliverables to identify before/after
code examples showing hallucinated API patterns and their fixes.

Found 235+ instances of throw new Response, 150+ manual JSON wrapping,
16+ redundant auth checks across eventdash and membership plugins.

Related: blog-plugin-pipeline PRD</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Extract Hallucination Pattern Documentation</title>
  <requirement>REQ-C7, REQ-C8, REQ-C9: Document specific banned patterns with violation counts</requirement>
  <description>
Read the eventdash-fix decisions.md which lists exactly 443 violations across 5 pattern categories. This provides the quantitative data to support the "hallucinated every API" narrative hook.

This task provides the dramatic numbers that make the story compelling: "235+ violations," "121 instances of admin crashes."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/eventdash-fix/decisions.md" reason="Lists exact violation counts: 443 total violations cataloged" />
    <file path="/home/agent/shipyard-ai/rounds/membership-fix/decisions.md" reason="May contain additional pattern documentation (if exists)" />
    <file path="/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/essence.md" reason="Core narrative guidance for framing hallucinations" />
  </context>

  <steps>
    <step order="1">Read `/home/agent/shipyard-ai/rounds/eventdash-fix/decisions.md`</step>
    <step order="2">Extract violation counts for each pattern type (throw Response, JSON.stringify, rc.user, rc.pathParams, error formatting)</step>
    <step order="3">Document the impact of each pattern (e.g., "caused admin crashes," "corrupted member records")</step>
    <step order="4">Read essence.md for narrative framing guidance</step>
    <step order="5">Create pattern summary table with: Pattern Name | Violation Count | Impact | Example</step>
    <step order="6">Write to `/home/agent/shipyard-ai/.planning/hallucination-patterns.md`</step>
  </steps>

  <verification>
    <check type="manual">hallucination-patterns.md exists and contains 5 pattern categories</check>
    <check type="manual">Each pattern has quantitative violation count from decisions.md</check>
    <check type="manual">Impact descriptions are specific and visceral (crashes, corruption, etc.)</check>
    <check type="manual">Summary can be cited in blog post with exact numbers</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>docs(blog-pipeline): document hallucination patterns with counts

Extract violation metrics from eventdash-fix decisions showing:
- 235+ throw new Response violations
- 150+ manual JSON serialization errors
- 16+ redundant auth checks
- rc.pathParams misuse
- Inconsistent error formatting

These numbers support the "hallucinated every API" narrative hook.

Related: blog-plugin-pipeline PRD</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Extract & Annotate Board Verdicts</title>
  <requirement>REQ-C13, REQ-C14, REQ-C15: Feature board member verdicts integrated into narrative</requirement>
  <description>
Read board verdict files for EventDash and MemberShip to extract specific feedback from Jensen (moats), Warren (economics), Shonda (retention), and Margaret Hamilton (QA). These verdicts show how the pipeline caught issues.

This provides the "board member caught it" element of the Problem → Board Verdict → Fix → Result structure.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/eventdash-fix/board-verdict.md" reason="Board approval with conditions for EventDash" />
    <file path="/home/agent/shipyard-ai/rounds/membership-fix/board-verdict.md" reason="Board verdict with famous quote: 'Bones are good, give it a heartbeat'" />
    <file path="/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/decisions.md" reason="Lines 217-224 specify how to quote board verdicts (direct quotes for punchlines, paraphrase for detail)" />
  </context>

  <steps>
    <step order="1">Read eventdash-fix/board-verdict.md and extract key verdicts</step>
    <step order="2">Read membership-fix/board-verdict.md and extract key verdicts</step>
    <step order="3">Identify which board member made each verdict (Jensen, Warren, Shonda, Margaret)</step>
    <step order="4">Extract "punchline" quotes suitable for direct quotation</step>
    <step order="5">Summarize technical details suitable for paraphrase</step>
    <step order="6">Map each verdict to the code example it relates to (from task 1)</step>
    <step order="7">Write to `/home/agent/shipyard-ai/.planning/board-verdicts.md` with attribution and context</step>
  </steps>

  <verification>
    <check type="manual">board-verdicts.md contains verdicts from at least 2 board members</check>
    <check type="manual">Each verdict clearly attributed (Jensen/Warren/Shonda/Margaret)</check>
    <check type="manual">Punchline quotes identified for direct citation</check>
    <check type="manual">Each verdict mapped to specific code example or pattern</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 -->
  </dependencies>

  <commit-message>docs(blog-pipeline): extract board verdicts for narrative

Catalog board member feedback showing how pipeline caught issues:
- EventDash: Board conditions on admin pattern violations
- MemberShip: "Bones are good, give it a heartbeat" quote
- Map verdicts to specific code examples for narrative flow

Board members: Jensen (moats), Warren (economics), Shonda (retention),
Margaret Hamilton (QA).

Related: blog-plugin-pipeline PRD</commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Content Creation

These two tasks depend on Wave 1 completing but can run in parallel with each other.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Write Blog Post Content (Markdown Body)</title>
  <requirement>REQ-C1-C5, REQ-C12, REQ-C16-C19: Core blog post content with proper structure and voice</requirement>
  <description>
Write the main blog post content (~1500 words, 60% code blocks) following the Problem → Code → Fix → Code → Result structure. This is the critical path task that determines content quality.

Per decisions.md Risk Register: "The hard part is the writing quality, not the technical execution." Allocate 80% of effort to making the opening hook "stop scrolling" and achieving "relief mixed with envy" emotion.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/code-examples.md" reason="Before/after code snippets from Task 1" />
    <file path="/home/agent/shipyard-ai/.planning/hallucination-patterns.md" reason="Pattern documentation with counts from Task 2" />
    <file path="/home/agent/shipyard-ai/.planning/board-verdicts.md" reason="Board member verdicts from Task 3" />
    <file path="/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/decisions.md" reason="430-line blueprint with opening hook, structure, voice guidance (Lines 70-87, 99-101)" />
    <file path="/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/essence.md" reason="Core narrative: 'Proof that AI can debug itself'" />
  </context>

  <steps>
    <step order="1">Read code-examples.md, hallucination-patterns.md, and board-verdicts.md from Wave 1</step>
    <step order="2">Write opening hook (exact text from decisions.md Lines 70-72): "We asked an AI to build seven plugins. It hallucinated every API..."</step>
    <step order="3">Write first example section: EventDash admin crash (show broken throw Response code → board verdict → fixed return Response code → result)</step>
    <step order="4">Write second example section: MemberShip corrupted records (show broken JSON.stringify → board verdict → fixed code → result)</step>
    <step order="5">Write third example section: Choose from FormForge, redundant auth, or error formatting based on clarity</step>
    <step order="6">Write results section: All 7 plugins shipped (list: EventDash, MemberShip, ReviewPulse, FormForge, SEODash, CommerceKit, AdminPulse)</step>
    <step order="7">Write closing dare: "This pipeline built seven plugins in one session. What could it build for you?"</step>
    <step order="8">Verify voice: Zero instances of "might," "could," "potentially" - confident declarative language only</step>
    <step order="9">Verify code ratio: Count characters in code blocks vs total, aim for ≥60%</step>
    <step order="10">Verify word count: 1200-1800 words (~1500 target)</step>
    <step order="11">Write to `/home/agent/shipyard-ai/.planning/blog-post-body.md` (without frontmatter - that's Task 5)</step>
  </steps>

  <verification>
    <check type="manual">Opening paragraph matches prescribed hook</check>
    <check type="manual">Contains 2-3 before/after code examples with board verdicts</check>
    <check type="manual">All 7 plugins listed by name</check>
    <check type="manual">Closing matches dare formula (no CTAs)</check>
    <check type="manual">Word count: 1200-1800 words</check>
    <check type="manual">Code blocks comprise ≥60% of character count</check>
    <check type="manual">Voice check: Zero hedging language ("might," "could," "potentially")</check>
    <check type="manual">Emotional test: Does it evoke "relief mixed with envy"?</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Needs code examples from plugin survey" />
    <depends-on task-id="phase-1-task-2" reason="Needs hallucination pattern data with violation counts" />
    <depends-on task-id="phase-1-task-3" reason="Needs board verdicts for narrative integration" />
  </dependencies>

  <commit-message>docs(blog-pipeline): write blog post content

Create 1500-word blog post demonstrating AI self-correction through
7 Emdash plugins. Structure: Problem → Code → Fix → Code → Result.

Features:
- Opening hook: "We asked an AI to build seven plugins..."
- 3 before/after examples (EventDash admin crash, MemberShip corruption, third TBD)
- Board verdicts integrated (Jensen, Warren, Shonda, Margaret)
- 60% code blocks, 40% narrative
- Closing dare: "What could it build for you?"

Voice: Engineers who shipped, not marketers who theorize.
Emotion: Relief mixed with envy.

Related: blog-plugin-pipeline PRD</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Format Blog Post with Frontmatter</title>
  <requirement>REQ-T1-T5: Create properly formatted markdown file with YAML frontmatter</requirement>
  <description>
Add YAML frontmatter to the blog post body and create the final markdown file. Frontmatter must include title, date (YYYY-MM-DD), and tags as specified in decisions.md.

This ensures the blog post matches existing Shipyard blog format for publication.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/blog-post-body.md" reason="Blog content from Task 4" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/page.tsx" reason="Existing blog format to match" />
    <file path="/home/agent/shipyard-ai/rounds/blog-plugin-pipeline/decisions.md" reason="Frontmatter spec: Lines 184-190" />
  </context>

  <steps>
    <step order="1">Read blog-post-body.md from Task 4</step>
    <step order="2">Read existing blog posts in website/src/app/blog/ to understand format</step>
    <step order="3">Create YAML frontmatter block with `---` delimiters</step>
    <step order="4">Add title: "Seven Plugins, Zero Errors: AI That Debugs Itself" (or approved variant)</step>
    <step order="5">Add date: 2026-04-15 (ISO 8601 format)</step>
    <step order="6">Add tags: ["ai", "code-generation", "autonomous-debugging"]</step>
    <step order="7">Validate YAML frontmatter syntax (test parse with YAML parser if available)</step>
    <step order="8">Combine frontmatter + body content into single markdown file</step>
    <step order="9">Write to `/home/agent/shipyard-ai/.planning/blog-post-final.md`</step>
  </steps>

  <verification>
    <check type="manual">File begins with `---` and ends frontmatter with `---`</check>
    <check type="manual">Title field present and matches specification</check>
    <check type="manual">Date field in YYYY-MM-DD format</check>
    <check type="manual">Tags array contains ai, code-generation, autonomous-debugging</check>
    <check type="manual">YAML is syntactically valid (no parse errors)</check>
    <check type="manual">Format matches existing Shipyard blog posts</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Needs blog post body content" />
  </dependencies>

  <commit-message>docs(blog-pipeline): add frontmatter to blog post

Format blog post with YAML frontmatter:
- Title: Seven Plugins, Zero Errors: AI That Debugs Itself
- Date: 2026-04-15
- Tags: ai, code-generation, autonomous-debugging

Matches existing Shipyard blog format for publication.

Related: blog-plugin-pipeline PRD</commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Publication

These tasks must run sequentially after Wave 2 completes.

```xml
<task-plan id="phase-1-task-6" wave="3">
  <title>Publish Blog Post to Website Directory</title>
  <requirement>REQ-T14: Write markdown file to correct Shipyard blog directory</requirement>
  <description>
Copy the final blog post markdown file to the Shipyard website blog directory at /home/agent/shipyard-ai/website/src/app/blog/. According to Codebase Scout, blog posts are added by editing the posts array in page.tsx.

This makes the blog post available for the website build and deployment.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/blog-post-final.md" reason="Final blog post from Task 5" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/page.tsx" reason="Blog index page where posts are registered" />
    <file path="/home/agent/shipyard-ai/website/src/app/blog/" reason="Target directory for blog content" />
  </context>

  <steps>
    <step order="1">Read blog-post-final.md from Task 5</step>
    <step order="2">Read website/src/app/blog/page.tsx to understand blog post registration pattern</step>
    <step order="3">Determine appropriate filename following existing conventions (e.g., seven-plugins-zero-errors.md)</step>
    <step order="4">Write blog post file to website/src/app/blog/ directory</step>
    <step order="5">Update page.tsx posts array to include new post metadata (title, slug, date, description)</step>
    <step order="6">Verify file is in correct location with correct filename</step>
  </steps>

  <verification>
    <check type="manual">Blog post file exists in /home/agent/shipyard-ai/website/src/app/blog/</check>
    <check type="manual">Filename follows existing blog post naming conventions</check>
    <check type="manual">page.tsx posts array updated with new post entry</check>
    <check type="build">cd /home/agent/shipyard-ai/website && npm run build</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Needs final formatted blog post" />
  </dependencies>

  <commit-message>feat(blog): add "Seven Plugins, Zero Errors" blog post

Publish blog post demonstrating autonomous AI pipeline building 7
production Emdash plugins with self-correction.

Content highlights:
- 1500 words, 60% code blocks
- 3 before/after examples showing hallucinated APIs
- Board verdicts from Jensen, Warren, Shonda, Margaret Hamilton
- All 7 plugins: EventDash, MemberShip, ReviewPulse, FormForge,
  SEODash, CommerceKit, AdminPulse

Related: blog-plugin-pipeline PRD

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Git Commit & Push Blog Post</title>
  <requirement>REQ-T15, REQ-T16: Commit blog post to Git and push to remote</requirement>
  <description>
Commit the new blog post to the shipyard-ai Git repository and push to remote. This completes the delivery of the blog post deliverable.

Per PRD success criteria: "Blog post published to the correct directory, committed and pushed."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/website/src/app/blog/" reason="Blog directory containing new post" />
  </context>

  <steps>
    <step order="1">Verify git working directory is clean except for new blog post files</step>
    <step order="2">Stage blog post file: `git add website/src/app/blog/`</step>
    <step order="3">Commit with message from Task 6</step>
    <step order="4">Push to remote: `git push`</step>
    <step order="5">Verify push succeeded (no "ahead" state)</step>
  </steps>

  <verification>
    <check type="build">git log -1 --oneline</check>
    <check type="manual">Latest commit shows blog post addition</check>
    <check type="build">git status</check>
    <check type="manual">Working tree clean, no unpushed commits</check>
    <check type="build">git log --oneline --graph -5</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Needs blog post published to website directory first" />
  </dependencies>

  <commit-message>chore(blog-pipeline): complete blog post publication

Final commit for blog-plugin-pipeline deliverable.
Blog post committed and pushed to remote repository.

All success criteria met:
✅ 1200-1800 words (target ~1500)
✅ 60% code blocks, 40% narrative
✅ Before/after code comparisons
✅ Board verdicts integrated
✅ Proper markdown format with frontmatter
✅ Published to correct directory
✅ Committed and pushed

Related: blog-plugin-pipeline PRD</commit-message>
</task-plan>
```

---

## Risk Notes

### High-Risk Areas (from Risk Scanner)

1. **Content Quality is Critical Path**
   - Per decisions.md: "The hard part is the writing quality, not the technical execution."
   - Mitigation: Task 4 includes explicit voice verification steps and emotion check
   - Review: Human review recommended before Task 7 (git push)

2. **Insufficient Before/After Examples**
   - Only EventDash and MemberShip have complete board verdicts
   - Mitigation: Task 1 surveys all 7 plugins; Task 2 extracts pattern documentation
   - Fallback: Use QA pass files if board verdicts are sparse

3. **Board Verdicts May Be Sparse**
   - Risk: Generic architectural feedback instead of specific plugin QA
   - Mitigation: Task 3 cross-references multiple sources (board-verdict.md, decisions.md, QA passes)
   - Fallback: Paraphrase from decisions.md pattern descriptions

### Medium-Risk Areas

1. **Scope Creep Precedent**
   - The finish-plugins round suffered from scope expansion
   - Mitigation: REQ-N1 through REQ-N6 explicitly define what does NOT ship
   - Lock: ONE markdown file deliverable only

2. **Auto-Commit Without Review**
   - Risk: Publishing unreviewed content
   - Mitigation: Generate to `.planning/` first, review before Task 6
   - Option: Commit to feature branch, create PR for review

### Low-Risk Areas

1. **Execution Time <60 Seconds**
   - Technical execution is straightforward (file reads + writing)
   - Parallel I/O in Wave 1 optimizes performance
   - Not a failure condition if sequential execution takes longer

2. **Technical Integrity**
   - Codebase is clean (no TODOs/FIXMEs)
   - EMDASH-GUIDE.md provides authoritative API reference
   - Code snippets are authentic (traceable to source files)

---

## Execution Strategy

### Wave 1: Parallel Research (Est. 30-45 min)
- Launch Tasks 1, 2, 3 simultaneously
- Each task writes to separate `.planning/` file
- No cross-dependencies

### Wave 2: Content Creation (Est. 2-3 hours)
- Task 4 (blog content) depends on all Wave 1 tasks
- Task 5 (frontmatter) depends on Task 4
- Task 4 is the critical path (content quality)
- Allocate 80% effort to Task 4

### Wave 3: Publication (Est. 15-30 min)
- Task 6 (publish to website) sequential after Task 5
- Task 7 (git commit/push) sequential after Task 6
- Optional: Human review checkpoint before Task 7

**Total Estimated Time:** 3-4.5 hours (within 30 min engineering + 3 hours writing guideline from decisions.md)

---

## Quality Checkpoints

### After Wave 1 (Research Complete)
- [ ] code-examples.md contains 2-3 compelling before/after pairs
- [ ] hallucination-patterns.md has quantitative data (235+ violations, etc.)
- [ ] board-verdicts.md has attributed quotes from board members

### After Task 4 (Content Written)
- [ ] Opening hook matches specification
- [ ] Word count: 1200-1800 words
- [ ] Code ratio: ≥60% by character count
- [ ] Voice: Zero hedging language
- [ ] Emotion: "Relief mixed with envy" present
- [ ] All 7 plugins listed by name

### Before Task 7 (Pre-Publish Review)
- [ ] Frontmatter is valid YAML
- [ ] File matches existing blog format
- [ ] No scope creep (no extra files/features)
- [ ] First paragraph passes "stop scrolling" test

---

## Success Metrics (from decisions.md)

### Technical Success
- ✅ Execution time: <60 seconds (aspirational, not required)
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
- ✅ Zero hedging language

### Distribution Success (Post-Ship)
- Target: 1,000+ views in first week
- Target: 10+ shares on HN/Reddit
- Target: 5+ inbound questions about the pipeline

---

**Planning Phase Complete. Ready for Execution.**

*Per decisions.md: "Ship the markdown file. This is a demo, not a diary. Code carries the story."*
