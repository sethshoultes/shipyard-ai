#!/usr/bin/env bash
set -euo pipefail

# test-content.sh
# Verifies pulse.txt exists and contains exactly the locked sentence.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
PULSE="${REPO_ROOT}/rounds/kimi-smoke-test/pulse.txt"
LOCKED_SENTENCE='Kimi drove this.'

echo "=== test-content ==="

# Ensure pulse.txt exists (run.sh must be executed first)
if [[ ! -f "$PULSE" ]]; then
    echo "FAIL: pulse.txt does not exist"
    exit 1
fi
echo "PASS: pulse.txt exists"

# Exact content match (no extra whitespace, exact line)
if ! grep -Fxq "$LOCKED_SENTENCE" "$PULSE"; then
    echo "FAIL: pulse.txt does not contain exactly '${LOCKED_SENTENCE}'"
    echo "Actual content:"
    cat -A "$PULSE"
    exit 1
fi
echo "PASS: pulse.txt contains exact locked sentence"

# Verify no trailing carriage returns
if file "$PULSE" | grep -qi 'crlf'; then
    echo "FAIL: pulse.txt has CRLF line endings"
    exit 1
fi
echo "PASS: pulse.txt has Unix line endings"

echo "=== all checks passed ==="
exit 0
