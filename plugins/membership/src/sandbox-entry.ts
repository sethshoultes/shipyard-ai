import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";
import {
	signJWT,
	verifyJWT,
	extractToken,
	createPayload,
	type JWTPayload,
} from "./auth";
import {
	createWelcomeTemplate,
	createPaymentReceiptTemplate,
	createRenewalReminderTemplate,
	createPaymentFailedTemplate,
	createExpiringTemplate,
	createCancellationTemplate,
	createUpgradeTemplate,
	createDripUnlockTemplate,
	sendMembershipEmail,
	checkEmailRateLimit,
	type EmailVariables,
} from "./email";

/**
 * Type definitions
 */

interface MemberRecord {
	email: string;
	plan: string;
	status: "pending" | "active" | "revoked" | "cancelled" | "past_due";
	paymentLink?: string;
	createdAt: string;
	expiresAt?: string;
	approvedAt?: string;
	// Stripe integration fields
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	stripePaymentMethod?: string; // Last 4 digits + brand for display
	planInterval?: "month" | "year" | "once";
	currentPeriodEnd?: string; // ISO date — when current billing period ends
	cancelAtPeriodEnd?: boolean; // True if scheduled to cancel
	lastSyncAt?: string; // Last webhook sync timestamp
	// Phase 3: Content gating fields
	joinDate?: string; // ISO date — when subscription first created (for drip content)
	contentAccess?: string[]; // Array of content/page IDs member can access
	// Phase 4 Wave 2: Multi-gateway support
	paymentMethod?: "stripe" | "paypal" | "manual"; // Default: "stripe"
}

/**
 * Phase 4: Group memberships
 */
interface GroupRecord {
	id: string; // UUID
	orgName: string;
	orgEmail: string;
	adminEmail: string; // Original group creator
	planId: string;
	maxSeats: number;
	members: string[]; // Array of member emails
	stripeCustomerId?: string;
	createdAt: string;
	updatedAt: string;
}

interface GroupInviteCode {
	code: string; // UUID
	groupId: string;
	email?: string; // Optional: pre-filled invite email
	expiresAt: string; // ISO date
	createdAt: string;
	createdBy: string; // Admin email who sent invite
}

/**
 * Phase 4: Developer webhooks
 */
interface WebhookEndpoint {
	id: string; // UUID
	url: string;
	events: string[]; // e.g., ["member.created", "member.cancelled"]
	secret: string; // HMAC secret for signing payloads
	active: boolean;
	createdAt: string;
	lastFiredAt?: string;
	failedCount: number;
}

interface WebhookLog {
	id: string;
	webhookId: string;
	eventType: string;
	payload: string; // JSON stringified
	responseCode?: number;
	responseBody?: string;
	firedAt: string;
	success: boolean;
}

/**
 * Phase 4 Wave 2: Registration Forms
 */
interface FormFieldDefinition {
	id: string;
	type: "text" | "email" | "dropdown" | "checkbox" | "phone";
	label: string;
	required: boolean;
	options?: string[]; // For dropdown type
	placeholder?: string;
}

/**
 * Phase 5 Wave 1: Multi-step form support
 * Each step groups a subset of fields into a wizard page.
 * When `steps` is undefined or empty, the form renders as a single page (backward compatible).
 */
interface FormStep {
	label: string;
	fieldIds: string[]; // References FormFieldDefinition.id values
}

interface FormDefinition {
	id: string;
	name: string;
	description?: string;
	fields: FormFieldDefinition[];
	steps?: FormStep[]; // Optional — if present, form renders as wizard
	createdAt: string;
	updatedAt: string;
}

interface FormSubmission {
	id: string;
	formId: string;
	data: Record<string, unknown>;
	submittedAt: string;
}

interface PlanConfig {
	id: string;
	name: string;
	price: number;
	interval: "once" | "month" | "year";
	description: string;
	paymentLink?: string;
	features: string[];
	// Phase 3: Drip content schedule
	dripSchedule?: Array<{
		contentId: string;
		daysAfterJoin: number; // Unlock after N days
	}>;
}

interface AdminInteraction {
	type: string;
	page?: string;
	widgetId?: string;
	action?: string;
	email?: string;
	plan?: PlanConfig;
	planId?: string;
}

interface CouponRecord {
	code: string;
	discountType: "percent" | "fixed";
	discountAmount: number; // Percentage (1-100) or cents (e.g., 500 for $5)
	expiresAt?: string; // ISO date string
	maxUses?: number; // Unlimited if not set
	usedCount: number;
	applicablePlans?: string[]; // Restrict to specific plans; empty = all plans
	createdAt: string;
	description?: string; // Admin notes
}

/**
 * Utility: Validate email format
 */
function isValidEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

/**
 * Utility: Generate unique IDs
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Utility: Generate UUID v4
 */
function generateUUID(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Utility: Generate HMAC-SHA256 webhook signature
 */
async function generateWebhookSignature(payload: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);
	const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
	return Array.from(new Uint8Array(sig))
		.map(b => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * PHASE 4 WAVE 3: Task 13 - Advanced Webhooks — Retry + Signing
 * Enhanced webhook firing with HMAC-SHA256 signing, retry with exponential backoff,
 * and rate limiting (max 100 fires/min).
 */

/** Track webhook fires per minute for rate limiting */
let webhookFireTimestamps: number[] = [];

/**
 * Utility: Check webhook rate limit (100/min)
 */
function isWebhookRateLimited(): boolean {
	const now = Date.now();
	const oneMinuteAgo = now - 60_000;
	webhookFireTimestamps = webhookFireTimestamps.filter(t => t > oneMinuteAgo);
	return webhookFireTimestamps.length >= 100;
}

/**
 * Utility: Fire webhook to registered endpoint with retry + signing
 */
async function fireWebhook(
	endpoint: WebhookEndpoint,
	eventType: string,
	data: Record<string, any>,
	ctx: PluginContext
): Promise<WebhookLog> {
	const payload = JSON.stringify({
		event: eventType,
		timestamp: new Date().toISOString(),
		data,
	});

	const signature = await generateWebhookSignature(payload, endpoint.secret);

	let responseCode: number | undefined;
	let responseBody: string | undefined;
	let success = false;

	// Rate limit check — if over 100/min, queue/skip
	if (isWebhookRateLimited()) {
		ctx.log.warn(`Webhook rate limited: ${endpoint.id} for ${eventType}`);
		const log: WebhookLog = {
			id: generateUUID(),
			webhookId: endpoint.id,
			eventType,
			payload,
			responseCode: 429,
			responseBody: "Rate limited — exceeded 100 fires/min",
			firedAt: new Date().toISOString(),
			success: false,
		};
		await ctx.kv.set(`webhook:log:${log.id}`, JSON.stringify(log));
		const logsJson = await ctx.kv.get<string>(`webhook:${endpoint.id}:logs`);
		const logs = parseJSON<string[]>(logsJson, []);
		logs.push(log.id);
		if (logs.length > 100) logs.shift();
		await ctx.kv.set(`webhook:${endpoint.id}:logs`, JSON.stringify(logs));
		return log;
	}

	// Retry with exponential backoff: 1s, 4s, 16s
	const maxRetries = 3;
	const backoffBase = 1000;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		if (attempt > 0) {
			const delay = backoffBase * Math.pow(4, attempt - 1);
			ctx.log.info(`Webhook retry ${attempt}/${maxRetries} for ${endpoint.id} after ${delay}ms`);
			await new Promise(resolve => setTimeout(resolve, delay));
		}

		try {
			const response = await fetch(endpoint.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Shipyard-Signature": `sha256=${signature}`,
					"X-Webhook-Signature": `sha256=${signature}`,
					"X-Shipyard-Event": eventType,
				},
				body: payload,
			});
			responseCode = response.status;
			success = response.ok;
			try {
				responseBody = await response.text();
			} catch {
				responseBody = "(response unreadable)";
			}

			if (success) break;
		} catch (error) {
			responseCode = 0;
			responseBody = String(error);
			success = false;
		}

		if (attempt < maxRetries) {
			ctx.log.warn(`Webhook attempt ${attempt + 1} failed for ${endpoint.id}: ${responseCode}`);
		}
	}

	// Track for rate limiting
	webhookFireTimestamps.push(Date.now());

	const log: WebhookLog = {
		id: generateUUID(),
		webhookId: endpoint.id,
		eventType,
		payload,
		responseCode,
		responseBody,
		firedAt: new Date().toISOString(),
		success,
	};

	// Store webhook log
	await ctx.kv.set(`webhook:log:${log.id}`, JSON.stringify(log));

	// Add to webhook's log list
	const logsJson = await ctx.kv.get<string>(`webhook:${endpoint.id}:logs`);
	const logs = parseJSON<string[]>(logsJson, []);
	logs.push(log.id);
	// Keep last 100 logs
	if (logs.length > 100) logs.shift();
	await ctx.kv.set(`webhook:${endpoint.id}:logs`, JSON.stringify(logs));

	// Update endpoint's last fired time
	if (success) {
		endpoint.lastFiredAt = log.firedAt;
		endpoint.failedCount = 0;
	} else {
		endpoint.failedCount++;
	}
	await ctx.kv.set(`webhook:${endpoint.id}`, JSON.stringify(endpoint));

	return log;
}

/**
 * PHASE 4 WAVE 3: Task 15 - Input validation helpers
 */
function validateStringInput(value: string, maxLen: number, fieldName: string): string {
	if (value.length > maxLen) {
		throw new Response(
			JSON.stringify({ error: `${fieldName} exceeds max length of ${maxLen}` }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
	return value;
}

function validateId(id: string, fieldName: string): string {
	if (!id || id.length === 0 || id.length > 128) {
		throw new Response(
			JSON.stringify({ error: `Invalid ${fieldName}: must be non-empty and under 128 chars` }),
			{ status: 400, headers: { "Content-Type": "application/json" } }
		);
	}
	return id;
}

/**
 * Utility: Parse JSON safely
 */
function parseJSON<T>(json: string | undefined | null, fallback: T): T {
	if (!json) return fallback;
	try {
		return JSON.parse(json) as T;
	} catch {
		return fallback;
	}
}

/**
 * Utility: Encode email for safe KV key usage
 * URL-encodes the email to prevent key injection/traversal attacks
 */
function emailToKvKey(email: string): string {
	return encodeURIComponent(email.toLowerCase().trim());
}

/**
 * Utility: Verify Stripe webhook signature using HMAC-SHA256
 */
async function verifyStripeSignature(
	payload: string,
	signature: string,
	secret: string
): Promise<boolean> {
	try {
		const parts = signature.split(",");
		const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
		const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);

		if (!timestamp || !v1) return false;

		const signedPayload = `${timestamp}.${payload}`;

		// Import HMAC key
		const key = await crypto.subtle.importKey(
			"raw",
			new TextEncoder().encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"]
		);

		// Sign the payload
		const sig = await crypto.subtle.sign(
			"HMAC",
			key,
			new TextEncoder().encode(signedPayload)
		);

		// Convert signature to hex
		const expected = Array.from(new Uint8Array(sig))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		return expected === v1;
	} catch (error) {
		return false;
	}
}

/**
 * Utility: Look up member by Stripe customer ID
 */
async function getMemberByStripeCustomerId(
	customerId: string,
	ctx: PluginContext
): Promise<MemberRecord | null> {
	try {
		// Get members list and search
		const listJson = await ctx.kv.get<string>("members:list");
		const memberEmails = parseJSON<string[]>(listJson, []);

		for (const encodedEmail of memberEmails) {
			const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
			if (memberJson) {
				const member = parseJSON<MemberRecord>(memberJson, null as any);
				if (member && member.stripeCustomerId === customerId) {
					return member;
				}
			}
		}
		return null;
	} catch (error) {
		ctx.log.error(`Failed to lookup member by customerId: ${String(error)}`);
		return null;
	}
}

/**
 * Utility: Update member record in KV
 */
async function updateMember(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	const encodedEmail = emailToKvKey(member.email);
	await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));
}

/**
 * Webhook handler: customer.subscription.created
 */
async function handleSubscriptionCreated(
	subscription: Record<string, any>,
	ctx: PluginContext
): Promise<void> {
	try {
		const customerId = String(subscription.customer ?? "");
		const subscriptionId = String(subscription.id ?? "");
		const status = String(subscription.status ?? "");
		const currentPeriodEnd = subscription.current_period_end as number | undefined;

		if (!customerId || !subscriptionId) return;

		const member = await getMemberByStripeCustomerId(customerId, ctx);
		if (!member) {
			ctx.log.warn(`Member not found for customer ${customerId}`);
			return;
		}

		// Update member
		member.stripeSubscriptionId = subscriptionId;
		member.lastSyncAt = new Date().toISOString();
		member.paymentMethod = "stripe"; // Tag payment method from Stripe webhook

		// Set join date on first subscription (for drip content)
		if (!member.joinDate) {
			member.joinDate = new Date().toISOString();
		}

		if (status === "active" || status === "trialing") {
			member.status = "active";
		}

		if (currentPeriodEnd) {
			member.currentPeriodEnd = new Date(currentPeriodEnd * 1000).toISOString();
			member.expiresAt = member.currentPeriodEnd;
		}

		await updateMember(member, ctx);
		ctx.log.info(
			`Subscription created for ${member.email}: ${subscriptionId}`
		);

		// Send welcome email (async, don't fail webhook)
		sendWelcomeEmail(member, ctx).catch((err) =>
			ctx.log.warn(`Email send failed: ${String(err)}`)
		);
	} catch (error) {
		ctx.log.error(`handleSubscriptionCreated error: ${String(error)}`);
	}
}

/**
 * Webhook handler: customer.subscription.updated
 */
async function handleSubscriptionUpdated(
	subscription: Record<string, any>,
	ctx: PluginContext
): Promise<void> {
	try {
		const customerId = String(subscription.customer ?? "");
		const subscriptionId = String(subscription.id ?? "");
		const currentPeriodEnd = subscription.current_period_end as number | undefined;

		if (!customerId || !subscriptionId) return;

		const member = await getMemberByStripeCustomerId(customerId, ctx);
		if (!member) {
			ctx.log.warn(`Member not found for customer ${customerId}`);
			return;
		}

		// Update period end if changed
		if (currentPeriodEnd) {
			const newExpiryDate = new Date(currentPeriodEnd * 1000).toISOString();
			if (newExpiryDate !== member.currentPeriodEnd) {
				member.currentPeriodEnd = newExpiryDate;
				member.expiresAt = newExpiryDate;
				member.lastSyncAt = new Date().toISOString();

				await updateMember(member, ctx);
				ctx.log.info(
					`Subscription updated for ${member.email}: renewal ${newExpiryDate}`
				);

				// Send update email
				sendUpdateEmail(member, ctx).catch((err) =>
					ctx.log.warn(`Email send failed: ${String(err)}`)
				);
			}
		}
	} catch (error) {
		ctx.log.error(`handleSubscriptionUpdated error: ${String(error)}`);
	}
}

/**
 * Webhook handler: customer.subscription.deleted
 */
async function handleSubscriptionDeleted(
	subscription: Record<string, any>,
	ctx: PluginContext
): Promise<void> {
	try {
		const customerId = String(subscription.customer ?? "");

		if (!customerId) return;

		const member = await getMemberByStripeCustomerId(customerId, ctx);
		if (!member) {
			ctx.log.warn(`Member not found for customer ${customerId}`);
			return;
		}

		member.status = "cancelled";
		member.stripeSubscriptionId = undefined;
		member.lastSyncAt = new Date().toISOString();

		await updateMember(member, ctx);
		ctx.log.info(`Subscription cancelled for ${member.email}`);

		// Send farewell email
		sendCancelledEmail(member, ctx).catch((err) =>
			ctx.log.warn(`Email send failed: ${String(err)}`)
		);
	} catch (error) {
		ctx.log.error(`handleSubscriptionDeleted error: ${String(error)}`);
	}
}

/**
 * Webhook handler: invoice.payment_succeeded
 */
async function handlePaymentSucceeded(
	invoice: Record<string, any>,
	ctx: PluginContext
): Promise<void> {
	try {
		const customerId = invoice.customer as string | undefined;

		if (!customerId) return;

		const member = await getMemberByStripeCustomerId(customerId, ctx);
		if (!member) {
			ctx.log.warn(`Member not found for customer ${customerId}`);
			return;
		}

		// If member was past due, restore to active
		if (member.status === "past_due") {
			member.status = "active";
			member.lastSyncAt = new Date().toISOString();
			await updateMember(member, ctx);
			ctx.log.info(`Payment recovered for ${member.email}`);

			// Send payment received email
			sendPaymentReceivedEmail(member, ctx).catch((err) =>
				ctx.log.warn(`Email send failed: ${String(err)}`)
			);
		}
	} catch (error) {
		ctx.log.error(`handlePaymentSucceeded error: ${String(error)}`);
	}
}

/**
 * Webhook handler: invoice.payment_failed
 */
