/**
 * Forge - Form CRUD Handlers
 *
 * R-011: Form CRUD operations
 */
import type { PluginContext } from "emdash";
import type { Form, CreateFormInput, UpdateFormInput, PaginatedResult, FormField } from "../types.js";
import { DEFAULT_THEME, CONTACT_FORM_TEMPLATE } from "../types.js";
import { inferFieldType, suggestPlaceholder } from "../inference/field-type.js";

/**
 * Generates a unique ID for forms and fields.
 */
export function generateId(prefix: string = ""): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).slice(2, 8);
	return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

/**
 * Generates a URL-friendly slug from a name.
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

/**
 * Creates a new form.
 *
 * @param ctx - Plugin context
 * @param input - Form data without auto-generated fields
 * @returns The created form
 */
export async function createForm(ctx: PluginContext, input: CreateFormInput): Promise<Form> {
	const now = new Date().toISOString();
	const id = generateId("form");

	const form: Form = {
		...input,
		id,
		slug: input.slug || generateSlug(input.name),
		theme: input.theme || DEFAULT_THEME,
		submitButtonText: input.submitButtonText || "Submit",
		successMessage: input.successMessage || "Thank you for your submission!",
		published: input.published ?? false,
		createdAt: now,
		updatedAt: now,
	};

	await ctx.storage.forms.put(id, form);
	ctx.log.info(`Form created: ${form.name}`, { formId: id });

	return form;
}

/**
 * Creates a form from the Contact Form template.
 * R-016: One template - Contact Form
 *
 * @param ctx - Plugin context
 * @param overrides - Optional field overrides
 * @returns The created form
 */
export async function createFromTemplate(
	ctx: PluginContext,
	overrides?: Partial<CreateFormInput>
): Promise<Form> {
	const input: CreateFormInput = {
		...CONTACT_FORM_TEMPLATE,
		...overrides,
		// Generate unique IDs for fields
		fields: CONTACT_FORM_TEMPLATE.fields.map((field) => ({
			...field,
			id: generateId("field"),
		})),
	};

	return createForm(ctx, input);
}

/**
 * Gets a form by ID.
 *
 * @param ctx - Plugin context
 * @param id - Form ID
 * @returns The form or null if not found
 */
export async function getForm(ctx: PluginContext, id: string): Promise<Form | null> {
	return ctx.storage.forms.get(id) as Promise<Form | null>;
}

/**
 * Gets a form by slug.
 *
 * @param ctx - Plugin context
 * @param slug - Form slug
 * @returns The form or null if not found
 */
export async function getFormBySlug(ctx: PluginContext, slug: string): Promise<Form | null> {
	const result = await ctx.storage.forms.query({
		where: { slug },
		limit: 1,
	});

	if (result.items.length === 0) {
		return null;
	}

	return result.items[0].data as Form;
}

/**
 * Updates an existing form.
 *
 * @param ctx - Plugin context
 * @param id - Form ID
 * @param input - Fields to update
 * @returns The updated form or null if not found
 */
export async function updateForm(
	ctx: PluginContext,
	id: string,
	input: UpdateFormInput
): Promise<Form | null> {
	const existing = await getForm(ctx, id);
	if (!existing) {
		return null;
	}

	const updated: Form = {
		...existing,
		...input,
		id, // Preserve ID
		createdAt: existing.createdAt, // Preserve creation time
		updatedAt: new Date().toISOString(),
	};

	await ctx.storage.forms.put(id, updated);
	ctx.log.info(`Form updated: ${updated.name}`, { formId: id });

	return updated;
}

/**
 * Deletes a form and optionally its submissions.
 *
 * @param ctx - Plugin context
 * @param id - Form ID
 * @param deleteSubmissions - Whether to delete associated submissions
 * @returns True if deleted, false if not found
 */
export async function deleteForm(
	ctx: PluginContext,
	id: string,
	deleteSubmissions: boolean = false
): Promise<boolean> {
	const existing = await getForm(ctx, id);
	if (!existing) {
		return false;
	}

	// Delete submissions if requested
	if (deleteSubmissions) {
		let cursor: string | undefined;
		do {
			const submissions = await ctx.storage.submissions.query({
				where: { formId: id },
				limit: 100,
				cursor,
			});

			if (submissions.items.length > 0) {
				await ctx.storage.submissions.deleteMany(submissions.items.map((s) => s.id));
			}

			cursor = submissions.cursor;
		} while (cursor);
	}

	await ctx.storage.forms.delete(id);
	ctx.log.info(`Form deleted: ${existing.name}`, { formId: id });

	return true;
}

/**
 * Lists all forms with pagination.
 *
 * @param ctx - Plugin context
 * @param options - Pagination options
 * @returns Paginated list of forms
 */
