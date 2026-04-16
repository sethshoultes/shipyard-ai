#!/usr/bin/env bash
# Test: Verify zero banned pattern violations in sandbox-entry.ts
# Exit 0 on pass, non-zero on fail

set -euo pipefail

SANDBOX_ENTRY="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts"
FAILED=0

echo "=== Testing EventDash Banned Pattern Violations ==="
echo ""

# Test 1: All patterns combined (must be 0)
echo "[1/6] Testing all patterns combined..."
COUNT=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" "$SANDBOX_ENTRY" || echo "0")
if [ "$COUNT" -eq 0 ]; then
  echo "✓ PASS: All patterns combined = 0 violations"
else
  echo "✗ FAIL: All patterns combined = $COUNT violations (expected 0)"
  FAILED=1
fi
echo ""

# Test 2: throw new Response (must be 0)
echo "[2/6] Testing 'throw new Response' pattern..."
COUNT=$(grep -c "throw new Response" "$SANDBOX_ENTRY" || echo "0")
if [ "$COUNT" -eq 0 ]; then
  echo "✓ PASS: throw new Response = 0"
else
  echo "✗ FAIL: throw new Response = $COUNT (expected 0)"
  grep -n "throw new Response" "$SANDBOX_ENTRY" || true
  FAILED=1
fi
echo ""

# Test 3: rc.user (must be 0)
echo "[3/6] Testing 'rc.user' pattern..."
COUNT=$(grep -c "rc\.user" "$SANDBOX_ENTRY" || echo "0")
if [ "$COUNT" -eq 0 ]; then
  echo "✓ PASS: rc.user = 0"
else
  echo "✗ FAIL: rc.user = $COUNT (expected 0)"
  grep -n "rc\.user" "$SANDBOX_ENTRY" || true
  FAILED=1
fi
echo ""

# Test 4: rc.pathParams (must be 0)
echo "[4/6] Testing 'rc.pathParams' pattern..."
COUNT=$(grep -c "rc\.pathParams" "$SANDBOX_ENTRY" || echo "0")
if [ "$COUNT" -eq 0 ]; then
  echo "✓ PASS: rc.pathParams = 0"
else
  echo "✗ FAIL: rc.pathParams = $COUNT (expected 0)"
  grep -n "rc\.pathParams" "$SANDBOX_ENTRY" || true
  FAILED=1
fi
echo ""

# Test 5: JSON.stringify with kv (must be 0)
echo "[5/6] Testing 'JSON.stringify.*kv' pattern..."
COUNT=$(grep -c "JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" "$SANDBOX_ENTRY" || echo "0")
if [ "$COUNT" -eq 0 ]; then
  echo "✓ PASS: JSON.stringify with kv = 0"
else
  echo "✗ FAIL: JSON.stringify with kv = $COUNT (expected 0)"
  grep -n "JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" "$SANDBOX_ENTRY" || true
  FAILED=1
fi
echo ""

# Test 6: JSON.parse (0 or 1 in parseEvent is acceptable)
echo "[6/6] Testing 'JSON.parse' pattern (0-1 acceptable in parseEvent helper)..."
COUNT=$(grep -c "JSON\.parse" "$SANDBOX_ENTRY" || echo "0")
if [ "$COUNT" -le 1 ]; then
  echo "✓ PASS: JSON.parse = $COUNT (0-1 acceptable for legacy data)"
  if [ "$COUNT" -eq 1 ]; then
    echo "  Note: Should be in parseEvent() helper for legacy data compatibility"
    grep -n "JSON\.parse" "$SANDBOX_ENTRY" || true
  fi
else
  echo "✗ FAIL: JSON.parse = $COUNT (expected 0-1)"
  grep -n "JSON\.parse" "$SANDBOX_ENTRY" || true
  FAILED=1
fi
echo ""

# Summary
echo "=== Test Summary ==="
if [ $FAILED -eq 0 ]; then
  echo "✓ ALL TESTS PASSED"
  echo "Verified: Zero banned pattern violations in sandbox-entry.ts"
  exit 0
else
  echo "✗ TESTS FAILED"
  echo "Found banned pattern violations - see output above"
  exit 1
fi
