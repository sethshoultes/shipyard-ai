#!/bin/bash
# Test: Verify GitHub Actions workflow has required structure
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

WORKFLOW_FILE=".github/workflows/deploy-website.yml"

echo "Testing workflow structure..."

FAILED=0

# Check workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "FAIL: Workflow file does not exist"
    exit 1
fi

# Test 1: Has push trigger
if ! grep -q "on:" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing 'on:' trigger"
    FAILED=1
else
    echo "PASS: Has 'on:' trigger"
fi

# Test 2: Has paths filter for website
if ! grep -q "paths:" "$WORKFLOW_FILE" || ! grep -q "website/\*\*" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing paths filter for website/**"
    FAILED=1
else
    echo "PASS: Has paths filter for website/**"
fi

# Test 3: Has npm ci step
if ! grep -q "npm ci" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing 'npm ci' step"
    FAILED=1
else
    echo "PASS: Has 'npm ci' step"
fi

# Test 4: Has npm run build step
if ! grep -q "npm run build" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing 'npm run build' step"
    FAILED=1
else
    echo "PASS: Has 'npm run build' step"
fi

# Test 5: Has wrangler pages deploy
if ! grep -q "wrangler pages deploy" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing 'wrangler pages deploy' step"
    FAILED=1
else
    echo "PASS: Has 'wrangler pages deploy' step"
fi

# Test 6: Has Cloudflare API token reference
if ! grep -q "CLOUDFLARE_API_TOKEN" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing CLOUDFLARE_API_TOKEN reference"
    FAILED=1
else
    echo "PASS: Has CLOUDFLARE_API_TOKEN reference"
fi

# Test 7: Has Cloudflare account ID reference
if ! grep -q "CLOUDFLARE_ACCOUNT_ID" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing CLOUDFLARE_ACCOUNT_ID reference"
    FAILED=1
else
    echo "PASS: Has CLOUDFLARE_ACCOUNT_ID reference"
fi

# Test 8: Has proof verification step
if ! grep -qiE "proof|verify" "$WORKFLOW_FILE"; then
    echo "FAIL: Missing proof/verification step"
    FAILED=1
else
    echo "PASS: Has proof/verification step"
fi

if [ $FAILED -eq 0 ]; then
    echo "All workflow structure tests passed"
    exit 0
else
    echo "Some workflow structure tests failed"
    exit 1
fi
