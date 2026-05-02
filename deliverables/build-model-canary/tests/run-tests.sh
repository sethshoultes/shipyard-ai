#!/bin/bash
# Run the test suite for build-model-canary

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "Running test suite..."

# Check if tsx is available
if command -v tsx &> /dev/null || node --import tsx --version &> /dev/null 2>&1; then
    echo "Using tsx for test execution..."
    if node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts; then
        echo ""
        echo "PASSED: All tests passed"
        exit 0
    else
        echo ""
        echo "FAILED: One or more tests failed"
        exit 1
    fi
fi

# Fall back to tsc compilation + node
echo "tsx not available, trying tsc compilation..."

if ! command -v tsc &> /dev/null; then
    echo "  ✗ Neither tsx nor tsc available"
    echo "FAILED: Cannot run tests without TypeScript runtime or compiler"
    exit 1
fi

echo "Compiling TypeScript..."
tsc

echo "Running compiled tests..."
if node --test tests/test-slugify.js tests/test-truncate.js; then
    echo ""
    echo "PASSED: All tests passed"
    exit 0
else
    echo ""
    echo "FAILED: One or more tests failed"
    exit 1
fi
