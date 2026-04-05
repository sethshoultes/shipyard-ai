import type { PluginContext } from "emdash";

/**
 * Email module for ReviewPulse
 * Sends notification emails for new and negative reviews via Resend API
 */

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

/**
 * Send email using Resend API.
 * Graceful failure — returns false if Resend not configured or call fails.
 */
export async function sendEmail(
	ctx: PluginContext,
	options: EmailOptions
): Promise<boolean> {
	try {
		// @ts-ignore - ctx.env is available at runtime
		const resendKey = ctx.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
		// @ts-ignore - ctx.env is available at runtime
		const fromEmail = ctx.env?.REVIEW_FROM_EMAIL || process.env.REVIEW_FROM_EMAIL;

		if (!resendKey || !fromEmail) {
			ctx.log.warn("Resend API key or from email not configured — skipping email");
			return false;
		}

		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${resendKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: fromEmail,
				to: options.to,
				subject: options.subject,
				html: options.html,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			ctx.log.error(`Resend API error: ${response.status} ${error}`);
			return false;
		}

		ctx.log.info(`Email sent to ${options.to}: ${options.subject}`);
		return true;
	} catch (error) {
		ctx.log.error(`Failed to send email: ${String(error)}`);
		return false;
	}
}

/**
 * Escape HTML entities to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Render a star rating as HTML for email (inline SVG not reliable, use text).
 */
function renderStarsHTML(rating: number): string {
	const filled = "&#9733;"; // ★
	const empty = "&#9734;";  // ☆
	let stars = "";
	for (let i = 1; i <= 5; i++) {
		stars += i <= rating ? filled : empty;
	}
	return `<span style="color: #D4A853; font-size: 20px; letter-spacing: 2px;">${stars}</span>`;
}

export interface ReviewForEmail {
	author: string;
	rating: number;
	text: string;
	date: string;
	source: string;
}

/**
 * Generate HTML email template for a new review notification.
 */
export function generateNewReviewNotificationHTML(review: ReviewForEmail): string {
	const dateStr = new Date(review.date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: #C4704B; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
		<h2 style="margin: 0; font-size: 18px;">New Review Received</h2>
		<p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">ReviewPulse Notification</p>
	</div>

	<div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
		<div style="margin-bottom: 16px;">
			${renderStarsHTML(review.rating)}
			<span style="color: #7A8B6F; font-size: 14px; margin-left: 8px;">${review.rating}/5</span>
		</div>

		<p style="margin: 0 0 12px; font-size: 15px; color: #334155;">
			${review.text ? escapeHtml(review.text) : "<em>No review text</em>"}
		</p>

		<table style="width: 100%; font-size: 13px; color: #7A8B6F;">
			<tr>
				<td style="padding: 4px 0;"><strong>Author:</strong> ${escapeHtml(review.author)}</td>
			</tr>
			<tr>
				<td style="padding: 4px 0;"><strong>Source:</strong> ${escapeHtml(review.source)}</td>
			</tr>
			<tr>
				<td style="padding: 4px 0;"><strong>Date:</strong> ${dateStr}</td>
			</tr>
		</table>
	</div>
</body>
</html>`;
}

/**
 * Generate HTML email template for a negative review alert (rating <= threshold).
 * Includes one-click admin link and review text.
 */
export function generateNegativeReviewAlertHTML(
	review: ReviewForEmail,
	adminUrl?: string
): string {
	const dateStr = new Date(review.date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	const adminLink = adminUrl
		? `<a href="${escapeHtml(adminUrl)}" style="display: inline-block; background: #C4704B; color: white; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 16px;">View in Admin Dashboard</a>`
		: "";

	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: #b91c1c; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
		<h2 style="margin: 0; font-size: 18px;">&#9888; Negative Review Alert</h2>
		<p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">${review.rating}-star review requires attention</p>
	</div>

	<div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
		<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
			<div style="margin-bottom: 8px;">
				${renderStarsHTML(review.rating)}
				<span style="color: #b91c1c; font-size: 14px; font-weight: 600; margin-left: 8px;">${review.rating}/5</span>
			</div>

			<p style="margin: 0; font-size: 15px; color: #334155;">
				${review.text ? escapeHtml(review.text) : "<em>No review text</em>"}
			</p>
		</div>

		<table style="width: 100%; font-size: 13px; color: #7A8B6F;">
			<tr>
				<td style="padding: 4px 0;"><strong>Author:</strong> ${escapeHtml(review.author)}</td>
			</tr>
			<tr>
				<td style="padding: 4px 0;"><strong>Source:</strong> ${escapeHtml(review.source)}</td>
			</tr>
			<tr>
				<td style="padding: 4px 0;"><strong>Date:</strong> ${dateStr}</td>
			</tr>
		</table>

		${adminLink}

		<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0 12px;" />
		<p style="color: #94a3b8; font-size: 12px; margin: 0;">
			This alert was triggered because the review rating is at or below your configured threshold.
			Respond promptly to negative reviews to protect your reputation.
		</p>
	</div>
</body>
</html>`;
}

/**
 * Generate HTML email for a review request campaign.
 * Includes links to Google and/or Yelp review pages.
 */
export function generateReviewRequestHTML(
	businessName: string,
	message: string,
	googleUrl?: string,
	yelpUrl?: string,
): string {
	const safeBusinessName = escapeHtml(businessName);
	const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

	const links: string[] = [];
	if (googleUrl) {
		links.push(
			`<a href="${escapeHtml(googleUrl)}" style="display:inline-block;padding:12px 24px;background-color:#4285F4;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;margin:0 8px 8px 0;">Review on Google</a>`,
		);
	}
	if (yelpUrl) {
		links.push(
			`<a href="${escapeHtml(yelpUrl)}" style="display:inline-block;padding:12px 24px;background-color:#D32323;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;margin:0 8px 8px 0;">Review on Yelp</a>`,
		);
	}

	return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
	<tr><td style="background-color:#C4704B;padding:24px 32px;text-align:center;">
		<h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;">${safeBusinessName}</h1>
	</td></tr>
	<tr><td style="padding:32px;">
		<p style="font-size:16px;line-height:1.6;color:#333;margin:0 0 24px 0;">${safeMessage}</p>
		<div style="text-align:center;margin:24px 0;">
			${links.join("\n\t\t\t")}
		</div>
		<p style="font-size:14px;color:#999;margin:24px 0 0 0;text-align:center;">Thank you for your feedback!</p>
	</td></tr>
	<tr><td style="background-color:#faf8f5;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
		Sent by ${safeBusinessName} via ReviewPulse
	</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
