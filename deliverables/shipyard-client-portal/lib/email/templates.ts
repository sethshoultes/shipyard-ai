/**
 * Email Templates for Shipyard Client Portal
 *
 * These templates are used with Resend to send transactional emails.
 * Future enhancement: Use React Email components for rich HTML emails.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface SiteLiveEmailData {
  projectName: string;
  siteUrl: string;
  clientEmail: string;
}

export interface BuildFailedEmailData {
  projectName: string;
  errorMessage?: string;
  clientEmail: string;
}

export interface PaymentConfirmationEmailData {
  projectName: string;
  amount: number;
  clientEmail: string;
}

export interface ReadyForReviewEmailData {
  projectName: string;
  stagingUrl: string;
  clientEmail: string;
}

export function getSiteLiveEmailContent(data: SiteLiveEmailData) {
  return {
    subject: `🎉 Your site is live: ${data.projectName}`,
    text: `Hi there,

Great news! Your website "${data.projectName}" is now live and available to the world.

View your site: ${data.siteUrl}

You can track all your projects and access this link anytime from your dashboard: ${APP_URL}/dashboard

If you have any questions or need support, just reply to this email.

Best,
The Shipyard Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">🎉 Your site is live!</h1>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          Great news! Your website "<strong>${data.projectName}</strong>" is now live and available to the world.
        </p>
        <p style="margin: 32px 0;">
          <a href="${data.siteUrl}"
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Your Site
          </a>
        </p>
        <p style="font-size: 14px; color: #666;">
          You can track all your projects and access this link anytime from your
          <a href="${APP_URL}/dashboard" style="color: #000;">dashboard</a>.
        </p>
        <p style="font-size: 14px; color: #666;">
          If you have any questions or need support, just reply to this email.
        </p>
        <p style="font-size: 14px; color: #333; margin-top: 32px;">
          Best,<br/>
          The Shipyard Team
        </p>
      </div>
    `,
  };
}

export function getBuildFailedEmailContent(data: BuildFailedEmailData) {
  return {
    subject: `Build issue: ${data.projectName}`,
    text: `Hi there,

We encountered an issue while building your website "${data.projectName}".

${data.errorMessage ? `Error details: ${data.errorMessage}` : "Our team has been notified and is investigating the issue."}

We'll get this resolved and send you an update shortly. You can also track the status in your dashboard: ${APP_URL}/dashboard

If you have any questions, feel free to reply to this email.

Best,
The Shipyard Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Build Issue Detected</h1>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          We encountered an issue while building your website "<strong>${data.projectName}</strong>".
        </p>
        ${
          data.errorMessage
            ? `<div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
                 <p style="font-size: 14px; color: #991b1b; margin: 0;">
                   <strong>Error details:</strong><br/>
                   ${data.errorMessage}
                 </p>
               </div>`
            : `<p style="font-size: 16px; color: #333;">
                 Our team has been notified and is investigating the issue.
               </p>`
        }
        <p style="font-size: 16px; color: #333;">
          We'll get this resolved and send you an update shortly.
        </p>
        <p style="font-size: 14px; color: #666;">
          You can track the status in your <a href="${APP_URL}/dashboard" style="color: #000;">dashboard</a>.
        </p>
        <p style="font-size: 14px; color: #666;">
          If you have any questions, feel free to reply to this email.
        </p>
        <p style="font-size: 14px; color: #333; margin-top: 32px;">
          Best,<br/>
          The Shipyard Team
        </p>
      </div>
    `,
  };
}

export function getPaymentConfirmationEmailContent(data: PaymentConfirmationEmailData) {
  const formattedAmount = (data.amount / 100).toFixed(2);

  return {
    subject: `Payment confirmed: ${data.projectName}`,
    text: `Hi there,

Thank you for your payment! We've received your payment of $${formattedAmount} for "${data.projectName}".

Your project has been queued and our team will begin work shortly. You'll receive email updates as your project progresses through the build process.

Track your project status anytime: ${APP_URL}/dashboard

Receipt and payment details are available in your Stripe customer portal.

Best,
The Shipyard Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Payment Confirmed</h1>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          Thank you for your payment! We've received your payment of <strong>$${formattedAmount}</strong> for "<strong>${data.projectName}</strong>".
        </p>
        <p style="font-size: 16px; color: #333;">
          Your project has been queued and our team will begin work shortly. You'll receive email updates as your project progresses through the build process.
        </p>
        <p style="margin: 32px 0;">
          <a href="${APP_URL}/dashboard"
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </p>
        <p style="font-size: 14px; color: #666;">
          Receipt and payment details are available in your Stripe customer portal.
        </p>
        <p style="font-size: 14px; color: #333; margin-top: 32px;">
          Best,<br/>
          The Shipyard Team
        </p>
      </div>
    `,
  };
}

export function getReadyForReviewEmailContent(data: ReadyForReviewEmailData) {
  return {
    subject: `Ready for review: ${data.projectName}`,
    text: `Hi there,

Great progress! Your website "${data.projectName}" is ready for review on our staging environment.

Preview your site: ${data.stagingUrl}

Please review the site and let us know if you'd like any changes. Once approved, we'll deploy it to your live domain.

You can also access this link from your dashboard: ${APP_URL}/dashboard

Best,
The Shipyard Team`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Ready for Review</h1>
        <p style="font-size: 16px; color: #333;">Hi there,</p>
        <p style="font-size: 16px; color: #333;">
          Great progress! Your website "<strong>${data.projectName}</strong>" is ready for review on our staging environment.
        </p>
        <p style="margin: 32px 0;">
          <a href="${data.stagingUrl}"
             style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Preview Your Site
          </a>
        </p>
        <p style="font-size: 16px; color: #333;">
          Please review the site and let us know if you'd like any changes. Once approved, we'll deploy it to your live domain.
        </p>
        <p style="font-size: 14px; color: #666;">
          You can also access this link from your <a href="${APP_URL}/dashboard" style="color: #000;">dashboard</a>.
        </p>
        <p style="font-size: 14px; color: #333; margin-top: 32px;">
          Best,<br/>
          The Shipyard Team
        </p>
      </div>
    `,
  };
}
