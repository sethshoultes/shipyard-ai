# Phase 1 Plan — Trace (AgentLog) MVP

**Generated:** 2026-04-13
**Project Slug:** agentlog
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 12
**Waves:** 4

---

## The Essence

> **What is this product REALLY about?**
> Turning the invisible thinking of AI agents into a story you can see.

> **What's the feeling it should evoke?**
> The relief of finally understanding — "oh, *that's* why."

> **What's the one thing that must be perfect?**
> The timeline. One view. Instant. Beautiful. Nothing else.

> **Creative direction:**
> See your AI think.

---

## Blocking Dependencies

**BUILD CANNOT START** until these are resolved:

| Blocker | Owner | Status | Deadline |
|---------|-------|--------|----------|
| Timeline axis orientation (horizontal vs vertical) | Steve | PENDING | Before Wave 3 |
| Color palette (3 colors) | Steve | PENDING | Before Wave 3 |

**Note:** Waves 1-2 (SDK + CLI) can proceed without these decisions. Wave 3 (Dashboard) requires them.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-SDK-001: Initialization | phase-1-task-1 | 1 |
| REQ-SDK-002: Span Wrapping | phase-1-task-2 | 1 |
| REQ-SDK-003: Tool Logging | phase-1-task-2 | 1 |
| REQ-SDK-004: Thought Logging | phase-1-task-2 | 1 |
| REQ-SDK-005: NDJSON Storage | phase-1-task-3 | 1 |
| REQ-SDK-006: Session ID | phase-1-task-3 | 1 |
| REQ-SDK-008: Zero Dependencies | phase-1-task-1, phase-1-task-2, phase-1-task-3 | 1 |
| REQ-SDK-009: Type Exports | phase-1-task-4 | 1 |
| REQ-PROJ-001: Monorepo Layout | phase-1-task-1 | 1 |
| REQ-PROJ-002: SDK Package | phase-1-task-1, phase-1-task-2, phase-1-task-3, phase-1-task-4 | 1 |
| REQ-CLI-001: Serve Command | phase-1-task-5 | 2 |
| REQ-CLI-002: Default Port | phase-1-task-5 | 2 |
| REQ-CLI-003: Zero Config | phase-1-task-5 | 2 |
| REQ-CLI-004: Session Discovery | phase-1-task-5 | 2 |
| REQ-CLI-005: File Watching | phase-1-task-6 | 2 |
| REQ-PROJ-003: CLI Package | phase-1-task-5, phase-1-task-6 | 2 |
| REQ-DASH-001: Single Timeline | phase-1-task-7 | 3 |
| REQ-DASH-002: Virtual Scrolling | phase-1-task-8 | 3 |
| REQ-DASH-003: Expand/Collapse | phase-1-task-8 | 3 |
| REQ-DASH-004: Error Highlighting | phase-1-task-8 | 3 |
| REQ-DASH-005: Instant Load | phase-1-task-7 | 3 |
| REQ-DASH-007: Session List | phase-1-task-7 | 3 |
| REQ-DASH-010: Color Palette | phase-1-task-9 | 3 |
| REQ-PROJ-004: Dashboard Package | phase-1-task-7, phase-1-task-8, phase-1-task-9 | 3 |
| REQ-PROJ-007: README Spec | phase-1-task-10 | 4 |
| REQ-PROJ-006: Build Orchestration | phase-1-task-11 | 4 |
| REQ-NFR-001: Performance | phase-1-task-12 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — SDK Foundation

