#!/usr/bin/env bash
# Test: Verify TypeScript compilation for all modified plugins
# Exit 0 on pass, non-zero on fail

set -euo pipefail

echo "🔍 Verifying TypeScript compilation..."

REPO_ROOT="/home/agent/shipyard-ai"
FAILED=0

# Plugins to check
PLUGINS=(
  "commercekit"
  "formforge"
  "reviewpulse"
  "seodash"
)

cd "$REPO_ROOT"

echo ""
echo "Running TypeScript compiler (no emit) on modified plugins..."

for plugin in "${PLUGINS[@]}"; do
  FILE="plugins/$plugin/src/index.ts"

  if [[ ! -f "$FILE" ]]; then
    echo "❌ FAIL: $FILE does not exist"
    FAILED=1
    continue
  fi

  echo ""
  echo "Checking $plugin..."

  if npx tsc --noEmit "$FILE" 2>&1; then
    echo "✅ PASS: $plugin compiles without errors"
  else
    echo "❌ FAIL: $plugin has TypeScript errors"
    FAILED=1
  fi
done

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "✅ All TypeScript compilation checks passed!"
  exit 0
else
  echo "❌ Some TypeScript compilation checks failed"
  exit 1
fi
