/**
 * Forge - TypeScript interfaces and types
 */

/**
 * Field types supported by Forge
 * R-012: Seven field types
 */
export type FieldType =
	| "text"
	| "email"
	| "number"
	| "tel"
	| "textarea"
	| "select"
	| "checkbox"
	| "radio";

/**
 * A single field in a form
 */
export interface FormField {
	/** Unique identifier for the field */
	id: string;
	/** Field type (text, email, number, etc.) */
	type: FieldType;
	/** Display label for the field */
	label: string;
	/** Optional placeholder text */
	placeholder?: string;
	/** Whether this field is required */
	required: boolean;
	/** Options for select, checkbox, and radio fields */
	options?: FieldOption[];
	/** The original "ask something" prompt that created this field */
	prompt?: string;
	/** Display order */
	order: number;
}

/**
 * Option for select, checkbox, and radio fields
 */
export interface FieldOption {
	/** Display label */
	label: string;
	/** Value to be submitted */
	value: string;
}

/**
 * Theme customization settings
 * R-017, R-018, R-019, R-020: Theme with primary color and logo only
 */
export interface FormTheme {
	/** Primary color in hex format (e.g., "#3B82F6") */
	primaryColor: string;
	/** Logo URL (optional) */
	logoUrl?: string;
}

/**
 * A form definition
 */
export interface Form {
	/** Unique identifier */
	id: string;
	/** Form name/title */
	name: string;
	/** URL-friendly slug */
	slug: string;
	/** Optional description */
	description?: string;
	/** Fields in this form */
	fields: FormField[];
	/** Theme customization */
	theme: FormTheme;
	/** Email to notify on submission */
	notificationEmail?: string;
	/** Submit button text */
	submitButtonText: string;
	/** Success message shown after submission */
	successMessage: string;
	/** Whether the form is published */
	published: boolean;
	/** Creation timestamp */
	createdAt: string;
	/** Last update timestamp */
	updatedAt: string;
}

/**
 * A form submission
 */
export interface Submission {
	/** Unique identifier */
	id: string;
	/** ID of the form this submission belongs to */
	formId: string;
	/** Submission data keyed by field ID */
	data: Record<string, unknown>;
	/** Submission timestamp */
	createdAt: string;
	/** IP address (for spam protection) */
	ipAddress?: string;
	/** User agent (for analytics) */
	userAgent?: string;
}

/**
 * Result of field type inference from "ask something" prompt
 */
export interface InferredField {
	/** Inferred field type */
	type: FieldType;
	/** Suggested label */
	label: string;
	/** Suggested placeholder */
	placeholder?: string;
	/** Confidence level (for UI feedback) */
	confidence: "high" | "medium" | "low";
}

/**
 * Contact form template
 * R-016: One template - Contact Form
 */
export const CONTACT_FORM_TEMPLATE: Omit<Form, "id" | "createdAt" | "updatedAt"> = {
	name: "Contact Form",
	slug: "contact",
	description: "A simple contact form",
	fields: [
		{
			id: "name",
			type: "text",
			label: "Name",
			placeholder: "Your name",
			required: true,
			order: 0,
		},
		{
			id: "email",
			type: "email",
			label: "Email",
			placeholder: "your@email.com",
			required: true,
			order: 1,
		},
		{
			id: "message",
			type: "textarea",
			label: "Message",
			placeholder: "How can we help you?",
			required: true,
			order: 2,
		},
	],
	theme: {
		primaryColor: "#3B82F6", // Blue-500
	},
	submitButtonText: "Send Message",
	successMessage: "Thank you! We'll get back to you soon.",
	published: false,
};

/**
 * Default theme settings
 * R-017: Beautiful default theme
 */
export const DEFAULT_THEME: FormTheme = {
	primaryColor: "#3B82F6", // Blue-500
};

/**
 * CSV export row type
 */
export interface CsvRow {
	[key: string]: string | number | boolean | null;
}

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
	items: T[];
	cursor?: string;
	hasMore: boolean;
	total?: number;
}

/**
 * Form creation input (without auto-generated fields)
 */
export type CreateFormInput = Omit<Form, "id" | "createdAt" | "updatedAt">;

/**
 * Form update input (partial, without auto-generated fields)
 */
export type UpdateFormInput = Partial<Omit<Form, "id" | "createdAt" | "updatedAt">>;

/**
 * Submission creation input (without auto-generated fields)
 */
export type CreateSubmissionInput = Omit<Submission, "id" | "createdAt">;
