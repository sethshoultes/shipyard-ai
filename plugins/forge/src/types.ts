/**
 * Forge Plugin - Type Definitions
 *
 * v1 MVP field types: text, email, number, textarea, select, checkbox, radio
 * Theme: primary color + logo only
 * No conditional logic, no multi-step, no webhooks
 */

/**
 * Supported field types for v1 MVP
 * Per decisions.md: "text, email, number, textarea, select, checkbox, radio"
 */
export type FieldType =
	| "text"
	| "email"
	| "number"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio";

/**
 * Form field definition
 * v1 MVP: No showWhen (conditional logic cut)
 */
export interface FormFieldDefinition {
	id: string;
	type: FieldType;
	label: string;
	placeholder?: string;
	required: boolean;
	options?: string[]; // For select, radio
	defaultValue?: string;
	inferred?: boolean; // True if field type was auto-inferred
}

/**
 * Form definition stored in D1
 * v1 MVP: No webhooks, no autoResponse, no steps (multi-step)
 */
export interface FormDefinition {
	id: string;
	name: string;
	description?: string;
	fields: FormFieldDefinition[];
	notifyEmails?: string[];
	primaryColor?: string; // Default #C4704B (Terracotta)
	logoUrl?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Form submission stored in D1
 */
export interface FormSubmission {
	id: string;
	formId: string;
	data: Record<string, string>;
	submittedAt: string;
	ip?: string;
}

/**
 * Plugin settings
 */
export interface ForgeSettings {
	maxFieldsPerForm: number;
	maxSubmissionSizeBytes: number;
	rateLimitPerWindow: number;
	rateLimitWindowMinutes: number;
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: ForgeSettings = {
	maxFieldsPerForm: 50,
	maxSubmissionSizeBytes: 51200, // 50KB
	rateLimitPerWindow: 5,
	rateLimitWindowMinutes: 15,
};

/**
 * Inferred field type result from "Ask something" feature
 */
export interface InferredFieldResult {
	suggestedType: FieldType;
	confidence: "high" | "low";
	label: string;
}
