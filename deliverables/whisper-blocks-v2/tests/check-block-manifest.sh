#!/usr/bin/env bash
# check-block-manifest.sh — Validate block.json schema and required fields.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILE="$ROOT/src/block.json"

if [[ ! -f "$FILE" ]]; then
  echo "FAIL: src/block.json does not exist"
  exit 1
fi

# Must be valid JSON
if ! jq empty "$FILE" > /dev/null 2>&1; then
  echo "FAIL: src/block.json is not valid JSON"
  exit 1
fi

echo "OK: src/block.json is valid JSON"

# Required fields
for field in apiVersion name title category attributes; do
  val=$(jq -r ".$field // empty" "$FILE")
  if [[ -z "$val" ]]; then
    echo "FAIL: missing required field '$field' in block.json"
    exit 1
  fi
  echo "OK: block.json has '$field'"
done

# apiVersion must be 3
if [[ "$(jq '.apiVersion' "$FILE")" != "3" ]]; then
  echo "FAIL: apiVersion must be 3"
  exit 1
fi

echo "PASS: block.json manifest is valid"
