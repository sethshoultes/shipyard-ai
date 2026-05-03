#!/bin/bash
# check-file-structure.sh
# Verifies the AgentPress plugin has the correct file structure
# Exit 0 on pass, non-zero on fail

set -e

PLUGIN_DIR="agentpress"
ERRORS=0

echo "=== AgentPress File Structure Check ==="
echo ""

# Define required files
REQUIRED_FILES=(
    "$PLUGIN_DIR/agentpress.php"
    "$PLUGIN_DIR/includes/class-parser.php"
    "$PLUGIN_DIR/includes/class-agents.php"
    "$PLUGIN_DIR/includes/class-logger.php"
    "$PLUGIN_DIR/includes/class-router.php"
    "$PLUGIN_DIR/includes/class-rest-api.php"
    "$PLUGIN_DIR/includes/agents/class-content-writer.php"
    "$PLUGIN_DIR/includes/agents/class-image-generator.php"
    "$PLUGIN_DIR/includes/agents/class-agent-third.php"
    "$PLUGIN_DIR/admin/class-admin.php"
    "$PLUGIN_DIR/admin/css/agentpress-admin.css"
    "$PLUGIN_DIR/readme.txt"
)

# Check each required file exists
echo "Checking required files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  [OK] $file"
    else
        echo "  [MISSING] $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check agentpress.php has valid plugin header
echo ""
echo "Checking plugin header..."
if grep -q "Plugin Name: AgentPress" "$PLUGIN_DIR/agentpress.php" 2>/dev/null; then
    echo "  [OK] Plugin name header present"
else
    echo "  [FAIL] Missing 'Plugin Name: AgentPress' header"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "Version: 1.0.0" "$PLUGIN_DIR/agentpress.php" 2>/dev/null; then
    echo "  [OK] Version header present"
else
    echo "  [FAIL] Missing 'Version: 1.0.0' header"
    ERRORS=$((ERRORS + 1))
fi

# Check admin CSS is under 100 lines
echo ""
echo "Checking admin CSS size..."
if [ -f "$PLUGIN_DIR/admin/css/agentpress-admin.css" ]; then
    LINE_COUNT=$(wc -l < "$PLUGIN_DIR/admin/css/agentpress-admin.css")
    if [ "$LINE_COUNT" -le 100 ]; then
        echo "  [OK] CSS is $LINE_COUNT lines (≤100)"
    else
        echo "  [FAIL] CSS is $LINE_COUNT lines (should be ≤100)"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check no node_modules or .git in plugin directory
echo ""
echo "Checking for excluded directories..."
if [ -d "$PLUGIN_DIR/node_modules" ]; then
    echo "  [FAIL] node_modules found in plugin directory"
    ERRORS=$((ERRORS + 1))
else
    echo "  [OK] No node_modules"
fi

if [ -d "$PLUGIN_DIR/.git" ]; then
    echo "  [FAIL] .git found in plugin directory"
    ERRORS=$((ERRORS + 1))
else
    echo "  [OK] No .git directory"
fi

# Summary
echo ""
echo "=== Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo "All checks passed!"
    exit 0
else
    echo "FAILED: $ERRORS error(s) found"
    exit 1
fi
