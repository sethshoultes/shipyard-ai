# Phase 1 Plan — Intake Auto-Close (Closer)

**Generated**: 2025-01-13
**Project Slug**: intake-autoclose
**Requirements**: `.planning/REQUIREMENTS.md`
**Total Tasks**: 5
**Waves**: 3
**Estimated Timeline**: 2-4 hours

---

## The Essence

From decisions.md:

> *"Invisible. Inevitable. Complete."*

The quiet satisfaction of a door clicking shut. When you ship, the issue closes. No configuration. No retry logic. No ceremony.

---

## Problem Statement

When the daemon's GitHub intake converts an issue to a PRD and the pipeline ships it, the original GitHub issue stays open. Issues #30-33 all shipped but remained open until manually closed. The pipeline should auto-close the source issue after a successful ship.

**Ship Test (from decisions.md):**
> Does the issue close automatically when the pipeline ships?
> If yes, ship it.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-1, REQ-2, REQ-3 (Function definition) | phase-1-task-1 | 1 |
| REQ-4, REQ-5, REQ-6 (Content parsing) | phase-1-task-1 | 1 |
| REQ-7, REQ-8, REQ-9 (Shell command) | phase-1-task-1 | 1 |
| REQ-10, REQ-11 (Comment format) | phase-1-task-1 | 1 |
| REQ-12, REQ-13, REQ-14 (Error handling) | phase-1-task-1 | 1 |
| REQ-15, REQ-16, REQ-17 (Call site) | phase-1-task-2 | 1 |
| REQ-18-25 (Negative scope) | Verification | 2 |
| REQ-26, REQ-27, REQ-28 (Manual tests) | phase-1-task-3 | 2 |
| REQ-29 (TypeScript compile) | phase-1-task-4 | 2 |
| REQ-30, REQ-31 (Commit & deploy) | phase-1-task-5 | 3 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Implementation

