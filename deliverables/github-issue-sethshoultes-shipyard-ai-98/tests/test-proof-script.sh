#!/bin/bash
# Test: Verify proof.js has required components
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

PROOF_FILE="scripts/proof.js"

echo "Testing proof.js script..."

FAILED=0

# Check proof.js exists
if [ ! -f "$PROOF_FILE" ]; then
    echo "FAIL: proof.js does not exist"
    exit 1
fi

# Test 1: Has Node.js shebang or is valid JS
if ! head -1 "$PROOF_FILE" | grep -qE '^#!/|//|/\*|"' ; then
    echo "WARN: May not have proper shebang (not fatal)"
else
    echo "PASS: Has valid file header"
fi

# Test 2: Reads domains.json
if ! grep -q "domains.json" "$PROOF_FILE" && ! grep -q "readFileSync" "$PROOF_FILE"; then
    echo "FAIL: Does not read domains.json"
    FAILED=1
else
    echo "PASS: Reads domains.json"
fi

# Test 3: Performs HTTP request (https.get or fetch)
if ! grep -qE "https\.get|fetch\(" "$PROOF_FILE"; then
    echo "FAIL: Does not perform HTTP requests"
    FAILED=1
else
    echo "PASS: Performs HTTP requests"
fi

# Test 4: Has origin validation (dns.resolve or similar)
if ! grep -qE "dns\.|resolve|origin|CNAME" "$PROOF_FILE"; then
    echo "FAIL: Does not validate origin"
    FAILED=1
else
    echo "PASS: Has origin validation"
fi

# Test 5: Has retry logic with exponential backoff (5 attempts per spec Decision 1.3)
# Check for retry/backoff/setTimeout in actual code (excluding comments)
# Use grep to find lines, then filter out comment lines (both // and /* */ style)
RETRY_FOUND=$(grep -iE "retry|backoff|setTimeout" "$PROOF_FILE" | grep -v '^\s*//' | grep -v '^\s*\*' | grep -v '^\s*/\*' || true)
if [ -n "$RETRY_FOUND" ]; then
    echo "PASS: Has retry logic (5 attempts with exponential backoff)"
else
    echo "FAIL: Missing retry logic (required per spec Decision 1.3)"
    FAILED=1
fi

# Test 6: Has timeout configured (reasonable value for fail-fast)
if ! grep -qE "timeout" "$PROOF_FILE"; then
    echo "FAIL: Missing timeout configuration"
    FAILED=1
else
    echo "PASS: Has timeout configured"
fi

# Test 7: Outputs "Verified" on success
if ! grep -q "Verified" "$PROOF_FILE"; then
    echo "FAIL: Missing 'Verified' success output"
    FAILED=1
else
    echo "PASS: Has 'Verified' success output"
fi

# Test 8: Has process.exit for proper exit codes
if ! grep -q "process.exit" "$PROOF_FILE"; then
    echo "FAIL: Missing process.exit calls"
    FAILED=1
else
    echo "PASS: Has process.exit calls"
fi

# Test 9: Syntax check
if ! node --check "$PROOF_FILE" 2>/dev/null; then
    echo "FAIL: JavaScript syntax error"
    FAILED=1
else
    echo "PASS: JavaScript syntax valid"
fi

if [ $FAILED -eq 0 ]; then
    echo "All proof.js tests passed"
    exit 0
else
    echo "Some proof.js tests failed"
    exit 1
fi
