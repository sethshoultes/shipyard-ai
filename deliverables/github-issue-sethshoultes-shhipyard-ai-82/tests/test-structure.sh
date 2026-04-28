#!/usr/bin/env bash
#
# test-structure.sh — Verify that every expected file and directory exists
# in the Cut build output.
#
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

BUILD_DIR="${BUILD_DIR:-projects/cut/build}"
FAIL=0

check_exists() {
    if [[ ! -e "$1" ]]; then
        echo "FAIL: Missing expected path: $1" >&2
        FAIL=1
    else
        echo "PASS: $1"
    fi
}

echo "=== Cut Build Structure Check ==="
echo "BUILD_DIR: $BUILD_DIR"
echo ""

# Client core
check_exists "$BUILD_DIR/client/index.html"
check_exists "$BUILD_DIR/client/src/parser.js"
check_exists "$BUILD_DIR/client/src/renderer.js"
check_exists "$BUILD_DIR/client/src/narrator.js"
check_exists "$BUILD_DIR/client/src/sequence.js"
check_exists "$BUILD_DIR/client/src/typography.css"
check_exists "$BUILD_DIR/client/src/motion.css"

# WordPress plugin
check_exists "$BUILD_DIR/wordpress-plugin/cut.php"
check_exists "$BUILD_DIR/wordpress-plugin/admin/page.php"
check_exists "$BUILD_DIR/wordpress-plugin/admin/preview.php"
check_exists "$BUILD_DIR/wordpress-plugin/public/shortcode.php"
check_exists "$BUILD_DIR/wordpress-plugin/public/block.js"

# Distribution
check_exists "$BUILD_DIR/readme.txt"
check_exists "$BUILD_DIR/org-assets/banner-772x250.png"
check_exists "$BUILD_DIR/org-assets/screenshot-1.png"
check_exists "$BUILD_DIR/org-assets/icon-256x256.png"

echo ""
if [[ "$FAIL" -eq 0 ]]; then
    echo "=== ALL CHECKS PASSED ==="
    exit 0
else
    echo "=== SOME CHECKS FAILED ==="
    exit 1
fi
