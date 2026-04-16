#!/bin/bash
# Run all test scripts for membership-hotfix
# Exit 0 only if ALL tests pass

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILED=0

echo "========================================"
echo "Running All Tests: Membership Hotfix"
echo "========================================"
echo ""

# Test 1: Banned Patterns
echo "📋 Test 1: Banned Patterns"
echo "----------------------------------------"
if bash "$SCRIPT_DIR/test-banned-patterns.sh"; then
  echo ""
else
  echo "❌ Banned patterns test FAILED"
  FAILED=1
fi

# Test 2: Null Guards
echo "📋 Test 2: Null Guards"
echo "----------------------------------------"
if bash "$SCRIPT_DIR/test-null-guards.sh"; then
  echo ""
else
  echo "❌ Null guards test FAILED"
  FAILED=1
fi

# Test 3: Block Kit Structure
echo "📋 Test 3: Block Kit Structure"
echo "----------------------------------------"
if bash "$SCRIPT_DIR/test-block-kit-structure.sh"; then
  echo ""
else
  echo "❌ Block Kit structure test FAILED"
  FAILED=1
fi

# Summary
echo "========================================"
if [ $FAILED -eq 0 ]; then
  echo "✅ ALL TESTS PASSED"
  echo "========================================"
  exit 0
else
  echo "❌ SOME TESTS FAILED"
  echo "========================================"
  exit 1
fi
