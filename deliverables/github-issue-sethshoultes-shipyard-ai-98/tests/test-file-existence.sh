#!/bin/bash
# Test: Verify all required files exist
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Testing file existence..."

FAILED=0

# Test 1: domains.json exists
if [ ! -f "domains.json" ]; then
    echo "FAIL: domains.json does not exist"
    FAILED=1
else
    echo "PASS: domains.json exists"
fi

# Test 2: scripts/proof.js exists
if [ ! -f "scripts/proof.js" ]; then
    echo "FAIL: scripts/proof.js does not exist"
    FAILED=1
else
    echo "PASS: scripts/proof.js exists"
fi

# Test 3: .github/workflows/deploy-website.yml exists
if [ ! -f ".github/workflows/deploy-website.yml" ]; then
    echo "FAIL: .github/workflows/deploy-website.yml does not exist"
    FAILED=1
else
    echo "PASS: .github/workflows/deploy-website.yml exists"
fi

if [ $FAILED -eq 0 ]; then
    echo "All file existence tests passed"
    exit 0
else
    echo "Some file existence tests failed"
    exit 1
fi
