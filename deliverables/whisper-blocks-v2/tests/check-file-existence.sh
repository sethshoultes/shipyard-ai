#!/usr/bin/env bash
# check-file-existence.sh — Verify every spec-defined file exists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MISSING=0

FILES=(
  "whisper-blocks-v2.php"
  "package.json"
  "readme.txt"
  "README.md"
  ".gitignore"
  "src/block.json"
  "src/index.js"
  "src/edit.js"
  "src/save.js"
  "src/style.scss"
  "src/editor.scss"
  "includes/class-whisper-admin.php"
  "includes/class-whisper-api.php"
  "includes/class-whisper-scheduler.php"
  "includes/class-whisper-transcript.php"
)

for f in "${FILES[@]}"; do
  if [[ ! -f "$ROOT/$f" ]]; then
    echo "FAIL: missing $f"
    MISSING=1
  else
    echo "OK: $f"
  fi
done

if [[ "$MISSING" -eq 1 ]]; then
  echo "FAIL: one or more required files are missing"
  exit 1
fi

echo "PASS: all required files exist"
