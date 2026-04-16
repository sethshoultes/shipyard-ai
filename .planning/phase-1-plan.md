# Phase 1 Plan — Fix Plugin Entrypoints

**Generated**: 2026-04-16
**Requirements**: /home/agent/shipyard-ai/prds/fix-plugin-entrypoints.md
**Total Tasks**: 6
**Waves**: 2

## Executive Summary

This is a p0 hotfix to fix broken npm-alias entrypoints in 4 Emdash plugins and register all 6 working plugins in Sunrise Yoga. The npm aliases (`"@shipyard/<name>/sandbox"`) work in local dev via node_modules but fail on Cloudflare Workers, which only has access to bundled code. The fix uses file path resolution (`fileURLToPath` + `dirname` + `join`) to compute the entrypoint path at runtime. This pattern is already proven working in the membership and eventdash plugins.

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-1: Fix commercekit entrypoint | phase-1-task-1 | 1 |
| REQ-2: Fix formforge entrypoint | phase-1-task-2 | 1 |
| REQ-3: Fix reviewpulse entrypoint | phase-1-task-3 | 1 |
| REQ-4: Fix seodash entrypoint | phase-1-task-4 | 1 |
| REQ-5: Register all 6 plugins in astro.config.mjs | phase-1-task-5 | 2 |
| REQ-6: Verify build succeeds | phase-1-task-5 | 2 |

## Wave Execution Order

### Wave 1 (Parallel) — Plugin Entrypoint Fixes

These tasks are independent and can be executed in parallel:

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Fix commercekit plugin entrypoint</title>
  <requirement>REQ-1: Replace npm-alias with file path resolution in commercekit</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/commercekit/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. This ensures the entrypoint works on Cloudflare Workers where npm aliases cannot be resolved at runtime.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/commercekit/src/index.ts" reason="File to modify (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin system documentation (§6, lines 899-1158)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements and reference pattern (lines 64-82)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/commercekit/src/index.ts to understand current structure (line 26 has broken entrypoint)</step>
    <step order="2">Add imports at top of file (after existing imports, before function): `import { fileURLToPath } from "node:url";` and `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside commercekitPlugin() function, add path resolution before return statement: `const currentDir = dirname(fileURLToPath(import.meta.url));` then `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Replace line 26 `entrypoint: "@shipyard/commercekit/sandbox",` with `entrypoint: entrypointPath,`</step>
    <step order="5">Add explanatory comment above the path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/commercekit/sandbox) // The alias works in local dev via node_modules but fails in Cloudflare Workers // which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="6">Verify the pattern exactly matches /home/agent/shipyard-ai/plugins/membership/src/index.ts (lines 16-28)</step>
  </steps>

  <verification>
    <check type="build">Run `npx tsc --noEmit plugins/commercekit/src/index.ts` to verify TypeScript compilation</check>
    <check type="manual">Compare with membership plugin to ensure pattern is identical</check>
    <check type="manual">Verify sandbox-entry.ts exists at plugins/commercekit/src/sandbox-entry.ts</check>
  </verification>

  <dependencies>
    <!-- No dependencies - independent task -->
  </dependencies>

  <commit-message>fix(commercekit): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/commercekit/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

Fixes: REQ-1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Fix formforge plugin entrypoint</title>
  <requirement>REQ-2: Replace npm-alias with file path resolution in formforge</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/formforge/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. This ensures the entrypoint works on Cloudflare Workers where npm aliases cannot be resolved at runtime.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="File to modify (lines 1-37)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin system documentation (§6, lines 899-1158)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements and reference pattern (lines 64-82)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/formforge/src/index.ts to understand current structure (line 26 has broken entrypoint)</step>
    <step order="2">Add imports at top of file (after existing imports, before function): `import { fileURLToPath } from "node:url";` and `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside formforgePlugin() function, add path resolution before return statement: `const currentDir = dirname(fileURLToPath(import.meta.url));` then `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Replace line 26 `entrypoint: "@shipyard/formforge/sandbox",` with `entrypoint: entrypointPath,`</step>
    <step order="5">Add explanatory comment above the path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/formforge/sandbox) // The alias works in local dev via node_modules but fails in Cloudflare Workers // which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="6">Verify the pattern exactly matches /home/agent/shipyard-ai/plugins/membership/src/index.ts (lines 16-28)</step>
  </steps>

  <verification>
    <check type="build">Run `npx tsc --noEmit plugins/formforge/src/index.ts` to verify TypeScript compilation</check>
    <check type="manual">Compare with membership plugin to ensure pattern is identical</check>
    <check type="manual">Verify sandbox-entry.ts exists at plugins/formforge/src/sandbox-entry.ts</check>
  </verification>

  <dependencies>
    <!-- No dependencies - independent task -->
  </dependencies>

  <commit-message>fix(formforge): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/formforge/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

