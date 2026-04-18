#!/bin/bash
# Test: Check for banned patterns and anti-patterns
# Exit 0 on pass, non-zero on fail

set -e

LOCALGENIUS_DIR="/home/agent/localgenius"
FAILED=0

echo "===== Banned Patterns Test ====="
echo "Checking for anti-patterns, banned constructs, and code smells..."

# Pattern: Check for banned words in user-facing copy
echo ""
echo "Checking for banned tone/words in templates..."
BANNED_WORDS=("synergy" "leverage" "paradigm" "robust" "utilize" "cutting-edge" "revolutionary")
for word in "${BANNED_WORDS[@]}"; do
  MATCHES=$(grep -ri "$word" "$LOCALGENIUS_DIR/src/services/notifications/templates/" 2>/dev/null || true)
  if [ ! -z "$MATCHES" ]; then
    echo "✗ Found banned word '$word' in templates:"
    echo "$MATCHES"
    FAILED=1
  fi
done

# Pattern: Check for unfinished work markers in production code
echo ""
echo "Checking for unfinished work markers in production code..."
UNFINISHED_WORK=$(grep -r "TODO\|FIXME" "$LOCALGENIUS_DIR/src/services/notifications/" \
                               "$LOCALGENIUS_DIR/src/services/badges/" \
                               "$LOCALGENIUS_DIR/src/services/journal/" \
                               "$LOCALGENIUS_DIR/src/services/trends/" \
                               "$LOCALGENIUS_DIR/src/jobs/" 2>/dev/null || true)
if [ ! -z "$UNFINISHED_WORK" ]; then
  echo "✗ Found unfinished work markers (should be resolved before ship):"
  echo "$UNFINISHED_WORK"
  FAILED=1
else
  echo "✓ No unfinished work markers found"
fi

# Pattern: Check for console.log in production code (should use proper logging)
echo ""
echo "Checking for console.log statements..."
CONSOLE_LOGS=$(grep -r "console\.log" "$LOCALGENIUS_DIR/src/services/" \
                                       "$LOCALGENIUS_DIR/src/jobs/" 2>/dev/null | grep -v ".test.ts" || true)
if [ ! -z "$CONSOLE_LOGS" ]; then
  echo "⚠ Found console.log statements (should use proper logger):"
  echo "$CONSOLE_LOGS"
  # Not failing, just warning
fi

# Pattern: Check for hardcoded credentials or API keys
echo ""
echo "Checking for hardcoded credentials..."
HARDCODED=$(grep -rE "(api[_-]?key|password|secret|token).*=.*['\"][A-Za-z0-9]{10,}['\"]" \
  "$LOCALGENIUS_DIR/src/" 2>/dev/null | grep -v ".test.ts" | grep -v ".example" || true)
if [ ! -z "$HARDCODED" ]; then
  echo "✗ Found potential hardcoded credentials:"
  echo "$HARDCODED"
  FAILED=1
else
  echo "✓ No hardcoded credentials found"
fi

# Pattern: Check for "any" type in TypeScript (should be typed)
echo ""
echo "Checking for 'any' type usage..."
ANY_TYPES=$(grep -r ": any" "$LOCALGENIUS_DIR/src/services/notifications/" \
                             "$LOCALGENIUS_DIR/src/services/badges/" \
                             "$LOCALGENIUS_DIR/src/services/journal/" \
                             "$LOCALGENIUS_DIR/src/services/trends/" 2>/dev/null | \
            grep -v ".test.ts" | grep -v "// @ts-expect-error" || true)
if [ ! -z "$ANY_TYPES" ]; then
  echo "⚠ Found 'any' types (should be properly typed):"
  echo "$ANY_TYPES"
  # Not failing, just warning
fi

# Pattern: Check for aggressive/dark pattern language in upgrade prompts
echo ""
echo "Checking for aggressive upsell language..."
AGGRESSIVE_WORDS=("Buy now" "Limited time" "Don't miss out" "Act fast" "Hurry" "Only.*left")
for word in "${AGGRESSIVE_WORDS[@]}"; do
  MATCHES=$(grep -riE "$word" "$LOCALGENIUS_DIR/src/" 2>/dev/null | grep -i "upgrade\|upsell\|pro" || true)
  if [ ! -z "$MATCHES" ]; then
    echo "✗ Found aggressive upsell language '$word':"
    echo "$MATCHES"
    FAILED=1
  fi
done

# Pattern: Check that SMS sending checks for opt-in
echo ""
echo "Checking for SMS opt-in checks..."
if [ -f "$LOCALGENIUS_DIR/src/services/notifications/sms-sender.ts" ]; then
  if grep -q "sms_opt_in" "$LOCALGENIUS_DIR/src/services/notifications/sms-sender.ts"; then
    echo "✓ SMS sender checks opt-in"
  else
    echo "✗ SMS sender does NOT check opt-in (TCPA violation risk)"
    FAILED=1
  fi
fi

# Pattern: Check for proper error handling in async functions
echo ""
echo "Checking for proper error handling..."
UNSAFE_ASYNC=$(grep -rE "async.*function" "$LOCALGENIUS_DIR/src/jobs/" 2>/dev/null | \
               grep -v "try\|catch" || true)
if [ ! -z "$UNSAFE_ASYNC" ]; then
  echo "⚠ Found async functions without try/catch blocks:"
  echo "$UNSAFE_ASYNC"
  # Not failing, just warning
fi

echo ""
if [ $FAILED -eq 0 ]; then
  echo "PASS: No banned patterns detected"
  exit 0
else
  echo "FAIL: Found banned patterns or anti-patterns"
  exit 1
fi
