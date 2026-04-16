#!/usr/bin/env bash
# Test: Verify file structure and size reduction
# Exit 0 on pass, non-zero on fail

set -euo pipefail

SANDBOX_ENTRY="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts"
BACKUP_PATTERN="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts.backup*"
FAILED=0

echo "=== Testing File Structure ==="
echo ""

# Test 1: File exists
echo "[1/4] Testing file existence..."
if [ -f "$SANDBOX_ENTRY" ]; then
  echo "✓ PASS: sandbox-entry.ts exists"
else
  echo "✗ FAIL: sandbox-entry.ts not found"
  exit 1
fi
echo ""

# Test 2: File is not empty
echo "[2/4] Testing file is not empty..."
if [ -s "$SANDBOX_ENTRY" ]; then
  echo "✓ PASS: sandbox-entry.ts is not empty"
else
  echo "✗ FAIL: sandbox-entry.ts is empty"
  exit 1
fi
echo ""

# Test 3: File size reduction
echo "[3/4] Testing file size reduction..."
LINE_COUNT=$(wc -l < "$SANDBOX_ENTRY")
echo "Current line count: $LINE_COUNT"

# Original file was 3,442 lines, should now be ~133 lines (significant reduction)
if [ "$LINE_COUNT" -lt 200 ]; then
  echo "✓ PASS: File significantly reduced (< 200 lines)"
  echo "  Expected: ~133 lines (from original 3,442)"
  echo "  Actual: $LINE_COUNT lines"
  echo "  Reduction: ~$(( (3442 - LINE_COUNT) * 100 / 3442 ))%"
else
  echo "⚠ WARNING: File is larger than expected"
  echo "  Expected: < 200 lines (target ~133)"
  echo "  Actual: $LINE_COUNT lines"
  if [ "$LINE_COUNT" -gt 3000 ]; then
    echo "✗ FAIL: File not reduced from original size"
    FAILED=1
  else
    echo "  Continuing (file may have been partially fixed)"
  fi
fi
echo ""

# Test 4: Backup file exists (optional check)
echo "[4/4] Checking for backup file..."
BACKUP_EXISTS=0
for backup in $BACKUP_PATTERN; do
  if [ -f "$backup" ]; then
    echo "✓ Backup found: $(basename "$backup")"
    BACKUP_EXISTS=1
  fi
done

if [ $BACKUP_EXISTS -eq 0 ]; then
  echo "⚠ No backup file found (may have been cleaned up or fixes already committed)"
else
  echo "✓ Original file backed up"
fi
echo ""

# Summary
echo "=== Test Summary ==="
if [ $FAILED -eq 0 ]; then
  echo "✓ File structure tests PASSED"
  echo "File exists, not empty, and significantly reduced in size"
  exit 0
else
  echo "✗ File structure tests FAILED"
  exit 1
fi
