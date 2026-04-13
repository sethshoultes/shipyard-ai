# Trace (AgentLog) — Atomic Requirements v1

**Document Purpose:** Master list of all v1 requirements extracted from PRD (agentlog.md) and decisions (decisions.md).

**Note:** Decisions.md OVERRIDES the PRD. Where conflicts exist, decisions take precedence.

**Product Name:** "Trace" (internal working name; legal review pending before public launch)

**Scope:** ~600 lines total across SDK, CLI, and Dashboard

---

## SDK Requirements

### REQ-SDK-001: Initialization
- **Description:** `trace.init(projectName: string)` initializes SDK with a single required argument
- **Signature:** `init(projectName: string): TraceInstance`
- **Returns:** TraceInstance object with span, tool, thought methods
- **Behavior:** Creates `.trace/sessions/` directory if it doesn't exist (relative to current working directory)
- **Error handling:** Throw error if projectName is empty string

### REQ-SDK-002: Span Wrapping
- **Description:** `trace.span(name: string, fn: () => Promise<T>): Promise<T>` wraps async operations with timing and error capture
- **Signature:** `span<T>(name: string, fn: () => Promise<T>): Promise<T>`
- **Behavior:**
  - Records start timestamp when fn begins execution
  - Records end timestamp and duration when fn completes
  - Captures errors and stack traces if fn throws
  - Returns result of fn unchanged
- **Scope:** Nestable (spans can contain other spans)

### REQ-SDK-003: Tool Logging
- **Description:** `trace.tool(name: string, input: any, output: any)` logs discrete tool invocations
- **Signature:** `tool(name: string, input: any, output: any): void`
- **Behavior:**
  - Timestamps at call time
  - Stores input and output as JSON
  - Does NOT wrap function execution (synchronous log)
- **Example:** `trace.tool('claude-chat', { input: 'Hello' }, { response: '...' })`

### REQ-SDK-004: Thought Logging
- **Description:** `trace.thought(content: string)` logs intermediate agent reasoning
- **Signature:** `thought(content: string): void`
- **Behavior:**
  - Timestamps at call time
  - Stores content as plain string
  - Used for narrative agent reasoning between tool calls
- **Example:** `trace.thought('Analyzing response: seems safe to proceed')`

### REQ-SDK-005: NDJSON Storage Format
- **Description:** SDK writes events to NDJSON (Newline Delimited JSON) files, NOT SQLite
- **File Location:** `.trace/sessions/{sessionId}.ndjson`
- **Format:** One JSON object per line, no array wrapping
- **Schema per line:**
  ```json
  {
    "id": "string (uuid)",
    "type": "span|tool|thought",
    "name": "string",
    "timestamp": "ISO8601 string",
    "duration": "number (ms, null for thought/tool)",
    "input": "any (tool/span only)",
    "output": "any (tool/span only)",
    "content": "string (thought only)",
    "error": "string (span only, if thrown)"
  }
  ```
- **Portability:** Files must be grep-able and human-readable (not binary)

### REQ-SDK-006: Session ID Management
- **Description:** Each execution session gets a unique session ID
- **Format:** To be decided by Elon (UUID vs Timestamp vs Human-readable)
- **File Naming:** `{sessionId}.ndjson`
- **Behavior:** One file per agent execution session

### REQ-SDK-007: No decision() Method in v1
- **Description:** The `decision()` method from PRD is CUT from v1
- **Rationale:** Developers won't adopt new habits during first use; core primitives (span, tool, thought) are sufficient
- **Workaround:** Users can use custom spans to capture decision points

### REQ-SDK-008: Zero External Dependencies
- **Description:** SDK must run with only Node.js built-ins (no npm dependencies for core writer)
- **Constraint:** No sqlite3, no external libraries for NDJSON writing
- **Implementation:** ~150-200 lines TypeScript

### REQ-SDK-009: Type Exports
- **Description:** TypeScript types are exported for all public methods
- **Files:** `src/index.ts` exports `TraceInstance`, event types, and initialization

---

## CLI Requirements

### REQ-CLI-001: Serve Command
- **Description:** `npx trace serve` launches local dashboard, reads NDJSON session files
- **Command:** `serve` with optional flags
- **Behavior:**
  - Scans `.trace/sessions/` directory for `.ndjson` files
  - Starts web server (default port 4040)
  - Opens browser automatically (if possible)
  - Watches for new session files and hot-reloads dashboard
