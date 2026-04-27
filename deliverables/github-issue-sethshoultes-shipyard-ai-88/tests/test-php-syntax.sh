#!/usr/bin/env bash
set -euo pipefail

BASE="projects/whisper/build/whisper"

echo "=== Test: PHP Syntax ==="

php_files=(
  "$BASE/whisper.php"
  "$BASE/includes/class-whisper-api.php"
  "$BASE/includes/class-job-queue.php"
  "$BASE/includes/class-storage.php"
  "$BASE/includes/class-settings.php"
)

for f in "${php_files[@]}"; do
  if [ -f "$f" ]; then
    php -l "$f" >/dev/null
    echo "OK: $f"
  else
    echo "FAIL: File not found: $f"
    exit 1
  fi
done

echo "PASS: All PHP files are syntactically valid."
