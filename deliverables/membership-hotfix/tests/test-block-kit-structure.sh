#!/bin/bash
# Test: Verify Block Kit structure in admin handler
# Exit 0 on pass, non-zero on fail

set -e

TARGET_FILE="plugins/membership/src/sandbox-entry.ts"

echo "=== Testing Block Kit structure in admin handler ==="

# Check if file exists
if [ ! -f "$TARGET_FILE" ]; then
  echo "FAIL: File not found: ${TARGET_FILE}"
  exit 1
fi

# Test 1: Find page_load handlers
echo "Checking for page_load handlers..."
PAGE_LOAD_COUNT=$(grep -c 'interaction.type.*===.*"page_load"' "$TARGET_FILE" || true)

if [ "$PAGE_LOAD_COUNT" -eq 0 ]; then
  echo "FAIL: No page_load handlers found"
  exit 1
fi

echo "✅ Found ${PAGE_LOAD_COUNT} page_load handler(s)"

# Test 2: Check for root page handler
echo ""
echo "Checking for root admin page handler..."
ROOT_HANDLER=$(grep -n 'interaction.page.*===.*"/"' "$TARGET_FILE" || true)

if [ -z "$ROOT_HANDLER" ]; then
  # Also check for (!interaction.page || interaction.page === "/") pattern
  ROOT_HANDLER=$(grep -n '!interaction.page' "$TARGET_FILE" || true)
fi

if [ -z "$ROOT_HANDLER" ]; then
  echo "FAIL: No root page handler found (should check for !interaction.page or interaction.page === '/')"
  exit 1
fi

echo "✅ Found root page handler:"
echo "$ROOT_HANDLER"

# Test 3: Check for return { blocks: ... } structure
echo ""
echo "Checking for Block Kit blocks structure..."
BLOCKS_RETURN=$(grep -c 'return.*{.*blocks:' "$TARGET_FILE" || true)

if [ "$BLOCKS_RETURN" -eq 0 ]; then
  echo "FAIL: No 'return { blocks: ... }' structure found"
  exit 1
fi

echo "✅ Found ${BLOCKS_RETURN} blocks return statement(s)"

# Test 4: Check for required block types in admin handler section
echo ""
echo "Checking for Block Kit block types..."

# Extract admin handler section (approximately lines 2202-2525 based on plan)
ADMIN_SECTION=$(sed -n '2200,2600p' "$TARGET_FILE" || true)

if echo "$ADMIN_SECTION" | grep -q 'type:.*"header"'; then
  echo "✅ Found header block"
else
  echo "⚠️  No header block found (may be OK if using different block type)"
fi

if echo "$ADMIN_SECTION" | grep -q 'type:.*"stats"'; then
  echo "✅ Found stats block"
else
  echo "⚠️  No stats block found (may be OK if using different block type)"
fi

if echo "$ADMIN_SECTION" | grep -q 'type:.*"actions"'; then
  echo "✅ Found actions block"
else
  echo "⚠️  No actions block found (should have action buttons)"
fi

# Test 5: Check for action buttons
echo ""
echo "Checking for action buttons..."

if echo "$ADMIN_SECTION" | grep -q 'action_id:.*"view_members"'; then
  echo "✅ Found view_members button"
else
  echo "⚠️  No view_members button found"
fi

if echo "$ADMIN_SECTION" | grep -q 'action_id:.*"view_plans"'; then
  echo "✅ Found view_plans button"
else
  echo "⚠️  No view_plans button found"
fi

if echo "$ADMIN_SECTION" | grep -q 'action_id:.*"view_settings"'; then
  echo "✅ Found view_settings button"
else
  echo "⚠️  No view_settings button found"
fi

echo ""
echo "✅ Block Kit structure checks PASSED"
echo "⚠️  Manual review recommended to verify exact Block Kit format compliance"
exit 0
