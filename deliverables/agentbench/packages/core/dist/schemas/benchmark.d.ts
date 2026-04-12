/**
 * AgentBench Benchmark Schema TypeScript Types
 * Schema Version: 1.0
 *
 * LOCKED: This schema is locked as of v1.0. No breaking changes
 * will be made without incrementing the major version number.
 * See: /docs/benchmarks.md for full documentation.
 */
import { z } from "zod";
export declare const BENCHMARK_SCHEMA_VERSION: "1.0";
export declare const EvaluationType: z.ZodEnum<["single-turn", "multi-turn", "tool-use"]>;
export type EvaluationType = z.infer<typeof EvaluationType>;
export declare const ExpectedOutputType: z.ZodEnum<["exact", "contains", "regex", "semantic", "tool-call", "custom"]>;
export type ExpectedOutputType = z.infer<typeof ExpectedOutputType>;
export declare const ScoringMethod: z.ZodEnum<["binary", "partial", "rubric", "custom"]>;
export type ScoringMethod = z.infer<typeof ScoringMethod>;
export declare const DifficultyLevel: z.ZodEnum<["easy", "medium", "hard", "expert"]>;
export type DifficultyLevel = z.infer<typeof DifficultyLevel>;
export declare const ConversationTurn: z.ZodObject<{
    role: z.ZodEnum<["user", "assistant", "system"]>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "user" | "assistant" | "system";
    content: string;
}, {
    role: "user" | "assistant" | "system";
    content: string;
}>;
export type ConversationTurn = z.infer<typeof ConversationTurn>;
export declare const ToolDefinition: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}, {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}>;
export type ToolDefinition = z.infer<typeof ToolDefinition>;
export declare const PromptContext: z.ZodObject<{
    systemPrompt: z.ZodOptional<z.ZodString>;
    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }, {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }>, "many">>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    systemPrompt?: string | undefined;
    tools?: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }[] | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
}, {
    systemPrompt?: string | undefined;
    tools?: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }[] | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
}>;
export type PromptContext = z.infer<typeof PromptContext>;
export declare const ExpectedOutput: z.ZodObject<{
    type: z.ZodEnum<["exact", "contains", "regex", "semantic", "tool-call", "custom"]>;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodUnknown, "many">, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
    threshold: z.ZodOptional<z.ZodNumber>;
    toolName: z.ZodOptional<z.ZodString>;
    toolParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
    value?: string | unknown[] | Record<string, unknown> | undefined;
    threshold?: number | undefined;
    toolName?: string | undefined;
    toolParameters?: Record<string, unknown> | undefined;
}, {
    type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
    value?: string | unknown[] | Record<string, unknown> | undefined;
    threshold?: number | undefined;
    toolName?: string | undefined;
    toolParameters?: Record<string, unknown> | undefined;
}>;
export type ExpectedOutput = z.infer<typeof ExpectedOutput>;
export declare const PromptInput: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodObject<{
    role: z.ZodEnum<["user", "assistant", "system"]>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "user" | "assistant" | "system";
    content: string;
}, {
    role: "user" | "assistant" | "system";
    content: string;
}>, "many">]>;
export type PromptInput = z.infer<typeof PromptInput>;
export declare const BenchmarkPrompt: z.ZodObject<{
    id: z.ZodString;
    input: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant", "system"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant" | "system";
        content: string;
    }, {
        role: "user" | "assistant" | "system";
        content: string;
    }>, "many">]>;
    expectedOutput: z.ZodObject<{
        type: z.ZodEnum<["exact", "contains", "regex", "semantic", "tool-call", "custom"]>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodUnknown, "many">, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
        threshold: z.ZodOptional<z.ZodNumber>;
        toolName: z.ZodOptional<z.ZodString>;
        toolParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
        value?: string | unknown[] | Record<string, unknown> | undefined;
        threshold?: number | undefined;
        toolName?: string | undefined;
        toolParameters?: Record<string, unknown> | undefined;
    }, {
        type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
        value?: string | unknown[] | Record<string, unknown> | undefined;
        threshold?: number | undefined;
        toolName?: string | undefined;
        toolParameters?: Record<string, unknown> | undefined;
    }>;
    context: z.ZodOptional<z.ZodObject<{
        systemPrompt: z.ZodOptional<z.ZodString>;
        tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }, {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }>, "many">>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        temperature: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        systemPrompt?: string | undefined;
        tools?: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }[] | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    }, {
        systemPrompt?: string | undefined;
        tools?: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }[] | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    }>>;
    weight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    input: string | {
        role: "user" | "assistant" | "system";
        content: string;
    }[];
    id: string;
    expectedOutput: {
        type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
        value?: string | unknown[] | Record<string, unknown> | undefined;
        threshold?: number | undefined;
        toolName?: string | undefined;
        toolParameters?: Record<string, unknown> | undefined;
    };
    weight: number;
    context?: {
        systemPrompt?: string | undefined;
        tools?: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }[] | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    } | undefined;
}, {
    input: string | {
        role: "user" | "assistant" | "system";
        content: string;
    }[];
    id: string;
    expectedOutput: {
        type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
        value?: string | unknown[] | Record<string, unknown> | undefined;
        threshold?: number | undefined;
        toolName?: string | undefined;
        toolParameters?: Record<string, unknown> | undefined;
    };
    context?: {
        systemPrompt?: string | undefined;
        tools?: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        }[] | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    } | undefined;
    weight?: number | undefined;
}>;
export type BenchmarkPrompt = z.infer<typeof BenchmarkPrompt>;
export declare const RubricLevel: z.ZodObject<{
    score: z.ZodNumber;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    description: string;
    score: number;
}, {
    description: string;
    score: number;
}>;
export type RubricLevel = z.infer<typeof RubricLevel>;
export declare const RubricCriterion: z.ZodObject<{
    criterion: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    weight: z.ZodNumber;
    levels: z.ZodArray<z.ZodObject<{
        score: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        score: number;
    }, {
        description: string;
        score: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    weight: number;
    criterion: string;
    levels: {
        description: string;
        score: number;
    }[];
    description?: string | undefined;
}, {
    weight: number;
    criterion: string;
    levels: {
        description: string;
        score: number;
    }[];
    description?: string | undefined;
}>;
export type RubricCriterion = z.infer<typeof RubricCriterion>;
export declare const ScoringWeights: z.ZodObject<{
    accuracy: z.ZodDefault<z.ZodNumber>;
    completeness: z.ZodDefault<z.ZodNumber>;
    format: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    accuracy: number;
    completeness: number;
    format: number;
}, {
    accuracy?: number | undefined;
    completeness?: number | undefined;
    format?: number | undefined;
}>;
export type ScoringWeights = z.infer<typeof ScoringWeights>;
export declare const ScoringConfig: z.ZodObject<{
    method: z.ZodEnum<["binary", "partial", "rubric", "custom"]>;
    rubric: z.ZodOptional<z.ZodArray<z.ZodObject<{
        criterion: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        weight: z.ZodNumber;
        levels: z.ZodArray<z.ZodObject<{
            score: z.ZodNumber;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            score: number;
        }, {
            description: string;
            score: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        weight: number;
        criterion: string;
        levels: {
            description: string;
            score: number;
        }[];
        description?: string | undefined;
    }, {
        weight: number;
        criterion: string;
        levels: {
            description: string;
            score: number;
        }[];
        description?: string | undefined;
    }>, "many">>;
    weights: z.ZodOptional<z.ZodObject<{
        accuracy: z.ZodDefault<z.ZodNumber>;
        completeness: z.ZodDefault<z.ZodNumber>;
        format: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        accuracy: number;
        completeness: number;
        format: number;
    }, {
        accuracy?: number | undefined;
        completeness?: number | undefined;
        format?: number | undefined;
    }>>;
    passingScore: z.ZodOptional<z.ZodNumber>;
    customScorer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    method: "custom" | "binary" | "partial" | "rubric";
    rubric?: {
        weight: number;
        criterion: string;
        levels: {
            description: string;
            score: number;
        }[];
        description?: string | undefined;
    }[] | undefined;
    weights?: {
        accuracy: number;
        completeness: number;
        format: number;
    } | undefined;
    passingScore?: number | undefined;
    customScorer?: string | undefined;
}, {
    method: "custom" | "binary" | "partial" | "rubric";
    rubric?: {
        weight: number;
        criterion: string;
        levels: {
            description: string;
            score: number;
        }[];
        description?: string | undefined;
    }[] | undefined;
    weights?: {
        accuracy?: number | undefined;
        completeness?: number | undefined;
        format?: number | undefined;
    } | undefined;
    passingScore?: number | undefined;
    customScorer?: string | undefined;
}>;
export type ScoringConfig = z.infer<typeof ScoringConfig>;
export declare const BenchmarkMetadata: z.ZodObject<{
    author: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    version: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    license: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard", "expert"]>>;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    author?: string | undefined;
    tags?: string[] | undefined;
    version?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    license?: string | undefined;
    source?: string | undefined;
    difficulty?: "easy" | "medium" | "hard" | "expert" | undefined;
    estimatedDuration?: number | undefined;
    categories?: string[] | undefined;
}, {
    author?: string | undefined;
    tags?: string[] | undefined;
    version?: string | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    license?: string | undefined;
    source?: string | undefined;
    difficulty?: "easy" | "medium" | "hard" | "expert" | undefined;
    estimatedDuration?: number | undefined;
    categories?: string[] | undefined;
}>;
export type BenchmarkMetadata = z.infer<typeof BenchmarkMetadata>;
export declare const BenchmarkSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    evaluationType: z.ZodEnum<["single-turn", "multi-turn", "tool-use"]>;
    prompts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        input: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodObject<{
            role: z.ZodEnum<["user", "assistant", "system"]>;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            role: "user" | "assistant" | "system";
            content: string;
        }, {
            role: "user" | "assistant" | "system";
            content: string;
        }>, "many">]>;
        expectedOutput: z.ZodObject<{
            type: z.ZodEnum<["exact", "contains", "regex", "semantic", "tool-call", "custom"]>;
            value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodUnknown, "many">, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>;
            threshold: z.ZodOptional<z.ZodNumber>;
            toolName: z.ZodOptional<z.ZodString>;
            toolParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
            value?: string | unknown[] | Record<string, unknown> | undefined;
            threshold?: number | undefined;
            toolName?: string | undefined;
            toolParameters?: Record<string, unknown> | undefined;
        }, {
            type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
            value?: string | unknown[] | Record<string, unknown> | undefined;
            threshold?: number | undefined;
            toolName?: string | undefined;
            toolParameters?: Record<string, unknown> | undefined;
        }>;
        context: z.ZodOptional<z.ZodObject<{
            systemPrompt: z.ZodOptional<z.ZodString>;
            tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                description: z.ZodString;
                parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }, {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }>, "many">>;
            maxTokens: z.ZodOptional<z.ZodNumber>;
            temperature: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            systemPrompt?: string | undefined;
            tools?: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }[] | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
        }, {
            systemPrompt?: string | undefined;
            tools?: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }[] | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
        }>>;
        weight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        input: string | {
            role: "user" | "assistant" | "system";
            content: string;
        }[];
        id: string;
        expectedOutput: {
            type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
            value?: string | unknown[] | Record<string, unknown> | undefined;
            threshold?: number | undefined;
            toolName?: string | undefined;
            toolParameters?: Record<string, unknown> | undefined;
        };
        weight: number;
        context?: {
            systemPrompt?: string | undefined;
            tools?: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }[] | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
    }, {
        input: string | {
            role: "user" | "assistant" | "system";
            content: string;
        }[];
        id: string;
        expectedOutput: {
            type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
            value?: string | unknown[] | Record<string, unknown> | undefined;
            threshold?: number | undefined;
            toolName?: string | undefined;
            toolParameters?: Record<string, unknown> | undefined;
        };
        context?: {
            systemPrompt?: string | undefined;
            tools?: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }[] | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        weight?: number | undefined;
    }>, "many">;
    scoring: z.ZodObject<{
        method: z.ZodEnum<["binary", "partial", "rubric", "custom"]>;
        rubric: z.ZodOptional<z.ZodArray<z.ZodObject<{
            criterion: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            weight: z.ZodNumber;
            levels: z.ZodArray<z.ZodObject<{
                score: z.ZodNumber;
                description: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description: string;
                score: number;
            }, {
                description: string;
                score: number;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            weight: number;
            criterion: string;
            levels: {
                description: string;
                score: number;
            }[];
            description?: string | undefined;
        }, {
            weight: number;
            criterion: string;
            levels: {
                description: string;
                score: number;
            }[];
            description?: string | undefined;
        }>, "many">>;
        weights: z.ZodOptional<z.ZodObject<{
            accuracy: z.ZodDefault<z.ZodNumber>;
            completeness: z.ZodDefault<z.ZodNumber>;
            format: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            accuracy: number;
            completeness: number;
            format: number;
        }, {
            accuracy?: number | undefined;
            completeness?: number | undefined;
            format?: number | undefined;
        }>>;
        passingScore: z.ZodOptional<z.ZodNumber>;
        customScorer: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        method: "custom" | "binary" | "partial" | "rubric";
        rubric?: {
            weight: number;
            criterion: string;
            levels: {
                description: string;
                score: number;
            }[];
            description?: string | undefined;
        }[] | undefined;
        weights?: {
            accuracy: number;
            completeness: number;
            format: number;
        } | undefined;
        passingScore?: number | undefined;
        customScorer?: string | undefined;
    }, {
        method: "custom" | "binary" | "partial" | "rubric";
        rubric?: {
            weight: number;
            criterion: string;
            levels: {
                description: string;
                score: number;
            }[];
            description?: string | undefined;
        }[] | undefined;
        weights?: {
            accuracy?: number | undefined;
            completeness?: number | undefined;
            format?: number | undefined;
        } | undefined;
        passingScore?: number | undefined;
        customScorer?: string | undefined;
    }>;
    metadata: z.ZodOptional<z.ZodObject<{
        author: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        version: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodOptional<z.ZodString>;
        license: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard", "expert"]>>;
        estimatedDuration: z.ZodOptional<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        author?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        license?: string | undefined;
        source?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | "expert" | undefined;
        estimatedDuration?: number | undefined;
        categories?: string[] | undefined;
    }, {
        author?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        license?: string | undefined;
        source?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | "expert" | undefined;
        estimatedDuration?: number | undefined;
        categories?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    evaluationType: "single-turn" | "multi-turn" | "tool-use";
    prompts: {
        input: string | {
            role: "user" | "assistant" | "system";
            content: string;
        }[];
        id: string;
        expectedOutput: {
            type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
            value?: string | unknown[] | Record<string, unknown> | undefined;
            threshold?: number | undefined;
            toolName?: string | undefined;
            toolParameters?: Record<string, unknown> | undefined;
        };
        weight: number;
        context?: {
            systemPrompt?: string | undefined;
            tools?: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }[] | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
    }[];
    scoring: {
        method: "custom" | "binary" | "partial" | "rubric";
        rubric?: {
            weight: number;
            criterion: string;
            levels: {
                description: string;
                score: number;
            }[];
            description?: string | undefined;
        }[] | undefined;
        weights?: {
            accuracy: number;
            completeness: number;
            format: number;
        } | undefined;
        passingScore?: number | undefined;
        customScorer?: string | undefined;
    };
    metadata?: {
        author?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        license?: string | undefined;
        source?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | "expert" | undefined;
        estimatedDuration?: number | undefined;
        categories?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    description: string;
    evaluationType: "single-turn" | "multi-turn" | "tool-use";
    prompts: {
        input: string | {
            role: "user" | "assistant" | "system";
            content: string;
        }[];
        id: string;
        expectedOutput: {
            type: "contains" | "exact" | "regex" | "semantic" | "tool-call" | "custom";
            value?: string | unknown[] | Record<string, unknown> | undefined;
            threshold?: number | undefined;
            toolName?: string | undefined;
            toolParameters?: Record<string, unknown> | undefined;
        };
        context?: {
            systemPrompt?: string | undefined;
            tools?: {
                name: string;
                description: string;
                parameters: Record<string, unknown>;
            }[] | undefined;
            maxTokens?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        weight?: number | undefined;
    }[];
    scoring: {
        method: "custom" | "binary" | "partial" | "rubric";
        rubric?: {
            weight: number;
            criterion: string;
            levels: {
                description: string;
                score: number;
            }[];
            description?: string | undefined;
        }[] | undefined;
        weights?: {
            accuracy?: number | undefined;
            completeness?: number | undefined;
            format?: number | undefined;
        } | undefined;
        passingScore?: number | undefined;
        customScorer?: string | undefined;
    };
    metadata?: {
        author?: string | undefined;
        tags?: string[] | undefined;
        version?: string | undefined;
        createdAt?: string | undefined;
        updatedAt?: string | undefined;
        license?: string | undefined;
        source?: string | undefined;
        difficulty?: "easy" | "medium" | "hard" | "expert" | undefined;
        estimatedDuration?: number | undefined;
        categories?: string[] | undefined;
    } | undefined;
}>;
export type Benchmark = z.infer<typeof BenchmarkSchema>;
/**
 * Validates a benchmark definition against the schema.
 * Returns the validated benchmark or throws a ZodError.
 *
 * @param data - The benchmark data to validate
 * @returns The validated Benchmark object
 * @throws ZodError if validation fails
 */
export declare function validateBenchmark(data: unknown): Benchmark;
/**
 * Safely validates a benchmark definition against the schema.
 * Returns a result object with success status and data or error.
 *
 * @param data - The benchmark data to validate
 * @returns Object with success boolean and either data or error
 */
export declare function safeParseBenchmark(data: unknown): z.SafeParseReturnType<unknown, Benchmark>;
/**
 * Creates a minimal valid benchmark with default values.
 *
 * @param overrides - Partial benchmark to override defaults
 * @returns A valid Benchmark object
 */
export declare function createBenchmark(overrides: Partial<Benchmark> & Pick<Benchmark, "name">): Benchmark;
/**
 * Checks if the given evaluation type is valid.
 *
 * @param type - The evaluation type to check
 * @returns True if the type is valid
 */
export declare function isValidEvaluationType(type: string): type is EvaluationType;
/**
 * Gets the schema version.
 *
 * @returns The current schema version
 */
export declare function getSchemaVersion(): string;
//# sourceMappingURL=benchmark.d.ts.map