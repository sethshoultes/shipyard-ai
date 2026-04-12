import { Resend } from 'resend';

/**
 * Email service for MemberShip plugin
 * Version: 1.0.0
 *
 * Uses Resend for transactional emails with terse, warm copy per brand voice.
 * "The first hello. So members feel received, not processed."
 */

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface WelcomeEmailParams {
  to: string;
  memberName?: string;
  siteName: string;
  loginUrl: string;
}

export interface ConfirmationEmailParams {
  to: string;
  memberName?: string;
  siteName: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
}

export interface CancellationEmailParams {
  to: string;
  memberName?: string;
  siteName: string;
  accessEndDate: string;
}

let resendClient: Resend | null = null;
let emailConfig: EmailConfig | null = null;

/**
 * Initialize the email client
 */
export function initEmail(config: EmailConfig): void {
  if (!config.apiKey) {
    throw new Error('Resend API key is required');
  }

  emailConfig = config;
  resendClient = new Resend(config.apiKey);
}

/**
 * Get the initialized Resend client
 */
function getEmailClient(): Resend {
  if (!resendClient || !emailConfig) {
    throw new Error('Email client not initialized. Call initEmail() first.');
  }
  return resendClient;
}

/**
 * Send welcome email to new member
 * Brand voice: terse, warm, confident
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<void> {
  const client = getEmailClient();
  const greeting = params.memberName ? `Hi ${params.memberName}` : 'Welcome';

  await client.emails.send({
    from: `${emailConfig!.fromName} <${emailConfig!.fromEmail}>`,
    to: params.to,
    subject: `You're in. Welcome to ${params.siteName}.`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">${greeting},</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
          You're now a member of ${params.siteName}. Everything unlocked. No hoops.
        </p>

        <a href="${params.loginUrl}"
           style="display: inline-block; background: #2c2c2c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Go to your content
        </a>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Questions? Just reply to this email.
        </p>
      </div>
    `,
    text: `${greeting},

You're now a member of ${params.siteName}. Everything unlocked. No hoops.

Go to your content: ${params.loginUrl}

Questions? Just reply to this email.`,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendConfirmationEmail(
  params: ConfirmationEmailParams
): Promise<void> {
  const client = getEmailClient();
  const greeting = params.memberName ? `Hi ${params.memberName}` : 'Hi there';

  await client.emails.send({
    from: `${emailConfig!.fromName} <${emailConfig!.fromEmail}>`,
    to: params.to,
    subject: `Payment received — ${params.siteName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">${greeting},</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
          Payment received. You're all set.
        </p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> ${params.planName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Amount:</strong> ${params.amount}</p>
          <p style="margin: 0;"><strong>Next billing:</strong> ${params.nextBillingDate}</p>
        </div>

        <p style="font-size: 14px; color: #666;">
          Questions about billing? Just reply.
        </p>
      </div>
    `,
    text: `${greeting},

Payment received. You're all set.

Plan: ${params.planName}
Amount: ${params.amount}
Next billing: ${params.nextBillingDate}

Questions about billing? Just reply.`,
  });
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationEmail(
  params: CancellationEmailParams
): Promise<void> {
  const client = getEmailClient();
  const greeting = params.memberName ? `Hi ${params.memberName}` : 'Hi there';

  await client.emails.send({
    from: `${emailConfig!.fromName} <${emailConfig!.fromEmail}>`,
    to: params.to,
    subject: `Membership canceled — ${params.siteName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">${greeting},</h1>

        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
          Your membership has been canceled. You'll have access until ${params.accessEndDate}.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
          Changed your mind? You can resubscribe anytime.
        </p>

        <p style="font-size: 14px; color: #666;">
          Thanks for being a member. We hope to see you again.
        </p>
      </div>
    `,
    text: `${greeting},

Your membership has been canceled. You'll have access until ${params.accessEndDate}.

Changed your mind? You can resubscribe anytime.

Thanks for being a member. We hope to see you again.`,
  });
}