All 4 tasks in Wave 1 can run in parallel as they target different files within the SDK package.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>SDK initialization and project scaffold</title>
  <requirement>REQ-SDK-001, REQ-SDK-008, REQ-PROJ-001, REQ-PROJ-002</requirement>
  <description>
    Create the Turborepo monorepo structure with packages/sdk scaffold.
    Implement trace.init(projectName) that creates .trace/sessions/ directory.
    Zero external dependencies for SDK core.
  </description>

  <context>
    <file path="package.json" reason="Root monorepo config with workspaces" />
    <file path="turbo.json" reason="Turborepo build orchestration" />
    <file path="packages/sdk/package.json" reason="SDK package configuration" />
    <file path="packages/sdk/tsconfig.json" reason="TypeScript strict mode" />
    <file path="packages/sdk/src/index.ts" reason="Main entry point and exports" />
    <file path="packages/sdk/src/trace.ts" reason="Core Trace class with init method" />
    <file path=".planning/REQUIREMENTS.md" reason="REQ-SDK-001 signature specs" />
  </context>

  <steps>
    <step order="1">Create root package.json with workspaces: ["packages/*"] and type: module</step>
    <step order="2">Create turbo.json with pipeline for build, dev, test tasks</step>
    <step order="3">Create packages/sdk/package.json with name: "trace", main: "dist/index.js", types: "dist/index.d.ts"</step>
    <step order="4">Create packages/sdk/tsconfig.json with strict: true, target: ESNext, module: NodeNext</step>
    <step order="5">Create packages/sdk/src/trace.ts with Trace class containing init(projectName: string) method</step>
    <step order="6">In init(): validate projectName is non-empty, create .trace/sessions/ using fs.mkdirSync with recursive: true</step>
    <step order="7">Use path.join() for all paths (REQ-PROJ-009 Windows compatibility)</step>
    <step order="8">Return TraceInstance object with placeholder span, tool, thought methods</step>
    <step order="9">Create .gitignore at root with: node_modules/, dist/, .trace/</step>
  </steps>

  <verification>
    <check type="build">cd packages/sdk && npx tsc --noEmit</check>
    <check type="test">node -e "const t = require('./packages/sdk/dist').init('test'); console.log(t)"</check>
    <check type="manual">Verify .trace/sessions/ directory created after init() call</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(sdk): scaffold monorepo and implement trace.init()</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Implement span, tool, thought methods</title>
  <requirement>REQ-SDK-002, REQ-SDK-003, REQ-SDK-004</requirement>
  <description>
    Implement the three core tracing methods: span() for wrapping async operations,
    tool() for logging tool invocations, and thought() for agent reasoning.
    All methods generate events with timestamps and unique IDs.
  </description>

  <context>
    <file path="packages/sdk/src/trace.ts" reason="Extend Trace class with methods" />
    <file path="packages/sdk/src/span.ts" reason="Span implementation with start/end/error" />
    <file path=".planning/REQUIREMENTS.md" reason="Method signatures from REQ-SDK-002/003/004" />
  </context>

  <steps>
    <step order="1">Create packages/sdk/src/span.ts with Span class</step>
    <step order="2">Span constructor takes: id (uuid), name (string), parentId (optional)</step>
    <step order="3">Span methods: start() records startTime, end() records endTime and calculates duration, setError(error) captures error message and stack</step>
    <step order="4">In trace.ts, implement span&lt;T&gt;(name, fn): create Span, call fn, record result/error, return result</step>
    <step order="5">Support nested spans: track currentSpan context, child spans reference parentId</step>
    <step order="6">Implement tool(name, input, output): creates event with type: "tool", timestamp, input/output as JSON</step>
    <step order="7">Implement thought(content): creates event with type: "thought", timestamp, content as string</step>
    <step order="8">Generate UUIDs using crypto.randomUUID() (Node.js built-in, no deps)</step>
    <step order="9">All events queued to internal buffer for writing (writer handles persistence)</step>
  </steps>

  <verification>
    <check type="build">cd packages/sdk && npx tsc --noEmit</check>
    <check type="test">Write test: trace.span('test', async () => 42) should return 42</check>
    <check type="test">Write test: trace.span that throws should capture error</check>
    <check type="manual">Verify nested spans have correct parentId references</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies, can run parallel with task-1 -->
  </dependencies>

  <commit-message>feat(sdk): implement span(), tool(), thought() tracing methods</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>NDJSON writer implementation</title>
  <requirement>REQ-SDK-005, REQ-SDK-006, REQ-SDK-008</requirement>
  <description>
    Implement NDJSON file writer that persists trace events to .trace/sessions/{sessionId}.ndjson.
    One JSON object per line, no array wrapping. Human-readable and grep-able.
    Zero external dependencies - uses only Node.js fs module.
  </description>

  <context>
    <file path="packages/sdk/src/writer.ts" reason="NDJSON writer implementation" />
    <file path=".planning/REQUIREMENTS.md" reason="NDJSON schema from REQ-SDK-005" />
  </context>

  <steps>
    <step order="1">Create packages/sdk/src/writer.ts (~50 lines)</step>
    <step order="2">NDJSONWriter class with constructor(sessionId: string, baseDir: string)</step>
    <step order="3">Generate sessionId: use ISO8601 timestamp (YYYY-MM-DDTHH-mm-ss-sss) for human readability</step>
    <step order="4">File path: path.join(baseDir, '.trace', 'sessions', `${sessionId}.ndjson`)</step>
    <step order="5">write(event: TraceEvent): appends JSON.stringify(event) + '\n' to file</step>
    <step order="6">Use fs.appendFileSync for simplicity (sync writes prevent interleaving)</step>
    <step order="7">Event schema per line: { id, type, name, timestamp, duration, input, output, content, error, parentId }</step>
    <step order="8">flush() method: no-op for sync writes, exists for future async support</step>
    <step order="9">Ensure timestamp is ISO8601 string format</step>
    <step order="10">Add close() method for cleanup (currently no-op, future streaming support)</step>
  </steps>

  <verification>
    <check type="build">cd packages/sdk && npx tsc --noEmit</check>
    <check type="test">Write 3 events, verify .ndjson file has 3 lines</check>
    <check type="test">Each line should be valid JSON when parsed independently</check>
    <check type="manual">grep "tool" test.ndjson should find tool events</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(sdk): implement NDJSON writer for trace persistence</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>TypeScript types and index exports</title>
  <requirement>REQ-SDK-009, REQ-PROJ-002</requirement>
  <description>
    Define and export all public TypeScript types from packages/sdk/src/index.ts.
    Ensure type safety for all SDK methods and event structures.
  </description>

  <context>
    <file path="packages/sdk/src/index.ts" reason="Main entry point with type exports" />
    <file path="packages/sdk/src/types.ts" reason="Type definitions" />
    <file path=".planning/REQUIREMENTS.md" reason="Event schema from REQ-SDK-005" />
  </context>

  <steps>
    <step order="1">Create packages/sdk/src/types.ts with all type definitions</step>
    <step order="2">Define TraceInstance interface: { span, tool, thought } methods</step>
    <step order="3">Define TraceEvent union type: SpanEvent | ToolEvent | ThoughtEvent</step>
    <step order="4">Define SpanEvent: { id, type: 'span', name, timestamp, duration?, error?, parentId? }</step>
    <step order="5">Define ToolEvent: { id, type: 'tool', name, timestamp, input, output }</step>
    <step order="6">Define ThoughtEvent: { id, type: 'thought', timestamp, content }</step>
    <step order="7">Define InitOptions interface (currently just projectName, extensible)</step>
    <step order="8">In index.ts: export { init } from './trace'; export type { TraceInstance, TraceEvent, ... } from './types'</step>
    <step order="9">Ensure package.json has "types": "dist/index.d.ts"</step>
  </steps>

  <verification>
    <check type="build">cd packages/sdk && npx tsc</check>
    <check type="test">Import types in test file, verify no TS errors</check>
    <check type="manual">dist/index.d.ts contains all exported types</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(sdk): add TypeScript type definitions and exports</commit-message>
