/**
 * Forge - Email Module
 *
 * Sends admin notification emails via Resend API.
 * v1 MVP: Admin notifications only (no auto-response per C-006)
 */

import type { PluginContext } from "emdash";

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

/**
 * Check if email is properly configured.
 * Called at plugin:install to log warnings.
 */
export function checkEmailConfig(ctx: PluginContext): { configured: boolean; errors: string[] } {
	const errors: string[] = [];

	// @ts-ignore - ctx.env is available at runtime
	const resendKey = ctx.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
	// @ts-ignore - ctx.env is available at runtime
	const fromEmail = ctx.env?.FORM_FROM_EMAIL || process.env.FORM_FROM_EMAIL;

	if (!resendKey) {
		errors.push("Forge: RESEND_API_KEY not configured - email notifications disabled");
	}
	if (!fromEmail) {
		errors.push("Forge: FORM_FROM_EMAIL not configured - email notifications disabled");
	}

	return {
		configured: errors.length === 0,
		errors,
	};
}

/**
 * Send email using Resend API.
 * Graceful failure — returns false if not configured or call fails.
 * Per Risk Assessment: "form submissions still succeed BUT notifications don't send"
 */
export async function sendEmail(
	ctx: PluginContext,
	options: EmailOptions
): Promise<boolean> {
	try {
		// @ts-ignore - ctx.env is available at runtime
		const resendKey = ctx.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
		// @ts-ignore - ctx.env is available at runtime
		const fromEmail = ctx.env?.FORM_FROM_EMAIL || process.env.FORM_FROM_EMAIL;

		if (!resendKey || !fromEmail) {
			ctx.log.warn("Forge: Email not configured — skipping notification");
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
			ctx.log.error(`Forge: Resend API error: ${response.status} ${error}`);
			return false;
		}

		ctx.log.info(`Forge: Email sent to ${options.to}: ${options.subject}`);
		return true;
	} catch (error) {
		ctx.log.error(`Forge: Failed to send email: ${String(error)}`);
		return false;
	}
}

/**
 * Escape HTML entities for email templates
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
 * Generate submission notification email HTML.
 * Sent to form owner(s) when a submission is received.
 * Updated to use Forge branding.
 */
export function generateSubmissionNotificationHTML(
	formName: string,
	fields: Array<{ label: string; value: string }>,
	submittedAt: string,
	submissionId: string,
	primaryColor: string = "#C4704B"
): string {
	const rows = fields
		.map(
			(f) => `
		<tr>
			<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600; background: #f8fafc; width: 30%; vertical-align: top;">
				${escapeHtml(f.label)}
			</td>
			<td style="padding: 8px 12px; border: 1px solid #e2e8f0;">
				${escapeHtml(f.value || "(empty)")}
			</td>
		</tr>`
		)
		.join("");

	const dateStr = new Date(submittedAt).toLocaleString("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	});

	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: ${escapeHtml(primaryColor)}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
		<h2 style="margin: 0; font-size: 18px;">New Form Submission</h2>
		<p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">${escapeHtml(formName)}</p>
	</div>

	<div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
		<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
			${rows}
		</table>

		<p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0;">
			Submitted ${dateStr} &middot; ID: ${escapeHtml(submissionId)}
		</p>
	</div>

	<p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
		Powered by Forge
	</p>
</body>
</html>`;
}
