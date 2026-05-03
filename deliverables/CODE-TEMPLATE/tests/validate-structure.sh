#!/bin/bash

# Test script to validate overall project structure
# Exit 0 on pass, non-zero on fail

set -e

echo "Testing CODE-TEMPLATE project structure..."

# Check required files exist
echo "Checking required files..."
required_files=(
    "codex.md"
    "README.md"
    "package.json"
    "parser/validate.js"
    "parser/schema.json"
    "parser/errors.js"
    "gate/hollow-build.sh"
    "gate/hollow-build-ci.yml"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "ERROR: Required file missing: $file"
        exit 1
    fi
done

# Check required directories exist
echo "Checking required directories..."
required_dirs=(
    "parser"
    "gate"
    "examples"
    "tests"
)

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "ERROR: Required directory missing: $dir"
        exit 1
    fi
done

# Test package.json structure
echo "Testing package.json structure..."
if ! node -e "
const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
if (!pkg.name || !pkg.version || !pkg.scripts) {
    console.log('ERROR: package.json missing required fields');
    process.exit(1);
}
"; then
    echo "ERROR: package.json structure is invalid"
    exit 1
fi

# Test examples directory has content
echo "Checking examples directory..."
if [ ! -d "examples/with-codex" ] || [ ! -d "examples/without-codex" ]; then
    echo "ERROR: examples directory should contain with-codex and without-codex subdirectories"
    exit 1
fi

# Check for forbidden patterns (per debate decisions)
echo "Checking for excluded features..."
forbidden_patterns=(
    "seo_meta"
    "register_capability"
    "stream.*api"
    "async.*queue"
    "byok"
    "chat_widget"
    "wizard"
    "encrypt.*base64"
)

for pattern in "${forbidden_patterns[@]}"; do
    if grep -r "$pattern" . --exclude-dir=.git --exclude="*.md" 2>/dev/null; then
        echo "ERROR: Found excluded feature pattern: $pattern"
        exit 1
    fi
done

# Check total project size (anti-bloat)
echo "Checking project size..."
total_size=$(du -sk . | cut -f1)
if [ "$total_size" -gt 500 ]; then
    echo "ERROR: Project too large (${total_size}KB) - should be under 500KB"
    exit 1
fi

# Check all scripts are executable
echo "Checking script permissions..."
if [ -x "gate/hollow-build.sh" ] && [ -x "tests/"*.sh ]; then
    echo "✓ All scripts have executable permissions"
else
    echo "ERROR: Some scripts lack executable permissions"
    exit 1
fi

# Test that all test scripts can run without syntax errors
echo "Testing test script syntax..."
for test_script in tests/*.sh; do
    if ! bash -n "$test_script"; then
        echo "ERROR: Test script $test_script has syntax errors"
        exit 1
    fi
done

echo "✓ Project structure validation passed"
exit 0