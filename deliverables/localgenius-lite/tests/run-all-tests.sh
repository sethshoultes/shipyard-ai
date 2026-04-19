#!/usr/bin/env bash
# Test Runner: Execute all SPARK tests

set -e

TESTS_DIR="$(dirname "$0")"
PASSED=0
FAILED=0
SKIPPED=0

echo "========================================"
echo "SPARK Test Suite"
echo "========================================"
echo ""

# Function to run a test
run_test() {
  local test_file="$1"
  local test_name=$(basename "$test_file" .sh)

  echo "Running: $test_name"
  echo "----------------------------------------"

  if bash "$test_file"; then
    PASSED=$((PASSED + 1))
    echo ""
  else
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
      SKIPPED=$((SKIPPED + 1))
      echo ""
    else
      FAILED=$((FAILED + 1))
      echo ""
    fi
  fi
}

# Run all test scripts (except this one)
for test_file in "$TESTS_DIR"/test-*.sh; do
  if [ -f "$test_file" ] && [ "$test_file" != "$0" ]; then
    run_test "$test_file"
  fi
done

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "✅ Passed:  $PASSED"
echo "❌ Failed:  $FAILED"
echo "⚠️  Skipped: $SKIPPED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "💥 Some tests failed"
  exit 1
fi
