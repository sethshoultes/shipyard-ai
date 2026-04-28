#!/usr/bin/env bash
set -euo pipefail

# Test: Run TypeScript typecheck (tsc --noEmit) from deliverable root.
# Exit 0 on pass, non-zero on fail.

DELIVERABLE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DELIVERABLE_ROOT"

if [[ ! -f "tsconfig.json" ]]; then
  echo "[FAIL] tsconfig.json not found." >&2
  exit 1
fi

if ! command -v npx &>/dev/null; then
  echo "[FAIL] npx not available. Run 'npm install' first." >&2
  exit 1
fi

echo "Running tsc --noEmit ..."
if npx tsc --noEmit; then
  echo "TYPECHECK TEST PASSED."
  exit 0
else
  echo "TYPECHECK TEST FAILED: TypeScript errors detected." >&2
  exit 1
fi
