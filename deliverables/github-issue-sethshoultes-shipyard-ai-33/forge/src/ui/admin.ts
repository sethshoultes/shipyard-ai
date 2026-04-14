/**
 * Forge - Block Kit Admin UI
 *
 * R-026: Inline WYSIWYG form editor (via Block Kit)
 */
import type { Form, Submission, FormField, FieldType } from "../types.js";
import { getAvailableFieldTypes, getConfidenceDescription } from "../inference/field-type.js";

/**
 * Block Kit types for admin UI.
 */
interface Block {
	type: string;
	[key: string]: unknown;
}

interface BlockResponse {
	blocks: Block[];
	toast?: { message: string; type: "success" | "error" | "info" };
}

/**
 * Builds the forms list page.
 */
export function buildFormsListPage(
	forms: Form[],
	stats: Map<string, { submissionCount: number }>
): BlockResponse {
	const blocks: Block[] = [
		{
			type: "header",
			text: "Forms",
		},
		{
			type: "actions",
			elements: [
				{
					type: "button",
					text: "Create New Form",
					action_id: "create_form",
					style: "primary",
				},
				{
					type: "button",
					text: "Create from Template",
					action_id: "create_from_template",
				},
			],
		},
	];

	if (forms.length === 0) {
		blocks.push({
			type: "section",
			text: "No forms yet. Create your first form to get started!",
		});
	} else {
		blocks.push({
			type: "table",
			block_id: "forms-table",
			columns: [
				{ key: "name", label: "Form Name" },
				{ key: "fields", label: "Fields" },
				{ key: "submissions", label: "Submissions" },
				{ key: "status", label: "Status", format: "badge" },
				{ key: "updated", label: "Last Updated", format: "relative_time" },
			],
			rows: forms.map((form) => ({
				id: form.id,
				name: form.name,
				fields: form.fields.length,
				submissions: stats.get(form.id)?.submissionCount ?? 0,
				status: form.published ? "Published" : "Draft",
				updated: form.updatedAt,
			})),
			actions: [
				{ action_id: "edit_form", label: "Edit", icon: "edit" },
				{ action_id: "view_submissions", label: "Submissions", icon: "inbox" },
				{
					action_id: "delete_form",
					label: "Delete",
					icon: "trash",
					style: "danger",
					confirm: {
						title: "Delete Form?",
						text: "This will permanently delete the form. Submissions will not be deleted.",
						confirm: "Delete",
						deny: "Cancel",
					},
				},
			],
		});
	}

	return { blocks };
}

/**
 * Builds the form editor page.
 * R-026: Inline WYSIWYG form editor
 */
export function buildFormEditorPage(
	form: Form | null,
	inferenceResult?: { field: FormField; confidence: "high" | "medium" | "low" }
): BlockResponse {
	const isNew = !form;
	const blocks: Block[] = [];

	// Header
	blocks.push({
		type: "header",
		text: isNew ? "Create New Form" : `Edit: ${form?.name}`,
	});

	// Form settings
	blocks.push({
		type: "form",
		block_id: "form-settings",
		fields: [
			{
				type: "text_input",
				action_id: "name",
				label: "Form Name",
				initial_value: form?.name ?? "",
				placeholder: "Contact Form",
			},
			{
				type: "text_input",
				action_id: "description",
				label: "Description",
				initial_value: form?.description ?? "",
				placeholder: "A brief description of your form",
			},
			{
				type: "text_input",
				action_id: "notification_email",
				label: "Notification Email",
				initial_value: form?.notificationEmail ?? "",
				placeholder: "admin@example.com",
			},
		],
	});

	blocks.push({ type: "divider" });

	// Theme settings
	// R-018, R-019, R-020: Primary color and logo only
	blocks.push({
		type: "header",
		text: "Theme",
	});

	blocks.push({
		type: "form",
		block_id: "theme-settings",
		fields: [
			{
				type: "text_input",
				action_id: "primary_color",
				label: "Primary Color",
				initial_value: form?.theme.primaryColor ?? "#3B82F6",
				placeholder: "#3B82F6",
			},
			{
				type: "text_input",
				action_id: "logo_url",
				label: "Logo URL",
				initial_value: form?.theme.logoUrl ?? "",
				placeholder: "https://example.com/logo.png",
			},
		],
	});

	blocks.push({ type: "divider" });

	// Fields section
	// R-004: "Ask something" field creation
	blocks.push({
		type: "header",
		text: "Fields",
	});

	// "Ask something" input
	blocks.push({
		type: "section",
		text: "Add a field by describing what you want to ask:",
	});

	blocks.push({
		type: "form",
		block_id: "ask-something",
		fields: [
			{
				type: "text_input",
				action_id: "prompt",
				label: "Ask something...",
				placeholder: "What's your email address?",
			},
		],
		submit: { label: "Add Field", action_id: "add_field_from_prompt" },
	});

	// R-025: Visual feedback on inference
	if (inferenceResult) {
		blocks.push({
			type: "banner",
			variant: inferenceResult.confidence === "low" ? "alert" : "default",
			title: `Field created: ${inferenceResult.field.label}`,
			description: `Type: ${inferenceResult.field.type}. ${getConfidenceDescription(inferenceResult.confidence)}`,
		});
	}

	// Existing fields
	if (form && form.fields.length > 0) {
		blocks.push({
			type: "context",
			text: `${form.fields.length} field${form.fields.length === 1 ? "" : "s"} - drag to reorder`,
		});

		for (const field of form.fields) {
			blocks.push(buildFieldBlock(field, form.id));
		}
	} else if (!isNew) {
		blocks.push({
			type: "context",
			text: "No fields yet. Use the input above to add your first field.",
		});
	}

	blocks.push({ type: "divider" });

	// Submit settings
	blocks.push({
		type: "header",
		text: "Submit Button & Success Message",
	});

	blocks.push({
		type: "form",
		block_id: "submit-settings",
		fields: [
			{
				type: "text_input",
				action_id: "submit_button_text",
				label: "Submit Button Text",
				initial_value: form?.submitButtonText ?? "Submit",
			},
			{
				type: "text_input",
				action_id: "success_message",
				label: "Success Message",
				initial_value: form?.successMessage ?? "Thank you for your submission!",
			},
		],
	});

	// Action buttons
	blocks.push({
		type: "actions",
		elements: [
			{
				type: "button",
				text: "Save Draft",
				action_id: "save_form",
				style: "primary",
			},
			{
				type: "button",
				text: form?.published ? "Unpublish" : "Publish",
				action_id: "toggle_publish",
			},
			{
				type: "button",
				text: "Cancel",
				action_id: "cancel_edit",
			},
		],
	});

	return { blocks };
}

