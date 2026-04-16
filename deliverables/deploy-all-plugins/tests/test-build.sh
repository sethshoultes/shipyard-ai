#!/bin/bash
# Test: Verify Sunrise Yoga builds successfully
# Exit 0 on pass, non-zero on fail

set -e

REPO_ROOT="/home/agent/shipyard-ai"
BUILD_DIR="$REPO_ROOT/examples/sunrise-yoga"

cd "$BUILD_DIR"

echo "===== Testing: Sunrise Yoga Build Process ====="
echo ""

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ FAIL: package.json not found in $BUILD_DIR"
  exit 1
fi

# Clear build cache to ensure clean build
echo "Clearing build cache..."
rm -rf dist .astro
echo "✅ Cache cleared"
echo ""

# Run build
echo "Running build..."
if npm run build > build-test.log 2>&1; then
  BUILD_EXIT_CODE=0
else
  BUILD_EXIT_CODE=$?
fi

# Check exit code
if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ FAIL: Build exited with code $BUILD_EXIT_CODE"
  echo ""
  echo "Last 20 lines of build output:"
  tail -20 build-test.log
  exit 1
fi

# Check for ERROR messages in output
ERROR_COUNT=$(grep -ci "error" build-test.log | grep -v "0 errors" || echo "0")
if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "⚠️  WARNING: Found $ERROR_COUNT 'error' mentions in build output"
  echo "Checking if these are actual errors..."
  if grep -i "error" build-test.log | grep -v "0 errors" | grep -v "ERROR_METADATA" | grep -qv "errorMap"; then
    echo "❌ FAIL: Build contains error messages"
    echo ""
    echo "Error lines:"
    grep -i "error" build-test.log | grep -v "0 errors" | grep -v "ERROR_METADATA" | grep -v "errorMap" | head -10
    exit 1
  else
    echo "✅ False alarm - no actual errors found"
  fi
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
  echo "❌ FAIL: dist/ directory not created"
  exit 1
fi

# Check if dist has content
DIST_FILE_COUNT=$(find dist -type f | wc -l)
if [ "$DIST_FILE_COUNT" -lt 5 ]; then
  echo "❌ FAIL: dist/ directory has too few files ($DIST_FILE_COUNT)"
  exit 1
fi

echo ""
echo "===== Summary ====="
echo "✅ BUILD SUCCESSFUL"
echo "   - Exit code: 0"
echo "   - No error messages"
echo "   - dist/ directory created"
echo "   - Output files: $DIST_FILE_COUNT"
exit 0
