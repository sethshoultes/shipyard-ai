#!/bin/bash
# test-parser.sh — Parser unit tests for Promptfolio
# Tests the Claude export JSON parser with edge cases
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")/promptfolio"
PARSER_FILE="$PROJECT_DIR/src/parser/claude.js"
TEST_PASSED=0
TEST_FAILED=0

echo "=== Promptfolio Parser Tests ==="
echo ""

# Check if parser file exists
if [ ! -f "$PARSER_FILE" ]; then
    echo "FAIL: Parser file not found at $PARSER_FILE"
    exit 1
fi

echo "PASS: Parser file exists"
TEST_PASSED=$((TEST_PASSED + 1))

# Run the Node.js test suite
echo ""
echo "Running parser unit tests via Node.js ..."

JS_OUTPUT=$(node "$SCRIPT_DIR/parser.test.mjs" 2>&1) && JS_EXIT=0 || JS_EXIT=1
echo "$JS_OUTPUT"

# Count PASS/FAIL lines emitted by the JS runner
JS_PASSED=$(echo "$JS_OUTPUT" | grep -c '^PASS:' || true)
JS_FAILED=$(echo "$JS_OUTPUT" | grep -c '^FAIL:' || true)
TEST_PASSED=$((TEST_PASSED + JS_PASSED))
TEST_FAILED=$((TEST_FAILED + JS_FAILED))

# If the runner crashed without printing FAIL lines, count it as a failure
if [ "$JS_EXIT" -ne 0 ] && [ "$JS_FAILED" -eq 0 ]; then
    echo "FAIL: JS test runner crashed or exited with an unexpected error"
    TEST_FAILED=$((TEST_FAILED + 1))
fi

# Summary
echo ""
echo "=== Test Summary ==="
echo "Passed: $TEST_PASSED"
echo "Failed: $TEST_FAILED"
echo ""

if [ $TEST_FAILED -gt 0 ]; then
    echo "RESULT: FAILED"
    exit 1
else
    echo "RESULT: PASSED"
    exit 0
fi