- **Exit:** Ctrl+C to stop

### REQ-CLI-002: Default Port
- **Description:** Dashboard serves on http://localhost:4040 by default
- **Configurability:** Not required for v1

### REQ-CLI-003: Zero Config
- **Description:** CLI requires zero configuration files or environment variables
- **Behavior:** Works out-of-the-box with `npx trace serve`

### REQ-CLI-004: Session Directory Discovery
- **Description:** CLI automatically locates `.trace/sessions/` in current working directory
- **Fallback:** Error message if directory doesn't exist

### REQ-CLI-005: File Watching
- **Description:** CLI monitors `.trace/sessions/` for new/updated `.ndjson` files and hot-reloads frontend
- **Behavior:** No manual refresh required by user

### REQ-CLI-006: Implementation Scope
- **Lines of Code:** ~50 lines TypeScript
- **Framework:** Minimal—Node.js http module or simple express setup

---

## Dashboard Requirements

### REQ-DASH-001: Single Timeline View
- **Description:** Dashboard displays ONE timeline view—no tabs, no sidebar, no settings page
- **Philosophy:** "Timeline is the entire product"
- **Layout:** [OPEN] Clarify with Figma:
  - Option A: Horizontal scroll with vertical branches (tree view)
  - Option B: Vertical scroll with horizontal time axis
- **Owner:** Steve must provide wireframe before build

### REQ-DASH-002: Virtual Scrolling Mandatory
- **Description:** Dashboard implements virtual scrolling using `react-window` for 500+ spans
- **Library:** `react-window` (standard React virtualization)
- **Behavior:** Only renders visible rows (DOM nodes) to prevent slow rendering
- **Performance:** Supports sessions with 500+ events without lag

### REQ-DASH-003: Expand/Collapse Spans
- **Description:** Each span is expandable to show children and metadata
- **Behavior:**
  - Collapsed by default (shows span name + duration)
  - Click to expand (lazy-load child events)
  - Shows: name, start time, end time, duration (ms), input/output if span contains tool calls
- **Nesting:** Supports nested span hierarchy

### REQ-DASH-004: Error Highlighting
- **Description:** Spans that threw errors are highlighted in red/error color
- **Behavior:**
  - Visual glowing effect
  - Shows error message on hover or click
  - Error stack trace displayed in expanded view

### REQ-DASH-005: Instant Load
- **Description:** Dashboard loads and renders empty state in <1 second
- **Behavior:** Timeline appears immediately; sessions load asynchronously below
- **UX:** No loading spinner for initial page load

### REQ-DASH-006: Smooth Animations
- **Description:** Expand/collapse and virtual scroll transitions are smooth
- **Libraries:** React + CSS transitions (no heavy animation framework)

### REQ-DASH-007: Session Selection/List
- **Description:** Dashboard shows list of available sessions in `.trace/sessions/`
- **Behavior:**
  - Chronological order (newest first)
  - Click to view session timeline
  - Shows session ID and timestamp

### REQ-DASH-008: No In-Dashboard Search
- **Description:** Full-text search in dashboard is CUT from v1
- **Workaround:** Users use Ctrl+F browser search or grep on `.ndjson` files
- **Future:** Real search is v2 feature

### REQ-DASH-009: No Export to JSON
- **Description:** Export to JSON button is CUT from v1
- **Rationale:** Storage IS already NDJSON (portable, text format)
- **Workaround:** Copy `.ndjson` files directly or use grep

### REQ-DASH-010: Color Palette
- **Description:** Dashboard uses 3-color palette for background, foreground, accent
- **Status:** PENDING Steve's choice
- **Design Philosophy:** "confident and minimal" voice

### REQ-DASH-011: Implementation Scope
- **Lines of Code:** 300-400 lines React/TypeScript
- **Components:**
  - App.tsx: Main entry point
  - Timeline.tsx: Virtual scroll timeline (react-window)
  - Span.tsx: Expandable span component
  - styles.css: Minimal CSS
- **Framework:** Vite, React, TypeScript

### REQ-DASH-012: No Token Usage Display
- **Description:** Token usage tracking is CUT from v1
- **Rationale:** Derivable from Claude SDK response metadata; not core UX need
- **Future:** v2 feature if users request

### REQ-DASH-013: No Smart Error Messages
- **Description:** AI-generated error suggestions (e.g., "Consider caching") are CUT from v1
- **Rationale:** Requires ML/analysis; out of scope
- **Scope:** v1 shows raw error only

