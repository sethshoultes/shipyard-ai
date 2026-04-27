#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
ERRORS=0

BANNED_PATHS=(
  ".stillconfig"
  ".stillignore"
  "still.yaml"
  "still.yml"
  "src/config/user.ts"
  "web"
  "dashboard"
  "extension"
  "plugins"
)

for p in "${BANNED_PATHS[@]}"; do
  if [[ -e "$PROJECT_ROOT/$p" ]]; then
    echo "FAIL: Banned path exists: $p" >&2
    ERRORS=$((ERRORS + 1))
  fi
done

if grep -rI "loadConfig\|settings\.json\|userConfig\|getUserPreferences" "$PROJECT_ROOT/src" 2>/dev/null; then
  echo "FAIL: Found banned config-loading patterns in src/" >&2
  ERRORS=$((ERRORS + 1))
fi

if [[ $ERRORS -gt 0 ]]; then
  echo "FAIL: $ERRORS banned pattern(s) found" >&2
  exit 1
fi

echo "PASS: No banned patterns found"
exit 0
