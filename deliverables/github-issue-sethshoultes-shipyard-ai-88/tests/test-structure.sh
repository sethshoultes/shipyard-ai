#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${PLUGIN_DIR:-projects/scribe/build/scribe}"

required_files=(
  "$PLUGIN_DIR/scribe.php"
  "$PLUGIN_DIR/block.json"
  "$PLUGIN_DIR/build/block.js"
  "$PLUGIN_DIR/build/block.css"
  "$PLUGIN_DIR/build/frontend.js"
  "$PLUGIN_DIR/src/edit.js"
  "$PLUGIN_DIR/src/save.js"
  "$PLUGIN_DIR/src/components/AudioDropZone.js"
  "$PLUGIN_DIR/src/components/Transcript.js"
  "$PLUGIN_DIR/src/components/Word.js"
  "$PLUGIN_DIR/src/components/JobStatus.js"
  "$PLUGIN_DIR/src/style.scss"
  "$PLUGIN_DIR/src/editor.scss"
  "$PLUGIN_DIR/includes/class-scribe-api.php"
  "$PLUGIN_DIR/includes/class-job-queue.php"
  "$PLUGIN_DIR/includes/class-storage.php"
  "$PLUGIN_DIR/includes/class-settings.php"
  "$PLUGIN_DIR/assets/css/frontend.css"
  "$PLUGIN_DIR/readme.txt"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "FAIL: missing $f"
    missing=1
  else
    echo "PASS: $f exists"
  fi
done

if [[ $missing -eq 1 ]]; then
  echo "Structure test FAILED."
  exit 1
fi

# Validate block.json is valid JSON
if ! python3 -m json.tool "$PLUGIN_DIR/block.json" > /dev/null 2>&1; then
  echo "FAIL: block.json is invalid JSON"
  exit 1
else
  echo "PASS: block.json is valid JSON"
fi

# Validate block.json contains required keys
for key in "name" "title" "editorScript"; do
  if ! python3 -c "import json,sys; d=json.load(open('$PLUGIN_DIR/block.json')); sys.exit(0 if '$key' in d else 1)"; then
    echo "FAIL: block.json missing required key: $key"
    exit 1
  else
    echo "PASS: block.json contains key: $key"
  fi
done

echo "All structure checks passed."
exit 0
