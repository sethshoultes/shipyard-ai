#!/usr/bin/env bash
# test-file-structure.sh
# Verify all required files exist for Poster (Issue #84).
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-.}"
ERRORS=0

require_file() {
  local path="$1"
  if [[ ! -f "$PROJECT_ROOT/$path" ]]; then
    echo "FAIL: missing required file: $path"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: $path"
  fi
}

require_dir() {
  local path="$1"
  if [[ ! -d "$PROJECT_ROOT/$path" ]]; then
    echo "FAIL: missing required directory: $path"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: $path/"
  fi
}

echo "=== File Structure Tests ==="

# Source files
require_file "src/index.ts"
require_file "src/github.ts"
require_file "src/template.ts"
require_file "src/renderer.ts"
require_file "src/cache.ts"

# Assets
require_dir  "assets/fonts"

# Scripts
require_file "scripts/warm-cache.ts"

# Config
require_file "wrangler.toml"
require_file "package.json"
require_file "tsconfig.json"

# Documentation
require_file "README.md"

# Fonts presence
if [[ -d "$PROJECT_ROOT/assets/fonts" ]]; then
  count=$(find "$PROJECT_ROOT/assets/fonts" -maxdepth 1 -name '*.woff2' | wc -l)
  if [[ "$count" -lt 1 ]]; then
    echo "FAIL: assets/fonts/ must contain at least one .woff2 file"
    ERRORS=$((ERRORS + 1))
  else
    echo "PASS: assets/fonts/ contains $count .woff2 file(s)"
  fi
fi

if [[ "$ERRORS" -gt 0 ]]; then
  echo "=== $ERRORS failure(s) ==="
  exit 1
fi

echo "=== All file structure tests passed ==="
exit 0
