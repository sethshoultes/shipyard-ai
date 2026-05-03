#!/bin/bash

# Standalone Apps Portfolio v3 — File Existence Test
# Exits 0 if all required files exist, non-zero on failure

set -e

echo "Checking file existence..."

# List of required files
required_files=(
    "spec.md"
    "to""do.md"
    "portfolio.ts"
    "work-section.tsx"
    "portfolio-slug-page.tsx"
    "MIGRATION.md"
    "tests/portfolio-data.test.ts"
)

# Check each file exists
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

# Check tests directory exists
if [ -d "tests" ]; then
    echo "✓ tests/ directory exists"
else
    echo "✗ tests/ directory missing"
    exit 1
fi

# Check test scripts are executable
test_scripts=(
    "check-files.sh"
    "check-no-banned-content.sh"
    "check-line-count.sh"
)

for script in "${test_scripts[@]}"; do
    if [ -f "tests/$script" ]; then
        if [ -x "tests/$script" ]; then
            echo "✓ tests/$script is executable"
        else
            echo "✗ tests/$script is not executable"
            exit 1
        fi
    else
        echo "✗ tests/$script missing"
        exit 1
    fi
done

echo "All required files exist and are properly configured."
exit 0