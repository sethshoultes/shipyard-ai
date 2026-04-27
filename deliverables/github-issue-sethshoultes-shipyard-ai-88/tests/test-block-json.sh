#!/usr/bin/env bash
set -euo pipefail

BASE="projects/whisper/build/whisper"
FILE="$BASE/block.json"

echo "=== Test: block.json Validity ==="

if [ ! -f "$FILE" ]; then
  echo "FAIL: block.json not found"
  exit 1
fi

if ! jq empty "$FILE" 2>/dev/null; then
  echo "FAIL: block.json is not valid JSON"
  exit 1
fi

for field in name title category editorScript editorStyle style; do
  if ! jq -e ".$field" "$FILE" >/dev/null 2>&1; then
    echo "FAIL: Missing required field: $field"
    exit 1
  fi
  echo "OK: field '$field' present"
done

name=$(jq -r '.name' "$FILE")
if [[ ! "$name" =~ ^whisper/ ]]; then
  echo "FAIL: Block name must use 'whisper/' prefix, got: $name"
  exit 1
fi

echo "PASS: block.json is valid."
