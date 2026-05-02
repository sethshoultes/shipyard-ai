#!/bin/bash
# verify-proof-script.sh — Validate scripts/proof.js structure and constraints
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
PROOF_SCRIPT="$REPO_ROOT/scripts/proof.js"

echo "=== Verifying scripts/proof.js ==="

# Test 1: File exists
echo -n "1. File exists... "
if [ -f "$PROOF_SCRIPT" ]; then
    echo "PASS"
else
    echo "FAIL: $PROOF_SCRIPT does not exist"
    exit 1
fi

# Test 2: File is executable
echo -n "2. File is executable... "
if [ -x "$PROOF_SCRIPT" ]; then
    echo "PASS"
else
    echo "FAIL: File is not executable (run: chmod +x $PROOF_SCRIPT)"
    exit 1
fi

# Test 3: Has Node.js shebang
echo -n "3. Has Node.js shebang... "
if head -1 "$PROOF_SCRIPT" | grep -q "^#!/usr/bin/env node"; then
    echo "PASS"
else
    echo "FAIL: Missing '#!/usr/bin/env node' shebang"
    exit 1
fi

# Test 4: No external npm dependencies (only built-ins)
echo -n "4. No external npm dependencies... "
# Check that imports are only for: https, dns, fs, path, url
if grep -E "^(import|require)\(" "$PROOF_SCRIPT" | grep -vE "(https|dns|fs|path|url)" | grep -v "^//" > /dev/null 2>&1; then
    echo "FAIL: Found non-built-in imports"
    grep -E "^(import|require)\(" "$PROOF_SCRIPT" | grep -vE "(https|dns|fs|path|url)"
    exit 1
else
    echo "PASS"
fi

# Test 5: No child_process calls
echo -n "5. No child_process calls... "
if grep -c "child_process" "$PROOF_SCRIPT" 2>/dev/null | grep -q "^0$"; then
    echo "PASS"
else
    echo "FAIL: child_process found (not allowed)"
    exit 1
fi

# Test 6: No wrangler calls
echo -n "6. No wrangler calls... "
if grep -c "wrangler" "$PROOF_SCRIPT" 2>/dev/null | grep -q "^0$"; then
    echo "PASS"
else
    echo "FAIL: wrangler found (not allowed)"
    exit 1
fi

# Test 7: No retry logic (setTimeout, setInterval, backoff)
echo -n "7. No retry logic... "
if grep -E "(setTimeout|setInterval|backoff|retry)" "$PROOF_SCRIPT" | grep -v "^//" | grep -v "retry-ready" > /dev/null 2>&1; then
    echo "FAIL: Retry logic found (not allowed in v1)"
    exit 1
else
    echo "PASS"
fi

# Test 8: Reads domains.json or PROOF_DOMAINS_PATH
echo -n "8. Reads domains.json config... "
if grep -E "(domains\.json|PROOF_DOMAINS_PATH)" "$PROOF_SCRIPT" > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL: Does not read domains.json config"
    exit 1
fi

# Test 9: DNS CNAME resolution
echo -n "9. DNS CNAME resolution... "
if grep -q "resolveCname" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing dns.resolveCname"
    exit 1
fi

# Test 10: DNS A record fallback (for apex domains)
echo -n "10. DNS A record fallback... "
if grep -q "resolve4" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing dns.resolve4 fallback"
    exit 1
fi

# Test 11: HTTPS GET request
echo -n "11. HTTPS GET request... "
if grep -E "https\.(get|request)" "$PROOF_SCRIPT" > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL: Missing https.get"
    exit 1
fi

# Test 12: User-Agent header
echo -n "12. User-Agent header... "
if grep -q "User-Agent" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing User-Agent header"
    exit 1
fi

# Test 13: HTTP 200 status check
echo -n "13. HTTP 200 status check... "
if grep -E "(statusCode|status).*200|200.*(statusCode|status)" "$PROOF_SCRIPT" > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL: Missing HTTP 200 check"
    exit 1
fi

# Test 14: Cloudflare header validation (CF-RAY or Server)
echo -n "14. Cloudflare header validation... "
if grep -E "(CF-RAY|cf-ray|cloudflare)" "$PROOF_SCRIPT" > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL: Missing CF header check"
    exit 1
fi

# Test 15: Promise.all for parallel execution
echo -n "15. Promise.all for parallel execution... "
if grep -q "Promise.all" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing Promise.all"
    exit 1
fi

# Test 16: Success output format (Verified)
echo -n "16. Success output format (Verified)... "
if grep -q "Verified" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing 'Verified' output"
    exit 1
fi

# Test 17: ISO8601 timestamp in output
echo -n "17. ISO8601 timestamp in output... "
if grep -E "toISOString" "$PROOF_SCRIPT" > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL: Missing toISOString"
    exit 1
fi

# Test 18: Exit code 1 on failure
echo -n "18. Exit code 1 on failure... "
if grep -q "process.exit(1)" "$PROOF_SCRIPT" || grep -q "process.exitCode = 1" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing process.exit(1)"
    exit 1
fi

# Test 19: Exit code 0 on success
echo -n "19. Exit code 0 on success... "
if grep -qE "process\.exit\(0\)|process\.exitCode = 0|process\.exit\(.*\? 0 :" "$PROOF_SCRIPT"; then
    echo "PASS"
else
    echo "FAIL: Missing process.exit(0)"
    exit 1
fi

# Test 20: Syntax check (Node.js can parse it)
echo -n "20. Syntax check (Node.js)... "
if node --check "$PROOF_SCRIPT" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Syntax error"
    exit 1
fi

echo ""
echo "=== All proof.js verifications PASSED ==="
exit 0
