#!/usr/bin/env bash
set -euo pipefail

# Test: Verify banned dependencies and patterns are absent.
# Banned: bull, ioredis, @aws-sdk/*, aws-sdk, redis

DELIVERABLE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DELIVERABLE_ROOT"

FAIL=0

# 1. Check package.json for banned dependency names
echo "Checking package.json for banned dependencies..."
if grep -iE 'bull|ioredis|@aws-sdk|aws-sdk|redis' package.json 2>/dev/null; then
  echo "  [FAIL] package.json contains banned dependency pattern." >&2
  FAIL=1
else
  echo "  [OK] package.json clean"
fi

# 2. Check src/ and tests/ for banned import strings
echo "Checking src/ and tests/ for banned patterns..."
if grep -rnE 'bull|ioredis|@aws-sdk|aws-sdk|redis' src/ tests/ 2>/dev/null; then
  echo "  [FAIL] Source/tests contain banned pattern." >&2
  FAIL=1
else
  echo "  [OK] Source/tests clean"
fi

# 3. Ensure secrets are not hardcoded (basic heuristic: look for sk-OPENAI or literal API keys)
echo "Checking for hardcoded secrets heuristic..."
if grep -rnE 'sk-[a-zA-Z0-9]{20,}' src/ tests/ wrangler.toml 2>/dev/null; then
  echo "  [FAIL] Possible hardcoded secret detected." >&2
  FAIL=1
else
  echo "  [OK] No obvious hardcoded secrets"
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "BANNED PATTERNS TEST FAILED." >&2
  exit 1
fi

echo "BANNED PATTERNS TEST PASSED."
exit 0
