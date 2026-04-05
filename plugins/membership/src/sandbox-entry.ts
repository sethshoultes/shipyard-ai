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
}

interface PlanConfig {
	id: string;
	name: string;
	price: number;
	interval: "once" | "month" | "year";
	description: string;
	paymentLink?: string;
	features: string[];
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