Two tasks that implement the core functionality. Can be done by a single developer sequentially, or task-1 must complete before task-2.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Add closeSourceIssue() function to pipeline.ts</title>
  <requirement>REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-9, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14</requirement>
  <description>
    Create the closeSourceIssue() function that parses PRD content for GitHub issue
    metadata and closes the source issue via gh CLI. This is the core implementation
    task covering function definition, content parsing, shell command, comment format,
    and error handling.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="Target file for function addition; contains existing execSync patterns (lines 312-323)" />
    <file path="/home/agent/great-minds-plugin/daemon/src/health.ts" reason="Contains convertIssueToPRD() showing PRD format (lines 227-255); contains gh CLI patterns (lines 169-172)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Full specification including regex pattern and comment format" />
    <file path="/home/agent/shipyard-ai/rounds/intake-autoclose/decisions.md" reason="Locked decisions on architecture, comment format, error handling" />
  </context>

  <steps>
    <step order="1">Add readFileSync to existing fs import on line 8:
      Change: import { existsSync } from "fs";
      To: import { existsSync, readFileSync } from "fs";
    </step>
    <step order="2">Add closeSourceIssue() function after line 44 (after setCurrentProject function), approximately 15 lines:
      ```typescript
      /**
       * Close the source GitHub issue after successful pipeline ship.
       * Parses PRD content for issue metadata, calls gh CLI to close.
       * Non-fatal: logs errors but does not throw.
       */
      function closeSourceIssue(prdContent: string, projectName: string): void {
        const issueMatch = prdContent.match(/Auto-generated from GitHub issue (.+)#(\d+)/);
        if (!issueMatch) {
          log(`CLOSER: Not a GitHub-sourced PRD — skipping`);
          return;
        }

        const repo = issueMatch[1];
        const issueNumber = issueMatch[2];

        try {
          execSync(
            `gh issue close ${issueNumber} --repo "${repo}" --comment "Shipped via Great Minds pipeline. Project: ${projectName}"`,
            { encoding: "utf-8", timeout: 15_000 }
          );
          log(`CLOSER: Closed GitHub issue ${repo}#${issueNumber}`);
        } catch (err) {
          log(`CLOSER: Failed to close ${repo}#${issueNumber}: ${err}`);
          // Non-fatal — pipeline continues
        }
      }
      ```
    </step>
    <step order="3">Verify function signature matches REQ-2: closeSourceIssue(prdContent: string, projectName: string): void</step>
    <step order="4">Verify regex pattern matches REQ-4: /Auto-generated from GitHub issue (.+)#(\d+)/</step>
    <step order="5">Verify comment text matches REQ-10: "Shipped via Great Minds pipeline. Project: {project}"</step>
    <step order="6">Verify timeout matches REQ-9: 15_000</step>
    <step order="7">Verify error handling matches REQ-12-14: try-catch with log, no throw</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit (in daemon/ directory)</check>
    <check type="manual">Function exists in pipeline.ts with correct signature</check>
    <check type="manual">Regex pattern matches PRD format from health.ts line 234</check>
    <check type="manual">Comment text is single line, professional, no emojis</check>
    <check type="manual">Error handling logs but does not throw</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(daemon): add closeSourceIssue() function for intake auto-close

Add function to parse PRD content for GitHub issue metadata and close
the source issue via gh CLI after successful ship.

- Regex: /Auto-generated from GitHub issue (.+)#(\d+)/
- Comment: "Shipped via Great Minds pipeline. Project: {name}"
- Timeout: 15 seconds
- Error handling: log and continue (non-fatal)

Refs: REQ-1 through REQ-14

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Add call site in runPipeline() after archive</title>
  <requirement>REQ-15, REQ-16, REQ-17</requirement>
  <description>
    Add the call to closeSourceIssue() in the runPipeline() function, after the
    PRD has been successfully archived to the completed/ directory. This ensures
    issues are only closed after successful ship.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="Target file; archive location at lines 559-566" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-15-17 specifications" />
  </context>

  <steps>
    <step order="1">Locate the archive section in runPipeline() (lines 559-566):
      ```typescript
      // Archive completed PRD so daemon doesn't rebuild it
      const prdPath = resolve(PRDS_DIR, prdFile);
      const archiveDir = resolve(PRDS_DIR, "completed");
      await mkdir(archiveDir, { recursive: true });
      const archivePath = resolve(archiveDir, prdFile);
      const { rename } = await import("fs/promises");
      await rename(prdPath, archivePath).catch(() => {});
      log(`ARCHIVE: Moved ${prdFile} to prds/completed/`);
      ```
    </step>
    <step order="2">After line 566 (the log statement), add the closeSourceIssue() call:
      ```typescript
      // Close source GitHub issue (non-fatal if fails)
      try {
        const archivedContent = readFileSync(archivePath, "utf-8");
        closeSourceIssue(archivedContent, project);
      } catch (err) {
        log(`CLOSER: Failed to read archived PRD: ${err}`);
      }
      ```
    </step>
    <step order="3">Verify the call site is AFTER successful archive (inside try block)</step>
    <step order="4">Verify the call site is BEFORE pipeline completion notification (line 568)</step>
    <step order="5">Verify only one call site exists (grep for closeSourceIssue)</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit (in daemon/ directory)</check>
    <check type="test">grep -n "closeSourceIssue" pipeline.ts shows exactly 2 matches (definition + call)</check>
    <check type="manual">Call site is after archive, before completion notification</check>
    <check type="manual">Call site uses archived PRD content (archivePath), not original</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Function must exist before call site" />
  </dependencies>

  <commit-message>feat(daemon): call closeSourceIssue() after archive in runPipeline()

Add call site for issue closure in runPipeline() after successful
PRD archive. Reads archived PRD content to extract issue metadata.

- Location: after archive log, before completion notification
- Single call site as per REQ-16
- Only runs after successful ship as per REQ-17

Refs: REQ-15, REQ-16, REQ-17

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Verification

Two tasks for testing and verification.

```xml
<task-plan id="phase-1-task-3" wave="2">
  <title>Manual test with real GitHub issue</title>
  <requirement>REQ-26, REQ-27, REQ-28</requirement>
  <description>
    Manually verify the feature works with a real GitHub issue. Test both
    the happy path (GitHub-sourced PRD) and edge cases (non-GitHub PRD,
    already-closed issue).
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/src/pipeline.ts" reason="Implementation to test" />
    <file path="/home/agent/shipyard-ai/prds/" reason="Location for test PRDs" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Success criteria REQ-26-28" />
  </context>

  <steps>
    <step order="1">Create a test GitHub issue in sethshoultes/shipyard-ai repo with p1 label</step>
    <step order="2">Wait for intake to convert issue to PRD (or manually trigger)</step>
    <step order="3">Verify PRD contains "Auto-generated from GitHub issue" line</step>
    <step order="4">Run pipeline manually or wait for daemon to process</step>
    <step order="5">After pipeline completes, check GitHub issue is closed</step>
    <step order="6">Verify close comment is "Shipped via Great Minds pipeline. Project: {slug}"</step>
    <step order="7">Test edge case: manually create PRD without GitHub marker, verify no close attempt</step>
    <step order="8">Test edge case: close the issue manually first, then run pipeline, verify graceful handling</step>
  </steps>

  <verification>
    <check type="manual">GitHub issue is closed after successful pipeline ship (REQ-26)</check>
    <check type="manual">Non-GitHub PRDs are unaffected — no close attempt (REQ-27)</check>
    <check type="manual">Daemon logs show appropriate messages for each case</check>
    <check type="manual">Already-closed issues handled gracefully (no crash)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Function must be implemented" />
    <depends-on task-id="phase-1-task-2" reason="Call site must be added" />
  </dependencies>

  <commit-message>test(daemon): verify intake auto-close with real GitHub issue

