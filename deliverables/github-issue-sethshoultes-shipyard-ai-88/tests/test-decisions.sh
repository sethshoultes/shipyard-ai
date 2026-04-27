#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${PLUGIN_DIR:-projects/scribe/build/scribe}"

if [[ ! -d "$PLUGIN_DIR" ]]; then
  echo "FAIL: plugin directory does not exist: $PLUGIN_DIR"
  exit 1
fi

fail=0

check_banned() {
  local pattern="$1"
  local label="$2"
  # Search only source files, exclude readme/docs
  if grep -Eriq --exclude="readme.txt" --exclude="*.md" "$pattern" "$PLUGIN_DIR"; then
    echo "FAIL: banned pattern found ($label): $pattern"
    fail=1
  else
    echo "PASS: no banned pattern ($label)"
  fi
}

check_required() {
  local pattern="$1"
  local label="$2"
  local file="$3"
  if [[ ! -f "$file" ]]; then
    echo "FAIL: required file missing: $file"
    fail=1
    return
  fi
  if grep -iq "$pattern" "$file"; then
    echo "PASS: required pattern found ($label)"
  else
    echo "FAIL: missing required pattern ($label): $pattern in $file"
    fail=1
  fi
}

# Banned per debate decisions
check_banned "watermark" "no watermark"
check_banned "wizard" "no setup wizard"
check_banned "onboarding" "no onboarding modals"
check_banned "cloudflare" "no Cloudflare Worker"
check_banned "wrangler" "no wrangler config"
check_banned "workers\.dev" "no Workers domain"
check_banned "diarization" "no speaker diarization"
check_banned "pyannote" "no pyannote"
check_banned "assemblyai" "no AssemblyAI"
check_banned "setInterval.*typewriter|typewriter.*setInterval" "no fake typewriter"

# Required guards and headers
check_required "ABSPATH" "security guard" "$PLUGIN_DIR/scribe.php"
check_required "Plugin Name:" "plugin header" "$PLUGIN_DIR/scribe.php"
check_required "register_block_type" "block registration" "$PLUGIN_DIR/scribe.php"

# Activation hook must not contain external API calls
if [[ -f "$PLUGIN_DIR/scribe.php" ]]; then
  if grep -A 20 "register_activation_hook" "$PLUGIN_DIR/scribe.php" | grep -Eq "wp_remote_|curl_init|file_get_contents"; then
    echo "FAIL: activation hook contains external API calls"
    fail=1
  else
    echo "PASS: activation hook is clean of external API calls"
  fi
fi

if [[ $fail -eq 1 ]]; then
  echo "Decision compliance test FAILED."
  exit 1
fi

echo "All decision compliance checks passed."
exit 0
