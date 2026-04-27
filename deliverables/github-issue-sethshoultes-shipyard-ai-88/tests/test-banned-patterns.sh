#!/usr/bin/env bash
set -euo pipefail

BASE="projects/whisper/build/whisper"

echo "=== Test: Banned Patterns ==="

patterns=(
  "sk-[a-zA-Z0-9]{20,}"                    # hardcoded OpenAI keys
  "cloudflare worker"
  "Cloudflare Worker"
  "pyannote"
  "AssemblyAI"
  "speaker diarization"
  "AI-powered"
  "AI powered"
  "coming soon"
  "TODO"
  "FIXME"
  "VTT"
  "vtt"
  "watermark"
  "freemium"
  "wizard"
)

fail=0

# Search relevant files
files=(
  $(find "$BASE" -type f \( -name '*.php' -o -name '*.js' -o -name '*.scss' -o -name '*.css' -o -name '*.json' -o -name '*.txt' \) 2>/dev/null)
)

for pat in "${patterns[@]}"; do
  # Skip VTT check in readme or legit contexts; do literal grep
  matches=$(grep -ri "$pat" "${files[@]}" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    # Some patterns need context-aware whitelisting
    if [ "$pat" = "vtt" ] || [ "$pat" = "VTT" ]; then
      # Only flag if it appears in code export context, but ban broadly for v1
      echo "WARN: Possible banned pattern '$pat' found:"
      echo "$matches"
      fail=1
      continue
    fi
    echo "FAIL: Banned pattern '$pat' found:"
    echo "$matches"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "PASS: No banned patterns found."
