#!/usr/bin/env bash
set -euo pipefail

# test-no-creep.sh
# Banned-pattern scan: no imports, modules, config files, env vars, etc.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
RUN_SH="${REPO_ROOT}/rounds/kimi-smoke-test/run.sh"

echo "=== test-no-creep ==="

# 1. No source, import, require, curl, npm, node, or env-var reads
BANNED_PATTERNS=('source ' '\. ' 'import ' 'require\(' 'curl' 'npm' 'node' '\$[A-Z]' 'export ')

for pattern in "${BANNED_PATTERNS[@]}"; do
    if grep -qE "$pattern" "$RUN_SH"; then
        echo "FAIL: run.sh contains banned pattern: $pattern"
        exit 1
    fi
done
echo "PASS: no banned dependency patterns found"

# 2. Only expected commands: echo, redirection, shebang
# After removing comments and blank lines, should be a single echo > file command
NON_COMMENT_NON_BLANK=$(grep -vE '^#|^$' "$RUN_SH" | wc -l)
if [[ "$NON_COMMENT_NON_BLANK" -ne 1 ]]; then
    echo "FAIL: expected exactly 1 non-comment, non-blank line in run.sh, got $NON_COMMENT_NON_BLANK"
    grep -vE '^#|^$' "$RUN_SH"
    exit 1
fi
echo "PASS: run.sh is a single command"

# 3. No build-creep artifacts (JS, JSON, YAML, TS, node_modules, package files, etc.)
ROUND_DIR="${REPO_ROOT}/rounds/kimi-smoke-test"
CREEP_PATTERNS=('\.js$' '\.json$' '\.yaml$' '\.yml$' '\.ts$' '^node_modules$' '^package' '^Makefile$' '^Dockerfile$')

for pattern in "${CREEP_PATTERNS[@]}"; do
    if ls -1 "$ROUND_DIR" | grep -qE "$pattern"; then
        echo "FAIL: build-creep artifact found matching: $pattern"
        ls -1 "$ROUND_DIR" | grep -E "$pattern"
        exit 1
    fi
done
echo "PASS: no build-creep artifacts in round dir"

# 4. Criterion 12: run.sh is the only build product; decisions.md and debate files are pre-existing
# The build produced exactly 1 meaningful file: run.sh
BUILD_PRODUCTS=$(ls -1 "$ROUND_DIR" | grep -vE '^\.' | grep -v '^pulse\.txt$' | grep -v '^decisions\.md$' | grep -v '^essence\.md$' | grep -v '^round-' | wc -l)
if [[ "$BUILD_PRODUCTS" -ne 1 ]]; then
    echo "FAIL: expected exactly 1 build product (run.sh), found $BUILD_PRODUCTS unexpected files"
    ls -1 "$ROUND_DIR" | grep -vE '^\.' | grep -v '^pulse\.txt$' | grep -v '^decisions\.md$' | grep -v '^essence\.md$' | grep -v '^round-'
    exit 1
fi
echo "PASS: exactly one build product (run.sh) in round dir"

echo "=== all checks passed ==="
exit 0
