#!/bin/bash
# Test: Verify no banned patterns (TODO, FIXME, etc.)
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Testing for banned patterns..."

# Search for banned patterns, excluding test scripts themselves and this script
BANNED=$(grep -riE 'TODO|FIXME|HACK|XXX|placeholder|implement me|fix later' \
    --include='*.js' \
    --include='*.json' \
    --include='*.yml' \
    --include='*.yaml' \
    --exclude-dir='tests' \
    . 2>/dev/null || true)

if [ -n "$BANNED" ]; then
    echo "FAIL: Found banned patterns:"
    echo "$BANNED"
    exit 1
else
    echo "PASS: No banned patterns found"
    exit 0
fi
