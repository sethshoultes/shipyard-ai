#!/usr/bin/env bash
# Test: Verify all plugin entrypoints use file path resolution (not npm aliases)
# Exit 0 on pass, non-zero on fail

set -euo pipefail

echo "🔍 Verifying plugin entrypoints..."

REPO_ROOT="/home/agent/shipyard-ai"
FAILED=0

# Plugins that should have file path entrypoints
PLUGINS=(
  "commercekit"
  "formforge"
  "reviewpulse"
  "seodash"
  "membership"
  "eventdash"
)

echo ""
echo "Checking for banned npm alias pattern..."

for plugin in "${PLUGINS[@]}"; do
  FILE="$REPO_ROOT/plugins/$plugin/src/index.ts"

  if [[ ! -f "$FILE" ]]; then
    echo "❌ FAIL: $FILE does not exist"
    FAILED=1
    continue
  fi

  # Check for banned pattern: entrypoint: "@shipyard/<name>/sandbox"
  if grep -q "entrypoint:.*['\"]@shipyard/$plugin/sandbox['\"]" "$FILE"; then
    echo "❌ FAIL: $plugin still uses npm alias entrypoint"
    FAILED=1
  else
    echo "✅ PASS: $plugin does not use npm alias"
  fi
done

echo ""
echo "Checking for required file path resolution pattern..."

for plugin in "${PLUGINS[@]}"; do
  FILE="$REPO_ROOT/plugins/$plugin/src/index.ts"

  # Check for required imports
  if ! grep -q "import.*fileURLToPath.*from.*['\"]node:url['\"]" "$FILE"; then
    echo "❌ FAIL: $plugin missing fileURLToPath import"
    FAILED=1
    continue
  fi

  if ! grep -q "import.*dirname.*join.*from.*['\"]node:path['\"]" "$FILE"; then
    echo "❌ FAIL: $plugin missing dirname/join imports"
    FAILED=1
    continue
  fi

  # Check for path resolution code
  if ! grep -q "dirname(fileURLToPath(import.meta.url))" "$FILE"; then
    echo "❌ FAIL: $plugin missing path resolution code"
    FAILED=1
    continue
  fi

  if ! grep -q "join(.*['\"]sandbox-entry.ts['\"])" "$FILE"; then
    echo "❌ FAIL: $plugin missing join for sandbox-entry.ts"
    FAILED=1
    continue
  fi

  # Check that entrypoint uses variable (not string literal)
  if ! grep -q "entrypoint:.*entrypointPath" "$FILE"; then
    echo "❌ FAIL: $plugin entrypoint not using entrypointPath variable"
    FAILED=1
    continue
  fi

  echo "✅ PASS: $plugin has correct file path resolution pattern"
done

echo ""
echo "Checking for sandbox-entry.ts files..."

for plugin in "${PLUGINS[@]}"; do
  SANDBOX_FILE="$REPO_ROOT/plugins/$plugin/src/sandbox-entry.ts"

  if [[ ! -f "$SANDBOX_FILE" ]]; then
    echo "❌ FAIL: $SANDBOX_FILE does not exist"
    FAILED=1
  else
    echo "✅ PASS: $plugin has sandbox-entry.ts"
  fi
done

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "✅ All entrypoint checks passed!"
  exit 0
else
  echo "❌ Some entrypoint checks failed"
  exit 1
fi
