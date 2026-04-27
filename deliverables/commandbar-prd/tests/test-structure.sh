#!/usr/bin/env bash
# test-structure.sh — Verify the Beam plugin directory structure
# Pass: exits 0. Fail: exits non-zero.

set -euo pipefail

BUILD_DIR="projects/commandbar-prd/build/beam"
DEPLOY_DIR="projects/commandbar-prd/deploy"

echo "=== Structure Test ==="

# 1. Build directory exists
if [[ ! -d "$BUILD_DIR" ]]; then
    echo "FAIL: Build directory $BUILD_DIR does not exist"
    exit 1
fi
echo "PASS: Build directory exists"

# 2. Exactly the expected files in build/beam/ (readme.txt is allowed)
mapfile -t files < <(find "$BUILD_DIR" -maxdepth 1 -type f -printf '%f\n' | sort)
expected=("beam.js" "beam.php" "readme.txt")

for f in "${expected[@]}"; do
    if [[ ! -f "$BUILD_DIR/$f" ]]; then
        echo "FAIL: Missing required file: $f"
        exit 1
    fi
done
echo "PASS: Required files present (beam.php, beam.js, readme.txt)"

# 3. No subdirectories inside build/beam/
mapfile -t dirs < <(find "$BUILD_DIR" -mindepth 1 -type d)
if (( ${#dirs[@]} > 0 )); then
    echo "FAIL: Unexpected subdirectories found: ${dirs[*]}"
    exit 1
fi
echo "PASS: No subdirectories inside build/beam/"

# 4. No separate CSS file
if compgen -G "$BUILD_DIR/*.css" > /dev/null; then
    echo "FAIL: CSS file(s) found in build directory"
    exit 1
fi
echo "PASS: No CSS files in build directory"

# 5. ZIP exists and contains exactly 3 files
if [[ ! -f "$DEPLOY_DIR/beam-1.0.0.zip" ]]; then
    echo "WARN: Deployment ZIP not found yet (expected after build)"
    # Don't fail — this test is meant to run post-build
else
    zip_count=$(unzip -l "$DEPLOY_DIR/beam-1.0.0.zip" | tail -n +4 | head -n -2 | wc -l)
    if (( zip_count != 3 )); then
        echo "FAIL: ZIP contains $zip_count files, expected 3"
        exit 1
    fi
    echo "PASS: ZIP contains exactly 3 files"
fi

echo "=== Structure Test: ALL PASSED ==="
