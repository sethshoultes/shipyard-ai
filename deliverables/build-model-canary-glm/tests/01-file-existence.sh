#!/bin/bash

# Test 1: File Existence Verification
# Exits 0 if all required files exist, non-zero otherwise

set -e

BASE_DIR="/home/agent/shipyard-ai/deliverables/build-model-canary-glm"

echo "🔍 Checking file existence for build-model-canary-glm..."

# Required files list
FILES=(
    "spec.md"
    "todo.md"
    "slugify.ts"
    "truncate.ts"
    "index.ts"
    "tests/test-slugify.ts"
    "tests/test-truncate.ts"
)

missing_count=0

for file in "${FILES[@]}"; do
    if [[ -f "$BASE_DIR/$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file MISSING"
        missing_count=$((missing_count + 1))
    fi
done

# Check total file count
actual_count=$(find "$BASE_DIR" -type f | wc -l)
expected_count=7

if [[ $actual_count -eq $expected_count ]]; then
    echo "✅ File count correct: $actual_count/$expected_count"
else
    echo "❌ File count incorrect: $actual_count (expected $expected_count)"
    missing_count=$((missing_count + 1))
fi

if [[ $missing_count -eq 0 ]]; then
    echo "🎉 All files exist!"
    exit 0
else
    echo "💥 Missing $missing_count files"
    exit 1
fi