---
hotfix: true
---
# PRD: Fix Deploy Sunrise Yoga — Verify All Plugins Load

> Priority: p0
> hotfix: true

## Prerequisites

These must be completed first:
- Fix plugin entrypoints + register all in Sunrise Yoga
- Fix EventDash 95 banned pattern violations

## Steps

### Step 1: Verify all plugins registered
```bash
grep -c "Plugin" examples/sunrise-yoga/astro.config.mjs
```

### Step 2: Verify zero violations across all plugins
```bash
for f in plugins/*/src/sandbox-entry.ts; do
  name=$(echo $f | sed 's|plugins/||;s|/src/.*||')
  count=$(grep -c "throw new Response\|rc\.user\|rc\.pathParams" "$f" 2>/dev/null)
  echo "$name: $count violations"
done
```
All must be 0.

### Step 3: Build
```bash
cd examples/sunrise-yoga
npm run build 2>&1 | tail -10
```
Must complete without errors.

### Step 4: Deploy
```bash
source /home/agent/shipyard-ai/.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npx wrangler deploy 2>&1 | tail -10
```
Must show "Deployed" with no errors.

### Step 5: Smoke test each plugin route
```bash
for plugin in membership eventdash commercekit formforge reviewpulse seodash; do
  echo "=== $plugin ==="
  curl -s https://yoga.shipyard.company/_emdash/api/plugins/$plugin/admin \
    -H "Content-Type: application/json" \
    -d '{"type":"page_load"}' | head -3
done
```
Each should return `UNAUTHORIZED` (auth-gated, meaning plugin is loaded) — NOT `NOT_FOUND` or `INTERNAL_ERROR`.

## Files to Modify

None — this is deploy + verify only.

## Success Criteria

- [ ] Build succeeds
- [ ] Deploy succeeds
- [ ] All registered plugins return UNAUTHORIZED (not NOT_FOUND)
- [ ] No INTERNAL_ERROR on any plugin route
- [ ] Committed and pushed
