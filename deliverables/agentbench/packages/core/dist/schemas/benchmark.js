/**
 * AgentBench Benchmark Schema TypeScript Types
 * Schema Version: 1.0
 *
 * LOCKED: This schema is locked as of v1.0. No breaking changes
 * will be made without incrementing the major version number.
 * See: /docs/benchmarks.md for full documentation.
 */
import { z } from "zod";
// Schema version constant
export const BENCHMARK_SCHEMA_VERSION = "1.0";
// Evaluation types supported by the benchmark system
export const EvaluationType = z.enum(["single-turn", "multi-turn", "tool-use"]);
// Expected output types for matching
export const ExpectedOutputType = z.enum([
    "exact",
    "contains",
    "regex",
    "semantic",
    "tool-call",
    "custom",
]);
// Scoring methods available
export const ScoringMethod = z.enum(["binary", "partial", "rubric", "custom"]);
// Difficulty levels for benchmarks
export const DifficultyLevel = z.enum(["easy", "medium", "hard", "expert"]);
// Conversation turn for multi-turn evaluation
export const ConversationTurn = z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
});
// Tool definition for tool-use evaluation
export const ToolDefinition = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    parameters: z.record(z.unknown()),
});
// Context for prompt evaluation
export const PromptContext = z.object({
    systemPrompt: z.string().optional(),
    tools: z.array(ToolDefinition).optional(),
    maxTokens: z.number().int().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
});
// Expected output specification
export const ExpectedOutput = z.object({
    type: ExpectedOutputType,
    value: z.union([z.string(), z.array(z.unknown()), z.record(z.unknown())]).optional(),
    threshold: z.number().min(0).max(1).optional(),
    toolName: z.string().optional(),
    toolParameters: z.record(z.unknown()).optional(),
});
// Input can be string (single-turn) or array of turns (multi-turn)
export const PromptInput = z.union([z.string(), z.array(ConversationTurn)]);
// Individual prompt definition
export const BenchmarkPrompt = z.object({
    id: z.string().min(1),
    input: PromptInput,
    expectedOutput: ExpectedOutput,
    context: PromptContext.optional(),
    weight: z.number().min(0).default(1),
});
// Rubric level definition
export const RubricLevel = z.object({
    score: z.number(),
    description: z.string().min(1),
});
// Rubric criterion definition
export const RubricCriterion = z.object({
    criterion: z.string().min(1),
    description: z.string().optional(),
    weight: z.number().min(0),
    levels: z.array(RubricLevel).min(2),
});
// Scoring weights configuration
export const ScoringWeights = z.object({
    accuracy: z.number().min(0).default(1),
    completeness: z.number().min(0).default(1),
    format: z.number().min(0).default(1),
});
// Scoring configuration
export const ScoringConfig = z.object({
    method: ScoringMethod,
    rubric: z.array(RubricCriterion).optional(),
    weights: ScoringWeights.optional(),
    passingScore: z.number().min(0).optional(),
    customScorer: z.string().optional(),
});
// Benchmark metadata
export const BenchmarkMetadata = z.object({
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    version: z
        .string()
        .regex(/^\d+\.\d+(\.\d+)?$/)
        .optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    license: z.string().optional(),
    source: z.string().optional(),
    difficulty: DifficultyLevel.optional(),
    estimatedDuration: z.number().int().positive().optional(),
    categories: z.array(z.string()).optional(),
});
// Main benchmark definition schema
export const BenchmarkSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(128)
        .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
    description: z.string().min(1).max(2048),
    evaluationType: EvaluationType,
    prompts: z.array(BenchmarkPrompt).min(1),
    scoring: ScoringConfig,
    metadata: BenchmarkMetadata.optional(),
});
/**
 * Validates a benchmark definition against the schema.
 * Returns the validated benchmark or throws a ZodError.
 *
 * @param data - The benchmark data to validate
 * @returns The validated Benchmark object
 * @throws ZodError if validation fails
 */
export function validateBenchmark(data) {
    return BenchmarkSchema.parse(data);
}
/**
 * Safely validates a benchmark definition against the schema.
 * Returns a result object with success status and data or error.
 *
 * @param data - The benchmark data to validate
 * @returns Object with success boolean and either data or error
 */
export function safeParseBenchmark(data) {
    return BenchmarkSchema.safeParse(data);
}
/**
 * Creates a minimal valid benchmark with default values.
 *
 * @param overrides - Partial benchmark to override defaults
 * @returns A valid Benchmark object
 */
export function createBenchmark(overrides) {
    const defaults = {
        description: "A benchmark for evaluating AI agent performance",
        evaluationType: "single-turn",
        prompts: [
            {
                id: "prompt-1",
                input: "Hello, how are you?",
                expectedOutput: {
                    type: "contains",
                    value: "hello",
                },
                weight: 1,
            },
        ],
        scoring: {
            method: "binary",
        },
    };
    return BenchmarkSchema.parse({
        ...defaults,
        ...overrides,
    });
}
/**
 * Checks if the given evaluation type is valid.
 *
 * @param type - The evaluation type to check
 * @returns True if the type is valid
 */
export function isValidEvaluationType(type) {
    return EvaluationType.safeParse(type).success;
}
/**
 * Gets the schema version.
 *
 * @returns The current schema version
 */
export function getSchemaVersion() {
    return BENCHMARK_SCHEMA_VERSION;
}
//# sourceMappingURL=benchmark.js.map