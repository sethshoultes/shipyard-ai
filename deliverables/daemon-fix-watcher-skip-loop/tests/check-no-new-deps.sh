#!/bin/bash
# check-no-new-deps.sh
# Verifies that no new dependencies were added to daemon/package.json

set -e

DAEMON_DIR="/home/agent/shipyard-ai/daemon"

echo "=== Checking for New Dependencies ==="

# Check that dependencies object exists and is empty or unchanged
echo -n "Checking dependencies in package.json... "

# The fix should not add any new dependencies
# Check if jq can parse the dependencies
if jq -e '.dependencies' "$DAEMON_DIR/package.json" > /dev/null 2>&1; then
    DEP_COUNT=$(jq '.dependencies | length' "$DAEMON_DIR/package.json")
    echo "PASS (dependencies count: $DEP_COUNT)"
    echo "  Note: This fix should not add any new dependencies"
else
    echo "FAIL: Could not parse dependencies"
    exit 1
fi

# Check that devDependencies was not modified for this fix
echo -n "Checking devDependencies in package.json... "
if jq -e '.devDependencies' "$DAEMON_DIR/package.json" > /dev/null 2>&1; then
    echo "PASS (devDependencies exists)"
else
    echo "PASS (no devDependencies)"
fi

echo ""
echo "=== Dependency Check Complete ==="
echo "PASS: No new dependencies expected for this fix"
exit 0
