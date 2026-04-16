#!/usr/bin/env bash
# Test: Verify all 6 plugins are registered in Sunrise Yoga astro.config.mjs
# Exit 0 on pass, non-zero on fail

set -euo pipefail

echo "🔍 Verifying Astro config plugin registration..."

REPO_ROOT="/home/agent/shipyard-ai"
CONFIG_FILE="$REPO_ROOT/examples/sunrise-yoga/astro.config.mjs"
FAILED=0

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ FAIL: $CONFIG_FILE does not exist"
  exit 1
fi

echo ""
echo "Checking for plugin imports..."

# Expected plugins
PLUGINS=(
  "membershipPlugin"
  "eventdashPlugin"
  "commercekitPlugin"
  "formforgePlugin"
  "reviewpulsePlugin"
  "seodashPlugin"
)

for plugin in "${PLUGINS[@]}"; do
  # Check for import statement
  if ! grep -q "import.*${plugin}.*from.*['\"].*plugins.*${plugin%Plugin}.*index.js['\"]" "$CONFIG_FILE"; then
    echo "❌ FAIL: Missing import for $plugin"
    FAILED=1
  else
    echo "✅ PASS: Found import for $plugin"
  fi
done

echo ""
echo "Checking for plugin registrations in plugins array..."

for plugin in "${PLUGINS[@]}"; do
  # Check for plugin function call in config
  if ! grep -q "${plugin}()" "$CONFIG_FILE"; then
    echo "❌ FAIL: $plugin not called in config"
    FAILED=1
  else
    echo "✅ PASS: Found $plugin() in config"
  fi
done

echo ""
echo "Checking plugin array structure..."

# Extract the plugins array (rough check)
if ! grep -A 10 "plugins:" "$CONFIG_FILE" | grep -q "membershipPlugin()" && \
   ! grep -A 10 "plugins:" "$CONFIG_FILE" | grep -q "eventdashPlugin()"; then
  echo "❌ FAIL: plugins array doesn't seem to contain expected plugin calls"
  FAILED=1
else
  echo "✅ PASS: plugins array structure looks correct"
fi

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "✅ All Astro config checks passed!"
  exit 0
else
  echo "❌ Some Astro config checks failed"
  exit 1
fi
