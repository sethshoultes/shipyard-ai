#!/usr/bin/env bash
# Run all test scripts for EventDash pattern fixes
# Exit 0 if all pass, non-zero if any fail

set -euo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILED=0
PASSED=0
TOTAL=0

echo "========================================"
echo "EventDash Pattern Fix Test Suite"
echo "========================================"
echo ""

# Find all test-*.sh scripts
TEST_SCRIPTS=(
  "$TEST_DIR/test-file-structure.sh"
  "$TEST_DIR/test-pattern-violations.sh"
  "$TEST_DIR/test-correct-patterns.sh"
  "$TEST_DIR/test-typescript-compilation.sh"
)

# Run each test
for test_script in "${TEST_SCRIPTS[@]}"; do
  if [ ! -f "$test_script" ]; then
    echo "⚠ WARNING: Test script not found: $(basename "$test_script")"
    continue
  fi

  TOTAL=$((TOTAL + 1))
  TEST_NAME=$(basename "$test_script" .sh)

  echo "========================================"
  echo "Running: $TEST_NAME"
  echo "========================================"
  echo ""

  if bash "$test_script"; then
    PASSED=$((PASSED + 1))
    echo ""
    echo "✓ $TEST_NAME PASSED"
  else
    FAILED=$((FAILED + 1))
    echo ""
    echo "✗ $TEST_NAME FAILED"
  fi
  echo ""
done

# Final summary
echo "========================================"
echo "Test Suite Summary"
echo "========================================"
echo ""
echo "Total tests: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✓✓✓ ALL TESTS PASSED ✓✓✓"
  echo ""
  echo "EventDash sandbox-entry.ts is verified:"
  echo "  - Zero banned pattern violations"
  echo "  - TypeScript compilation succeeds"
  echo "  - Correct patterns in place"
  echo "  - File structure validated"
  echo ""
  echo "Ready for deployment!"
  exit 0
else
  echo "✗✗✗ SOME TESTS FAILED ✗✗✗"
  echo ""
  echo "Review failed tests above and fix issues before deployment."
  exit 1
fi
