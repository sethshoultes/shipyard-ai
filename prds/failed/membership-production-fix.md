# PRD: Fix MemberShip Plugin Registration — Not Loading in Production

> Priority: p0

## Problem

The MemberShip plugin is registered in `examples/sunrise-yoga/astro.config.mjs` and the site builds + deploys successfully. But the plugin is NOT showing in the Emdash manifest at production:

```bash
curl -s https://yoga.shipyard.company/_emdash/api/manifest | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('plugins',[]))"
# Returns: []
```

Plugin routes return errors:
- `/plugins/membership/admin` → `{"error":{"code":"UNAUTHORIZED","message":"Authentication required"}}`
- `/plugins/membership/register` → `{"error":{"code":"INTERNAL_ERROR","message":"Plugin route error"}}`

The frontend (200) and admin auth redirect (302) work fine — the Emdash core is running correctly. Only the plugin isn't loading.

## CRITICAL: Read the Docs First

Before touching any code, read `docs/EMDASH-GUIDE.md` section 6 "Plugin System". Specifically:
- How plugin descriptors work (build-time vs runtime)
- The `entrypoint` field — what it resolves to
- How sandboxed plugins are bundled and loaded
- The difference between `trusted` and `sandboxed` execution

Also check how OTHER working plugins are registered. Look at examples from other Shipyard sites:
```bash
cat examples/bellas-bistro/astro.config.mjs
cat examples/peak-dental/astro.config.mjs
```

Compare their plugin registration pattern with Sunrise Yoga's.

## Current Registration

In `examples/sunrise-yoga/astro.config.mjs`:
```typescript
import { membershipPlugin } from "../../plugins/membership/src/index.js";

export default defineConfig({
  integrations: [
    emdash({
      plugins: [membershipPlugin()],
    }),
  ],
});
```

The descriptor in `plugins/membership/src/index.ts`:
```typescript
export function membershipPlugin(): PluginDescriptor {
  return {
    id: "membership",
    version: "1.0.0",
    format: "standard",
    entrypoint: "@shipyard/membership/sandbox",
    capabilities: ["email:send"],
    // ...
  };
}
```

## Likely Issues

1. **Entrypoint `@shipyard/membership/sandbox` can't be resolved** — this is an npm package path but the plugin isn't published to npm. The entrypoint needs to resolve to the actual `sandbox-entry.ts` file at build time.

2. **Plugin format/registration mismatch** — the descriptor may be using the wrong format or missing required fields for the Cloudflare sandboxed deployment.

3. **Missing `worker_loaders` binding** — per EMDASH-GUIDE.md, sandboxed plugins on Cloudflare need `worker_loaders` configured in `wrangler.jsonc`.

## Requirements

1. **Read EMDASH-GUIDE.md section 6** — understand the correct plugin registration pattern for Cloudflare deployments
2. **Compare with working plugin registrations** on other Shipyard sites
3. **Fix the entrypoint** — make it resolve to the actual sandbox-entry.ts file
4. **Fix wrangler.jsonc** if `worker_loaders` or other bindings are needed
5. **Fix the descriptor** if format/fields are wrong
6. **Rebuild and redeploy**: `npm run build && npx wrangler deploy` (token is in `/home/agent/shipyard-ai/.env`, source it first)
7. **Verify**: `curl -s https://yoga.shipyard.company/_emdash/api/manifest` should show the membership plugin in the plugins array

## Deploy Command

```bash
cd /home/agent/shipyard-ai/examples/sunrise-yoga
source /home/agent/shipyard-ai/.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npm run build && npx wrangler deploy
```

## Smoke Test After Deploy

```bash
# Plugin in manifest
curl -s https://yoga.shipyard.company/_emdash/api/manifest | python3 -c "import json,sys; d=json.load(sys.stdin); print([p.get('id') for p in d.get('plugins',[])])"
# Expected: ["membership"]

# Admin page loads (with auth token)
curl -s https://yoga.shipyard.company/_emdash/api/plugins/membership/admin \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}'
# Expected: JSON with blocks array (or auth error if no token — that's fine, means plugin is loaded)
```

## Success Criteria

- [ ] Membership plugin appears in manifest
- [ ] Plugin routes are accessible (even if auth-gated)
- [ ] No `INTERNAL_ERROR` on plugin route calls
- [ ] Deployed to production at yoga.shipyard.company
- [ ] Committed and pushed

## Files to Potentially Modify

- `plugins/membership/src/index.ts` — fix entrypoint path
- `examples/sunrise-yoga/astro.config.mjs` — fix import/registration if needed
- `examples/sunrise-yoga/wrangler.jsonc` — add worker_loaders if needed
- `examples/sunrise-yoga/package.json` — add local dependency if needed

## Notes

Do NOT rewrite the plugin. The sandbox-entry.ts is clean (0 violations). This is purely a build-time registration and bundling issue. Read the docs, find the correct pattern, apply it.
