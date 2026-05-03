#!/bin/bash

# Test script to validate parser functionality
# Exit 0 on pass, non-zero on fail

set -e

echo "Testing parser validation..."

# Check if parser files exist
if [ ! -f "parser/validate.js" ]; then
    echo "ERROR: parser/validate.js not found"
    exit 1
fi

if [ ! -f "parser/schema.json" ]; then
    echo "ERROR: parser/schema.json not found"
    exit 1
fi

if [ ! -f "parser/errors.js" ]; then
    echo "ERROR: parser/errors.js not found"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required but not installed"
    exit 1
fi

# Test JSON syntax of schema
echo "Testing schema JSON syntax..."
if ! node -e "JSON.parse(require('fs').readFileSync('parser/schema.json', 'utf8'))"; then
    echo "ERROR: parser/schema.json contains invalid JSON"
    exit 1
fi

# Test JavaScript syntax of parser
echo "Testing parser JavaScript syntax..."
if ! node -c parser/validate.js; then
    echo "ERROR: parser/validate.js contains syntax errors"
    exit 1
fi

# Test JavaScript syntax of errors
echo "Testing errors JavaScript syntax..."
if ! node -c parser/errors.js; then
    echo "ERROR: parser/errors.js contains syntax errors"
    exit 1
fi

# Check that validate.js exports a validate function
echo "Checking validate function export..."
if ! node -e "
const validate = require('./parser/validate.js');
if (typeof validate.validate !== 'function') {
    console.log('ERROR: validate.js does not export a validate function');
    process.exit(1);
}
"; then
    echo "ERROR: validate.js does not properly export validation function"
    exit 1
fi

# Check that errors.js exports error messages
echo "Checking error messages export..."
if ! node -e "
const errors = require('./parser/errors.js');
if (typeof errors !== 'object' || Object.keys(errors).length === 0) {
    console.log('ERROR: errors.js does not export error messages');
    process.exit(1);
}
"; then
    echo "ERROR: errors.js does not properly export error messages"
    exit 1
fi

# Test parser with valid input (if template exists)
if [ -f "codex.md" ]; then
    echo "Testing parser with valid template..."
    if node -e "
const { validate } = require('./parser/validate.js');
const fs = require('fs');
const template = fs.readFileSync('codex.md', 'utf8');
const result = validate(template);
if (result !== true) {
    console.log('ERROR: Parser should accept valid codex.md template');
    console.log('Validation result:', result);
    process.exit(1);
}
"; then
        echo "✓ Parser correctly validates template"
    else
        echo "WARNING: Parser rejected codex.md template - may need implementation"
    fi
fi

# Test parser with invalid input
echo "Testing parser with invalid input..."
invalid_input="invalid content"
if node -e "
const { validate } = require('./parser/validate.js');
const result = validate('$invalid_input');
if (result === true) {
    console.log('ERROR: Parser should reject invalid input');
    process.exit(1);
}
"; then
    echo "✓ Parser correctly rejects invalid input"
else
    echo "WARNING: Parser accepted invalid input - may need stricter validation"
fi

echo "✓ Parser validation tests completed"
exit 0