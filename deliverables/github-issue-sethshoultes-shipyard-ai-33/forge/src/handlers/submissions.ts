/**
 * Forge - Submission Handlers
 *
 * R-013: Submissions stored in D1
 * R-015: CSV export
 */
import type { PluginContext } from "emdash";
import type { Submission, CreateSubmissionInput, PaginatedResult, Form, CsvRow } from "../types.js";
import { getForm } from "./forms.js";

/**
 * Generates a unique ID for submissions.
 */
function generateSubmissionId(): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).slice(2, 8);
	return `sub_${timestamp}${random}`;
}

/**
 * Creates a new submission.
 *
 * @param ctx - Plugin context
 * @param input - Submission data
 * @returns The created submission
 */
export async function createSubmission(
	ctx: PluginContext,
	input: CreateSubmissionInput
): Promise<Submission> {
	const id = generateSubmissionId();
	const now = new Date().toISOString();

	const submission: Submission = {
		...input,
		id,
		createdAt: now,
	};

	await ctx.storage.submissions.put(id, submission);
	ctx.log.info(`Submission created for form: ${input.formId}`, { submissionId: id });

	return submission;
}

/**
 * Gets a submission by ID.
 *
 * @param ctx - Plugin context
 * @param id - Submission ID
 * @returns The submission or null if not found
 */
export async function getSubmission(ctx: PluginContext, id: string): Promise<Submission | null> {
	return ctx.storage.submissions.get(id) as Promise<Submission | null>;
}

/**
 * Deletes a submission.
 *
 * @param ctx - Plugin context
 * @param id - Submission ID
 * @returns True if deleted, false if not found
 */
export async function deleteSubmission(ctx: PluginContext, id: string): Promise<boolean> {
	const existing = await getSubmission(ctx, id);
	if (!existing) {
		return false;
	}

	await ctx.storage.submissions.delete(id);
	ctx.log.info(`Submission deleted`, { submissionId: id });

	return true;
}

/**
 * Deletes multiple submissions.
 *
 * @param ctx - Plugin context
 * @param ids - Submission IDs
 * @returns Number of deleted submissions
 */
export async function deleteSubmissions(ctx: PluginContext, ids: string[]): Promise<number> {
	const count = await ctx.storage.submissions.deleteMany(ids);
	ctx.log.info(`Deleted ${count} submissions`);
	return count;
}

/**
 * Lists submissions for a form with pagination.
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @param options - Pagination options
 * @returns Paginated list of submissions
 */
export async function listSubmissions(
	ctx: PluginContext,
	formId: string,
	options: { limit?: number; cursor?: string } = {}
): Promise<PaginatedResult<Submission>> {
	const limit = Math.min(Math.max(1, options.limit || 50), 100);

	const result = await ctx.storage.submissions.query({
		where: { formId },
		orderBy: { createdAt: "desc" },
		limit,
		cursor: options.cursor,
	});

	return {
		items: result.items.map((item) => item.data as Submission),
		cursor: result.cursor,
		hasMore: result.hasMore,
	};
}

/**
 * Lists all submissions across all forms with pagination.
 *
 * @param ctx - Plugin context
 * @param options - Pagination options
 * @returns Paginated list of submissions
 */
export async function listAllSubmissions(
	ctx: PluginContext,
	options: { limit?: number; cursor?: string } = {}
): Promise<PaginatedResult<Submission>> {
	const limit = Math.min(Math.max(1, options.limit || 50), 100);

	const result = await ctx.storage.submissions.query({
		orderBy: { createdAt: "desc" },
		limit,
		cursor: options.cursor,
	});

	return {
		items: result.items.map((item) => item.data as Submission),
		cursor: result.cursor,
		hasMore: result.hasMore,
	};
}

/**
 * Gets submission count for a form.
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @returns Number of submissions
 */
export async function getSubmissionCount(ctx: PluginContext, formId: string): Promise<number> {
	return ctx.storage.submissions.count({ formId });
}

/**
 * Gets total submission count across all forms.
 *
 * @param ctx - Plugin context
 * @returns Total number of submissions
 */
export async function getTotalSubmissionCount(ctx: PluginContext): Promise<number> {
	return ctx.storage.submissions.count();
}

/**
 * Escapes a value for CSV output.
 */
function escapeCsvValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}

	const str = String(value);

	// If the value contains quotes, commas, or newlines, wrap it in quotes
	if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
		// Double any existing quotes
		return `"${str.replace(/"/g, '""')}"`;
	}

	return str;
}

