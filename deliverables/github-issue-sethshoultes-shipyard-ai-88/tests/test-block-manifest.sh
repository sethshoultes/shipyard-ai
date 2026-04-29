#!/bin/bash
# test-block-manifest.sh
# Validates block.json syntax and required fields.
# Usage: ./test-block-manifest.sh [PLUGIN_DIR]
# Exit 0 on pass, non-zero on fail.

set -e

PLUGIN_DIR="${1:-projects/scribe}"
BLOCK_JSON="$PLUGIN_DIR/block.json"

if [ ! -f "$BLOCK_JSON" ]; then
  echo "FAIL: block.json not found at $BLOCK_JSON"
  exit 1
fi

# Validate JSON syntax
if ! python3 -c "import json,sys; json.load(open('$BLOCK_JSON'))" 2>/dev/null; then
  echo "FAIL: block.json is not valid JSON"
  exit 1
fi

# Check required fields
required_fields=("name" "title" "category" "editorScript" "editorStyle" "style")
fail=0
for field in "${required_fields[@]}"; do
  if ! python3 -c "import json; d=json.load(open('$BLOCK_JSON')); exit(0 if '$field' in d else 1)" 2>/dev/null; then
    echo "FAIL: block.json missing required field: $field"
    fail=1
  fi
done

if [ "$fail" -eq 1 ]; then
  exit 1
fi

echo "PASS: block.json is valid JSON with required fields"
exit 0
