#!/bin/bash

# Structure and file presence verification
# Exits 0 on success, non-zero on failure

set -e

DELIVERABLES_DIR="$(dirname "$0")/.."
echo "Checking deliverables directory: $DELIVERABLES_DIR"

# Required files list
REQUIRED_FILES=(
    "spec.md"
    "todo.md"
    "portfolio.ts"
    "work-section.tsx"
    "portfolio-slug-page.tsx"
    "tests/portfolio-data.test.ts"
    "MIGRATION.md"
)

echo "Checking for required files..."

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$DELIVERABLES_DIR/$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        exit 1
    fi
done

echo "All required files present."

# Check if files are non-empty
echo "Checking file contents..."

for file in "${REQUIRED_FILES[@]}"; do
    if [ -s "$DELIVERABLES_DIR/$file" ]; then
        echo "✓ $file has content"
    else
        echo "✗ $file is empty"
        exit 1
    fi
done

echo "All files have content."

# Basic syntax checks if tools are available
echo "Running basic syntax checks..."

# Check TypeScript/TSX files for basic syntax issues
if command -v grep >/dev/null 2>&1; then
    # Look for obvious syntax errors in TS/TSX files
    TSX_FILES=("portfolio.ts" "work-section.tsx" "portfolio-slug-page.tsx")

    for file in "${TSX_FILES[@]}"; do
        # Check for unmatched braces (basic check)
        open_braces=$(grep -o '{' "$DELIVERABLES_DIR/$file" | wc -l)
        close_braces=$(grep -o '}' "$DELIVERABLES_DIR/$file" | wc -l)

        if [ "$open_braces" -eq "$close_braces" ]; then
            echo "✓ $file braces balanced"
        else
            echo "✗ $file has unmatched braces (open: $open_braces, close: $close_braces)"
            exit 1
        fi

        # Check for unmatched parentheses
        open_parens=$(grep -o '(' "$DELIVERABLES_DIR/$file" | wc -l)
        close_parens=$(grep -o ')' "$DELIVERABLES_DIR/$file" | wc -l)

        if [ "$open_parens" -eq "$close_parens" ]; then
            echo "✓ $file parentheses balanced"
        else
            echo "✗ $file has unmatched parentheses (open: $open_parens, close: $close_parens)"
            exit 1
        fi
    done
fi

# Check for banned content
echo "Checking for banned content..."

BANNED_PATTERNS=(
    "lorem ipsum"
    "TODO"
    "coming soon"
    "revolutionary"
    "AI-powered"
    "cutting-edge"
    "next-gen"
    "unlock"
    "leverage"
)

for pattern in "${BANNED_PATTERNS[@]}"; do
    if grep -ri "$pattern" "$DELIVERABLES_DIR" >/dev/null 2>&1; then
        echo "✗ Found banned content: $pattern"
        exit 1
    else
        echo "✓ No banned content: $pattern"
    fi
done

# Check directory structure
echo "Checking directory structure..."

if [ -d "$DELIVERABLES_DIR/tests" ]; then
    echo "✓ tests directory exists"
else
    echo "✗ tests directory missing"
    exit 1
fi

echo "All structure checks passed!"
exit 0