async function handlePaymentFailed(
	invoice: Record<string, any>,
	ctx: PluginContext
): Promise<void> {
	try {
		const customerId = invoice.customer as string | undefined;

		if (!customerId) return;

		const member = await getMemberByStripeCustomerId(customerId, ctx);
		if (!member) {
			ctx.log.warn(`Member not found for customer ${customerId}`);
			return;
		}

		member.status = "past_due";
		member.lastSyncAt = new Date().toISOString();

		await updateMember(member, ctx);
		ctx.log.info(`Payment failed for ${member.email}`);

		// Send payment failed alert email
		sendPaymentFailedEmail(member, ctx).catch((err) =>
			ctx.log.warn(`Email send failed: ${String(err)}`)
		);
	} catch (error) {
		ctx.log.error(`handlePaymentFailed error: ${String(error)}`);
	}
}

/**
 * Webhook handler: checkout.session.completed
 */
async function handleCheckoutCompleted(
	session: Record<string, any>,
	ctx: PluginContext
): Promise<void> {
	try {
		const customerId = session.customer as string | undefined;
		const subscriptionId = session.subscription as string | undefined;

		if (!customerId) return;

		const member = await getMemberByStripeCustomerId(customerId, ctx);
		if (!member) {
			ctx.log.warn(`Member not found for customer ${customerId}`);
			return;
		}

		// Checkout completion confirms subscription
		if (subscriptionId && !member.stripeSubscriptionId) {
			member.stripeSubscriptionId = String(subscriptionId);
			member.status = "active";
			member.lastSyncAt = new Date().toISOString();

			await updateMember(member, ctx);
			ctx.log.info(`Checkout completed for ${member.email}: ${subscriptionId}`);

			// Send welcome email if first subscription
			sendWelcomeEmail(member, ctx).catch((err) =>
				ctx.log.warn(`Email send failed: ${String(err)}`)
			);
		}
	} catch (error) {
		ctx.log.error(`handleCheckoutCompleted error: ${String(error)}`);
	}
}

/**
 * Email helpers (async, non-blocking)
 * These functions send emails via Resend or ctx.email provider
 */

async function sendWelcomeEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit to prevent duplicate emails
		const canSend = await checkEmailRateLimit(member.email, "welcome", ctx);
		if (!canSend) {
			ctx.log.info(
				`Skipped welcome email for ${member.email}: rate limited`
			);
			return;
		}

		// Get plans to pull features
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config for name and portal link
		const siteNameKey = "settings:siteName";
		const portalLinkKey = "settings:portalLink";
		const siteName = await ctx.kv.get<string>(siteNameKey);
		const portalLink = await ctx.kv.get<string>(portalLinkKey);

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			price: plan?.price,
			renewalDate: member.currentPeriodEnd || member.expiresAt,
			features: plan?.features,
			portalLink: portalLink || "your account dashboard",
		};

		const template = createWelcomeTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendWelcomeEmail error: ${String(error)}`);
	}
}

async function sendUpdateEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit
		const canSend = await checkEmailRateLimit(member.email, "upgrade", ctx);
		if (!canSend) {
			ctx.log.info(`Skipped upgrade email for ${member.email}: rate limited`);
			return;
		}

		// Get plans
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config
		const siteName = await ctx.kv.get<string>("settings:siteName");
		const portalLink = await ctx.kv.get<string>("settings:portalLink");

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			price: plan?.price,
			renewalDate: member.currentPeriodEnd,
			features: plan?.features,
			portalLink: portalLink || "your account dashboard",
		};

		const template = createUpgradeTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendUpdateEmail error: ${String(error)}`);
	}
}

async function sendCancelledEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit
		const canSend = await checkEmailRateLimit(member.email, "cancelled", ctx);
		if (!canSend) {
			ctx.log.info(
				`Skipped cancellation email for ${member.email}: rate limited`
			);
			return;
		}

		// Get plans
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config
		const siteName = await ctx.kv.get<string>("settings:siteName");
		const portalLink = await ctx.kv.get<string>("settings:portalLink");

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			expiryDate: new Date().toISOString(),
			portalLink: portalLink || "your account dashboard",
		};

		const template = createCancellationTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendCancelledEmail error: ${String(error)}`);
	}
}

async function sendPaymentFailedEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit
		const canSend = await checkEmailRateLimit(member.email, "payment_failed", ctx);
		if (!canSend) {
			ctx.log.info(
				`Skipped payment failed email for ${member.email}: rate limited`
			);
			return;
		}

		// Get plans
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config
		const siteName = await ctx.kv.get<string>("settings:siteName");
		const portalLink = await ctx.kv.get<string>("settings:portalLink");

		// Calculate next retry date (3 days from now)
		const nextRetry = new Date();
		nextRetry.setDate(nextRetry.getDate() + 3);

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			nextRetryDate: nextRetry.toISOString(),
			portalLink: portalLink || "your account dashboard",
		};

		const template = createPaymentFailedTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendPaymentFailedEmail error: ${String(error)}`);
	}
}

async function sendPaymentReceivedEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit
		const canSend = await checkEmailRateLimit(member.email, "payment_received", ctx);
		if (!canSend) {
			ctx.log.info(
				`Skipped payment received email for ${member.email}: rate limited`
			);
			return;
		}

		// Get plans
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config
		const siteName = await ctx.kv.get<string>("settings:siteName");
		const portalLink = await ctx.kv.get<string>("settings:portalLink");

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			amount: plan?.price,
			renewalDate: member.currentPeriodEnd,
			portalLink: portalLink || "your account dashboard",
		};

		const template = createPaymentReceiptTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendPaymentReceivedEmail error: ${String(error)}`);
	}
}

async function sendRenewalReminderEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit
		const canSend = await checkEmailRateLimit(member.email, "renewal_reminder", ctx);
		if (!canSend) {
			ctx.log.info(
				`Skipped renewal reminder email for ${member.email}: rate limited`
			);
			return;
		}

		// Get plans
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config
		const siteName = await ctx.kv.get<string>("settings:siteName");
		const portalLink = await ctx.kv.get<string>("settings:portalLink");

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			price: plan?.price,
			renewalDate: member.currentPeriodEnd,
			portalLink: portalLink || "your account dashboard",
		};

		const template = createRenewalReminderTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendRenewalReminderEmail error: ${String(error)}`);
	}
}

async function sendExpiringEmail(
	member: MemberRecord,
	ctx: PluginContext
): Promise<void> {
	try {
		// Check rate limit
		const canSend = await checkEmailRateLimit(member.email, "expiring", ctx);
		if (!canSend) {
			ctx.log.info(`Skipped expiring email for ${member.email}: rate limited`);
			return;
		}

		// Get plans
		const plansJson = await ctx.kv.get<string>("plans");
		const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
		const plan = plans.find((p) => p.id === member.plan);

		// Fetch site config
		const siteName = await ctx.kv.get<string>("settings:siteName");
		const portalLink = await ctx.kv.get<string>("settings:portalLink");

		const vars: EmailVariables = {
			memberEmail: member.email,
			memberName:
				member.email.split("@")[0].charAt(0).toUpperCase() +
				member.email.split("@")[0].slice(1),
			planName: plan?.name || member.plan,
			siteName: siteName || "our community",
			expiryDate: member.expiresAt || member.currentPeriodEnd,
			portalLink: portalLink || "your account dashboard",
		};

		const template = createExpiringTemplate(vars);
		await sendMembershipEmail(template, member.email, ctx);
	} catch (error) {
		ctx.log.error(`sendExpiringEmail error: ${String(error)}`);
	}
}

/**
 * Utility: Get default plans
 */
const DEFAULT_PLANS: PlanConfig[] = [
	{
		id: "free",
		name: "Free",
		price: 0,
		interval: "once",
		description: "Basic access",
		features: ["Limited content access", "Community support"],
	},
	{
		id: "pro",
		name: "Pro",
		price: 99,
		interval: "month",
		description: "Full access with email support",
		features: ["All content", "Priority email support", "Monthly newsletter"],
	},
	{
		id: "premium",
		name: "Premium",
		price: 999,
		interval: "year",
		description: "VIP access and priority support",
		features: [
			"All content",
			"Priority support",
			"Early access to new content",
			"Annual digest report",
		],
	},
];

