/**
 * Test helpers: mock PluginContext, KV store, and route invocation utilities.
 * Mirrors the EventDash test infrastructure pattern.
 */
import { vi } from "vitest";

/**
 * In-memory KV store for testing.
 * Simulates ctx.kv with get/set/delete/list.
 */
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

/**
 * Create a mock PluginContext for testing.
 */
export function createMockContext(kvOverride?: MockKV) {
	const kv = kvOverride ?? createMockKV();

	const emailSend = vi.fn().mockResolvedValue(undefined);

	return {
		kv,
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		},
		plugin: { id: "membership", version: "1.0.0" },
		site: { url: "https://test.example.com", name: "Test Site" },
		url: (path: string) => `https://test.example.com${path}`,
		email: {
			send: emailSend,
		},
		env: {},
	};
}

/**
 * Build a routeCtx object matching what the sandbox routes expect.
 */
export function buildRouteCtx(opts: {
	input?: Record<string, unknown>;
	pathParams?: Record<string, string>;
	user?: { isAdmin?: boolean; email?: string };
	rawBody?: string;
}) {
	return {
		input: opts.input ?? {},
		pathParams: opts.pathParams,
		user: opts.user,
		rawBody: opts.rawBody,
	};
}

/**
 * Seed a member record into the KV store and update members:list.
 */
export async function seedMember(
	kv: MockKV,
	member: {
		email: string;
		plan: string;
		status: "pending" | "active" | "revoked" | "cancelled" | "past_due";
		createdAt?: string;
		joinDate?: string;
		expiresAt?: string;
		stripeCustomerId?: string;
		stripeSubscriptionId?: string;
		planInterval?: "month" | "year" | "once";
		paymentMethod?: "stripe" | "paypal" | "manual";
	}
) {
	const encodedEmail = encodeURIComponent(member.email.toLowerCase().trim());
	const record = {
		email: member.email.toLowerCase().trim(),
		plan: member.plan,
		status: member.status,
		createdAt: member.createdAt ?? new Date().toISOString(),
		joinDate: member.joinDate ?? new Date().toISOString(),
		expiresAt: member.expiresAt,
		stripeCustomerId: member.stripeCustomerId,
		stripeSubscriptionId: member.stripeSubscriptionId,
		planInterval: member.planInterval,
		paymentMethod: member.paymentMethod ?? "stripe",
	};

	await kv.set(`member:${encodedEmail}`, JSON.stringify(record));

	const listJson = await kv.get<string>("members:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(encodedEmail)) {
		list.push(encodedEmail);
	}
	await kv.set("members:list", JSON.stringify(list));
}

/**
 * Seed default plans into KV.
 */
export async function seedDefaultPlans(kv: MockKV) {
	const plans = [
		{
			id: "free",
			name: "Free",
			price: 0,
			interval: "once" as const,
			description: "Free tier access",
			features: ["Basic content"],
		},
		{
			id: "pro",
			name: "Pro",
			price: 1999,
			interval: "month" as const,
			description: "Monthly access to all content",
			features: ["All content", "Community access"],
			paymentLink: "https://buy.stripe.com/test_pro",
		},
		{
			id: "premium",
			name: "Premium",
			price: 4999,
			interval: "year" as const,
			description: "Annual access with priority support",
			features: ["All content", "Priority support", "Early access to new content", "Annual digest report"],
			paymentLink: "https://buy.stripe.com/test_premium",
			dripSchedule: [
				{ contentId: "lesson-1", daysAfterJoin: 0 },
				{ contentId: "lesson-2", daysAfterJoin: 7 },
				{ contentId: "lesson-3", daysAfterJoin: 14 },
			],
		},
	];
	await kv.set("plans", JSON.stringify(plans));
}

/**
 * Seed a gating rule into KV.
 */
export async function seedGatingRule(
	kv: MockKV,
	rule: {
		contentId: string;
		type: "membership" | "drip";
		planIds: string[];
		dripDays?: number;
	}
) {
	const ruleRecord = {
		contentId: rule.contentId,
		type: rule.type,
		planIds: rule.planIds,
		dripDays: rule.dripDays,
	};

	await kv.set(`gating-rule:${rule.contentId}`, JSON.stringify(ruleRecord));

	const listJson = await kv.get<string>("gating-rules:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(rule.contentId)) {
		list.push(rule.contentId);
	}
	await kv.set("gating-rules:list", JSON.stringify(list));
}

/**
 * Seed a form definition into KV.
 */
export async function seedForm(
	kv: MockKV,
	form: {
		id: string;
		name: string;
		fields: Array<{
			id: string;
			type: "text" | "email" | "dropdown" | "checkbox" | "phone";
			label: string;
			required: boolean;
			options?: string[];
			placeholder?: string;
		}>;
		steps?: Array<{ label: string; fieldIds: string[] }>;
	}
) {
	const record = {
		id: form.id,
		name: form.name,
		fields: form.fields,
		steps: form.steps,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	await kv.set(`form:${form.id}`, JSON.stringify(record));

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
 * Seed a group into KV.
 */
export async function seedGroup(
	kv: MockKV,
	group: {
		id: string;
		orgName: string;
		orgEmail: string;
		adminEmail: string;
		planId: string;
		maxSeats: number;
		members?: string[];
	}
) {
	const record = {
		id: group.id,
		orgName: group.orgName,
		orgEmail: group.orgEmail,
		adminEmail: group.adminEmail,
		planId: group.planId,
		maxSeats: group.maxSeats,
		members: group.members ?? [group.adminEmail],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	await kv.set(`group:${group.id}`, JSON.stringify(record));

	const listJson = await kv.get<string>("groups:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(group.id)) {
		list.push(group.id);
	}
	await kv.set("groups:list", JSON.stringify(list));
}

/**
 * Seed a group invite into KV.
 */
export async function seedGroupInvite(
	kv: MockKV,
	invite: {
		code: string;
		groupId: string;
		email?: string;
		expiresAt?: string;
		createdBy?: string;
	}
) {
	const record = {
		code: invite.code,
		groupId: invite.groupId,
		email: invite.email,
		expiresAt: invite.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
		createdAt: new Date().toISOString(),
		createdBy: invite.createdBy ?? "admin@test.com",
	};

	await kv.set(`group:invite:${invite.code}`, JSON.stringify(record));
}

/**
 * Seed a webhook endpoint into KV.
 */
export async function seedWebhook(
	kv: MockKV,
	webhook: {
		id: string;
		url: string;
		events: string[];
		secret: string;
		active?: boolean;
		failedCount?: number;
	}
) {
	const record = {
		id: webhook.id,
		url: webhook.url,
		events: webhook.events,
		secret: webhook.secret,
		active: webhook.active ?? true,
		createdAt: new Date().toISOString(),
		failedCount: webhook.failedCount ?? 0,
	};

	await kv.set(`webhook:${webhook.id}`, JSON.stringify(record));

	const listJson = await kv.get<string>("webhooks:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(webhook.id)) {
		list.push(webhook.id);
	}
	await kv.set("webhooks:list", JSON.stringify(list));
}
