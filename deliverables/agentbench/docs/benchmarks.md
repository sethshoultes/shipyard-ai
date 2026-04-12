# AgentBench Benchmark Schema Documentation

## Schema Status

> **LOCKED** - Schema Version 1.0
>
> This schema is **LOCKED** as of version 1.0. No breaking changes will be made without incrementing the major version number. This ensures backward compatibility for all user-created benchmarks.
>
> See [RISK-011](../../../.planning/REQUIREMENTS.md): Schema changes post-MVP break user benchmarks.

## Overview

The AgentBench benchmark schema defines the structure for creating evaluation benchmarks for AI agents. Benchmarks are JSON files that specify prompts, expected outputs, and scoring configurations to evaluate agent performance.

## Schema Version

- **Current Version**: 1.0
- **Schema Location**: `/benchmarks/schemas/benchmark.schema.json`
- **TypeScript Types**: `/packages/core/src/schemas/benchmark.ts`

## Quick Start

Here's a minimal benchmark example:

```json
{
  "name": "my-benchmark",
  "description": "A simple benchmark to test basic capabilities",
  "evaluationType": "single-turn",
  "prompts": [
    {
      "id": "prompt-1",
      "input": "What is 2 + 2?",
      "expectedOutput": {
        "type": "contains",
        "value": "4"
      }
    }
  ],
  "scoring": {
    "method": "binary"
  }
}
```

## Required Fields

### `name` (string)

Unique identifier for the benchmark.

- **Constraints**: 1-128 characters, must start with a letter, can contain letters, numbers, underscores, and hyphens
- **Pattern**: `^[a-zA-Z][a-zA-Z0-9_-]*$`

```json
"name": "basic-reasoning"
```

### `description` (string)

Human-readable description of what this benchmark evaluates.

- **Constraints**: 1-2048 characters

```json
"description": "Tests the model's ability to perform basic logical reasoning"
```

### `evaluationType` (enum)

The type of evaluation this benchmark performs.

| Value | Description |
|-------|-------------|
| `single-turn` | Single prompt/response evaluation |
| `multi-turn` | Conversational evaluation with multiple turns |
| `tool-use` | Evaluation of tool/function calling capabilities |

```json
"evaluationType": "single-turn"
```

### `prompts` (array)

Array of prompts with expected outputs for evaluation. Must contain at least one prompt.

