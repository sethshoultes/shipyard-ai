import type { PluginContext } from "emdash";

/**
 * Email utility module for EventDash
 * Sends emails via Resend API
 */

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

/**
 * Send email using Resend API
 * Uses fetch() to call Resend API with Bearer token
 * Graceful failure — returns false if Resend not configured or call fails
 */
export async function sendEmail(
	ctx: PluginContext,
	options: EmailOptions
): Promise<boolean> {
	try {
		// @ts-ignore - ctx.env is available at runtime
		const resendKey = ctx.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
		// @ts-ignore - ctx.env is available at runtime
		const fromEmail = ctx.env?.EVENT_FROM_EMAIL || process.env.EVENT_FROM_EMAIL;

		if (!resendKey || !fromEmail) {
			ctx.log.warn("Resend API key or from email not configured");
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
 * Format an ISO datetime for display
 */
export function formatDateTime(date: string, time: string): string {
	try {
		const [hours, minutes] = time.split(":").map(Number);
		const dt = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`);

		const formatter = new Intl.DateTimeFormat("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});

		return formatter.format(dt);
	} catch {
		return `${date} at ${time}`;
	}
}

/**
 * Generate Google Calendar link for iCal
 * Format: https://calendar.google.com/calendar/u/0/r/eventedit?text=Event&dates=...&location=...
 */
export function generateCalendarLink(
	eventTitle: string,
	date: string,
	time: string,
	endTime?: string,
	location?: string
): string {
	try {
		const [startHours, startMinutes] = time.split(":").map(Number);
		const startDateTime = `${date.replace(/-/g, "")}T${String(startHours).padStart(2, "0")}${String(startMinutes).padStart(2, "0")}00`;

		// Calculate end time (default 1 hour after start if not specified)
		let endDateTime = startDateTime;
		if (endTime) {
			const [endHours, endMinutes] = endTime.split(":").map(Number);
			endDateTime = `${date.replace(/-/g, "")}T${String(endHours).padStart(2, "0")}${String(endMinutes).padStart(2, "0")}00`;
		} else {
			// Add 1 hour to start time
			const endHour = (startHours + 1) % 24;
			endDateTime = `${date.replace(/-/g, "")}T${String(endHour).padStart(2, "0")}${String(startMinutes).padStart(2, "0")}00`;
		}

		const params = new URLSearchParams();
		params.append("text", eventTitle);
		params.append("dates", `${startDateTime}/${endDateTime}`);
		if (location) {
			params.append("location", location);
		}

		return `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`;
	} catch {
		return "";
	}
}

/**
 * Generate HTML for free event registration confirmation email
 */
export function generateFreeEventEmailHTML(
	attendeeName: string,
	eventTitle: string,
	date: string,
	time: string,
	location: string,
	calendarLink: string,
	endTime?: string
): string {
	const formattedDateTime = formatDateTime(date, time);

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #C4704B, #D4A853); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
		.content { background: #FAF8F5; padding: 30px; border-radius: 0 0 8px 8px; }
		.event-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #C4704B; border-radius: 4px; }
		.detail-row { margin: 12px 0; }
		.detail-label { color: #7A8B6F; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
		.detail-value { color: #2C2C2C; font-size: 16px; margin-top: 4px; }
		.button-group { margin: 30px 0; text-align: center; }
		.button { display: inline-block; background: #C4704B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; }
		.footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
		h1 { margin: 0; font-size: 28px; }
		.greeting { margin-bottom: 24px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>You're registered!</h1>
		</div>
		<div class="content">
			<div class="greeting">
				<p>Hi ${attendeeName},</p>
				<p>You're all set for <strong>${eventTitle}</strong>. See you soon!</p>
			</div>

			<div class="event-details">
				<div class="detail-row">
					<div class="detail-label">📅 Date & Time</div>
					<div class="detail-value">${formattedDateTime}</div>
				</div>
				<div class="detail-row">
					<div class="detail-label">📍 Location</div>
					<div class="detail-value">${location}</div>
				</div>
			</div>

			<div class="button-group">
				<a href="${calendarLink}" class="button">Add to calendar</a>
			</div>

			<p>Questions? Reply to this email anytime.</p>
			<p>Looking forward to seeing you!</p>
		</div>
		<div class="footer">
			<p>This is an automated confirmation email. Please do not reply with sensitive information.</p>
		</div>
	</div>
</body>
</html>
`;
}

/**
 * Generate HTML for paid event registration confirmation email
 */
export function generatePaidEventEmailHTML(
	attendeeName: string,
	eventTitle: string,
	ticketType: string,
	price: number,
	date: string,
	time: string,
	location: string,
	calendarLink: string,
	endTime?: string
): string {
	const formattedDateTime = formatDateTime(date, time);
	const priceDisplay = (price / 100).toFixed(2);

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #C4704B, #D4A853); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
		.content { background: #FAF8F5; padding: 30px; border-radius: 0 0 8px 8px; }
		.event-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #C4704B; border-radius: 4px; }
		.ticket-info { background: #FFF9F5; padding: 16px; border-radius: 4px; margin: 20px 0; }
		.detail-row { margin: 12px 0; }
		.detail-label { color: #7A8B6F; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
		.detail-value { color: #2C2C2C; font-size: 16px; margin-top: 4px; }
		.button-group { margin: 30px 0; text-align: center; }
		.button { display: inline-block; background: #C4704B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; }
		.footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
		h1 { margin: 0; font-size: 28px; }
		.greeting { margin-bottom: 24px; }
		.price { font-size: 20px; font-weight: bold; color: #C4704B; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Payment confirmed!</h1>
		</div>
		<div class="content">
			<div class="greeting">
				<p>Hi ${attendeeName},</p>
				<p>Your payment has been received and your spot is secured for <strong>${eventTitle}</strong>.</p>
			</div>

			<div class="event-details">
				<div class="detail-row">
					<div class="detail-label">🎟️ Ticket Type</div>
					<div class="detail-value">${ticketType}</div>
				</div>
				<div class="detail-row">
					<div class="detail-label">💰 Amount Paid</div>
					<div class="detail-value"><span class="price">$${priceDisplay}</span></div>
				</div>
			</div>

			<div class="event-details">
				<div class="detail-row">
					<div class="detail-label">📅 Date & Time</div>
					<div class="detail-value">${formattedDateTime}</div>
				</div>
				<div class="detail-row">
					<div class="detail-label">📍 Location</div>
					<div class="detail-value">${location}</div>
				</div>
			</div>

			<div class="button-group">
				<a href="${calendarLink}" class="button">Add to calendar</a>
			</div>

			<p>Questions? Reply to this email anytime.</p>
			<p>See you there!</p>
		</div>
		<div class="footer">
			<p>This is an automated confirmation email. Please do not reply with sensitive information.</p>
		</div>
	</div>
</body>
</html>
`;
}

/**
 * Generate HTML for cancellation confirmation email
 */
export function generateCancellationEmailHTML(
	attendeeName: string,
	eventTitle: string
): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #7A8B6F; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
		.content { background: #FAF8F5; padding: 30px; border-radius: 0 0 8px 8px; }
		.footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
		h1 { margin: 0; font-size: 28px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Registration cancelled</h1>
		</div>
		<div class="content">
			<p>Hi ${attendeeName},</p>
			<p>Your registration for <strong>${eventTitle}</strong> has been cancelled.</p>
			<p>If you change your mind, you can register again at any time.</p>
			<p>Thanks for letting us know.</p>
		</div>
		<div class="footer">
			<p>This is an automated confirmation email. Please do not reply with sensitive information.</p>
		</div>
	</div>
</body>
</html>
`;
}

/**
 * Generate HTML for waitlist promotion email
 */
export function generateWaitlistPromotionEmailHTML(
	attendeeName: string,
	eventTitle: string,
	registerLink: string
): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #D4A853, #C4704B); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
		.content { background: #FAF8F5; padding: 30px; border-radius: 0 0 8px 8px; }
		.button-group { margin: 30px 0; text-align: center; }
		.button { display: inline-block; background: #C4704B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; }
		.footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
		h1 { margin: 0; font-size: 28px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>A spot just opened up!</h1>
		</div>
		<div class="content">
			<p>Hi ${attendeeName},</p>
			<p>Great news! A spot has opened up for <strong>${eventTitle}</strong>. Secure your place before it's gone.</p>

			<div class="button-group">
				<a href="${registerLink}" class="button">Register now</a>
			</div>

			<p>This offer is first-come, first-served.</p>
		</div>
		<div class="footer">
			<p>This is an automated notification. Please do not reply with sensitive information.</p>
		</div>
	</div>
</body>
</html>
`;
}

/**
 * Generate HTML for waitlist email
 */
export function generateWaitlistEmailHTML(
	attendeeName: string,
	eventTitle: string,
	position: number
): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: #D4A853; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
		.content { background: #FAF8F5; padding: 30px; border-radius: 0 0 8px 8px; }
		.waitlist-info { background: #FFF9F5; padding: 16px; border-radius: 4px; margin: 20px 0; text-align: center; }
		.position { font-size: 32px; font-weight: bold; color: #C4704B; }
		.footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
		h1 { margin: 0; font-size: 28px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>You're on the waitlist!</h1>
		</div>
		<div class="content">
			<p>Hi ${attendeeName},</p>
			<p><strong>${eventTitle}</strong> is currently full, but we've added you to the waitlist.</p>

			<div class="waitlist-info">
				<div class="position">#${position}</div>
				<p>in line</p>
			</div>

			<p>We'll send you an email if a spot opens up. Thanks for your interest!</p>
		</div>
		<div class="footer">
			<p>This is an automated notification. Please do not reply with sensitive information.</p>
		</div>
	</div>
</body>
</html>
`;
}
