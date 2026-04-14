/**
 * Forge - Field Type Inference
 *
 * R-004: "Ask something" field creation
 * R-005: Pattern matching only (no NLP)
 * R-006: "name" -> text field
 * R-007: "email" -> email field
 * R-008: "phone"/"number" -> tel/number
 * R-009: "message"/"comments" -> textarea
 * R-010: Unknown -> text default
 * R-024: Field type override UI
 * R-025: Visual feedback on inference
 */
import type { FieldType, InferredField } from "../types.js";

/**
 * Pattern definitions for field type inference.
 * Each pattern maps keywords to a field type with confidence.
 */
interface PatternRule {
	keywords: string[];
	type: FieldType;
	label: string;
	placeholder?: string;
	confidence: "high" | "medium";
}

/**
 * Pattern rules for field type inference.
 * Order matters - first match wins.
 */
const PATTERN_RULES: PatternRule[] = [
	// Email patterns - high confidence
	{
		keywords: ["email", "e-mail", "email address", "e-mail address"],
		type: "email",
		label: "Email",
		placeholder: "your@email.com",
		confidence: "high",
	},

	// Phone patterns - high confidence
	{
		keywords: ["phone", "telephone", "mobile", "cell", "phone number", "contact number"],
		type: "tel",
		label: "Phone",
		placeholder: "(555) 123-4567",
		confidence: "high",
	},

	// Name patterns - high confidence
	{
		keywords: ["name", "full name", "your name", "first name", "last name"],
		type: "text",
		label: "Name",
		placeholder: "Your name",
		confidence: "high",
	},

	// Message/textarea patterns - high confidence
	{
		keywords: [
			"message",
			"comments",
			"feedback",
			"description",
			"details",
			"notes",
			"tell us",
			"explain",
			"write",
			"additional information",
			"how can we help",
		],
		type: "textarea",
		label: "Message",
		placeholder: "Enter your message here...",
		confidence: "high",
	},

	// Number patterns - medium confidence (could be phone)
	{
		keywords: ["number", "amount", "quantity", "count", "age", "how many"],
		type: "number",
		label: "Number",
		placeholder: "Enter a number",
		confidence: "medium",
	},

	// Company/organization patterns - medium confidence
	{
		keywords: ["company", "organization", "business", "employer", "work"],
		type: "text",
		label: "Company",
		placeholder: "Your company name",
		confidence: "medium",
	},

	// Website/URL patterns - medium confidence
	{
		keywords: ["website", "url", "link", "site", "web address"],
		type: "text",
		label: "Website",
		placeholder: "https://example.com",
		confidence: "medium",
	},

	// Address patterns - medium confidence
	{
		keywords: ["address", "location", "street", "city", "zip", "postal"],
		type: "text",
		label: "Address",
		placeholder: "Your address",
		confidence: "medium",
	},

	// Subject patterns - medium confidence
	{
		keywords: ["subject", "topic", "regarding", "about", "reason"],
		type: "text",
		label: "Subject",
		placeholder: "What is this about?",
		confidence: "medium",
	},
];

/**
 * Normalizes text for pattern matching.
 * Converts to lowercase and removes punctuation.
 */
function normalizeText(text: string): string {
	return text
		.toLowerCase()
		.replace(/[?!.,;:'"]/g, "")
		.trim();
}

/**
 * Extracts a clean label from the prompt.
 * Removes question words and cleans up the text.
 */
function extractLabelFromPrompt(prompt: string): string {
	const normalized = normalizeText(prompt);

	// Remove common question prefixes
	const questionPrefixes = [
		"what is your",
		"what's your",
		"whats your",
		"enter your",
		"type your",
		"provide your",
		"please enter",
		"please provide",
		"please type",
		"what is the",
		"what's the",
		"can you provide",
		"could you provide",
		"may i have your",
		"do you have a",
	];

	let cleaned = normalized;
	for (const prefix of questionPrefixes) {
		if (cleaned.startsWith(prefix)) {
			cleaned = cleaned.slice(prefix.length).trim();
			break;
		}
	}

	// Remove trailing question words
	const questionSuffixes = ["please", "here", "below"];
	for (const suffix of questionSuffixes) {
		if (cleaned.endsWith(suffix)) {
			cleaned = cleaned.slice(0, -suffix.length).trim();
		}
	}

	// Capitalize first letter of each word
	return cleaned
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Infers the field type from a natural language prompt.
 *
 * @param prompt - The user's "ask something" input
 * @returns Inferred field information with type, label, and confidence
 *
 * @example
 * inferFieldType("What's your email?")
 * // { type: "email", label: "Email", placeholder: "your@email.com", confidence: "high" }
 *
 * @example
 * inferFieldType("Tell us about your project")
 * // { type: "textarea", label: "Message", placeholder: "Enter your message here...", confidence: "high" }
 */
export function inferFieldType(prompt: string): InferredField {
	const normalized = normalizeText(prompt);

	// Check each pattern rule
	for (const rule of PATTERN_RULES) {
		for (const keyword of rule.keywords) {
			if (normalized.includes(keyword)) {
				// Use the extracted label if we can make a better one
				const extractedLabel = extractLabelFromPrompt(prompt);
				const label = extractedLabel.length > 0 && extractedLabel.length <= 50 ? extractedLabel : rule.label;

				return {
					type: rule.type,
					label,
					placeholder: rule.placeholder,
					confidence: rule.confidence,
				};
			}
		}
	}

	// R-010: Unknown -> text default with low confidence
	const extractedLabel = extractLabelFromPrompt(prompt);
	return {
		type: "text",
		label: extractedLabel.length > 0 && extractedLabel.length <= 50 ? extractedLabel : "Response",
		placeholder: undefined,
		confidence: "low",
	};
}

/**
 * Returns all available field types for the override UI.
 * R-024: Field type override UI
 */
export function getAvailableFieldTypes(): Array<{ type: FieldType; label: string; description: string }> {
	return [
		{ type: "text", label: "Text", description: "Single line text input" },
		{ type: "email", label: "Email", description: "Email address with validation" },
		{ type: "number", label: "Number", description: "Numeric input" },
		{ type: "tel", label: "Phone", description: "Phone number input" },
		{ type: "textarea", label: "Long Text", description: "Multi-line text input" },
		{ type: "select", label: "Dropdown", description: "Single selection from options" },
		{ type: "checkbox", label: "Checkboxes", description: "Multiple selections" },
		{ type: "radio", label: "Radio Buttons", description: "Single selection with visible options" },
	];
}

/**
 * Gets a human-readable description of the confidence level.
 * R-025: Visual feedback on inference
 */
export function getConfidenceDescription(confidence: "high" | "medium" | "low"): string {
	switch (confidence) {
		case "high":
			return "High confidence - this field type is a strong match";
		case "medium":
			return "Medium confidence - you may want to verify this field type";
		case "low":
			return "Low confidence - please review and select the appropriate field type";
	}
}

/**
 * Suggests a placeholder based on field type.
 */
export function suggestPlaceholder(type: FieldType, label: string): string {
	switch (type) {
		case "email":
			return "your@email.com";
		case "tel":
			return "(555) 123-4567";
		case "number":
			return "0";
		case "textarea":
			return `Enter your ${label.toLowerCase()} here...`;
		default:
			return `Enter ${label.toLowerCase()}`;
	}
}
