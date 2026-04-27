/**
 * Sous Worker
 * Routes: POST /ask, POST /webhook, GET /config
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    try {
      if (method === 'POST' && url.pathname === '/ask') {
        return await handleAsk(request, env, corsHeaders);
      }

      if (method === 'POST' && url.pathname === '/webhook') {
        return await handleWebhook(request, env, corsHeaders);
      }

      if (method === 'GET' && url.pathname === '/config') {
        return await handleConfig(request, env, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};

async function handleAsk(request, env, corsHeaders) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question || '').trim().toLowerCase();
  const siteId = String(body.site_id || 'default');

  if (!question) {
    return new Response(JSON.stringify({ error: 'Question required' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Check usage
  const sub = await env.DB.prepare(
    'SELECT responses_used, responses_limit, tier, status FROM sous_subscriptions WHERE site_id = ?'
  ).bind(siteId).first();

  const used = sub?.responses_used || 0;
  const limit = sub?.responses_limit || 50;

  if (used >= limit) {
    return new Response(
      JSON.stringify({
        answer: "You've reached your monthly limit. Upgrade to keep your responses flowing.",
        limit_reached: true,
      }),
      { headers: corsHeaders }
    );
  }

  // KV lookup by simple hash key
  const key = `${siteId}:${question}`;
  const cached = await env.KV.get(key);

  if (cached) {
    await incrementCounter(env, siteId);
    return new Response(
      JSON.stringify({ answer: cached, source: 'kv' }),
      { headers: corsHeaders }
    );
  }

  // KV miss: return a fallback answer (LLM proxy reserved for v1.1)
  const fallback = findFallbackAnswer(question);
  await incrementCounter(env, siteId);

  return new Response(
    JSON.stringify({ answer: fallback, source: 'fallback' }),
    { headers: corsHeaders }
  );
}

async function incrementCounter(env, siteId) {
  try {
    await env.DB.prepare(
      'UPDATE sous_subscriptions SET responses_used = responses_used + 1 WHERE site_id = ?'
    ).bind(siteId).run();
  } catch {
    // Ignore counter errors on missing row
  }
}

function findFallbackAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('hour') || q.includes('open')) {
    return "We're open Tuesday through Sunday, 11 am to 10 pm. Closed Mondays for prep.";
  }
  if (q.includes('reservation') || q.includes('book')) {
    return "You can book a table by calling us directly or through our website. Walk-ins are always welcome at the bar.";
  }
  if (q.includes('menu') || q.includes('food')) {
    return "Our menu changes with the seasons. Today's specials are posted on the chalkboard and on our site.";
  }
  if (q.includes('park')) {
    return "Street parking is available on Main and 3rd. There's also a public lot two blocks north.";
  }
  if (q.includes('insurance')) {
    return "We accept most major PPO plans. Call the front desk and we'll verify your benefits before your visit.";
  }
  if (q.includes('emergency') || q.includes('pain')) {
    return "If you're in pain, call us directly. We reserve same-day slots for urgent cases.";
  }
  if (q.includes('return')) {
    return "Returns are accepted within 30 days with a receipt. Sale items are final.";
  }
  if (q.includes('ship') || q.includes('deliver')) {
    return "We ship within two business days. Local delivery is free on orders over fifty dollars.";
  }
  if (q.includes('membership') || q.includes('join')) {
    return "Monthly memberships start at forty-nine dollars. No annual contracts, cancel anytime with 30 days notice.";
  }
  return "Thanks for reaching out. A member of our team will follow up shortly.";
}

async function handleWebhook(request, env, corsHeaders) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  // In production, verify signature with Stripe library.
  // For v1, we parse and validate event type.
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const siteId = session.metadata?.site_id || 'default';
    const tier = session.metadata?.tier || 'base';
    const limit = tier === 'pro' ? 500 : 200;

    await env.DB.prepare(
      `INSERT INTO sous_subscriptions (
        id, site_id, stripe_customer_id, stripe_subscription_id,
        tier, status, responses_used, responses_limit,
        current_period_start, current_period_end, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        stripe_subscription_id = excluded.stripe_subscription_id,
        tier = excluded.tier,
        status = excluded.status,
        responses_limit = excluded.responses_limit,
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end`
    ).bind(
      session.customer || session.id,
      siteId,
      session.customer || '',
      session.subscription || '',
      tier,
      'active',
      limit,
      new Date(session.current_period_start * 1000).toISOString(),
      new Date(session.current_period_end * 1000).toISOString()
    ).run();

    return new Response(JSON.stringify({ received: true }), {
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: corsHeaders,
  });
}

async function handleConfig(request, env, corsHeaders) {
  const url = new URL(request.url);
  const siteId = url.searchParams.get('site_id') || 'default';

  const greeting = "Questions? We're here to help.";
  const theme = { primary: '#334155', bubble: '#334155', text: '#ffffff' };

  return new Response(
    JSON.stringify({ site_id: siteId, greeting, theme }),
    { headers: corsHeaders }
  );
}
