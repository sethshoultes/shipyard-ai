#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${PLUGIN_DIR:-projects/scribe/build/scribe}"

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo "FAIL: plugin directory does not exist: $PLUGIN_DIR"
  exit 1
fi

fail=0

# Validate block.json
if ! python3 -m json.tool "$PLUGIN_DIR/block.json" > /dev/null 2>&1; then
  echo "FAIL: block.json is invalid JSON"
  fail=1
else
  echo "PASS: block.json is valid JSON"
fi

# Syntax-check JS source files
JS_FILES=$(find "$PLUGIN_DIR/src" -name "*.js" 2>/dev/null || true)
if [[ -z "$JS_FILES" ]]; then
  echo "WARN: no JS source files found in $PLUGIN_DIR/src"
fi

for f in $JS_FILES; do
  if ! node --check "$f" > /dev/null 2>&1; then
    echo "FAIL: JS syntax error in $f"
    fail=1
  else
    echo "PASS: JS syntax OK in $f"
  fi
done

# Verify compiled build artifacts exist
for artifact in "$PLUGIN_DIR/build/block.js" "$PLUGIN_DIR/build/block.css" "$PLUGIN_DIR/build/frontend.js"; do
  if [[ ! -f "$artifact" ]]; then
    echo "FAIL: missing build artifact: $artifact"
    fail=1
  else
    echo "PASS: build artifact exists: $artifact"
  fi
done

if [[ $fail -eq 1 ]]; then
  echo "Build validation test FAILED."
  exit 1
fi

echo "Build validation passed."
exit 0
