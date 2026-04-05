/**
 * Test helpers: mock PluginContext, KV store, and route invocation utilities.
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

	return {
		kv,
		log: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
		},
		plugin: { id: "eventdash", version: "1.0.0" },
		site: { url: "https://test.example.com", name: "Test Site" },
		url: (path: string) => `https://test.example.com${path}`,
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
}) {
	return {
		input: opts.input ?? {},
		pathParams: opts.pathParams,
		user: opts.user,
	};
}

/**
 * Create a standard Sunrise Yoga Studio event for testing.
 */
export function sunriseYogaEvent(overrides?: Partial<{
	id: string;
	date: string;
	time: string;
	endTime: string;
	capacity: number;
	registered: number;
	requiresPayment: boolean;
}>) {
	return {
		id: overrides?.id ?? "yoga-001",
		title: "Sunrise Yoga Flow",
		description: "Start your day with an energizing 60-minute yoga flow. All levels welcome.",
		date: overrides?.date ?? "2026-05-15",
		time: overrides?.time ?? "06:00",
		endTime: overrides?.endTime ?? "07:00",
		location: "Sunrise Yoga Studio - Main Room",
		capacity: overrides?.capacity ?? 20,
		registered: overrides?.registered ?? 0,
		createdAt: "2026-04-01T00:00:00.000Z",
		requiresPayment: overrides?.requiresPayment ?? false,
		totalRevenue: 0,
	};
}

/**
 * Seed an event into KV store and update events:list.
 */
export async function seedEvent(
	kv: MockKV,
	event: ReturnType<typeof sunriseYogaEvent>
) {
	await kv.set(`event:${event.id}`, JSON.stringify(event));

	const listJson = await kv.get<string>("events:list");
	let list: string[] = [];
	if (listJson) {
		try {
			list = JSON.parse(listJson);
		} catch {
			list = [];
		}
	}
	if (!list.includes(event.id)) {
		list.push(event.id);
	}
	await kv.set("events:list", JSON.stringify(list));
}

/**
 * Seed a registration into KV store and update attendees list.
 */
export async function seedRegistration(
	kv: MockKV,
	eventId: string,
	registration: {
		email: string;
		name: string;
		status?: "registered" | "cancelled";
		ticketCount?: number;
		checkInCode?: string;
		checkedIn?: boolean;
		checkedInAt?: string;
		ticketType?: string;
		amountPaid?: number;
		paymentStatus?: "pending" | "paid" | "refunded";
	}
) {
	const encodedEmail = encodeURIComponent(registration.email.toLowerCase().trim());
	const regKey = `registration:${eventId}:${encodedEmail}`;

	const record = {
		email: registration.email.toLowerCase().trim(),
		name: registration.name,
		status: registration.status ?? "registered",
		ticketCount: registration.ticketCount ?? 1,
		createdAt: new Date().toISOString(),
		checkInCode: registration.checkInCode ?? generateTestCheckInCode(),
		checkedIn: registration.checkedIn ?? false,
		...(registration.checkedInAt && { checkedInAt: registration.checkedInAt }),
		...(registration.ticketType && { ticketType: registration.ticketType }),
		...(registration.amountPaid !== undefined && { amountPaid: registration.amountPaid }),
		...(registration.paymentStatus && { paymentStatus: registration.paymentStatus }),
	};

	await kv.set(regKey, JSON.stringify(record));

	// Update attendees list
	const attendeesJson = await kv.get<string>("event-attendees:list");
	let attendees: string[] = [];
	if (attendeesJson) {
		try {
			attendees = JSON.parse(attendeesJson);
		} catch {
			attendees = [];
		}
	}
	if (!attendees.includes(encodedEmail)) {
		attendees.push(encodedEmail);
	}
	await kv.set("event-attendees:list", JSON.stringify(attendees));
}

let codeCounter = 0;
function generateTestCheckInCode(): string {
	codeCounter++;
	const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	let n = codeCounter;
	for (let i = 0; i < 6; i++) {
		code += base[n % 36];
		n = Math.floor(n / 36);
	}
	return code;
}
