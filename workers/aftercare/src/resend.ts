/**
 * Resend API Client Wrapper
 *
 * Lightweight client for sending emails via Resend API.
 * Plain text only, no retry logic in V1.
 */

import { Env } from './kv';

export interface EmailInput {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export interface SendResult {
  id: string;
  ok: boolean;
}

/**
 * Send email via Resend API
 * @returns Email ID and success flag
 */
export async function sendEmail(env: Env, input: EmailInput): Promise<SendResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        reply_to: input.replyTo || env.FROM_EMAIL,
      }),
    });

    if (response.ok) {
      const data = await response.json() as { id: string };
      console.log(`Email sent successfully: ${data.id} to ${input.to}`);
      return { id: data.id, ok: true };
    } else {
      const errorText = await response.text();
      console.error(`Email send failed: ${response.status} ${errorText}`);
      return { id: '', ok: false };
    }
  } catch (error) {
    console.error('Email send error:', error);
    return { id: '', ok: false };
  }
}
