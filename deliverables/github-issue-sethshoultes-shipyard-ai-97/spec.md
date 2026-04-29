# Spec — TRUE (verify-routes)

GitHub Issue #97 — Deploy gate that stops phantom routes before they become 404s.

## Overview

A pre-build CI gate script that verifies Next.js static export projects do not contain Edge runtime API routes, which would be silently dropped during `next build`.

## Requirements

1. **Detect static export mode**
   - Read `next.config.ts` (or `next.config.js`) from the project root.
   - Detect `output: 'export'` configuration.
   - If static export is not enabled, exit `0` with `Ready.`

2. **Scan for phantom routes**
   - Recursively scan `app/` directory for `route.ts` and `route.js` files.
   - Check each route file for Edge runtime declaration: `export const runtime = 'edge'`.
   - Must use regex patterns (zero dependencies).
   - Pattern: `export\s+const\s+runtime\s*=\s*['"]edge['"]`

3. **Binary output**
   - Pass → exit `0`, print exactly `Ready.`
   - Fail → exit `1`, print one crisp sentence identifying the phantom route.
   - No warnings, no info levels, no stack traces.

4. **Zero configuration**
   - Reads `next.config.ts` and filesystem. No `.truerc` or config files.

5. **Zero runtime dependencies**
   - Only Node.js built-in modules (`fs`, `path`).

6. **No side effects**
   - Does not rewrite, move, or auto-fix code.

7. **Packaged as npm script**
   - `package.json` includes `"build:check": "tsx scripts/verify-routes.ts"`

## Error Message Style

One crisp sentence. Examples:
- `Your Edge route cannot fly in static export. Move it or lose it. — <filePath>`

## File Structure

```
scripts/
  verify-routes.ts       # Gate implementation
package.json             # npm scripts
tests/
  verify-routes.test.ts  # Test suite
```

## Non-Negotiables

- Binary output only: `Ready.` or one sentence explaining death.
- Zero config. Reads `next.config.ts` and filesystem.
- No warnings. Yellow is fear. We do not traffic in fear.
- No AST parsing (v1). Regex is sufficient for a lint, not a compiler.
- No auto-fix, no dashboard, no telemetry.

## Acceptance Criteria

- [ ] Script exits `0` with `Ready.` when no static export is configured.
- [ ] Script exits `0` with `Ready.` when static export is on but no Edge routes exist.
- [ ] Script exits `1` with one crisp sentence when an Edge route is found in static export mode.
- [ ] Script correctly detects `output: 'export'` in `next.config.ts`.
- [ ] Script scans `app/` recursively for `route.ts` and `route.js`.
- [ ] Zero runtime dependencies (only Node.js built-ins).
- [ ] Tests cover pass, fail, and no-static-export cases.
