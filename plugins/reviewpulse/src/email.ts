/**
 * Email module for ReviewPulse
 *
 * Basic email template utilities. Email sending is a v2 feature,
 * but templates are defined here for future use.
 */

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
	const empty = "&#9734;"; // ☆
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
 * This is available for future v2 notification features.
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
 * Available for future v2 notification features.
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
