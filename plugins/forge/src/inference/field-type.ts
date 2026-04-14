/**
 * Forge - "Ask something" Field Type Inference
 *
 * Per Decision 3: "This is the entire product thesis."
 * The magic moment: type a question, get a field type suggestion.
 *
 * HARD STOP per Risk Register: Pattern matching only. No ML. No LLM.
 * Simple heuristics that work for 80% of cases.
 */

import type { FieldType, InferredFieldResult } from "../types";

/**
 * Infer field type from a natural language question.
 *
 * Pattern matching rules:
 * - email patterns: "email", "e-mail", "mail address" → email
 * - phone patterns: "phone", "tel", "mobile", "cell" → text (with tel pattern)
 * - number patterns: "number", "amount", "quantity", "age", "how many" → number
 * - textarea patterns: "message", "comment", "feedback", "describe", "details" → textarea
 * - default: everything else → text
 *
 * @param question - Natural language question like "What is your email?"
 * @returns InferredFieldResult with suggested type and confidence
 */
export function inferFieldType(question: string): InferredFieldResult {
	const q = question.toLowerCase().trim();

	// Extract a label from the question (remove question marks, common prefixes)
	const label = extractLabel(question);

	// Email patterns - high confidence
	if (/\b(e-?mail|mail\s*address)\b/i.test(q)) {
		return { suggestedType: "email", confidence: "high", label };
	}

	// Phone patterns - map to text with pattern (phone is not in v1 field types)
	if (/\b(phone|tel|mobile|cell|call)\b/i.test(q)) {
		return { suggestedType: "text", confidence: "high", label };
	}

	// Number patterns - high confidence
	if (/\b(number|amount|quantity|count|how\s*many|age|price|cost)\b/i.test(q)) {
		return { suggestedType: "number", confidence: "high", label };
	}

	// Textarea patterns - for long text responses
	if (/\b(message|comment|feedback|describe|tell\s*us|details|notes|about\s*(yourself|you)|explain)\b/i.test(q)) {
		return { suggestedType: "textarea", confidence: "high", label };
	}

	// Checkbox patterns - for yes/no or agreement questions
	if (/\b(agree|subscribe|newsletter|terms|consent|opt[\s-]?in)\b/i.test(q)) {
		return { suggestedType: "checkbox", confidence: "high", label };
	}

	// Default to text (includes "name" and unknown patterns)
	return { suggestedType: "text", confidence: "low", label };
}

/**
 * Extract a clean label from a question string.
 * Removes question marks, "what is your", "please enter", etc.
 */
function extractLabel(question: string): string {
	let label = question
		.replace(/[?!.]+$/g, "") // Remove trailing punctuation
		.replace(/^(what('?s|\s+is)\s+(your|the)?\s*)/i, "") // "What is your" / "What's your"
		.replace(/^(please\s+(enter|provide|tell\s+us)\s+(your\s+)?)/i, "") // "Please enter your"
		.replace(/^(enter\s+(your\s+)?)/i, "") // "Enter your"
		.replace(/^(your\s+)/i, "") // "Your"
		.replace(/^(may\s+we\s+(have|ask)\s+(your\s+)?)/i, "") // "May we have your"
		.trim();

	// Capitalize first letter
	if (label.length > 0) {
		label = label.charAt(0).toUpperCase() + label.slice(1);
	}

	return label || "Field";
}

/**
 * Validate that a field type is one of the allowed v1 types.
 */
export function isValidFieldType(type: string): type is FieldType {
	const validTypes: FieldType[] = ["text", "email", "number", "textarea", "select", "checkbox", "radio"];
	return validTypes.includes(type as FieldType);
}
