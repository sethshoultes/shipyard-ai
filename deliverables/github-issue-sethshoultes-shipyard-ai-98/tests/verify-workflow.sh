#!/bin/bash
# verify-workflow.sh — Validate .github/workflows/deploy-website.yml structure
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
WORKFLOW_FILE="$REPO_ROOT/.github/workflows/deploy-website.yml"

echo "=== Verifying deploy-website.yml ==="

# Test 1: File exists
echo -n "1. File exists... "
if [ -f "$WORKFLOW_FILE" ]; then
    echo "PASS"
else
    echo "FAIL: $WORKFLOW_FILE does not exist"
    exit 1
fi

# Test 2: Valid YAML syntax (Python)
echo -n "2. Valid YAML syntax... "
if python3 -c "import yaml; yaml.safe_load(open('$WORKFLOW_FILE'))" 2>/dev/null; then
    echo "PASS"
else
    echo "FAIL: Invalid YAML syntax"
    exit 1
fi

# Test 3: R-DEPLOY-001 - Trigger on main branch
echo -n "3. R-DEPLOY-001: Trigger on main branch... "
if grep -A10 "^on:" "$WORKFLOW_FILE" | grep -q "main"; then
    echo "PASS"
else
    echo "FAIL: Missing 'main' in branches"
    exit 1
fi

# Test 4: R-DEPLOY-001 - Trigger on website/** path
echo -n "4. R-DEPLOY-001: Trigger on website/** path... "
if grep -q "website/\*\*" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing 'website/**' in paths"
    exit 1
fi

# Test 5: R-DEPLOY-002 - npm ci exists
echo -n "5. R-DEPLOY-002: npm ci exists... "
if grep -q "npm ci" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing 'npm ci'"
    exit 1
fi

# Test 6: R-DEPLOY-002 - npm run build exists
echo -n "6. R-DEPLOY-002: npm run build exists... "
if grep -q "npm run build" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing 'npm run build'"
    exit 1
fi

# Test 7: R-DEPLOY-003 - wrangler pages deploy exists
echo -n "7. R-DEPLOY-003: wrangler pages deploy exists... "
if grep -q "wrangler pages deploy" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing 'wrangler pages deploy'"
    exit 1
fi

# Test 8: R-DEPLOY-003 - Project name is shipyard-ai
echo -n "8. R-DEPLOY-003: Project name is shipyard-ai... "
if grep -q "shipyard-ai" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing project name 'shipyard-ai'"
    exit 1
fi

# Test 9: R-DEPLOY-004 - CLOUDFLARE_API_TOKEN referenced
echo -n "9. R-DEPLOY-004: CLOUDFLARE_API_TOKEN referenced... "
if grep -q "CLOUDFLARE_API_TOKEN" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing CLOUDFLARE_API_TOKEN"
    exit 1
fi

# Test 10: R-DEPLOY-004 - CLOUDFLARE_ACCOUNT_ID referenced
echo -n "10. R-DEPLOY-004: CLOUDFLARE_ACCOUNT_ID referenced... "
if grep -q "CLOUDFLARE_ACCOUNT_ID" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing CLOUDFLARE_ACCOUNT_ID"
    exit 1
fi

# Test 11: R-PROOF-001 - Proof step exists
echo -n "11. R-PROOF-001: Proof step exists... "
if grep -qi "proof" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing Proof step"
    exit 1
fi

# Test 12: R-PROOF-010 - Proof calls node scripts/proof.js
echo -n "12. R-PROOF-010: Proof calls node scripts/proof.js... "
if grep -q "node scripts/proof.js" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing 'node scripts/proof.js'"
    exit 1
fi

# Test 13: R-PROOF-001 - Proof step has if guard for main
echo -n "13. R-PROOF-001: Proof step has if guard... "
if grep -A2 "proof" "$WORKFLOW_FILE" | grep -q "github.ref.*main"; then
    echo "PASS"
else
    echo "FAIL: Missing if guard for Proof step"
    exit 1
fi

# Test 14: R-PROOF-009 - PROOF_DOMAINS_PATH env var set
echo -n "14. R-PROOF-009: PROOF_DOMAINS_PATH env var set... "
if grep -q "PROOF_DOMAINS_PATH" "$WORKFLOW_FILE"; then
    echo "PASS"
else
    echo "FAIL: Missing PROOF_DOMAINS_PATH"
    exit 1
fi

# Test 15: Proof step is AFTER deploy step (check ordering)
echo -n "15. Proof step ordering (after deploy)... "
DEPLOY_LINE=$(grep -n "wrangler pages deploy" "$WORKFLOW_FILE" | head -1 | cut -d: -f1)
PROOF_LINE=$(grep -n "node scripts/proof.js" "$WORKFLOW_FILE" | head -1 | cut -d: -f1)
if [ -n "$DEPLOY_LINE" ] && [ -n "$PROOF_LINE" ] && [ "$PROOF_LINE" -gt "$DEPLOY_LINE" ]; then
    echo "PASS (deploy:$DEPLOY_LINE -> proof:$PROOF_LINE)"
else
    echo "FAIL: Proof must come after deploy"
    exit 1
fi

# Test 16: No dashboard/knobs/retry configuration (v1 constraint)
echo -n "16. No dashboard/knobs/retry config (v1)... "
if grep -E "(dashboard|retry|slack|pagerduty|cron)" "$WORKFLOW_FILE" | grep -v "^#" > /dev/null 2>&1; then
    echo "FAIL: Found out-of-scope config"
    exit 1
else
    echo "PASS"
fi

echo ""
echo "=== All workflow verifications PASSED ==="
exit 0
