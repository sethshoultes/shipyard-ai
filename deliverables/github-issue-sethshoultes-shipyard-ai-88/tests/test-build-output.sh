#!/usr/bin/env bash
set -euo pipefail

BASE="projects/whisper/build/whisper"

echo "=== Test: Build Output ==="

for f in "$BASE/build/block.js" "$BASE/build/block.css" "$BASE/build/frontend.js"; do
  if [ ! -s "$f" ]; then
    echo "FAIL: Missing or empty build artifact: $f"
    exit 1
  fi
  echo "OK: $f exists and is non-empty"
done

# Check no console.log in compiled JS
for f in "$BASE/build/block.js" "$BASE/build/frontend.js"; do
  if grep -q "console.log" "$f"; then
    echo "FAIL: console.log found in compiled $f"
    exit 1
  fi
  echo "OK: No console.log in $(basename "$f")"
done

echo "PASS: Build output verified."
