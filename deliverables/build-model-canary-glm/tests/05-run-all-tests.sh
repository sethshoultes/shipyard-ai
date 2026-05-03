#!/bin/bash

# Test 5: Run All Tests
# Executes all test scripts and returns overall status

set -e

BASE_DIR="/home/agent/shipyard-ai/deliverables/build-model-canary-glm"
TESTS_DIR="$BASE_DIR/tests"

echo "🚀 Running all build-model-canary-glm tests..."

# Change to tests directory
cd "$TESTS_DIR"

# Make sure all test scripts are executable
chmod +x *.sh

# Run each test script
test_scripts=(
    "01-file-existence.sh"
    "02-typescript-validation.sh"
    "03-quality-audit.sh"
    "04-dependency-check.sh"
)

total_tests=${#test_scripts[@]}
passed_tests=0
failed_tests=0

echo ""
echo "=== Running Test Suite ==="

for script in "${test_scripts[@]}"; do
    echo ""
    echo "🔧 Running $script..."

    if ./"$script"; then
        echo "✅ $script PASSED"
        passed_tests=$((passed_tests + 1))
    else
        echo "❌ $script FAILED"
        failed_tests=$((failed_tests + 1))
    fi
done

echo ""
echo "=== Test Results ==="
echo "Total tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $failed_tests"

if [[ $failed_tests -eq 0 ]]; then
    echo ""
    echo "🎉 ALL TESTS PASSED!"
    echo "Build model canary is healthy!"
    exit 0
else
    echo ""
    echo "💥 $failed_tests TESTS FAILED"
    echo "Build model canary needs attention!"
    exit 1
fi