/**
 * Converts submissions to CSV format.
 * R-015: CSV export
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @returns CSV string
 */
export async function exportToCsv(ctx: PluginContext, formId: string): Promise<string> {
	// Get the form to determine field structure
	const form = await getForm(ctx, formId);
	if (!form) {
		throw new Error(`Form not found: ${formId}`);
	}

	// Build header row from form fields
	const headers = [
		"Submission ID",
		"Submitted At",
		...form.fields.map((f) => f.label),
	];

	// Fetch all submissions (in batches)
	const rows: CsvRow[] = [];
	let cursor: string | undefined;

	do {
		const result = await ctx.storage.submissions.query({
			where: { formId },
			orderBy: { createdAt: "desc" },
			limit: 100,
			cursor,
		});

		for (const item of result.items) {
			const submission = item.data as Submission;
			const row: CsvRow = {
				"Submission ID": submission.id,
				"Submitted At": submission.createdAt,
			};

			// Map field data to row
			for (const field of form.fields) {
				const value = submission.data[field.id];
				row[field.label] = value !== undefined ? String(value) : "";
			}

			rows.push(row);
		}

		cursor = result.cursor;
	} while (cursor);

	// Build CSV string
	const lines: string[] = [];

	// Header row
	lines.push(headers.map(escapeCsvValue).join(","));

	// Data rows
	for (const row of rows) {
		const values = headers.map((header) => escapeCsvValue(row[header]));
		lines.push(values.join(","));
	}

	ctx.log.info(`CSV export completed for form: ${form.name}`, {
		formId,
		rowCount: rows.length,
	});

	return lines.join("\n");
}

/**
 * Validates submission data against form fields.
 *
 * @param form - The form definition
 * @param data - Submission data
 * @returns Validation result with errors
 */
export function validateSubmission(
	form: Form,
	data: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
	const errors: Record<string, string> = {};

	for (const field of form.fields) {
		const value = data[field.id];

		// Check required fields
		if (field.required) {
			if (value === undefined || value === null || value === "") {
				errors[field.id] = `${field.label} is required`;
				continue;
			}
		}

		// Skip validation if field is empty and not required
		if (value === undefined || value === null || value === "") {
			continue;
		}

		// Type-specific validation
		switch (field.type) {
			case "email":
				if (typeof value === "string" && !isValidEmail(value)) {
					errors[field.id] = `Please enter a valid email address`;
				}
				break;

			case "number":
				if (typeof value === "string" && isNaN(Number(value))) {
					errors[field.id] = `Please enter a valid number`;
				}
				break;

			case "tel":
				if (typeof value === "string" && !isValidPhone(value)) {
					errors[field.id] = `Please enter a valid phone number`;
				}
				break;

			case "select":
			case "radio":
				if (field.options && !field.options.some((o) => o.value === value)) {
					errors[field.id] = `Please select a valid option`;
				}
				break;

			case "checkbox":
				if (Array.isArray(value) && field.options) {
					const validValues = field.options.map((o) => o.value);
					const invalid = value.filter((v) => !validValues.includes(String(v)));
					if (invalid.length > 0) {
						errors[field.id] = `Invalid options selected`;
					}
				}
				break;
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
	};
}

/**
 * Simple email validation.
 */
function isValidEmail(email: string): boolean {
	// Basic email regex - not meant to be comprehensive
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Simple phone validation.
 */
function isValidPhone(phone: string): boolean {
	// Accept various phone formats - digits, spaces, dashes, parentheses, plus
	const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, "");
	return /^\d{7,15}$/.test(cleaned);
}

/**
 * Gets recent submissions across all forms.
 *
 * @param ctx - Plugin context
 * @param limit - Number of submissions to return
 * @returns Recent submissions with form names
 */
export async function getRecentSubmissions(
	ctx: PluginContext,
	limit: number = 10
): Promise<Array<Submission & { formName?: string }>> {
	const result = await ctx.storage.submissions.query({
		orderBy: { createdAt: "desc" },
		limit: Math.min(limit, 50),
	});

	// Get unique form IDs
	const formIds = [...new Set(result.items.map((item) => (item.data as Submission).formId))];

	// Fetch form names
	const formNames = new Map<string, string>();
	const forms = await ctx.storage.forms.getMany(formIds);
	for (const [id, form] of forms) {
		formNames.set(id, (form as Form).name);
	}

	// Add form names to submissions
	return result.items.map((item) => {
		const submission = item.data as Submission;
		return {
			...submission,
			formName: formNames.get(submission.formId),
		};
	});
}
