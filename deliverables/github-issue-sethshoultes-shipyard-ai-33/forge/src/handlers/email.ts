/**
 * Forge - Email Notification Handlers
 *
 * R-014: Admin notification per submission
 * R-023: Validate email config at startup
 */
import type { PluginContext } from "emdash";
import type { Form, Submission } from "../types.js";

/**
 * Email message structure compatible with EmDash's email system.
 */
interface EmailMessage {
	to: string;
	subject: string;
	text: string;
	html?: string;
}

/**
 * Formats a submission value for display in email.
 */
function formatValue(value: unknown): string {
	if (value === null || value === undefined) {
		return "(not provided)";
	}

	if (Array.isArray(value)) {
		return value.join(", ");
	}

	return String(value);
}

/**
 * Builds a plain text email body for submission notification.
 */
function buildTextBody(form: Form, submission: Submission): string {
	const lines: string[] = [
		`New submission received for "${form.name}"`,
		"",
		"---",
		"",
	];

	// Add each field value
	for (const field of form.fields) {
		const value = submission.data[field.id];
		lines.push(`${field.label}: ${formatValue(value)}`);
	}

	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push(`Submitted: ${new Date(submission.createdAt).toLocaleString()}`);
	lines.push(`Submission ID: ${submission.id}`);

	return lines.join("\n");
}

/**
 * Builds an HTML email body for submission notification.
 */
function buildHtmlBody(form: Form, submission: Submission): string {
	const fieldRows = form.fields
		.map((field) => {
			const value = submission.data[field.id];
			return `
				<tr>
					<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 30%; vertical-align: top;">
						${escapeHtml(field.label)}
					</td>
					<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
						${escapeHtml(formatValue(value))}
					</td>
				</tr>
			`;
		})
		.join("");

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
			<div style="background: linear-gradient(135deg, ${form.theme.primaryColor} 0%, ${adjustColor(form.theme.primaryColor, -20)} 100%); padding: 24px; border-radius: 12px 12px 0 0;">
				${form.theme.logoUrl ? `<img src="${escapeHtml(form.theme.logoUrl)}" alt="Logo" style="max-height: 48px; margin-bottom: 12px;">` : ""}
				<h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
					New Submission
				</h1>
				<p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
					${escapeHtml(form.name)}
				</p>
			</div>

			<div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; overflow: hidden;">
				<table style="width: 100%; border-collapse: collapse;">
					${fieldRows}
				</table>

				<div style="padding: 16px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
					<p style="margin: 0; font-size: 12px; color: #6b7280;">
						Submitted: ${new Date(submission.createdAt).toLocaleString()}<br>
						ID: ${submission.id}
					</p>
				</div>
			</div>

			<p style="margin-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
				Sent by Forge
			</p>
		</body>
		</html>
	`;
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text: string): string {
	const escapeMap: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Adjusts a hex color by a percentage.
 */
function adjustColor(hex: string, percent: number): string {
	// Remove # if present
	hex = hex.replace(/^#/, "");

	// Parse hex to RGB
	const num = parseInt(hex, 16);
	const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
	const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
	const b = Math.min(255, Math.max(0, (num & 0xff) + percent));

	// Convert back to hex
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Sends an admin notification email for a new submission.
 * R-014: Admin notification per submission
 *
 * @param ctx - Plugin context
 * @param form - The form that received the submission
 * @param submission - The submission data
 * @returns True if email was sent, false otherwise
 */
export async function sendSubmissionNotification(
	ctx: PluginContext,
	form: Form,
	submission: Submission
): Promise<boolean> {
	// Check if notifications are configured
	if (!form.notificationEmail) {
		ctx.log.info("No notification email configured for form", { formId: form.id });
		return false;
	}

	// Check if email capability is available
	if (!ctx.email) {
		ctx.log.warn("Email capability not available - cannot send notification");
		return false;
	}

	const message: EmailMessage = {
		to: form.notificationEmail,
		subject: `New submission: ${form.name}`,
		text: buildTextBody(form, submission),
		html: buildHtmlBody(form, submission),
	};

	try {
		await ctx.email.send(message);
		ctx.log.info("Submission notification sent", {
			formId: form.id,
			submissionId: submission.id,
			to: form.notificationEmail,
		});
		return true;
	} catch (error) {
		ctx.log.error("Failed to send submission notification", {
			formId: form.id,
			submissionId: submission.id,
			error: error instanceof Error ? error.message : String(error),
		});
		return false;
	}
}

/**
 * Validates email configuration at startup.
 * R-023: Validate email config at startup
 *
 * @param ctx - Plugin context
 * @returns Validation result
 */
export async function validateEmailConfig(
	ctx: PluginContext
): Promise<{ valid: boolean; message: string }> {
	// Check if email capability is available
	if (!ctx.email) {
		return {
			valid: false,
			message: "Email capability not available. Ensure an email provider plugin is installed and configured.",
		};
	}

	// Get default from email from plugin options (stored in KV)
	const defaultFromEmail = await ctx.kv.get<string>("settings:defaultFromEmail");

	if (!defaultFromEmail) {
		return {
			valid: true,
			message: "Email capability available. Consider setting a default from email in plugin settings.",
		};
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(defaultFromEmail)) {
		return {
			valid: false,
			message: `Invalid default from email address: ${defaultFromEmail}`,
		};
	}

	return {
		valid: true,
		message: "Email configuration is valid.",
	};
}

/**
 * Gets the configured notification settings.
 *
 * @param ctx - Plugin context
 * @returns Notification settings
 */
export async function getNotificationSettings(
	ctx: PluginContext
): Promise<{ defaultFromEmail?: string; emailEnabled: boolean }> {
	const defaultFromEmail = await ctx.kv.get<string>("settings:defaultFromEmail");

	return {
		defaultFromEmail: defaultFromEmail || undefined,
		emailEnabled: !!ctx.email,
	};
}

/**
 * Updates notification settings.
 *
 * @param ctx - Plugin context
 * @param settings - Settings to update
 */
export async function updateNotificationSettings(
	ctx: PluginContext,
	settings: { defaultFromEmail?: string }
): Promise<void> {
	if (settings.defaultFromEmail !== undefined) {
		if (settings.defaultFromEmail) {
			await ctx.kv.set("settings:defaultFromEmail", settings.defaultFromEmail);
		} else {
			await ctx.kv.delete("settings:defaultFromEmail");
		}
	}

	ctx.log.info("Notification settings updated", settings);
}
