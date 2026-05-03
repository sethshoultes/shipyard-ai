#!/bin/bash

# Test 4: Dependency Check
# Exits 0 if zero external dependencies (native Node.js only)

set -e

BASE_DIR="/home/agent/shipyard-ai/deliverables/build-model-canary-glm"

echo "🔍 Checking for external dependencies..."

cd "$BASE_DIR"

# Forbidden files/directories that indicate external dependencies
FORBIDDEN=(
    "package.json"
    "package-lock.json"
    "yarn.lock"
    "node_modules"
    "tsconfig.json"
    ".prettierrc"
    "prettier.config.js"
    ".eslintrc"
    "webpack.config.js"
    "rollup.config.js"
    "vite.config.js"
)

issues=0

# Check for forbidden files
for forbidden in "${FORBIDDEN[@]}"; do
    if [[ -e "$forbidden" ]]; then
        echo "❌ Found forbidden dependency file: $forbidden"
        issues=$((issues + 1))
    fi
done

# Check for npm scripts in package.json (if it somehow exists)
if [[ -f "package.json" ]]; then
    if grep -q '"scripts"' package.json; then
        echo "❌ Found npm scripts in package.json"
        issues=$((issues + 1))
    fi
fi

# Check TypeScript files for import statements (should have none)
for ts_file in *.ts; do
    if [[ -f "$ts_file" ]]; then
        if grep -E '^import.*from' "$ts_file" > /dev/null 2>&1; then
            echo "❌ Found import statement in $ts_file"
            issues=$((issues + 1))
        fi
    fi
done

# Check for any external require() calls
for ts_file in *.ts; do
    if [[ -f "$ts_file" ]]; then
        if grep -E 'require\(' "$ts_file" > /dev/null 2>&1; then
            echo "❌ Found require() call in $ts_file"
            issues=$((issues + 1))
        fi
    fi
done

if [[ $issues -eq 0 ]]; then
    echo "🎉 Zero external dependencies confirmed!"
    exit 0
else
    echo "💥 Found $issues dependency violations"
    exit 1
fi