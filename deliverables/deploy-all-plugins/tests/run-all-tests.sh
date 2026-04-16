#!/bin/bash
# Test Suite Runner: Run all tests in sequence
# Exit 0 only if ALL tests pass

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Deploy All Plugins - Test Suite"
echo "=========================================="
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILED_TEST_NAMES=""

run_test() {
  local test_script="$1"
  local test_name="$2"

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo ""
  echo "=========================================="
  echo "Test $TOTAL_TESTS: $test_name"
  echo "=========================================="

  if bash "$test_script"; then
    echo ""
    echo "✅ TEST PASSED: $test_name"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo ""
    echo "❌ TEST FAILED: $test_name"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    FAILED_TEST_NAMES="$FAILED_TEST_NAMES\n  - $test_name"
    return 1
  fi
}

# Pre-deployment tests (run these before deploying)
echo "Running pre-deployment tests..."
echo ""

run_test "test-violations.sh" "Zero Violations" || true
run_test "test-entrypoints.sh" "Valid Entrypoints" || true
run_test "test-registration.sh" "All Plugins Registered" || true
run_test "test-build.sh" "Build Success" || true

# Post-deployment test (run after deploying)
echo ""
echo "=========================================="
echo "Post-Deployment Tests"
echo "=========================================="
echo ""
echo "NOTE: Smoke test requires deployment to be complete."
echo "      If deployment hasn't happened yet, this test will fail."
echo ""

run_test "test-smoke.sh" "Smoke Test All Routes" || true

# Final summary
echo ""
echo "=========================================="
echo "Final Test Suite Summary"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [ "$FAILED_TESTS" -gt 0 ]; then
  echo ""
  echo "Failed tests:$FAILED_TEST_NAMES"
  echo ""
  echo "❌ TEST SUITE FAILED"
  exit 1
else
  echo ""
  echo "✅ ALL TESTS PASSED"
  exit 0
fi
