#!/bin/bash
# Test: Verify domains.json is valid and has correct schema
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Testing domains.json..."

FAILED=0

# Test 1: Valid JSON
if ! cat domains.json | jq . > /dev/null 2>&1; then
    echo "FAIL: domains.json is not valid JSON"
    FAILED=1
else
    echo "PASS: domains.json is valid JSON"
fi

# Test 2: Has at least one domain
DOMAIN_COUNT=$(cat domains.json | jq '. | length' 2>/dev/null || echo "0")
if [ "$DOMAIN_COUNT" -lt 1 ]; then
    echo "FAIL: domains.json has no domains (count: $DOMAIN_COUNT)"
    FAILED=1
else
    echo "PASS: domains.json has $DOMAIN_COUNT domain(s)"
fi

# Test 3: Each domain has 'domain' field
MISSING_DOMAIN=$(cat domains.json | jq -r '.[] | select(.domain == null) | "missing domain field"' 2>/dev/null || true)
if [ -n "$MISSING_DOMAIN" ]; then
    echo "FAIL: Some entries missing 'domain' field"
    FAILED=1
else
    echo "PASS: All entries have 'domain' field"
fi

# Test 4: Each domain has 'expected_origin' field
MISSING_ORIGIN=$(cat domains.json | jq -r '.[] | select(.expected_origin == null) | "missing expected_origin field"' 2>/dev/null || true)
if [ -n "$MISSING_ORIGIN" ]; then
    echo "FAIL: Some entries missing 'expected_origin' field"
    FAILED=1
else
    echo "PASS: All entries have 'expected_origin' field"
fi

if [ $FAILED -eq 0 ]; then
    echo "All domains.json tests passed"
    exit 0
else
    echo "Some domains.json tests failed"
    exit 1
fi
