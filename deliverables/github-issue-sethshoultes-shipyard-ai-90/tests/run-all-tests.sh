#!/bin/bash
# run-all-tests.sh — Run all verification tests for Forge
# Exit 0 if all tests pass, non-zero if any fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILED=0
PASSED=0

echo "========================================"
echo "  Forge — Full Verification Suite"
echo "========================================"
echo ""

# Run each test script and track results
TESTS=(
    "verify-structure.sh"
    "verify-no-banned-patterns.sh"
    "verify-typescript.sh"
    "verify-canvas-requirements.sh"
    "verify-daemon-bridge.sh"
    "verify-caching-budgets.sh"
)

for test in "${TESTS[@]}"; do
    echo ""
    echo "----------------------------------------"
    echo "Running: $test"
    echo "----------------------------------------"

    if [ -x "$SCRIPT_DIR/$test" ]; then
        if "$SCRIPT_DIR/$test"; then
            echo ""
            echo "[RESULT] $test: PASSED"
            ((PASSED++))
        else
            echo ""
            echo "[RESULT] $test: FAILED"
            ((FAILED++))
        fi
    else
        echo "[SKIP] $test not found or not executable"
        ((FAILED++))
    fi
done

echo ""
echo "========================================"
echo "  Summary"
echo "========================================"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "All verification tests PASSED!"
    exit 0
else
    echo "Some verification tests FAILED."
    exit 1
fi
