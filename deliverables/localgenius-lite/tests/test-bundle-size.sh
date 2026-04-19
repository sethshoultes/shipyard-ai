#!/usr/bin/env bash
# Test: Verify widget bundle size is ≤10KB gzipped

set -e

echo "Testing SPARK widget bundle size..."

BUNDLE_PATH="/spark/dist/spark.min.js.gz"
MAX_SIZE_KB=10
MAX_SIZE_BYTES=$((MAX_SIZE_KB * 1024))

if [ ! -f "$BUNDLE_PATH" ]; then
  echo "⚠️  SKIP: Bundle not found at $BUNDLE_PATH (run build first)"
  exit 0
fi

# Get actual size in bytes
ACTUAL_SIZE=$(stat -f%z "$BUNDLE_PATH" 2>/dev/null || stat -c%s "$BUNDLE_PATH" 2>/dev/null)

if [ -z "$ACTUAL_SIZE" ]; then
  echo "❌ FAIL: Could not determine file size"
  exit 1
fi

# Convert to KB for display
ACTUAL_SIZE_KB=$(echo "scale=2; $ACTUAL_SIZE / 1024" | bc)

echo "Bundle size: ${ACTUAL_SIZE_KB}KB (${ACTUAL_SIZE} bytes)"
echo "Maximum allowed: ${MAX_SIZE_KB}KB (${MAX_SIZE_BYTES} bytes)"

if [ "$ACTUAL_SIZE" -le "$MAX_SIZE_BYTES" ]; then
  echo "✅ PASS: Bundle size within limit"
  exit 0
else
  OVERAGE=$(echo "scale=2; $ACTUAL_SIZE_KB - $MAX_SIZE_KB" | bc)
  echo "❌ FAIL: Bundle is ${OVERAGE}KB over the limit"
  exit 1
fi
