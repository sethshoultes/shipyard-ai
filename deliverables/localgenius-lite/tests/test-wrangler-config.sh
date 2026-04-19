#!/usr/bin/env bash
# Test: Verify Cloudflare Worker wrangler.jsonc configuration

set -e

echo "Testing wrangler.jsonc configuration..."

CONFIG_PATH="/spark/worker/wrangler.jsonc"
ERRORS=0

if [ ! -f "$CONFIG_PATH" ]; then
  echo "❌ FAIL: wrangler.jsonc not found at $CONFIG_PATH"
  exit 1
fi

# Helper to check for required config
check_config() {
  local pattern="$1"
  local message="$2"

  if ! grep -q "$pattern" "$CONFIG_PATH"; then
    echo "❌ FAIL: Missing required config: $message"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ PASS: Found $message"
  fi
}

# Required configurations
check_config '"name".*:.*"spark-api"' "Worker name: spark-api"
check_config '"compatibility_date".*:.*"2026-04-19"' "Compatibility date: 2026-04-19"
check_config '"nodejs_compat"' "Node.js compatibility flag"
check_config '"ANTHROPIC_API_KEY"' "ANTHROPIC_API_KEY environment variable reference"

# Check for correct model in code (not config, but related)
if [ -f "/spark/worker/claude.js" ]; then
  if grep -q "claude-3-5-haiku-20241022" "/spark/worker/claude.js"; then
    echo "✅ PASS: Claude 3.5 Haiku model configured"
  else
    echo "❌ FAIL: Claude model not set to claude-3-5-haiku-20241022"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Verify JSON/JSONC syntax is valid (basic check)
if ! grep -q '{' "$CONFIG_PATH"; then
  echo "❌ FAIL: wrangler.jsonc appears malformed (no opening brace)"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All wrangler.jsonc checks passed"
  exit 0
else
  echo ""
  echo "❌ Failed: $ERRORS configuration issues"
  exit 1
fi
