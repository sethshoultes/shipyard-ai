import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	sendEmail,
	generateSubmissionNotificationHTML,
	generateAutoResponseHTML,
} from "./email";

// ─── Type Definitions ────────────────────────────────────────────────────────

interface ConditionalRule {
	fieldId: string;
	operator: "equals";
	value: string;
}

interface FormFieldDefinition {
	id: string;
	type:
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
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: string[]; // for dropdown, radio
	defaultValue?: string;
	showWhen?: ConditionalRule; // simple conditional logic
}

interface FormStep {
	label: string;
	fieldIds: string[];
}

interface FormDefinition {
	id: string;
	name: string;
	description?: string;
	fields: FormFieldDefinition[];
	steps?: FormStep[];
	notifyEmails?: string[];
	webhooks?: WebhookEndpoint[];
	autoResponse?: { enabled: boolean; subject: string; body: string };
	totalSubmissions: number;
	submissionsThisWeek: number;
	lastSubmissionAt?: string;
	createdAt: string;
	updatedAt: string;
}

interface FormSubmission {
	id: string;
	formId: string;
	data: Record<string, string>;
	submittedAt: string;
	ip?: string;
}

interface WebhookEndpoint {
	url: string;
	secret?: string;
	events: string[];
	lastFiredAt?: string;
	lastStatus?: "success" | "fail";
}