---

## Project Structure Requirements

### REQ-PROJ-001: Monorepo Layout
- **Structure:** Turborepo monorepo with 3 packages (sdk, cli, dashboard)
- **Root Files:**
  - `package.json` (monorepo root with workspaces)
  - `turbo.json` (Turborepo build orchestration)
  - `README.md` (20 lines + GIF, no "Console.log is dead" hook)
  - `.gitignore` (must exclude `.trace/`)

### REQ-PROJ-002: SDK Package
- **Location:** `packages/sdk/`
- **Exports:**
  - `src/index.ts` — main entry point, exports TraceInstance type and init function
  - `src/trace.ts` — core Trace class implementation
  - `src/span.ts` — Span implementation with start/end/error tracking
  - `src/writer.ts` — NDJSON file writer (~50 lines)
- **Files:**
  - `package.json` (main: dist/index.js)
  - `tsconfig.json` (strict mode)

### REQ-PROJ-003: CLI Package
- **Location:** `packages/cli/`
- **Entry:** `src/index.ts` (serves `npx trace serve` command)
- **Behavior:** Implements serve command, watches sessions directory, starts dev server
- **Files:**
  - `package.json` (bin: trace)
  - `tsconfig.json`

### REQ-PROJ-004: Dashboard Package
- **Location:** `packages/dashboard/`
- **Entry:** `src/App.tsx` (React root component)
- **Build:** Vite for dev server and production build
- **Files:**
  - `src/App.tsx` — main component
  - `src/Timeline.tsx` — virtual scroll timeline
  - `src/Span.tsx` — expandable span component
  - `src/styles.css` — minimal styling
  - `index.html` — static entry point
  - `package.json` (scripts: dev, build)
  - `vite.config.ts`

### REQ-PROJ-005: Local Data Directory
- **Location:** `.trace/sessions/`
- **Gitignore:** `.trace/` must be in `.gitignore`
- **Auto-Create:** SDK creates on first init() call
- **File Format:** `{sessionId}.ndjson`

### REQ-PROJ-006: Build Orchestration
- **Tool:** Turbo
- **Scripts:**
  - `build`: Builds all packages
  - `dev`: Runs dashboard + CLI in watch mode
  - `test`: Runs tests (if added)

### REQ-PROJ-007: README Specification
- **Length:** ~20 lines of text + 1 animated GIF
- **Hook:** "See what your AI agent is thinking"
- **Sections:**
  - Problem (one sentence)
  - Installation (npm install command)
  - Quick Start (5-line code example)
  - Usage (Run `npx trace serve`)
  - GIF (animated demo)
- **Distribution:** Optimized for GitHub stars and Twitter virality
- **Tone:** Confident and minimal

### REQ-PROJ-008: No Auto-Instrumentation in v1
- **Description:** Auto-instrumentation for @anthropic-ai/sdk is CUT from v1
- **Condition:** Only implement if < 30 minutes to build
- **Future:** v2 feature; users manually call trace.tool() for now

### REQ-PROJ-009: Windows Compatibility
- **Requirement:** Use `path.join()` everywhere for file paths (not hardcoded `/`)
- **Testing:** Should work on Windows without modification

### REQ-PROJ-010: No Session Auto-Pruning in v1
- **Description:** Auto-delete old sessions feature is optional
- **Flags:** `--max-sessions` or 30-day TTL not required for MVP
- **Future:** v2 feature

---

## Feature Cuts (Explicitly Out of v1)

### REQ-CUT-001: No Cloud Sync
- **Status:** REMOVED entirely from all documentation
- **Rationale:** Creates scope creep gravity; local-first philosophy
- **Future:** v2 feature when paying customers request it
- **Action:** Remove all cloud references from architecture diagrams and code

### REQ-CUT-002: No decision() Method
- **Original PRD:** Proposed `decision(options, chosen, reasoning)` method
- **Status:** CUT from v1
- **Workaround:** Use custom spans to capture decisions

### REQ-CUT-003: No Full-Text Search
- **Original PRD:** Dashboard search with filter/content matching
- **Status:** CUT from v1
- **Workaround:** Browser Ctrl+F or grep on `.ndjson` files
- **Note:** Real search is v2 feature when sessions grow to 50+ runs

