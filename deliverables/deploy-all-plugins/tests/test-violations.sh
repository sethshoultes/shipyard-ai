#!/bin/bash
# Test: Verify all plugins have 0 banned pattern violations
# Exit 0 on pass, non-zero on fail

set -e

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

echo "===== Testing: Zero Violations Across All Plugins ====="
echo ""

TOTAL_VIOLATIONS=0
FAILED_PLUGINS=""

for plugin_dir in plugins/*/; do
  plugin_name=$(basename "$plugin_dir")
  sandbox_file="$plugin_dir/src/sandbox-entry.ts"

  if [ ! -f "$sandbox_file" ]; then
    echo "⚠️  SKIP: $plugin_name (no sandbox-entry.ts found)"
    continue
  fi

  # Count banned patterns: throw new Response, rc.user, rc.pathParams
  violations=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams" "$sandbox_file" 2>/dev/null || echo "0")

  if [ "$violations" -eq 0 ]; then
    echo "✅ PASS: $plugin_name ($violations violations)"
  else
    echo "❌ FAIL: $plugin_name ($violations violations)"
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + violations))
    FAILED_PLUGINS="$FAILED_PLUGINS $plugin_name"
  fi
done

echo ""
echo "===== Summary ====="
if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
  echo "✅ ALL PLUGINS CLEAN: 0 total violations"
  exit 0
else
  echo "❌ VIOLATIONS FOUND: $TOTAL_VIOLATIONS total"
  echo "Failed plugins:$FAILED_PLUGINS"
  exit 1
fi
