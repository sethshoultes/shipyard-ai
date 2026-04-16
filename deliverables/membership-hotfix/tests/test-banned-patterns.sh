#!/bin/bash
# Test: Verify zero banned patterns in membership plugin
# Exit 0 on pass, non-zero on fail

set -e

TARGET_FILE="plugins/membership/src/sandbox-entry.ts"

echo "=== Testing for banned patterns in ${TARGET_FILE} ==="

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
  echo "FAIL: File not found: ${TARGET_FILE}"
  exit 1
fi

# Test 1: No "throw new Response"
echo -n "Checking for 'throw new Response'... "
COUNT=$(grep -c "throw new Response" "$TARGET_FILE" || true)
if [ "$COUNT" -ne 0 ]; then
  echo "FAIL: Found ${COUNT} occurrence(s)"
  grep -n "throw new Response" "$TARGET_FILE"
  exit 1
fi
echo "PASS (0 occurrences)"

# Test 2: No "rc.user"
echo -n "Checking for 'rc.user'... "
COUNT=$(grep -c "rc\.user" "$TARGET_FILE" || true)
if [ "$COUNT" -ne 0 ]; then
  echo "FAIL: Found ${COUNT} occurrence(s)"
  grep -n "rc\.user" "$TARGET_FILE"
  exit 1
fi
echo "PASS (0 occurrences)"

# Test 3: No "rc.pathParams"
echo -n "Checking for 'rc.pathParams'... "
COUNT=$(grep -c "rc\.pathParams" "$TARGET_FILE" || true)
if [ "$COUNT" -ne 0 ]; then
  echo "FAIL: Found ${COUNT} occurrence(s)"
  grep -n "rc\.pathParams" "$TARGET_FILE"
  exit 1
fi
echo "PASS (0 occurrences)"

# Combined check
echo -n "Combined check (all patterns)... "
COUNT=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams" "$TARGET_FILE" || true)
if [ "$COUNT" -ne 0 ]; then
  echo "FAIL: Found ${COUNT} total occurrence(s)"
  exit 1
fi
echo "PASS (0 total occurrences)"

echo ""
echo "✅ All banned pattern checks PASSED"
exit 0
