import type { PluginContext } from "emdash";

/**
 * Email module for FormForge
 * Sends notification and auto-response emails via Resend API
 */

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

/**
 * Send email using Resend API
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
		const fromEmail = ctx.env?.FORM_FROM_EMAIL || process.env.FORM_FROM_EMAIL;

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
 * Escape HTML entities to prevent XSS in email templates
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
 * Generate submission notification email HTML
 * Sends an HTML table of all submitted field values to the form owner
 */
export function generateSubmissionNotificationHTML(
	formName: string,
	fields: Array<{ label: string; value: string }>,
	submittedAt: string,
	submissionId: string
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
	<div style="background: #C4704B; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
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
</body>
</html>`;
}

/**
 * Generate auto-response email HTML
 * Sent to the form submitter as a confirmation/thank-you
 */
export function generateAutoResponseHTML(
	subject: string,
	body: string,
	formName: string
): string {
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: #C4704B; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
		<h2 style="margin: 0; font-size: 18px;">${escapeHtml(subject)}</h2>
	</div>

	<div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
		<div style="white-space: pre-wrap;">${escapeHtml(body)}</div>

		<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
		<p style="color: #94a3b8; font-size: 12px; margin: 0;">
			This is an automated response from ${escapeHtml(formName)}.
		</p>
	</div>
</body>
</html>`;
}

/**
 * Variable substitution map for auto-response emails.
 * Supported variables: {submitterName}, {formName}, {submissionDate}
 */
export interface AutoResponseVariables {
	submitterName: string;
	formName: string;
	submissionDate: string;
}

/**
 * Process variable substitution in a string.
 * Replaces {submitterName}, {formName}, {submissionDate} with actual values.
 */
export function substituteVariables(
	text: string,
	variables: AutoResponseVariables
): string {
	return text
		.replace(/\{submitterName\}/g, variables.submitterName)
		.replace(/\{formName\}/g, variables.formName)
		.replace(/\{submissionDate\}/g, variables.submissionDate);
}

/**
 * Generate auto-response email HTML with variable substitution.
 * Processes {submitterName}, {formName}, {submissionDate} in both subject and body
 * before rendering the HTML template.
 */
export function generateAutoResponseWithVariablesHTML(
	subject: string,
	body: string,
	variables: AutoResponseVariables
): string {
	const processedSubject = substituteVariables(subject, variables);
	const processedBody = substituteVariables(body, variables);

	return generateAutoResponseHTML(
		processedSubject,
		processedBody,
		variables.formName
	);
}
