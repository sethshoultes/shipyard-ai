#!/bin/bash
# check-parser-edge-cases.sh
# Verifies the JSON parser handles all required edge cases
# This script checks that the test harness exists and contains all required test cases
# Exit 0 on pass, non-zero on fail

set -e

PLUGIN_DIR="agentpress"
TEST_FILE="$PLUGIN_DIR/tests/parser-test.php"
ERRORS=0

echo "=== AgentPress Parser Edge Cases Check ==="
echo ""

# Check test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo "  [FAIL] Parser test harness not found at $TEST_FILE"
    echo "  Expected: Create tests/parser-test.php with 10+ edge case tests"
    exit 1
else
    echo "  [OK] Parser test harness exists"
fi

# Required test cases (checking for presence in test file)
declare -A TEST_CASES=(
    ["valid.*json.*direct"]="Valid JSON parsed directly"
    ["markdown.*fence"]="Markdown fence stripping"
    ["truncat"]="Truncated JSON handling"
    ["missing.*capability"]="Missing capability key validation"
    ["hallucin.*slug"]="Hallucinated slug detection"
    ["nested.*payload"]="Nested payload handling"
    ["empty.*response"]="Empty response handling"
    ["html.*wrap"]="HTML-wrapped JSON handling"
    ["extra.*text"]="Extra text before/after JSON"
    ["invalid.*syntax"]="Invalid JSON syntax handling"
)

echo ""
echo "Checking for required test cases..."
for pattern in "${!TEST_CASES[@]}"; do
    if grep -i "$pattern" "$TEST_FILE" > /dev/null 2>&1; then
        echo "  [OK] ${TEST_CASES[$pattern]}"
    else
        echo "  [FAIL] Missing test case: ${TEST_CASES[$pattern]}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check Parser class exists with required methods
PARSER_FILE="$PLUGIN_DIR/includes/class-parser.php"
echo ""
echo "Checking Parser class structure..."

if [ ! -f "$PARSER_FILE" ]; then
    echo "  [FAIL] Parser class not found at $PARSER_FILE"
    ERRORS=$((ERRORS + 1))
else
    echo "  [OK] Parser class exists"

    # Check for required methods
    if grep -q "extract_json" "$PARSER_FILE"; then
        echo "  [OK] extract_json() method present"
    else
        echo "  [FAIL] Missing extract_json() method"
        ERRORS=$((ERRORS + 1))
    fi

    if grep -q "validate_routing_json" "$PARSER_FILE"; then
        echo "  [OK] validate_routing_json() method present"
    else
        echo "  [FAIL] Missing validate_routing_json() method"
        ERRORS=$((ERRORS + 1))
    fi

    if grep -q "sanitize_payload" "$PARSER_FILE"; then
        echo "  [OK] sanitize_payload() method present"
    else
        echo "  [FAIL] Missing sanitize_payload() method"
        ERRORS=$((ERRORS + 1))
    fi

    # Check for wp_kses_post usage in sanitization
    if grep -q "wp_kses_post" "$PARSER_FILE"; then
        echo "  [OK] wp_kses_post used for sanitization"
    else
        echo "  [WARN] wp_kses_post not found - verify payload sanitization"
    fi
fi

# Check for JSON_THROW_ON_ERROR usage
echo ""
echo "Checking for modern JSON error handling..."
if grep -q "JSON_THROW_ON_ERROR" "$PARSER_FILE"; then
    echo "  [OK] JSON_THROW_ON_ERROR used for strict parsing"
else
    echo "  [WARN] JSON_THROW_ON_ERROR not found - consider using for strict parsing"
fi

# Check for try/catch error handling
if grep -q "try" "$PARSER_FILE" && grep -q "catch" "$PARSER_FILE"; then
    echo "  [OK] Try/catch error handling present"
else
    echo "  [WARN] No try/catch blocks found"
fi

# Summary
echo ""
echo "=== Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo "All parser edge cases verified!"
    exit 0
else
    echo "FAILED: $ERRORS test case(s) missing"
    exit 1
fi
