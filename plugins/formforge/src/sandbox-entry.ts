import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	sendEmail,
	generateSubmissionNotificationHTML,
	generateAutoResponseHTML,
} from "./email";

// ============================================================================
// Type Definitions
// ============================================================================

export type FieldType =
	| "text"
	| "email"
	| "textarea"
	| "number"
	| "phone"
	| "date"
	| "dropdown"
	| "radio"
	| "checkbox"
	| "hidden";

export interface ConditionalRule {
	fieldId: string;
	operator: "equals";
	value: string;
}

export interface FormFieldDefinition {
	id: string;
	type: FieldType;
	label: string;
	placeholder?: string;
	required: boolean;
	options?: string[]; // For dropdown, radio
	defaultValue?: string;
	showWhen?: ConditionalRule; // Conditional visibility
}

export interface WebhookEndpoint {
	url: string;
	secret?: string;
	events: string[];
}

export interface FormDefinition {
	id: string;
	name: string;
	description?: string;
	fields: FormFieldDefinition[];
	steps?: { name: string; fieldIds: string[] }[];
	notifyEmails?: string[];
	webhooks?: WebhookEndpoint[];
	autoResponse?: {
		enabled: boolean;
		subject: string;
		body: string;
	};
	createdAt: string;
	updatedAt: string;
	totalSubmissions: number;
	submissionsThisWeek: number;
	lastSubmissionAt?: string;
}

export interface FormSubmission {
	id: string;
	formId: string;
	data: Record<string, string>;
	submittedAt: string;
	ip?: string;
}

