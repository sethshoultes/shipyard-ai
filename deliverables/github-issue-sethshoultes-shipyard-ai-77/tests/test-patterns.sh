#!/bin/bash
#
# test-patterns.sh — Verify Stage complies with banned and required patterns.
# Exits 0 on pass, non-zero on fail.
#

set -euo pipefail

PLUGIN_DIR="stage"
ERRORS=0

echo "=== Stage Pattern Compliance Test ==="

if [[ ! -d "$PLUGIN_DIR" ]]; then
    echo "FAIL: Plugin directory $PLUGIN_DIR does not exist"
    exit 1
fi

# ---------------------------------------------------------------------------
# Required PHP patterns
# ---------------------------------------------------------------------------
PHP_FILES=("$PLUGIN_DIR"/*.php "$PLUGIN_DIR"/includes/*.php)
for pattern in "defined('ABSPATH')" "get_transient" "set_transient" "sanitize_text_field" "template_include" "wp_head"; do
    if ! grep -rq "$pattern" "${PHP_FILES[@]}" 2>/dev/null; then
        echo "FAIL: Required PHP pattern missing: '$pattern'"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: Required PHP pattern found: '$pattern'"
    fi
done

# ---------------------------------------------------------------------------
# Banned PHP patterns (must not appear in activation context)
# ---------------------------------------------------------------------------
# activation hook must not call external HTTP
ACTIVATION_CONTEXT=$(grep -rA10 -B2 "register_activation_hook" "$PLUGIN_DIR"/*.php "$PLUGIN_DIR"/includes/*.php 2>/dev/null || true)
if echo "$ACTIVATION_CONTEXT" | grep -qE "wp_remote_|curl|file_get_contents"; then
    echo "FAIL: External HTTP call detected near activation hook"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS: No external HTTP calls near activation hooks"
fi

# REST API must not be used (client-side index mandate)
if grep -rq "register_rest_route" "$PLUGIN_DIR"/*.php "$PLUGIN_DIR"/includes/*.php 2>/dev/null; then
    echo "FAIL: Banned pattern found: register_rest_route"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS: No register_rest_route found"
fi

# ---------------------------------------------------------------------------
# Required CSS patterns
# ---------------------------------------------------------------------------
CSS_FILE="$PLUGIN_DIR/assets/css/stage.css"
if [[ -f "$CSS_FILE" ]]; then
    if ! grep -q "transition:" "$CSS_FILE"; then
        echo "FAIL: Required CSS pattern missing: 'transition:'"
        ERRORS=$((ERRORS + 1))
    else
        TRANSITION_COUNT=$(grep -c "transition:" "$CSS_FILE")
        echo "PASS: CSS transitions found ($TRANSITION_COUNT instance(s))"
    fi

    if ! grep -q "@media (prefers-color-scheme: dark)" "$CSS_FILE"; then
        echo "FAIL: Required CSS pattern missing: '@media (prefers-color-scheme: dark)'"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: Dark/light mode media query found"
    fi
else
    echo "FAIL: CSS file missing: $CSS_FILE"
    ERRORS=$((ERRORS + 1))
fi

# ---------------------------------------------------------------------------
# Banned CSS patterns
# ---------------------------------------------------------------------------
if [[ -f "$CSS_FILE" ]]; then
    for banned in "#0073aa" "beige" "BEIGE"; do
        if grep -q "$banned" "$CSS_FILE"; then
            echo "FAIL: Banned CSS pattern found: '$banned'"
            ERRORS=$((ERRORS + 1))
        else
            echo "PASS: No banned CSS pattern: '$banned'"
        fi
    done
fi

# ---------------------------------------------------------------------------
# Banned JS animation libraries (anywhere in plugin)
# ---------------------------------------------------------------------------
for lib in "gsap" "anime" "lottie" "velocity" "aos" "scrollreveal"; do
    if grep -riq "$lib" "$PLUGIN_DIR" 2>/dev/null; then
        echo "FAIL: JS animation library detected: '$lib'"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: No JS animation library: '$lib'"
    fi
done

# ---------------------------------------------------------------------------
# OpenGraph tags
# ---------------------------------------------------------------------------
if ! grep -rq "og:title" "$PLUGIN_DIR"/*.php "$PLUGIN_DIR"/includes/*.php "$PLUGIN_DIR"/templates/*.php 2>/dev/null; then
    echo "FAIL: OpenGraph og:title not found"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS: OpenGraph og:title found"
fi

# ---------------------------------------------------------------------------
# No "powered by" badges
# ---------------------------------------------------------------------------
if grep -riq "powered by" "$PLUGIN_DIR" 2>/dev/null; then
    echo "FAIL: 'powered by' badge copy found"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS: No 'powered by' badges"
fi

# ---------------------------------------------------------------------------
# No custom CSS frameworks
# ---------------------------------------------------------------------------
if [[ -f "$CSS_FILE" ]]; then
    for framework in "bootstrap" "tailwind" "bulma"; do
        if grep -iq "$framework" "$CSS_FILE"; then
            echo "FAIL: CSS framework detected: '$framework'"
            ERRORS=$((ERRORS + 1))
        else
            echo "PASS: No CSS framework: '$framework'"
        fi
    done
fi

# ---------------------------------------------------------------------------
# PHP 5.6 compatibility (simple grep heuristics)
# ---------------------------------------------------------------------------
PHP_ALL=$(find "$PLUGIN_DIR" -name '*.php' -exec cat {} + 2>/dev/null)
if echo "$PHP_ALL" | grep -qE '\?\?\s|match\s*\(|:\s*\bstring\b|:\s*\bint\b|:\s*\barray\b'; then
    echo "FAIL: Possible PHP 7+ syntax detected (??, match, or scalar type hints)"
    ERRORS=$((ERRORS + 1))
else
    echo "PASS: No obvious PHP 7+ syntax violations"
fi

if (( ERRORS > 0 )); then
    echo "=== FAILED: $ERRORS pattern violation(s) ==="
    exit 1
fi

echo "=== All pattern tests passed ==="
exit 0
