#!/bin/bash

# Test script to validate build gate functionality
# Exit 0 on pass, non-zero on fail

set -e

echo "Testing build gate validation..."

# Check if gate script exists
if [ ! -f "gate/hollow-build.sh" ]; then
    echo "ERROR: gate/hollow-build.sh not found"
    exit 1
fi

# Check if CI stub exists
if [ ! -f "gate/hollow-build-ci.yml" ]; then
    echo "ERROR: gate/hollow-build-ci.yml not found"
    exit 1
fi

# Test shell script syntax
echo "Testing gate script syntax..."
if ! bash -n gate/hollow-build.sh; then
    echo "ERROR: gate/hollow-build.sh contains syntax errors"
    exit 1
fi

# Test YAML syntax of CI stub
echo "Testing CI stub YAML syntax..."
if command -v yamllint &> /dev/null; then
    if ! yamllint gate/hollow-build-ci.yml; then
        echo "ERROR: gate/hollow-build-ci.yml contains YAML errors"
        exit 1
    fi
else
    # Fallback: basic Python YAML parsing
    if ! python3 -c "
import yaml
import sys
try:
    with open('gate/hollow-build-ci.yml') as f:
        yaml.safe_load(f)
except yaml.YAMLError as e:
    print(f'ERROR: YAML syntax error: {e}')
    sys.exit(1)
" 2>/dev/null; then
        echo "ERROR: gate/hollow-build-ci.yml contains YAML errors"
        exit 1
    fi
fi

# Make gate script executable
chmod +x gate/hollow-build.sh

# Create temporary test directory
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT

# Test gate with insufficient files (should fail)
echo "Testing gate with insufficient files..."
cd "$TEST_DIR"
echo "const test = 'file';" > file1.js
echo "const test2 = 'file';" > file2.js

# Copy gate script to test directory
cp /home/agent/shipyard-ai/deliverables/CODE-TEMPLATE/gate/hollow-build.sh .

if ./hollow-build.sh; then
    echo "ERROR: Gate should fail with only 2 source files (minimum 3 required)"
    exit 1
fi
echo "✓ Gate correctly rejects insufficient files"

# Test gate with sufficient files but no tests (should fail)
echo "Testing gate with sufficient files but no tests..."
echo "const test3 = 'file';" > file3.js

if ./hollow-build.sh; then
    echo "ERROR: Gate should fail with no test files (minimum 1 required)"
    exit 1
fi
echo "✓ Gate correctly rejects missing test files"

# Test gate with sufficient files and tests (should pass)
echo "Testing gate with sufficient files and tests..."
echo "// test file" > test.test.js

if ! ./hollow-build.sh; then
    echo "ERROR: Gate should pass with 3 source files and 1 test file"
    exit 1
fi
echo "✓ Gate correctly accepts sufficient files"

# Test gate with files in subdirectory (should count)
echo "Testing gate with files in subdirectory..."
mkdir src
echo "const submodule = 'file';" > src/module.js
rm file1.js file2.js file3.js
mv test.test.js src/

if ! ./hollow-build.sh; then
    echo "ERROR: Gate should count files in subdirectories"
    exit 1
fi
echo "✓ Gate correctly counts files in subdirectories"

cd /home/agent/shipyard-ai/deliverables/CODE-TEMPLATE

# Test gate script contains required checks
echo "Checking gate script contains required logic..."
if ! grep -q "source.*file\|\.js\|\.ts\|\.py" gate/hollow-build.sh; then
    echo "ERROR: Gate script should check for source files"
    exit 1
fi

if ! grep -q "test\|spec" gate/hollow-build.sh; then
    echo "ERROR: Gate script should check for test files"
    exit 1
fi

if ! grep -q "3\|minimum\|required" gate/hollow-build.sh; then
    echo "ERROR: Gate script should enforce minimum file count (3 source files)"
    exit 1
fi

# Test CI stub contains GitHub Actions structure
echo "Checking CI stub structure..."
if ! grep -q "on:\|push:\|pull_request:" gate/hollow-build-ci.yml; then
    echo "ERROR: CI stub should contain GitHub Actions triggers"
    exit 1
fi

if ! grep -q "jobs:\|validate:\|build:" gate/hollow-build-ci.yml; then
    echo "ERROR: CI stub should contain job definitions"
    exit 1
fi

echo "✓ Build gate validation passed"
exit 0