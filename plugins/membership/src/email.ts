import type { PluginContext } from "emdash";

/**
 * Email Template Builder
 * Creates warm, personalized email templates in Maya Angelou's voice
 */

export interface EmailTemplate {
	subject: string;
	text: string;
	html?: string;
}

export interface EmailVariables {
	memberName?: string;
	memberEmail: string;
	planName: string;
	siteName?: string;
	price?: number;
	amount?: number;
	renewalDate?: string;
	expiryDate?: string;
	portalLink?: string;
	features?: string[];
	paymentError?: string;
	nextRetryDate?: string;
	contentName?: string; // For drip content unlock emails
}

/**
 * Format currency as readable string
 */
function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount / 100);
}

/**
 * Format date in human-readable format
 */
function formatDate(isoDate: string): string {
	try {
		const date = new Date(isoDate);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return isoDate;
	}
}

/**
 * Template: Welcome Email (sent on subscription.created)
 * Warm greeting, sets expectations, introduces the community
 */
export function createWelcomeTemplate(vars: EmailVariables): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const renewalDate = vars.renewalDate ? formatDate(vars.renewalDate) : "next month";
	const price = vars.price ? formatCurrency(vars.price) : "pending";

	return {
		subject: `Welcome to ${siteName}! Your ${vars.planName} membership is active.`,
		text: `Hi ${memberName},

Welcome! You're now a ${vars.planName} member of ${siteName}.

Your membership is active right now. You have full access to all the benefits and content reserved for members like you.

${
	vars.features && vars.features.length > 0
		? `What you get:\n${vars.features.map((f) => `• ${f}`).join("\n")}\n\n`
		: ""
}Your next charge: ${price} on ${renewalDate}

Manage your subscription anytime at: ${vars.portalLink || "your account dashboard"}

If you have questions or need help getting started, just reply to this email. We read every message.

Looking forward to this journey together!

With gratitude,
The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Welcome! You're now a <strong>${vars.planName}</strong> member of ${siteName}.</p>

<p>Your membership is active right now. You have full access to all the benefits and content reserved for members like you.</p>

${
	vars.features && vars.features.length > 0
		? `<p><strong>What you get:</strong></p>
<ul>
${vars.features.map((f) => `<li>${f}</li>`).join("\n")}
</ul>`
		: ""
}

<p>Your next charge: <strong>${price}</strong> on <strong>${renewalDate}</strong></p>

<p><a href="${vars.portalLink || "#"}" style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Manage your subscription</a></p>

<p>If you have questions or need help getting started, just reply to this email. We read every message.</p>

<p>With gratitude,<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Payment Receipt Email (sent on invoice.payment_succeeded)
 * Clear financial record, next steps, reassurance
 */
export function createPaymentReceiptTemplate(
	vars: EmailVariables
): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const amount = vars.amount ? formatCurrency(vars.amount) : "pending";
	const renewalDate = vars.renewalDate ? formatDate(vars.renewalDate) : "pending";

	return {
		subject: `Your ${siteName} invoice — ${vars.planName} subscription`,
		text: `Hi ${memberName},

Your payment has been received and processed.

Amount charged: ${amount}
Plan: ${vars.planName}
Next charge: ${renewalDate}

You can view or download your full invoice in your account dashboard: ${vars.portalLink || "your account"}

Your access remains active and uninterrupted. Thank you for being part of our community.

Need anything? Reply to this email.

Best regards,
The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Your payment has been received and processed.</p>

<p><strong>Amount charged:</strong> ${amount}<br/>
<strong>Plan:</strong> ${vars.planName}<br/>
<strong>Next charge:</strong> ${renewalDate}</p>

<p><a href="${vars.portalLink || "#"}" style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View your invoice</a></p>

<p>Your access remains active and uninterrupted. Thank you for being part of our community.</p>

<p>Need anything? Reply to this email.</p>

<p>Best regards,<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Renewal Reminder Email (sent 7 days before renewal)
 * Gentle reminder, easy update path, reassurance
 */
export function createRenewalReminderTemplate(
	vars: EmailVariables
): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const renewalDate = vars.renewalDate ? formatDate(vars.renewalDate) : "soon";
	const price = vars.price ? formatCurrency(vars.price) : "pending";

	return {
		subject: `Quick reminder: Your ${vars.planName} renews in 7 days`,
		text: `Hi ${memberName},

Your ${vars.planName} membership renews on ${renewalDate}. Just a friendly heads-up.

Next charge: ${price}

If you need to update your payment method or have any questions, visit your account: ${vars.portalLink || "your account dashboard"}

No action needed if your payment method is current. We'll charge automatically on ${renewalDate}.

Questions? Reply to this email anytime.

Best,
The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Your ${vars.planName} membership renews on <strong>${renewalDate}</strong>. Just a friendly heads-up.</p>

<p><strong>Next charge:</strong> ${price}</p>

<p><a href="${vars.portalLink || "#"}" style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Update payment method</a></p>

<p>No action needed if your payment method is current. We'll charge automatically on ${renewalDate}.</p>

<p>Questions? Reply to this email anytime.</p>

<p>Best,<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Payment Failed Email (sent on invoice.payment_failed)
 * Empathetic, clear action path, urgency without guilt
 */
export function createPaymentFailedTemplate(
	vars: EmailVariables
): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const nextRetryDate = vars.nextRetryDate ? formatDate(vars.nextRetryDate) : "soon";
	const planName = vars.planName;

	return {
		subject: `We couldn't process your payment for ${planName}`,
		text: `Hi ${memberName},

We tried to charge your card for your ${planName} membership, but the payment was declined.

This might be because:
• Your card expired
• Insufficient funds
• Card issuer declined the charge

Update your payment method: ${vars.portalLink || "your account dashboard"}

We'll try again automatically on ${nextRetryDate}. If you update your payment method before then, it goes through immediately.

You'll keep your access while we work this out. No rush — just let us know if you need help.

Reply to this email anytime.

Best,
The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>We tried to charge your card for your <strong>${planName}</strong> membership, but the payment was declined.</p>

<p>This might be because:</p>
<ul>
<li>Your card expired</li>
<li>Insufficient funds</li>
<li>Card issuer declined the charge</li>
</ul>

<p><a href="${vars.portalLink || "#"}" style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Update your payment method</a></p>

<p>We'll try again automatically on <strong>${nextRetryDate}</strong>. If you update your payment method before then, it goes through immediately.</p>

<p>You'll keep your access while we work this out. No rush — just let us know if you need help.</p>

<p>Reply to this email anytime.</p>

<p>Best,<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Expiring Soon Email (sent 3 days before expiry)
 * Soft touch, reactivation easy, gratitude for membership
 */
export function createExpiringTemplate(vars: EmailVariables): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const expiryDate = vars.expiryDate ? formatDate(vars.expiryDate) : "in 3 days";
	const planName = vars.planName;

	return {
		subject: `Your ${planName} access expires in 3 days`,
		text: `Hi ${memberName},

Your ${planName} membership expires on ${expiryDate}.

You won't lose access to content you've already enjoyed. But new content and member benefits will no longer be available.

If you'd like to continue, renew anytime: ${vars.portalLink || "your account dashboard"}

No pressure — we're here whenever you're ready to rejoin.

Thank you for being part of ${siteName}.

Best,
The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Your <strong>${planName}</strong> membership expires on <strong>${expiryDate}</strong>.</p>

<p>You won't lose access to content you've already enjoyed. But new content and member benefits will no longer be available.</p>

<p><a href="${vars.portalLink || "#"}" style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Renew your membership</a></p>

<p>No pressure — we're here whenever you're ready to rejoin.</p>

<p>Thank you for being part of ${siteName}.</p>

<p>Best,<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Cancellation Email (sent on subscription.deleted)
 * Warm farewell, door left open, gratitude
 */
export function createCancellationTemplate(vars: EmailVariables): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const expiryDate = vars.expiryDate ? formatDate(vars.expiryDate) : "immediately";
	const planName = vars.planName;

	return {
		subject: `Your ${planName} membership has been cancelled`,
		text: `Hi ${memberName},

Your ${planName} membership has been cancelled, effective ${expiryDate}.

We've loved having you as part of ${siteName}. Thank you for the time and trust you've given us.

If circumstances change and you'd like to rejoin, we'd welcome you back with open arms: ${vars.portalLink || "your account dashboard"}

Take care of yourself.

The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Your <strong>${planName}</strong> membership has been cancelled, effective <strong>${expiryDate}</strong>.</p>

<p>We've loved having you as part of ${siteName}. Thank you for the time and trust you've given us.</p>

<p>If circumstances change and you'd like to rejoin, we'd welcome you back with open arms:</p>

<p><a href="${vars.portalLink || "#"}" style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Rejoin ${siteName}</a></p>

<p>Take care of yourself.</p>

<p>The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Plan Upgrade Confirmation (sent on subscription.updated for plan upgrade)
 * Celebrate the upgrade, explain new benefits, set expectations
 */
export function createUpgradeTemplate(vars: EmailVariables): EmailTemplate {
	const siteName = vars.siteName || "our community";
	const memberName = vars.memberName || "friend";
	const planName = vars.planName;
	const renewalDate = vars.renewalDate ? formatDate(vars.renewalDate) : "next month";

	return {
		subject: `Your upgrade to ${planName} is complete!`,
		text: `Hi ${memberName},

Congratulations! You've successfully upgraded to our ${planName} plan.

Your new membership is active immediately. You now have access to all the premium features and content reserved for ${planName} members.

${
	vars.features && vars.features.length > 0
		? `Your new benefits include:\n${vars.features.map((f) => `• ${f}`).join("\n")}\n\n`
		: ""
}Your next charge: ${vars.price ? formatCurrency(vars.price) : "pending"} on ${renewalDate}

Thank you for investing in your growth. We're excited to support your journey.

Questions? Reply to this email anytime.

Best,
The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Congratulations! You've successfully upgraded to our <strong>${planName}</strong> plan.</p>

<p>Your new membership is active immediately. You now have access to all the premium features and content reserved for ${planName} members.</p>

${
	vars.features && vars.features.length > 0
		? `<p><strong>Your new benefits include:</strong></p>
<ul>
${vars.features.map((f) => `<li>${f}</li>`).join("\n")}
</ul>`
		: ""
}

<p>Your next charge: <strong>${vars.price ? formatCurrency(vars.price) : "pending"}</strong> on <strong>${renewalDate}</strong></p>

<p>Thank you for investing in your growth. We're excited to support your journey.</p>

<p>Questions? Reply to this email anytime.</p>

<p>Best,<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Template: Drip Content Unlock (sent when drip-gated content becomes available)
 * Celebrates the milestone, invites member to access new content
 */
export function createDripUnlockTemplate(vars: EmailVariables): EmailTemplate {
	const memberName = vars.memberName || "friend";
	const siteName = vars.siteName || "our community";
	const contentName = vars.contentName || "new content";
	const portalLink = vars.portalLink || "your member dashboard";

	return {
		subject: `New content unlocked! Check out "${contentName}"`,
		text: `Hi ${memberName},

Great news! As a ${vars.planName} member, you've unlocked access to new content today.

${contentName} is now available in your library.

Head to your member dashboard to start exploring: ${portalLink}

This is part of your membership journey with us. We believe in revealing content progressively, so you can absorb and enjoy each piece fully.

If you have questions or want to share feedback, just reply to this email.

Happy learning!

The ${siteName} Team`,
		html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Great news! As a <strong>${vars.planName}</strong> member, you've unlocked access to new content today.</p>

<p><strong>${contentName}</strong> is now available in your library.</p>

<p><a href="${portalLink}" style="display: inline-block; padding: 12px 24px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 4px;">View New Content</a></p>

<p>This is part of your membership journey with us. We believe in revealing content progressively, so you can absorb and enjoy each piece fully.</p>

<p>If you have questions or want to share feedback, just reply to this email.</p>

<p>Happy learning!<br/>
The ${siteName} Team</p>
</body>
</html>`,
	};
}

/**
 * Send email via Resend or built-in ctx.email
 * Gracefully handles missing configuration
 */
export async function sendMembershipEmail(
	template: EmailTemplate,
	to: string,
	ctx: PluginContext
): Promise<boolean> {
	try {
		// Try built-in ctx.email first (higher priority)
		if (ctx.email) {
			await ctx.email.send({
				to,
				subject: template.subject,
				text: template.text,
				html: template.html,
			});
			ctx.log.info(`Email sent to ${to}: ${template.subject}`);
			return true;
		}

		// Fallback: Try Resend API if configured
		const resendApiKey = (ctx as any).env?.RESEND_API_KEY as
			| string
			| undefined;
		const fromEmail = (ctx as any).env?.EMAIL_FROM as string | undefined;

		if (!resendApiKey || !fromEmail) {
			ctx.log.warn(
				"Email sending disabled: RESEND_API_KEY or EMAIL_FROM not configured"
			);
			return false;
		}

		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${resendApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: fromEmail,
				to,
				subject: template.subject,
				html: template.html || `<pre>${template.text}</pre>`,
				text: template.text,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			ctx.log.warn(`Resend API error: ${error}`);
			return false;
		}

		ctx.log.info(`Email sent via Resend to ${to}: ${template.subject}`);
		return true;
	} catch (error) {
		ctx.log.error(`Failed to send email: ${String(error)}`);
		return false;
	}
}

/**
 * Rate limit check: prevent duplicate emails within 24 hours
 * Returns true if email can be sent, false if rate-limited
 */
export async function checkEmailRateLimit(
	email: string,
	eventType: string,
	ctx: PluginContext
): Promise<boolean> {
	try {
		const key = `email:sent:${encodeURIComponent(email)}:${eventType}:last_sent_at`;
		const lastSentJson = await ctx.kv.get<string>(key);

		if (!lastSentJson) {
			// Record this send for next time
			await ctx.kv.set(key, JSON.stringify({ timestamp: new Date().toISOString() }));
			return true;
		}

		const lastSent = new Date(lastSentJson);
		const now = new Date();
		const hoursSinceLastEmail = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

		if (hoursSinceLastEmail < 24) {
			ctx.log.warn(
				`Email rate limit exceeded for ${email}:${eventType} (last sent ${hoursSinceLastEmail.toFixed(1)}h ago)`
			);
			return false;
		}

		// Update the last sent time
		await ctx.kv.set(key, JSON.stringify({ timestamp: now.toISOString() }));
		return true;
	} catch (error) {
		ctx.log.error(`Rate limit check failed: ${String(error)}`);
		return true; // Allow send if check fails
	}
}
