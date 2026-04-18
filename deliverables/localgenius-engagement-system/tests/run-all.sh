#!/bin/bash
# Run all Pulse build verification tests
# Exit 0 only if ALL tests pass

set -e

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILED=0

echo "========================================"
echo "  Pulse Build Verification Test Suite"
echo "========================================"
echo ""

# Run each test in order
for test in "$TESTS_DIR"/[0-9]*.sh; do
  if [ -f "$test" ] && [ -x "$test" ]; then
    echo ""
    echo "Running $(basename "$test")..."
    echo "----------------------------------------"

    if "$test"; then
      echo "✓ $(basename "$test") PASSED"
    else
      echo "✗ $(basename "$test") FAILED"
      FAILED=1
    fi
  fi
done

echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
  echo "  ALL TESTS PASSED ✓"
  echo "========================================"
  exit 0
else
  echo "  SOME TESTS FAILED ✗"
  echo "========================================"
  exit 1
fi
