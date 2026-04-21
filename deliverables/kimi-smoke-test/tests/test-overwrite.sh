#!/usr/bin/env bash
set -euo pipefail

# test-overwrite.sh
# Verifies run.sh overwrites (not appends) pulse.txt on repeated runs.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
ROUND_DIR="${REPO_ROOT}/rounds/kimi-smoke-test"
PULSE="${ROUND_DIR}/pulse.txt"
LOCKED_SENTENCE='Kimi drove this.'

echo "=== test-overwrite ==="

# Ensure pulse.txt exists from a prior run
cd "$ROUND_DIR"

# First run
./run.sh

# Second run
./run.sh

# Content must still be exact
if ! grep -Fxq "$LOCKED_SENTENCE" "$PULSE"; then
    echo "FAIL: pulse.txt does not contain exact locked sentence after second run"
    cat -A "$PULSE"
    exit 1
fi
echo "PASS: content exact after second run"

# Must be exactly one line (no append artifacts)
LINE_COUNT=$(cat "$PULSE" | wc -l)
if [[ "$LINE_COUNT" -ne 1 ]]; then
    echo "FAIL: expected 1 line, got $LINE_COUNT (possible append)"
    cat -A "$PULSE"
    exit 1
fi
echo "PASS: exactly one line (no append)"

echo "=== all checks passed ==="
exit 0
