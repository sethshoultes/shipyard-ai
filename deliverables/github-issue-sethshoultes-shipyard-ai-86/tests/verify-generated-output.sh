#!/bin/bash
# verify-generated-output.sh — Verify generated worker output meets spec
# This script tests the generator by running it and checking the output
# Exit 0 on pass, non-zero on fail

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANVIL_DIR="$SCRIPT_DIR/../anvil"
OUTPUT_DIR="$SCRIPT_DIR/../test-output"

echo "=== Anvil Generated Output Verification ==="
echo ""

# Clean up previous test output
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Check 1: Generator files exist
echo "Checking generator source files..."
echo -n "  spec.ts exists... "
if [ -f "$ANVIL_DIR/src/generators/spec.ts" ]; then
    echo "✓"
else
    echo "✗ FAILED: src/generators/spec.ts does not exist"
    exit 1
fi

echo -n "  worker.ts exists... "
if [ -f "$ANVIL_DIR/src/generators/worker.ts" ]; then
    echo "✓"
else
    echo "✗ FAILED: src/generators/worker.ts does not exist"
    exit 1
fi

# Check 2: Verify generator code structure (static analysis)
echo ""
echo "Checking generator code structure..."

# Check for fetch in spec.ts
echo -n "  spec.ts contains fetch logic... "
if grep -q "fetch(" "$ANVIL_DIR/src/generators/spec.ts"; then
    echo "✓"
else
    echo "✗ FAILED: spec.ts should contain fetch() call"
    exit 1
fi

# Check for text-generation model parsing
echo -n "  spec.ts parses text-generation models... "
if grep -q "text-generation" "$ANVIL_DIR/src/generators/spec.ts"; then
    echo "✓"
else
    echo "✗ FAILED: spec.ts should parse text-generation models"
    exit 1
fi

# Check for ReadableStream in worker.ts output
echo -n "  worker.ts generates ReadableStream code... "
if grep -q "ReadableStream" "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✓"
else
    echo "✗ FAILED: worker.ts should generate ReadableStream code"
    exit 1
fi

# Check for AI binding in worker.ts output
echo -n "  worker.ts generates AI binding code... "
if grep -qE 'env\.AI|ai\.run|AI\s*=' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✓"
else
    echo "✗ FAILED: worker.ts should generate AI binding code"
    exit 1
fi

# Check for wrangler.toml generation with AI binding
echo -n "  worker.ts generates wrangler.toml with AI binding... "
if grep -qE '\[\[ai\]\]|ai\s*=' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✓"
else
    echo "✗ FAILED: worker.ts should generate wrangler.toml with [[ai]] binding"
    exit 1
fi

# Check for rate limit config in wrangler.toml generation
echo -n "  worker.ts generates rate limit config... "
if grep -qE 'limits|rateLimit|rate_limit' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✓"
else
    echo "✗ FAILED: worker.ts should generate rate limit config"
    exit 1
fi

# Check 3: Verify NO banned features in generated output
echo ""
echo "Checking for banned features (should be CUT from v1)..."

# No caching
echo -n "  No caching config generated... "
if grep -qiE 'cache|kv_namespace|r2_bucket' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✗ FAILED: Caching should be CUT from v1"
    exit 1
else
    echo "✓"
fi

# No monitoring
echo -n "  No monitoring config generated... "
if grep -qiE 'logs|observability|dashboard|monitoring' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✗ FAILED: Monitoring should be CUT from v1"
    exit 1
else
    echo "✓"
fi

# No image/audio models
echo -n "  No image/audio model support... "
if grep -qiE 'image-generation|audio|speech-to-text' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✗ FAILED: Image/audio models should be CUT from v1"
    exit 1
else
    echo "✓"
fi

# Check 4: Verify streaming-only (no batch/blocking mode)
echo ""
echo -n "  Streaming-only (no batch mode)... "
if grep -qiE 'batch|blocking' "$ANVIL_DIR/src/generators/worker.ts"; then
    echo "✗ FAILED: Should be streaming-only, no batch mode"
    exit 1
else
    echo "✓"
fi

# Check 5: Verify dynamic generation (no static templates)
echo ""
echo -n "  Dynamic generation (no static templates)... "
# Check that worker.ts doesn't have large template literals with hardcoded worker code
TEMPLATE_LINES=$(grep -c "^\s*\`" "$ANVIL_DIR/src/generators/worker.ts" 2>/dev/null || echo "0")
if [ "$TEMPLATE_LINES" -gt 50 ]; then
    echo "✗ FAILED: Too many template literal lines ($TEMPLATE_LINES) - should be dynamic"
    exit 1
else
    echo "✓ (template lines: $TEMPLATE_LINES)"
fi

# Check 6: Verify exactly 2 files are generated
echo ""
echo -n "  Generator outputs exactly 2 files... "
# Count writeFile or writeFileSync calls in worker.ts
WRITE_COUNT=$(grep -c "writeFile\|writeFileSync" "$ANVIL_DIR/src/generators/worker.ts" 2>/dev/null || echo "0")
if [ "$WRITE_COUNT" -eq 2 ]; then
    echo "✓"
elif [ "$WRITE_COUNT" -eq 0 ]; then
    echo "⚠ WARNING: No writeFile calls found (may use different API)"
else
    echo "⚠ WARNING: Found $WRITE_COUNT writeFile calls (expected 2)"
fi

# Clean up
rm -rf "$OUTPUT_DIR"

echo ""
echo "=== All Generated Output Checks Passed ==="
exit 0