See [Prompts Section](#prompts-structure) for detailed structure.

### `scoring` (object)

Scoring configuration for the benchmark.

See [Scoring Section](#scoring-configuration) for detailed structure.

## Prompts Structure

Each prompt in the `prompts` array has the following structure:

### Required Prompt Fields

#### `id` (string)

Unique identifier for this prompt within the benchmark.

```json
"id": "logic-001"
```

#### `input` (string | array)

The input prompt. Can be:

- **String**: For single-turn evaluation
- **Array of conversation turns**: For multi-turn evaluation

Single-turn input:
```json
"input": "What is the capital of France?"
```

Multi-turn input:
```json
"input": [
  { "role": "system", "content": "You are a helpful assistant." },
  { "role": "user", "content": "Hello!" },
  { "role": "assistant", "content": "Hello! How can I help you today?" },
  { "role": "user", "content": "What's the weather like?" }
]
```

#### `expectedOutput` (object)

Specification for expected output matching.

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | Matching type: `exact`, `contains`, `regex`, `semantic`, `tool-call`, `custom` |
| `value` | string/array/object | Expected value or pattern |
| `threshold` | number (0-1) | Similarity threshold for semantic matching |
| `toolName` | string | Expected tool name for tool-use evaluation |
| `toolParameters` | object | Expected tool parameters for tool-use evaluation |

**Exact matching:**
```json
"expectedOutput": {
  "type": "exact",
  "value": "Paris"
}
```

**Contains matching:**
```json
"expectedOutput": {
  "type": "contains",
  "value": "capital"
}
```

**Multiple contains (any match):**
```json
"expectedOutput": {
  "type": "contains",
  "value": ["Paris", "paris", "PARIS"]
}
```

**Regex matching:**
```json
"expectedOutput": {
  "type": "regex",
  "value": "\\d{4}-\\d{2}-\\d{2}"
}
```

**Semantic matching:**
```json
"expectedOutput": {
  "type": "semantic",
  "value": "The response should explain photosynthesis in plants",
  "threshold": 0.8
}
```

**Tool-call matching:**
```json
"expectedOutput": {
  "type": "tool-call",
  "toolName": "get_weather",
  "toolParameters": {
    "location": "San Francisco"
  }
}
```

### Optional Prompt Fields

#### `context` (object)

Additional context for prompt evaluation.

| Field | Type | Description |
|-------|------|-------------|
| `systemPrompt` | string | System prompt to use |
| `tools` | array | Available tools for tool-use evaluation |
| `maxTokens` | integer | Maximum tokens for response |
| `temperature` | number (0-2) | Temperature setting |

```json
"context": {
  "systemPrompt": "You are a helpful math tutor.",
  "maxTokens": 200,
  "temperature": 0.5,
  "tools": [
    {
      "name": "calculate",
      "description": "Perform calculations",
      "parameters": {
        "type": "object",
        "required": ["expression"],
        "properties": {
          "expression": { "type": "string" }
        }
      }
    }
  ]
}
```

#### `weight` (number)

Weight of this prompt in overall scoring. Default: 1

```json
"weight": 2.5
```

## Scoring Configuration

### Required Scoring Fields

#### `method` (enum)

Scoring method to use.

| Value | Description |
|-------|-------------|
| `binary` | Pass/fail scoring (0 or 1) |
| `partial` | Partial credit scoring (0 to 1) |
| `rubric` | Rubric-based scoring with multiple criteria |
| `custom` | Custom scoring function |

### Optional Scoring Fields

#### `rubric` (array)

Rubric criteria for rubric-based scoring. Each criterion has:

| Field | Type | Description |
|-------|------|-------------|
| `criterion` | string | Name of the criterion |
| `description` | string | What this criterion measures |
| `weight` | number | Weight of this criterion |
| `levels` | array | Scoring levels (min 2 required) |

```json
"rubric": [
  {
    "criterion": "Accuracy",
    "description": "Factual correctness of the response",
    "weight": 2,
    "levels": [
      { "score": 0, "description": "Incorrect or missing information" },
      { "score": 0.5, "description": "Partially correct" },
      { "score": 1, "description": "Fully correct" }
    ]
  },
  {
    "criterion": "Clarity",
    "description": "How clear and understandable the response is",
    "weight": 1,
    "levels": [
      { "score": 0, "description": "Unclear or confusing" },
      { "score": 1, "description": "Clear and well-structured" }
    ]
  }
]
```

#### `weights` (object)

Custom weights for scoring components.

```json
"weights": {
  "accuracy": 1,
  "completeness": 0.5,
  "format": 0.2
}
```

#### `passingScore` (number)

Minimum score to pass this benchmark.

```json
"passingScore": 0.7
```

#### `customScorer` (string)

Path or identifier for custom scoring function.

```json
"customScorer": "scorers/my-custom-scorer"
```

## Metadata (Optional)

Optional metadata about the benchmark.

| Field | Type | Description |
|-------|------|-------------|
| `author` | string | Author or creator |
| `tags` | array[string] | Tags for categorization |
| `version` | string | Benchmark version (semver) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 update timestamp |
| `license` | string | License identifier |
| `source` | string | Source or reference |
| `difficulty` | enum | `easy`, `medium`, `hard`, `expert` |
| `estimatedDuration` | integer | Estimated runtime in seconds |
| `categories` | array[string] | Categories this benchmark belongs to |

```json
"metadata": {
  "author": "AgentBench Team",
  "tags": ["reasoning", "logic", "math"],
  "version": "1.0.0",
  "createdAt": "2026-04-12T00:00:00Z",
  "license": "MIT",
  "difficulty": "medium",
  "estimatedDuration": 60,
  "categories": ["reasoning", "fundamentals"]
}
```

## Examples

Example benchmarks are available in `/benchmarks/examples/`:

- `single-turn-example.json` - Basic reasoning benchmark with single-turn prompts
- `multi-turn-example.json` - Customer support conversation benchmark
- `tool-use-example.json` - Tool/function calling benchmark

## TypeScript Usage

```typescript
import {
  BenchmarkSchema,
  validateBenchmark,
  safeParseBenchmark,
  createBenchmark,
  BENCHMARK_SCHEMA_VERSION
} from '@agentbench/core/schemas/benchmark';

// Validate a benchmark
const benchmark = validateBenchmark(jsonData);

// Safe validation (no throw)
const result = safeParseBenchmark(jsonData);
if (result.success) {
  console.log('Valid benchmark:', result.data);
} else {
  console.error('Validation errors:', result.error);
}

// Create a benchmark with defaults
const newBenchmark = createBenchmark({
  name: 'my-benchmark',
  description: 'My custom benchmark',
  evaluationType: 'single-turn',
});

// Check schema version
console.log('Schema version:', BENCHMARK_SCHEMA_VERSION); // "1.0"
```

## Schema Versioning

The benchmark schema follows semantic versioning:

- **Major version (1.x.x)**: Breaking changes that require benchmark updates
- **Minor version (x.1.x)**: New optional fields, backward compatible
- **Patch version (x.x.1)**: Documentation or clarification only

**Current version: 1.0**

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-12 | Initial locked release |

## Validation

Benchmarks are validated using:

1. **JSON Schema**: `/benchmarks/schemas/benchmark.schema.json`
2. **Zod validation**: `/packages/core/src/schemas/benchmark.ts`

Both validation methods are kept in sync and provide identical validation rules.

## Best Practices

1. **Use descriptive names**: Choose names that clearly indicate what the benchmark tests
2. **Write comprehensive descriptions**: Help users understand the benchmark's purpose
3. **Include diverse prompts**: Cover edge cases and different scenarios
4. **Use appropriate weights**: Weight prompts based on importance
5. **Set realistic passing scores**: Based on expected model performance
6. **Add metadata**: Include author, version, and tags for discoverability
7. **Version your benchmarks**: Use the metadata version field to track changes

## FAQ

### Can I add custom fields to the schema?

No, the schema uses `additionalProperties: false`. All fields must be defined in the schema. If you need custom data, use the `metadata` section.

### How do I migrate when the schema version changes?

Major version changes will include migration guides. Minor version changes are backward compatible.

### What happens if my benchmark fails validation?

The benchmark will not run. Fix the validation errors shown and re-validate.
