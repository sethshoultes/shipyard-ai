#!/usr/bin/env bash
# test-source-integrity.sh
# Verify source files contain expected exports and signatures.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-.}"
ERRORS=0

assert_contains() {
  local file="$1"
  local pattern="$2"
  local desc="$3"

  local fullpath="$PROJECT_ROOT/$file"
  if [[ ! -f "$fullpath" ]]; then
    echo "FAIL: $file missing ($desc)"
    ERRORS=$((ERRORS + 1))
    return
  fi

  if grep -q "$pattern" "$fullpath"; then
    echo "PASS: $file — $desc"
  else
    echo "FAIL: $file missing pattern '$pattern' ($desc)"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "=== Source Integrity Tests ==="

# src/index.ts
assert_contains "src/index.ts" "export default" "must export default fetch handler"
assert_contains "src/index.ts" ":owner" "must parse owner from route"
assert_contains "src/index.ts" ":repo" "must parse repo from route"

# src/github.ts
assert_contains "src/github.ts" "token" "must reference token/auth"
assert_contains "src/github.ts" "fetch" "must fetch from GitHub API"

# src/template.ts
assert_contains "src/template.ts" "<svg" "must contain SVG element"
assert_contains "src/template.ts" "1200" "must reference OG width"
assert_contains "src/template.ts" "630" "must reference OG height"
assert_contains "src/template.ts" "export" "must export template function"

# src/renderer.ts
assert_contains "src/renderer.ts" "resvg" "must reference resvg library"
assert_contains "src/renderer.ts" "export" "must export renderer function"
assert_contains "src/renderer.ts" "Uint8Array" "must return byte buffer"

# src/cache.ts
assert_contains "src/cache.ts" "86400\|max-age" "must set 24h TTL"
assert_contains "src/cache.ts" "export" "must export cache functions"

# scripts/warm-cache.ts
assert_contains "scripts/warm-cache.ts" "owner\|repo" "must reference owner/repo"
assert_contains "scripts/warm-cache.ts" "fetch\|request\|generate" "must trigger generation"

if [[ "$ERRORS" -gt 0 ]]; then
  echo "=== $ERRORS failure(s) ==="
  exit 1
fi

echo "=== All source integrity tests passed ==="
exit 0
