#!/bin/bash
# test-php-lint.sh
# Runs php -l on all PHP files in the plugin.
# Usage: ./test-php-lint.sh [PLUGIN_DIR]
# Exit 0 on pass, non-zero on fail.

set -e

PLUGIN_DIR="${1:-projects/scribe}"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "FAIL: Plugin directory not found: $PLUGIN_DIR"
  exit 1
fi

errors=$(find "$PLUGIN_DIR" -name "*.php" -exec php -l {} + 2>&1 | grep -i "error" || true)

if [ -n "$errors" ]; then
  echo "$errors"
  echo "FAIL: PHP syntax errors detected"
  exit 1
fi

echo "PASS: All PHP files have valid syntax"
exit 0
