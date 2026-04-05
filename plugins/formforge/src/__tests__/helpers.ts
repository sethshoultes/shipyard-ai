/**
 * Test helpers: mock PluginContext, KV store, and seed utilities for FormForge.
 */
import { vi } from "vitest";

// ============================================================================
// Mock KV Store
// ============================================================================

export interface MockKV {
	_store: Map<string, string>;
	get: <T>(key: string) => Promise<T | null>;
	set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<void>;
	delete: (key: string) => Promise<boolean>;
	list: (prefix?: string) => Promise<Array<{ key: string; value: unknown }>>;
}

export function createMockKV(): MockKV {
	const store = new Map<string, string>();

	return {
		_store: store,
		get: vi.fn(async <T>(key: string): Promise<T | null> => {
			const val = store.get(key);
			return val !== undefined ? (val as unknown as T) : null;
		}),
		set: vi.fn(async (key: string, value: unknown, _opts?: { ex?: number }): Promise<void> => {
			store.set(key, typeof value === "string" ? value : JSON.stringify(value));
		}),
		delete: vi.fn(async (key: string): Promise<boolean> => {
			return store.delete(key);
		}),
		list: vi.fn(async (prefix?: string): Promise<Array<{ key: string; value: unknown }>> => {
			const results: Array<{ key: string; value: unknown }> = [];
			for (const [k, v] of store.entries()) {
				if (!prefix || k.startsWith(prefix)) {
					results.push({ key: k, value: v });
				}
			}
			return results;
		}),
	};
}

// ============================================================================
// Mock Plugin Context
// ============================================================================

export function createMockContext(kvOverride?: MockKV) {
	const kv = kvOverride ?? createMockKV();

	return {
		kv,
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		},
		plugin: { id: "formforge", version: "1.0.0" },
		site: { url: "https://test.example.com", name: "Test Site" },
		url: (path: string) => `https://test.example.com${path}`,
		env: {},
	};
}

// ============================================================================
// Route Context Builder
// ============================================================================

export function buildRouteCtx(opts: {
	input?: Record<string, unknown>;
	pathParams?: Record<string, string>;
	user?: { isAdmin?: boolean; email?: string };
}) {
	return {
		input: opts.input ?? {},
		pathParams: opts.pathParams,
		user: opts.user,
	};
}

// ============================================================================
// Seed Utilities
// ============================================================================

/**
 * Create a standard contact form definition for testing.
 */
export function contactFormDef(overrides?: Partial<{
	id: string;
	name: string;
	fields: unknown[];
	totalSubmissions: number;
	notifyEmails: string[];
	autoResponse: { enabled: boolean; subject: string; body: string };
}>) {
	return {
		id: overrides?.id ?? "form-001",
		name: overrides?.name ?? "Contact Form",
		description: "Test contact form",
		fields: overrides?.fields ?? [
			{ id: "name", type: "text", label: "Full Name", placeholder: "Your name", required: true },
			{ id: "email", type: "email", label: "Email Address", placeholder: "you@example.com", required: true },
			{ id: "subject", type: "text", label: "Subject", placeholder: "What is this about?", required: true },
			{ id: "message", type: "textarea", label: "Message", placeholder: "Your message...", required: true },
		],
		createdAt: "2026-04-01T00:00:00.000Z",
		updatedAt: "2026-04-01T00:00:00.000Z",
		totalSubmissions: overrides?.totalSubmissions ?? 0,
		submissionsThisWeek: 0,
		...(overrides?.notifyEmails && { notifyEmails: overrides.notifyEmails }),
		...(overrides?.autoResponse && { autoResponse: overrides.autoResponse }),
	};
}

/**
 * Create a form with conditional logic fields for testing.
 */
export function conditionalFormDef(overrides?: Partial<{ id: string }>) {
	return {
		id: overrides?.id ?? "form-conditional",
		name: "Conditional Form",
		description: "Form with conditional logic",
		fields: [
			{ id: "inquiry_type", type: "dropdown" as const, label: "Inquiry Type", required: true, options: ["General", "Support", "Other"] },
			{ id: "other_details", type: "textarea" as const, label: "Please specify", required: true, showWhen: { fieldId: "inquiry_type", operator: "equals" as const, value: "Other" } },
			{ id: "email", type: "email" as const, label: "Email", required: true },
		],
		createdAt: "2026-04-01T00:00:00.000Z",
		updatedAt: "2026-04-01T00:00:00.000Z",
		totalSubmissions: 0,
		submissionsThisWeek: 0,
	};
}

/**
 * Create a form with all 10 field types for testing.
 */
export function allFieldTypesFormDef() {
	return {
		id: "form-all-types",
		name: "All Field Types Form",
		description: "Form with every supported field type",
		fields: [
			{ id: "f_text", type: "text" as const, label: "Text Field", required: true },
			{ id: "f_email", type: "email" as const, label: "Email Field", required: true },
			{ id: "f_textarea", type: "textarea" as const, label: "Textarea Field", required: false },
			{ id: "f_number", type: "number" as const, label: "Number Field", required: false },
			{ id: "f_phone", type: "phone" as const, label: "Phone Field", required: false },
			{ id: "f_date", type: "date" as const, label: "Date Field", required: false },
			{ id: "f_dropdown", type: "dropdown" as const, label: "Dropdown Field", required: false, options: ["A", "B", "C"] },
			{ id: "f_radio", type: "radio" as const, label: "Radio Field", required: false, options: ["X", "Y", "Z"] },
			{ id: "f_checkbox", type: "checkbox" as const, label: "Checkbox Field", required: false },
			{ id: "f_hidden", type: "hidden" as const, label: "Hidden Field", required: false, defaultValue: "tracking-123" },
		],
		createdAt: "2026-04-01T00:00:00.000Z",
		updatedAt: "2026-04-01T00:00:00.000Z",
		totalSubmissions: 0,
		submissionsThisWeek: 0,
	};
}

/**
 * Seed a form into KV store and update forms:list.
 */
export async function seedForm(
	kv: MockKV,
	form: ReturnType<typeof contactFormDef>
) {
	await kv.set(`form:${form.id}`, JSON.stringify(form));

	const listJson = await kv.get<string>("forms:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(form.id)) {
		list.push(form.id);
	}
	await kv.set("forms:list", JSON.stringify(list));
}

/**
 * Seed a submission into KV store and update the submission list.
 */
export async function seedSubmission(
	kv: MockKV,
	formId: string,
	submission: {
		id: string;
		data: Record<string, string>;
		submittedAt?: string;
		ip?: string;
	}
) {
	const record = {
		id: submission.id,
		formId,
		data: submission.data,
		submittedAt: submission.submittedAt ?? new Date().toISOString(),
		ip: submission.ip ?? "127.0.0.1",
	};

	await kv.set(`submission:${formId}:${submission.id}`, JSON.stringify(record));

	const listJson = await kv.get<string>(`submissions:${formId}:list`);
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(submission.id)) {
		list.push(submission.id);
	}
	await kv.set(`submissions:${formId}:list`, JSON.stringify(list));
}
