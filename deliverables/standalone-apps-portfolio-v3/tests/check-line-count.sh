#!/bin/bash

# Standalone Apps Portfolio v3 — Line Count Test
# Exits 0 if total lines ≥ 200, non-zero on failure

set -e

echo "Checking line count requirements..."

# Define the source files to count
source_files=(
    "portfolio.ts"
    "work-section.tsx"
    "portfolio-slug-page.tsx"
)

total_lines=0

echo "Counting lines in source files..."

for file in "${source_files[@]}"; do
    if [ -f "$file" ]; then
        # Count non-empty lines (exclude blank lines)
        file_lines=$(grep -c . "$file" 2>/dev/null || echo "0")
        total_lines=$((total_lines + file_lines))
        echo "  $file: $file_lines lines"
    else
        echo "✗ $file not found"
        exit 1
    fi
done

echo "Total lines: $total_lines"

# Check if total meets requirement (≥ 200)
if [ $total_lines -ge 200 ]; then
    echo "✓ Line count requirement met ($total_lines ≥ 200)"
    exit 0
else
    echo "✗ Line count requirement failed ($total_lines < 200)"
    echo "The source files must contain at least 200 lines total."
    exit 1
fi