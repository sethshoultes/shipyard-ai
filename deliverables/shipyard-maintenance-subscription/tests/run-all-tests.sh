#!/usr/bin/env bash
# Master test runner - runs all verification tests
# Exit 0 if all tests pass, non-zero if any fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../../.."  # Go to repo root

echo "======================================"
echo "  Shipyard Care - Test Suite"
echo "======================================"
echo ""

TESTS=(
  "verify-database-schema.sh"
  "verify-scripts.sh"
  "verify-stripe-integration.sh"
  "verify-email-templates.sh"
)

passed=0
failed=0
warnings=0

for test in "${TESTS[@]}"; do
  test_path="$SCRIPT_DIR/$test"
  echo "Running: $test"
  echo "--------------------------------------"

  if bash "$test_path"; then
    ((passed++))
    echo ""
  else
    ((failed++))
    echo "❌ Test failed: $test"
    echo ""
  fi
done

echo "======================================"
echo "  Test Results"
echo "======================================"
echo "Passed: $passed/${#TESTS[@]}"
echo "Failed: $failed/${#TESTS[@]}"

if [[ $failed -gt 0 ]]; then
  echo ""
  echo "❌ SOME TESTS FAILED"
  exit 1
else
  echo ""
  echo "✅ ALL TESTS PASSED"
  exit 0
fi
