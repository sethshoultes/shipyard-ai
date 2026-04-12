# AgentBench CLI Output Schema

## Schema Version: 1.0 (LOCKED)

**Status:** LOCKED
**Effective Date:** 2026-04-12
**Schema Location:** `packages/cli/src/output/result.schema.json`

---

## Overview

This document defines the JSON output schema for AgentBench CLI benchmark results. The schema provides a standardized format for machine-readable benchmark output, enabling integration with downstream tools, CI/CD pipelines, and reporting systems.

## Version Information

| Property | Value |
|----------|-------|
| Schema Version | 1.0 |
| Status | LOCKED |
| JSON Schema Draft | draft-07 |
| Schema ID | `https://agentbench.dev/schemas/cli-output/v1.0/result.schema.json` |

---

## Schema Structure

### Root Object

The CLI output is a JSON object with four required top-level properties:

```json
{
  "meta": { ... },
  "run": { ... },
  "benchmarks": [ ... ],
  "summary": { ... }
}
```

### 1. Meta Object

Metadata about the CLI output and execution environment.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | string | Yes | Output schema version (currently "1.0") |
| `timestamp` | string | Yes | ISO 8601 timestamp when result was generated |
| `cli_version` | string | Yes | AgentBench CLI version (semver format) |

**Example:**
```json
{
  "meta": {
    "schema_version": "1.0",
    "timestamp": "2026-04-12T14:30:00.000Z",
    "cli_version": "1.0.0"
  }
}
```

### 2. Run Object

Information about the benchmark run execution.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for this run |
| `suite` | string | Yes | Name of benchmark suite executed |
| `agent` | string | Yes | Identifier of agent being benchmarked |
| `duration` | number | Yes | Total execution duration in milliseconds |
| `status` | enum | Yes | Run status (see below) |

**Status Values:**
- `completed` - All benchmarks finished successfully
- `failed` - Run encountered a fatal error
- `partial` - Some benchmarks completed, others failed
- `timeout` - Run exceeded time limit
- `cancelled` - Run was manually cancelled

**Example:**
```json
{
  "run": {
    "id": "run-2026-04-12-abc123",
    "suite": "core-capabilities",
    "agent": "claude-3-opus",
    "duration": 45230,
    "status": "completed"
  }
}
```

### 3. Benchmarks Array

Array of individual benchmark results.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique benchmark identifier |
| `name` | string | Yes | Human-readable benchmark name |
| `score` | number | Yes | Normalized score (0-100) |
| `passed` | boolean | Yes | Whether benchmark met passing criteria |
| `details` | object | Yes | Additional benchmark-specific details |

**Details Object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `duration_ms` | number | No | Individual benchmark duration |
| `error` | string\|null | No | Error message if failed |
| `attempts` | integer | No | Number of attempts made |
| `metrics` | object | No | Custom metrics |

**Example:**
```json
{
  "benchmarks": [
    {
      "id": "code-generation-01",
      "name": "Code Generation: Python Functions",
      "score": 87.5,
      "passed": true,
      "details": {
        "duration_ms": 12340,
        "attempts": 1,
        "metrics": {
          "tokens_generated": 245,
          "syntax_errors": 0
        }
      }
    }
  ]
}
```

### 4. Summary Object

Aggregated summary of all benchmark results.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `total` | integer | Yes | Total benchmarks executed |
| `passed` | integer | Yes | Number of passing benchmarks |
| `failed` | integer | Yes | Number of failing benchmarks |
| `score` | number | Yes | Overall aggregate score (0-100) |

**Invariant:** `passed + failed` MUST equal `total`

**Example:**
```json
{
  "summary": {
    "total": 10,
    "passed": 8,
    "failed": 2,
    "score": 82.5
  }
}
```

---

## Complete Example