Fixes: REQ-2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Fix reviewpulse plugin entrypoint</title>
  <requirement>REQ-3: Replace npm-alias with file path resolution in reviewpulse</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/reviewpulse/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. This ensures the entrypoint works on Cloudflare Workers where npm aliases cannot be resolved at runtime.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts" reason="File to modify (lines 1-38)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin system documentation (§6, lines 899-1158)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements and reference pattern (lines 64-82)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts to understand current structure (line 24 has broken entrypoint)</step>
    <step order="2">Add imports at top of file (after existing imports, before function): `import { fileURLToPath } from "node:url";` and `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside reviewpulsePlugin() function, add path resolution before return statement: `const currentDir = dirname(fileURLToPath(import.meta.url));` then `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Replace line 24 `entrypoint: "@shipyard/reviewpulse/sandbox",` with `entrypoint: entrypointPath,`</step>
    <step order="5">Add explanatory comment above the path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/reviewpulse/sandbox) // The alias works in local dev via node_modules but fails in Cloudflare Workers // which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="6">Verify the pattern exactly matches /home/agent/shipyard-ai/plugins/membership/src/index.ts (lines 16-28)</step>
  </steps>

  <verification>
    <check type="build">Run `npx tsc --noEmit plugins/reviewpulse/src/index.ts` to verify TypeScript compilation</check>
    <check type="manual">Compare with membership plugin to ensure pattern is identical</check>
    <check type="manual">Verify sandbox-entry.ts exists at plugins/reviewpulse/src/sandbox-entry.ts</check>
  </verification>

  <dependencies>
    <!-- No dependencies - independent task -->
  </dependencies>

  <commit-message>fix(reviewpulse): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/reviewpulse/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

Fixes: REQ-3

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Fix seodash plugin entrypoint</title>
  <requirement>REQ-4: Replace npm-alias with file path resolution in seodash</requirement>
  <description>
    Replace the broken npm alias `entrypoint: "@shipyard/seodash/sandbox"` with file path resolution using `fileURLToPath`, `dirname`, and `join`. This ensures the entrypoint works on Cloudflare Workers where npm aliases cannot be resolved at runtime.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/index.ts" reason="File to modify (lines 1-37)" />
    <file path="/home/agent/shipyard-ai/plugins/membership/src/index.ts" reason="Reference implementation with working pattern (lines 1-41)" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin system documentation (§6, lines 899-1158)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Requirements and reference pattern (lines 64-82)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/plugins/seodash/src/index.ts to understand current structure (line 23 has broken entrypoint)</step>
    <step order="2">Add imports at top of file (after existing imports, before function): `import { fileURLToPath } from "node:url";` and `import { dirname, join } from "node:path";`</step>
    <step order="3">Inside seodashPlugin() function, add path resolution before return statement: `const currentDir = dirname(fileURLToPath(import.meta.url));` then `const entrypointPath = join(currentDir, "sandbox-entry.ts");`</step>
    <step order="4">Replace line 23 `entrypoint: "@shipyard/seodash/sandbox",` with `entrypoint: entrypointPath,`</step>
    <step order="5">Add explanatory comment above the path resolution: `// NOTE: Use real file path instead of npm alias (@shipyard/seodash/sandbox) // The alias works in local dev via node_modules but fails in Cloudflare Workers // which only has access to bundled code. Bundler resolves absolute paths correctly.`</step>
    <step order="6">Verify the pattern exactly matches /home/agent/shipyard-ai/plugins/membership/src/index.ts (lines 16-28)</step>
  </steps>

  <verification>
    <check type="build">Run `npx tsc --noEmit plugins/seodash/src/index.ts` to verify TypeScript compilation</check>
    <check type="manual">Compare with membership plugin to ensure pattern is identical</check>
    <check type="manual">Verify sandbox-entry.ts exists at plugins/seodash/src/sandbox-entry.ts</check>
  </verification>

  <dependencies>
    <!-- No dependencies - independent task -->
  </dependencies>

  <commit-message>fix(seodash): replace npm alias entrypoint with file path resolution

Replace `entrypoint: "@shipyard/seodash/sandbox"` with file path resolution
using fileURLToPath + dirname + join. The npm alias works in local dev but fails
on Cloudflare Workers which only has access to bundled code.

This matches the proven pattern in membership and eventdash plugins.

Fixes: REQ-4

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 2 (After Wave 1) — Plugin Registration & Verification

