#!/bin/bash

# Test 3: Quality Audit
# Exits 0 if no forbidden patterns found (no hollow files)

set -e

BASE_DIR="/home/agent/shipyard-ai/deliverables/build-model-canary-glm"

echo "🔍 Auditing code quality (no hollow files)..."

cd "$BASE_DIR"

# Forbidden patterns that indicate hollow files
PATTERNS=(
    "TODO"
    "FIXME"
    "// Placeholder"
    "function.*{}$"
    "const.*=.*{};$"
    "export.*{};$"
)

issues=0

# Check TypeScript files for forbidden patterns
for ts_file in *.ts; do
    if [[ -f "$ts_file" ]]; then
        echo "🔍 Auditing $ts_file..."

        for pattern in "${PATTERNS[@]}"; do
            if grep -E "$pattern" "$ts_file" > /dev/null 2>&1; then
                echo "❌ Found forbidden pattern '$pattern' in $ts_file"
                issues=$((issues + 1))
            fi
        done

        # Check if file is empty or has only whitespace
        if [[ ! -s "$ts_file" ]]; then
            echo "❌ $ts_file is empty"
            issues=$((issues + 1))
        fi

        # Count non-empty, non-comment lines
        substance_lines=$(grep -v '^[[:space:]]*$' "$ts_file" | grep -v '^[[:space:]]*//' | wc -l)
        if [[ $substance_lines -lt 2 ]]; then
            echo "⚠️  $ts_file has minimal substance ($substance_lines lines)"
        fi
    fi
done

# Check spec.md and todo.md for substance
for md_file in spec.md todo.md; do
    if [[ -f "$md_file" ]]; then
        echo "🔍 Auditing $md_file..."

        # Check for placeholder content
        if grep -E "(TODO|FIXME|Placeholder|Coming soon)" "$md_file" > /dev/null 2>&1; then
            echo "❌ Found placeholder content in $md_file"
            issues=$((issues + 1))
        fi

        # Minimum content check (at least 10 lines of substance)
        substance_lines=$(grep -v '^[[:space:]]*$' "$md_file" | wc -l)
        if [[ $substance_lines -lt 10 ]]; then
            echo "❌ $md_file appears hollow ($substance_lines lines)"
            issues=$((issues + 1))
        fi
    fi
done

if [[ $issues -eq 0 ]]; then
    echo "🎉 Quality audit passed - no hollow files detected!"
    exit 0
else
    echo "💥 Found $issues quality issues"
    exit 1
fi