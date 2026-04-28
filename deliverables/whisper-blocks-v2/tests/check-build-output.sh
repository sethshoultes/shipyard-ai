#!/usr/bin/env bash
# check-build-output.sh — Verify npm run build produced expected artifacts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/build"
FAIL=0

if [[ ! -d "$BUILD" ]]; then
  echo "FAIL: build/ directory does not exist (run npm run build first)"
  exit 1
fi

REQUIRED=(
  "block.json"
  "index.js"
)

for f in "${REQUIRED[@]}"; do
  if [[ ! -f "$BUILD/$f" ]]; then
    echo "FAIL: missing build artifact $f"
    FAIL=1
  else
    echo "OK: build/$f exists"
  fi
done

if [[ "$FAIL" -eq 1 ]]; then
  echo "FAIL: build output incomplete"
  exit 1
fi

echo "PASS: build output contains required artifacts"
