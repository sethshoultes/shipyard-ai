export interface Env {
  SPARK_DEMO_CACHE: KVNamespace;
}

function normalizeUrl(url: string): string {
  let u = url.trim().toLowerCase();
  u = u.replace(/^https?:\/\//, '');
  u = u.replace(/\/+$/, '');
  return u;
}

const genericPreview = {
  business_name: 'Your Business',
  category: 'local business',
  hours: 'Mon-Sun 9am-9pm',
  location: 'Your City',
  cuisine_or_type: 'Local',
  faqs: [
    { q: 'What are your hours?', a: 'We are open daily from 9am to 9pm.' },
    { q: 'Do you take reservations?', a: 'Walk-ins are welcome. Call ahead for parties of 6 or more.' },
    { q: 'Is there parking?', a: 'Street parking is available nearby.' },
    { q: 'Do you offer takeout?', a: 'Yes, call or order online.' },
    { q: 'Do you have vegetarian options?', a: 'Yes, ask your server for the vegetarian menu.' },
    { q: 'Can I order online?', a: 'Yes, through our website.' },
    { q: 'Do you cater events?', a: 'Yes, contact us for catering packages.' },
    { q: 'Do you have gluten-free options?', a: 'Several dishes can be made gluten-free.' },
    { q: 'Is there outdoor seating?', a: 'Patio seating is available seasonally.' },
    { q: 'Do you offer gift cards?', a: 'Available in-store and online.' },
  ],
  brand_color: '#38BDF8',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/detect') {
      const target = url.searchParams.get('url');
      if (!target) {
        return new Response(JSON.stringify({ error: 'Missing url param' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const key = normalizeUrl(target);
      const cached = await env.SPARK_DEMO_CACHE.get(key);
      if (cached) {
        return new Response(cached, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify(genericPreview), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (url.pathname === '/faqs') {
      const category = url.searchParams.get('category') || 'general';
      const faqs = genericPreview.faqs;
      return new Response(JSON.stringify({ category, faqs }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
