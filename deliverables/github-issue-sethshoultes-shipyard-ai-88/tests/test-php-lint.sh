#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${PLUGIN_DIR:-projects/scribe/build/scribe}"

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo "FAIL: plugin directory does not exist: $PLUGIN_DIR"
  exit 1
fi

PHP_FILES=$(find "$PLUGIN_DIR" -name "*.php" -print)

if [[ -z "$PHP_FILES" ]]; then
  echo "FAIL: no PHP files found in $PLUGIN_DIR"
  exit 1
fi

fail=0
for f in $PHP_FILES; do
  if ! php -l "$f" > /dev/null 2>&1; then
    echo "FAIL: php -l $f"
    fail=1
  else
    echo "PASS: php -l $f"
  fi
done

if [[ $fail -eq 1 ]]; then
  echo "PHP lint test FAILED."
  exit 1
fi

echo "All PHP files lint clean."
exit 0