export async function listForms(
	ctx: PluginContext,
	options: { limit?: number; cursor?: string } = {}
): Promise<PaginatedResult<Form>> {
	const limit = Math.min(Math.max(1, options.limit || 50), 100);

	const result = await ctx.storage.forms.query({
		orderBy: { createdAt: "desc" },
		limit,
		cursor: options.cursor,
	});

	return {
		items: result.items.map((item) => item.data as Form),
		cursor: result.cursor,
		hasMore: result.hasMore,
	};
}

/**
 * Adds a field to a form using natural language inference.
 * R-004: "Ask something" field creation
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @param prompt - Natural language prompt (e.g., "What's your email?")
 * @returns The created field with inference result
 */
export async function addFieldFromPrompt(
	ctx: PluginContext,
	formId: string,
	prompt: string
): Promise<{ form: Form; field: FormField; confidence: "high" | "medium" | "low" } | null> {
	const form = await getForm(ctx, formId);
	if (!form) {
		return null;
	}

	// Infer field type from prompt
	const inferred = inferFieldType(prompt);

	// Create the new field
	const newField: FormField = {
		id: generateId("field"),
		type: inferred.type,
		label: inferred.label,
		placeholder: inferred.placeholder || suggestPlaceholder(inferred.type, inferred.label),
		required: false,
		prompt, // Store original prompt for reference
		order: form.fields.length,
	};

	// Add to form
	const updatedForm = await updateForm(ctx, formId, {
		fields: [...form.fields, newField],
	});

	if (!updatedForm) {
		return null;
	}

	ctx.log.info(`Field added from prompt: "${prompt}" -> ${inferred.type}`, {
		formId,
		fieldId: newField.id,
		confidence: inferred.confidence,
	});

	return {
		form: updatedForm,
		field: newField,
		confidence: inferred.confidence,
	};
}

/**
 * Updates a field's type (for override UI).
 * R-024: Field type override UI
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @param fieldId - Field ID
 * @param updates - Field updates
 * @returns The updated form or null
 */
export async function updateField(
	ctx: PluginContext,
	formId: string,
	fieldId: string,
	updates: Partial<FormField>
): Promise<Form | null> {
	const form = await getForm(ctx, formId);
	if (!form) {
		return null;
	}

	const fieldIndex = form.fields.findIndex((f) => f.id === fieldId);
	if (fieldIndex === -1) {
		return null;
	}

	const updatedFields = [...form.fields];
	updatedFields[fieldIndex] = {
		...updatedFields[fieldIndex],
		...updates,
		id: fieldId, // Preserve ID
	};

	return updateForm(ctx, formId, { fields: updatedFields });
}

/**
 * Removes a field from a form.
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @param fieldId - Field ID
 * @returns The updated form or null
 */
export async function removeField(
	ctx: PluginContext,
	formId: string,
	fieldId: string
): Promise<Form | null> {
	const form = await getForm(ctx, formId);
	if (!form) {
		return null;
	}

	const updatedFields = form.fields
		.filter((f) => f.id !== fieldId)
		.map((f, i) => ({ ...f, order: i })); // Reorder

	return updateForm(ctx, formId, { fields: updatedFields });
}

/**
 * Reorders fields in a form.
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @param fieldIds - Ordered array of field IDs
 * @returns The updated form or null
 */
export async function reorderFields(
	ctx: PluginContext,
	formId: string,
	fieldIds: string[]
): Promise<Form | null> {
	const form = await getForm(ctx, formId);
	if (!form) {
		return null;
	}

	// Create a map of current fields
	const fieldMap = new Map(form.fields.map((f) => [f.id, f]));

	// Reorder based on provided IDs
	const reorderedFields: FormField[] = [];
	for (let i = 0; i < fieldIds.length; i++) {
		const field = fieldMap.get(fieldIds[i]);
		if (field) {
			reorderedFields.push({ ...field, order: i });
		}
	}

	// Add any fields not in the provided list at the end
	for (const field of form.fields) {
		if (!fieldIds.includes(field.id)) {
			reorderedFields.push({ ...field, order: reorderedFields.length });
		}
	}

	return updateForm(ctx, formId, { fields: reorderedFields });
}

/**
 * Gets form statistics.
 *
 * @param ctx - Plugin context
 * @param formId - Form ID
 * @returns Form statistics
 */
export async function getFormStats(
	ctx: PluginContext,
	formId: string
): Promise<{ submissionCount: number; lastSubmission?: string } | null> {
	const form = await getForm(ctx, formId);
	if (!form) {
		return null;
	}

	const count = await ctx.storage.submissions.count({ formId });

	// Get most recent submission
	const recent = await ctx.storage.submissions.query({
		where: { formId },
		orderBy: { createdAt: "desc" },
		limit: 1,
	});

	return {
		submissionCount: count,
		lastSubmission: recent.items[0]?.data?.createdAt as string | undefined,
	};
}