These tasks depend on Wave 1 completing successfully:

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Register all 6 plugins in Sunrise Yoga and verify build</title>
  <requirement>REQ-5, REQ-6: Register all 6 working plugins in astro.config.mjs and verify build succeeds</requirement>
  <description>
    Update the Sunrise Yoga astro.config.mjs to import and register all 6 working plugins (membership, eventdash, commercekit, formforge, reviewpulse, seodash). The 2 already-registered plugins (membership, eventdash) stay as-is. Add the 4 newly-fixed plugins and verify the build completes without errors. If any plugin fails to build, remove it from the config and document the failure.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="File to modify (lines 1-24)" />
    <file path="/home/agent/shipyard-ai/plugins/commercekit/src/index.ts" reason="Verify export name: commercekitPlugin" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="Verify export name: formforgePlugin" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts" reason="Verify export name: reviewpulsePlugin" />
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/index.ts" reason="Verify export name: seodashPlugin" />
    <file path="/home/agent/shipyard-ai/prds/fix-plugin-entrypoints.md" reason="PRD with exact import pattern (lines 54-74)" />
  </context>

  <steps>
    <step order="1">Read /home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs to understand current structure (lines 6-7 have membership and eventdash imports)</step>
    <step order="2">Add 4 new imports after line 7: `import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";`, `import { formforgePlugin } from "../../plugins/formforge/src/index.js";`, `import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";`, `import { seodashPlugin } from "../../plugins/seodash/src/index.js";`</step>
    <step order="3">Update the plugins array at line 18 to include all 6 plugins: `plugins: [membershipPlugin(), eventdashPlugin(), commercekitPlugin(), formforgePlugin(), reviewpulsePlugin(), seodashPlugin()],`</step>
    <step order="4">Run build incrementally: First with just membership + eventdash (baseline), then add commercekit and build, then add formforge and build, etc. This identifies which plugin (if any) causes build failure.</step>
    <step order="5">Run final build: `cd examples/sunrise-yoga && npm run build 2>&1 | tee build.log && tail -5 build.log`</step>
    <step order="6">If build fails, check build.log for the failing plugin, remove it from astro.config.mjs, and document which plugin failed and why</step>
    <step order="7">If build succeeds, verify build output shows all plugins were loaded successfully</step>
  </steps>

  <verification>
    <check type="build">Run `cd examples/sunrise-yoga && npm run build` - must complete with exit code 0</check>
    <check type="manual">Check build output for "emdash:plugins" log lines showing all 6 plugins registered</check>
    <check type="manual">Verify no plugin import errors or "Cannot find module" errors in build log</check>
    <check type="build">Run `ls examples/sunrise-yoga/dist` to verify dist folder was created successfully</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="commercekit entrypoint must be fixed before registration" />
    <depends-on task-id="phase-1-task-2" reason="formforge entrypoint must be fixed before registration" />
    <depends-on task-id="phase-1-task-3" reason="reviewpulse entrypoint must be fixed before registration" />
    <depends-on task-id="phase-1-task-4" reason="seodash entrypoint must be fixed before registration" />
  </dependencies>

  <commit-message>feat(sunrise-yoga): register all 6 Emdash plugins

Added 4 new plugins to Sunrise Yoga astro.config.mjs:
- commercekit (e-commerce)
- formforge (form builder)
- reviewpulse (review aggregation)
- seodash (SEO management)

All plugins now use file path entrypoints (compatible with Cloudflare Workers).
Build verified successful with all 6 plugins registered.

