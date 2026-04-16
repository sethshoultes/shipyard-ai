/**
 * Homeport - Cloudflare Worker Entry Point
 * Post-ship lifecycle emails for Shipyard projects
 */

import { getAllProjects, recordEmailSent } from './kv';
import { renderEmail } from './emails';
import { sendEmail, buildEmailParams } from './resend';
import { scheduleEmails, ScheduledEmail, processScheduledEmails } from './scheduler';
import { handleUnsubscribe } from './unsubscribe';

export interface Env {
  PROJECTS: KVNamespace;
  RESEND_API_KEY: string;
}

/**
 * Main Worker export
 */
export default {
  /**
   * Handle scheduled cron triggers
   * Runs daily at 9 AM UTC to check which emails should be sent
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Homeport cron triggered at:', new Date().toISOString());

    try {
      // Get all projects from KV
      const projects = await getAllProjects(env.PROJECTS);
      console.log(`Found ${projects.length} projects`);

      // Schedule emails based on ship dates
      const scheduledEmails = scheduleEmails(projects);
      console.log(`Scheduled ${scheduledEmails.length} emails to send`);

      if (scheduledEmails.length === 0) {
        console.log('No emails to send today');
        return;
      }

      // Process scheduled emails
      const { sent, errors } = await processScheduledEmails(
        scheduledEmails,
        async (scheduled: ScheduledEmail) => {
          return await sendScheduledEmail(env, scheduled);
        }
      );

      console.log(`Email batch complete: ${sent} sent, ${errors} errors`);
    } catch (err) {
      console.error('Cron job error:', err);
    }
  },

  /**
   * Handle HTTP requests
   * Primarily for unsubscribe links
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle unsubscribe requests
    if (url.pathname === '/unsub') {
      return await handleUnsubscribe(request, env.PROJECTS);
    }

    // Default response
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>Homeport</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 80px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 24px; margin-bottom: 20px; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>Homeport</h1>
  <p>Shipyard's way of staying close to what we build.</p>
  <p>We don't ghost you after launch.</p>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  },
};

/**
 * Send a scheduled email
 */
async function sendScheduledEmail(
  env: Env,
  scheduled: ScheduledEmail
): Promise<boolean> {
  const { project, emailType } = scheduled;

  try {
    // Render the email template
    const rendered = renderEmail(emailType, project);

    // Build email parameters
    const emailParams = buildEmailParams(
      project.customer_email,
      rendered.subject,
      rendered.body
    );

    // Send via Resend
    const result = await sendEmail(env.RESEND_API_KEY, emailParams);

    if (result.success) {
      // Record that this email was sent
      await recordEmailSent(env.PROJECTS, project.project_id, emailType);
      console.log(
        `Sent ${emailType} to ${project.customer_email} (${project.project_id})`
      );
      return true;
    } else {
      console.error(
        `Failed to send ${emailType} to ${project.customer_email}:`,
        result.error
      );
      return false;
    }
  } catch (err) {
    console.error(`Error sending email to ${project.customer_email}:`, err);
    return false;
  }
}
