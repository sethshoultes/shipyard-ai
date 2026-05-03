#!/bin/bash

# Hollow Build Gate - Minimum Artifact Validation
# Ensures sufficient files exist before allowing build to proceed
# Exit 0 when requirements met, non-zero when insufficient

set -e

echo "Running hollow build gate validation..."

# Configuration
MIN_SOURCE_FILES=3
MIN_TEST_FILES=1
PROJECT_ROOT="$(pwd)"

# File extensions that count as source files
SOURCE_EXTENSIONS=("js" "ts" "py" "java" "cpp" "c" "go" "rs" "php" "rb" "swift" "kt")

# File patterns that count as test files
TEST_PATTERNS=("*test*" "*spec*" "test_*" "*_test*" "tests/*" "spec/*")

# Count source files
count_source_files() {
    local count=0

    for ext in "${SOURCE_EXTENSIONS[@]}"; do
        # Count files with this extension, excluding test files and directories
        local found=$(find . -type f -name "*.$ext" \
            ! -path "./node_modules/*" \
            ! -path "./.git/*" \
            ! -path "./tests/*" \
            ! -name "*test*" \
            ! -name "*spec*" \
            2>/dev/null | wc -l)
        count=$((count + found))
    done

    echo $count
}

# Count test files
count_test_files() {
    local count=0

    for pattern in "${TEST_PATTERNS[@]}"; do
        # Count files matching test patterns
        local found=$(find . -type f -name "$pattern" \
            ! -path "./node_modules/*" \
            ! -path "./.git/*" \
            2>/dev/null | wc -l)
        count=$((count + found))
    done

    echo $count
}

# Validate project structure
validate_structure() {
    echo "Checking project structure..."

    # Check if we're in a reasonable project directory
    if [ ! -f "$PROJECT_ROOT/package.json" ] && [ ! -f "$PROJECT_ROOT/requirements.txt" ] && [ ! -f "$PROJECT_ROOT/Cargo.toml" ]; then
        echo "WARNING: No package configuration file detected (package.json, requirements.txt, Cargo.toml, etc.)"
    fi

    # Check for common directories
    if [ ! -d "src" ] && [ ! -d "lib" ] && [ ! -d "app" ]; then
        echo "INFO: No common source directory found (src/, lib/, app/)"
    fi
}

# Main validation logic
main() {
    local source_count
    local test_count

    # Count files
    source_count=$(count_source_files)
    test_count=$(count_test_files)

    echo "Found $source_count source files (minimum: $MIN_SOURCE_FILES)"
    echo "Found $test_count test files (minimum: $MIN_TEST_FILES)"

    # Validate structure
    validate_structure

    # Check minimum requirements
    if [ "$source_count" -lt "$MIN_SOURCE_FILES" ]; then
        echo "FAIL: Insufficient source files. Need at least $MIN_SOURCE_FILES, found $source_count"
        echo "Add more source files or adjust minimum requirements in gate/hollow-build.sh"
        exit 1
    fi

    if [ "$test_count" -lt "$MIN_TEST_FILES" ]; then
        echo "FAIL: Insufficient test files. Need at least $MIN_TEST_FILES, found $test_count"
        echo "Add test files (matching patterns: ${TEST_PATTERNS[*]}) or adjust minimum requirements"
        exit 1
    fi

    # Additional checks for quality
    echo "Running additional quality checks..."

    # Check for extremely large files (potential bloat)
    if find . -type f -size +1M ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null | grep -q .; then
        echo "WARNING: Found files larger than 1MB. Consider reducing file size."
    fi

    # Check for empty files
    local empty_files=$(find . -type f -size 0 ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null | wc -l)
    if [ "$empty_files" -gt 0 ]; then
        echo "WARNING: Found $empty_files empty files. Remove or add content."
    fi

    echo "✓ Hollow build gate passed"
    echo "✓ Project has sufficient artifacts for build"
    exit 0
}

# Help message
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Hollow Build Gate - Minimum Artifact Validation"
    echo ""
    echo "This script ensures minimum file requirements before allowing builds."
    echo ""
    echo "Requirements:"
    echo "  - Minimum $MIN_SOURCE_FILES source files"
    echo "  - Minimum $MIN_TEST_FILES test files"
    echo ""
    echo "Source file extensions: ${SOURCE_EXTENSIONS[*]}"
    echo "Test file patterns: ${TEST_PATTERNS[*]}"
    echo ""
    echo "Usage: $0 [--help|-h]"
    exit 0
fi

# Run main validation
main