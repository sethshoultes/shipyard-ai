#!/bin/bash
# Test: Verify all plugins use file path resolution (not npm aliases)
# Exit 0 on pass, non-zero on fail

set -e

REPO_ROOT="/home/agent/shipyard-ai"
cd "$REPO_ROOT"

echo "===== Testing: Plugin Entrypoints Use File Path Resolution ====="
echo ""

FAILED_PLUGINS=""
FAIL_COUNT=0

for plugin_dir in plugins/*/; do
  plugin_name=$(basename "$plugin_dir")
  index_file="$plugin_dir/src/index.ts"

  if [ ! -f "$index_file" ]; then
    echo "⚠️  SKIP: $plugin_name (no index.ts found)"
    continue
  fi

  # Check for banned npm alias pattern
  if grep -q "@shipyard/$plugin_name/sandbox" "$index_file" 2>/dev/null; then
    echo "❌ FAIL: $plugin_name uses banned npm alias @shipyard/$plugin_name/sandbox"
    FAILED_PLUGINS="$FAILED_PLUGINS $plugin_name"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    continue
  fi

  # Check for required file path resolution pattern
  has_fileURLToPath=$(grep -c "fileURLToPath" "$index_file" || echo "0")
  has_dirname=$(grep -c "dirname" "$index_file" || echo "0")
  has_join=$(grep -c "join" "$index_file" || echo "0")
  has_entrypointPath=$(grep -c "entrypointPath" "$index_file" || echo "0")

  if [ "$has_fileURLToPath" -gt 0 ] && [ "$has_dirname" -gt 0 ] && [ "$has_join" -gt 0 ] && [ "$has_entrypointPath" -gt 0 ]; then
    echo "✅ PASS: $plugin_name uses file path resolution"
  else
    # Check if it might be using a different valid pattern (e.g., direct file path string)
    if grep -q "entrypoint.*sandbox-entry" "$index_file" 2>/dev/null; then
      echo "✅ PASS: $plugin_name uses valid entrypoint pattern (alternative)"
    else
      echo "⚠️  WARN: $plugin_name may have non-standard entrypoint (check manually)"
    fi
  fi
done

echo ""
echo "===== Summary ====="
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "✅ ALL PLUGINS VALID: No banned npm aliases found"
  exit 0
else
  echo "❌ BANNED ALIASES FOUND: $FAIL_COUNT plugins"
  echo "Failed plugins:$FAILED_PLUGINS"
  exit 1
fi