/**
 * Builds a Block Kit representation of a form field.
 * R-024: Field type override UI
 */
function buildFieldBlock(field: FormField, formId: string): Block {
	const fieldTypes = getAvailableFieldTypes();

	return {
		type: "form",
		block_id: `field-${field.id}`,
		fields: [
			{
				type: "text_input",
				action_id: `field_label_${field.id}`,
				label: "Label",
				initial_value: field.label,
			},
			{
				type: "select",
				action_id: `field_type_${field.id}`,
				label: "Type",
				initial_value: field.type,
				options: fieldTypes.map((ft) => ({
					label: ft.label,
					value: ft.type,
				})),
			},
			{
				type: "text_input",
				action_id: `field_placeholder_${field.id}`,
				label: "Placeholder",
				initial_value: field.placeholder ?? "",
			},
			{
				type: "toggle",
				action_id: `field_required_${field.id}`,
				label: "Required",
				initial_value: field.required,
			},
		],
		accessory: {
			type: "button",
			text: "Remove",
			action_id: `remove_field_${field.id}`,
			style: "danger",
			confirm: {
				title: "Remove Field?",
				text: `Are you sure you want to remove "${field.label}"?`,
				confirm: "Remove",
				deny: "Cancel",
			},
		},
	};
}

/**
 * Builds the submissions list page.
 */
export function buildSubmissionsListPage(
	submissions: Array<Submission & { formName?: string }>,
	forms: Form[],
	selectedFormId?: string
): BlockResponse {
	const blocks: Block[] = [
		{
			type: "header",
			text: "Submissions",
		},
	];

	// Form filter
	blocks.push({
		type: "form",
		block_id: "submission-filter",
		fields: [
			{
				type: "select",
				action_id: "form_filter",
				label: "Filter by Form",
				initial_value: selectedFormId ?? "all",
				options: [
					{ label: "All Forms", value: "all" },
					...forms.map((f) => ({ label: f.name, value: f.id })),
				],
			},
		],
	});

	if (submissions.length === 0) {
		blocks.push({
			type: "section",
			text: "No submissions yet.",
		});
	} else {
		// Actions
		blocks.push({
			type: "actions",
			elements: [
				{
					type: "button",
					text: "Export CSV",
					action_id: "export_csv",
					style: "primary",
				},
				{
					type: "button",
					text: "Delete Selected",
					action_id: "delete_selected",
					style: "danger",
					confirm: {
						title: "Delete Submissions?",
						text: "This action cannot be undone.",
						confirm: "Delete",
						deny: "Cancel",
					},
				},
			],
		});

		// Submissions table
		blocks.push({
			type: "table",
			block_id: "submissions-table",
			columns: [
				{ key: "form", label: "Form" },
				{ key: "preview", label: "Preview" },
				{ key: "date", label: "Submitted", format: "relative_time" },
			],
			rows: submissions.map((sub) => ({
				id: sub.id,
				form: sub.formName ?? sub.formId,
				preview: getSubmissionPreview(sub),
				date: sub.createdAt,
			})),
			selectable: true,
			actions: [
				{ action_id: "view_submission", label: "View", icon: "eye" },
				{
					action_id: "delete_submission",
					label: "Delete",
					icon: "trash",
					style: "danger",
				},
			],
		});
	}

	return { blocks };
}

