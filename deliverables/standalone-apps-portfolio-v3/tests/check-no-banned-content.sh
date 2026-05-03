#!/bin/bash

# Standalone Apps Portfolio v3 — Banned Content Test
# Exits 0 if no banned content found, non-zero on violations

set -e

echo "Checking for banned content..."

# Define banned patterns
banned_patterns=(
    "TODO"
    "FIXME"
    "lorem"
    "coming soon"
    "placeholder"
    "PLACEHOLDER"
    "Coming Soon"
    "TODO:"
    "FIXME:"
)

# Flag to track if any banned content found
found_banned=0

# Check each pattern in all text files
for pattern in "${banned_patterns[@]}"; do
    echo "Checking for pattern: $pattern"

    # Use grep to search for pattern (case-insensitive)
    matches=$(grep -rilE "$pattern" . 2>/dev/null || true)

    if [ -n "$matches" ]; then
        echo "✗ Found banned content '$pattern' in:"
        echo "$matches" | sed 's/^/  /'
        found_banned=1
    else
        echo "✓ No '$pattern' found"
    fi
done

# Check final result
if [ $found_banned -eq 0 ]; then
    echo "No banned content found."
    exit 0
else
    echo "Banned content detected. Please remove before proceeding."
    exit 1
fi