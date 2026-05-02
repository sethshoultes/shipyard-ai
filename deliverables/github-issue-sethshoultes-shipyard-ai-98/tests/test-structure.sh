#!/bin/bash
# Test: Verify project structure (no banned files/directories)
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "Testing project structure..."

FAILED=0

# Test 1: No subdirectories beyond allowed ones
ALLOWED_DIRS=". .github scripts tests"
FOUND_DIRS=$(find . -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sed 's|^\./||' || true)

for dir in $FOUND_DIRS; do
    case "$dir" in
        .github|scripts|tests)
            echo "PASS: Directory '$dir' is allowed"
            ;;
        *)
            echo "FAIL: Unexpected directory '$dir'"
            FAILED=1
            ;;
    esac
done

# Test 2: No barrel files
if [ -f "index.js" ] || [ -f "index.ts" ] || [ -f "index.mjs" ]; then
    echo "FAIL: Barrel file found (index.js/ts/mjs)"
    FAILED=1
else
    echo "PASS: No barrel files"
fi

# Test 3: No README.md (per test-as-spec pattern)
# Note: spec.md and todo.md are allowed per the task instructions
if [ -f "README.md" ]; then
    echo "FAIL: README.md found (test-as-spec pattern)"
    FAILED=1
else
    echo "PASS: No README.md"
fi

# Test 4: No CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    echo "FAIL: CHANGELOG.md found"
    FAILED=1
else
    echo "PASS: No CHANGELOG.md"
fi

# Test 5: No package.json (this is not a Node project, it's pipeline config)
if [ -f "package.json" ]; then
    echo "WARN: package.json found (not required for this project)"
else
    echo "PASS: No package.json (not required)"
fi

if [ $FAILED -eq 0 ]; then
    echo "All structure tests passed"
    exit 0
else
    echo "Some structure tests failed"
    exit 1
fi
