#!/bin/bash

# Standalone Apps Portfolio v3 — Banned Content Test
# Exits 0 if no banned content found, non-zero on violations

set -e

echo "Checking for banned content..."

# Banned patterns are base64-encoded so literal strings do not appear
# contiguously in this script, preventing self-matches during scans.
patterns_b64="VE9ETwpGSVhNRQpsb3JlbQpjb21pbmcgc29vbgpwbGFjZWhvbGRlcgpQTEFDRUhPTERFUgpDb21pbmcgU29vbgpUT0RPOgpGSVhNRToK"

# Decode patterns into a temporary file and read into array
tmpfile=$(mktemp)
echo "$patterns_b64" | base64 -d > "$tmpfile"
mapfile -t banned_patterns < "$tmpfile"
rm -f "$tmpfile"

# Flag to track if any banned content found
found_banned=0

# Check each pattern in all text files
for pattern in "${banned_patterns[@]}"; do
    echo "Checking for pattern: $pattern"

    # Use grep to search for pattern (case-insensitive), excluding this script
    matches=$(grep -rilE "$pattern" --exclude="check-no-banned-content.sh" . 2>/dev/null || true)

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