</task-plan>
```

---

### Wave 2 (After Wave 1) — CLI Implementation

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>CLI serve command</title>
  <requirement>REQ-CLI-001, REQ-CLI-002, REQ-CLI-003, REQ-CLI-004, REQ-PROJ-003</requirement>
  <description>
    Create packages/cli with `npx trace serve` command.
    Scans .trace/sessions/ for NDJSON files, starts HTTP server on port 4040,
    serves the dashboard static files.
  </description>

  <context>
    <file path="packages/cli/package.json" reason="CLI package config with bin entry" />
    <file path="packages/cli/src/index.ts" reason="CLI entry point" />
    <file path=".planning/REQUIREMENTS.md" reason="CLI requirements REQ-CLI-001 through REQ-CLI-004" />
  </context>

  <steps>
    <step order="1">Create packages/cli/package.json with name: "trace", bin: { "trace": "./dist/index.js" }</step>
    <step order="2">Add shebang to src/index.ts: #!/usr/bin/env node</step>
    <step order="3">Parse argv for "serve" subcommand (only command for v1)</step>
    <step order="4">Validate .trace/sessions/ exists in cwd, error if not found</step>
    <step order="5">Scan directory for *.ndjson files, build session index</step>
    <step order="6">Create HTTP server using Node.js http module (zero deps)</step>
    <step order="7">Serve static dashboard files from packages/dashboard/dist</step>
    <step order="8">API endpoint: GET /api/sessions returns list of session files</step>
    <step order="9">API endpoint: GET /api/sessions/:id returns parsed NDJSON as JSON array</step>
    <step order="10">Start server on port 4040, log URL to console</step>
    <step order="11">Attempt to open browser using child_process.exec('open' or 'xdg-open')</step>
  </steps>

  <verification>
    <check type="build">cd packages/cli && npx tsc --noEmit</check>
    <check type="test">Create test .ndjson file, run serve, curl localhost:4040/api/sessions</check>
    <check type="manual">Browser opens to dashboard (or URL printed if open fails)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="CLI reads NDJSON files written by SDK" />
    <depends-on task-id="phase-1-task-4" reason="CLI uses SDK type definitions for parsing" />
  </dependencies>

  <commit-message>feat(cli): implement trace serve command with HTTP server</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>File watching and hot reload</title>
  <requirement>REQ-CLI-005</requirement>
  <description>
    Add file watching to CLI so dashboard auto-updates when new sessions appear
    or existing sessions are modified. Uses Node.js fs.watch (zero deps).
  </description>

  <context>
    <file path="packages/cli/src/index.ts" reason="Add file watching logic" />
    <file path="packages/cli/src/watcher.ts" reason="File watcher implementation" />
  </context>

  <steps>
    <step order="1">Create packages/cli/src/watcher.ts with SessionWatcher class</step>
    <step order="2">Use fs.watch(sessionsDir, { recursive: false }) to monitor .trace/sessions/</step>
    <step order="3">On file change/add: emit event with session ID</step>
    <step order="4">Debounce events (100ms) to prevent rapid-fire updates</step>
    <step order="5">Add Server-Sent Events (SSE) endpoint: GET /api/events</step>
    <step order="6">SSE pushes session update notifications to connected clients</step>
    <step order="7">Dashboard will connect to SSE and refresh data on events</step>
    <step order="8">Handle watcher cleanup on server shutdown (SIGINT/SIGTERM)</step>
  </steps>

  <verification>
    <check type="build">cd packages/cli && npx tsc --noEmit</check>
    <check type="test">Start server, create new .ndjson file, verify SSE event sent</check>
    <check type="manual">Dashboard refreshes without manual page reload</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Watcher extends existing CLI server" />
  </dependencies>

  <commit-message>feat(cli): add file watching and SSE for hot reload</commit-message>
</task-plan>
```

