#!/usr/bin/env bash
# Test: Verify landing page contains required elements

set -e

echo "Testing landing page content..."

LANDING_PAGE="/spark/landing/index.html"
ERRORS=0

if [ ! -f "$LANDING_PAGE" ]; then
  echo "❌ FAIL: Landing page not found at $LANDING_PAGE"
  exit 1
fi

# Helper to check for required content
check_content() {
  local pattern="$1"
  local message="$2"

  if ! grep -q "$pattern" "$LANDING_PAGE"; then
    echo "❌ FAIL: Missing required content: $message"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ PASS: Found $message"
  fi
}

# Required content from Steve's vision
check_content "Your website, instantly brilliant" "Hero headline"
check_content "One script tag" "Subheading about script tag"
check_content "Zero configuration" "Subheading about zero config"
check_content "<script src=" "Script tag example"
check_content "cdn.usespark.com" "CDN URL in script tag"
check_content "spark.js" "Widget filename in script tag"
check_content "Try It Now" "CTA button"
check_content "Powered by SPARK" "Attribution footer"
check_content "https://usespark.com" "SPARK website link"

# Should NOT have (cut from V1)
if grep -q "pricing" "$LANDING_PAGE" || grep -q "Pricing" "$LANDING_PAGE"; then
  echo "❌ FAIL: Landing page should not have pricing section (cut from V1)"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: No pricing section (correct for V1)"
fi

if grep -q "features" "$LANDING_PAGE" || grep -q "Features" "$LANDING_PAGE"; then
  echo "⚠️  WARNING: Landing page has features section (Steve wanted minimal)"
fi

# Check for valid HTML structure
if ! grep -q '<!DOCTYPE html>' "$LANDING_PAGE"; then
  echo "❌ FAIL: Missing DOCTYPE declaration"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Valid HTML DOCTYPE"
fi

if ! grep -q '<html' "$LANDING_PAGE"; then
  echo "❌ FAIL: Missing <html> tag"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ PASS: Has <html> tag"
fi

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All landing page checks passed"
  exit 0
else
  echo ""
  echo "❌ Failed: $ERRORS content issues"
  exit 1
fi
