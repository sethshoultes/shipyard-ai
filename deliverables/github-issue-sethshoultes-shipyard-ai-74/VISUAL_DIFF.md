# Issue #74: Visual Before/After Code Comparison

## The Change

EventDash plugin entrypoint resolution changed from **npm alias** to **file path resolution**.

---

## BEFORE (Broken on Cloudflare Workers)

```typescript
import type { PluginDescriptor } from "emdash";
import { sandboxEntry } from '@repo/eventdash-entries'

export function eventdashPlugin(): PluginDescriptor {
  return {
    id: "eventdash",
    version: "1.0.0",
    format: "standard",
    entrypoint: "@repo/eventdash-entries", // ❌ npm alias - fails on Cloudflare Workers
    capabilities: ["email:send"],
    options: {},
    adminPages: [
      { path: "/events", label: "Events", icon: "calendar" },
      { path: "/create", label: "Create Event", icon: "plus" },
    ],
    adminWidgets: [
      { id: "upcoming-events", title: "Upcoming Events", size: "half" },
    ],
  };
}
```

**Problem:** The npm alias `@repo/eventdash-entries` works in local dev via `node_modules` but fails in Cloudflare Workers, which only has access to bundled code.

---

## AFTER (Works Everywhere)

```typescript
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { PluginDescriptor } from "emdash";

export function eventdashPlugin(): PluginDescriptor {
  // Resolve the actual file path to sandbox-entry relative to this file
  // This ensures the entrypoint works both in local dev and in Cloudflare Workers
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const entrypointPath = join(currentDir, "sandbox-entry.ts"); // ✅ Runtime file path

  return {
    id: "eventdash",
    version: "1.0.0",
    format: "standard",
    // NOTE: Use real file path instead of npm alias (@shipyard/eventdash/sandbox)
    // The alias works in local dev via node_modules but fails in Cloudflare Workers
    // which only has access to bundled code. Bundler resolves absolute paths correctly.
    entrypoint: entrypointPath, // ✅ Resolved at runtime to absolute path
    capabilities: ["email:send"],
    options: {},
    adminPages: [
      { path: "/events", label: "Events", icon: "calendar" },
      { path: "/create", label: "Create Event", icon: "plus" },
    ],
    adminWidgets: [
      { id: "upcoming-events", title: "Upcoming Events", size: "half" },
    ],
  };
}
```

**Solution:** Node.js standard library (`fileURLToPath`, `dirname`, `join`) resolves the file path at runtime. Bundlers convert relative paths to absolute paths that work in all environments.

---

## Key Difference

| Aspect | Before | After |
|--------|--------|-------|
| **Import method** | npm alias `@repo/eventdash-entries` | Node.js path resolution |
| **Dependencies** | Requires npm package structure | Node.js standard library only |
| **Works in local dev?** | ✅ Yes (via node_modules) | ✅ Yes |
| **Works in Cloudflare Workers?** | ❌ No (no node_modules) | ✅ Yes (bundler resolves paths) |
| **Pattern match** | Custom approach | Matches Membership plugin (proven) |

---

## Why This Matters

Cloudflare Workers don't have access to `node_modules` at runtime. The bundler includes only the actual code. npm aliases that work locally fail in production because the alias resolution depends on npm's package structure, which doesn't exist in the deployed bundle.

File path resolution works because:
1. `import.meta.url` gives the current file's location
2. `fileURLToPath()` converts it to a filesystem path
3. `dirname()` gets the directory
4. `join()` resolves the relative path
5. Bundler converts relative paths to absolute paths during build
6. Absolute paths work in all environments

This is the **standard pattern** for Emdash plugins. Membership plugin already used this approach successfully.
