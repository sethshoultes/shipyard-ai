#!/usr/bin/env bash
# Test: Verify all required files exist in the SPARK project

set -e

echo "Testing SPARK file structure..."

ERRORS=0

# Widget files
check_file() {
  if [ ! -f "$1" ]; then
    echo "❌ FAIL: Missing file: $1"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ PASS: Found $1"
  fi
}

# Widget core files
check_file "/spark/widget/spark.js"
check_file "/spark/widget/components/Button.js"
check_file "/spark/widget/components/Panel.js"
check_file "/spark/widget/components/Message.js"
check_file "/spark/widget/utils/scraper.js"
check_file "/spark/widget/utils/api.js"
check_file "/spark/widget/utils/storage.js"
check_file "/spark/widget/styles/spark.css"

# Worker files
check_file "/spark/worker/index.js"
check_file "/spark/worker/claude.js"
check_file "/spark/worker/prompt.js"
check_file "/spark/worker/ratelimit.js"
check_file "/spark/worker/errors.js"
check_file "/spark/worker/analytics.js"
check_file "/spark/worker/wrangler.jsonc"

# Landing page files
check_file "/spark/landing/index.html"
check_file "/spark/landing/styles.css"

# Config files
check_file "/spark/package.json"
check_file "/spark/README.md"

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All required files present"
  exit 0
else
  echo ""
  echo "❌ Failed: $ERRORS missing files"
  exit 1
fi
