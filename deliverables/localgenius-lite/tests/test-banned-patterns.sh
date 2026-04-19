#!/usr/bin/env bash
# Test: Check for banned patterns and anti-patterns in SPARK code

set -e

echo "Testing for banned patterns..."

ERRORS=0
SPARK_ROOT="/spark"

# Check if SPARK directory exists
if [ ! -d "$SPARK_ROOT" ]; then
  echo "⚠️  SKIP: SPARK directory not found at $SPARK_ROOT"
  exit 0
fi

# Helper function to check for banned pattern
check_banned_pattern() {
  local pattern="$1"
  local message="$2"
  local path="${3:-$SPARK_ROOT}"

  if grep -r "$pattern" "$path" --include="*.js" --include="*.ts" 2>/dev/null; then
    echo "❌ FAIL: Found banned pattern: $message"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ PASS: No $message found"
  fi
}

# Helper function to check for required pattern
check_required_pattern() {
  local pattern="$1"
  local file="$2"
  local message="$3"

  if [ -f "$file" ]; then
    if ! grep -q "$pattern" "$file" 2>/dev/null; then
      echo "❌ FAIL: Missing required pattern in $file: $message"
      ERRORS=$((ERRORS + 1))
    else
      echo "✅ PASS: $message found in $file"
    fi
  fi
}

# Banned: console.log in production code
check_banned_pattern "console\.log\(" "console.log (use console.error for errors only)"

# Banned: eval() or Function() constructor (security risk)
check_banned_pattern "eval\(" "eval() usage"
check_banned_pattern "new Function\(" "Function() constructor"

# Banned: innerHTML with user input (XSS risk)
check_banned_pattern "innerHTML.*question" "innerHTML with user input (XSS risk)"
check_banned_pattern "innerHTML.*context" "innerHTML with user input (XSS risk)"

# Banned: alert(), confirm(), prompt() (blocking)
check_banned_pattern "alert\(" "alert() usage"
check_banned_pattern "confirm\(" "confirm() usage"

# Banned: hardcoded API keys
check_banned_pattern "sk-ant-" "hardcoded Anthropic API key"
check_banned_pattern "apiKey.*=.*['\"]sk-" "hardcoded API key"

# Banned: LocalGenius name (should be SPARK)
check_banned_pattern "LocalGenius" "old product name 'LocalGenius' (should be SPARK)"
check_banned_pattern "localgenius" "old product name 'localgenius' (should be spark)"

# Required: Shadow DOM usage in widget
check_required_pattern "attachShadow" "$SPARK_ROOT/widget/spark.js" "Shadow DOM (attachShadow)"

# Required: UUID validation
check_required_pattern "uuid" "$SPARK_ROOT/worker/index.js" "UUID validation"

# Required: Rate limiting
check_required_pattern "rate" "$SPARK_ROOT/worker/ratelimit.js" "Rate limiting logic"

# Required: CORS headers
check_required_pattern "Access-Control-Allow-Origin" "$SPARK_ROOT/worker/index.js" "CORS headers"

# Required: System prompt with "ONLY" constraint
check_required_pattern "ONLY" "$SPARK_ROOT/worker/prompt.js" "System prompt 'ONLY' constraint"

# Required: Error handling
check_required_pattern "try" "$SPARK_ROOT/worker/claude.js" "try-catch error handling"

# Required: Streaming
check_required_pattern "stream" "$SPARK_ROOT/worker/claude.js" "Streaming support"

# Required: Claude 3.5 Haiku model
check_required_pattern "claude-3-5-haiku-20241022" "$SPARK_ROOT/worker/claude.js" "Claude 3.5 Haiku model"

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All pattern checks passed"
  exit 0
else
  echo ""
  echo "❌ Failed: $ERRORS pattern violations"
  exit 1
fi
