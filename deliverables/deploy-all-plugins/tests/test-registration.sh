#!/bin/bash
# Test: Verify all 6 plugins are registered in astro.config.mjs
# Exit 0 on pass, non-zero on fail

set -e

REPO_ROOT="/home/agent/shipyard-ai"
ASTRO_CONFIG="$REPO_ROOT/examples/sunrise-yoga/astro.config.mjs"

cd "$REPO_ROOT"

echo "===== Testing: All 6 Plugins Registered in Sunrise Yoga ====="
echo ""

if [ ! -f "$ASTRO_CONFIG" ]; then
  echo "❌ FAIL: astro.config.mjs not found at $ASTRO_CONFIG"
  exit 1
fi

# Count total "Plugin" references (should be 6: one for each plugin function)
plugin_count=$(grep -c "Plugin" "$ASTRO_CONFIG" || echo "0")

echo "Total 'Plugin' references found: $plugin_count"
echo ""

# Check for each specific plugin
REQUIRED_PLUGINS=("membership" "eventdash" "commercekit" "formforge" "reviewpulse" "seodash")
MISSING_PLUGINS=""
FOUND_COUNT=0

for plugin in "${REQUIRED_PLUGINS[@]}"; do
  if grep -q "${plugin}Plugin" "$ASTRO_CONFIG"; then
    echo "✅ FOUND: ${plugin}Plugin"
    FOUND_COUNT=$((FOUND_COUNT + 1))
  else
    echo "❌ MISSING: ${plugin}Plugin"
    MISSING_PLUGINS="$MISSING_PLUGINS $plugin"
  fi
done

echo ""
echo "===== Summary ====="
if [ "$plugin_count" -eq 6 ] && [ "$FOUND_COUNT" -eq 6 ]; then
  echo "✅ ALL 6 PLUGINS REGISTERED"
  echo "   - membership ✓"
  echo "   - eventdash ✓"
  echo "   - commercekit ✓"
  echo "   - formforge ✓"
  echo "   - reviewpulse ✓"
  echo "   - seodash ✓"
  exit 0
else
  echo "❌ REGISTRATION INCOMPLETE"
  echo "   Expected: 6 plugins"
  echo "   Found: $FOUND_COUNT plugins"
  if [ -n "$MISSING_PLUGINS" ]; then
    echo "   Missing:$MISSING_PLUGINS"
  fi
  exit 1
fi