Manual testing completed:
- GitHub-sourced PRD closes source issue on ship
- Non-GitHub PRDs skip closure silently
- Already-closed issues handled gracefully

Refs: REQ-26, REQ-27, REQ-28

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>TypeScript compilation and negative scope verification</title>
  <requirement>REQ-18, REQ-19, REQ-20, REQ-21, REQ-22, REQ-23, REQ-24, REQ-25, REQ-29</requirement>
  <description>
    Verify TypeScript compiles without errors and that the implementation
    adheres to the negative scope requirements (no new files, no retry logic,
    no config options, etc.).
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/daemon/" reason="Daemon source directory" />
    <file path="/home/agent/great-minds-plugin/daemon/package.json" reason="Dependencies check" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Negative scope requirements REQ-18-25" />
  </context>

  <steps>
    <step order="1">Run TypeScript compilation:
      cd /home/agent/great-minds-plugin/daemon && npx tsc --noEmit
    </step>
    <step order="2">Verify no new files created (REQ-18):
      git status --short should show only pipeline.ts modified
    </step>
    <step order="3">Verify no retry logic (REQ-19):
      grep -n "retry\|backoff\|attempt" pipeline.ts should not match closeSourceIssue
    </step>
    <step order="4">Verify no config options (REQ-20):
      No new environment variables or config imports added
    </step>
    <step order="5">Verify no async workers (REQ-21):
      closeSourceIssue uses execSync, not async/await
    </step>
    <step order="6">Verify no webhooks (REQ-22):
      No webhook handlers or listeners added
    </step>
    <step order="7">Verify no label changes (REQ-23):
      gh issue close command only, no gh issue edit
    </step>
    <step order="8">Verify simple comment (REQ-24):
      Comment is hardcoded string, no template engine
    </step>
    <step order="9">Verify no new dependencies (REQ-25):
      git diff package.json shows no changes
    </step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit exits with code 0</check>
    <check type="test">git status shows only pipeline.ts modified</check>
    <check type="test">package.json unchanged</check>
    <check type="manual">All negative scope requirements verified</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Implementation must be complete" />
    <depends-on task-id="phase-1-task-2" reason="Call site must be added" />
  </dependencies>

  <commit-message>chore(daemon): verify TypeScript compilation and negative scope

Verification completed:
- TypeScript compiles without errors
- No new files created (only pipeline.ts modified)
- No retry logic, no config options, no async workers
- No webhooks, no label changes, no new dependencies

Refs: REQ-18 through REQ-25, REQ-29

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Sequential, after Wave 2) — Deploy

Final task for commit and service restart.

