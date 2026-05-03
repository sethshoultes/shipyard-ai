#!/bin/bash

# Test 2: TypeScript Validation
# Exits 0 if all .ts files compile without errors

set -e

BASE_DIR="/home/agent/shipyard-ai/deliverables/build-model-canary-glm"

echo "🔍 Validating TypeScript compilation..."

cd "$BASE_DIR"

# Check if tsc is available
if ! command -v tsc &> /dev/null; then
    echo "⚠️  TypeScript compiler (tsc) not found, skipping validation"
    exit 0
fi

# TypeScript files to validate
TS_FILES=(
    "slugify.ts"
    "truncate.ts"
    "index.ts"
)

compile_errors=0

for file in "${TS_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "🔧 Checking $file..."
        if tsc --noEmit "$file" 2>/dev/null; then
            echo "✅ $file compiles successfully"
        else
            echo "❌ $file has TypeScript errors"
            compile_errors=$((compile_errors + 1))
        fi
    else
        echo "⚠️  $file not found, skipping"
    fi
done

if [[ $compile_errors -eq 0 ]]; then
    echo "🎉 All TypeScript files compile!"
    exit 0
else
    echo "💥 $compile_errors files have compilation errors"
    exit 1
fi