export interface FormSettings {
	maxFieldsPerForm: number;
	maxSubmissionSizeBytes: number;
	rateLimitPerWindow: number;
	rateLimitWindowMinutes: number;
}

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_SETTINGS: FormSettings = {
	maxFieldsPerForm: 50,
	maxSubmissionSizeBytes: 51200, // 50KB
	rateLimitPerWindow: 5,
	rateLimitWindowMinutes: 15,
};

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function errorResponse(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

// ============================================================================
// Template Definitions
// ============================================================================

function getTemplate(templateName: string): Omit<FormDefinition, "id" | "createdAt" | "updatedAt" | "totalSubmissions" | "submissionsThisWeek"> | null {
	const templates: Record<string, Omit<FormDefinition, "id" | "createdAt" | "updatedAt" | "totalSubmissions" | "submissionsThisWeek">> = {
		contact: {
			name: "Contact Form",
			description: "Simple contact form for general inquiries",
			fields: [
				{ id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
				{ id: "email", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
				{ id: "subject", type: "text", label: "Subject", placeholder: "What is this about?", required: true },
				{ id: "message", type: "textarea", label: "Message", placeholder: "Your message...", required: true },
			],
		},
		booking: {
			name: "Booking Request",
			description: "Appointment or booking request form",
			fields: [
				{ id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
				{ id: "email", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
				{ id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: true },
				{ id: "date", type: "date", label: "Preferred Date", required: true },
				{ id: "time", type: "dropdown", label: "Preferred Time", required: true, options: ["Morning", "Afternoon", "Evening"] },
				{ id: "notes", type: "textarea", label: "Additional Notes", placeholder: "Any special requests?", required: false },
			],
		},
		feedback: {
			name: "Feedback Survey",
			description: "Collect customer feedback and ratings",
			fields: [
				{ id: "name", type: "text", label: "Your Name", placeholder: "Optional", required: false },
				{ id: "rating", type: "radio", label: "How would you rate your experience?", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
				{ id: "comments", type: "textarea", label: "Comments", placeholder: "Tell us more...", required: false },
			],
		},
		"quote-request": {
			name: "Quote Request",
			description: "Request a custom price quote",
			fields: [
				{ id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
				{ id: "email", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
				{ id: "phone", type: "phone", label: "Phone Number", placeholder: "(555) 123-4567", required: true },
				{ id: "service", type: "dropdown", label: "Service Needed", required: true, options: ["Consultation", "Installation", "Repair", "Custom Project", "Other"] },
				{ id: "budget", type: "dropdown", label: "Budget Range", required: true, options: ["Under $500", "$500-$1,000", "$1,000-$5,000", "$5,000-$10,000", "Over $10,000"] },
				{ id: "details", type: "textarea", label: "Project Details", placeholder: "Describe your project...", required: true },
			],
		},
	};

	return templates[templateName] ?? null;
}

// ============================================================================
// Conditional Logic Evaluation
// ============================================================================

function isFieldVisible(
	field: FormFieldDefinition,
	submissionData: Record<string, string>
): boolean {
	if (!field.showWhen) return true;
	const { fieldId, value } = field.showWhen;
	return submissionData[fieldId] === value;
}

// ============================================================================
// Route Handlers
// ============================================================================

async function getFormFromKV(kv: PluginContext["kv"], formId: string): Promise<FormDefinition | null> {
	const json = await kv.get<string>(`form:${formId}`);
	if (!json) return null;
	try {
		return JSON.parse(json) as FormDefinition;
	} catch {
		return null;
	}
}

async function getFormList(kv: PluginContext["kv"]): Promise<string[]> {
	const json = await kv.get<string>("forms:list");
	if (!json) return [];
	try {
		return JSON.parse(json) as string[];
	} catch {
		return [];
	}
}

async function saveForm(kv: PluginContext["kv"], form: FormDefinition): Promise<void> {
	await kv.set(`form:${form.id}`, JSON.stringify(form));
}

async function addToFormList(kv: PluginContext["kv"], formId: string): Promise<void> {
	const list = await getFormList(kv);
	if (!list.includes(formId)) {
		list.push(formId);
		await kv.set("forms:list", JSON.stringify(list));
	}
}

async function removeFromFormList(kv: PluginContext["kv"], formId: string): Promise<void> {
	const list = await getFormList(kv);
	const filtered = list.filter((id) => id !== formId);
	await kv.set("forms:list", JSON.stringify(filtered));
}

async function getSubmissionList(kv: PluginContext["kv"], formId: string): Promise<string[]> {
	const json = await kv.get<string>(`submissions:${formId}:list`);
	if (!json) return [];
	try {
		return JSON.parse(json) as string[];
	} catch {
		return [];
	}
}

async function getSettings(kv: PluginContext["kv"]): Promise<FormSettings> {
	const json = await kv.get<string>("settings:formforge");
	if (!json) return DEFAULT_SETTINGS;
	try {
		return { ...DEFAULT_SETTINGS, ...JSON.parse(json) } as FormSettings;
	} catch {
		return DEFAULT_SETTINGS;
	}
}

// ============================================================================
// Plugin Definition
// ============================================================================

export default definePlugin({
	hooks: {},
	routes: {
		// ====================================================================
		// Form CRUD
		// ====================================================================

		createForm: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const { name, description, fields } = routeCtx.input;

				if (!name || typeof name !== "string" || !name.trim()) {
					throw errorResponse("Form name is required", 400);
				}

				if (!fields || !Array.isArray(fields) || fields.length === 0) {
					throw errorResponse("Form must have at least one field", 400);
				}

				const settings = await getSettings(ctx.kv);
				if (fields.length > settings.maxFieldsPerForm) {
					throw errorResponse(
						`Form cannot have more than ${settings.maxFieldsPerForm} fields`,
						400
					);
				}

				const id = generateId();
				const now = new Date().toISOString();

				const form: FormDefinition = {
					id,
					name: name.trim(),
					description: description || undefined,
					fields,
					createdAt: now,
					updatedAt: now,
					totalSubmissions: 0,
					submissionsThisWeek: 0,
				};

				await saveForm(ctx.kv, form);
				await addToFormList(ctx.kv, id);

				ctx.log.info(`Form created: ${id} "${name}"`);
				return { success: true, formId: id };
			},
		},

		updateForm: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.pathParams?.id || routeCtx.input?.id;
				if (!formId) throw errorResponse("Form ID is required", 400);

				const existing = await getFormFromKV(ctx.kv, formId);
				if (!existing) {
					throw errorResponse("Form not found", 404);
				}

				const updates = routeCtx.input;
				const settings = await getSettings(ctx.kv);

				if (updates.fields && Array.isArray(updates.fields)) {
					if (updates.fields.length === 0) {
						throw errorResponse("Form must have at least one field", 400);
					}
					if (updates.fields.length > settings.maxFieldsPerForm) {
						throw errorResponse(
							`Form cannot have more than ${settings.maxFieldsPerForm} fields`,
							400
						);
					}
				}

				const updated: FormDefinition = {
					...existing,
					...(updates.name && { name: updates.name.trim() }),
					...(updates.description !== undefined && { description: updates.description }),
					...(updates.fields && { fields: updates.fields }),
					...(updates.notifyEmails && { notifyEmails: updates.notifyEmails }),
					...(updates.webhooks && { webhooks: updates.webhooks }),
					...(updates.autoResponse !== undefined && { autoResponse: updates.autoResponse }),
					...(updates.steps !== undefined && { steps: updates.steps }),
					updatedAt: new Date().toISOString(),
				};

				await saveForm(ctx.kv, updated);
				ctx.log.info(`Form updated: ${formId}`);
				return { success: true, form: updated };
			},
		},

		deleteForm: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.pathParams?.id || routeCtx.input?.id;
				if (!formId) throw errorResponse("Form ID is required", 400);

				const existing = await getFormFromKV(ctx.kv, formId);
				if (!existing) {
					throw errorResponse("Form not found", 404);
				}

				// Delete all submissions for this form
				const submissionIds = await getSubmissionList(ctx.kv, formId);
				for (const subId of submissionIds) {
					await ctx.kv.delete(`submission:${formId}:${subId}`);
				}
				await ctx.kv.delete(`submissions:${formId}:list`);

				// Delete the form itself
				await ctx.kv.delete(`form:${formId}`);
				await removeFromFormList(ctx.kv, formId);

				// Clean up analytics
				await ctx.kv.delete(`form-analytics:${formId}`);

				ctx.log.info(`Form deleted: ${formId} (${submissionIds.length} submissions removed)`);
				return { success: true, deletedSubmissions: submissionIds.length };
			},
		},

		getForm: {
			handler: async (routeCtx: any, ctx: any) => {
				const formId = routeCtx.pathParams?.id || routeCtx.input?.id;
				if (!formId) throw errorResponse("Form ID is required", 400);

				const form = await getFormFromKV(ctx.kv, formId);
				if (!form) {
					throw errorResponse("Form not found", 404);
				}

				return { success: true, form };
			},
		},

		listForms: {
			handler: async (_routeCtx: any, ctx: any) => {
				const formIds = await getFormList(ctx.kv);
				const forms: Array<FormDefinition & { submissionCount: number }> = [];

				for (const id of formIds) {
					const form = await getFormFromKV(ctx.kv, id);
					if (form) {
						const submissionIds = await getSubmissionList(ctx.kv, id);
						forms.push({ ...form, submissionCount: submissionIds.length });
					}
				}

				return { success: true, forms, total: forms.length };
			},
		},

		// ====================================================================
		// Templates
		// ====================================================================

		createFromTemplate: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const { template: templateName, name: customName } = routeCtx.input;

				if (!templateName) {
					throw errorResponse("Template name is required", 400);
				}

				const template = getTemplate(templateName);
				if (!template) {
					throw errorResponse(
						`Invalid template: "${templateName}". Valid templates: contact, booking, feedback, quote-request`,
						400
					);
				}

				const id = generateId();
				const now = new Date().toISOString();

				const form: FormDefinition = {
					id,
					name: customName || template.name,
					description: template.description,
					fields: template.fields,
					createdAt: now,
					updatedAt: now,
					totalSubmissions: 0,
					submissionsThisWeek: 0,
				};

				await saveForm(ctx.kv, form);
				await addToFormList(ctx.kv, id);

				ctx.log.info(`Form created from template "${templateName}": ${id}`);
				return { success: true, formId: id, form };
			},
		},

		// ====================================================================
		// Submission Engine
		// ====================================================================

		submitForm: {
			public: true,
			handler: async (routeCtx: any, ctx: any) => {
				const formId = routeCtx.pathParams?.id || routeCtx.input?.formId;
				if (!formId) throw errorResponse("Form ID is required", 400);

				const form = await getFormFromKV(ctx.kv, formId);
				if (!form) {
					throw errorResponse("Form not found", 404);
				}

				const submissionData: Record<string, string> = routeCtx.input?.data || {};
				const ip = routeCtx.input?._ip || "unknown";

				// Check submission size
				const submissionSize = JSON.stringify(submissionData).length;
				const settings = await getSettings(ctx.kv);
				if (submissionSize > settings.maxSubmissionSizeBytes) {
					throw errorResponse("Submission too large", 413);
				}

				// Honeypot check -- if filled, return fake success
				if (routeCtx.input?._hp && routeCtx.input._hp.trim() !== "") {
					ctx.log.info(`Honeypot triggered for form ${formId}`);
					return { success: true, submissionId: "fake-" + generateId() };
				}

				// Rate limiting
				const rateLimitKey = `rate-limit:${formId}:${ip}`;
				const currentCountJson = await ctx.kv.get<string>(rateLimitKey);
				const currentCount = currentCountJson ? parseInt(String(currentCountJson), 10) : 0;

				if (currentCount >= settings.rateLimitPerWindow) {
					throw errorResponse("Too many submissions. Please try again later.", 429);
				}

				// Validate fields
				for (const field of form.fields) {
					const visible = isFieldVisible(field, submissionData);

					if (!visible) {
						// Strip values for hidden conditional fields
						delete submissionData[field.id];
						continue;
					}

					const value = submissionData[field.id];

					if (field.required && visible) {
						if (!value || (typeof value === "string" && !value.trim())) {
							throw errorResponse(
								`Field "${field.label}" is required`,
								400
							);
						}
					}

					if (field.type === "email" && value && !isValidEmail(value)) {
						throw errorResponse(
							`Invalid email address for "${field.label}"`,
							400
						);
					}
				}

				// Escape all string values for XSS prevention
				const sanitizedData: Record<string, string> = {};
				for (const [key, val] of Object.entries(submissionData)) {
					sanitizedData[key] = typeof val === "string" ? escapeHtml(val) : String(val);
				}

				// Store submission
				const submissionId = generateId();
				const now = new Date().toISOString();

				const submission: FormSubmission = {
					id: submissionId,
					formId,
					data: sanitizedData,
					submittedAt: now,
					ip,
				};

				await ctx.kv.set(
					`submission:${formId}:${submissionId}`,
					JSON.stringify(submission)
				);

				// Update submission list
				const subList = await getSubmissionList(ctx.kv, formId);
				subList.push(submissionId);
				await ctx.kv.set(
					`submissions:${formId}:list`,
					JSON.stringify(subList)
				);

				// Update analytics counters on the form
				form.totalSubmissions += 1;
				form.submissionsThisWeek += 1;
				form.lastSubmissionAt = now;
				await saveForm(ctx.kv, form);

				// Update rate limit counter
				await ctx.kv.set(rateLimitKey, String(currentCount + 1), { ex: settings.rateLimitWindowMinutes * 60 });

				// Send notification emails (async, non-blocking)
				if (form.notifyEmails && form.notifyEmails.length > 0) {
					const fieldValues = form.fields
						.filter((f) => sanitizedData[f.id] !== undefined)
						.map((f) => ({ label: f.label, value: sanitizedData[f.id] }));

					const html = generateSubmissionNotificationHTML(
						form.name,
						fieldValues,
						now,
						submissionId
					);

					for (const email of form.notifyEmails) {
						sendEmail(ctx, {
							to: email,
							subject: `New submission: ${form.name}`,
							html,
						}).catch(() => {}); // fire-and-forget
					}
				}

				// Send auto-response if configured
				if (form.autoResponse?.enabled) {
					const emailField = form.fields.find((f) => f.type === "email");
					const submitterEmail = emailField ? submissionData[emailField.id] : null;

					if (submitterEmail && isValidEmail(submitterEmail)) {
						const html = generateAutoResponseHTML(
							form.autoResponse.subject,
							form.autoResponse.body,
							form.name
						);

						sendEmail(ctx, {
							to: submitterEmail,
							subject: form.autoResponse.subject,
							html,
						}).catch(() => {}); // fire-and-forget
					}
				}

				ctx.log.info(`Submission ${submissionId} for form ${formId}`);
				return { success: true, submissionId };
			},
		},

		// ====================================================================
		// Submission Management
		// ====================================================================

		listSubmissions: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.pathParams?.id || routeCtx.input?.formId;
				if (!formId) throw errorResponse("Form ID is required", 400);

				const form = await getFormFromKV(ctx.kv, formId);
				if (!form) {
					throw errorResponse("Form not found", 404);
				}

				const allIds = await getSubmissionList(ctx.kv, formId);
				const limit = parseInt(routeCtx.input?.limit || "20", 10);
				const offset = parseInt(routeCtx.input?.offset || "0", 10);

				const paginatedIds = allIds.slice(offset, offset + limit);
				const submissions: FormSubmission[] = [];

				for (const subId of paginatedIds) {
					const json = await ctx.kv.get<string>(`submission:${formId}:${subId}`);
					if (json) {
						try {
							submissions.push(JSON.parse(json));
						} catch {}
					}
				}

				return {
					success: true,
					submissions,
					total: allIds.length,
					limit,
					offset,
				};
			},
		},

		getSubmission: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.input?.formId;
				const submissionId = routeCtx.pathParams?.id || routeCtx.input?.submissionId;

				if (!formId || !submissionId) {
					throw errorResponse("Form ID and submission ID are required", 400);
				}

				const json = await ctx.kv.get<string>(`submission:${formId}:${submissionId}`);
				if (!json) {
					throw errorResponse("Submission not found", 404);
				}

				return { success: true, submission: JSON.parse(json) };
			},
		},

		deleteSubmission: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.input?.formId;
				const submissionId = routeCtx.pathParams?.id || routeCtx.input?.submissionId;

				if (!formId || !submissionId) {
					throw errorResponse("Form ID and submission ID are required", 400);
				}

				const exists = await ctx.kv.get<string>(`submission:${formId}:${submissionId}`);
				if (!exists) {
					throw errorResponse("Submission not found", 404);
				}

				await ctx.kv.delete(`submission:${formId}:${submissionId}`);

				// Remove from list
				const subList = await getSubmissionList(ctx.kv, formId);
				const filtered = subList.filter((id) => id !== submissionId);
				await ctx.kv.set(`submissions:${formId}:list`, JSON.stringify(filtered));

				ctx.log.info(`Submission deleted: ${submissionId} from form ${formId}`);
				return { success: true };
			},
		},

		exportSubmissions: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.pathParams?.id || routeCtx.input?.formId;
				if (!formId) throw errorResponse("Form ID is required", 400);

				const form = await getFormFromKV(ctx.kv, formId);
				if (!form) {
					throw errorResponse("Form not found", 404);
				}

				const allIds = await getSubmissionList(ctx.kv, formId);
				const submissions: FormSubmission[] = [];

				for (const subId of allIds) {
					const json = await ctx.kv.get<string>(`submission:${formId}:${subId}`);
					if (json) {
						try {
							submissions.push(JSON.parse(json));
						} catch {}
					}
				}

				// Build CSV
				const headers = ["Submission ID", "Submitted At", ...form.fields.map((f) => f.label)];
				const csvRows = [headers.join(",")];

				for (const sub of submissions) {
					const row = [
						sub.id,
						sub.submittedAt,
						...form.fields.map((f) => {
							const val = sub.data[f.id] || "";
							// Escape CSV values containing commas or quotes
							if (val.includes(",") || val.includes('"') || val.includes("\n")) {
								return `"${val.replace(/"/g, '""')}"`;
							}
							return val;
						}),
					];
					csvRows.push(row.join(","));
				}

				const csv = csvRows.join("\n");
				return { success: true, csv, count: submissions.length };
			},
		},
	},
});
