# PRD: Fix EventDash entrypoint: use file path instead of npm alias

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#74
> https://github.com/sethshoultes/shipyard-ai/issues/74

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #74
- **Author:** sethshoultes
- **Labels:** bug, p0
- **Created:** 2026-04-16T03:24:22Z

## Problem
## Problem

EventDash plugin descriptor at `plugins/eventdash/src/index.ts` uses `entrypoint: "@shipyard/eventdash/sandbox"` — an npm-style package path. This resolves in local dev via `file:` dependency but **fails on Cloudflare Workers** because the plugin isn't published to npm and the bundler can't resolve it.

This is the same bug already fixed in the Membership plugin (which now uses a file path).

## Fix

In `plugins/eventdash/src/index.ts`, change the entrypoint from the npm alias to a resolved file path:

```typescript
// BEFORE (broken on Cloudflare)
entrypoint: "@shipyard/eventdash/sandbox",

// AFTER (works everywhere)
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const entrypointPath = join(currentDir, "sandbox-entry.ts");

// In the return:
entrypoint: entrypointPath,
```

Reference: Membership plugin's `index.ts` already has this exact pattern working.

## Also

Register EventDash in `examples/sunrise-yoga/astro.config.mjs`:

```typescript
import { eventdashPlugin } from "../../plugins/eventdash/src/index.js";

// In the plugins array:
plugins: [membershipPlugin(), eventdashPlugin()],
```

## Success Criteria

- [ ] EventDash entrypoint uses file path, not npm alias
- [ ] EventDash registered in Sunrise Yoga astro.config.mjs
- [ ] Build succeeds
- [ ] Committed

## Success Criteria
- Issue sethshoultes/shipyard-ai#74 requirements are met
- All tests pass
