import { handleStripeWebhook } from './stripe-webhook';
import { runHealthChecks } from './health-check';

export interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/stripe/webhook' && request.method === 'POST') {
      return handleStripeWebhook(request, env);
    }

    if (url.pathname === '/health-checks' && request.method === 'POST') {
      await runHealthChecks(env);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/day7' && request.method === 'POST') {
      await sendDay7Emails(env);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const cron = event.cron;

    if (cron === '0 */6 * * *') {
      await runHealthChecks(env);
    }

    if (cron === '0 9 * * *') {
      await sendDay7Emails(env);
    }
  },
};

async function sendDay7Emails(env: Env) {
  const db = env.DB;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { results } = await db
    .prepare(
      `
      SELECT c.id, c.email, c.created_at
      FROM customers c
      WHERE c.created_at <= ?
      AND NOT EXISTS (
        SELECT 1 FROM email_log el WHERE el.customer_id = c.id AND el.email_type = 'day7'
      )
      `
    )
    .bind(sevenDaysAgo)
    .all<{ id: string; email: string; created_at: string }>();

  for (const customer of results || []) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: customer.email,
        subject: 'How is your first week going?',
        html: `<p>Hi there,</p><p>Is there anything we can help you with as you settle in this first week?</p><p>Reply to this email and let us know.</p><p>— The Shipyard Team</p>`,
      }),
    });

    await db
      .prepare('INSERT INTO email_log (customer_id, email_type) VALUES (?, ?)')
      .bind(customer.id, 'day7')
      .run();
  }
}
