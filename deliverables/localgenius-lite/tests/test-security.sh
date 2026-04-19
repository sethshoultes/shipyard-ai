#!/usr/bin/env bash
# Test: Security checks for SPARK codebase

set -e

echo "Running security checks..."

SPARK_ROOT="/spark"
ERRORS=0

if [ ! -d "$SPARK_ROOT" ]; then
  echo "⚠️  SKIP: SPARK directory not found at $SPARK_ROOT"
  exit 0
fi

# Check for UUID validation in worker
if [ -f "$SPARK_ROOT/worker/index.js" ]; then
  if ! grep -q "^[0-9a-f]\{8\}-[0-9a-f]\{4\}-4[0-9a-f]\{3\}-[89ab][0-9a-f]\{3\}-[0-9a-f]\{12\}$" "$SPARK_ROOT/worker/index.js"; then
    echo "⚠️  WARNING: UUID validation regex not found (may be in separate file)"
  else
    echo "✅ PASS: UUID validation present"
  fi
fi

# Check for CORS configuration
if [ -f "$SPARK_ROOT/worker/index.js" ]; then
  if grep -q "Access-Control-Allow-Origin" "$SPARK_ROOT/worker/index.js"; then
    echo "✅ PASS: CORS headers configured"
  else
    echo "❌ FAIL: Missing CORS headers"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for rate limiting
if [ -f "$SPARK_ROOT/worker/ratelimit.js" ]; then
  if grep -q "rate" "$SPARK_ROOT/worker/ratelimit.js"; then
    echo "✅ PASS: Rate limiting implemented"
  else
    echo "❌ FAIL: Rate limiting file exists but no rate logic found"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "❌ FAIL: Rate limiting file missing"
  ERRORS=$((ERRORS + 1))
fi

# Check for XSS prevention (should use textContent, not innerHTML with user input)
if grep -rn "innerHTML.*question\|innerHTML.*context" "$SPARK_ROOT" --include="*.js" 2>/dev/null; then
  echo "❌ FAIL: Potential XSS vulnerability (innerHTML with user input)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No obvious XSS vulnerabilities"
fi

# Check for hardcoded secrets
if grep -rn "sk-ant-\|apiKey.*=.*['\"]" "$SPARK_ROOT" --include="*.js" 2>/dev/null | grep -v "env.ANTHROPIC_API_KEY"; then
  echo "❌ FAIL: Potential hardcoded API key found"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No hardcoded API keys"
fi

# Check that API key comes from environment
if [ -f "$SPARK_ROOT/worker/claude.js" ]; then
  if grep -q "env.ANTHROPIC_API_KEY\|env\['ANTHROPIC_API_KEY'\]" "$SPARK_ROOT/worker/claude.js"; then
    echo "✅ PASS: API key loaded from environment"
  else
    echo "❌ FAIL: API key not loaded from environment variable"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check for SQL injection prevention (shouldn't have SQL in this app, but check anyway)
if grep -rn "SELECT\|INSERT\|UPDATE\|DELETE" "$SPARK_ROOT" --include="*.js" 2>/dev/null; then
  echo "⚠️  WARNING: SQL-like strings found (unexpected for this app)"
fi

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All security checks passed"
  exit 0
else
  echo ""
  echo "❌ Failed: $ERRORS security issues"
  exit 1
fi
