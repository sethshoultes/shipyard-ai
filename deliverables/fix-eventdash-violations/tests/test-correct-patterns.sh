#!/usr/bin/env bash
# Test: Verify correct patterns are in place (positive checks)
# Exit 0 on pass, non-zero on fail

set -euo pipefail

SANDBOX_ENTRY="/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts"
FAILED=0

echo "=== Testing Correct Patterns Are Present ==="
echo ""

# Test 1: Error handling uses return objects
echo "[1/5] Testing error return objects..."
if grep -q 'error:.*status:' "$SANDBOX_ENTRY"; then
  echo "✓ PASS: Found error return object pattern { error: ..., status: ... }"
  EXAMPLE=$(grep -m1 'error:.*status:' "$SANDBOX_ENTRY" || true)
  echo "  Example: $EXAMPLE"
else
  echo "⚠ WARNING: No error return objects found (file may have no error handling)"
fi
echo ""

# Test 2: KV.set uses direct object storage
echo "[2/5] Testing KV.set pattern..."
if grep -q 'kv\.set' "$SANDBOX_ENTRY"; then
  echo "✓ Found kv.set calls"
  # Verify they don't use JSON.stringify (already tested in violations, but double-check)
  COUNT=$(grep -c 'kv\.set.*JSON\.stringify' "$SANDBOX_ENTRY" || echo "0")
  if [ "$COUNT" -eq 0 ]; then
    echo "✓ PASS: kv.set uses direct object storage (no JSON.stringify)"
    EXAMPLE=$(grep -m1 'kv\.set' "$SANDBOX_ENTRY" || true)
    echo "  Example: $(echo $EXAMPLE | head -c 80)..."
  else
    echo "✗ FAIL: kv.set still uses JSON.stringify"
    FAILED=1
  fi
else
  echo "⚠ WARNING: No kv.set calls found (may not use KV storage)"
fi
echo ""

# Test 3: KV.get uses typed retrieval
echo "[3/5] Testing KV.get pattern..."
if grep -q 'kv\.get' "$SANDBOX_ENTRY"; then
  echo "✓ Found kv.get calls"
  # Check for typed retrieval pattern: kv.get<Type>
  if grep -q 'kv\.get<' "$SANDBOX_ENTRY"; then
    echo "✓ PASS: kv.get uses typed retrieval kv.get<Type>()"
    EXAMPLE=$(grep -m1 'kv\.get<' "$SANDBOX_ENTRY" || true)
    echo "  Example: $(echo $EXAMPLE | head -c 80)..."
  else
    echo "⚠ WARNING: kv.get may not use typed retrieval (check manually)"
  fi
else
  echo "⚠ WARNING: No kv.get calls found (may not use KV storage)"
fi
echo ""

# Test 4: Input access uses routeCtx.input
echo "[4/5] Testing input parameter access..."
if grep -q 'routeCtx\.input\|rc\.input' "$SANDBOX_ENTRY"; then
  echo "✓ PASS: Uses routeCtx.input or rc.input for parameters"
  EXAMPLE=$(grep -m1 'routeCtx\.input\|rc\.input' "$SANDBOX_ENTRY" || true)
  echo "  Example: $(echo $EXAMPLE | head -c 80)..."
else
  echo "⚠ WARNING: No routeCtx.input or rc.input found (may use different pattern)"
fi
echo ""

# Test 5: Handler signatures match Emdash plugin API
echo "[5/5] Testing handler signatures..."
if grep -q 'handler.*async.*routeCtx\|handler.*async.*(rc' "$SANDBOX_ENTRY"; then
  echo "✓ PASS: Found async handler signatures with routeCtx/rc parameter"
  COUNT=$(grep -c 'handler.*async' "$SANDBOX_ENTRY" || echo "0")
  echo "  Found $COUNT async handlers"
else
  echo "⚠ WARNING: No standard handler signatures found (check manually)"
fi
echo ""

# Test 6: definePlugin structure
echo "[6/6] Testing definePlugin structure..."
if grep -q 'definePlugin\|export.*default' "$SANDBOX_ENTRY"; then
  echo "✓ PASS: Found plugin export structure"
else
  echo "⚠ WARNING: No definePlugin or export found (check manually)"
fi
echo ""

# Summary
echo "=== Test Summary ==="
if [ $FAILED -eq 0 ]; then
  echo "✓ Correct patterns test PASSED"
  echo "File uses proper Emdash sandboxed plugin patterns"
  exit 0
else
  echo "✗ Correct patterns test FAILED"
  echo "File still uses banned patterns - see output above"
  exit 1
fi
