/**
 * Anchor — Email Sending via Resend API
 *
 * Per decisions.md: Use Resend API for email delivery
 * Pattern from: /workers/contact-form/src/index.ts
 */

import type { EmailRequest, EmailResponse } from "./types";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Send an email via Resend API
 *
 * @param request - Email request with to, subject, html, optional from
 * @param apiKey - Resend API key
 * @param defaultFrom - Default from address if not specified in request
 * @returns EmailResponse with success status and optional error
 */
export async function sendEmail(
  request: EmailRequest,
  apiKey: string,
  defaultFrom: string = "Anchor <anchor@shipyard.company>"
): Promise<EmailResponse> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: request.from || defaultFrom,
        to: [request.to],
        subject: request.subject,
        html: request.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Email] Resend API error: ${response.status} ${errorText}`);
      return {
        success: false,
        error: `Resend API error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`[Email] Sent to ${request.to}: ${request.subject}`);

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Email] Failed to send: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Escape HTML entities for safe email content
 * Prevents XSS in email clients
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format a date for display in emails
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return isoDate;
  }
}

/**
 * Generate base HTML email wrapper
 * Responsive HTML template with inline CSS (email clients strip external CSS)
 */
export function wrapEmailHTML(
  content: string,
  previewText: string = ""
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Anchor</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(previewText)}</div>` : ""}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate email header section
 */
export function generateEmailHeader(title: string): string {
  return `
  <tr>
    <td style="background: linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${escapeHtml(title)}</h1>
    </td>
  </tr>`;
}

/**
 * Generate email body section
 */
export function generateEmailBody(content: string): string {
  return `
  <tr>
    <td style="padding: 32px 24px;">
      ${content}
    </td>
  </tr>`;
}

/**
 * Generate email footer section
 */
export function generateEmailFooter(): string {
  return `
  <tr>
    <td style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0 0 8px; color: #6c757d; font-size: 12px;">
        Anchor by Shipyard AI — Someone's got your back.
      </p>
      <p style="margin: 0; color: #adb5bd; font-size: 11px;">
        Questions? Just reply to this email.
      </p>
    </td>
  </tr>`;
}
