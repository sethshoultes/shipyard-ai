#!/usr/bin/env bash
# check-readme.sh — Verify readme.txt meets WordPress.org standards.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILE="$ROOT/readme.txt"

if [[ ! -f "$FILE" ]]; then
  echo "FAIL: readme.txt does not exist"
  exit 1
fi

REQUIRED_HEADERS=(
  "=== Scribe ==="
  "Stable tag:"
  "Requires at least:"
  "Tested up to:"
  "License:"
)

FAIL=0
for h in "${REQUIRED_HEADERS[@]}"; do
  if ! grep -q "$h" "$FILE"; then
    echo "FAIL: readme.txt missing '$h'"
    FAIL=1
  else
    echo "OK: readme.txt contains '$h'"
  fi
done

if [[ "$FAIL" -eq 1 ]]; then
  exit 1
fi

echo "PASS: readme.txt meets WP.org standards"
