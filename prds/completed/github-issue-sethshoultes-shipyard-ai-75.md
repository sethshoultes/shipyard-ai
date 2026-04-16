# PRD: Deploy Sunrise Yoga and verify plugins in manifest

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#75
> https://github.com/sethshoultes/shipyard-ai/issues/75

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #75
- **Author:** sethshoultes
- **Labels:** bug, p0
- **Created:** 2026-04-16T03:24:31Z

## Problem
## Problem

After fixing wrangler.jsonc worker_loaders and plugin entrypoints (see related issues), Sunrise Yoga needs to be rebuilt and deployed to verify plugins load in production.

## Prerequisites

These issues must be fixed first:
- Fix wrangler.jsonc: add worker_loaders binding
- Fix EventDash entrypoint: use file path instead of npm alias

## Steps

```bash
cd /home/agent/shipyard-ai/examples/sunrise-yoga
source /home/agent/shipyard-ai/.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npm run build && npx wrangler deploy
```

## Smoke Test

```bash
# Verify manifest includes plugins:
curl -s https://yoga.shipyard.company/_emdash/api/manifest | python3 -c "
import json,sys
d=json.load(sys.stdin)
plugins = d.get('plugins',[])
print('Plugins found:', [p.get('id') for p in plugins])
assert 'membership' in [p.get('id') for p in plugins], 'membership missing'
assert 'eventdash' in [p.get('id') for p in plugins], 'eventdash missing'
print('PASS')
"

# Plugin routes should not return INTERNAL_ERROR:
curl -s https://yoga.shipyard.company/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" -d '{"type":"page_load"}'

curl -s https://yoga.shipyard.company/_emdash/api/plugins/eventdash/admin \
  -H "Content-Type: application/json" -d '{"type":"page_load"}'
```

## Success Criteria

- [ ] Build succeeds with no errors
- [ ] Deploy to Cloudflare succeeds
- [ ] Manifest shows both `membership` and `eventdash` plugins
- [ ] Plugin admin routes don't return INTERNAL_ERROR
- [ ] Committed and pushed

## Success Criteria
- Issue sethshoultes/shipyard-ai#75 requirements are met
- All tests pass
