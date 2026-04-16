---
hotfix: true
---
# PRD: Fix Plugin Entrypoints + Register All in Sunrise Yoga

> Priority: p0
> hotfix: true

## Problem

6 of 8 Emdash plugins are not registered in Sunrise Yoga and 4 have broken npm-alias entrypoints that won't resolve on Cloudflare Workers.

## Fix

### Step 1: Fix entrypoints in 4 plugins

These plugins use `entrypoint: "@shipyard/<name>/sandbox"` which fails on Cloudflare. Change to file path resolution (same pattern already working in membership and eventdash).

Fix each of these files:
- `plugins/commercekit/src/index.ts`
- `plugins/formforge/src/index.ts`
- `plugins/reviewpulse/src/index.ts`
- `plugins/seodash/src/index.ts`

For each, add these imports at the top:
```typescript
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
```

Then replace the entrypoint line:
```typescript
// BEFORE
entrypoint: "@shipyard/<name>/sandbox",

// AFTER
const currentDir = dirname(fileURLToPath(import.meta.url));
const entrypointPath = join(currentDir, "sandbox-entry.ts");
// ... in the return:
entrypoint: entrypointPath,
```

Reference: `plugins/membership/src/index.ts` has the working pattern.

### Step 2: Check adminpulse and forge

Check if `plugins/adminpulse/src/index.ts` and `plugins/forge/src/index.ts` exist and fix their entrypoints too if needed.

### Step 3: Register ALL plugins in astro.config

Edit `examples/sunrise-yoga/astro.config.mjs`:

```typescript
import { membershipPlugin } from "../../plugins/membership/src/index.js";
import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";
import { commercekitPlugin } from "../../plugins/commercekit/src/index.js";
import { formforgePlugin } from "../../plugins/formforge/src/index.js";
import { reviewpulsePlugin } from "../../plugins/reviewpulse/src/index.js";
import { seodashPlugin } from "../../plugins/seodash/src/index.js";
// Add adminpulse and forge if they exist

// In the plugins array:
plugins: [
  membershipPlugin(),
  eventdashPlugin(),
  commercekitPlugin(),
  formforgePlugin(),
  reviewpulsePlugin(),
  seodashPlugin(),
  // adminpulse and forge if they exist
],
```

Check the actual export function names by reading each index.ts — they may differ from what's shown above.

### Step 4: Verify build

```bash
cd examples/sunrise-yoga && npm run build 2>&1 | tail -5
```

Must complete without errors. If a plugin fails to build, remove it from the config and note which one failed.

## Files to Modify

- `plugins/commercekit/src/index.ts`
- `plugins/formforge/src/index.ts`
- `plugins/reviewpulse/src/index.ts`
- `plugins/seodash/src/index.ts`
- `plugins/adminpulse/src/index.ts` (if exists)
- `plugins/forge/src/index.ts` (if exists)
- `examples/sunrise-yoga/astro.config.mjs`

## Success Criteria

- [ ] All plugin entrypoints use file path, not npm alias
- [ ] All plugins registered in astro.config.mjs
- [ ] `npm run build` succeeds
- [ ] Committed and pushed