```json
{
  "meta": {
    "schema_version": "1.0",
    "timestamp": "2026-04-12T14:30:00.000Z",
    "cli_version": "1.0.0"
  },
  "run": {
    "id": "run-2026-04-12-abc123",
    "suite": "core-capabilities",
    "agent": "claude-3-opus",
    "duration": 45230,
    "status": "completed"
  },
  "benchmarks": [
    {
      "id": "code-gen-python",
      "name": "Code Generation: Python",
      "score": 92.0,
      "passed": true,
      "details": {
        "duration_ms": 8500,
        "attempts": 1
      }
    },
    {
      "id": "reasoning-logic",
      "name": "Logical Reasoning",
      "score": 78.5,
      "passed": true,
      "details": {
        "duration_ms": 12300,
        "attempts": 2
      }
    }
  ],
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "score": 85.25
  }
}
```

---

## Versioning Policy

### Semantic Versioning

The CLI output schema follows semantic versioning (SemVer):

- **MAJOR** (X.0): Breaking changes to existing fields
- **MINOR** (1.X): New optional fields, additive changes only
- **Note:** Patch versions are not used for schema versions

### Version 1.0 Lock Policy

**Version 1.0 is LOCKED effective 2026-04-12.**

This means:

1. **No breaking changes** will be made to v1.0 schema fields
2. **Existing field types** will not change
3. **Required fields** will not be removed or made optional
4. **Enum values** will not be removed (only added in minor versions)

### Breaking Change Definition

The following are considered **breaking changes** and require a major version bump:

- Removing a required field
- Changing a field's type
- Renaming a field
- Changing a field from optional to required
- Removing an enum value
- Changing validation constraints to be more restrictive
- Changing the structure of nested objects

### Non-Breaking Changes (Minor Version)

The following changes are permitted in minor versions:

- Adding new optional fields
- Adding new enum values
- Relaxing validation constraints
- Adding new optional nested properties
- Improving descriptions and documentation

### Deprecation Process

To deprecate a field:

1. Mark field as deprecated in schema description
2. Announce deprecation with at least 2 minor versions warning
3. Field removal only in next major version
4. Provide migration guide before major version release

---

## Downstream Tool Guidelines

### For Tool Authors

When consuming AgentBench CLI output:

1. **Always check `meta.schema_version`** before parsing
2. **Ignore unknown fields** - new fields may be added in minor versions
3. **Handle all enum values** including future additions gracefully
4. **Validate against the schema** using the provided JSON Schema

### Version Compatibility

```typescript
// Recommended version checking
if (result.meta.schema_version.startsWith('1.')) {
  // Compatible with all 1.x versions
  processV1Result(result);
} else {
  throw new Error(`Unsupported schema version: ${result.meta.schema_version}`);
}
```

### TypeScript Integration

Import types from the AgentBench CLI package:

```typescript
import type { CLIOutputResult } from '@agentbench/cli/output/types';
import { validateCLIOutputResult } from '@agentbench/cli/output/validation';

const result = validateCLIOutputResult(jsonData);
if (result.success) {
  // result.data is typed as CLIOutputResult
  console.log(result.data.summary.score);
}
```

---

## Risk Mitigation (RISK-009)

This schema addresses **RISK-009: Output format lock-in breaks downstream tools**.

Mitigations implemented:

1. **Schema versioning** - All output includes schema version for compatibility checking
2. **Version lock policy** - Clear rules prevent breaking existing integrations
3. **Deprecation process** - Ample warning before removing features
4. **JSON Schema validation** - Machine-readable schema for automated validation
5. **TypeScript types** - Compile-time type safety for TypeScript consumers
6. **Zod validation** - Runtime validation with detailed error messages

---

## Files Reference

| File | Purpose |
|------|---------|
| `packages/cli/src/output/result.schema.json` | JSON Schema definition |
| `packages/cli/src/output/types.ts` | TypeScript type definitions |
| `packages/cli/src/output/validation.ts` | Zod validation schemas |
| `docs/cli-output-schema.md` | This documentation |

---

## Changelog

### Version 1.0 (2026-04-12) - LOCKED

- Initial schema release
- Defined core structure: meta, run, benchmarks, summary
- Established versioning policy
- Schema locked for stability
