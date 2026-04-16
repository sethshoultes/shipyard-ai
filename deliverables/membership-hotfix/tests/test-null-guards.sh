#!/bin/bash
# Test: Verify all KV list fetches have null guards
# Exit 0 on pass, non-zero on fail

set -e

TARGET_FILE="plugins/membership/src/sandbox-entry.ts"

echo "=== Testing for null guards on KV array operations in ${TARGET_FILE} ==="

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
  echo "FAIL: File not found: ${TARGET_FILE}"
  exit 1
fi

# Test 1: Find all members:list fetches
echo "Checking members:list fetches for null guards..."
MEMBERS_FETCHES=$(grep -n 'ctx\.kv\.get.*"members:list"' "$TARGET_FILE" || true)

if [ -z "$MEMBERS_FETCHES" ]; then
  echo "WARNING: No members:list fetches found (may not be an error if code changed)"
else
  echo "Found members:list fetches:"
  echo "$MEMBERS_FETCHES"

  # Verify each has ?? or parseJSON
  while IFS= read -r line; do
    LINE_NUM=$(echo "$line" | cut -d: -f1)
    CONTEXT=$(sed -n "${LINE_NUM}p" "$TARGET_FILE")

    if echo "$CONTEXT" | grep -q '??'; then
      echo "  Line ${LINE_NUM}: ✅ Has ?? null coalescing"
    elif echo "$CONTEXT" | grep -q 'parseJSON'; then
      echo "  Line ${LINE_NUM}: ✅ Uses parseJSON (check it has array default)"
    else
      echo "  Line ${LINE_NUM}: ❌ MISSING null guard"
      echo "  Context: $CONTEXT"
      exit 1
    fi
  done <<< "$MEMBERS_FETCHES"
fi

# Test 2: Find all .map() calls and verify they're on safe arrays
echo ""
echo "Checking .map() calls for null safety..."
MAP_CALLS=$(grep -n '\.map(' "$TARGET_FILE" || true)

if [ -z "$MAP_CALLS" ]; then
  echo "No .map() calls found"
else
  echo "Found .map() calls:"
  echo "$MAP_CALLS" | head -n 10  # Show first 10 to avoid overwhelming output

  # Count them
  MAP_COUNT=$(echo "$MAP_CALLS" | wc -l)
  echo "Total .map() calls: ${MAP_COUNT}"
  echo "⚠️  Manual verification required: Each .map() should operate on:"
  echo "    - Variable from KV fetch with ?? fallback"
  echo "    - Variable from parseJSON with array default"
  echo "    - Hard-coded array literal"
  echo "    - Array method chain (filter, slice, etc.)"
fi

# Test 3: Check for parseJSON calls with array defaults
echo ""
echo "Checking parseJSON calls for array defaults..."
PARSEJSON_CALLS=$(grep -n 'parseJSON' "$TARGET_FILE" || true)

if [ -z "$PARSEJSON_CALLS" ]; then
  echo "No parseJSON calls found"
else
  echo "Found parseJSON calls (verify each has array default):"
  echo "$PARSEJSON_CALLS" | head -n 10
fi

echo ""
echo "✅ Automated null guard checks PASSED"
echo "⚠️  Manual review still required for .map() safety"
exit 0
