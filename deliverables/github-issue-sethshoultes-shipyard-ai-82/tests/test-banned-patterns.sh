#!/usr/bin/env bash
#
# test-banned-patterns.sh — Grep the build for banned APIs and patterns.
#
# Banned:
#   - Server-side video rendering (remotion, ffmpeg, mp4, renderMedia, renderStill)
#   - REST API routes in WP plugin (register_rest_route)
#   - External HTTP calls in PHP (wp_remote_get, wp_remote_post, curl_init)
#   - localStorage usage in JS
#   - fetch / XMLHttpRequest for audio in client core
#   - External asset hotlinking (http://, https://, cdn) in client JS/CSS
#
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

BUILD_DIR="${BUILD_DIR:-projects/cut/build}"
FAIL=0

grep_check() {
    local pattern="$1"
    local glob="$2"
    local description="$3"

    # Use -r for recursive, -l to list files, --include for glob
    local matches
    matches=$(grep -rl "$pattern" --include="$glob" "$BUILD_DIR" 2>/dev/null || true)

    if [[ -n "$matches" ]]; then
        echo "FAIL: $description"
        echo "  Pattern: $pattern"
        echo "  Files:"
        echo "$matches" | sed 's/^/    /'
        FAIL=1
    else
        echo "PASS: $description"
    fi
}

echo "=== Cut Banned Pattern Scan ==="
echo "BUILD_DIR: $BUILD_DIR"
echo ""

# PHP-side bans
grep_check "remotion"       "*.php" "No server-side Remotion code in PHP"
grep_check "ffmpeg"         "*.php" "No ffmpeg references in PHP"
grep_check "mp4"            "*.php" "No MP4 generation in PHP"
grep_check "renderMedia"    "*.php" "No Remotion renderMedia in PHP"
grep_check "renderStill"    "*.php" "No Remotion renderStill in PHP"
grep_check "register_rest_route" "*.php" "No REST API routes in PHP"
grep_check "wp_remote_get"  "*.php" "No external HTTP GET in PHP"
grep_check "wp_remote_post" "*.php" "No external HTTP POST in PHP"
grep_check "curl_init"      "*.php" "No cURL in PHP"

# JS-side bans
grep_check "localStorage"   "*.js"  "No localStorage usage in JS"
grep_check "fetch"          "client/src/*.js"  "No fetch in client core JS"
grep_check "XMLHttpRequest" "client/src/*.js"  "No XHR in client core JS"

# External asset bans in client core (optional Google Font in HTML is allowed)
grep_check "http://"        "client/src/*.js"  "No HTTP hotlinks in client JS"
grep_check "https://"       "client/src/*.js"  "No HTTPS hotlinks in client JS"
grep_check "cdn"            "client/src/*"     "No CDN references in client core"

echo ""
if [[ "$FAIL" -eq 0 ]]; then
    echo "=== ALL BANNED PATTERN CHECKS PASSED ==="
    exit 0
else
    echo "=== SOME BANNED PATTERN CHECKS FAILED ==="
    exit 1
fi
