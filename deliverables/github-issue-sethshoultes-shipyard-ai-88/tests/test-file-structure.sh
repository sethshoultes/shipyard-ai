#!/bin/bash
# test-file-structure.sh
# Verifies that all required files exist in the plugin build output.
# Usage: ./test-file-structure.sh [PLUGIN_DIR]
# Exit 0 on pass, non-zero on fail.

set -e

PLUGIN_DIR="${1:-projects/scribe}"

required_files=(
  "scribe.php"
  "block.json"
  "readme.txt"
  "src/edit.js"
  "src/save.js"
  "src/style.scss"
  "src/editor.scss"
  "src/components/AudioDropZone.js"
  "src/components/Transcript.js"
  "src/components/Word.js"
  "src/components/JobStatus.js"
  "includes/class-scribe-api.php"
  "includes/class-job-queue.php"
  "includes/class-storage.php"
  "includes/class-settings.php"
  "includes/class-license.php"
  "includes/class-library.php"
  "languages/scribe.pot"
)

fail=0
for f in "${required_files[@]}"; do
  if [ ! -f "$PLUGIN_DIR/$f" ]; then
    echo "FAIL: Missing required file: $f"
    fail=1
  fi
done

if [ "$fail" -eq 1 ]; then
  exit 1
fi

echo "PASS: All required files exist"
exit 0
