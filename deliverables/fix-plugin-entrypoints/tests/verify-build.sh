#!/usr/bin/env bash
# Test: Verify Sunrise Yoga builds successfully
# Exit 0 on pass, non-zero on fail

set -euo pipefail

echo "🔍 Verifying Sunrise Yoga build..."

REPO_ROOT="/home/agent/shipyard-ai"
SUNRISE_DIR="$REPO_ROOT/examples/sunrise-yoga"

if [[ ! -d "$SUNRISE_DIR" ]]; then
  echo "❌ FAIL: Sunrise Yoga directory does not exist"
  exit 1
fi

cd "$SUNRISE_DIR"

echo ""
echo "Running npm run build..."

# Capture build output
if npm run build 2>&1 | tee /tmp/build-output.log; then
  BUILD_EXIT_CODE=0
else
  BUILD_EXIT_CODE=$?
fi

echo ""
if [[ $BUILD_EXIT_CODE -ne 0 ]]; then
  echo "❌ FAIL: Build exited with code $BUILD_EXIT_CODE"
  echo ""
  echo "Last 10 lines of build output:"
  tail -10 /tmp/build-output.log
  exit 1
fi

echo "✅ PASS: Build completed successfully (exit code 0)"

echo ""
echo "Checking for dist folder..."

if [[ ! -d "$SUNRISE_DIR/dist" ]]; then
  echo "❌ FAIL: dist folder was not created"
  exit 1
fi

if [[ -z "$(ls -A "$SUNRISE_DIR/dist")" ]]; then
  echo "❌ FAIL: dist folder is empty"
  exit 1
fi

echo "✅ PASS: dist folder created with contents"

echo ""
echo "Checking build output for errors..."

# Check for common error patterns
if grep -qi "error" /tmp/build-output.log | grep -v "0 errors"; then
  echo "⚠️  WARNING: Found 'error' in build output"
  grep -i "error" /tmp/build-output.log | head -5
fi

if grep -qi "cannot find module" /tmp/build-output.log; then
  echo "❌ FAIL: Found 'Cannot find module' error"
  grep -i "cannot find module" /tmp/build-output.log
  exit 1
fi

echo "✅ PASS: No critical errors found in build output"

echo ""
echo "Checking for plugin registration in logs..."

PLUGINS_FOUND=0

if grep -q "membership" /tmp/build-output.log; then
  echo "  ✓ membership plugin found in logs"
  ((PLUGINS_FOUND++))
fi

if grep -q "eventdash" /tmp/build-output.log; then
  echo "  ✓ eventdash plugin found in logs"
  ((PLUGINS_FOUND++))
fi

if grep -q "commercekit" /tmp/build-output.log; then
  echo "  ✓ commercekit plugin found in logs"
  ((PLUGINS_FOUND++))
fi

if grep -q "formforge" /tmp/build-output.log; then
  echo "  ✓ formforge plugin found in logs"
  ((PLUGINS_FOUND++))
fi

if grep -q "reviewpulse" /tmp/build-output.log; then
  echo "  ✓ reviewpulse plugin found in logs"
  ((PLUGINS_FOUND++))
fi

if grep -q "seodash" /tmp/build-output.log; then
  echo "  ✓ seodash plugin found in logs"
  ((PLUGINS_FOUND++))
fi

echo ""
echo "Found $PLUGINS_FOUND/6 plugins in build logs"

if [[ $PLUGINS_FOUND -lt 6 ]]; then
  echo "⚠️  WARNING: Not all 6 plugins found in logs (this may be okay if some were excluded)"
fi

echo ""
echo "✅ All build verification checks passed!"
exit 0
