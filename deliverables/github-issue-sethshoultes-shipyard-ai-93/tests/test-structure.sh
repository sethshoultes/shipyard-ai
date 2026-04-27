#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
ERRORS=0

REQUIRED_FILES=(
  "package.json"
  "tsconfig.json"
  "README.md"
  "scripts/install.sh"
  "src/cli.ts"
  "src/commands/install.ts"
  "src/commands/uninstall.ts"
  "src/git/diff.ts"
  "src/cache/store.ts"
  "src/llm/client.ts"
  "src/llm/prompt.ts"
  "src/voice/templates.ts"
  "src/config/constants.ts"
  ".github/workflows/ci.yml"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$PROJECT_ROOT/$f" ]]; then
    echo "FAIL: Required file missing: $f" >&2
    ERRORS=$((ERRORS + 1))
  fi
done

if [[ $ERRORS -gt 0 ]]; then
  echo "FAIL: $ERRORS required file(s) missing" >&2
  exit 1
fi

echo "PASS: All required files exist"
exit 0
