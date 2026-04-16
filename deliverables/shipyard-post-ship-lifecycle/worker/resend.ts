/**
 * Resend API Integration for Homeport
 * Handles email sending via Resend
 */

import { Resend } from 'resend';

export interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text: string;
  replyTo: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<SendEmailResult> {
  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      reply_to: params.replyTo,
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Build email parameters for a Homeport lifecycle email
 */
export function buildEmailParams(
  customerEmail: string,
  subject: string,
  body: string
): EmailParams {
  return {
    to: customerEmail,
    from: 'Homeport <homeport@shipyard.ai>',
    subject,
    text: body,
    replyTo: 'homeport@shipyard.ai',
  };
}
