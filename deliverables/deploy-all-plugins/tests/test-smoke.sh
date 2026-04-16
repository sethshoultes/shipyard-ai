#!/bin/bash
# Test: Smoke test all plugin routes after deployment
# Exit 0 on pass, non-zero on fail
# NOTE: This test requires the site to be deployed first

set -e

SITE_URL="https://yoga.shipyard.company"
PLUGINS=("membership" "eventdash" "commercekit" "formforge" "reviewpulse" "seodash")

echo "===== Testing: Smoke Test All Plugin Routes ====="
echo ""
echo "Target: $SITE_URL"
echo ""

# Check if site is accessible
if ! curl -s -I "$SITE_URL" | grep -q "200 OK"; then
  echo "❌ FAIL: Site not accessible at $SITE_URL"
  echo "Make sure the site is deployed before running this test"
  exit 1
fi

echo "✅ Site is accessible"
echo ""

FAILED_PLUGINS=""
FAIL_COUNT=0
PASS_COUNT=0

for plugin in "${PLUGINS[@]}"; do
  echo "Testing: $plugin"

  # Call plugin admin endpoint with page_load event
  response=$(curl -s "$SITE_URL/_emdash/api/plugins/$plugin/admin" \
    -H "Content-Type: application/json" \
    -d '{"type":"page_load"}' || echo "CURL_FAILED")

  if echo "$response" | grep -q "CURL_FAILED"; then
    echo "  ❌ FAIL: curl request failed"
    FAILED_PLUGINS="$FAILED_PLUGINS $plugin"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  elif echo "$response" | grep -q "UNAUTHORIZED"; then
    echo "  ✅ PASS: Returns UNAUTHORIZED (plugin loaded, auth-gated)"
    PASS_COUNT=$((PASS_COUNT + 1))
  elif echo "$response" | grep -q "NOT_FOUND"; then
    echo "  ❌ FAIL: Returns NOT_FOUND (plugin not registered)"
    FAILED_PLUGINS="$FAILED_PLUGINS $plugin"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  elif echo "$response" | grep -q "INTERNAL_ERROR"; then
    echo "  ❌ FAIL: Returns INTERNAL_ERROR (plugin has runtime errors)"
    FAILED_PLUGINS="$FAILED_PLUGINS $plugin"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "  ⚠️  WARN: Unexpected response (check manually)"
    echo "  Response: ${response:0:100}"
  fi
done

echo ""
echo "===== Summary ====="
if [ "$PASS_COUNT" -eq 6 ] && [ "$FAIL_COUNT" -eq 0 ]; then
  echo "✅ ALL PLUGINS PASS SMOKE TEST"
  echo "   - Tested: 6 plugins"
  echo "   - Passed: $PASS_COUNT"
  echo "   - Failed: $FAIL_COUNT"
  exit 0
else
  echo "❌ SMOKE TEST FAILURES"
  echo "   - Tested: 6 plugins"
  echo "   - Passed: $PASS_COUNT"
  echo "   - Failed: $FAIL_COUNT"
  if [ -n "$FAILED_PLUGINS" ]; then
    echo "   - Failed plugins:$FAILED_PLUGINS"
  fi
  exit 1
fi