---

### Wave 3 (After Wave 2) — Dashboard Implementation

**BLOCKER:** Tasks 7-9 require Steve's timeline orientation and color palette decisions.

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Dashboard scaffold and session list</title>
  <requirement>REQ-DASH-001, REQ-DASH-005, REQ-DASH-007, REQ-PROJ-004</requirement>
  <description>
    Create packages/dashboard with Vite + React + TypeScript.
    Implement session list view and single timeline shell.
    Dashboard loads instantly with empty state.
  </description>

  <context>
    <file path="packages/dashboard/package.json" reason="Dashboard package config" />
    <file path="packages/dashboard/vite.config.ts" reason="Vite configuration" />
    <file path="packages/dashboard/src/App.tsx" reason="Main React component" />
    <file path="packages/dashboard/index.html" reason="HTML entry point" />
    <file path=".planning/REQUIREMENTS.md" reason="Dashboard requirements" />
  </context>

  <steps>
    <step order="1">Create packages/dashboard/package.json with dependencies: react, react-dom, react-window</step>
    <step order="2">Add devDependencies: vite, @vitejs/plugin-react, typescript, @types/react</step>
    <step order="3">Create vite.config.ts with react() plugin</step>
    <step order="4">Create index.html with root div and script src="./src/main.tsx"</step>
    <step order="5">Create src/main.tsx with ReactDOM.createRoot render</step>
    <step order="6">Create src/App.tsx with session list component</step>
    <step order="7">Fetch sessions from /api/sessions on mount</step>
    <step order="8">Display session list: session ID + timestamp, sorted newest first</step>
    <step order="9">Click session to view timeline (loads session data)</step>
    <step order="10">Show empty state ("No sessions yet. Run your agent to see traces.")</step>
    <step order="11">Add SSE connection to /api/events for hot reload</step>
  </steps>

  <verification>
    <check type="build">cd packages/dashboard && npm run build</check>
    <check type="test">npm run dev, verify app loads in browser</check>
    <check type="manual">Session list displays correctly, empty state works</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Dashboard needs CLI server to fetch data" />
    <depends-on task-id="phase-1-task-6" reason="Dashboard uses SSE for hot reload" />
  </dependencies>

  <commit-message>feat(dashboard): scaffold React app with session list view</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Timeline with virtual scrolling and expand/collapse</title>
  <requirement>REQ-DASH-002, REQ-DASH-003, REQ-DASH-004</requirement>
  <description>
    Implement Timeline.tsx using react-window for virtual scrolling.
    Each span is expandable to show children and metadata.
    Error states glow red with error message on expand.
    CRITICAL: Check Steve's wireframe for axis orientation before implementing.
  </description>

  <context>
    <file path="packages/dashboard/src/Timeline.tsx" reason="Main timeline component" />
    <file path="packages/dashboard/src/Span.tsx" reason="Individual span component" />
    <file path=".planning/REQUIREMENTS.md" reason="REQ-DASH-002, REQ-DASH-003, REQ-DASH-004" />
  </context>

  <steps>
    <step order="1">**BLOCKER CHECK**: Confirm timeline orientation from Steve (horizontal vs vertical)</step>
    <step order="2">Create src/Timeline.tsx with react-window VariableSizeList</step>
    <step order="3">If vertical: use VariableSizeList with vertical scroll</step>
    <step order="4">If horizontal: use FixedSizeList with horizontal scroll + vertical branches</step>
    <step order="5">Create src/Span.tsx for individual span rendering</step>
    <step order="6">Span collapsed state: shows name + duration badge</step>
    <step order="7">Span expanded state: shows input, output, nested children</step>
    <step order="8">Track expanded/collapsed state in React state (Set of expanded IDs)</step>
    <step order="9">Error highlighting: red glow CSS, error message in expanded view</step>
    <step order="10">Lazy-load children only when parent expanded (performance)</step>
    <step order="11">itemSize function returns different heights for collapsed vs expanded</step>
    <step order="12">Use resetAfterIndex when expansion state changes</step>
  </steps>

  <verification>
    <check type="build">cd packages/dashboard && npm run build</check>
    <check type="test">Load session with 100+ spans, verify smooth scrolling</check>
    <check type="test">Expand/collapse span, verify children render correctly</check>
    <check type="manual">Error spans have red glow, error message visible</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Timeline integrates into App.tsx shell" />
  </dependencies>

  <commit-message>feat(dashboard): implement virtual scrolling timeline with expand/collapse</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Apply color palette and styling</title>
  <requirement>REQ-DASH-010, REQ-DASH-006</requirement>
  <description>
    Apply Steve's chosen color palette (3 colors: background, foreground, accent).
    Implement smooth CSS transitions for expand/collapse animations.
    Design philosophy: "confident and minimal".
  </description>

  <context>
    <file path="packages/dashboard/src/styles.css" reason="Main stylesheet" />
    <file path="packages/dashboard/src/App.tsx" reason="Apply CSS classes" />
    <file path=".planning/REQUIREMENTS.md" reason="REQ-DASH-010 color palette" />
  </context>

  <steps>
    <step order="1">**BLOCKER CHECK**: Get 3 colors from Steve (background, foreground, accent)</step>
    <step order="2">Create src/styles.css with CSS custom properties: --bg, --fg, --accent</step>
    <step order="3">Apply colors to body, text, links, buttons</step>
    <step order="4">Error state: use red variant of accent color for glow</step>
    <step order="5">Add smooth transitions: expand/collapse uses height transition 150ms ease</step>
    <step order="6">Virtual scroll: ensure no jank on rapid scrolling (60 FPS target)</step>
    <step order="7">Typography: use system font stack for fast load</step>
    <step order="8">Spacing: consistent 8px grid system</step>
    <step order="9">Mobile responsive: works on screens >= 320px</step>
    <step order="10">Import styles.css in main.tsx</step>
  </steps>

  <verification>
    <check type="build">cd packages/dashboard && npm run build</check>
    <check type="manual">Colors match Steve's palette specification</check>
    <check type="manual">Expand/collapse animation is smooth (no jank)</check>
    <check type="manual">Error spans have red glow effect</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Styling applies to timeline components" />
  </dependencies>

  <commit-message>feat(dashboard): apply color palette and smooth animations</commit-message>