interface FormForgeSettings {
	defaultNotifyEmails?: string[];
	honeypotFieldName?: string;
	rateLimitPerForm?: number;
	rateLimitWindowMinutes?: number;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseJSON<T>(json: string | undefined | null, fallback: T): T {
	if (!json) return fallback;
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
}

function validateStringLength(
	value: string,
	maxLength: number,
	fieldName: string
): string {
	if (value.length > maxLength) {
		throw new Response(
			JSON.stringify({
				error: `${fieldName} must be ${maxLength} characters or less`,
			}),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
	return value;
}

// ─── KV Helpers ──────────────────────────────────────────────────────────────

async function getFormsList(ctx: PluginContext): Promise<string[]> {
	const json = await ctx.kv.get<string>("forms:list");
	return parseJSON<string[]>(json, []);
}

async function setFormsList(
	ctx: PluginContext,
	ids: string[]
): Promise<void> {
	await ctx.kv.set("forms:list", JSON.stringify(ids));
}

async function getForm(
	ctx: PluginContext,
	formId: string
): Promise<FormDefinition | null> {
	const json = await ctx.kv.get<string>(`form:${formId}`);
	return parseJSON<FormDefinition>(json, null as unknown as FormDefinition);
}

async function saveForm(
	ctx: PluginContext,
	form: FormDefinition
): Promise<void> {
	await ctx.kv.set(`form:${form.id}`, JSON.stringify(form));
}

async function deleteFormFromKV(
	ctx: PluginContext,
	formId: string
): Promise<void> {
	await ctx.kv.delete(`form:${formId}`);
}

async function getSubmissionsList(
	ctx: PluginContext,
	formId: string
): Promise<string[]> {
	const json = await ctx.kv.get<string>(`submissions:${formId}:list`);
	return parseJSON<string[]>(json, []);
}

async function setSubmissionsList(
	ctx: PluginContext,
	formId: string,
	ids: string[]
): Promise<void> {
	await ctx.kv.set(`submissions:${formId}:list`, JSON.stringify(ids));
}

async function getSubmission(
	ctx: PluginContext,
	formId: string,
	submissionId: string
): Promise<FormSubmission | null> {
	const json = await ctx.kv.get<string>(
		`submission:${formId}:${submissionId}`
	);
	return parseJSON<FormSubmission>(
		json,
		null as unknown as FormSubmission
	);
}

async function saveSubmission(
	ctx: PluginContext,
	submission: FormSubmission
): Promise<void> {
	await ctx.kv.set(
		`submission:${submission.formId}:${submission.id}`,
		JSON.stringify(submission)
	);
}

async function deleteSubmissionFromKV(
	ctx: PluginContext,
	formId: string,
	submissionId: string
): Promise<void> {
	await ctx.kv.delete(`submission:${formId}:${submissionId}`);
}

async function getSettings(ctx: PluginContext): Promise<FormForgeSettings> {
	const json = await ctx.kv.get<string>("settings:formforge");
	return parseJSON<FormForgeSettings>(json, {});
}

async function saveSettings(
	ctx: PluginContext,
	settings: FormForgeSettings
): Promise<void> {
	await ctx.kv.set("settings:formforge", JSON.stringify(settings));
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

async function checkRateLimit(
	ctx: PluginContext,
	formId: string,
	ip: string,
	maxSubmissions: number
): Promise<boolean> {
	const key = `rate-limit:${formId}:${ip}`;
	const countJson = await ctx.kv.get<string>(key);
	const count = countJson ? parseInt(countJson, 10) || 0 : 0;
	return count >= maxSubmissions;
}

async function incrementRateLimit(
	ctx: PluginContext,
	formId: string,
	ip: string
): Promise<void> {
	const key = `rate-limit:${formId}:${ip}`;
	const countJson = await ctx.kv.get<string>(key);
	const count = countJson ? parseInt(countJson, 10) || 0 : 0;
	// Set with TTL of 15 minutes (900 seconds)
	await ctx.kv.set(key, String(count + 1), { ttl: 900 });
}

// ─── Conditional Logic ───────────────────────────────────────────────────────

/**
 * Evaluate which fields should be visible given submitted data.
 * Fields without a showWhen condition are always visible.
 * Fields with showWhen are only visible if the condition is met.
 */
function getVisibleFieldIds(
	fields: FormFieldDefinition[],
	data: Record<string, string>
): Set<string> {
	const visible = new Set<string>();
	for (const field of fields) {
		if (!field.showWhen) {
			visible.add(field.id);
		} else {
			const { fieldId, operator, value } = field.showWhen;
			if (operator === "equals" && data[fieldId] === value) {
				visible.add(field.id);
			}
		}
	}
	return visible;
}

// ─── Webhook Firing ──────────────────────────────────────────────────────────

async function generateWebhookSignature(
	payload: string,
	secret: string
): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);
	const sig = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(payload)
	);
	return Array.from(new Uint8Array(sig))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function fireWebhooks(
	form: FormDefinition,
	eventType: string,
	data: Record<string, unknown>,
	ctx: PluginContext
): Promise<void> {
	if (!form.webhooks || form.webhooks.length === 0) return;

	const payload = JSON.stringify({
		event: eventType,
		formId: form.id,
		formName: form.name,
		timestamp: new Date().toISOString(),
		data,
	});

	for (const webhook of form.webhooks) {
		if (!webhook.events.includes(eventType) && !webhook.events.includes("*")) {
			continue;
		}

		try {
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
				"X-FormForge-Event": eventType,
			};

			if (webhook.secret) {
				const signature = await generateWebhookSignature(
					payload,
					webhook.secret
				);
				headers["X-Shipyard-Signature"] = `sha256=${signature}`;
			}

			const response = await fetch(webhook.url, {
				method: "POST",
				headers,
				body: payload,
			});

			webhook.lastFiredAt = new Date().toISOString();
			webhook.lastStatus = response.ok ? "success" : "fail";
		} catch (error) {
			ctx.log.error(
				`Webhook fire failed for ${webhook.url}: ${String(error)}`
			);
			webhook.lastFiredAt = new Date().toISOString();
			webhook.lastStatus = "fail";
		}
	}

	// Persist updated webhook statuses
	await saveForm(ctx, form);
}

// ─── Form Templates ──────────────────────────────────────────────────────────

interface TemplateConfig {
	name: string;
	description: string;
	fields: FormFieldDefinition[];
}

const TEMPLATES: Record<string, TemplateConfig> = {
	contact: {
		name: "Contact Form",
		description: "Simple contact form with name, email, subject, and message.",
		fields: [
			{
				id: "name",
				type: "text",
				label: "Full Name",
				placeholder: "Your name",
				required: true,
			},
			{
				id: "email",
				type: "email",
				label: "Email Address",
				placeholder: "you@example.com",
				required: true,
			},
			{
				id: "subject",
				type: "text",
				label: "Subject",
				placeholder: "What is this about?",
				required: true,
			},
			{
				id: "message",
				type: "textarea",
				label: "Message",
				placeholder: "Tell us more...",
				required: true,
			},
		],
	},
	booking: {
		name: "Booking Request",
		description:
			"Appointment booking form with date, time, and contact details.",
		fields: [
			{
				id: "name",
				type: "text",
				label: "Full Name",
				placeholder: "Your name",
				required: true,
			},
			{
				id: "email",
				type: "email",
				label: "Email Address",
				placeholder: "you@example.com",
				required: true,
			},
			{
				id: "phone",
				type: "phone",
				label: "Phone Number",
				placeholder: "(555) 123-4567",
				required: true,
			},
			{
				id: "date",
				type: "date",
				label: "Preferred Date",
				required: true,
			},
			{
				id: "time",
				type: "dropdown",
				label: "Preferred Time",
				required: true,
				options: [
					"9:00 AM",
					"10:00 AM",
					"11:00 AM",
					"12:00 PM",
					"1:00 PM",
					"2:00 PM",
					"3:00 PM",
					"4:00 PM",
					"5:00 PM",
				],
			},
			{
				id: "notes",
				type: "textarea",
				label: "Additional Notes",
				placeholder: "Anything we should know?",
				required: false,
			},
		],
	},
	feedback: {
		name: "Feedback Form",
		description:
			"Customer feedback form with optional name, rating, and comments.",
		fields: [
			{
				id: "name",
				type: "text",
				label: "Name (optional)",
				placeholder: "Your name",
				required: false,
			},
			{
				id: "rating",
				type: "radio",
				label: "Rating",
				required: true,
				options: ["1", "2", "3", "4", "5"],
			},
			{
				id: "comments",
				type: "textarea",
				label: "Comments",
				placeholder: "Tell us about your experience...",
				required: true,
			},
		],
	},
	"quote-request": {
		name: "Quote Request",
		description:
			"Service quote request with contact info, service type, budget, and details.",
		fields: [
			{
				id: "name",
				type: "text",
				label: "Full Name",
				placeholder: "Your name",
				required: true,
			},
			{
				id: "email",
				type: "email",
				label: "Email Address",
				placeholder: "you@example.com",
				required: true,
			},
			{
				id: "phone",
				type: "phone",
				label: "Phone Number",
				placeholder: "(555) 123-4567",
				required: true,
			},
			{
				id: "service",
				type: "dropdown",
				label: "Service Needed",
				required: true,
				options: [
					"Web Design",
					"SEO",
					"Social Media",
					"Content Writing",
					"Branding",
					"Other",
				],
			},
			{
				id: "budget",
				type: "dropdown",
				label: "Budget Range",
				required: true,
				options: [
					"Under $1,000",
					"$1,000 - $5,000",
					"$5,000 - $10,000",
					"$10,000 - $25,000",
					"$25,000+",
				],
			},
			{
				id: "details",
				type: "textarea",
				label: "Project Details",
				placeholder: "Describe your project and goals...",
				required: true,
			},
		],
	},
};

// ─── Plugin Initialization ───────────────────────────────────────────────────

function initializePlugin(ctx: PluginContext): void {
	ctx.log.info("FormForge: Plugin initialized");
	ctx.log.info(
		"FormForge: Configure RESEND_API_KEY and FORM_FROM_EMAIL for email notifications"
	);
}

// ─── Plugin Definition ───────────────────────────────────────────────────────

export default definePlugin({
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				initializePlugin(ctx);
			},
		},
	},

	routes: {
		// ─── Form CRUD (Admin) ───────────────────────────────────────────

		/**
		 * POST /formforge/formCreate
		 * Create a new form.
		 *
		 * Body: { name: string, description?: string, fields: FormFieldDefinition[], steps?: FormStep[], notifyEmails?: string[], webhooks?: WebhookEndpoint[], autoResponse?: {...} }
		 * Returns: { success: true, form: FormDefinition }
		 */
		formCreate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const name = validateStringLength(
						String(input.name ?? "").trim(),
						200,
						"Form name"
					);
					if (!name) {
						throw new Response(
							JSON.stringify({ error: "Form name is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const fields = input.fields as FormFieldDefinition[] | undefined;
					if (!fields || !Array.isArray(fields) || fields.length === 0) {
						throw new Response(
							JSON.stringify({
								error: "At least one field is required",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					// Validate each field has id, type, and label
					for (const field of fields) {
						if (!field.id || !field.type || !field.label) {
							throw new Response(
								JSON.stringify({
									error: `Field must have id, type, and label. Invalid field: ${JSON.stringify(field)}`,
								}),
								{
									status: 400,
									headers: {
										"Content-Type": "application/json",
									},
								}
							);
						}
					}

					// Check for duplicate field IDs
					const fieldIds = fields.map((f) => f.id);
					const uniqueIds = new Set(fieldIds);
					if (uniqueIds.size !== fieldIds.length) {
						throw new Response(
							JSON.stringify({
								error: "Duplicate field IDs are not allowed",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const now = new Date().toISOString();
					const formId = generateId();

					const form: FormDefinition = {
						id: formId,
						name,
						description: input.description
							? String(input.description).trim()
							: undefined,
						fields,
						steps: input.steps as FormStep[] | undefined,
						notifyEmails: input.notifyEmails as string[] | undefined,
						webhooks: input.webhooks as WebhookEndpoint[] | undefined,
						autoResponse: input.autoResponse as
							| FormDefinition["autoResponse"]
							| undefined,
						totalSubmissions: 0,
						submissionsThisWeek: 0,
						createdAt: now,
						updatedAt: now,
					};

					await saveForm(ctx, form);

					// Add to forms list
					const formsList = await getFormsList(ctx);
					formsList.push(formId);
					await setFormsList(ctx, formsList);

					ctx.log.info(
						`FormForge: Created form "${name}" (${formId}) with ${fields.length} fields`
					);

					return { success: true, form };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`FormCreate error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to create form" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			},
		},

		/**
		 * POST /formforge/formUpdate
		 * Update an existing form (merge fields).
		 *
		 * Body: { formId: string, name?: string, description?: string, fields?: FormFieldDefinition[], steps?: FormStep[], notifyEmails?: string[], webhooks?: WebhookEndpoint[], autoResponse?: {...} }
		 * Returns: { success: true, form: FormDefinition }
		 */
		formUpdate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const form = await getForm(ctx, formId);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					// Merge updates
					if (input.name !== undefined) {
						const name = validateStringLength(
							String(input.name).trim(),
							200,
							"Form name"
						);
						if (!name) {
							throw new Response(
								JSON.stringify({
									error: "Form name cannot be empty",
								}),
								{
									status: 400,
									headers: {
										"Content-Type": "application/json",
									},
								}
							);
						}
						form.name = name;
					}

					if (input.description !== undefined) {
						form.description = input.description
							? String(input.description).trim()
							: undefined;
					}

					if (input.fields !== undefined) {
						const fields = input.fields as FormFieldDefinition[];
						if (!Array.isArray(fields) || fields.length === 0) {
							throw new Response(
								JSON.stringify({
									error: "At least one field is required",
								}),
								{
									status: 400,
									headers: {
										"Content-Type": "application/json",
									},
								}
							);
						}
						for (const field of fields) {
							if (!field.id || !field.type || !field.label) {
								throw new Response(
									JSON.stringify({
										error: "Field must have id, type, and label",
									}),
									{
										status: 400,
										headers: {
											"Content-Type": "application/json",
										},
									}
								);
							}
						}
						form.fields = fields;
					}

					if (input.steps !== undefined) {
						form.steps = input.steps as FormStep[] | undefined;
					}

					if (input.notifyEmails !== undefined) {
						form.notifyEmails = input.notifyEmails as string[] | undefined;
					}

					if (input.webhooks !== undefined) {
						form.webhooks = input.webhooks as WebhookEndpoint[] | undefined;
					}

					if (input.autoResponse !== undefined) {
						form.autoResponse =
							input.autoResponse as FormDefinition["autoResponse"];
					}

					form.updatedAt = new Date().toISOString();

					await saveForm(ctx, form);

					ctx.log.info(
						`FormForge: Updated form "${form.name}" (${formId})`
					);

					return { success: true, form };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`FormUpdate error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to update form" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			},
		},

		/**
		 * POST /formforge/formDelete
		 * Delete a form and cascade-delete all its submissions.
		 *
		 * Body: { formId: string }
		 * Returns: { success: true, deletedSubmissions: number }
		 */
		formDelete: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const form = await getForm(ctx, formId);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					// Cascade delete all submissions
					const submissionIds = await getSubmissionsList(ctx, formId);
					for (const subId of submissionIds) {
						await deleteSubmissionFromKV(ctx, formId, subId);
					}

					// Delete submission list
					await ctx.kv.delete(`submissions:${formId}:list`);

					// Delete form
					await deleteFormFromKV(ctx, formId);

					// Remove from forms list
					const formsList = await getFormsList(ctx);
					const updated = formsList.filter((id) => id !== formId);
					await setFormsList(ctx, updated);

					ctx.log.info(
						`FormForge: Deleted form "${form.name}" (${formId}) with ${submissionIds.length} submissions`
					);

					return {
						success: true,
						deletedSubmissions: submissionIds.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`FormDelete error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to delete form" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			},
		},

		/**
		 * GET /formforge/formGet
		 * Get a single form by ID.
		 *
		 * Query: { formId: string }
		 * Returns: { form: FormDefinition }
		 */
		formGet: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const form = await getForm(ctx, formId);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					return { form };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`FormGet error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to fetch form" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			},
		},

		/**
		 * GET /formforge/formList
		 * List all forms with submission counts.
		 *
		 * Returns: { forms: FormDefinition[], total: number }
		 */
		formList: {
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const formIds = await getFormsList(ctx);
					const forms: FormDefinition[] = [];

					for (const id of formIds) {
						const form = await getForm(ctx, id);
						if (form) {
							forms.push(form);
						}
					}

					// Sort by most recently updated
					forms.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime()
					);

					return { forms, total: forms.length };
				} catch (error) {
					ctx.log.error(`FormList error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to list forms" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			},
		},

		// ─── Templates ───────────────────────────────────────────────────

		/**
		 * POST /formforge/formCreateFromTemplate
		 * Create a form from a pre-built template.
		 *
		 * Body: { template: "contact" | "booking" | "feedback" | "quote-request", name?: string, notifyEmails?: string[] }
		 * Returns: { success: true, form: FormDefinition }
		 */
		formCreateFromTemplate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const templateName = String(input.template ?? "").trim();
					if (!templateName) {
						throw new Response(
							JSON.stringify({
								error: "Template name is required",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const template = TEMPLATES[templateName];
					if (!template) {
						const available = Object.keys(TEMPLATES).join(", ");
						throw new Response(
							JSON.stringify({
								error: `Unknown template "${templateName}". Available: ${available}`,
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const now = new Date().toISOString();
					const formId = generateId();

					const form: FormDefinition = {
						id: formId,
						name: input.name
							? String(input.name).trim()
							: template.name,
						description: template.description,
						fields: JSON.parse(JSON.stringify(template.fields)), // deep clone
						notifyEmails: input.notifyEmails as string[] | undefined,
						totalSubmissions: 0,
						submissionsThisWeek: 0,
						createdAt: now,
						updatedAt: now,
					};

					await saveForm(ctx, form);

					const formsList = await getFormsList(ctx);
					formsList.push(formId);
					await setFormsList(ctx, formsList);

					ctx.log.info(
						`FormForge: Created form from template "${templateName}" -> "${form.name}" (${formId})`
					);

					return { success: true, form };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(
						`FormCreateFromTemplate error: ${String(error)}`
					);
					throw new Response(
						JSON.stringify({
							error: "Failed to create form from template",
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						}
					);
				}
			},
		},

		// ─── Submission Engine ────────────────────────────────────────────

		/**
		 * POST /formforge/formSubmit (PUBLIC)
		 * Submit a form. Validates fields, evaluates conditional show/hide,
		 * checks honeypot, enforces rate limit, stores submission,
		 * sends notification emails, fires webhooks.
		 *
		 * Body: { formId: string, data: Record<string, string>, _hp?: string, _ip?: string }
		 * Returns: { success: true, submissionId: string }
		 */
		formSubmit: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					// Honeypot check — if _hp is filled, return fake success
					const honeypot = String(input._hp ?? "").trim();
					if (honeypot) {
						ctx.log.info(
							`FormForge: Honeypot triggered on form ${formId}`
						);
						return {
							success: true,
							submissionId: generateId(),
						};
					}

					const form = await getForm(ctx, formId);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const data = (input.data as Record<string, string>) ?? {};
					const ip = String(input._ip ?? "unknown").trim();

					// Rate limit check: 5 submissions per IP per form per 15 minutes
					const settings = await getSettings(ctx);
					const maxSubmissions = settings.rateLimitPerForm ?? 5;

					const isLimited = await checkRateLimit(
						ctx,
						formId,
						ip,
						maxSubmissions
					);
					if (isLimited) {
						throw new Response(
							JSON.stringify({
								error: "Too many submissions. Please try again later.",
							}),
							{
								status: 429,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					// Evaluate conditional visibility
					const visibleFieldIds = getVisibleFieldIds(form.fields, data);

					// Validate required fields (only visible ones)
					for (const field of form.fields) {
						if (field.required && visibleFieldIds.has(field.id)) {
							const value = String(data[field.id] ?? "").trim();
							if (!value) {
								throw new Response(
									JSON.stringify({
										error: `"${field.label}" is required`,
										fieldId: field.id,
									}),
									{
										status: 400,
										headers: {
											"Content-Type": "application/json",
										},
									}
								);
							}

							// Type-specific validation
							if (field.type === "email" && !isValidEmail(value)) {
								throw new Response(
									JSON.stringify({
										error: `"${field.label}" must be a valid email address`,
										fieldId: field.id,
									}),
									{
										status: 400,
										headers: {
											"Content-Type": "application/json",
										},
									}
								);
							}

							if (field.type === "number") {
								const num = Number(value);
								if (isNaN(num)) {
									throw new Response(
										JSON.stringify({
											error: `"${field.label}" must be a number`,
											fieldId: field.id,
										}),
										{
											status: 400,
											headers: {
												"Content-Type": "application/json",
											},
										}
									);
								}
							}

							// Validate dropdown/radio against allowed options
							if (
								(field.type === "dropdown" || field.type === "radio") &&
								field.options &&
								field.options.length > 0
							) {
								if (!field.options.includes(value)) {
									throw new Response(
										JSON.stringify({
											error: `"${field.label}" has an invalid selection`,
											fieldId: field.id,
										}),
										{
											status: 400,
											headers: {
												"Content-Type": "application/json",
											},
										}
									);
								}
							}
						}
					}

					// Strip data for non-visible fields (don't store hidden conditional fields)
					const cleanData: Record<string, string> = {};
					for (const field of form.fields) {
						if (visibleFieldIds.has(field.id) && data[field.id] !== undefined) {
							cleanData[field.id] = String(data[field.id]);
						}
					}

					// Store submission
					const now = new Date().toISOString();
					const submissionId = generateId();

					const submission: FormSubmission = {
						id: submissionId,
						formId,
						data: cleanData,
						submittedAt: now,
						ip,
					};

					await saveSubmission(ctx, submission);

					// Add to submissions list
					const subList = await getSubmissionsList(ctx, formId);
					subList.push(submissionId);
					await setSubmissionsList(ctx, formId, subList);

					// Increment rate limit
					await incrementRateLimit(ctx, formId, ip);

					// Update form analytics
					form.totalSubmissions += 1;
					form.submissionsThisWeek += 1;
					form.lastSubmissionAt = now;
					form.updatedAt = now;
					await saveForm(ctx, form);

					// Send notification emails
					if (form.notifyEmails && form.notifyEmails.length > 0) {
						const fieldValues = form.fields
							.filter((f) => visibleFieldIds.has(f.id))
							.map((f) => ({
								label: f.label,
								value: cleanData[f.id] || "",
							}));

						const html = generateSubmissionNotificationHTML(
							form.name,
							fieldValues,
							now,
							submissionId
						);

						for (const email of form.notifyEmails) {
							await sendEmail(ctx, {
								to: email,
								subject: `New submission: ${form.name}`,
								html,
							});
						}
					}

					// Send auto-response to submitter
					if (
						form.autoResponse?.enabled &&
						form.autoResponse.subject &&
						form.autoResponse.body
					) {
						// Find the email field value
						const emailField = form.fields.find(
							(f) => f.type === "email"
						);
						const submitterEmail = emailField
							? cleanData[emailField.id]
							: undefined;

						if (submitterEmail && isValidEmail(submitterEmail)) {
							const html = generateAutoResponseHTML(
								form.autoResponse.subject,
								form.autoResponse.body,
								form.name
							);
							await sendEmail(ctx, {
								to: submitterEmail,
								subject: form.autoResponse.subject,
								html,
							});
						}
					}

					// Fire webhooks
					await fireWebhooks(
						form,
						"submission.created",
						{
							submissionId,
							formId,
							data: cleanData,
							submittedAt: now,
						},
						ctx
					);

					ctx.log.info(
						`FormForge: New submission on "${form.name}" (${submissionId})`
					);

					return {
						success: true,
						submissionId,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`FormSubmit error: ${String(error)}`);
					throw new Response(
						JSON.stringify({
							error: "Failed to submit form",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}
			},
		},

		/**
		 * GET /formforge/submissionsList
		 * Paginated list of submissions for a form.
		 *
		 * Query: { formId: string, page?: number, limit?: number }
		 * Returns: { submissions: FormSubmission[], total: number, page: number, totalPages: number }
		 */
		submissionsList: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const form = await getForm(ctx, formId);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const page = Math.max(
						1,
						parseInt(String(input.page ?? "1"), 10) || 1
					);
					const limit = Math.min(
						Math.max(1, parseInt(String(input.limit ?? "20"), 10) || 20),
						100
					);

					const allIds = await getSubmissionsList(ctx, formId);
					const total = allIds.length;
					const totalPages = Math.max(1, Math.ceil(total / limit));

					// Most recent first
					const reversed = [...allIds].reverse();
					const start = (page - 1) * limit;
					const pageIds = reversed.slice(start, start + limit);

					const submissions: FormSubmission[] = [];
					for (const id of pageIds) {
						const sub = await getSubmission(ctx, formId, id);
						if (sub) {
							submissions.push(sub);
						}
					}

					return {
						submissions,
						total,
						page,
						totalPages,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`SubmissionsList error: ${String(error)}`);
					throw new Response(
						JSON.stringify({
							error: "Failed to list submissions",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}
			},
		},

		/**
		 * GET /formforge/submissionsGet
		 * Get a single submission by ID.
		 *
		 * Query: { formId: string, submissionId: string }
		 * Returns: { submission: FormSubmission }
		 */
		submissionsGet: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					const submissionId = String(
						input.submissionId ?? ""
					).trim();

					if (!formId || !submissionId) {
						throw new Response(
							JSON.stringify({
								error: "Form ID and submission ID are required",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const submission = await getSubmission(
						ctx,
						formId,
						submissionId
					);
					if (!submission) {
						throw new Response(
							JSON.stringify({
								error: "Submission not found",
							}),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					return { submission };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`SubmissionsGet error: ${String(error)}`);
					throw new Response(
						JSON.stringify({
							error: "Failed to fetch submission",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}
			},
		},

		/**
		 * POST /formforge/submissionsDelete
		 * Delete a single submission.
		 *
		 * Body: { formId: string, submissionId: string }
		 * Returns: { success: true }
		 */
		submissionsDelete: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					const submissionId = String(
						input.submissionId ?? ""
					).trim();

					if (!formId || !submissionId) {
						throw new Response(
							JSON.stringify({
								error: "Form ID and submission ID are required",
							}),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const submission = await getSubmission(
						ctx,
						formId,
						submissionId
					);
					if (!submission) {
						throw new Response(
							JSON.stringify({
								error: "Submission not found",
							}),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					await deleteSubmissionFromKV(ctx, formId, submissionId);

					// Remove from submissions list
					const subList = await getSubmissionsList(ctx, formId);
					const updated = subList.filter((id) => id !== submissionId);
					await setSubmissionsList(ctx, formId, updated);

					// Update form submission count
					const form = await getForm(ctx, formId);
					if (form) {
						form.totalSubmissions = Math.max(
							0,
							form.totalSubmissions - 1
						);
						form.updatedAt = new Date().toISOString();
						await saveForm(ctx, form);
					}

					ctx.log.info(
						`FormForge: Deleted submission ${submissionId} from form ${formId}`
					);

					return { success: true };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`SubmissionsDelete error: ${String(error)}`);
					throw new Response(
						JSON.stringify({
							error: "Failed to delete submission",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}
			},
		},

		/**
		 * GET /formforge/submissionsExport
		 * Export all submissions for a form as CSV.
		 *
		 * Query: { formId: string }
		 * Returns: { csv: string, filename: string, total: number }
		 */
		submissionsExport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const formId = String(input.formId ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID is required" }),
							{
								status: 400,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const form = await getForm(ctx, formId);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{
								status: 404,
								headers: { "Content-Type": "application/json" },
							}
						);
					}

					const allIds = await getSubmissionsList(ctx, formId);
					const submissions: FormSubmission[] = [];
					for (const id of allIds) {
						const sub = await getSubmission(ctx, formId, id);
						if (sub) submissions.push(sub);
					}

					// Build CSV
					const fieldIds = form.fields.map((f) => f.id);
					const fieldLabels = form.fields.map((f) => f.label);

					// CSV header
					const csvHeaders = [
						"Submission ID",
						"Submitted At",
						...fieldLabels,
						"IP",
					];

					const escapeCSV = (val: string): string => {
						if (
							val.includes(",") ||
							val.includes('"') ||
							val.includes("\n")
						) {
							return `"${val.replace(/"/g, '""')}"`;
						}
						return val;
					};

					const rows = [csvHeaders.map(escapeCSV).join(",")];

					for (const sub of submissions) {
						const row = [
							sub.id,
							sub.submittedAt,
							...fieldIds.map((fid) => sub.data[fid] || ""),
							sub.ip || "",
						];
						rows.push(row.map(escapeCSV).join(","));
					}

					const csv = rows.join("\n");
					const safeName = form.name
						.replace(/[^a-zA-Z0-9]/g, "-")
						.toLowerCase();
					const filename = `${safeName}-submissions-${new Date().toISOString().slice(0, 10)}.csv`;

					ctx.log.info(
						`FormForge: Exported ${submissions.length} submissions from "${form.name}"`
					);

					return {
						csv,
						filename,
						total: submissions.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`SubmissionsExport error: ${String(error)}`);
					throw new Response(
						JSON.stringify({
							error: "Failed to export submissions",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}
			},
		},

		// ─── Settings ────────────────────────────────────────────────────

		/**
		 * POST /formforge/settingsUpdate
		 * Update global FormForge settings.
		 *
		 * Body: { defaultNotifyEmails?: string[], honeypotFieldName?: string, rateLimitPerForm?: number, rateLimitWindowMinutes?: number }
		 * Returns: { success: true, settings: FormForgeSettings }
		 */
		settingsUpdate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;

					const settings = await getSettings(ctx);

					if (input.defaultNotifyEmails !== undefined) {
						settings.defaultNotifyEmails =
							input.defaultNotifyEmails as string[];
					}

					if (input.honeypotFieldName !== undefined) {
						settings.honeypotFieldName = String(
							input.honeypotFieldName
						).trim();
					}

					if (input.rateLimitPerForm !== undefined) {
						const val = parseInt(
							String(input.rateLimitPerForm),
							10
						);
						if (!isNaN(val) && val > 0) {
							settings.rateLimitPerForm = val;
						}
					}

					if (input.rateLimitWindowMinutes !== undefined) {
						const val = parseInt(
							String(input.rateLimitWindowMinutes),
							10
						);
						if (!isNaN(val) && val > 0) {
							settings.rateLimitWindowMinutes = val;
						}
					}

					await saveSettings(ctx, settings);

					ctx.log.info("FormForge: Settings updated");

					return { success: true, settings };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`SettingsUpdate error: ${String(error)}`);
					throw new Response(
						JSON.stringify({
							error: "Failed to update settings",
						}),
						{
							status: 500,
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
				}
			},
		},

		// ─── Health ──────────────────────────────────────────────────────

		/**
		 * GET /formforge/health
		 * Health check endpoint listing plugin capabilities.
		 *
		 * Returns: { status: "healthy", plugin: "formforge", version: "1.0.0", capabilities: [...] }
		 */
		health: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const formIds = await getFormsList(ctx);

					return {
						status: "healthy",
						plugin: "formforge",
						version: "1.0.0",
						capabilities: [
							"form-crud",
							"templates",
							"conditional-logic",
							"honeypot-spam-protection",
							"rate-limiting",
							"email-notifications",
							"auto-response",
							"webhooks",
							"csv-export",
							"multi-step-forms",
						],
						templates: Object.keys(TEMPLATES),
						stats: {
							totalForms: formIds.length,
						},
					};
				} catch (error) {
					ctx.log.error(`Health check error: ${String(error)}`);
					return {
						status: "degraded",
						plugin: "formforge",
						version: "1.0.0",
						error: String(error),
					};
				}
			},
		},
	},
});
