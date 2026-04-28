#!/usr/bin/env bash
# Fail the build if the project has output: "export" AND any src/app/**/route.ts
# declares runtime: edge|nodejs without a corresponding functions/ entry.
# Issue #97. Run as a build hook before next build.
set -u
ROOT="$(dirname "$0")/.."
NEXT_CFG="$ROOT/next.config.ts"
[ -f "$NEXT_CFG" ] || { echo "check-static-export: no next.config.ts"; exit 0; }
grep -qE '^\s*output:\s*["'\'']export["'\'']' "$NEXT_CFG" || { echo "check-static-export: not a static export, skipping"; exit 0; }
fail=0
while IFS= read -r r; do
  if grep -qE 'runtime\s*=\s*["'\'']( edge|nodejs)["'\'']' "$r"; then
    rel=${r#$ROOT/src/app/}
    fn_path="$ROOT/functions/${rel%/route.ts}/[[path]].ts"
    fn_path_alt="$ROOT/functions/${rel%/route.ts}.ts"
    if [ ! -f "$fn_path" ] && [ ! -f "$fn_path_alt" ]; then
      echo "check-static-export: $r declares server runtime but no functions/ replacement found" >&2
      fail=1
    fi
  fi
done < <(find "$ROOT/src/app" -name 'route.ts' 2>/dev/null)
[ "$fail" -eq 0 ] && echo "check-static-export: OK" || exit 2
