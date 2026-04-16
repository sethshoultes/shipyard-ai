# Phase 1 Plan — worker_loaders Binding Fix

**Generated**: 2026-04-16
**Requirements**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-73.md`
**Total Tasks**: 3
**Waves**: 1 (all tasks execute sequentially due to dependencies)
**Target Timeline**: <1 hour (24-hour max per Decision 1)

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Priority |
|-------------|---------|------|----------|
| REQ-1: Add worker_loaders binding | phase-1-task-1 | 1 | P0 |
| REQ-2: Binding name MUST be LOADER | phase-1-task-1 | 1 | P0 |
| REQ-3: Binding required (not optional) | phase-1-task-1 | 1 | P0 |
| REQ-4: No custom binding names | phase-1-task-1 | 1 | P0 |
| REQ-5: Build must succeed | phase-1-task-2 | 1 | P0 |
| REQ-6: Deploy verification | phase-1-task-2 | 1 | P0 |
| REQ-7: Changes must be committed | phase-1-task-3 | 1 | P0 |
| REQ-8-10: Error handling (Phase 2) | N/A | 2 | Deferred |
| REQ-11-12: Documentation | phase-1-task-1 | 1 | P0 |
| REQ-13-14: Instrumentation (Phase 2) | N/A | 2 | Deferred |

---

## Wave Execution Order

### Wave 1 (Sequential Execution — Dependencies Between Tasks)

All three tasks must execute in order:
1. **phase-1-task-1**: Add worker_loaders binding and create documentation
2. **phase-1-task-2**: Build and deploy verification (depends on task-1)
3. **phase-1-task-3**: Commit changes to repository (depends on tasks 1 & 2)

**Estimated Total Time**: 15-20 minutes

---

## Task Plans

<task-plan id="phase-1-task-1" wave="1">
  <title>Add worker_loaders Binding to wrangler.jsonc</title>
  <requirement>REQ-1, REQ-2, REQ-3, REQ-4, REQ-11, REQ-12: Add `worker_loaders` binding with exact structure; binding name must be LOADER; provide one-line documentation</requirement>
  <description>
    This task adds the missing `worker_loaders` binding to sunrise-yoga's wrangler.jsonc configuration file, enabling sandboxed plugins to load in production. The binding name is locked to "LOADER" per Emdash conventions (EMDASH-GUIDE.md Section 6).

    **Why this matters**: Without this binding, the membership plugin fails with INTERNAL_ERROR in production, breaking the promise to users that plugins work.

    **Technical context**: The worker_loaders binding provisions a Dynamic Worker Loader that @emdash-cms/cloudflare uses to execute plugin sandbox-entry.ts in isolated V8 contexts with enforced capability restrictions.

    **Documentation requirement**: Per Decision 3 (Configuration Approach) and Decision 5 (Design Philosophy), documentation must be surgical, one-step instructions: "Add this. Deploy. Done." No explanations of why.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Target file that needs worker_loaders binding added" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Lines 1005-1013 define canonical worker_loaders configuration syntax" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-73/decisions.md" reason="Decision 3 locks binding name to LOADER, Decision 2 establishes fail-fast philosophy" />
    <file path="/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-73.md" reason="Lines 16-22 specify exact fix and verification steps" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/blog-cloudflare/wrangler.jsonc" reason="Reference implementation showing correct binding structure" />
    <file path="/home/agent/shipyard-ai/examples/emdash-templates/starter-cloudflare/wrangler.jsonc" reason="Reference implementation showing correct binding structure" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/docs/EMDASH-GUIDE.md lines 1005-1013 to verify exact binding syntax required</step>
    <step order="2">Read /home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc to understand current configuration structure</step>
    <step order="3">Read /home/agent/shipyard-ai/examples/emdash-templates/blog-cloudflare/wrangler.jsonc as reference for correct placement</step>
    <step order="4">Edit /home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc to add worker_loaders binding AFTER the observability section with exact structure: "worker_loaders": [{ "binding": "LOADER" }]</step>
    <step order="5">Verify JSON syntax is valid (no trailing commas, proper nesting)</step>
    <step order="6">Create inline documentation comment in wrangler.jsonc above the binding explaining: "Required for sandboxed plugins per EMDASH-GUIDE.md Section 6"</step>
    <step order="7">Verify documentation is concise and contains no philosophical explanations per REQ-12</step>
  </steps>

  <verification>
    <check type="manual">Grep for "worker_loaders" in wrangler.jsonc: grep -q '"worker_loaders"' examples/sunrise-yoga/wrangler.jsonc && echo "PASS" || echo "FAIL"</check>
    <check type="manual">Verify binding name is exactly "LOADER": grep -q '"binding": "LOADER"' examples/sunrise-yoga/wrangler.jsonc && echo "PASS" || echo "FAIL"</check>
    <check type="manual">Validate JSON syntax: jq empty examples/sunrise-yoga/wrangler.jsonc && echo "VALID" || echo "INVALID"</check>
    <check type="manual">Visual inspection of wrangler.jsonc matches EMDASH-GUIDE.md Section 6 canonical format</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is the first task -->
  </dependencies>

  <commit-message>fix(sunrise-yoga): add worker_loaders binding for sandboxed plugins

Add missing worker_loaders binding to wrangler.jsonc to enable
sandboxed plugin execution in production. Without this binding,
the membership plugin fails with INTERNAL_ERROR.

Per EMDASH-GUIDE.md Section 6, sandboxed plugins require:
"worker_loaders": [{ "binding": "LOADER" }]

Fixes #73

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Build and Deploy Verification</title>
  <requirement>REQ-5, REQ-6: Build must succeed after adding binding; Deploy verification must confirm plugins load successfully</requirement>
  <description>
    This task verifies that the worker_loaders binding addition doesn't break the build process and that the deployed Worker successfully loads sandboxed plugins in a production-like environment.

    **Why this matters**: Per Decision 2 (Fail-Fast Philosophy), we must catch configuration errors before deployment, not at runtime. This task proves the fix works end-to-end.

    **Success criteria**: Build exits with code 0, deployment succeeds, plugin manifest endpoint returns 200 OK (not 500 INTERNAL_ERROR), membership plugin routes are accessible.

    **Testing approach**: Run build locally, deploy to Cloudflare Workers dev environment, smoke test plugin routes with curl.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/package.json" reason="Contains build and deployment scripts" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Modified file that needs verification" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Configures membership plugin that depends on worker_loaders binding" />
    <file path="/home/agent/shipyard-ai/.env" reason="Contains CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for deployment" />
    <file path="/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-73.md" reason="Lines 47-50 specify exact verification commands" />
  </context>

  <steps>
    <step order="1">Read package.json to understand build and deploy scripts</step>
    <step order="2">Navigate to examples/sunrise-yoga directory</step>
    <step order="3">Run build command: npm run build</step>
    <step order="4">Verify build exits with code 0 (success)</step>
    <step order="5">Check that dist/ directory was created with client and server subdirectories</step>
    <step order="6">Source environment variables: source /home/agent/shipyard-ai/.env</step>
    <step order="7">Export CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID for wrangler</step>
    <step order="8">Deploy to Cloudflare Workers: npx wrangler deploy</step>
    <step order="9">Verify deployment succeeds without binding-related errors</step>
    <step order="10">Smoke test plugin manifest endpoint: curl -I https://sunrise-yoga.seth-a02.workers.dev/_emdash/api/manifest</step>
    <step order="11">Verify HTTP response is 200 OK (not 500 INTERNAL_ERROR)</step>
    <step order="12">Log deployment URL and timestamp for monitoring</step>
  </steps>

  <verification>
    <check type="build">cd examples/sunrise-yoga && npm run build (exit code 0 = success)</check>
    <check type="test">dist/client and dist/server directories exist post-build</check>
    <check type="manual">npx wrangler deploy outputs success message without errors</check>
    <check type="manual">curl -I https://sunrise-yoga.seth-a02.workers.dev/_emdash/api/manifest returns HTTP 200</check>
    <check type="manual">Check Cloudflare Workers logs for plugin initialization success (no "Worker Loader not available" errors)</check>
    <check type="manual">Verify membership plugin admin pages are accessible in /_emdash/admin/plugins/membership</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Build and deploy require worker_loaders binding to exist in wrangler.jsonc" />
  </dependencies>

  <commit-message>test(sunrise-yoga): verify worker_loaders binding enables plugin loading

Confirm build succeeds and plugins load in production after adding
worker_loaders binding. Smoke tests verify:
- npm run build exits successfully
- wrangler deploy completes without errors
- Plugin manifest endpoint returns 200 OK
- Membership plugin routes accessible

Relates to #73

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Commit Changes to Repository</title>
  <requirement>REQ-7: Changes must be committed to repository</requirement>
  <description>
    This task commits the worker_loaders binding addition to the repository, ensuring the fix is tracked in version control and can be deployed to production.

    **Why this matters**: Version control ensures the fix persists and can be audited, rolled back if necessary, and deployed consistently across environments.

    **Commit structure**: Follow conventional commits format with clear description of what changed and why. Include "Fixes #73" for GitHub issue linking.

    **Context preservation**: The commit message must explain the technical context (sandboxed plugins require worker_loaders) so future developers understand why this binding exists.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc" reason="Modified file to be committed" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-73/decisions.md" reason="Reference for commit message context" />
    <file path="/home/agent/shipyard-ai/CLAUDE.md" reason="Git safety protocol and commit guidelines (lines 135-177)" />
  </context>

  <steps>
    <step order="1">Run git status to see all untracked and modified files</step>
    <step order="2">Run git diff to review exact changes being committed</step>
    <step order="3">Verify only intentional files are modified (wrangler.jsonc only)</step>
    <step order="4">Stage modified file: git add examples/sunrise-yoga/wrangler.jsonc</step>
    <step order="5">Draft commit message following conventional commits format: fix(sunrise-yoga): add worker_loaders binding for sandboxed plugins</step>
    <step order="6">Include detailed body explaining what worker_loaders does and why it's required</step>
    <step order="7">Reference GitHub issue: Fixes #73</step>
    <step order="8">Add co-author attribution: Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</step>
    <step order="9">Commit changes using HEREDOC format for message (per CLAUDE.md example)</step>
    <step order="10">Run git status post-commit to verify clean working tree</step>
    <step order="11">Run git log to confirm commit was created successfully</step>
  </steps>

  <verification>
    <check type="manual">git log -1 --oneline shows commit with "fix(sunrise-yoga)" prefix</check>
    <check type="manual">git show HEAD displays correct file changes (only wrangler.jsonc)</check>
    <check type="manual">Commit message includes "Fixes #73" for issue linkage</check>
    <check type="manual">git status shows working tree clean after commit</check>
    <check type="manual">git log -1 --format='%an %ae' confirms commit author attribution</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Changes must exist before they can be committed" />
    <depends-on task-id="phase-1-task-2" reason="Verification must pass before committing to ensure changes work" />
  </dependencies>

  <commit-message>fix(sunrise-yoga): add worker_loaders binding for sandboxed plugins

Add missing worker_loaders binding to wrangler.jsonc to enable
sandboxed plugin execution in production. Without this binding,
the membership plugin fails with INTERNAL_ERROR.

Per EMDASH-GUIDE.md Section 6, sandboxed plugins require:
"worker_loaders": [{ "binding": "LOADER" }]

This binding provisions a Dynamic Worker Loader that the Cloudflare
Workers runtime uses to execute plugin sandbox-entry.ts in isolated
V8 contexts with enforced capability restrictions.

Build and deploy verification completed successfully:
- npm run build: ✓ success
- wrangler deploy: ✓ success
- Plugin manifest endpoint: ✓ 200 OK
- Membership plugin routes: ✓ accessible

Fixes #73

Co-Authored-By: Claude Sonnet 4.5 &lt;noreply@anthropic.com&gt;</commit-message>
</task-plan>

---

## Risk Notes

### High-Risk Items (From Risk Scanner Report)

1. **INCOMPLETE FIX: Regression Risk**
   - **Issue**: The binding was added in commit 9f8ed83 but disappeared in commit 219c660
   - **Root cause**: Unknown why configuration regressed
   - **Mitigation**: After committing, verify binding persists in HEAD and is not overwritten by build pipeline
   - **Action**: Audit git history for branch divergence, check if build process overwrites wrangler.jsonc

2. **CLOUDFLARE PAGES vs WORKERS Compatibility**
   - **Issue**: Deploy script uses `wrangler pages deploy` (Cloudflare Pages), but worker_loaders is a Workers feature
   - **Risk**: Binding may not work with Pages SSR deployment
   - **Mitigation**: Verify during phase-1-task-2 that binding takes effect in deployed Worker
   - **Escalation**: If binding doesn't work with Pages, may need to switch to `wrangler deploy` (Workers)

3. **SILENT PRODUCTION FAILURES**
   - **Issue**: Missing binding causes generic INTERNAL_ERROR with no diagnostic context
   - **Risk**: Users see broken plugin routes, developers can't self-diagnose
   - **Mitigation**: Phase 1 fixes the immediate issue; Phase 2 adds build-time validation with clear error messages
   - **Monitoring**: Check Cloudflare Workers logs for 24 hours post-deploy for INTERNAL_ERROR occurrences

4. **NO AUTOMATED DEPLOYMENT VALIDATION**
   - **Issue**: Deploy script doesn't validate bindings exist before pushing to production
   - **Risk**: Broken deploys ship silently
   - **Mitigation**: Phase-1-task-2 manually verifies deployment; Phase 2 adds automated validation to CI/CD
   - **Action**: Add post-deploy smoke test to pipeline/deploy/deploy.sh

### Medium-Risk Items

1. **ONLY ONE SITE USING MEMBERSHIP PLUGIN**
   - **Issue**: Only sunrise-yoga imports membershipPlugin; other sites may add it later and forget binding
   - **Mitigation**: Consider adding worker_loaders to all example sites for consistency (future-proofing)
   - **Decision needed**: Does bellas-bistro, peak-dental, craft-co-studio need the binding?

2. **CONFIGURATION DRIFT**
   - **Issue**: Multiple sources of truth (wrangler.jsonc, .wrangler/state, Cloudflare dashboard)
   - **Risk**: These can diverge; unclear which one wins
   - **Mitigation**: Treat wrangler.jsonc as single source of truth; no manual dashboard bindings

### Low-Risk Items

1. **DEVELOPER CONFUSION**
   - **Issue**: Developers may not understand why binding exists
   - **Mitigation**: Clear commit message explains technical context; inline comment in wrangler.jsonc
   - **Quality gate**: Commit message must answer "what is worker_loaders and why is it required?"

---

## Phase 2 Preview (Out of Scope for This Plan)

Phase 2 (Within Days) will implement:

1. **Auto-Detection**: Build-time scan for sandboxed plugin usage
2. **Auto-Injection**: Automatically inject worker_loaders binding if plugins detected
3. **Build-Time Validation**: Fail build with clear error if binding missing when needed
4. **CI/CD Integration**: Add validation to deployment pipeline
5. **Instrumentation**: Track plugin usage and error rates (Decision 6 requirement)

**Decision Gate**: At 2-week mark post-Phase 1, review usage data. If <5% of users leverage sandboxed plugins, deprecate entire plugin system per Decision 4 kill switch.

---

## Verification Summary

| Task | Primary Verification | Success Criteria |
|------|---------------------|------------------|
| phase-1-task-1 | File inspection + JSON validation | worker_loaders binding present with exact syntax "LOADER" |
| phase-1-task-2 | Build + deploy + smoke test | npm run build succeeds, wrangler deploy succeeds, plugin manifest returns 200 |
| phase-1-task-3 | Git log + git show | Commit exists with correct files, message includes "Fixes #73" |

---

## Timeline

**Target**: <1 hour total
**Maximum**: 24 hours (per Decision 1)

| Task | Estimated Time | Dependencies |
|------|---------------|--------------|
| phase-1-task-1 | 2-7 minutes | None (START HERE) |
| phase-1-task-2 | 10 minutes | Requires task-1 complete |
| phase-1-task-3 | 3 minutes | Requires tasks 1 & 2 complete |
| **Total** | **15-20 minutes** | Sequential execution |

---

## Success Criteria (Launch Readiness)

### Phase 1 Complete When:
- [ ] worker_loaders binding present in wrangler.jsonc
- [ ] Binding name is exactly "LOADER"
- [ ] JSON syntax is valid
- [ ] Inline documentation comment added
- [ ] Build succeeds (npm run build exits 0)
- [ ] Deploy succeeds (wrangler deploy completes)
- [ ] Plugin manifest endpoint returns 200 OK
- [ ] Membership plugin routes accessible
- [ ] Changes committed to git
- [ ] Commit includes "Fixes #73"
- [ ] Zero INTERNAL_ERROR in production logs (24-hour monitor)

### Phase 1 Fails If:
- [ ] Build breaks after adding binding
- [ ] Deploy fails with binding-related errors
- [ ] Plugin routes still return 500 INTERNAL_ERROR
- [ ] Binding configuration regresses (disappears from HEAD)
- [ ] Cloudflare Pages doesn't support worker_loaders (architecture mismatch)

---

## Key References

**Critical (Read Before Execution):**
- `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (Section 6, lines 1005-1013) — Canonical worker_loaders syntax
- `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-73/decisions.md` — Locked decisions that constrain implementation
- `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-73.md` — Original issue and fix specification

