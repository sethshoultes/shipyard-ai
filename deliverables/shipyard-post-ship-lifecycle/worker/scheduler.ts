/**
 * Email Scheduler for Homeport
 * Determines which emails to send based on ship dates
 */

import { Project } from './kv';
import { EmailType, getEmailDays } from './emails';

export interface ScheduledEmail {
  project: Project;
  emailType: EmailType;
}

/**
 * Calculate days since ship date
 */
function daysSinceShip(shipDate: string): number {
  const shipped = new Date(shipDate);
  const now = new Date();
  const diffTime = now.getTime() - shipped.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determine if an email should be sent for a project
 */
function shouldSendEmail(
  project: Project,
  emailType: EmailType,
  daysSince: number
): boolean {
  // Don't send if user unsubscribed
  if (project.unsubscribed) {
    return false;
  }

  // Don't send if this email was already sent
  if (project.emails_sent && project.emails_sent[emailType]) {
    return false;
  }

  const targetDays = getEmailDays(emailType);

  // Send email if we're at or past the target day
  // This handles the case where the cron might not run exactly on the target day
  return daysSince >= targetDays;
}

/**
 * Get all emails that should be sent for a project
 */
export function getEmailsToSend(project: Project): ScheduledEmail[] {
  const daysSince = daysSinceShip(project.ship_date);
  const emailsToSend: ScheduledEmail[] = [];

  const emailTypes: EmailType[] = [
    'day_007',
    'day_030',
    'day_090',
    'day_180',
    'day_365',
  ];

  for (const emailType of emailTypes) {
    if (shouldSendEmail(project, emailType, daysSince)) {
      emailsToSend.push({
        project,
        emailType,
      });
    }
  }

  return emailsToSend;
}

/**
 * Get all scheduled emails across all projects
 */
export function scheduleEmails(projects: Project[]): ScheduledEmail[] {
  const allScheduled: ScheduledEmail[] = [];

  for (const project of projects) {
    const scheduled = getEmailsToSend(project);
    allScheduled.push(...scheduled);
  }

  return allScheduled;
}

/**
 * Process scheduled emails and send them
 * Returns count of emails sent and errors
 */
export async function processScheduledEmails(
  scheduledEmails: ScheduledEmail[],
  sendEmailFn: (scheduled: ScheduledEmail) => Promise<boolean>
): Promise<{ sent: number; errors: number }> {
  let sent = 0;
  let errors = 0;

  for (const scheduled of scheduledEmails) {
    try {
      const success = await sendEmailFn(scheduled);
      if (success) {
        sent++;
      } else {
        errors++;
      }
    } catch (err) {
      console.error('Error processing scheduled email:', err);
      errors++;
    }
  }

  return { sent, errors };
}