/**
 * Gets a preview string from submission data.
 */
function getSubmissionPreview(submission: Submission): string {
	const values = Object.values(submission.data);
	const preview = values
		.filter((v) => v !== null && v !== undefined)
		.map((v) => String(v))
		.join(" | ")
		.slice(0, 100);

	return preview.length === 100 ? `${preview}...` : preview;
}

/**
 * Builds the submission detail view.
 */
export function buildSubmissionDetailPage(
	submission: Submission,
	form: Form
): BlockResponse {
	const blocks: Block[] = [
		{
			type: "header",
			text: `Submission: ${form.name}`,
		},
		{
			type: "fields",
			fields: [
				{ label: "Submitted", value: new Date(submission.createdAt).toLocaleString() },
				{ label: "Submission ID", value: submission.id },
			],
		},
		{ type: "divider" },
	];

	// Submission data
	for (const field of form.fields) {
		const value = submission.data[field.id];
		blocks.push({
			type: "fields",
			fields: [
				{
					label: field.label,
					value: formatFieldValue(value, field.type),
				},
			],
		});
	}

	blocks.push({ type: "divider" });

	// Actions
	blocks.push({
		type: "actions",
		elements: [
			{
				type: "button",
				text: "Back to Submissions",
				action_id: "back_to_submissions",
			},
			{
				type: "button",
				text: "Delete",
				action_id: "delete_submission",
				style: "danger",
				confirm: {
					title: "Delete Submission?",
					text: "This action cannot be undone.",
					confirm: "Delete",
					deny: "Cancel",
				},
			},
		],
	});

	return { blocks };
}

/**
 * Formats a field value for display.
 */
function formatFieldValue(value: unknown, type: FieldType): string {
	if (value === null || value === undefined || value === "") {
		return "(not provided)";
	}

	if (Array.isArray(value)) {
		return value.join(", ");
	}

	return String(value);
}

/**
 * Builds the recent submissions widget for the dashboard.
 */
export function buildRecentSubmissionsWidget(
	submissions: Array<Submission & { formName?: string }>
): BlockResponse {
	if (submissions.length === 0) {
		return {
			blocks: [
				{
					type: "section",
					text: "No submissions yet.",
				},
			],
		};
	}

	return {
		blocks: [
			{
				type: "table",
				block_id: "recent-submissions-widget",
				columns: [
					{ key: "form", label: "Form" },
					{ key: "date", label: "When", format: "relative_time" },
				],
				rows: submissions.slice(0, 5).map((sub) => ({
					id: sub.id,
					form: sub.formName ?? sub.formId,
					date: sub.createdAt,
				})),
			},
		],
	};
}

/**
 * Builds the form stats widget for the dashboard.
 */
export function buildFormStatsWidget(
	totalForms: number,
	totalSubmissions: number,
	recentSubmissionCount: number
): BlockResponse {
	return {
		blocks: [
			{
				type: "stats",
				stats: [
					{ label: "Total Forms", value: String(totalForms) },
					{ label: "Total Submissions", value: String(totalSubmissions) },
					{
						label: "Last 7 Days",
						value: String(recentSubmissionCount),
						trend: recentSubmissionCount > 0 ? "active" : undefined,
					},
				],
			},
		],
	};
}

/**
 * Builds the settings page.
 */
export function buildSettingsPage(settings: {
	defaultFromEmail?: string;
	emailEnabled: boolean;
}): BlockResponse {
	const blocks: Block[] = [
		{
			type: "header",
			text: "Forge Settings",
		},
	];

	// Email status
	if (!settings.emailEnabled) {
		blocks.push({
			type: "banner",
			variant: "alert",
			title: "Email Notifications Unavailable",
			description: "No email provider is configured. Install an email plugin (like Resend or SMTP) to enable submission notifications.",
		});
	}

	blocks.push({
		type: "form",
		block_id: "forge-settings",
		fields: [
			{
				type: "text_input",
				action_id: "default_from_email",
				label: "Default From Email",
				initial_value: settings.defaultFromEmail ?? "",
				placeholder: "noreply@example.com",
				description: "Default sender address for notification emails",
			},
		],
		submit: { label: "Save Settings", action_id: "save_settings" },
	});

	return { blocks };
}