**Code Patterns (Reference Implementations):**
- `/home/agent/shipyard-ai/examples/emdash-templates/blog-cloudflare/wrangler.jsonc` — Correct binding structure
- `/home/agent/shipyard-ai/examples/emdash-templates/starter-cloudflare/wrangler.jsonc` — Correct binding structure

**Configuration Files (Modify These):**
- `/home/agent/shipyard-ai/examples/sunrise-yoga/wrangler.jsonc` — Target file for binding addition

---

## Sara Blakely Customer Gut-Check

Per GSD methodology Step 7, a Sara Blakely review is auto-triggered after plan writing. However, for this infrastructure fix:

**Customer Value Assessment**: This is NOT a feature customers see directly. It's infrastructure that makes plugins work. The customer value is:
- **Promised feature works**: Plugins (membership, payments) function as advertised
- **Zero surprise**: Plugin routes don't mysteriously fail with INTERNAL_ERROR
- **Relief**: "It just works" without developers debugging binding configuration

**Would a real customer pay for this?** No — customers expect plugins to work. This is fixing a broken promise, not adding new value.

**Gut-check verdict**: ✅ Ship immediately. This is stopping the bleeding, not creating new value. Per Decision 4 (Priority & Urgency), every hour of delay = users churning.

---

**Plan Status:** LOCKED
**Owner:** Engineering Team
**Review Date:** 2 weeks post-deployment (usage metrics review)
**Created:** 2026-04-16
**Approved By:** Phil Jackson (Orchestrator)

---

*"The strength of the team is each individual member. The strength of each member is the team."* — Phil Jackson, Zen Master of the Great Minds Agency
