import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	sendEmail,
	generateSubmissionNotificationHTML,
	generateAutoResponseHTML,
	generateAutoResponseWithVariablesHTML,
	substituteVariables,
} from "./email";
import type { AutoResponseVariables } from "./email";
import {
	renderFormListPage,
	renderSubmissionListPage,
	renderFormActivityWidget,
} from "./admin-ui";
import type { FormSummary, SubmissionSummary } from "./admin-ui";

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

export interface AnalyticsSnapshot {
	formId: string;
	dailyCounts: Record<string, number>; // "YYYY-MM-DD" -> count
	updatedAt: string;
}

function htmlResponse(html: string, status = 200): Response {
	return new Response(html, {
		status,
		headers: { "Content-Type": "text/html; charset=utf-8" },
	});
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
// Analytics Helpers
// ============================================================================

async function getAnalyticsSnapshot(kv: PluginContext["kv"], formId: string): Promise<AnalyticsSnapshot> {
	const json = await kv.get<string>(`form-analytics:${formId}`);
	if (!json) {
		return { formId, dailyCounts: {}, updatedAt: new Date().toISOString() };
	}
	try {
		return JSON.parse(json) as AnalyticsSnapshot;
	} catch {
		return { formId, dailyCounts: {}, updatedAt: new Date().toISOString() };
	}
}

async function updateAnalyticsSnapshot(kv: PluginContext["kv"], formId: string, submittedAt: string): Promise<void> {
	const snapshot = await getAnalyticsSnapshot(kv, formId);
	const dateKey = submittedAt.slice(0, 10); // "YYYY-MM-DD"
	snapshot.dailyCounts[dateKey] = (snapshot.dailyCounts[dateKey] || 0) + 1;
	snapshot.updatedAt = submittedAt;
	await kv.set(`form-analytics:${formId}`, JSON.stringify(snapshot));
}

function extractSubmitterName(
	fields: FormFieldDefinition[],
	data: Record<string, string>
): string {
	// Look for a field with id "name" or type "text" with "name" in the label
	const nameField = fields.find(
		(f) => f.id === "name" || (f.type === "text" && f.label.toLowerCase().includes("name"))
	);
	if (nameField && data[nameField.id]) {
		return data[nameField.id];
	}
	// Fallback to first text field
	const firstText = fields.find((f) => f.type === "text");
	if (firstText && data[firstText.id]) {
		return data[firstText.id];
	}
	return "Valued Customer";
}

function formatSubmissionDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return iso;
	}
}

// ============================================================================
// Webhook Dispatch
// ============================================================================

