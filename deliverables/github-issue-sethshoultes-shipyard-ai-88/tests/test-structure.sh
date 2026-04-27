#!/usr/bin/env bash
set -euo pipefail

BASE="projects/whisper/build/whisper"

echo "=== Test: File Structure ==="

required_files=(
  "$BASE/whisper.php"
  "$BASE/block.json"
  "$BASE/readme.txt"
  "$BASE/includes/class-whisper-api.php"
  "$BASE/includes/class-job-queue.php"
  "$BASE/includes/class-storage.php"
  "$BASE/includes/class-settings.php"
  "$BASE/src/edit.js"
  "$BASE/src/save.js"
  "$BASE/src/frontend.js"
  "$BASE/src/style.scss"
  "$BASE/src/editor.scss"
  "$BASE/src/components/AudioDropZone.js"
  "$BASE/src/components/JobStatus.js"
  "$BASE/src/components/Transcript.js"
  "$BASE/src/components/Word.js"
  "$BASE/package.json"
  "$BASE/languages/"
)

for f in "${required_files[@]}"; do
  if [ ! -e "$f" ]; then
    echo "FAIL: Missing required file/directory: $f"
    exit 1
  fi
  echo "OK: $f"
done

echo "PASS: All required files exist."
