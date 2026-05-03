#!/bin/bash
# check-banned-patterns.sh
# Verifies the AgentPress plugin does not contain banned patterns (v1 exclusions)
# Exit 0 on pass, non-zero on fail

set -e

PLUGIN_DIR="agentpress"
ERRORS=0

echo "=== AgentPress Banned Patterns Check ==="
echo "Verifying v1 exclusions are honored..."
echo ""

# Patterns that should NOT exist in v1
declare -A BANNED_PATTERNS=(
    ["seo_meta"]="SEOMeta agent is excluded from v1"
    ["class-seo-meta"]="SEOMeta agent is excluded from v1"
    ["register_capability"]="Public developer API is v2"
    ["agentpress_register_capability"]="Public developer API is v2"
    ["stream"]="Streaming is not in v1"
    ["async.*queue"]="Async queues are not in v1"
    ["wp_cron.*agent"]="Async processing is not in v1"
    ["wizard"]="No onboarding wizard in v1"
    ["onboarding"]="No onboarding wizard in v1"
    ["chat.*widget"]="No front-end chat UI in v1"
    ["chat_widget"]="No front-end chat UI in v1"
    ["billing"]="No billing/SaaS in v1"
    ["premium"]="No premium tiers in v1"
    ["pro.*version"]="No Pro version in v1"
    ["upgrade.*now"]="No upgrade prompts in v1"
    ["base64_encode.*wp_hash"]="No encryption theater in v1"
    ["encrypt.*api_key"]="No encryption theater in v1"
    ["tailwind"]="No CSS frameworks allowed"
    ["bootstrap"]="No CSS frameworks allowed"
    ["manual.*runner"]="No manual task runner UI"
    ["task.*runner"]="No manual task runner UI"
    ["nav-tab-wrapper"]="No tabs in admin UI"
    ["wp_enqueue_style.*tailwind"]="No CSS frameworks allowed"
    ["wp_enqueue_style.*bootstrap"]="No CSS frameworks allowed"
)

# Check each banned pattern
for pattern in "${!BANNED_PATTERNS[@]}"; do
    if grep -ri "$pattern" "$PLUGIN_DIR" --include="*.php" --include="*.css" --include="*.txt" 2>/dev/null | grep -v "class-agent-third.php" | grep -v "Reserved" > /dev/null; then
        echo "  [FAIL] Found banned pattern '$pattern': ${BANNED_PATTERNS[$pattern]}"
        grep -rni "$pattern" "$PLUGIN_DIR" --include="*.php" --include="*.css" --include="*.txt" 2>/dev/null | grep -v "class-agent-third.php" | head -3 | sed 's/^/         /'
        ERRORS=$((ERRORS + 1))
    else
        echo "  [OK] No '$pattern' found"
    fi
done

# Special check: readme.txt should not contain Pro/Premium mentions
echo ""
echo "Checking readme.txt for Pro/Premium mentions..."
if [ -f "$PLUGIN_DIR/readme.txt" ]; then
    if grep -iE "(pro|premium|upgrade|tier|billing|saas)" "$PLUGIN_DIR/readme.txt" 2>/dev/null | grep -v "Anthropic" > /dev/null; then
        echo "  [FAIL] readme.txt contains Pro/Premium/tier mentions"
        ERRORS=$((ERRORS + 1))
    else
        echo "  [OK] readme.txt is clean of Pro/Premium mentions"
    fi
fi

# Check that only two agents are implemented (ContentWriter and ImageGenerator)
echo ""
echo "Checking agent count..."
AGENT_COUNT=$(find "$PLUGIN_DIR/includes/agents" -name "class-*.php" ! -name "class-agent-third.php" 2>/dev/null | wc -l)
if [ "$AGENT_COUNT" -eq 2 ]; then
    echo "  [OK] Exactly 2 agents implemented (ContentWriter, ImageGenerator)"
else
    echo "  [FAIL] Found $AGENT_COUNT agents (expected 2)"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=== Summary ==="
if [ $ERRORS -eq 0 ]; then
    echo "All v1 exclusions verified!"
    exit 0
else
    echo "FAILED: $ERRORS exclusion violation(s) found"
    exit 1
fi