export async function computeHmacSignature(secret: string, payload: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export async function dispatchWebhooks(
	ctx: PluginContext,
	form: FormDefinition,
	submission: FormSubmission
): Promise<void> {
	if (!form.webhooks || form.webhooks.length === 0) return;

	for (const webhook of form.webhooks) {
		if (!webhook.events.includes("submission.created")) continue;

		const payload = JSON.stringify({
			event: "submission.created",
			formId: form.id,
			formName: form.name,
			submissionId: submission.id,
			data: submission.data,
			submittedAt: submission.submittedAt,
		});

		const headers: Record<string, string> = { "Content-Type": "application/json" };

		if (webhook.secret) {
			const signature = await computeHmacSignature(webhook.secret, payload);
			headers["X-FormForge-Signature"] = signature;
		}

		// Fire-and-forget with logging
		fetch(webhook.url, { method: "POST", headers, body: payload })
			.then(async (response) => {
				await ctx.kv.set(
					`webhook-log:${form.id}`,
					JSON.stringify({
						lastFiredAt: new Date().toISOString(),
						lastUrl: webhook.url,
						lastStatus: response.status,
						lastSuccess: response.ok,
						event: "submission.created",
					})
				);
				ctx.log.info(`Webhook fired to ${webhook.url}: ${response.status}`);
			})
			.catch(async (err) => {
				await ctx.kv.set(
					`webhook-log:${form.id}`,
					JSON.stringify({
						lastFiredAt: new Date().toISOString(),
						lastUrl: webhook.url,
						lastStatus: 0,
						lastSuccess: false,
						event: "submission.created",
						error: String(err),
					})
				);
				ctx.log.error(`Webhook failed to ${webhook.url}: ${String(err)}`);
			});
	}
}

// ============================================================================
// Plugin Definition
// ============================================================================

function createPlugin() { return definePlugin({
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

				// Update analytics snapshot in KV
				await updateAnalyticsSnapshot(ctx.kv, formId, now);

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

				// Send auto-response if configured (with variable substitution)
				if (form.autoResponse?.enabled) {
					const emailField = form.fields.find((f) => f.type === "email");
					const submitterEmail = emailField ? submissionData[emailField.id] : null;

					if (submitterEmail && isValidEmail(submitterEmail)) {
						const variables: AutoResponseVariables = {
							submitterName: extractSubmitterName(form.fields, submissionData),
							formName: form.name,
							submissionDate: formatSubmissionDate(now),
						};

						const html = generateAutoResponseWithVariablesHTML(
							form.autoResponse.subject,
							form.autoResponse.body,
							variables
						);

						const processedSubject = substituteVariables(
							form.autoResponse.subject,
							variables
						);

						sendEmail(ctx, {
							to: submitterEmail,
							subject: processedSubject,
							html,
						}).catch(() => {}); // fire-and-forget
					}
				}

				// Dispatch webhooks (fire-and-forget)
				dispatchWebhooks(ctx, form, submission).catch(() => {});

				ctx.log.info(`Submission ${submissionId} for form ${formId}`);
				return { success: true, submissionId };
			},
		},

		// ====================================================================
		// Webhook Management
		// ====================================================================

		webhookTest: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formId = routeCtx.input?.formId;
				const webhookUrl = routeCtx.input?.url;
				const webhookSecret = routeCtx.input?.secret;

				if (!formId) throw errorResponse("Form ID is required", 400);
				if (!webhookUrl) throw errorResponse("Webhook URL is required", 400);

				const form = await getFormFromKV(ctx.kv, formId);
				if (!form) {
					throw errorResponse("Form not found", 404);
				}

				const testPayload = JSON.stringify({
					event: "test",
					formId: form.id,
					formName: form.name,
					submissionId: "test-" + generateId(),
					data: { _test: "This is a test webhook from FormForge" },
					submittedAt: new Date().toISOString(),
				});

				const headers: Record<string, string> = { "Content-Type": "application/json" };

				if (webhookSecret) {
					const signature = await computeHmacSignature(webhookSecret, testPayload);
					headers["X-FormForge-Signature"] = signature;
				}

				try {
					const response = await fetch(webhookUrl, {
						method: "POST",
						headers,
						body: testPayload,
					});

					const success = response.ok;

					// Log the test
					await ctx.kv.set(
						`webhook-log:${formId}`,
						JSON.stringify({
							lastFiredAt: new Date().toISOString(),
							lastUrl: webhookUrl,
							lastStatus: response.status,
							lastSuccess: success,
							event: "test",
						})
					);

					ctx.log.info(`Webhook test to ${webhookUrl}: ${response.status}`);
					return { success, status: response.status };
				} catch (err) {
					// Log the failure
					await ctx.kv.set(
						`webhook-log:${formId}`,
						JSON.stringify({
							lastFiredAt: new Date().toISOString(),
							lastUrl: webhookUrl,
							lastStatus: 0,
							lastSuccess: false,
							event: "test",
							error: String(err),
						})
					);

					return { success: false, error: "Failed to reach webhook URL" };
				}
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

		// ====================================================================
		// Analytics Routes (Wave 4)
		// ====================================================================

		formAnalytics: {
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

				const snapshot = await getAnalyticsSnapshot(ctx.kv, formId);

				// Submissions per day for last 30 days
				const now = new Date();
				const dailyData: Array<{ date: string; count: number }> = [];
				for (let i = 29; i >= 0; i--) {
					const d = new Date(now);
					d.setDate(d.getDate() - i);
					const dateKey = d.toISOString().slice(0, 10);
					dailyData.push({ date: dateKey, count: snapshot.dailyCounts[dateKey] || 0 });
				}

				// Submissions per week for last 12 weeks
				const weeklyData: Array<{ weekStart: string; count: number }> = [];
				for (let w = 11; w >= 0; w--) {
					const weekStart = new Date(now);
					weekStart.setDate(weekStart.getDate() - (w * 7 + weekStart.getDay()));
					let weekCount = 0;
					for (let d = 0; d < 7; d++) {
						const day = new Date(weekStart);
						day.setDate(day.getDate() + d);
						const dateKey = day.toISOString().slice(0, 10);
						weekCount += snapshot.dailyCounts[dateKey] || 0;
					}
					weeklyData.push({ weekStart: weekStart.toISOString().slice(0, 10), count: weekCount });
				}

				// Top fields by completion rate
				const allSubIds = await getSubmissionList(ctx.kv, formId);
				const fieldCompletionCounts: Record<string, number> = {};
				for (const field of form.fields) {
					fieldCompletionCounts[field.id] = 0;
				}

				let totalSubs = 0;
				for (const subId of allSubIds) {
					const subJson = await ctx.kv.get<string>(`submission:${formId}:${subId}`);
					if (subJson) {
						try {
							const sub = JSON.parse(subJson) as FormSubmission;
							totalSubs++;
							for (const field of form.fields) {
								if (sub.data[field.id] && sub.data[field.id].trim() !== "") {
									fieldCompletionCounts[field.id]++;
								}
							}
						} catch {}
					}
				}

				const fieldCompletion = form.fields.map((f) => ({
					fieldId: f.id,
					label: f.label,
					completionRate: totalSubs > 0 ? Math.round((fieldCompletionCounts[f.id] / totalSubs) * 100) : 0,
					filled: fieldCompletionCounts[f.id],
					total: totalSubs,
				})).sort((a, b) => b.completionRate - a.completionRate);

				return {
					success: true,
					formId,
					daily: dailyData,
					weekly: weeklyData,
					fieldCompletion,
					totalSubmissions: form.totalSubmissions,
				};
			},
		},

		dashboardAnalytics: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formIds = await getFormList(ctx.kv);
				let totalSubmissions = 0;
				const formSummaries: Array<{ id: string; name: string; submissions: number }> = [];

				for (const fid of formIds) {
					const form = await getFormFromKV(ctx.kv, fid);
					if (form) {
						totalSubmissions += form.totalSubmissions;
						formSummaries.push({
							id: fid,
							name: form.name,
							submissions: form.totalSubmissions,
						});
					}
				}

				// Most active forms (top 5)
				const mostActive = [...formSummaries]
					.sort((a, b) => b.submissions - a.submissions)
					.slice(0, 5);

				// Submissions trend: last 7 days vs previous 7 days
				const now = new Date();
				let last7 = 0;
				let prev7 = 0;

				for (const fid of formIds) {
					const snapshot = await getAnalyticsSnapshot(ctx.kv, fid);
					for (let i = 0; i < 7; i++) {
						const d = new Date(now);
						d.setDate(d.getDate() - i);
						const dateKey = d.toISOString().slice(0, 10);
						last7 += snapshot.dailyCounts[dateKey] || 0;
					}
					for (let i = 7; i < 14; i++) {
						const d = new Date(now);
						d.setDate(d.getDate() - i);
						const dateKey = d.toISOString().slice(0, 10);
						prev7 += snapshot.dailyCounts[dateKey] || 0;
					}
				}

				const trend = last7 > prev7 ? "up" : last7 < prev7 ? "down" : "stable";

				return {
					success: true,
					totalSubmissions,
					mostActive,
					trend: {
						last7days: last7,
						previous7days: prev7,
						direction: trend,
					},
				};
			},
		},

		// ====================================================================
		// Admin Page Routes (Wave 4)
		// ====================================================================

		adminFormsPage: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formIds = await getFormList(ctx.kv);
				const forms: FormSummary[] = [];

				for (const fid of formIds) {
					const form = await getFormFromKV(ctx.kv, fid);
					if (form) {
						const subIds = await getSubmissionList(ctx.kv, fid);
						forms.push({
							id: form.id,
							name: form.name,
							description: form.description,
							fieldCount: form.fields.length,
							submissionCount: subIds.length,
							lastSubmissionAt: form.lastSubmissionAt,
							createdAt: form.createdAt,
						});
					}
				}

				const html = renderFormListPage(forms);
				return { success: true, html };
			},
		},

		adminSubmissionsPage: {
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
				const submissions: SubmissionSummary[] = [];

				for (const subId of paginatedIds) {
					const json = await ctx.kv.get<string>(`submission:${formId}:${subId}`);
					if (json) {
						try {
							const sub = JSON.parse(json) as FormSubmission;
							submissions.push({
								id: sub.id,
								data: sub.data,
								submittedAt: sub.submittedAt,
							});
						} catch {}
					}
				}

				const html = renderSubmissionListPage(
					{
						id: form.id,
						name: form.name,
						fields: form.fields.map((f) => ({ id: f.id, label: f.label })),
					},
					submissions,
					{ total: allIds.length, limit, offset }
				);

				return { success: true, html };
			},
		},

		adminFormActivityWidget: {
			handler: async (routeCtx: any, ctx: any) => {
				if (!routeCtx.user?.isAdmin) {
					throw errorResponse("Admin access required", 403);
				}

				const formIds = await getFormList(ctx.kv);
				const forms: FormSummary[] = [];

				for (const fid of formIds) {
					const form = await getFormFromKV(ctx.kv, fid);
					if (form) {
						const subIds = await getSubmissionList(ctx.kv, fid);
						forms.push({
							id: form.id,
							name: form.name,
							fieldCount: form.fields.length,
							submissionCount: subIds.length,
							lastSubmissionAt: form.lastSubmissionAt,
							createdAt: form.createdAt,
						});
					}
				}

				const html = renderFormActivityWidget(forms);
				return { success: true, html };
			},
		},
	},
});
}
export { createPlugin };
export default createPlugin;

