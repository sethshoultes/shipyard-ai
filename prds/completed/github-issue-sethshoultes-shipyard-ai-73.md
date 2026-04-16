# PRD: Fix wrangler.jsonc: add worker_loaders binding for sandboxed plugins

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#73
> https://github.com/sethshoultes/shipyard-ai/issues/73

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #73
- **Author:** sethshoultes
- **Labels:** bug, p0
- **Created:** 2026-04-16T03:24:12Z

## Problem
## Problem

Sunrise Yoga's `wrangler.jsonc` is missing the `worker_loaders` binding required for sandboxed plugins on Cloudflare Workers. Per `docs/EMDASH-GUIDE.md` section 6:

> To enable sandboxing, configure `worker_loaders` in `wrangler.jsonc`:
> ```jsonc
> { "worker_loaders": [{ "binding": "LOADER" }] }
> ```

Without this, no sandboxed plugin will load in production.

## Fix

In `examples/sunrise-yoga/wrangler.jsonc`, add:

```jsonc
"worker_loaders": [{ "binding": "LOADER" }]
```

Current file for reference:
```jsonc
{
  "name": "sunrise-yoga",
  "compatibility_date": "2026-03-29",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [{"binding": "DB", "database_name": "sunrise-yoga", "database_id": "acbadfb7-90c8-4d26-8249-ed07c9da0998"}],
  "r2_buckets": [{"binding": "MEDIA", "bucket_name": "sunrise-yoga-media"}],
  "observability": {"enabled": true}
}
```

## Verify

After adding, rebuild and deploy:
```bash
cd examples/sunrise-yoga && source /home/agent/shipyard-ai/.env && export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID && npm run build && npx wrangler deploy
```

## Success Criteria

- [ ] `worker_loaders` present in wrangler.jsonc
- [ ] Build succeeds
- [ ] Committed

## Success Criteria
- Issue sethshoultes/shipyard-ai#73 requirements are met
- All tests pass