```xml
<task-plan id="phase-1-task-5" wave="3">
  <title>Commit changes and restart service</title>
  <requirement>REQ-30, REQ-31</requirement>
  <description>
    Commit all changes to the great-minds-plugin repo, push to GitHub,
    and restart the shipyard-daemon service to activate the new feature.
  </description>

  <context>
    <file path="/home/agent/great-minds-plugin/" reason="Target repo for commit" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-30, REQ-31 specifications" />
  </context>

  <steps>
    <step order="1">Stage all changes:
      cd /home/agent/great-minds-plugin && git add -A
    </step>
    <step order="2">Create commit with conventional commit message:
      ```
      git commit -m "feat(daemon): auto-close GitHub issues after pipeline ship

      When the daemon's GitHub intake converts an issue to a PRD and the
      pipeline ships it, the original GitHub issue now auto-closes with
      a comment: 'Shipped via Great Minds pipeline. Project: {name}'

      Implementation:
      - Single function closeSourceIssue() in pipeline.ts (~15 lines)
      - Single call site after PRD archive in runPipeline()
      - Content parsing via regex (not filename)
      - 15-second timeout, non-fatal error handling

      Closes: shipyard-ai intake-autoclose

      Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
      ```
    </step>
    <step order="3">Push to GitHub:
      git push origin main
    </step>
    <step order="4">Restart the daemon service:
      sudo systemctl restart shipyard-daemon.service
    </step>
    <step order="5">Verify service is running:
      sudo systemctl status shipyard-daemon.service
    </step>
    <step order="6">Check daemon logs for startup:
      sudo journalctl -u shipyard-daemon.service -n 20
    </step>
  </steps>

  <verification>
    <check type="test">git log -1 shows the commit</check>
    <check type="test">git push succeeds</check>
    <check type="test">systemctl status shows active (running)</check>
    <check type="manual">Daemon logs show successful startup</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Manual testing must pass" />
    <depends-on task-id="phase-1-task-4" reason="Compilation must succeed" />
  </dependencies>

  <commit-message>deploy(daemon): restart service with intake auto-close feature

Service restarted with new auto-close feature active.

Refs: REQ-30, REQ-31

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **gh CLI Authentication** — The daemon assumes `gh` CLI is installed and authenticated. If not, the close command will fail, but error handling ensures pipeline continues. Clear error messages logged.

2. **Already-Closed Issues** — gh CLI handles gracefully; attempting to close an already-closed issue logs an error but doesn't crash.

3. **Race Conditions** — Issue closure happens AFTER archive, which is AFTER successful ship. No race condition with intake because intake marks issues as converted before pipeline starts.

4. **Feature Creep** — The decisions.md explicitly documents what does NOT ship. This plan references the negative scope requirements (REQ-18-25) to defend against scope expansion.

---

## Summary

| Wave | Tasks | Description | Est. Duration |
|------|-------|-------------|---------------|
| Wave 1 (Sequential) | 2 tasks | Function + Call site | 1-2 hours |
| Wave 2 (Parallel) | 2 tasks | Testing + Verification | 30 mins |
| Wave 3 (Sequential) | 1 task | Commit + Deploy | 15 mins |
| **Total** | **5 tasks** | | **2-4 hours** |

**Critical Path:** Task 1 -> Task 2 -> Tasks 3 & 4 (parallel) -> Task 5

---

## Files Modified

| File | Change | Lines Added |
|------|--------|-------------|
| `/home/agent/great-minds-plugin/daemon/src/pipeline.ts` | Add closeSourceIssue() function + call site | ~20 |

**Files NOT Modified (per REQ-18):**
- No new files created
- No changes to health.ts
- No changes to config.ts
- No changes to package.json

---

## Success Criteria

From decisions.md "Final Alignment":

> **Elon:** "Ship the PRD as written, with Steve's comment format. Everything else is decoration."
> **Steve:** "Ship it right. Then move on."

**Verification Checklist:**
- [ ] closeSourceIssue() function exists in pipeline.ts
- [ ] Call site exists after archive in runPipeline()
- [ ] GitHub issue closes automatically when pipeline ships
- [ ] Non-GitHub PRDs are unaffected
- [ ] TypeScript compiles without errors
- [ ] No new files, no new dependencies
- [ ] Service restarted and running

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2025-01-13*
