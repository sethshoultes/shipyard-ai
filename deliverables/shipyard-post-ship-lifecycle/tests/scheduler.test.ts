/**
 * Scheduler Logic Tests
 */

import { describe, it, expect } from 'vitest';
import { scheduleEmails, getEmailsToSend } from '../worker/scheduler';
import { Project } from '../worker/kv';
import { EmailType } from '../worker/emails';

describe('Scheduler Logic', () => {
  const createMockProject = (shipDate: string, emailsSent?: Record<EmailType, boolean>, unsubscribed?: boolean): Project => {
    const project: Project = {
      project_id: 'proj_001',
      customer_email: 'test@example.com',
      customer_name: 'Test Customer',
      project_url: 'https://example.com',
      ship_date: shipDate,
    };

    if (emailsSent) {
      project.emails_sent = emailsSent;
    }

    if (unsubscribed) {
      project.unsubscribed = unsubscribed;
    }

    return project;
  };

  const daysAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  describe('Day 7 Email Scheduling', () => {
    it('should schedule day 7 email for project shipped exactly 7 days ago', () => {
      const project = createMockProject(daysAgo(7));
      const emails = getEmailsToSend(project);

      expect(emails).toHaveLength(1);
      expect(emails[0].emailType).toBe('day_007');
    });

    it('should schedule day 7 email for project shipped 8 days ago', () => {
      const project = createMockProject(daysAgo(8));
      const emails = getEmailsToSend(project);

      expect(emails.some(e => e.emailType === 'day_007')).toBe(true);
    });

    it('should not schedule day 7 email for project shipped 6 days ago', () => {
      const project = createMockProject(daysAgo(6));
      const emails = getEmailsToSend(project);

      expect(emails.some(e => e.emailType === 'day_007')).toBe(false);
    });

    it('should not schedule day 7 email if already sent', () => {
      const project = createMockProject(daysAgo(7), {
        day_007: true,
      } as any);
      const emails = getEmailsToSend(project);

      expect(emails.some(e => e.emailType === 'day_007')).toBe(false);
    });
  });

  describe('Day 30 Email Scheduling', () => {
    it('should schedule day 30 email for project shipped 30 days ago', () => {
      const project = createMockProject(daysAgo(30));
      const emails = getEmailsToSend(project);

      expect(emails.some(e => e.emailType === 'day_030')).toBe(true);
    });

    it('should not schedule day 30 email if already sent', () => {
      const project = createMockProject(daysAgo(30), {
        day_030: true,
      } as any);
      const emails = getEmailsToSend(project);

      expect(emails.some(e => e.emailType === 'day_030')).toBe(false);
    });
  });

  describe('Multiple Email Scheduling', () => {
    it('should schedule multiple emails for old project with no emails sent', () => {
      const project = createMockProject(daysAgo(400)); // Over 1 year old
      const emails = getEmailsToSend(project);

      // Should schedule all 5 emails
      expect(emails).toHaveLength(5);
      expect(emails.some(e => e.emailType === 'day_007')).toBe(true);
      expect(emails.some(e => e.emailType === 'day_030')).toBe(true);
      expect(emails.some(e => e.emailType === 'day_090')).toBe(true);
      expect(emails.some(e => e.emailType === 'day_180')).toBe(true);
      expect(emails.some(e => e.emailType === 'day_365')).toBe(true);
    });

    it('should only schedule pending emails for old project', () => {
      const project = createMockProject(daysAgo(400), {
        day_007: true,
        day_030: true,
      } as any);
      const emails = getEmailsToSend(project);

      // Should schedule only remaining 3 emails
      expect(emails).toHaveLength(3);
      expect(emails.some(e => e.emailType === 'day_007')).toBe(false);
      expect(emails.some(e => e.emailType === 'day_030')).toBe(false);
      expect(emails.some(e => e.emailType === 'day_090')).toBe(true);
      expect(emails.some(e => e.emailType === 'day_180')).toBe(true);
      expect(emails.some(e => e.emailType === 'day_365')).toBe(true);
    });
  });

  describe('Unsubscribe Handling', () => {
    it('should not schedule any emails for unsubscribed user', () => {
      const project = createMockProject(daysAgo(400), undefined, true);
      const emails = getEmailsToSend(project);

      expect(emails).toHaveLength(0);
    });

    it('should not schedule emails for unsubscribed user even if emails pending', () => {
      const project = createMockProject(daysAgo(30), undefined, true);
      const emails = getEmailsToSend(project);

      expect(emails).toHaveLength(0);
    });
  });

  describe('scheduleEmails for Multiple Projects', () => {
    it('should schedule emails across multiple projects', () => {
      const projects: Project[] = [
        createMockProject(daysAgo(7)),  // Should get day_007
        createMockProject(daysAgo(30)), // Should get day_007 and day_030
        createMockProject(daysAgo(1)),  // Should get nothing
      ];

      const emails = scheduleEmails(projects);

      // First project: 1 email (day_007)
      // Second project: 2 emails (day_007, day_030)
      // Third project: 0 emails
      expect(emails).toHaveLength(3);
    });

    it('should return empty array for empty projects list', () => {
      const emails = scheduleEmails([]);
      expect(emails).toHaveLength(0);
    });

    it('should skip unsubscribed projects', () => {
      const projects: Project[] = [
        createMockProject(daysAgo(7)),
        createMockProject(daysAgo(7), undefined, true), // Unsubscribed
      ];

      const emails = scheduleEmails(projects);
      expect(emails).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle project shipped today', () => {
      const project = createMockProject(daysAgo(0));
      const emails = getEmailsToSend(project);

      expect(emails).toHaveLength(0);
    });

    it('should handle future ship date gracefully', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const project = createMockProject(futureDate.toISOString().split('T')[0]);
      const emails = getEmailsToSend(project);

      expect(emails).toHaveLength(0);
    });

    it('should handle projects at exact milestone boundaries', () => {
      const milestones = [7, 30, 90, 180, 365];

      milestones.forEach(days => {
        const project = createMockProject(daysAgo(days));
        const emails = getEmailsToSend(project);

        expect(emails.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Scheduler Return Values', () => {
    it('should return correct project and email type in scheduled email', () => {
      const project = createMockProject(daysAgo(7));
      const emails = getEmailsToSend(project);

      expect(emails[0].project).toBe(project);
      expect(emails[0].emailType).toBe('day_007');
    });

    it('should return scheduled emails in consistent order', () => {
      const project = createMockProject(daysAgo(400));
      const emails = getEmailsToSend(project);

      // Emails should be ordered by type (day_007, day_030, day_090, day_180, day_365)
      expect(emails[0].emailType).toBe('day_007');
      expect(emails[1].emailType).toBe('day_030');
      expect(emails[2].emailType).toBe('day_090');
      expect(emails[3].emailType).toBe('day_180');
      expect(emails[4].emailType).toBe('day_365');
    });
  });
});
