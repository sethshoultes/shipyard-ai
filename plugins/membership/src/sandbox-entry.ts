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
 * Utility: Fire webhook to registered endpoint
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

	try {
		const response = await fetch(endpoint.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shipyard-Signature": `sha256=${signature}`,
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
	} catch (error) {
		responseCode = 0;
		responseBody = String(error);
		success = false;
	}

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