</task-plan>
```

---

### Wave 4 (After Wave 3) — Integration and Polish

```xml
<task-plan id="phase-1-task-10" wave="4">
  <title>README with GIF and quick start</title>
  <requirement>REQ-PROJ-007</requirement>
  <description>
    Create README.md optimized for GitHub stars and Twitter virality.
    ~20 lines + 1 animated GIF demo. Hook: "See what your AI agent is thinking."
  </description>

  <context>
    <file path="README.md" reason="Repository README" />
    <file path=".planning/REQUIREMENTS.md" reason="REQ-PROJ-007 README spec" />
    <file path="rounds/agentlog/decisions.md" reason="Distribution strategy from Elon" />
  </context>

  <steps>
    <step order="1">Record demo GIF: agent running with Trace, show timeline visualization</step>
    <step order="2">Use screen recording tool, crop to timeline area, export as GIF</step>
    <step order="3">Host GIF (GitHub assets or external like giphy)</step>
    <step order="4">Write README structure:
      - One-liner: "See what your AI agent is thinking."
      - Problem (one sentence: "Debugging AI agents is hard.")
      - GIF (animated demo)
      - Installation: npm install trace
      - Quick Start: 5-line code example with span, tool, thought
      - View: npx trace serve
    </step>
    <step order="5">Keep total README ~20 lines of text</step>
    <step order="6">Tone: confident, minimal, no fluff</step>
    <step order="7">Add badges: npm version, license, build status (if CI set up)</step>
  </steps>

  <verification>
    <check type="manual">README renders correctly on GitHub</check>
    <check type="manual">GIF loads and animates</check>
    <check type="manual">Quick start code example is copy-pasteable</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Need working dashboard for GIF recording" />
  </dependencies>

  <commit-message>docs: add README with demo GIF and quick start guide</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="4">
  <title>Turborepo build orchestration</title>
  <requirement>REQ-PROJ-006</requirement>
  <description>
    Configure Turborepo for cross-package builds.
    Ensure npm run build at root builds SDK -> CLI -> Dashboard in correct order.
    Add dev script for watch mode development.
  </description>

  <context>
    <file path="turbo.json" reason="Turborepo configuration" />
    <file path="package.json" reason="Root scripts" />
  </context>

  <steps>
    <step order="1">Update turbo.json with pipeline configuration</step>
    <step order="2">Define build task: depends on ^build (build dependencies first)</step>
    <step order="3">Define dev task: persistent: true, cache: false</step>
    <step order="4">Define test task: depends on build</step>
    <step order="5">Add to root package.json scripts: build, dev, test</step>
    <step order="6">Configure outputs in turbo.json: ["dist/**"]</step>
    <step order="7">Test: npm run build from root builds all packages</step>
    <step order="8">Test: npm run dev from root starts all packages in watch mode</step>
    <step order="9">Ensure CLI builds after dashboard (it serves dashboard dist files)</step>
  </steps>

  <verification>
    <check type="build">npm run build at root succeeds</check>
    <check type="test">Verify packages/*/dist/ directories exist</check>
    <check type="test">npm run dev starts all watchers</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="CLI package must exist" />
    <depends-on task-id="phase-1-task-9" reason="Dashboard package must exist" />
  </dependencies>

  <commit-message>build: configure Turborepo for monorepo orchestration</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Performance verification (500+ spans)</title>
  <requirement>REQ-NFR-001</requirement>
  <description>
    Generate test session with 500+ spans.
    Verify dashboard loads in &lt;1 second, scrolls at 60 FPS.
    This is the success criterion for virtual scrolling requirement.
  </description>

  <context>
    <file path="scripts/generate-test-session.ts" reason="Test data generator" />
    <file path="packages/dashboard/src/Timeline.tsx" reason="May need optimization" />
    <file path=".planning/REQUIREMENTS.md" reason="REQ-NFR-001 performance targets" />
  </context>

  <steps>
    <step order="1">Create scripts/generate-test-session.ts</step>
    <step order="2">Generate NDJSON file with 500+ span events (mixed types)</step>
    <step order="3">Include nested spans (3-4 levels deep)</step>
    <step order="4">Include some error events for testing error highlighting</step>
    <step order="5">Run npx trace serve with generated session</step>
    <step order="6">Measure initial page load time (target: &lt;1 second)</step>
    <step order="7">Open Chrome DevTools Performance panel</step>
    <step order="8">Scroll through timeline, verify 60 FPS (no dropped frames)</step>
    <step order="9">If performance issues: check itemSize calculations, reduce re-renders</step>
    <step order="10">Document performance results in PR description</step>
  </steps>

  <verification>
    <check type="test">Page loads in &lt;1 second with 500 spans</check>
    <check type="test">Chrome DevTools shows consistent 60 FPS while scrolling</check>
    <check type="test">Expand/collapse large spans does not cause jank</check>
    <check type="manual">Test with 1000 spans to verify scalability</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Timeline must be implemented" />
    <depends-on task-id="phase-1-task-11" reason="Build pipeline must work" />
  </dependencies>

  <commit-message>test: add performance verification for 500+ span sessions</commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **BLOCKER: Timeline orientation undefined** — Steve must provide Figma wireframe before Wave 3 can begin. Waves 1-2 are unblocked.

2. **BLOCKER: Color palette undefined** — Steve must select 3 colors before Wave 3 task 9 can complete.

3. **RISK: react-window learning curve** — Low likelihood, well-documented library. Mitigation: allocate 1-2 hours for familiarization, have fallback of non-virtualized timeline if needed.

4. **RISK: NDJSON file bloat** — Low likelihood for v1 (typical sessions ~100-500 events). Mitigation: document `--max-sessions` as future enhancement.

5. **RISK: Windows file path compatibility** — Low likelihood. Mitigation: use path.join() everywhere, test on Windows before npm publish.

6. **RISK: Scope creep (search, token tracking)** — Medium likelihood. Mitigation: decisions.md is the contract. If it's not listed, it's v2.

7. **RISK: Trademark conflict on "Trace"** — Medium likelihood. Mitigation: use "Trace" internally, legal review before public launch, fallback names ready (Glint, Span).

---

## Summary

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 (Parallel) | 4 tasks | SDK: init, span/tool/thought, NDJSON writer, types |
| Wave 2 (Sequential) | 2 tasks | CLI: serve command, file watching |
| Wave 3 (Sequential) | 3 tasks | Dashboard: scaffold, timeline, styling |
| Wave 4 (Parallel) | 3 tasks | Polish: README, build config, performance test |
| **Total** | **12 tasks** | |

**Critical Path:** Wave 1 -> Wave 2 -> Wave 3 -> Wave 4

**Parallelization:**
- Wave 1: All 4 tasks can run in parallel
- Wave 4: Tasks 10-12 can mostly run in parallel

**Blockers:**
- Wave 3 blocked on Steve's timeline orientation + color palette decisions
- Waves 1-2 can proceed immediately

---

## Philosophy Lock

From `rounds/agentlog/decisions.md`:

> **Ship Elon's architecture** (NDJSON, cut decision(), virtual scrolling)
> **With Steve's soul** (single perfect timeline, instant load, "confident and minimal" voice)

This is not compromise. This is integration.

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2026-04-13*
