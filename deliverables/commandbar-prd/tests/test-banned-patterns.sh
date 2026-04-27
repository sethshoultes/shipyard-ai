#!/usr/bin/env bash
# test-banned-patterns.sh — Verify no banned patterns exist in Beam build
# Pass: exits 0. Fail: exits non-zero.

set -euo pipefail

BUILD_DIR="projects/commandbar-prd/build/beam"

echo "=== Banned Patterns Test ==="

if [[ ! -d "$BUILD_DIR" ]]; then
    echo "SKIP: Build directory not found yet"
    exit 0
fi

# Patterns that must have 0 matches across both files
# Format: "pattern:description"

declare -a php_banned=(
    "register_rest_route:REST API route registration"
    "add_options_page:Settings page registration"
    "add_menu_page:Admin menu registration"
    "register_activation_hook:Activation hook (not needed)"
    "register_deactivation_hook:Deactivation hook (not needed)"
    "localStorage:Client-side storage"
    "fetch(:HTTP fetch API"
    "XMLHttpRequest:XHR requests"
    "wp.apiFetch:WordPress API fetch wrapper"
    "package.json:Node package manifest"
    "webpack.config.js:Webpack config"
    "node_modules:Dependency directory"
    "composer.json:Composer manifest"
    "vendor/:Composer vendor directory"
)

failures=0

for entry in "${php_banned[@]}"; do
    pattern="${entry%%:*}"
    description="${entry#*:}"

    # Search across all files in build directory
    count=$(grep -r "$pattern" "$BUILD_DIR" 2>/dev/null | wc -l || true)
    if (( count > 0 )); then
        echo "FAIL: Found banned pattern '$description' ($pattern) — $count occurrence(s)"
        failures=$((failures + 1))
    else
        echo "PASS: No banned pattern '$description'"
    fi
done

# Extra: ensure no .css files
if compgen -G "$BUILD_DIR/*.css" > /dev/null 2>&1; then
    echo "FAIL: CSS file(s) found in build directory"
    failures=$((failures + 1))
else
    echo "PASS: No CSS files in build directory"
fi

# Extra: ensure no separate build artifacts
for artifact in "package-lock.json" "yarn.lock" "dist/" ".git/"; do
    if [[ -e "$BUILD_DIR/$artifact" ]]; then
        echo "FAIL: Build artifact found: $artifact"
        failures=$((failures + 1))
    fi
done
echo "PASS: No build artifacts in build directory"

if (( failures > 0 )); then
    echo "=== Banned Patterns Test: $failures FAILURE(S) ==="
    exit 1
fi

echo "=== Banned Patterns Test: ALL PASSED ==="
