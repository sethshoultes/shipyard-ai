#!/usr/bin/env bash
# test_file_structure.sh
# Verifies that every planned file and directory exists in the Reel monorepo.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROJECT_DIR="${REPO_ROOT}/reel"

ERRORS=0

check_dir() {
    if [[ ! -d "$1" ]]; then
        echo "FAIL: missing directory: $1"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: directory exists: $1"
    fi
}

check_file() {
    if [[ ! -f "$1" ]]; then
        echo "FAIL: missing file: $1"
        ERRORS=$((ERRORS + 1))
    else
        echo "PASS: file exists: $1"
    fi
}

echo "=== File Structure Check ==="
echo "Project dir: ${PROJECT_DIR}"
echo ""

# Directories
check_dir "${PROJECT_DIR}"
check_dir "${PROJECT_DIR}/apps"
check_dir "${PROJECT_DIR}/apps/web"
check_dir "${PROJECT_DIR}/apps/web/app"
check_dir "${PROJECT_DIR}/apps/web/app/api"
check_dir "${PROJECT_DIR}/apps/web/app/api/extract"
check_dir "${PROJECT_DIR}/apps/web/app/api/render"
check_dir "${PROJECT_DIR}/apps/web/app/api/download"
check_dir "${PROJECT_DIR}/apps/web/components"
check_dir "${PROJECT_DIR}/apps/web/lib"
check_dir "${PROJECT_DIR}/packages"
check_dir "${PROJECT_DIR}/packages/remotion"
check_dir "${PROJECT_DIR}/packages/remotion/src"
check_dir "${PROJECT_DIR}/packages/remotion/src/compositions"
check_dir "${PROJECT_DIR}/packages/remotion/src/components"
check_dir "${PROJECT_DIR}/packages/remotion/src/fonts"
check_dir "${PROJECT_DIR}/infra"

# Files
check_file "${PROJECT_DIR}/package.json"
check_file "${PROJECT_DIR}/README.md"
check_file "${PROJECT_DIR}/apps/web/package.json"
check_file "${PROJECT_DIR}/apps/web/next.config.js"
check_file "${PROJECT_DIR}/apps/web/app/layout.tsx"
check_file "${PROJECT_DIR}/apps/web/app/page.tsx"
check_file "${PROJECT_DIR}/apps/web/app/api/extract/route.ts"
check_file "${PROJECT_DIR}/apps/web/app/api/render/route.ts"
check_file "${PROJECT_DIR}/apps/web/app/api/download/route.ts"
check_file "${PROJECT_DIR}/apps/web/components/PasteForm.tsx"
check_file "${PROJECT_DIR}/apps/web/components/RenderStatus.tsx"
check_file "${PROJECT_DIR}/apps/web/components/VoiceSelector.tsx"
check_file "${PROJECT_DIR}/apps/web/lib/s3.ts"
check_file "${PROJECT_DIR}/apps/web/lib/queue.ts"
check_file "${PROJECT_DIR}/apps/web/lib/tts.ts"
check_file "${PROJECT_DIR}/packages/remotion/package.json"
check_file "${PROJECT_DIR}/packages/remotion/tsconfig.json"
check_file "${PROJECT_DIR}/packages/remotion/src/compositions/ReelVertical.tsx"
check_file "${PROJECT_DIR}/packages/remotion/src/components/TitleCard.tsx"
check_file "${PROJECT_DIR}/packages/remotion/src/components/BulletReveal.tsx"
check_file "${PROJECT_DIR}/packages/remotion/src/components/OutroCard.tsx"
check_file "${PROJECT_DIR}/packages/remotion/render.ts"
check_file "${PROJECT_DIR}/infra/docker-compose.yml"

echo ""
if [[ $ERRORS -eq 0 ]]; then
    echo "=== ALL CHECKS PASSED ==="
    exit 0
else
    echo "=== $ERRORS FAILURE(S) ==="
    exit 1
fi
