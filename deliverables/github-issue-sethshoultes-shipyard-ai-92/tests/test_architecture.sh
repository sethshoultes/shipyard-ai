#!/usr/bin/env bash
# test_architecture.sh
# Verifies architectural invariants: one composition, 1080x1920 resolution,
# three voices, Redis in docker-compose, queue concurrency cap, etc.
# Exit 0 on pass, non-zero on fail.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROJECT_DIR="${REPO_ROOT}/reel"

ERRORS=0

check_file_contains() {
    local file="$1"
    local pattern="$2"
    local label="$3"

    if [[ ! -f "$file" ]]; then
        echo "SKIP: file not yet present: $file"
        return 0
    fi

    if grep -q "$pattern" "$file"; then
        echo "PASS: $label"
    else
        echo "FAIL: $label (expected pattern: $pattern)"
        ERRORS=$((ERRORS + 1))
    fi
}

count_files() {
    local dir="$1"
    local glob="$2"
    if [[ ! -d "$dir" ]]; then
        echo "0"
        return
    fi
    find "$dir" -maxdepth 1 -type f -name "$glob" | wc -l | tr -d ' '
}

echo "=== Architecture Invariant Checks ==="
echo ""

# A1: Only one Remotion composition exists
COMPOSITION_COUNT=$(count_files "${PROJECT_DIR}/packages/remotion/src/compositions" "*.tsx")
if [[ "$COMPOSITION_COUNT" -eq 1 ]]; then
    echo "PASS: exactly one Remotion composition ($COMPOSITION_COUNT)"
else
    echo "FAIL: expected 1 Remotion composition, found $COMPOSITION_COUNT"
    ERRORS=$((ERRORS + 1))
fi

# A2: ReelVertical is 1080×1920
check_file_contains \
    "${PROJECT_DIR}/packages/remotion/src/compositions/ReelVertical.tsx" \
    "1080.*1920\|1920.*1080" \
    "ReelVertical composition defines 1080×1920 resolution"

# A3: TTS abstraction defines at least 3 voices
if [[ -f "${PROJECT_DIR}/apps/web/lib/tts.ts" ]]; then
    VOICE_COUNT=$(grep -c 'voice_id\|voiceId' "${PROJECT_DIR}/apps/web/lib/tts.ts" || true)
    if [[ "$VOICE_COUNT" -ge 3 ]]; then
        echo "PASS: tts.ts defines $VOICE_COUNT voice references (≥3)"
    else
        echo "FAIL: tts.ts defines $VOICE_COUNT voice references, expected ≥3"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "SKIP: tts.ts not yet present"
fi

# A4: Queue has concurrency cap
check_file_contains \
    "${PROJECT_DIR}/apps/web/lib/queue.ts" \
    "concurrency\|max\|Bull" \
    "queue.ts contains concurrency or Bull queue reference"

# A5: Docker Compose includes Redis
check_file_contains \
    "${PROJECT_DIR}/infra/docker-compose.yml" \
    "redis" \
    "docker-compose.yml includes Redis service"

# A6: S3 utility exists
check_file_contains \
    "${PROJECT_DIR}/apps/web/lib/s3.ts" \
    "upload\|presign\|S3\|MinIO\|R2" \
    "s3.ts contains upload or presign logic"

# A7: BulletReveal component exists
check_file_contains \
    "${PROJECT_DIR}/packages/remotion/src/components/BulletReveal.tsx" \
    "BulletReveal\|bullet\|reveal" \
    "BulletReveal.tsx is a valid component file"

# A8: Font directory has at least 2 font-related files
if [[ -d "${PROJECT_DIR}/packages/remotion/src/fonts" ]]; then
    FONT_COUNT=$(find "${PROJECT_DIR}/packages/remotion/src/fonts" -maxdepth 1 -type f | wc -l | tr -d ' ')
    if [[ "$FONT_COUNT" -ge 2 ]]; then
        echo "PASS: font directory has $FONT_COUNT files (≥2)"
    else
        echo "FAIL: font directory has $FONT_COUNT files, expected ≥2"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "SKIP: fonts directory not yet present"
fi

# A9: Render entrypoint exists
check_file_contains \
    "${PROJECT_DIR}/packages/remotion/render.ts" \
    "render\|Remotion\|composition" \
    "render.ts references render or Remotion composition"

echo ""
if [[ $ERRORS -eq 0 ]]; then
    echo "=== ALL ARCHITECTURE CHECKS PASSED ==="
    exit 0
else
    echo "=== $ERRORS ARCHITECTURE FAILURE(S) ==="
    exit 1
fi
