/**
 * Email Template Rendering Tests
 */

import { describe, it, expect } from 'vitest';
import { renderEmail, getEmailDays, EmailType } from '../worker/emails';
import { Project } from '../worker/kv';

describe('Email Template Rendering', () => {
  const mockProject: Project = {
    project_id: 'proj_001',
    customer_email: 'test@example.com',
    customer_name: 'Test Customer',
    project_url: 'https://example.com',
    ship_date: '2024-01-01',
  };

  it('should render day 7 email correctly', () => {
    const rendered = renderEmail('day_007', mockProject);

    expect(rendered.subject).toBe('Your site is breathing on its own now');
    expect(rendered.body).toContain('Hi Test Customer');
    expect(rendered.body).toContain('https://example.com');
    expect(rendered.body).toContain('Seven days');
    expect(rendered.body).toContain('Unsubscribe: https://homeport.shipyard.ai/unsub?token=test%40example.com');
  });

  it('should render day 30 email correctly', () => {
    const rendered = renderEmail('day_030', mockProject);

    expect(rendered.subject).toBe('Does it feel like yours yet?');
    expect(rendered.body).toContain('Hi Test Customer');
    expect(rendered.body).toContain('Thirty days in');
    expect(rendered.body).toContain('https://example.com');
  });

  it('should render day 90 email correctly', () => {
    const rendered = renderEmail('day_090', mockProject);

    expect(rendered.subject).toBe("We're still here (most agencies aren't)");
    expect(rendered.body).toContain('Ninety days');
    expect(rendered.body).toContain('https://example.com');
  });

  it('should render day 180 email correctly', () => {
    const rendered = renderEmail('day_180', mockProject);

    expect(rendered.subject).toBe('Time for a refresh?');
    expect(rendered.body).toContain('Six months');
    expect(rendered.body).toContain('https://example.com');
  });

  it('should render day 365 email correctly', () => {
    const rendered = renderEmail('day_365', mockProject);

    expect(rendered.subject).toBe('Happy Anniversary');
    expect(rendered.body).toContain('One year');
    expect(rendered.body).toContain('https://example.com');
  });

  it('should properly encode email in unsubscribe link', () => {
    const project: Project = {
      ...mockProject,
      customer_email: 'test+tag@example.com',
    };

    const rendered = renderEmail('day_007', project);
    expect(rendered.body).toContain('unsub?token=test%2Btag%40example.com');
  });

  it('should replace all instances of template variables', () => {
    const rendered = renderEmail('day_007', mockProject);

    // Check that no template variables remain
    expect(rendered.body).not.toContain('{name}');
    expect(rendered.body).not.toContain('{project_url}');
    expect(rendered.body).not.toContain('{email}');
  });
});

describe('Email Days Configuration', () => {
  it('should return correct days for each email type', () => {
    expect(getEmailDays('day_007')).toBe(7);
    expect(getEmailDays('day_030')).toBe(30);
    expect(getEmailDays('day_090')).toBe(90);
    expect(getEmailDays('day_180')).toBe(180);
    expect(getEmailDays('day_365')).toBe(365);
  });
});

describe('Voice Guidelines Compliance', () => {
  const allEmailTypes: EmailType[] = ['day_007', 'day_030', 'day_090', 'day_180', 'day_365'];

  allEmailTypes.forEach(emailType => {
    it(`${emailType} should have no corporate jargon`, () => {
      const rendered = renderEmail(emailType, mockProject);
      const bannedPhrases = [
        'leverage',
        'synergy',
        'touch base',
        'circle back',
        'low-hanging fruit',
        'value-add',
      ];

      bannedPhrases.forEach(phrase => {
        expect(rendered.body.toLowerCase()).not.toContain(phrase);
      });
    });

    it(`${emailType} should include unsubscribe link`, () => {
      const rendered = renderEmail(emailType, mockProject);
      expect(rendered.body).toContain('Unsubscribe:');
      expect(rendered.body).toContain('homeport.shipyard.ai/unsub');
    });

    it(`${emailType} should include Homeport branding`, () => {
      const rendered = renderEmail(emailType, mockProject);
      expect(rendered.body).toContain('Homeport');
    });

    it(`${emailType} should not have "Built with Shipyard" footer`, () => {
      const rendered = renderEmail(emailType, mockProject);
      expect(rendered.body).not.toContain('Built with Shipyard');
      expect(rendered.body).not.toContain('Powered by Shipyard');
    });
  });
});
