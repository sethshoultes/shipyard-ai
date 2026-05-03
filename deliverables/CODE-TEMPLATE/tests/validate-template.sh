#!/bin/bash

# Test script to validate Codex template compliance
# Exit 0 on pass, non-zero on fail

set -e

echo "Testing Codex template validation..."

# Check if template file exists
if [ ! -f "codex.md" ]; then
    echo "ERROR: codex.md template file not found"
    exit 1
fi

# Check for required frontmatter fields
echo "Checking frontmatter fields..."
required_fields=("slug" "title" "author" "date" "version" "parent" "dependencies")
for field in "${required_fields[@]}"; do
    if ! grep -q "^$field:" codex.md; then
        echo "ERROR: Missing required frontmatter field: $field"
        exit 1
    fi
done

# Check for required sections
echo "Checking required sections..."
required_sections=("## Background" "## Acceptance Criteria" "## Verbatim Contracts" "## Risks" "## Deliverables")
for section in "${required_sections[@]}"; do
    if ! grep -q "^$section" codex.md; then
        echo "ERROR: Missing required section: $section"
        exit 1
    fi
done

# Check background section length (max 200 words)
echo "Checking background section length..."
background_word_count=$(sed -n '/^## Background/,/^##/p' codex.md | grep -v "^##" | wc -w)
if [ "$background_word_count" -gt 200 ]; then
    echo "ERROR: Background section exceeds 200 words ($background_word_count words)"
    exit 1
fi

# Check for verbatim code block guidance
echo "Checking verbatim code block guidance..."
if ! grep -q "verbatim\|code block\|fenced" codex.md; then
    echo "ERROR: Template should include guidance about verbatim code blocks"
    exit 1
fi

# Check for minimum acceptance criteria guidance
echo "Checking acceptance criteria guidance..."
if ! grep -q "minimum\|5.*features\|3.*fixes" codex.md; then
    echo "ERROR: Template should specify minimum acceptance criteria (5 for features, 3 for fixes)"
    exit 1
fi

# Check template uses master craftsman voice (per decision #9)
echo "Checking template voice quality..."
if grep -qi "please\|might\|could\|perhaps\|maybe" codex.md; then
    echo "WARNING: Template contains weak language - should use master craftsman voice"
fi

# Check file size is reasonable (not bloated)
echo "Checking template file size..."
file_size=$(wc -c < codex.md)
if [ "$file_size" -gt 10240 ]; then
    echo "ERROR: Template file too large ($file_size bytes) - should be concise"
    exit 1
fi

echo "✓ Codex template validation passed"
exit 0