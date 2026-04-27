#!/usr/bin/env bash
set -euo pipefail

# WP Sentinel — PHP Syntax Lint Test
# Runs php -l on every .php file in the plugin directory.

PLUGIN_DIR="${1:-wp-sentinel}"
ERRORS=0

echo "=== WP Sentinel PHP Syntax Test ==="
echo "Plugin dir: $PLUGIN_DIR"
echo ""

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo "FAIL: Plugin directory $PLUGIN_DIR does not exist"
  echo "RESULT: aborting"
  exit 1
fi

if ! command -v php &>/dev/null; then
  echo "SKIP: php not installed, cannot lint"
  exit 0
fi

while IFS= read -r -d '' file; do
  OUTPUT=$(php -l "$file" 2>&1)
  if echo "$OUTPUT" | grep -q "No syntax errors"; then
    echo "PASS: $file"
  else
    echo "FAIL: $file"
    echo "$OUTPUT"
    ((ERRORS++)) || true
  fi
done < <(find "$PLUGIN_DIR" -name "*.php" -print0)

echo ""
if [[ $ERRORS -gt 0 ]]; then
  echo "RESULT: $ERRORS file(s) with syntax errors"
  exit 1
else
  echo "RESULT: all PHP files pass syntax lint"
  exit 0
fi
