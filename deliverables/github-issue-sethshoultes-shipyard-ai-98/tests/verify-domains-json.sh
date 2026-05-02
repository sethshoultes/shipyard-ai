#!/bin/bash
# verify-domains-json.sh — Validate domains.json structure and schema
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
DOMAINS_FILE="$REPO_ROOT/domains.json"

echo "=== Verifying domains.json ==="

# Test 1: File exists
echo -n "1. File exists... "
if [ -f "$DOMAINS_FILE" ]; then
    echo "PASS"
else
    echo "FAIL: $DOMAINS_FILE does not exist"
    exit 1
fi

# Test 2: Valid JSON syntax (Node.js)
echo -n "2. Valid JSON syntax (Node)... "
if node -e "JSON.parse(require('fs').readFileSync('$DOMAINS_FILE'))" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Invalid JSON syntax"
    exit 1
fi

# Test 3: Valid JSON syntax (Python)
echo -n "3. Valid JSON syntax (Python)... "
if python3 -m json.tool "$DOMAINS_FILE" > /dev/null 2>&1; then
    echo "PASS"
else
    echo "FAIL: Invalid JSON syntax (Python)"
    exit 1
fi

# Test 4: Is a JSON array
echo -n "4. Is a JSON array... "
if node -e "const d=JSON.parse(require('fs').readFileSync('$DOMAINS_FILE')); if(!Array.isArray(d)) process.exit(1);" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Root must be an array"
    exit 1
fi

# Test 5: Has at least one domain entry
echo -n "5. Has at least one domain entry... "
LENGTH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DOMAINS_FILE')).length)")
if [ "$LENGTH" -gt 0 ]; then
    echo "PASS ($LENGTH entries)"
else
    echo "FAIL: Empty array"
    exit 1
fi

# Test 6: Each entry has 'domain' key
echo -n "6. Each entry has 'domain' key... "
if node -e "const d=JSON.parse(require('fs').readFileSync('$DOMAINS_FILE')); d.forEach(e=>{if(!e.domain)process.exit(1)})" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Missing 'domain' key"
    exit 1
fi

# Test 7: Each entry has 'expected_origin' key
echo -n "7. Each entry has 'expected_origin' key... "
if node -e "const d=JSON.parse(require('fs').readFileSync('$DOMAINS_FILE')); d.forEach(e=>{if(!e.expected_origin)process.exit(1)})" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Missing 'expected_origin' key"
    exit 1
fi

# Test 8: Each entry has 'routes' key (array)
echo -n "8. Each entry has 'routes' key (array)... "
if node -e "const d=JSON.parse(require('fs').readFileSync('$DOMAINS_FILE')); d.forEach(e=>{if(!Array.isArray(e.routes))process.exit(1)})" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Missing or invalid 'routes' key"
    exit 1
fi

# Test 9: Root path '/' is in routes (v1 requirement)
echo -n "9. Root path '/' in routes (v1)... "
if node -e "const d=JSON.parse(require('fs').readFileSync('$DOMAINS_FILE')); d.forEach(e=>{if(!e.routes.includes('/'))process.exit(1)})" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Root path '/' not in routes"
    exit 1
fi

# Test 10: Domain contains 'shipyard.company'
echo -n "10. Contains shipyard.company domain... "
if grep -q "shipyard.company" "$DOMAINS_FILE"; then
    echo "PASS"
else
    echo "FAIL: shipyard.company not found"
    exit 1
fi

# Test 11: expected_origin contains 'pages.cloudflare.com'
echo -n "11. expected_origin is pages.cloudflare.com... "
if grep -q "pages.cloudflare.com" "$DOMAINS_FILE"; then
    echo "PASS"
else
    echo "FAIL: pages.cloudflare.com not found"
    exit 1
fi

echo ""
echo "=== All domains.json verifications PASSED ==="
exit 0
