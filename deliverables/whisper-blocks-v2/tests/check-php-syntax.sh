#!/usr/bin/env bash
# check-php-syntax.sh — Run php -l on every .php file.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

while IFS= read -r -d '' file; do
  if ! php -l "$file" > /dev/null 2>&1; then
    echo "FAIL: syntax error in $file"
    ERRORS=1
  else
    echo "OK: $file"
  fi
done < <(find "$ROOT" -maxdepth 2 -name '*.php' -print0)

if [[ "$ERRORS" -eq 1 ]]; then
  echo "FAIL: PHP syntax check failed"
  exit 1
fi

echo "PASS: all PHP files have valid syntax"