export default definePlugin({
	/**
	 * Hook: Initialize plugin on install
	 */
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				ctx.log.info("Membership plugin installed");
				// Initialize with default plans
				await ctx.kv.set("plans", JSON.stringify(DEFAULT_PLANS));
				await ctx.kv.set("settings:requirePaymentApproval", "true");

				// Initialize email settings (can be customized via admin)
				await ctx.kv.set("settings:siteName", "our community");
				await ctx.kv.set(
					"settings:portalLink",
					"https://account.example.com/billing"
				);
				await ctx.kv.set("settings:emailFrom", "noreply@example.com");

				ctx.log.info("Email settings initialized");
			},
		},
	},

	/**
	 * API Routes
	 */
	routes: {
		/**
		 * POST /membership/register
		 * Register a new member or retrieve existing membership.
		 *
		 * Expects: { email: string, plan: string }
		 * Returns: { memberId: string, status: "pending"|"active", paymentLink?: string }
		 */
		register: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();
					const planId = String(input.plan ?? "").trim();
					// Optional Stripe fields
					const stripeCustomerId = input.stripeCustomerId ? String(input.stripeCustomerId).trim() : undefined;
					const stripeSubscriptionId = input.stripeSubscriptionId ? String(input.stripeSubscriptionId).trim() : undefined;
					const stripePaymentMethod = input.stripePaymentMethod ? String(input.stripePaymentMethod).trim() : undefined;
					const planInterval = input.planInterval as "month" | "year" | "once" | undefined;
					const currentPeriodEnd = input.currentPeriodEnd ? String(input.currentPeriodEnd).trim() : undefined;
					const cancelAtPeriodEnd = Boolean(input.cancelAtPeriodEnd ?? false);

					// Validate input
					if (!email) {
						throw new Response(
							JSON.stringify({ error: "Email is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email format" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!planId) {
						throw new Response(
							JSON.stringify({ error: "Plan is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get plans
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);

					const selectedPlan = plans.find(
						(p: PlanConfig) => p.id === planId
					);
					if (!selectedPlan) {
						throw new Response(
							JSON.stringify({ error: "Plan not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check existing member
					const encodedEmail = emailToKvKey(email);
					const existingKey = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (existingKey) {
						const existingMember = parseJSON<MemberRecord>(
							existingKey,
							null
						);
						if (existingMember) {
							return {
								memberId: email,
								status: existingMember.status,
								plan: existingMember.plan,
								paymentLink:
									selectedPlan.price > 0 ? selectedPlan.paymentLink : undefined,
							};
						}
					}

					// Acquire lock to prevent race condition on duplicate registrations
					const lockKey = `member-lock:${encodedEmail}`;
					const existingLock = await ctx.kv.get<string>(lockKey);
					if (existingLock) {
						// Another registration is in progress
						throw new Response(
							JSON.stringify({ error: "Registration in progress, please try again" }),
							{ status: 429, headers: { "Content-Type": "application/json" } }
						);
					}
					await (ctx.kv as any).set(lockKey, "1", { ex: 5 }); // 5 second lock

					try {
						// Create new member
					const now = new Date().toISOString();
					let status: "pending" | "active" = "pending";

					// Free plans are immediately active
					if (selectedPlan.price === 0) {
						status = "active";
					} else if (
						!selectedPlan.paymentLink ||
						selectedPlan.paymentLink.trim() === ""
					) {
						// Paid plans without payment link are pending
						status = "pending";
					}

					const member: MemberRecord = {
						email,
						plan: selectedPlan.id,
						status,
						paymentLink: selectedPlan.paymentLink || undefined,
						createdAt: now,
						// Add Stripe fields if provided
						stripeCustomerId,
						stripeSubscriptionId,
						stripePaymentMethod,
						planInterval: planInterval || selectedPlan.interval,
						currentPeriodEnd,
						cancelAtPeriodEnd,
					};

					// For paid plans, set expiry if not provided from Stripe
					if (selectedPlan.price > 0) {
						if (!currentPeriodEnd) {
							const expiry = new Date();
							if (selectedPlan.interval === "month") {
								expiry.setMonth(expiry.getMonth() + 1);
							} else if (selectedPlan.interval === "year") {
								expiry.setFullYear(expiry.getFullYear() + 1);
							}
							member.expiresAt = expiry.toISOString();
						} else {
							// Use currentPeriodEnd from Stripe if provided
							member.expiresAt = currentPeriodEnd;
						}
					}

						await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));

						// Add to members list for admin
						const listKey = `members:list`;
						const listJson = await ctx.kv.get<string>(listKey);
						const membersList = parseJSON<string[]>(listJson, []);
						if (!membersList.includes(encodedEmail)) {
							membersList.push(encodedEmail);
							await ctx.kv.set(listKey, JSON.stringify(membersList));
						}

						ctx.log.info(`Member registered: ${email} for plan ${planId}`);

						return {
							memberId: email,
							status,
							plan: selectedPlan.id,
							paymentLink:
								selectedPlan.price > 0 ? selectedPlan.paymentLink : undefined,
						};
					} finally {
						// Release the lock
						await ctx.kv.delete(lockKey);
					}
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Register error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/status?email=user@example.com
		 * Check membership status for an email.
		 *
		 * Returns: { email: string, active: boolean, plan?: string, expiresAt?: string }
		 */
		status: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email) {
						return {
							active: false,
							reason: "Email required",
						};
					}

					if (!isValidEmail(email)) {
						return {
							active: false,
							reason: "Invalid email format",
						};
					}

					const encodedEmail = emailToKvKey(email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						return {
							email,
							active: false,
						};
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						return {
							email,
							active: false,
						};
					}

					// Check if active
					let isActive = member.status === "active";

					// Check expiry
					if (
						isActive &&
						member.expiresAt &&
						new Date(member.expiresAt) < new Date()
					) {
						isActive = false;
					}

					return {
						email,
						active: isActive,
						plan: member.plan,
						status: member.status,
						expiresAt: member.expiresAt,
						// Include Stripe subscription info
						stripeCustomerId: member.stripeCustomerId,
						stripeSubscriptionId: member.stripeSubscriptionId,
						stripePaymentMethod: member.stripePaymentMethod,
						planInterval: member.planInterval,
						currentPeriodEnd: member.currentPeriodEnd,
						cancelAtPeriodEnd: member.cancelAtPeriodEnd,
					};
				} catch (error) {
					ctx.log.error(`Status check error: ${String(error)}`);
					return {
						active: false,
						error: "Status check failed",
					};
				}
			},
		},

		/**
		 * GET /membership/plans
		 * Get available plans.
		 *
		 * Returns: { plans: PlanConfig[] }
		 */
		plans: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				try {
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);
					return { plans };
				} catch (error) {
					ctx.log.error(`Plans fetch error: ${String(error)}`);
					return { plans: DEFAULT_PLANS };
				}
			},
		},

		/**
		 * POST /membership/approve
		 * Manually approve a pending member (admin only).
		 *
		 * Expects: { email: string }
		 * Returns: { success: boolean }
		 */
		approve: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const encodedEmail = emailToKvKey(email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					member.status = "active";
					member.approvedAt = new Date().toISOString();

					await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));
					ctx.log.info(`Member approved: ${email}`);

					return { success: true };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Approve error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/revoke
		 * Revoke a member's access (admin only).
		 *
		 * Expects: { email: string }
		 * Returns: { success: boolean }
		 */
		revoke: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const encodedEmail = emailToKvKey(email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					member.status = "revoked";

					await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));
					ctx.log.info(`Member revoked: ${email}`);

					return { success: true };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Revoke error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/webhook
		 * Handle Stripe webhook events with signature verification and idempotency.
		 *
		 * Receives Stripe signed webhook payloads.
		 * Returns: { received: true } immediately (processes async)
		 */
		webhook: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const stripeSecret = (ctx as any).env?.STRIPE_WEBHOOK_SECRET as
						| string
						| undefined;

					if (!stripeSecret) {
						ctx.log.warn("Stripe webhook secret not configured");
						return { received: true }; // Still return 200 to avoid retries
					}

					// Get raw body and signature
					const rawBody = rc.rawBody as string | undefined;
					const headers = rc.headers as Record<string, string> | undefined;
					const signature = headers?.["stripe-signature"] as string | undefined;

					if (!rawBody || !signature) {
						ctx.log.warn("Missing webhook payload or signature");
						return { received: true };
					}

					// Verify Stripe signature
					const isValid = await verifyStripeSignature(
						rawBody,
						signature,
						stripeSecret
					);
					if (!isValid) {
						ctx.log.warn("Invalid Stripe signature");
						return { received: true };
					}

					// Parse event
					let event: Record<string, any>;
					try {
						event = JSON.parse(rawBody) as Record<string, any>;
					} catch {
						ctx.log.error("Failed to parse webhook payload");
						return { received: true };
					}

					const eventId = String(event.id ?? "");
					const eventType = String(event.type ?? "");

					if (!eventId || !eventType) {
						ctx.log.warn("Missing event id or type");
						return { received: true };
					}

					// Idempotency check
					const idempotencyKey = `stripe:webhook:${eventId}`;
					const processed = await ctx.kv.get<string>(idempotencyKey);
					if (processed) {
						ctx.log.info(`Webhook already processed: ${eventId}`);
						return { received: true };
					}

					// Mark as processing
					await (ctx.kv as any).set(idempotencyKey, "1", { ex: 86400 }); // 24h TTL

					// Handle specific event types
					const eventData = event.data as Record<string, any> | undefined;
					const object = eventData?.object as Record<string, any> | undefined;

					if (!object) {
						ctx.log.warn(`Webhook ${eventType}: missing data.object`);
						return { received: true };
					}

					switch (eventType) {
						case "customer.subscription.created":
							await handleSubscriptionCreated(object, ctx);
							break;

						case "customer.subscription.updated":
							await handleSubscriptionUpdated(object, ctx);
							break;

						case "customer.subscription.deleted":
							await handleSubscriptionDeleted(object, ctx);
							break;

						case "invoice.payment_succeeded":
							await handlePaymentSucceeded(object, ctx);
							break;

						case "invoice.payment_failed":
							await handlePaymentFailed(object, ctx);
							break;

						case "checkout.session.completed":
							await handleCheckoutCompleted(object, ctx);
							break;

						default:
							ctx.log.info(`Unhandled webhook type: ${eventType}`);
					}

					return { received: true };
				} catch (error) {
					ctx.log.error(`Webhook handler error: ${String(error)}`);
					return { received: true };
				}
			},
		},

		/**
		 * POST /membership/checkout/create
		 * Create a Stripe Checkout Session for a membership plan.
		 *
		 * Expects: { email: string, plan: string }
		 * Returns: { checkoutUrl: string, sessionId: string }
		 */
		checkoutCreate: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();
					const planId = String(input.plan ?? "").trim();
					const stripeApiKey = (ctx as any).env?.STRIPE_API_SECRET as string | undefined;
					const successUrl = String(input.successUrl ?? "").trim() || "http://localhost:3000/membership/checkout/success?session_id={CHECKOUT_SESSION_ID}";
					const cancelUrl = String(input.cancelUrl ?? "").trim() || "http://localhost:3000/membership";

					// Validate inputs
					if (!email) {
						throw new Response(
							JSON.stringify({ error: "Email is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email format" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!planId) {
						throw new Response(
							JSON.stringify({ error: "Plan is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!stripeApiKey) {
						ctx.log.error("Stripe API key not configured");
						throw new Response(
							JSON.stringify({ error: "Payment processing not available" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get plans
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);

					const selectedPlan = plans.find(
						(p: PlanConfig) => p.id === planId
					);

					if (!selectedPlan) {
						throw new Response(
							JSON.stringify({ error: "Plan not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Reject free plans
					if (selectedPlan.price <= 0) {
						throw new Response(
							JSON.stringify({ error: "Free plans cannot be purchased" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Look up or create member first
					const encodedEmail = emailToKvKey(email);
					let member = parseJSON<MemberRecord | null>(
						await ctx.kv.get<string>(`member:${encodedEmail}`),
						null
					);

					if (!member) {
						// Create new member
						member = {
							email,
							plan: planId,
							status: "pending",
							createdAt: new Date().toISOString(),
						};
					}

					// Create Stripe customer if not already created
					let stripeCustomerId = member.stripeCustomerId;
					if (!stripeCustomerId) {
						// Create customer via Stripe API
						const customerFormData = new URLSearchParams();
						customerFormData.append("email", email);
						customerFormData.append("metadata[email]", email);

						const customerRes = await fetch(
							"https://api.stripe.com/v1/customers",
							{
								method: "POST",
								headers: {
									"Authorization": `Bearer ${stripeApiKey}`,
									"Content-Type": "application/x-www-form-urlencoded",
								},
								body: customerFormData.toString(),
							}
						);

						if (!customerRes.ok) {
							const errorData = await customerRes.text();
							ctx.log.error(`Stripe customer creation failed: ${errorData}`);
							throw new Response(
								JSON.stringify({ error: "Failed to create Stripe customer" }),
								{ status: 500, headers: { "Content-Type": "application/json" } }
							);
						}

						const customerData = await customerRes.json() as Record<string, any>;
						stripeCustomerId = String(customerData.id ?? "");

						if (!stripeCustomerId) {
							throw new Response(
								JSON.stringify({ error: "Failed to get Stripe customer ID" }),
								{ status: 500, headers: { "Content-Type": "application/json" } }
							);
						}

						member.stripeCustomerId = stripeCustomerId;
						await updateMember(member, ctx);
					}

					// Create Checkout Session via Stripe API
					const checkoutFormData = new URLSearchParams();
					checkoutFormData.append("mode", "subscription");
					checkoutFormData.append("customer", stripeCustomerId);
					checkoutFormData.append("customer_email", email);
					checkoutFormData.append("line_items[0][price]", selectedPlan.id); // Assuming plan.id is the Stripe price ID
					checkoutFormData.append("success_url", successUrl);
					checkoutFormData.append("cancel_url", cancelUrl);

					const checkoutRes = await fetch(
						"https://api.stripe.com/v1/checkout/sessions",
						{
							method: "POST",
							headers: {
								"Authorization": `Bearer ${stripeApiKey}`,
								"Content-Type": "application/x-www-form-urlencoded",
							},
							body: checkoutFormData.toString(),
						}
					);

					if (!checkoutRes.ok) {
						const errorData = await checkoutRes.text();
						ctx.log.error(`Stripe checkout session creation failed: ${errorData}`);
						throw new Response(
							JSON.stringify({ error: "Failed to create checkout session" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					const sessionData = await checkoutRes.json() as Record<string, any>;
					const sessionId = String(sessionData.id ?? "");
					const checkoutUrl = String(sessionData.url ?? "");

					if (!sessionId || !checkoutUrl) {
						throw new Response(
							JSON.stringify({ error: "Invalid Stripe session response" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					// Store session ID in KV with 24h TTL for success route to retrieve
					await (ctx.kv as any).set(
						`checkout:${sessionId}`,
						JSON.stringify({ email, planId, stripeCustomerId, createdAt: new Date().toISOString() }),
						{ ex: 86400 }
					);

					return {
						checkoutUrl,
						sessionId,
					};
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}
					ctx.log.error(`Checkout create error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to create checkout session" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/checkout/success
		 * Handle successful Stripe Checkout Session completion.
		 *
		 * Query params: session_id (from Stripe redirect)
		 * Returns: { success: true, redirectUrl: string }
		 */
		checkoutSuccess: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const query = (rc.query as Record<string, string>) || {};
					const sessionId = String(query.session_id ?? "").trim();
					const stripeApiKey = (ctx as any).env?.STRIPE_API_SECRET as string | undefined;
					const jwtSecret = (ctx as any).env?.JWT_SECRET as string | undefined;

					if (!sessionId) {
						throw new Response(
							JSON.stringify({ error: "Session ID is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!stripeApiKey) {
						ctx.log.error("Stripe API key not configured");
						throw new Response(
							JSON.stringify({ error: "Payment processing not available" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					// Retrieve session from Stripe API (expand subscription)
					const sessionRes = await fetch(
						`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand=subscription`,
						{
							method: "GET",
							headers: {
								"Authorization": `Bearer ${stripeApiKey}`,
							},
						}
					);

					if (!sessionRes.ok) {
						const errorData = await sessionRes.text();
						ctx.log.error(`Stripe session retrieval failed: ${errorData}`);
						throw new Response(
							JSON.stringify({ error: "Failed to retrieve checkout session" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const sessionData = await sessionRes.json() as Record<string, any>;
					const customerEmail = String(sessionData.customer_email ?? "");
					const subscription = sessionData.subscription as Record<string, any> | string | undefined;

					if (!customerEmail) {
						throw new Response(
							JSON.stringify({ error: "Customer email not found in session" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!subscription) {
						throw new Response(
							JSON.stringify({ error: "Subscription not found in session" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Extract subscription ID
					const subscriptionId = typeof subscription === "string"
						? subscription
						: String(subscription.id ?? "");

					if (!subscriptionId) {
						throw new Response(
							JSON.stringify({ error: "Invalid subscription data" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get subscription details to extract period end
					let currentPeriodEnd: string | undefined;
					if (typeof subscription === "object" && subscription.current_period_end) {
						currentPeriodEnd = new Date(
							(subscription.current_period_end as number) * 1000
						).toISOString();
					}

					// Update member in KV
					const encodedEmail = emailToKvKey(customerEmail);
					let member = parseJSON<MemberRecord | null>(
						await ctx.kv.get<string>(`member:${encodedEmail}`),
						null
					);

					if (!member) {
						// Fallback: look up in checkout temp storage
						const checkoutData = parseJSON<any>(
							await ctx.kv.get<string>(`checkout:${sessionId}`),
							null
						);

						if (checkoutData) {
							member = {
								email: customerEmail,
								plan: checkoutData.planId,
								status: "active",
								createdAt: new Date().toISOString(),
								stripeCustomerId: checkoutData.stripeCustomerId,
							};
						} else {
							throw new Response(
								JSON.stringify({ error: "Member not found" }),
								{ status: 404, headers: { "Content-Type": "application/json" } }
							);
						}
					}

					// Update member with subscription info
					member.stripeSubscriptionId = subscriptionId;
					member.status = "active";
					if (currentPeriodEnd) {
						member.currentPeriodEnd = currentPeriodEnd;
						member.expiresAt = currentPeriodEnd;
					}
					member.lastSyncAt = new Date().toISOString();

					await updateMember(member, ctx);

					// Create JWT token for authentication
					let authCookie = "";
					if (jwtSecret) {
						try {
							const token = await signJWT(
								await createPayload(15 * 60, "access"),
								jwtSecret
							);
							authCookie = `Authorization=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict`;
						} catch (error) {
							ctx.log.warn(`Failed to create JWT token: ${String(error)}`);
						}
					}

					// Log success
					ctx.log.info(
						`Checkout success for ${customerEmail}: subscription ${subscriptionId}`
					);

					// Return redirect URL
					const redirectUrl = "/membership/dashboard?status=subscribed";

					return {
						success: true,
						redirectUrl,
						...(authCookie && { cookie: authCookie }),
					};
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}
					ctx.log.error(`Checkout success error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Failed to process checkout completion" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/dashboard
		 * Get member dashboard data (subscription details).
		 *
		 * Requires: JWT token from cookie
		 * Returns: { plan, price, interval, renewalDate, paymentMethod, cancelAtPeriodEnd, status }
		 */
		dashboard: {
			public: false,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const headers = rc.headers as Record<string, string> | undefined;
					const authHeader = headers?.["authorization"] || headers?.["cookie"];

					// Extract token from header or cookie
					let token: string | null = null;
					if (authHeader) {
						if (authHeader.startsWith("Bearer ")) {
							token = extractToken(authHeader);
						} else if (authHeader.includes("Authorization=")) {
							// Parse from cookie format
							const match = authHeader.match(/Authorization=([^;]+)/);
							if (match) {
								token = decodeURIComponent(match[1]);
							}
						}
					}

					if (!token) {
						throw new Response(
							JSON.stringify({ error: "Unauthorized" }),
							{ status: 401, headers: { "Content-Type": "application/json" } }
						);
					}

					// Verify JWT
					const jwtSecret = (ctx as any).env?.JWT_SECRET as string | undefined;
					if (!jwtSecret) {
						throw new Response(
							JSON.stringify({ error: "JWT secret not configured" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					const payload = await verifyJWT(token, jwtSecret);
					if (!payload) {
						throw new Response(
							JSON.stringify({ error: "Invalid or expired token" }),
							{ status: 401, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get member from KV
					const encodedEmail = emailToKvKey(payload.email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get plan details
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);
					const plan = plans.find((p: PlanConfig) => p.id === member.plan);

					if (!plan) {
						throw new Response(
							JSON.stringify({ error: "Plan not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					return {
						email: member.email,
						plan: plan.name,
						planId: plan.id,
						price: plan.price,
						interval: plan.interval,
						currentPeriodEnd: member.currentPeriodEnd || member.expiresAt,
						status: member.status,
						cancelAtPeriodEnd: member.cancelAtPeriodEnd || false,
						stripePaymentMethod: member.stripePaymentMethod,
						stripeSubscriptionId: member.stripeSubscriptionId,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Dashboard error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/dashboard/cancel
		 * Cancel subscription at period end.
		 *
		 * Requires: JWT token from cookie
		 * Returns: { success: true, cancelDate: string }
		 */
		dashboardCancel: {
			public: false,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const headers = rc.headers as Record<string, string> | undefined;
					const authHeader = headers?.["authorization"] || headers?.["cookie"];

					// Extract token
					let token: string | null = null;
					if (authHeader) {
						if (authHeader.startsWith("Bearer ")) {
							token = extractToken(authHeader);
						} else if (authHeader.includes("Authorization=")) {
							const match = authHeader.match(/Authorization=([^;]+)/);
							if (match) {
								token = decodeURIComponent(match[1]);
							}
						}
					}

					if (!token) {
						throw new Response(
							JSON.stringify({ error: "Unauthorized" }),
							{ status: 401, headers: { "Content-Type": "application/json" } }
						);
					}

					// Verify JWT
					const jwtSecret = (ctx as any).env?.JWT_SECRET as string | undefined;
					if (!jwtSecret) {
						throw new Response(
							JSON.stringify({ error: "JWT secret not configured" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					const payload = await verifyJWT(token, jwtSecret);
					if (!payload) {
						throw new Response(
							JSON.stringify({ error: "Invalid or expired token" }),
							{ status: 401, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get member
					const encodedEmail = emailToKvKey(payload.email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Update member to mark for cancellation
					member.cancelAtPeriodEnd = true;
					member.status = "active"; // Keep active until period end
					member.lastSyncAt = new Date().toISOString();

					await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));
					ctx.log.info(`Subscription cancelled at period end for ${member.email}`);

					return {
						success: true,
						cancelDate: member.currentPeriodEnd || member.expiresAt,
						message: `Your subscription will be cancelled on ${member.currentPeriodEnd || member.expiresAt}. You'll maintain access until then.`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Dashboard cancel error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/dashboard/upgrade
		 * Upgrade to a different plan.
		 *
		 * Requires: JWT token from cookie
		 * Expects: { newPlanId: string }
		 * Returns: { success: true, newPlan: string, newPrice: number }
		 */
		dashboardUpgrade: {
			public: false,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const headers = rc.headers as Record<string, string> | undefined;
					const authHeader = headers?.["authorization"] || headers?.["cookie"];
					const input = rc.input as Record<string, unknown>;

					// Extract token
					let token: string | null = null;
					if (authHeader) {
						if (authHeader.startsWith("Bearer ")) {
							token = extractToken(authHeader);
						} else if (authHeader.includes("Authorization=")) {
							const match = authHeader.match(/Authorization=([^;]+)/);
							if (match) {
								token = decodeURIComponent(match[1]);
							}
						}
					}

					if (!token) {
						throw new Response(
							JSON.stringify({ error: "Unauthorized" }),
							{ status: 401, headers: { "Content-Type": "application/json" } }
						);
					}

					// Verify JWT
					const jwtSecret = (ctx as any).env?.JWT_SECRET as string | undefined;
					if (!jwtSecret) {
						throw new Response(
							JSON.stringify({ error: "JWT secret not configured" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}

					const payload = await verifyJWT(token, jwtSecret);
					if (!payload) {
						throw new Response(
							JSON.stringify({ error: "Invalid or expired token" }),
							{ status: 401, headers: { "Content-Type": "application/json" } }
						);
					}

					const newPlanId = String(input.newPlanId ?? "").trim();
					if (!newPlanId) {
						throw new Response(
							JSON.stringify({ error: "New plan ID is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get member
					const encodedEmail = emailToKvKey(payload.email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get plans
					const plansJson = await ctx.kv.get<string>("plans");
					const plans = parseJSON(plansJson, DEFAULT_PLANS);

					const newPlan = plans.find((p: PlanConfig) => p.id === newPlanId);
					if (!newPlan) {
						throw new Response(
							JSON.stringify({ error: "Plan not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const currentPlan = plans.find((p: PlanConfig) => p.id === member.plan);
					if (!currentPlan) {
						throw new Response(
							JSON.stringify({ error: "Current plan not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Update member plan
					member.plan = newPlanId;
					member.lastSyncAt = new Date().toISOString();
					member.cancelAtPeriodEnd = false; // Clear cancellation flag on upgrade

					await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));
					ctx.log.info(`Member upgraded from ${currentPlan.id} to ${newPlanId}: ${member.email}`);

					return {
						success: true,
						newPlan: newPlan.name,
						newPlanId: newPlan.id,
						newPrice: newPlan.price,
						interval: newPlan.interval,
						priceDifference: newPlan.price - currentPlan.price,
						message: `Successfully upgraded to ${newPlan.name}. Your new price is $${(newPlan.price / 100).toFixed(2)}/${newPlan.interval}.`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Dashboard upgrade error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/coupons/create
		 * Admin-only endpoint to create a new coupon code.
		 *
		 * Expects: { code, discountType, discountAmount, expiresAt?, maxUses?, applicablePlans?, description? }
		 * Returns: { success: true, coupon: CouponRecord }
		 */
		couponCreate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const code = String(input.code ?? "").trim().toUpperCase();
					const discountType = String(input.discountType ?? "") as "percent" | "fixed";
					const discountAmount = Number(input.discountAmount ?? 0);
					const expiresAt = input.expiresAt ? String(input.expiresAt).trim() : undefined;
					const maxUses = input.maxUses ? Number(input.maxUses) : undefined;
					const applicablePlans = input.applicablePlans as string[] | undefined;
					const description = input.description ? String(input.description).trim() : undefined;

					// Validate input
					if (!code || code.length < 2) {
						throw new Response(
							JSON.stringify({ error: "Coupon code must be at least 2 characters" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!discountType || !["percent", "fixed"].includes(discountType)) {
						throw new Response(
							JSON.stringify({ error: "Discount type must be 'percent' or 'fixed'" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (discountAmount <= 0) {
						throw new Response(
							JSON.stringify({ error: "Discount amount must be greater than 0" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check if coupon already exists
					const existing = await ctx.kv.get<string>(`coupon:${code}`);
					if (existing) {
						throw new Response(
							JSON.stringify({ error: "Coupon code already exists" }),
							{ status: 409, headers: { "Content-Type": "application/json" } }
						);
					}

					const coupon: CouponRecord = {
						code,
						discountType,
						discountAmount,
						usedCount: 0,
						createdAt: new Date().toISOString(),
					};

					if (expiresAt) coupon.expiresAt = expiresAt;
					if (maxUses) coupon.maxUses = maxUses;
					if (applicablePlans && applicablePlans.length > 0) coupon.applicablePlans = applicablePlans;
					if (description) coupon.description = description;

					// Store coupon
					await ctx.kv.set(`coupon:${code}`, JSON.stringify(coupon));

					// Add to coupons list
					const listJson = await ctx.kv.get<string>("coupons:list");
					const coupons = parseJSON<string[]>(listJson, []);
					if (!coupons.includes(code)) {
						coupons.push(code);
						await ctx.kv.set("coupons:list", JSON.stringify(coupons));
					}

					ctx.log.info(`Coupon created: ${code}`);

					return {
						success: true,
						coupon,
						message: `Coupon ${code} created successfully`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Coupon create error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/coupons
		 * Admin-only endpoint to list all coupons with usage stats.
		 *
		 * Returns: { coupons: CouponRecord[] }
		 */
		couponList: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("coupons:list");
					const couponCodes = parseJSON<string[]>(listJson, []);

					const coupons: CouponRecord[] = [];
					for (const code of couponCodes) {
						const couponJson = await ctx.kv.get<string>(`coupon:${code}`);
						if (couponJson) {
							const coupon = parseJSON<CouponRecord>(couponJson, null);
							if (coupon) {
								coupons.push(coupon);
							}
						}
					}

					return {
						coupons,
						total: coupons.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Coupon list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/coupons/validate
		 * Public endpoint to validate a coupon code in real-time.
		 *
		 * Expects: { code, planId? }
		 * Returns: { valid: true, discountType: string, discountAmount: number } or { valid: false, reason: string }
		 */
		couponValidate: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const code = String(input.code ?? "").trim().toUpperCase();
					const planId = input.planId ? String(input.planId).trim() : undefined;

					if (!code) {
						return {
							valid: false,
							reason: "Coupon code required",
						};
					}

					const couponJson = await ctx.kv.get<string>(`coupon:${code}`);
					if (!couponJson) {
						return {
							valid: false,
							reason: "Coupon not found",
						};
					}

					const coupon = parseJSON<CouponRecord>(couponJson, null);
					if (!coupon) {
						return {
							valid: false,
							reason: "Coupon not found",
						};
					}

					// Check expiry
					if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
						return {
							valid: false,
							reason: "Coupon has expired",
						};
					}

					// Check max uses
					if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
						return {
							valid: false,
							reason: "Coupon usage limit reached",
						};
					}

					// Check plan restriction
					if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
						if (!planId || !coupon.applicablePlans.includes(planId)) {
							return {
								valid: false,
								reason: "This coupon is not valid for your selected plan",
							};
						}
					}

					return {
						valid: true,
						discountType: coupon.discountType,
						discountAmount: coupon.discountAmount,
						message: coupon.discountType === "percent"
							? `Save ${coupon.discountAmount}% with this code!`
							: `Save $${(coupon.discountAmount / 100).toFixed(2)} with this code!`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Coupon validate error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * Block Kit admin handler for pages and widgets
		 */
		admin: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const interaction = rc.input as AdminInteraction;

					// EmDash admin routes are behind admin authentication by default.
					// The admin handler is not marked public: true, so only authenticated admin users can reach it.
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					// Members page
					if (interaction.type === "page_load" && interaction.page === "/members") {
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);

						const members = [];
						for (const encodedEmail of memberEmails) {
							const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null);
								if (member) {
									members.push({
										email: member.email,
										plan: member.plan,
										status: member.status,
										createdAt: member.createdAt,
										expiresAt: member.expiresAt || "",
										stripeCustomerId: member.stripeCustomerId || "",
										stripeSubscriptionId: member.stripeSubscriptionId || "",
										stripePaymentMethod: member.stripePaymentMethod || "",
										planInterval: member.planInterval || "",
										currentPeriodEnd: member.currentPeriodEnd || "",
										cancelAtPeriodEnd: member.cancelAtPeriodEnd ? "Yes" : "No",
									});
								}
							}
						}

						// Sort by created date descending
						members.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime()
						);

						return {
							blocks: [
								{
									type: "header",
									text: "Members",
								},
								{
									type: "stats",
									stats: [
										{
											label: "Total Members",
											value: members.length.toString(),
										},
										{
											label: "Active",
											value: members
												.filter((m) => m.status === "active")
												.length.toString(),
										},
										{
											label: "Pending",
											value: members
												.filter((m) => m.status === "pending")
												.length.toString(),
										},
									],
								},
								{
									type: "table",
									blockId: "members-table",
									columns: [
										{ key: "email", label: "Email", format: "text" as const },
										{ key: "plan", label: "Plan", format: "text" as const },
										{ key: "status", label: "Status", format: "badge" as const },
										{
											key: "expiresAt",
											label: "Expires",
											format: "relative_time" as const,
										},
										{ key: "stripeCustomerId", label: "Stripe Customer", format: "text" as const },
										{ key: "stripeSubscriptionId", label: "Stripe Subscription", format: "text" as const },
										{ key: "stripePaymentMethod", label: "Payment Method", format: "text" as const },
										{ key: "planInterval", label: "Interval", format: "text" as const },
										{ key: "currentPeriodEnd", label: "Period End", format: "text" as const },
										{ key: "cancelAtPeriodEnd", label: "Cancels At", format: "text" as const },
									],
									rows: members,
								},
								{
									type: "section",
									text: "Admin Actions",
								},
								{
									type: "form",
									blockId: "member-actions",
									fields: [
										{
											type: "text_input",
											action_id: "email",
											label: "Member Email",
											placeholder: "user@example.com",
										},
										{
											type: "select",
											action_id: "action",
											label: "Action",
											options: [
												{ label: "Approve", value: "approve" },
												{ label: "Revoke", value: "revoke" },
											],
										},
									],
									submit: { label: "Execute", action_id: "execute_action" },
								},
							],
						};
					}

					// Process member actions
					if (interaction.type === "form_submit" && interaction.action === "execute_action") {
						const email = String(interaction.email ?? "").trim().toLowerCase();
						const action = String(interaction.action ?? "");

						if (!email || !isValidEmail(email)) {
							return {
								blocks: [],
								toast: {
									message: "Invalid email address",
									type: "error" as const,
								},
							};
						}

						const encodedEmail = emailToKvKey(email);
						try {
							if (action === "approve") {
								await ctx.kv.set(
									`member:${encodedEmail}`,
									JSON.stringify({
										...(parseJSON<MemberRecord>(
											await ctx.kv.get<string>(`member:${encodedEmail}`),
											null
										) || { email, plan: "", createdAt: new Date().toISOString() }),
										status: "active",
										approvedAt: new Date().toISOString(),
									})
								);
								return {
									blocks: [],
									toast: { message: `Approved ${email}`, type: "success" as const },
								};
							} else if (action === "revoke") {
								await ctx.kv.set(
									`member:${encodedEmail}`,
									JSON.stringify({
										...(parseJSON<MemberRecord>(
											await ctx.kv.get<string>(`member:${encodedEmail}`),
											null
										) || { email, plan: "", createdAt: new Date().toISOString() }),
										status: "revoked",
									})
								);
								return {
									blocks: [],
									toast: { message: `Revoked ${email}`, type: "success" as const },
								};
							}
						} catch (error) {
							ctx.log.error(`Member action error: ${String(error)}`);
							return {
								blocks: [],
								toast: {
									message: "Action failed",
									type: "error" as const,
								},
							};
						}
					}

					// Plans page
					if (interaction.type === "page_load" && interaction.page === "/plans") {
						const plansJson = await ctx.kv.get<string>("plans");
						const plans = parseJSON(plansJson, DEFAULT_PLANS);

						return {
							blocks: [
								{
									type: "header",
									text: "Membership Plans",
								},
								{
									type: "section",
									text: "Configure your membership plans and payment links",
								},
								{
									type: "table",
									blockId: "plans-table",
									columns: [
										{ key: "name", label: "Name", format: "text" as const },
										{ key: "price", label: "Price", format: "text" as const },
										{
											key: "interval",
											label: "Interval",
											format: "text" as const,
										},
										{
											key: "paymentLink",
											label: "Payment Link",
											format: "text" as const,
										},
									],
									rows: plans.map((p: PlanConfig) => ({
										name: p.name,
										price: `$${(p.price / 100).toFixed(2)}`,
										interval: p.interval,
										paymentLink: p.paymentLink || "(not set)",
									})),
								},
								{
									type: "context",
									text: "Payment links must be created in Stripe and pasted here. Visit dashboard.stripe.com to create Payment Links.",
								},
							],
						};
					}

					// Widget: active members count
					if (interaction.type === "widget_load" && interaction.widgetId === "active-members") {
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);

						let activeCount = 0;
						for (const encodedEmail of memberEmails) {
							const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null);
								if (
									member &&
									member.status === "active" &&
									(!member.expiresAt || new Date(member.expiresAt) > new Date())
								) {
									activeCount++;
								}
							}
						}

						return {
							blocks: [
								{
									type: "stats",
									stats: [
										{
											label: "Active Members",
											value: activeCount.toString(),
										},
									],
								},
							],
						};
					}

					// Widget: total revenue (MRR)
					if (interaction.type === "widget_load" && interaction.widgetId === "total-revenue") {
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);
						const plansJson = await ctx.kv.get<string>("plans");
						const plans = parseJSON(plansJson, DEFAULT_PLANS);

						let mrr = 0;
						for (const encodedEmail of memberEmails) {
							const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null);
								if (
									member &&
									member.status === "active" &&
									(!member.expiresAt || new Date(member.expiresAt) > new Date())
								) {
									const plan = plans.find((p: PlanConfig) => p.id === member.plan);
									if (plan) {
										if (plan.interval === "month") {
											mrr += plan.price;
										} else if (plan.interval === "year") {
											mrr += Math.round(plan.price / 12);
										}
										// "once" plans contribute $0 to MRR
									}
								}
							}
						}

						return {
							blocks: [
								{
									type: "stats",
									stats: [
										{
											label: "Monthly Revenue",
											value: `$${(mrr / 100).toFixed(2)}`,
										},
									],
								},
							],
						};
					}

					/** PHASE 4 WAVE 2: Task 5 - Form Builder Admin Page */
					if (interaction.type === "page_load" && interaction.page === "/forms") {
						const listJson = await ctx.kv.get<string>("forms:list");
						const formIds = parseJSON<string[]>(listJson, []);

						const forms: FormDefinition[] = [];
						for (const id of formIds) {
							const formJson = await ctx.kv.get<string>(`form:${id}`);
							if (formJson) {
								const form = parseJSON<FormDefinition>(formJson, null);
								if (form) forms.push(form);
							}
						}

						forms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

						return {
							blocks: [
								{
									type: "header",
									text: "Registration Forms",
								},
								{
									type: "stats",
									stats: [
										{
											label: "Total Forms",
											value: forms.length.toString(),
										},
									],
								},
								{
									type: "table",
									blockId: "forms-table",
									columns: [
										{ key: "id", label: "ID", format: "text" as const },
										{ key: "name", label: "Name", format: "text" as const },
										{ key: "fields", label: "Fields", format: "text" as const },
										{ key: "steps", label: "Steps", format: "text" as const },
										{ key: "createdAt", label: "Created", format: "relative_time" as const },
									],
									rows: forms.map((f) => ({
										id: f.id,
										name: f.name,
										fields: f.fields.length.toString(),
										steps: f.steps ? f.steps.length.toString() : "—",
										createdAt: f.createdAt,
									})),
								},
								{
									type: "section",
									text: "Create New Form",
								},
								{
									type: "form",
									blockId: "create-form",
									fields: [
										{
											type: "text_input",
											action_id: "formName",
											label: "Form Name",
											placeholder: "e.g. Member Registration",
										},
										{
											type: "text_input",
											action_id: "formDescription",
											label: "Description (optional)",
											placeholder: "Form description",
										},
										{
											type: "select",
											action_id: "fieldType",
											label: "First Field Type",
											options: [
												{ label: "Text", value: "text" },
												{ label: "Email", value: "email" },
												{ label: "Phone", value: "phone" },
												{ label: "Dropdown", value: "dropdown" },
												{ label: "Checkbox", value: "checkbox" },
											],
										},
										{
											type: "text_input",
											action_id: "fieldLabel",
											label: "First Field Label",
											placeholder: "e.g. Full Name",
										},
										{
											type: "select",
											action_id: "fieldRequired",
											label: "Required?",
											options: [
												{ label: "Yes", value: "true" },
												{ label: "No", value: "false" },
											],
										},
									],
									submit: { label: "Create Form", action_id: "create_form" },
								},
							],
						};
					}

					return { blocks: [] };
				} catch (error) {
					ctx.log.error(`Admin handler error: ${String(error)}`);
					return {
						blocks: [
							{
								type: "banner",
								title: "Error",
								description: "Failed to load admin page",
								variant: "error" as const,
							},
						],
					};
				}
			},

			/**
			 * GET /membership/portal
			 * Get member's portal data: accessible content, current plan, billing
			 *
			 * Query params:
			 *   - email: member email (required)
			 *
			 * Returns: { member: MemberRecord, plan: PlanConfig, accessibleContent: string[], nextBillingDate?: string }
			 */
			portal: {
				public: true,
				handler: async (routeCtx: unknown, ctx: PluginContext) => {
					try {
						const rc = routeCtx as Record<string, unknown>;
						const input = rc.input as Record<string, unknown>;
						const email = String(input.email ?? "").trim().toLowerCase();

						if (!email || !isValidEmail(email)) {
							return {
								hasAccess: false,
								reason: "Valid email required",
							};
						}

						// Load member
						const encodedEmail = emailToKvKey(email);
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						const member = parseJSON<MemberRecord>(memberJson, null);

						if (!member || member.status !== "active") {
							return {
								hasAccess: false,
								reason: "No active membership",
							};
						}

						// Load member's plan
						const plansJson = await ctx.kv.get<string>("plans");
						const plans = parseJSON<PlanConfig[]>(plansJson, DEFAULT_PLANS);
						const plan = plans.find((p) => p.id === member.plan);

						// Get accessible content IDs
						const listJson = await ctx.kv.get<string>("gating-rules:list");
						const ruleIds = parseJSON<string[]>(listJson, []);
						const accessibleIds: string[] = [];

						for (const ruleId of ruleIds) {
							const ruleJson = await ctx.kv.get<string>(`gating-rule:${ruleId}`);
							const rule = parseJSON<any>(ruleJson, null);

							if (rule && rule.planIds && Array.isArray(rule.planIds) && rule.planIds.includes(member.plan)) {
								// Check drip status if applicable
								if (rule.type === "drip" && rule.dripDays !== undefined) {
									if (member.joinDate) {
										const joinDate = new Date(member.joinDate);
										const daysElapsed = Math.floor((Date.now() - joinDate.getTime()) / (24 * 60 * 60 * 1000));
										if (daysElapsed >= rule.dripDays) {
											accessibleIds.push(rule.contentId);
										}
									}
								} else {
									accessibleIds.push(rule.contentId);
								}
							}
						}

						return {
							hasAccess: true,
							member: {
								email: member.email,
								plan: member.plan,
								status: member.status,
								joinDate: member.joinDate,
								currentPeriodEnd: member.currentPeriodEnd,
								stripePaymentMethod: member.stripePaymentMethod,
							},
							plan,
							accessibleContent: accessibleIds,
							nextBillingDate: member.currentPeriodEnd,
						};
					} catch (error) {
						ctx.log.error(`Portal error: ${String(error)}`);
						return {
							hasAccess: false,
							reason: "Portal access failed",
						};
					}
				},
			},

			/**
			 * POST /membership/gating/rules
			 * Create a content gating rule (admin only)
			 *
			 * Expects: { contentId: string, targetType: "page"|"block", planIds: string[], type: "membership"|"drip", dripDays?: number, previewText?: string }
			 * Returns: { ruleId: string, success: boolean }
			 */
			createGatingRule: {
				handler: async (routeCtx: unknown, ctx: PluginContext) => {
					try {
						const rc = routeCtx as Record<string, unknown>;
						const input = rc.input as Record<string, unknown>;
						const contentId = String(input.contentId ?? "").trim();
						const targetType = String(input.targetType ?? "page").trim();
						const planIds = Array.isArray(input.planIds) ? input.planIds.map(String) : [];
						const ruleType = String(input.type ?? "membership").trim();
						const dripDays = input.dripDays ? parseInt(String(input.dripDays), 10) : undefined;
						const previewText = input.previewText ? String(input.previewText).trim() : undefined;

						if (!contentId) {
							throw new Response(
								JSON.stringify({ error: "contentId is required" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						if (planIds.length === 0) {
							throw new Response(
								JSON.stringify({ error: "At least one plan ID is required" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						const ruleId = generateId();
						const rule = {
							id: ruleId,
							contentId,
							targetType,
							planIds,
							type: ruleType,
							dripDays,
							previewText,
							createdAt: new Date().toISOString(),
						};

						// Save rule to KV
						await ctx.kv.set(`gating-rule:${ruleId}`, JSON.stringify(rule));

						// Add to rules list
						const listJson = await ctx.kv.get<string>("gating-rules:list");
						const ruleIds = parseJSON<string[]>(listJson, []);
						ruleIds.push(ruleId);
						await ctx.kv.set("gating-rules:list", JSON.stringify(ruleIds));

						ctx.log.info(`Gating rule created: ${ruleId} for ${contentId}`);

						return { ruleId, success: true };
					} catch (error) {
						if (error instanceof Response) throw error;
						ctx.log.error(`Create gating rule error: ${String(error)}`);
						throw new Response(
							JSON.stringify({ error: "Internal server error" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}
				},
			},

			/**
			 * GET /membership/gating/rules
			 * List all gating rules (admin only)
			 *
			 * Returns: { rules: GatingRule[] }
			 */
			listGatingRules: {
				handler: async (_routeCtx: unknown, ctx: PluginContext) => {
					try {
						const listJson = await ctx.kv.get<string>("gating-rules:list");
						const ruleIds = parseJSON<string[]>(listJson, []);

						const rules = [];
						for (const ruleId of ruleIds) {
							const ruleJson = await ctx.kv.get<string>(`gating-rule:${ruleId}`);
							if (ruleJson) {
								const rule = parseJSON(ruleJson, null);
								if (rule) rules.push(rule);
							}
						}

						return { rules };
					} catch (error) {
						ctx.log.error(`List gating rules error: ${String(error)}`);
						throw new Response(
							JSON.stringify({ error: "Internal server error" }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}
				},
			},

			/**
			 * GET /membership/gating/check?targetType=page&targetId=page-id&email=user@example.com
			 * Check if a user has access to gated content
			 *
			 * Returns: { hasAccess: boolean, reason?: string, unlocksOn?: string }
			 */
			checkGatingAccess: {
				public: true,
				handler: async (routeCtx: unknown, ctx: PluginContext) => {
					try {
						const rc = routeCtx as Record<string, unknown>;
						const input = rc.input as Record<string, unknown>;
						const targetType = String(input.targetType ?? "page").trim();
						const targetId = String(input.targetId ?? "").trim();
						const email = String(input.email ?? "").trim().toLowerCase();

						if (!targetId) {
							return {
								hasAccess: false,
								reason: "targetId is required",
							};
						}

						if (!email || !isValidEmail(email)) {
							return {
								hasAccess: false,
								reason: "Valid email is required",
							};
						}

						// Find gating rule for this content
						const listJson = await ctx.kv.get<string>("gating-rules:list");
						const ruleIds = parseJSON<string[]>(listJson, []);

						let rule = null;
						for (const ruleId of ruleIds) {
							const ruleJson = await ctx.kv.get<string>(`gating-rule:${ruleId}`);
							if (ruleJson) {
								const r = parseJSON(ruleJson, null);
								if (r && r.contentId === targetId && r.targetType === targetType) {
									rule = r;
									break;
								}
							}
						}

						// If no rule exists, content is public
						if (!rule) {
							return { hasAccess: true };
						}

						// Check access using gating utility
						const { canAccessContent } = await import("./gating");
						const encodedEmail = emailToKvKey(email);
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						const member = parseJSON<MemberRecord>(memberJson, null);

						if (!member) {
							return {
								hasAccess: false,
								reason: "Member not found",
							};
						}

						const result = await canAccessContent(member.email, email, rule, ctx);

						return {
							hasAccess: result.hasAccess,
							reason: result.reason,
							unlocksOn: result.unlocksOn?.toISOString(),
						};
					} catch (error) {
						ctx.log.error(`Check gating access error: ${String(error)}`);
						return {
							hasAccess: false,
							reason: "Access check failed",
						};
					}
				},
			},

			/**
			 * POST /membership/drip/process
			 * Admin cron endpoint: Process drip content unlocks for all members
			 *
			 * Checks all members with active subscriptions and drip gating rules.
			 * If member's daysAfterJoin >= rule.dripDays, unlocks content and sends email.
			 * Uses UTC midnight boundary for consistency.
			 *
			 * Returns: { processed: number, unlocked: number, errors?: string[] }
			 */
			processDripUnlocks: {
				public: true,
				handler: async (routeCtx: unknown, ctx: PluginContext) => {
					try {
						const rc = routeCtx as Record<string, unknown>;
						const headers = rc.headers as Record<string, string> | undefined;
						const cronSecret = headers?.["x-cron-secret"] || "";

						// Verify cron secret if configured
						const expectedCronSecret = (ctx as any).env?.CRON_SECRET as string | undefined;
						if (expectedCronSecret && cronSecret !== expectedCronSecret) {
							ctx.log.warn("Drip process: unauthorized cron request");
							throw new Response(
								JSON.stringify({ error: "Unauthorized" }),
								{ status: 401, headers: { "Content-Type": "application/json" } }
							);
						}

						let processed = 0;
						let unlocked = 0;
						const errors: string[] = [];

						// Get all members
						const membersListJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(membersListJson, []);

						// Get all drip gating rules
						const rulesListJson = await ctx.kv.get<string>("gating-rules:list");
						const ruleIds = parseJSON<string[]>(rulesListJson, []);

						// Collect drip rules
						const dripRules = [];
						for (const ruleId of ruleIds) {
							const ruleJson = await ctx.kv.get<string>(`gating-rule:${ruleId}`);
							if (ruleJson) {
								const rule = parseJSON<any>(ruleJson, null);
								if (rule && rule.type === "drip") {
									dripRules.push(rule);
								}
							}
						}

						// Process each member
						for (const encodedEmail of memberEmails) {
							try {
								processed++;
								const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
								const member = parseJSON<MemberRecord>(memberJson, null);

								if (!member || member.status !== "active") {
									continue;
								}

								// Check if subscription has expired
								if (member.expiresAt && new Date(member.expiresAt) < new Date()) {
									continue;
								}

								if (!member.joinDate) {
									// No join date, skip drip checks
									continue;
								}

								const joinDate = new Date(member.joinDate);
								const joinMidnight = new Date(joinDate.getUTCFullYear(), joinDate.getUTCMonth(), joinDate.getUTCDate(), 0, 0, 0, 0);
								const joinMidnightUTC = new Date(joinMidnight.getTime() - joinMidnight.getTimezoneOffset() * 60000);

								// Initialize content access array if not present
								if (!member.contentAccess) {
									member.contentAccess = [];
								}

								// Check each drip rule
								for (const rule of dripRules) {
									// Skip if member doesn't have the required plan
									if (!rule.planIds || !rule.planIds.includes(member.plan)) {
										continue;
									}

									// Skip if already unlocked
									if (member.contentAccess && member.contentAccess.includes(rule.contentId)) {
										continue;
									}

									// Calculate unlock time
									const unlockMidnight = new Date(joinMidnightUTC.getTime() + (rule.dripDays || 0) * 24 * 60 * 60 * 1000);
									const nowMidnight = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0, 0);
									const nowMidnightUTC = new Date(nowMidnight.getTime() - nowMidnight.getTimezoneOffset() * 60000);

									// Check if unlock time has passed
									if (nowMidnightUTC >= unlockMidnight) {
										// Unlock content
										if (!member.contentAccess) {
											member.contentAccess = [];
										}
										member.contentAccess.push(rule.contentId);
										unlocked++;

										// Send unlock email notification
										try {
											const emailVars: EmailVariables = {
												memberEmail: member.email,
												planName: member.plan,
												contentName: rule.contentId,
												siteName: "our community",
											};
											const emailTemplate = createDripUnlockTemplate(emailVars);
											await sendMembershipEmail(emailTemplate, member.email, ctx);
										} catch (emailError) {
											ctx.log.warn(`Drip unlock email failed for ${member.email}: ${String(emailError)}`);
											// Continue anyway, content is unlocked
										}
									}
								}

								// Save updated member
								await updateMember(member, ctx);
							} catch (memberError) {
								errors.push(`Member ${encodedEmail}: ${String(memberError)}`);
								ctx.log.error(`Drip process member error: ${String(memberError)}`);
							}
						}

						ctx.log.info(`Drip unlock process: ${processed} members processed, ${unlocked} items unlocked`);

						return {
							success: true,
							processed,
							unlocked,
							errors: errors.length > 0 ? errors : undefined,
						};
					} catch (error) {
						if (error instanceof Response) {
							throw error;
						}
						ctx.log.error(`Drip process error: ${String(error)}`);
						throw new Response(
							JSON.stringify({ error: "Internal server error", message: String(error) }),
							{ status: 500, headers: { "Content-Type": "application/json" } }
						);
					}
				},
			},
		},

		/**
		 * PHASE 4 WAVE 1: Task 1 - MemberShip Reporting
		 * GET /membership/reports/revenue
		 * GET /membership/reports/churn
		 * GET /membership/reports/members
		 */
		revenueReport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const days = Number(input.days ?? 30);

					// Get all members
					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					const dateMap = new Map<string, number>();
					let totalRevenue = 0;
					let mrrAmount = 0;

					// Aggregate revenue by date and calculate MRR
					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null);
						if (!member) continue;

						// Get plan price
						const plansJson = await ctx.kv.get<string>("plans");
						const plans = parseJSON(plansJson, DEFAULT_PLANS);
						const plan = plans.find((p: PlanConfig) => p.id === member.plan);
						if (!plan) continue;

						const createdDate = new Date(member.createdAt);
						const now = new Date();
						const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

						// Only count members within the last N days
						if (daysDiff <= days) {
							const dateKey = createdDate.toISOString().split('T')[0];
							dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + plan.price);
							totalRevenue += plan.price;
						}

						// Add to MRR if active monthly subscription
						if (member.status === "active" && member.planInterval === "month") {
							mrrAmount += plan.price / 100; // Convert from cents
						}
					}

					// Convert map to sorted array
					const chartData = Array.from(dateMap.entries())
						.map(([date, amount]) => ({ date, amount }))
						.sort((a, b) => a.date.localeCompare(b.date));

					return {
						totalRevenue: totalRevenue / 100,
						mrr: Math.round(mrrAmount * 100) / 100,
						averageRevenuePerMember: totalRevenue / Math.max(memberEmails.length, 1) / 100,
						memberCount: memberEmails.length,
						chartData,
						period: `last ${days} days`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Revenue report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		churnReport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const days = Number(input.days ?? 30);

					// Get all members
					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					const now = new Date();
					const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

					let activeMembersAtStart = 0;
					let cancelledInPeriod = 0;

					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null);
						if (!member) continue;

						const createdDate = new Date(member.createdAt);

						// Was active at start of period?
						if (createdDate < cutoff && (member.status === "active" || member.status === "cancelled")) {
							activeMembersAtStart++;
						}

						// Cancelled during period?
						if (member.status === "cancelled" && createdDate >= cutoff) {
							cancelledInPeriod++;
						}
					}

					const churnRate = activeMembersAtStart > 0
						? Math.round((cancelledInPeriod / activeMembersAtStart) * 10000) / 100
						: 0;

					return {
						churnRate: `${churnRate}%`,
						cancelledMembers: cancelledInPeriod,
						activeMembersAtStart,
						period: `last ${days} days`,
						retentionRate: `${Math.round((100 - churnRate) * 100) / 100}%`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Churn report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		membersReport: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const planId = input.planId ? String(input.planId).trim() : undefined;
					const status = input.status ? String(input.status).trim() : undefined;
					const search = input.search ? String(input.search).toLowerCase().trim() : undefined;
					const page = Number(input.page ?? 1);
					const perPage = Number(input.perPage ?? 20);

					// Get all members
					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					const members = [];
					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null);
						if (!member) continue;

						// Apply filters
						if (planId && member.plan !== planId) continue;
						if (status && member.status !== status) continue;
						if (search && !member.email.toLowerCase().includes(search)) continue;

						members.push({
							email: member.email,
							plan: member.plan,
							status: member.status,
							createdAt: member.createdAt,
							expiresAt: member.expiresAt || null,
							planInterval: member.planInterval || "once",
						});
					}

					// Sort by created date descending
					members.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

					// Paginate
					const start = (page - 1) * perPage;
					const end = start + perPage;
					const paginated = members.slice(start, end);

					return {
						members: paginated,
						total: members.length,
						page,
						perPage,
						totalPages: Math.ceil(members.length / perPage),
						summary: {
							total: members.length,
							active: members.filter(m => m.status === "active").length,
							pastDue: members.filter(m => m.status === "past_due").length,
							cancelled: members.filter(m => m.status === "cancelled").length,
						},
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Members report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * PHASE 4 WAVE 1: Task 3 - Group Memberships
		 * POST /membership/groups/create
		 * POST /membership/groups/:id/invite
		 * POST /membership/groups/:id/remove
		 * GET /membership/groups/:id
		 * POST /membership/groups/accept
		 */
		groupCreate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const orgName = String(input.orgName ?? "").trim();
					const orgEmail = String(input.orgEmail ?? "").trim().toLowerCase();
					const planId = String(input.planId ?? "").trim();
					const maxSeats = Number(input.maxSeats ?? 10);
					const adminEmail = String(input.adminEmail ?? "").trim().toLowerCase();

					// Validate
					if (!orgName || !orgEmail || !planId || maxSeats < 1) {
						throw new Response(
							JSON.stringify({ error: "Missing required fields" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Create group
					const groupId = generateUUID();
					const group: GroupRecord = {
						id: groupId,
						orgName,
						orgEmail,
						adminEmail,
						planId,
						maxSeats,
						members: [adminEmail],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};

					await ctx.kv.set(`group:${groupId}`, JSON.stringify(group));

					// Add to groups list
					const listJson = await ctx.kv.get<string>("groups:list");
					const groups = parseJSON<string[]>(listJson, []);
					groups.push(groupId);
					await ctx.kv.set("groups:list", JSON.stringify(groups));

					ctx.log.info(`Group created: ${groupId} (${orgName})`);

					return {
						success: true,
						group,
						message: `Group "${orgName}" created with max ${maxSeats} seats`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Group create error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		groupInvite: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const groupId = String(input.groupId ?? "").trim();
					const email = String(input.email ?? "").trim().toLowerCase();

					// Get group
					const groupJson = await ctx.kv.get<string>(`group:${groupId}`);
					if (!groupJson) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const group = parseJSON<GroupRecord>(groupJson, null);
					if (!group) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check seat availability
					if (group.members.length >= group.maxSeats) {
						throw new Response(
							JSON.stringify({ error: "Group has reached maximum seats" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Generate invite code
					const code = generateUUID();
					const invite: GroupInviteCode = {
						code,
						groupId,
						email,
						expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
						createdAt: new Date().toISOString(),
						createdBy: adminUser.email as string || "admin",
					};

					await ctx.kv.set(`group:invite:${code}`, JSON.stringify(invite));

					// Add to group's invites list
					const invitesJson = await ctx.kv.get<string>(`group:${groupId}:invites`);
					const invites = parseJSON<string[]>(invitesJson, []);
					invites.push(code);
					await ctx.kv.set(`group:${groupId}:invites`, JSON.stringify(invites));

					ctx.log.info(`Group invite created: ${groupId} -> ${email}`);

					return {
						success: true,
						inviteCode: code,
						inviteLink: `${(ctx as any).env?.APP_URL || 'https://app.shipyard.io'}/join-group?code=${code}`,
						message: `Invite sent to ${email}`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Group invite error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		groupRemove: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const groupId = String(input.groupId ?? "").trim();
					const email = String(input.email ?? "").trim().toLowerCase();

					// Get group
					const groupJson = await ctx.kv.get<string>(`group:${groupId}`);
					if (!groupJson) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const group = parseJSON<GroupRecord>(groupJson, null);
					if (!group) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Remove member
					const idx = group.members.indexOf(email);
					if (idx === -1) {
						throw new Response(
							JSON.stringify({ error: "Member not in group" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					group.members.splice(idx, 1);
					group.updatedAt = new Date().toISOString();
					await ctx.kv.set(`group:${groupId}`, JSON.stringify(group));

					ctx.log.info(`Removed ${email} from group ${groupId}`);

					return {
						success: true,
						message: `${email} removed from group`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Group remove error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		groupGet: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const groupId = String(input.groupId ?? "").trim();

					const groupJson = await ctx.kv.get<string>(`group:${groupId}`);
					if (!groupJson) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const group = parseJSON<GroupRecord>(groupJson, null);
					if (!group) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					return {
						group,
						seatsUsed: group.members.length,
						seatsAvailable: group.maxSeats - group.members.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Group get error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		groupAccept: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const code = String(input.code ?? "").trim();
					const email = String(input.email ?? "").trim().toLowerCase();

					// Get invite
					const inviteJson = await ctx.kv.get<string>(`group:invite:${code}`);
					if (!inviteJson) {
						throw new Response(
							JSON.stringify({ error: "Invite not found or expired" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const invite = parseJSON<GroupInviteCode>(inviteJson, null);
					if (!invite) {
						throw new Response(
							JSON.stringify({ error: "Invite not found or expired" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check expiry
					if (new Date(invite.expiresAt) < new Date()) {
						throw new Response(
							JSON.stringify({ error: "Invite has expired" }),
							{ status: 410, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get group
					const groupJson = await ctx.kv.get<string>(`group:${invite.groupId}`);
					if (!groupJson) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const group = parseJSON<GroupRecord>(groupJson, null);
					if (!group) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Check seat availability
					if (group.members.length >= group.maxSeats) {
						throw new Response(
							JSON.stringify({ error: "Group has reached maximum seats" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Add member to group
					if (!group.members.includes(email)) {
						group.members.push(email);
						group.updatedAt = new Date().toISOString();
						await ctx.kv.set(`group:${invite.groupId}`, JSON.stringify(group));
					}

					// Delete invite
					await ctx.kv.delete(`group:invite:${code}`);

					ctx.log.info(`Member ${email} joined group ${invite.groupId}`);

					return {
						success: true,
						group,
						message: `Welcome to ${group.orgName}!`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Group accept error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * PHASE 5 WAVE 1: Member-facing group endpoints
		 * GET /membership/groups/my — look up current member's group
		 * POST /membership/groups/my/invite — owner creates invite
		 * POST /membership/groups/my/remove — owner removes member
		 */
		memberGroupLookup: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!email) {
						throw new Response(
							JSON.stringify({ error: "Email required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Scan groups to find one containing this member
					const listJson = await ctx.kv.get<string>("groups:list");
					const groupIds = parseJSON<string[]>(listJson, []);

					for (const gid of groupIds) {
						const gJson = await ctx.kv.get<string>(`group:${gid}`);
						if (!gJson) continue;
						const g = parseJSON<GroupRecord>(gJson, null);
						if (!g) continue;
						if (g.members.includes(email)) {
							return {
								found: true,
								group: g,
								isOwner: g.adminEmail === email,
								seatsUsed: g.members.length,
								seatsAvailable: g.maxSeats - g.members.length,
							};
						}
					}

					return { found: false };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Member group lookup error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		memberGroupInvite: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const ownerEmail = String(input.ownerEmail ?? "").trim().toLowerCase();
					const groupId = String(input.groupId ?? "").trim();
					const inviteEmail = String(input.email ?? "").trim().toLowerCase();

					if (!ownerEmail || !groupId) {
						throw new Response(
							JSON.stringify({ error: "Missing required fields" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const groupJson = await ctx.kv.get<string>(`group:${groupId}`);
					if (!groupJson) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const group = parseJSON<GroupRecord>(groupJson, null);
					if (!group) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					if (group.adminEmail !== ownerEmail) {
						throw new Response(
							JSON.stringify({ error: "Only the group owner can invite members" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (group.members.length >= group.maxSeats) {
						throw new Response(
							JSON.stringify({ error: "Group has reached maximum seats" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const code = generateUUID();
					const invite: GroupInviteCode = {
						code,
						groupId,
						email: inviteEmail || undefined,
						expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
						createdAt: new Date().toISOString(),
						createdBy: ownerEmail,
					};

					await ctx.kv.set(`group:invite:${code}`, JSON.stringify(invite));

					const invitesJson = await ctx.kv.get<string>(`group:${groupId}:invites`);
					const invites = parseJSON<string[]>(invitesJson, []);
					invites.push(code);
					await ctx.kv.set(`group:${groupId}:invites`, JSON.stringify(invites));

					ctx.log.info(`Member-facing group invite: ${groupId} by ${ownerEmail}`);

					return {
						success: true,
						inviteCode: code,
						inviteLink: `${(ctx as any).env?.APP_URL || ''}/join-group?code=${code}`,
						message: inviteEmail ? `Invite created for ${inviteEmail}` : "Invite link created",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Member group invite error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		memberGroupRemove: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const ownerEmail = String(input.ownerEmail ?? "").trim().toLowerCase();
					const groupId = String(input.groupId ?? "").trim();
					const removeEmail = String(input.email ?? "").trim().toLowerCase();

					if (!ownerEmail || !groupId || !removeEmail) {
						throw new Response(
							JSON.stringify({ error: "Missing required fields" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const groupJson = await ctx.kv.get<string>(`group:${groupId}`);
					if (!groupJson) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const group = parseJSON<GroupRecord>(groupJson, null);
					if (!group) {
						throw new Response(
							JSON.stringify({ error: "Group not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					if (group.adminEmail !== ownerEmail) {
						throw new Response(
							JSON.stringify({ error: "Only the group owner can remove members" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					if (removeEmail === group.adminEmail) {
						throw new Response(
							JSON.stringify({ error: "Cannot remove the group owner" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const idx = group.members.indexOf(removeEmail);
					if (idx === -1) {
						throw new Response(
							JSON.stringify({ error: "Member not in group" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					group.members.splice(idx, 1);
					group.updatedAt = new Date().toISOString();
					await ctx.kv.set(`group:${groupId}`, JSON.stringify(group));

					ctx.log.info(`Member-facing remove: ${removeEmail} from group ${groupId} by ${ownerEmail}`);

					return {
						success: true,
						message: `${removeEmail} removed from group`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Member group remove error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * PHASE 4 WAVE 1: Task 4 - Developer Webhooks
		 * POST /membership/webhooks/register
		 * DELETE /membership/webhooks/:id
		 * GET /membership/webhooks
		 */
		webhookRegister: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const url = String(input.url ?? "").trim();
					const events = input.events as string[] | undefined;

					// Validate
					if (!url || !events || events.length === 0) {
						throw new Response(
							JSON.stringify({ error: "URL and events required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Validate URL
					try {
						new URL(url);
					} catch {
						throw new Response(
							JSON.stringify({ error: "Invalid URL" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Create webhook
					const webhookId = generateUUID();
					const secret = generateUUID();
					const webhook: WebhookEndpoint = {
						id: webhookId,
						url,
						events,
						secret,
						active: true,
						createdAt: new Date().toISOString(),
						failedCount: 0,
					};

					await ctx.kv.set(`webhook:${webhookId}`, JSON.stringify(webhook));

					// Add to webhooks list
					const listJson = await ctx.kv.get<string>("webhooks:list");
					const webhooks = parseJSON<string[]>(listJson, []);
					webhooks.push(webhookId);
					await ctx.kv.set("webhooks:list", JSON.stringify(webhooks));

					ctx.log.info(`Webhook registered: ${webhookId} for ${events.join(", ")}`);

					return {
						success: true,
						webhook,
						secret: webhook.secret,
						message: "Webhook registered successfully",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook register error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		webhookDelete: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const webhookId = String(input.webhookId ?? "").trim();

					const webhookJson = await ctx.kv.get<string>(`webhook:${webhookId}`);
					if (!webhookJson) {
						throw new Response(
							JSON.stringify({ error: "Webhook not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Delete webhook
					await ctx.kv.delete(`webhook:${webhookId}`);

					// Remove from list
					const listJson = await ctx.kv.get<string>("webhooks:list");
					const webhooks = parseJSON<string[]>(listJson, []);
					const idx = webhooks.indexOf(webhookId);
					if (idx !== -1) {
						webhooks.splice(idx, 1);
						await ctx.kv.set("webhooks:list", JSON.stringify(webhooks));
					}

					ctx.log.info(`Webhook deleted: ${webhookId}`);

					return {
						success: true,
						message: "Webhook deleted",
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook delete error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		webhookList: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("webhooks:list");
					const webhookIds = parseJSON<string[]>(listJson, []);

					const webhooks: WebhookEndpoint[] = [];
					for (const id of webhookIds) {
						const webhookJson = await ctx.kv.get<string>(`webhook:${id}`);
						if (webhookJson) {
							const webhook = parseJSON<WebhookEndpoint>(webhookJson, null);
							if (webhook) {
								webhooks.push(webhook);
							}
						}
					}

					return {
						webhooks,
						total: webhooks.length,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		webhookTest: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const webhookId = String(input.webhookId ?? "").trim();

					const webhookJson = await ctx.kv.get<string>(`webhook:${webhookId}`);
					if (!webhookJson) {
						throw new Response(
							JSON.stringify({ error: "Webhook not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const webhook = parseJSON<WebhookEndpoint>(webhookJson, null);
					if (!webhook) {
						throw new Response(
							JSON.stringify({ error: "Webhook not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Fire test webhook
					const testData = {
						member_id: "test-123",
						email: "test@example.com",
						plan_id: "basic",
						created_at: new Date().toISOString(),
					};

					const log = await fireWebhook(webhook, "member.created", testData, ctx);

					return {
						success: log.success,
						log,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook test error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 2: Task 5 - Registration Forms Builder */

		/**
		 * POST /membership/forms/create
		 * Admin creates a custom registration form with configurable fields.
		 *
		 * Body: { name, description?, fields: Array<{ type, label, required, options?, placeholder? }>, steps?: Array<{ label, fieldIds }> }
		 * Returns: { success: true, form: FormDefinition }
		 */
		formCreate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const name = String(input.name ?? "").trim();
					const description = input.description ? String(input.description).trim() : undefined;
					const fieldsInput = input.fields as Array<Record<string, unknown>> | undefined;

					if (!name || name.length > 200) {
						throw new Response(
							JSON.stringify({ error: "Form name is required (max 200 chars)" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!fieldsInput || !Array.isArray(fieldsInput) || fieldsInput.length === 0) {
						throw new Response(
							JSON.stringify({ error: "At least one field is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (fieldsInput.length > 50) {
						throw new Response(
							JSON.stringify({ error: "Maximum 50 fields per form" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const validFieldTypes = ["text", "email", "dropdown", "checkbox", "phone"];
					const fields: FormFieldDefinition[] = fieldsInput.map((f) => {
						const type = String(f.type ?? "").trim();
						const label = String(f.label ?? "").trim();
						const required = Boolean(f.required ?? false);
						const options = f.options as string[] | undefined;
						const placeholder = f.placeholder ? String(f.placeholder).trim() : undefined;

						if (!validFieldTypes.includes(type)) {
							throw new Response(
								JSON.stringify({ error: `Invalid field type: ${type}. Valid types: ${validFieldTypes.join(", ")}` }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						if (!label || label.length > 200) {
							throw new Response(
								JSON.stringify({ error: "Field label is required (max 200 chars)" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						if (type === "dropdown" && (!options || !Array.isArray(options) || options.length === 0)) {
							throw new Response(
								JSON.stringify({ error: `Dropdown field "${label}" requires options array` }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						return {
							id: generateId(),
							type: type as FormFieldDefinition["type"],
							label,
							required,
							...(options && { options }),
							...(placeholder && { placeholder }),
						};
					});

					// Phase 5 Wave 1: Parse optional multi-step configuration
					const stepsInput = input.steps as Array<Record<string, unknown>> | undefined;
					let steps: FormStep[] | undefined;

					if (stepsInput && Array.isArray(stepsInput) && stepsInput.length > 0) {
						if (stepsInput.length > 20) {
							throw new Response(
								JSON.stringify({ error: "Maximum 20 steps per form" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						const allFieldIds = new Set(fields.map((f) => f.id));
						const assignedFieldIds = new Set<string>();

						steps = stepsInput.map((s, idx) => {
							const label = String(s.label ?? "").trim();
							if (!label || label.length > 200) {
								throw new Response(
									JSON.stringify({ error: `Step ${idx + 1}: label is required (max 200 chars)` }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}

							const fieldIds = s.fieldIds as string[] | undefined;
							if (!fieldIds || !Array.isArray(fieldIds) || fieldIds.length === 0) {
								throw new Response(
									JSON.stringify({ error: `Step "${label}": must reference at least one field` }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}

							for (const fid of fieldIds) {
								if (!allFieldIds.has(fid)) {
									throw new Response(
										JSON.stringify({ error: `Step "${label}": fieldId "${fid}" does not match any field` }),
										{ status: 400, headers: { "Content-Type": "application/json" } }
									);
								}
								if (assignedFieldIds.has(fid)) {
									throw new Response(
										JSON.stringify({ error: `Step "${label}": fieldId "${fid}" is already assigned to another step` }),
										{ status: 400, headers: { "Content-Type": "application/json" } }
									);
								}
								assignedFieldIds.add(fid);
							}

							return { label, fieldIds };
						});

						// Ensure every field is assigned to a step
						for (const f of fields) {
							if (!assignedFieldIds.has(f.id)) {
								throw new Response(
									JSON.stringify({ error: `Field "${f.label}" (${f.id}) is not assigned to any step` }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}
						}
					}

					const formId = generateId();
					const now = new Date().toISOString();
					const form: FormDefinition = {
						id: formId,
						name,
						fields,
						createdAt: now,
						updatedAt: now,
					};
					if (description) form.description = description;
					if (steps) form.steps = steps;

					await ctx.kv.set(`form:${formId}`, JSON.stringify(form));

					// Add to forms list
					const listJson = await ctx.kv.get<string>("forms:list");
					const formIds = parseJSON<string[]>(listJson, []);
					formIds.push(formId);
					await ctx.kv.set("forms:list", JSON.stringify(formIds));

					ctx.log.info(`Form created: ${formId} — ${name}`);

					return { success: true, form };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Form create error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * PUT /membership/forms/:id
		 * Admin updates a form definition — fields, steps, name, description.
		 * Backward compatible: omitting `steps` leaves them unchanged; sending `steps: null` removes them.
		 *
		 * Body: { name?, description?, fields?, steps? }
		 * Returns: { success: true, form: FormDefinition }
		 */
		formUpdate: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const formId = String((rc.pathParams as Record<string, unknown>)?.id ?? "").trim();
					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const formJson = await ctx.kv.get<string>(`form:${formId}`);
					if (!formJson) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const existing = parseJSON<FormDefinition>(formJson, null);
					if (!existing) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;

					if (input.name !== undefined) {
						const name = String(input.name).trim();
						if (!name || name.length > 200) {
							throw new Response(
								JSON.stringify({ error: "Form name is required (max 200 chars)" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}
						existing.name = name;
					}

					if (input.description !== undefined) {
						existing.description = input.description ? String(input.description).trim() : undefined;
					}

					if (input.fields !== undefined) {
						const fieldsInput = input.fields as Array<Record<string, unknown>>;
						if (!Array.isArray(fieldsInput) || fieldsInput.length === 0) {
							throw new Response(
								JSON.stringify({ error: "At least one field is required" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}
						if (fieldsInput.length > 50) {
							throw new Response(
								JSON.stringify({ error: "Maximum 50 fields per form" }),
								{ status: 400, headers: { "Content-Type": "application/json" } }
							);
						}

						const validFieldTypes = ["text", "email", "dropdown", "checkbox", "phone"];
						existing.fields = fieldsInput.map((f) => {
							const type = String(f.type ?? "").trim();
							const label = String(f.label ?? "").trim();
							const required = Boolean(f.required ?? false);
							const options = f.options as string[] | undefined;
							const placeholder = f.placeholder ? String(f.placeholder).trim() : undefined;
							const id = f.id ? String(f.id).trim() : generateId();

							if (!validFieldTypes.includes(type)) {
								throw new Response(
									JSON.stringify({ error: `Invalid field type: ${type}` }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}
							if (!label || label.length > 200) {
								throw new Response(
									JSON.stringify({ error: "Field label is required (max 200 chars)" }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}
							if (type === "dropdown" && (!options || !Array.isArray(options) || options.length === 0)) {
								throw new Response(
									JSON.stringify({ error: `Dropdown field "${label}" requires options array` }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}

							return {
								id,
								type: type as FormFieldDefinition["type"],
								label,
								required,
								...(options && { options }),
								...(placeholder && { placeholder }),
							};
						});
					}

					// Update steps — null explicitly removes steps, undefined leaves unchanged
					if (input.steps !== undefined) {
						if (input.steps === null) {
							delete existing.steps;
						} else {
							const stepsInput = input.steps as Array<Record<string, unknown>>;
							if (!Array.isArray(stepsInput) || stepsInput.length === 0) {
								throw new Response(
									JSON.stringify({ error: "Steps must be a non-empty array or null to remove" }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}
							if (stepsInput.length > 20) {
								throw new Response(
									JSON.stringify({ error: "Maximum 20 steps per form" }),
									{ status: 400, headers: { "Content-Type": "application/json" } }
								);
							}

							const allFieldIds = new Set(existing.fields.map((f) => f.id));
							const assignedFieldIds = new Set<string>();

							existing.steps = stepsInput.map((s, idx) => {
								const label = String(s.label ?? "").trim();
								if (!label || label.length > 200) {
									throw new Response(
										JSON.stringify({ error: `Step ${idx + 1}: label is required (max 200 chars)` }),
										{ status: 400, headers: { "Content-Type": "application/json" } }
									);
								}

								const fieldIds = s.fieldIds as string[] | undefined;
								if (!fieldIds || !Array.isArray(fieldIds) || fieldIds.length === 0) {
									throw new Response(
										JSON.stringify({ error: `Step "${label}": must reference at least one field` }),
										{ status: 400, headers: { "Content-Type": "application/json" } }
									);
								}

								for (const fid of fieldIds) {
									if (!allFieldIds.has(fid)) {
										throw new Response(
											JSON.stringify({ error: `Step "${label}": fieldId "${fid}" does not match any field` }),
											{ status: 400, headers: { "Content-Type": "application/json" } }
										);
									}
									if (assignedFieldIds.has(fid)) {
										throw new Response(
											JSON.stringify({ error: `Step "${label}": fieldId "${fid}" is already assigned to another step` }),
											{ status: 400, headers: { "Content-Type": "application/json" } }
										);
									}
									assignedFieldIds.add(fid);
								}

								return { label, fieldIds };
							});

							for (const f of existing.fields) {
								if (!assignedFieldIds.has(f.id)) {
									throw new Response(
										JSON.stringify({ error: `Field "${f.label}" (${f.id}) is not assigned to any step` }),
										{ status: 400, headers: { "Content-Type": "application/json" } }
									);
								}
							}
						}
					}

					existing.updatedAt = new Date().toISOString();
					await ctx.kv.set(`form:${formId}`, JSON.stringify(existing));

					ctx.log.info(`Form updated: ${formId} — ${existing.name}`);

					return { success: true, form: existing };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Form update error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/forms/:id
		 * Get a form definition by ID.
		 *
		 * Returns: { form: FormDefinition }
		 */
		formDetail: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const formId = String((rc.pathParams as Record<string, unknown>)?.id ?? "").trim();

					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const formJson = await ctx.kv.get<string>(`form:${formId}`);
					if (!formJson) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const form = parseJSON<FormDefinition>(formJson, null);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					return { form };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Form detail error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/forms
		 * List all registration forms.
		 *
		 * Returns: { forms: FormDefinition[], total: number }
		 */
		formList: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const listJson = await ctx.kv.get<string>("forms:list");
					const formIds = parseJSON<string[]>(listJson, []);

					const forms: FormDefinition[] = [];
					for (const id of formIds) {
						const formJson = await ctx.kv.get<string>(`form:${id}`);
						if (formJson) {
							const form = parseJSON<FormDefinition>(formJson, null);
							if (form) forms.push(form);
						}
					}

					// Sort by creation date descending
					forms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

					return { forms, total: forms.length };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Form list error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/forms/:id/submit
		 * Public endpoint. Submit a form, validates against form definition.
		 *
		 * Body: { data: Record<string, unknown> }
		 * Returns: { success: true, submissionId: string }
		 */
		formSubmit: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const formId = String((rc.pathParams as Record<string, unknown>)?.id ?? "").trim();
					const input = rc.input as Record<string, unknown>;
					const data = input.data as Record<string, unknown> | undefined;

					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					if (!data || typeof data !== "object") {
						throw new Response(
							JSON.stringify({ error: "Submission data is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Get form definition
					const formJson = await ctx.kv.get<string>(`form:${formId}`);
					if (!formJson) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const form = parseJSON<FormDefinition>(formJson, null);
					if (!form) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Validate against form definition
					const errors: string[] = [];
					const sanitizedData: Record<string, unknown> = {};

					for (const field of form.fields) {
						const value = data[field.id];

						// Check required fields
						if (field.required && (value === undefined || value === null || value === "")) {
							errors.push(`${field.label} is required`);
							continue;
						}

						if (value === undefined || value === null || value === "") {
							continue; // Skip optional empty fields
						}

						// Validate by type
						switch (field.type) {
							case "email": {
								const emailVal = String(value).trim().toLowerCase();
								if (!isValidEmail(emailVal)) {
									errors.push(`${field.label} must be a valid email`);
								} else {
									sanitizedData[field.id] = emailVal;
								}
								break;
							}
							case "phone": {
								const phoneVal = String(value).trim().replace(/[^0-9+\-() ]/g, "");
								if (phoneVal.length < 7 || phoneVal.length > 20) {
									errors.push(`${field.label} must be a valid phone number`);
								} else {
									sanitizedData[field.id] = phoneVal;
								}
								break;
							}
							case "dropdown": {
								const dropVal = String(value).trim();
								if (field.options && !field.options.includes(dropVal)) {
									errors.push(`${field.label} must be one of: ${field.options.join(", ")}`);
								} else {
									sanitizedData[field.id] = dropVal;
								}
								break;
							}
							case "checkbox": {
								sanitizedData[field.id] = Boolean(value);
								break;
							}
							case "text":
							default: {
								const textVal = String(value).trim();
								if (textVal.length > 5000) {
									errors.push(`${field.label} must be 5000 characters or less`);
								} else {
									sanitizedData[field.id] = textVal;
								}
								break;
							}
						}
					}

					if (errors.length > 0) {
						throw new Response(
							JSON.stringify({ error: "Validation failed", details: errors }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Store submission
					const submissionId = generateId();
					const submission: FormSubmission = {
						id: submissionId,
						formId,
						data: sanitizedData,
						submittedAt: new Date().toISOString(),
					};

					await ctx.kv.set(`form-submission:${formId}:${submissionId}`, JSON.stringify(submission));

					// Add to form's submissions list
					const subListJson = await ctx.kv.get<string>(`form-submissions:${formId}:list`);
					const subIds = parseJSON<string[]>(subListJson, []);
					subIds.push(submissionId);
					await ctx.kv.set(`form-submissions:${formId}:list`, JSON.stringify(subIds));

					ctx.log.info(`Form submission: ${submissionId} for form ${formId}`);

					return { success: true, submissionId };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Form submit error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/forms/:id/submissions
		 * Admin lists submissions for a form.
		 *
		 * Returns: { submissions: FormSubmission[], total: number }
		 */
		formSubmissions: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const formId = String((rc.pathParams as Record<string, unknown>)?.id ?? "").trim();

					if (!formId) {
						throw new Response(
							JSON.stringify({ error: "Form ID required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Verify form exists
					const formJson = await ctx.kv.get<string>(`form:${formId}`);
					if (!formJson) {
						throw new Response(
							JSON.stringify({ error: "Form not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const subListJson = await ctx.kv.get<string>(`form-submissions:${formId}:list`);
					const subIds = parseJSON<string[]>(subListJson, []);

					const submissions: FormSubmission[] = [];
					for (const id of subIds) {
						const subJson = await ctx.kv.get<string>(`form-submission:${formId}:${id}`);
						if (subJson) {
							const sub = parseJSON<FormSubmission>(subJson, null);
							if (sub) submissions.push(sub);
						}
					}

					// Sort by submission date descending
					submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

					return { submissions, total: submissions.length };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Form submissions error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 2: Task 9 - Multi-Gateway Schema Support */

		/**
		 * GET /membership/gateways
		 * List supported payment gateways.
		 *
		 * Returns: { gateways: Array<{ id, name, status, description }> }
		 */
		gatewaysList: {
			public: true,
			handler: async (_routeCtx: unknown, _ctx: PluginContext) => {
				return {
					gateways: [
						{
							id: "stripe",
							name: "Stripe",
							status: "active",
							description: "Credit/debit cards via Stripe. Fully integrated with webhooks and subscription management.",
						},
						{
							id: "paypal",
							name: "PayPal",
							status: "planned",
							description: "PayPal payments. Coming soon — webhook structure stubbed for future integration.",
						},
						{
							id: "manual",
							name: "Manual",
							status: "active",
							description: "Admin manually marks members as paid (check, cash, bank transfer, etc.).",
						},
					],
				};
			},
		},

		/**
		 * POST /membership/admin/mark-paid
		 * Admin manually marks a member as paid via a specific gateway.
		 *
		 * Body: { email, gateway?: "stripe" | "paypal" | "manual", notes?: string }
		 * Returns: { success: true, member: MemberRecord }
		 */
		adminMarkPaid: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const email = String(input.email ?? "").trim().toLowerCase();
					const gateway = String(input.gateway ?? "manual").trim() as "stripe" | "paypal" | "manual";
					const notes = input.notes ? String(input.notes).trim() : undefined;

					if (!email || !isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Valid email is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const validGateways = ["stripe", "paypal", "manual"];
					if (!validGateways.includes(gateway)) {
						throw new Response(
							JSON.stringify({ error: `Invalid gateway. Valid: ${validGateways.join(", ")}` }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const encodedEmail = emailToKvKey(email);
					const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					if (!memberJson) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const member = parseJSON<MemberRecord>(memberJson, null);
					if (!member) {
						throw new Response(
							JSON.stringify({ error: "Member not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Mark as active and tag payment method
					member.status = "active";
					member.paymentMethod = gateway;
					member.approvedAt = new Date().toISOString();
					member.lastSyncAt = new Date().toISOString();

					// Store admin mark-paid log
					if (notes) {
						const logKey = `member:${encodedEmail}:payment-log`;
						const logsJson = await ctx.kv.get<string>(logKey);
						const logs = parseJSON<Array<{ gateway: string; notes: string; markedAt: string }>>(logsJson, []);
						logs.push({ gateway, notes, markedAt: new Date().toISOString() });
						await ctx.kv.set(logKey, JSON.stringify(logs));
					}

					await updateMember(member, ctx);
					ctx.log.info(`Admin mark-paid: ${email} via ${gateway}`);

					return { success: true, member };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Admin mark-paid error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 3: Task 11 - CSV Import/Export */

		/**
		 * GET /membership/export/csv
		 * Admin endpoint. Export all members as CSV.
		 */
		exportCsv: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					const csvHeaders = "email,name,plan,status,createdAt,planInterval,paymentMethod";
					const rows: string[] = [csvHeaders];

					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null as any);
						if (!member) continue;

						const escapeCsv = (val: string) => {
							if (val.includes(",") || val.includes('"') || val.includes("\n")) {
								return `"${val.replace(/"/g, '""')}"`;
							}
							return val;
						};

						rows.push([
							escapeCsv(member.email || ""),
							escapeCsv(decodeURIComponent(encodedEmail).split("@")[0] || ""),
							escapeCsv(member.plan || ""),
							escapeCsv(member.status || ""),
							escapeCsv(member.createdAt || ""),
							escapeCsv(member.planInterval || ""),
							escapeCsv(member.paymentMethod || "stripe"),
						].join(","));
					}

					const csvContent = rows.join("\n");

					return new Response(csvContent, {
						status: 200,
						headers: {
							"Content-Type": "text/csv",
							"Content-Disposition": "attachment; filename=\"members-export.csv\"",
						},
					});
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`CSV export error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/import/csv
		 * Admin endpoint. Import members from CSV text body.
		 * Returns: { imported: N, errors: [{row, reason}] }
		 */
		importCsv: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const csvText = String(input.csv ?? input.body ?? "").trim();

					if (!csvText) {
						throw new Response(
							JSON.stringify({ error: "CSV body is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const lines = csvText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
					if (lines.length < 2) {
						throw new Response(
							JSON.stringify({ error: "CSV must have a header row and at least one data row" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Parse header
					const headerLine = lines[0] ?? "";
					const headers = headerLine.toLowerCase().split(",").map(h => h.trim());
					const emailIdx = headers.indexOf("email");
					if (emailIdx === -1) {
						throw new Response(
							JSON.stringify({ error: "CSV must contain an 'email' column" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const nameIdx = headers.indexOf("name");
					const planIdx = headers.indexOf("plan");
					const statusIdx = headers.indexOf("status");

					// Get existing members list for uniqueness check
					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);
					const existingSet = new Set(memberEmails.map(e => e.toLowerCase()));

					let imported = 0;
					const errors: Array<{ row: number; reason: string }> = [];

					for (let i = 1; i < lines.length; i++) {
						const line = lines[i] ?? "";
						const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
						const email = (cols[emailIdx] || "").toLowerCase().trim();

						if (!email) {
							errors.push({ row: i + 1, reason: "Missing email" });
							continue;
						}
						if (!isValidEmail(email)) {
							errors.push({ row: i + 1, reason: `Invalid email: ${email}` });
							continue;
						}
						if (email.length > 254) {
							errors.push({ row: i + 1, reason: `Email exceeds 254 characters` });
							continue;
						}

						const encodedEmail = emailToKvKey(email);
						if (existingSet.has(encodedEmail)) {
							errors.push({ row: i + 1, reason: `Duplicate email: ${email}` });
							continue;
						}

						const name = nameIdx >= 0 ? (cols[nameIdx] || "") : "";
						const plan = planIdx >= 0 ? (cols[planIdx] || "basic") : "basic";
						const status = statusIdx >= 0 ? (cols[statusIdx] || "active") : "active";

						const validStatuses = ["pending", "active", "revoked", "cancelled", "past_due"];
						const memberStatus = validStatuses.includes(status) ? status as MemberRecord["status"] : "active";

						const member: MemberRecord = {
							email,
							plan,
							status: memberStatus,
							createdAt: new Date().toISOString(),
							paymentMethod: "manual",
						};

						await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));
						memberEmails.push(encodedEmail);
						existingSet.add(encodedEmail);
						imported++;
					}

					await ctx.kv.set("members:list", JSON.stringify(memberEmails));
					ctx.log.info(`CSV import complete: ${imported} imported, ${errors.length} errors`);

					return { imported, errors, total: lines.length - 1 };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`CSV import error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 3: Task 12 - PayPal Checkout Integration */

		/**
		 * POST /membership/checkout/paypal/create
		 * Create a PayPal order (mock flow).
		 * Body: { planId, email }
		 * Returns: { orderId, approveUrl }
		 */
		paypalCreate: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const planId = String(input.planId ?? "").trim();
					const email = String(input.email ?? "").trim().toLowerCase();

					if (!planId || !email) {
						throw new Response(
							JSON.stringify({ error: "planId and email are required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}
					if (!isValidEmail(email)) {
						throw new Response(
							JSON.stringify({ error: "Invalid email" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}
					validateStringInput(email, 254, "email");

					// Check if PayPal is enabled
					const gatewayStatus = await ctx.kv.get<string>("gateway:paypal:enabled");
					if (gatewayStatus === "false") {
						throw new Response(
							JSON.stringify({ error: "PayPal checkout is currently disabled" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Generate mock PayPal order ID
					const orderId = `PAYPAL-${generateUUID()}`;

					// Store pending checkout
					const checkout = {
						orderId,
						planId,
						email,
						status: "pending",
						createdAt: new Date().toISOString(),
					};
					await ctx.kv.set(`paypal-checkout:${orderId}`, JSON.stringify(checkout));

					ctx.log.info(`PayPal checkout created: ${orderId} for ${email}`);

					return {
						orderId,
						approveUrl: `/membership/checkout/paypal/approve?orderId=${encodeURIComponent(orderId)}`,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`PayPal create error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/checkout/paypal/capture
		 * Capture PayPal payment after approval.
		 * Body: { orderId }
		 * Returns: { success: true, memberId }
		 */
		paypalCapture: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const orderId = String(input.orderId ?? "").trim();

					if (!orderId) {
						throw new Response(
							JSON.stringify({ error: "orderId is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const checkoutJson = await ctx.kv.get<string>(`paypal-checkout:${orderId}`);
					if (!checkoutJson) {
						throw new Response(
							JSON.stringify({ error: "PayPal checkout not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const checkout = parseJSON<{ orderId: string; planId: string; email: string; status: string }>(checkoutJson, null as any);
					if (!checkout) {
						throw new Response(
							JSON.stringify({ error: "Invalid checkout data" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}
					if (checkout.status !== "pending") {
						throw new Response(
							JSON.stringify({ error: "Checkout already captured or expired" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					// Mark checkout as captured
					checkout.status = "captured";
					await ctx.kv.set(`paypal-checkout:${orderId}`, JSON.stringify(checkout));

					// Create or update member record
					const encodedEmail = emailToKvKey(checkout.email);
					const existingJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
					let member: MemberRecord;

					if (existingJson) {
						member = parseJSON<MemberRecord>(existingJson, null as any);
						member.status = "active";
						member.paymentMethod = "paypal";
						member.plan = checkout.planId;
					} else {
						member = {
							email: checkout.email,
							plan: checkout.planId,
							status: "active",
							createdAt: new Date().toISOString(),
							joinDate: new Date().toISOString(),
							paymentMethod: "paypal",
						};

						// Add to members list
						const listJson = await ctx.kv.get<string>("members:list");
						const memberEmails = parseJSON<string[]>(listJson, []);
						if (!memberEmails.includes(encodedEmail)) {
							memberEmails.push(encodedEmail);
							await ctx.kv.set("members:list", JSON.stringify(memberEmails));
						}
					}

					await ctx.kv.set(`member:${encodedEmail}`, JSON.stringify(member));

					ctx.log.info(`PayPal payment captured: ${orderId} for ${checkout.email}`);

					return { success: true, memberId: encodedEmail, email: checkout.email };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`PayPal capture error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/webhooks/paypal
		 * PayPal IPN/webhook handler. Handles:
		 * - PAYMENT.CAPTURE.COMPLETED → activate subscription
		 * - BILLING.SUBSCRIPTION.CANCELLED → cancel member
		 */
		paypalWebhook: {
			public: true,
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const input = rc.input as Record<string, unknown>;
					const rawBody = rc.rawBody as string | undefined;
					const eventType = String(input.event_type ?? "").trim();
					const resource = (input.resource ?? {}) as Record<string, unknown>;

					// Log all events
					const logEntry = {
						id: generateUUID(),
						eventType: eventType || "unknown",
						payload: rawBody ? rawBody.substring(0, 2000) : JSON.stringify(input).substring(0, 2000),
						receivedAt: new Date().toISOString(),
					};
					await ctx.kv.set(`paypal-webhook-log:${logEntry.id}`, JSON.stringify(logEntry));

					// Add to log list
					const logListJson = await ctx.kv.get<string>("paypal-webhook-logs:list");
					const logList = parseJSON<string[]>(logListJson, []);
					logList.push(logEntry.id);
					if (logList.length > 200) logList.shift();
					await ctx.kv.set("paypal-webhook-logs:list", JSON.stringify(logList));

					if (!eventType) {
						ctx.log.warn("PayPal webhook received with no event_type");
						return { received: true, status: "no_event_type" };
					}

					ctx.log.info(`PayPal webhook: ${eventType}`);

					if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
						// Activate subscription from PayPal payment
						const customId = String(resource.custom_id ?? "");
						const payerEmail = String((resource.payer as Record<string, unknown>)?.email_address ?? customId ?? "").toLowerCase().trim();

						if (payerEmail && isValidEmail(payerEmail)) {
							const encodedEmail = emailToKvKey(payerEmail);
							const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null as any);
								if (member) {
									member.status = "active";
									member.paymentMethod = "paypal";
									member.lastSyncAt = new Date().toISOString();
									await updateMember(member, ctx);
									ctx.log.info(`PayPal payment activated member: ${payerEmail}`);
								}
							}
						}
						return { received: true, status: "processed", eventType };
					}

					if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
						const subscriberEmail = String((resource.subscriber as Record<string, unknown>)?.email_address ?? "").toLowerCase().trim();

						if (subscriberEmail && isValidEmail(subscriberEmail)) {
							const encodedEmail = emailToKvKey(subscriberEmail);
							const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
							if (memberJson) {
								const member = parseJSON<MemberRecord>(memberJson, null as any);
								if (member) {
									member.status = "cancelled";
									member.lastSyncAt = new Date().toISOString();
									await updateMember(member, ctx);
									ctx.log.info(`PayPal subscription cancelled for: ${subscriberEmail}`);
								}
							}
						}
						return { received: true, status: "processed", eventType };
					}

					return { received: true, status: "acknowledged", eventType };
				} catch (error) {
					ctx.log.error(`PayPal webhook error: ${String(error)}`);
					return { received: true, status: "error" };
				}
			},
		},

		/**
		 * POST /membership/admin/gateway-toggle
		 * Enable/disable PayPal as checkout option.
		 * Body: { gateway: "paypal", enabled: boolean }
		 */
		gatewayToggle: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const gateway = String(input.gateway ?? "").trim();
					const enabled = Boolean(input.enabled);

					if (!gateway || !["paypal", "stripe", "manual"].includes(gateway)) {
						throw new Response(
							JSON.stringify({ error: "Valid gateway required: paypal, stripe, or manual" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					await ctx.kv.set(`gateway:${gateway}:enabled`, String(enabled));
					ctx.log.info(`Gateway ${gateway} toggled: ${enabled}`);

					return { success: true, gateway, enabled };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Gateway toggle error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 3: Task 13 - Advanced Webhooks — Retry + Signing */

		/**
		 * GET /membership/webhooks/health
		 * Admin endpoint. Webhook health dashboard.
		 */
		webhookHealth: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("webhooks:list");
					const webhookIds = parseJSON<string[]>(listJson, []);

					let totalFires24h = 0;
					let successFires24h = 0;
					const failedWebhooks: Array<{ id: string; url: string; failedCount: number }> = [];
					const now = Date.now();
					const oneDayAgo = now - 24 * 60 * 60 * 1000;

					for (const id of webhookIds) {
						const webhookJson = await ctx.kv.get<string>(`webhook:${id}`);
						if (!webhookJson) continue;
						const webhook = parseJSON<WebhookEndpoint>(webhookJson, null as any);
						if (!webhook) continue;

						if (webhook.failedCount > 0) {
							failedWebhooks.push({ id: webhook.id, url: webhook.url, failedCount: webhook.failedCount });
						}

						// Count fires in last 24h
						const logIdsJson = await ctx.kv.get<string>(`webhook:${id}:logs`);
						const logIds = parseJSON<string[]>(logIdsJson, []);
						for (const logId of logIds) {
							const logJson = await ctx.kv.get<string>(`webhook:log:${logId}`);
							if (!logJson) continue;
							const log = parseJSON<WebhookLog>(logJson, null as any);
							if (!log) continue;
							const logTime = new Date(log.firedAt).getTime();
							if (logTime >= oneDayAgo) {
								totalFires24h++;
								if (log.success) successFires24h++;
							}
						}
					}

					const successRate = totalFires24h > 0 ? Math.round((successFires24h / totalFires24h) * 100) : 100;

					return {
						totalRegistered: webhookIds.length,
						last24hFires: totalFires24h,
						last24hSuccessRate: `${successRate}%`,
						failedWebhooks,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook health error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * POST /membership/webhooks/:id/secret
		 * Generate/rotate webhook secret for signing.
		 */
		webhookRotateSecret: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const webhookId = String(input.webhookId ?? "").trim();
					validateId(webhookId, "webhookId");

					const webhookJson = await ctx.kv.get<string>(`webhook:${webhookId}`);
					if (!webhookJson) {
						throw new Response(
							JSON.stringify({ error: "Webhook not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					const webhook = parseJSON<WebhookEndpoint>(webhookJson, null as any);
					if (!webhook) {
						throw new Response(
							JSON.stringify({ error: "Webhook not found" }),
							{ status: 404, headers: { "Content-Type": "application/json" } }
						);
					}

					// Generate new secret
					const newSecret = generateUUID();
					webhook.secret = newSecret;
					await ctx.kv.set(`webhook:${webhookId}`, JSON.stringify(webhook));

					ctx.log.info(`Webhook secret rotated: ${webhookId}`);

					return { success: true, webhookId, secret: newSecret };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook secret rotate error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/webhooks/logs
		 * Admin. Paginated webhook delivery logs.
		 * Query: { webhookId, limit?: number, offset?: number }
		 */
		webhookLogs: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const input = rc.input as Record<string, unknown>;
					const webhookId = String(input.webhookId ?? "").trim();
					const limit = Math.min(Math.max(Number(input.limit) || 50, 1), 100);
					const offset = Math.max(Number(input.offset) || 0, 0);

					if (!webhookId) {
						throw new Response(
							JSON.stringify({ error: "webhookId is required" }),
							{ status: 400, headers: { "Content-Type": "application/json" } }
						);
					}

					const logIdsJson = await ctx.kv.get<string>(`webhook:${webhookId}:logs`);
					const logIds = parseJSON<string[]>(logIdsJson, []);

					// Reverse for newest-first
					const reversed = [...logIds].reverse();
					const paged = reversed.slice(offset, offset + limit);

					const logs: WebhookLog[] = [];
					for (const logId of paged) {
						const logJson = await ctx.kv.get<string>(`webhook:log:${logId}`);
						if (logJson) {
							const log = parseJSON<WebhookLog>(logJson, null as any);
							if (log) logs.push(log);
						}
					}

					return {
						logs,
						total: logIds.length,
						limit,
						offset,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Webhook logs error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 3: Task 14 - Advanced Reporting — Cohort Analysis */

		/**
		 * GET /membership/reports/cohorts
		 * Admin. Group members by signup month with retention metrics.
		 */
		reportCohorts: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					const cohorts: Record<string, {
						month: string;
						joined: number;
						active: number;
						churned: number;
						retentionRate: string;
						totalPayments: number;
						avgLtv: string;
					}> = {};

					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null as any);
						if (!member) continue;

						const created = new Date(member.createdAt);
						const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;

						if (!cohorts[monthKey]) {
							cohorts[monthKey] = {
								month: monthKey,
								joined: 0,
								active: 0,
								churned: 0,
								retentionRate: "0%",
								totalPayments: 0,
								avgLtv: "$0",
							};
						}

						cohorts[monthKey].joined++;
						if (member.status === "active") {
							cohorts[monthKey].active++;
						} else if (member.status === "cancelled" || member.status === "revoked") {
							cohorts[monthKey].churned++;
						}

						// Estimate LTV: count months active * plan price
						// We fetch plan config for price estimation
						const planJson = await ctx.kv.get<string>(`plan:${member.plan}`);
						const planConfig = parseJSON<PlanConfig>(planJson, null as any);
						if (planConfig) {
							const monthsActive = Math.max(1, Math.ceil(
								(Date.now() - created.getTime()) / (30 * 24 * 60 * 60 * 1000)
							));
							const monthlyPrice = planConfig.interval === "year"
								? planConfig.price / 12
								: planConfig.interval === "once"
									? planConfig.price
									: planConfig.price;
							cohorts[monthKey].totalPayments += monthlyPrice * (member.status === "active" ? monthsActive : Math.max(1, monthsActive - 1));
						}
					}

					// Calculate rates
					const cohortList = Object.values(cohorts).map(c => {
						c.retentionRate = c.joined > 0 ? `${Math.round((c.active / c.joined) * 100)}%` : "0%";
						c.avgLtv = c.joined > 0 ? `$${(c.totalPayments / c.joined / 100).toFixed(2)}` : "$0";
						return c;
					});

					// Sort by month
					cohortList.sort((a, b) => a.month.localeCompare(b.month));

					return { cohorts: cohortList };
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Cohort report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/reports/ltv
		 * Admin. Lifetime value analysis.
		 */
		reportLtv: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					let totalLtv = 0;
					let memberCount = 0;
					const ltvByPlan: Record<string, { total: number; count: number }> = {};
					const ltvByCohort: Record<string, { total: number; count: number }> = {};
					let totalMonthlyPrice = 0;
					let avgSubscriptionMonths = 0;

					// Load all plans for price lookup
					const plansJson = await ctx.kv.get<string>("plans:list");
					const planIds = parseJSON<string[]>(plansJson, []);
					const planMap: Record<string, PlanConfig> = {};
					for (const pid of planIds) {
						const pJson = await ctx.kv.get<string>(`plan:${pid}`);
						const plan = parseJSON<PlanConfig>(pJson, null as any);
						if (plan) planMap[pid] = plan;
					}

					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null as any);
						if (!member) continue;

						memberCount++;
						const plan = planMap[member.plan];
						const monthlyPrice = plan
							? (plan.interval === "year" ? plan.price / 12 : plan.interval === "once" ? plan.price : plan.price)
							: 0;

						const created = new Date(member.createdAt);
						const monthsActive = Math.max(1, Math.ceil(
							(Date.now() - created.getTime()) / (30 * 24 * 60 * 60 * 1000)
						));

						const memberLtv = monthlyPrice * monthsActive;
						totalLtv += memberLtv;
						totalMonthlyPrice += monthlyPrice;
						avgSubscriptionMonths += monthsActive;

						// By plan
						if (!ltvByPlan[member.plan]) ltvByPlan[member.plan] = { total: 0, count: 0 };
						const planEntry = ltvByPlan[member.plan];
						if (planEntry) {
							planEntry.total += memberLtv;
							planEntry.count++;
						}

						// By cohort
						const cohortKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
						if (!ltvByCohort[cohortKey]) ltvByCohort[cohortKey] = { total: 0, count: 0 };
						const cohortEntry = ltvByCohort[cohortKey];
						if (cohortEntry) {
							cohortEntry.total += memberLtv;
							cohortEntry.count++;
						}
					}

					const avgMonths = memberCount > 0 ? avgSubscriptionMonths / memberCount : 0;
					const avgMonthlyPricePerMember = memberCount > 0 ? totalMonthlyPrice / memberCount : 0;

					return {
						overallAverageLtv: memberCount > 0 ? `$${(totalLtv / memberCount / 100).toFixed(2)}` : "$0",
						ltvByPlan: Object.entries(ltvByPlan).map(([plan, data]) => ({
							plan,
							averageLtv: `$${(data.total / data.count / 100).toFixed(2)}`,
							memberCount: data.count,
						})),
						ltvByCohort: Object.entries(ltvByCohort).map(([cohort, data]) => ({
							cohort,
							averageLtv: `$${(data.total / data.count / 100).toFixed(2)}`,
							memberCount: data.count,
						})).sort((a, b) => a.cohort.localeCompare(b.cohort)),
						projectedLtv: `$${((avgMonths * avgMonthlyPricePerMember) / 100).toFixed(2)}`,
						avgSubscriptionMonths: Math.round(avgMonths * 10) / 10,
						totalMembers: memberCount,
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`LTV report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/**
		 * GET /membership/reports/funnel
		 * Admin. Conversion funnel: signups → active → renewals.
		 */
		reportFunnel: {
			handler: async (routeCtx: unknown, ctx: PluginContext) => {
				try {
					const rc = routeCtx as Record<string, unknown>;
					const adminUser = rc.user as Record<string, unknown> | undefined;
					if (!adminUser || !adminUser.isAdmin) {
						throw new Response(
							JSON.stringify({ error: "Admin access required" }),
							{ status: 403, headers: { "Content-Type": "application/json" } }
						);
					}

					const listJson = await ctx.kv.get<string>("members:list");
					const memberEmails = parseJSON<string[]>(listJson, []);

					let totalSignups = 0;
					let activeSubscribers = 0;
					let paidMembers = 0;
					let renewedMembers = 0;

					for (const encodedEmail of memberEmails) {
						const memberJson = await ctx.kv.get<string>(`member:${encodedEmail}`);
						if (!memberJson) continue;
						const member = parseJSON<MemberRecord>(memberJson, null as any);
						if (!member) continue;

						totalSignups++;

						if (member.status === "active") {
							activeSubscribers++;
							paidMembers++;

							// Consider "renewed" if subscription is older than 30 days
							const created = new Date(member.createdAt);
							const ageMs = Date.now() - created.getTime();
							if (ageMs > 30 * 24 * 60 * 60 * 1000) {
								renewedMembers++;
							}
						} else if (member.status === "past_due") {
							paidMembers++; // They paid at some point
						}
					}

					// Estimate visitors from form submissions
					const formListJson = await ctx.kv.get<string>("forms:list");
					const formIds = parseJSON<string[]>(formListJson, []);
					let totalSubmissions = 0;
					for (const fid of formIds) {
						const subListJson = await ctx.kv.get<string>(`form:${fid}:submissions`);
						const subIds = parseJSON<string[]>(subListJson, []);
						totalSubmissions += subIds.length;
					}
					const estimatedVisitors = Math.max(totalSignups * 3, totalSubmissions + totalSignups);

					const funnel = [
						{
							stage: "Visitors (estimated)",
							count: estimatedVisitors,
							percentage: "100%",
						},
						{
							stage: "Signups",
							count: totalSignups,
							percentage: estimatedVisitors > 0 ? `${Math.round((totalSignups / estimatedVisitors) * 100)}%` : "0%",
						},
						{
							stage: "Active Subscribers",
							count: activeSubscribers,
							percentage: totalSignups > 0 ? `${Math.round((activeSubscribers / totalSignups) * 100)}%` : "0%",
						},
						{
							stage: "Renewals (30+ days)",
							count: renewedMembers,
							percentage: activeSubscribers > 0 ? `${Math.round((renewedMembers / activeSubscribers) * 100)}%` : "0%",
						},
					];

					return {
						funnel,
						summary: {
							totalSignups,
							paidConversionRate: totalSignups > 0 ? `${Math.round((paidMembers / totalSignups) * 100)}%` : "0%",
							renewalRate: activeSubscribers > 0 ? `${Math.round((renewedMembers / activeSubscribers) * 100)}%` : "0%",
						},
					};
				} catch (error) {
					if (error instanceof Response) throw error;
					ctx.log.error(`Funnel report error: ${String(error)}`);
					throw new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500, headers: { "Content-Type": "application/json" } }
					);
				}
			},
		},

		/** PHASE 4 WAVE 3: Task 15 - Health Endpoint + Polish */

		/**
		 * GET /membership/health
		 * Public health check endpoint.
		 */
		health: {
			public: true,
			handler: async (_routeCtx: unknown, _ctx: PluginContext) => {
				return {
					status: "ok",
					version: "1.5.0",
					features: [
						"reporting",
						"groups",
						"group-portal",
						"webhooks",
						"forms",
						"categories",
						"venues",
						"series",
						"widgets",
						"csv",
						"paypal",
						"cohorts",
					],
				};
			},
		},
	},

	/**
	 * Portable Text block types
	 */
	admin: {
		portableTextBlocks: [
			{
				type: "gated-content",
				label: "Gated Content",
				description: "Content visible only to active members",
				icon: "link",
				fields: [
					{
						type: "text_input",
						action_id: "requiredPlan",
						label: "Required Plan ID (optional)",
						placeholder: "Leave empty for any member",
					},
					{
						type: "text_input",
						action_id: "fallbackMessage",
						label: "Message for Non-Members",
						placeholder: "Please subscribe to view this content",
					},
				],
			},
		],
	},
} as any);