Fixes: REQ-5, REQ-6

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="2">
  <title>Commit and push all changes</title>
  <requirement>REQ-10: Commit all changes with descriptive message and push to remote</requirement>
  <description>
    After all plugin entrypoint fixes and astro.config updates are complete and verified, commit the changes to git with a comprehensive commit message and push to the remote repository.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/commercekit/src/index.ts" reason="Modified file" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="Modified file" />
    <file path="/home/agent/shipyard-ai/plugins/reviewpulse/src/index.ts" reason="Modified file" />
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/index.ts" reason="Modified file" />
    <file path="/home/agent/shipyard-ai/examples/sunrise-yoga/astro.config.mjs" reason="Modified file" />
    <file path="/home/agent/shipyard-ai/CLAUDE.md" reason="Git commit guidelines (lines 141-151)" />
  </context>

  <steps>
    <step order="1">Run `git status` to verify 5 files are modified and no other unexpected changes exist</step>
    <step order="2">Run `git diff HEAD` to review all changes before committing</step>
    <step order="3">Run `git add plugins/commercekit/src/index.ts plugins/formforge/src/index.ts plugins/reviewpulse/src/index.ts plugins/seodash/src/index.ts examples/sunrise-yoga/astro.config.mjs` to stage all modified files</step>
    <step order="4">Create commit with conventional commit format using HEREDOC to ensure proper formatting</step>
    <step order="5">Run `git log -1` to verify commit was created with correct message</step>
    <step order="6">Run `git push` to push changes to remote repository</step>
    <step order="7">Verify push succeeded by checking git status shows "Your branch is up to date"</step>
  </steps>

  <verification>
    <check type="build">Run `git status` - should show clean working tree after commit and push</check>
    <check type="build">Run `git log -1 --oneline` - should show commit with "fix:" or "feat:" prefix</check>
    <check type="build">Run `git status` after push - should show "Your branch is up to date with 'origin/...'"</check>
    <check type="manual">Verify commit appears in remote repository (GitHub/GitLab)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Must commit after all code changes complete" />
    <depends-on task-id="phase-1-task-2" reason="Must commit after all code changes complete" />
    <depends-on task-id="phase-1-task-3" reason="Must commit after all code changes complete" />
    <depends-on task-id="phase-1-task-4" reason="Must commit after all code changes complete" />
    <depends-on task-id="phase-1-task-5" reason="Must commit after build verification passes" />
  </dependencies>

  <commit-message>fix(plugins): fix entrypoints for Cloudflare Workers + register all in Sunrise Yoga

Fixed broken npm-alias entrypoints in 4 plugins:
- commercekit: replaced @shipyard/commercekit/sandbox with file path
- formforge: replaced @shipyard/formforge/sandbox with file path
- reviewpulse: replaced @shipyard/reviewpulse/sandbox with file path
- seodash: replaced @shipyard/seodash/sandbox with file path

All plugins now use fileURLToPath + dirname + join pattern (proven in
membership/eventdash). This ensures entrypoints work on Cloudflare Workers
which cannot resolve npm aliases at runtime.

Registered all 6 working plugins in Sunrise Yoga astro.config.mjs.
Build verified successful with all plugins loaded.

Excluded: adminpulse (PHP-based), forge (no plugin descriptor)

Fixes: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

### HIGH RISK
- **Untested Plugin Integration**: Only membership and eventdash have been tested in Sunrise Yoga. The 4 new plugins may have build issues or runtime incompatibilities. **Mitigation**: Add plugins incrementally to build, remove any that fail.
- **Cloudflare Workers Bundling**: File path resolution using import.meta.url must work correctly in Cloudflare Workers bundler. **Mitigation**: Pattern is proven in membership/eventdash (commits d9a06f7, 7055563).

### MEDIUM RISK
- **Simultaneous File Changes**: Identical changes to 4 plugin files - a typo affects all 4. **Mitigation**: Use consistent pattern from membership reference, verify with TypeScript compiler after each change.
- **Build Failure Cascade**: One plugin failure could prevent entire build. **Mitigation**: Incremental build testing, remove failing plugins, document failures.

### LOW RISK
- **Missing sandbox-entry.ts**: All 6 plugins verified to have sandbox-entry.ts files present.
- **Package.json exports**: Already verified correct by Codebase Scout agent.

## Verification Strategy

**Pre-Deployment Checklist**:
1. TypeScript syntax validation on all 4 modified plugin files
2. Compare each modified file to membership reference (pattern must match exactly)
3. Incremental build test (add plugins one-by-one)
4. Final build test with all 6 plugins
5. Verify build output shows all plugins loaded

**Rollback Plan**:
```bash
git checkout HEAD -- plugins/*/src/index.ts examples/sunrise-yoga/astro.config.mjs
cd examples/sunrise-yoga && npm run build
```

## Deployment Notes

After Phase 1 completion:
1. All plugin entrypoints use file path resolution (Cloudflare Workers compatible)
2. All 6 working plugins registered in Sunrise Yoga
3. Build succeeds locally
4. Ready for deployment to yoga.shipyard.company

## Token Budget Summary

- **Research Phase**: ~50K tokens (3 haiku agents)
- **Planning Phase**: ~5K tokens (this document)
- **Implementation Phase**: ~20K tokens (estimated)
- **Verification & Deploy**: ~10K tokens (estimated)
- **Buffer**: ~15K tokens
- **TOTAL**: ~100K tokens (within hotfix tier budget)

---

*Generated by agency-plan skill • GSD methodology*
*Fresh context embedded in each task plan for autonomous executor agents*
*Per EMDASH-GUIDE.md § 6. Plugin System (lines 899-1158)*