### REQ-CUT-004: No Export to JSON
- **Original PRD:** "Export to JSON" button
- **Status:** CUT from v1
- **Rationale:** Storage IS already NDJSON (portable, text format)
- **Workaround:** Copy `.ndjson` files directly

### REQ-CUT-005: No Token Usage Tracking
- **Original PRD:** "Token usage and latency metrics" dashboard display
- **Status:** CUT from v1
- **Rationale:** Derivable from Claude SDK metadata; not core debugging need
- **Future:** v2 if users request

### REQ-CUT-006: No Smart Error Suggestions
- **Original PRD:** "Error highlighting" with "Consider caching" style messages
- **Status:** CUT from v1
- **Rationale:** Requires ML analysis; out of scope
- **Scope:** v1 shows raw error message only

### REQ-CUT-007: No LangChain Auto-Instrumentation
- **Original PRD:** Auto-instrumentation for LangChain
- **Status:** CUT from v1 (only conditional if <30 min to build)
- **Workaround:** Users manually call trace.tool() for LangChain steps

---

## Blocking Questions (Must Resolve Before Build)

| # | Question | Owner | Blocking |
|---|----------|-------|----------|
| 1 | **Timeline orientation**: Horizontal scroll + vertical branches (tree) OR vertical scroll + horizontal time axis? | Steve | YES |
| 2 | **Color palette**: Choose 3 colors (background, foreground, accent) | Steve | YES |
| 3 | **Session ID format**: UUID vs Timestamp vs Human-readable? | Elon | NO |
| 4 | **Auto-prune old sessions**: `--max-sessions` flag or 30-day TTL? | Elon | NO |

---

## Open Decisions

### Session ID Format
- **Default (if not specified):** UUID
- **Alternative:** ISO8601 timestamp for human-readable ordering
- **Store:** Track in filename as `{sessionId}.ndjson`

### Auto-Pruning Sessions
- **Option A:** No auto-prune; let filesystem grow
- **Option B:** `npx trace serve --max-sessions 50` (keeps newest 50)
- **Option C:** 30-day TTL (auto-delete sessions older than 30 days)
- **Decision needed before ship:** Elon to decide

---

## Non-Functional Requirements

### REQ-NFR-001: Performance
- **Dashboard load time:** < 1 second for empty state
- **Timeline render:** Smooth 60 FPS with 500+ events (via react-window)
- **Large session support:** 1000+ spans must render without lag

### REQ-NFR-002: Code Size
- **SDK:** ~150-200 lines TypeScript
- **CLI:** ~50 lines TypeScript
- **Dashboard:** ~300-400 lines React
- **Total:** ~600 lines

### REQ-NFR-003: Zero External Dependencies (SDK)
- **SDK:** Only Node.js built-ins (fs, path, crypto for UUID)
- **CLI:** Minimal (http module or simple server)
- **Dashboard:** React, react-window, Vite (standard frontend stack)

### REQ-NFR-004: Cross-Platform Support
- **Platforms:** Linux, macOS, Windows
- **Constraint:** Use `path.join()` for all file operations

### REQ-NFR-005: NDJSON Portability
- **Requirement:** Files must be grep-able, human-readable, transferable between machines
- **No binary formats:** Not SQLite, not protobuf

---

## Scope Lock

**This document is the contract.** If a feature is not listed here, it is NOT v1.

**Core v1 includes:**
- SDK: init, span, tool, thought (4 methods)
- CLI: serve command (1 command)
- Dashboard: single timeline + virtual scroll + expand/collapse + error highlighting
- Storage: NDJSON (one file per session)

**Everything else is v2.**

---

## Timeline Orientation (PENDING DECISION)

**UNRESOLVED:** Is the timeline view:
- **Option A:** Horizontal scroll axis (time from left to right) with vertical branches downward (tree-style nesting)?
- **Option B:** Vertical scroll axis (time from top to bottom) with horizontal span for metadata?

**Resolution:** Steve must provide Figma wireframe before build starts.

---

## Approval Status

- **PRD:** Approved by DREAM Board (Steve, Elon, Phil) — April 2026
- **Decisions:** Arbitrated by Phil Jackson — April 2026
- **Requirements Document:** Extracted from PRD + Decisions — This doc
- **Blocking Items:** Timeline wireframe (Steve) + Color palette (Steve)

---

*Generated: 2026-04-13*
*Source: prds/agentlog.md + rounds/agentlog/decisions.md*
*Build can begin when: Timeline orientation + color palette are locked*
