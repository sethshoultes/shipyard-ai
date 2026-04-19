/**
 * SPARK Cloudflare Worker
 * Handles chat requests and streams Claude AI responses
 */

import { callClaude } from './claude.js';
import { buildSystemPrompt } from './prompt.js';
import { checkSiteIdLimit, checkIPLimit } from './ratelimit.js';
import { handleError } from './errors.js';
import { logRequest } from './analytics.js';

export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse request
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { site_id, context, question } = body;

    // Validate required fields
    if (!site_id || !context || !question) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: site_id, context, question' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(site_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid site_id format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Rate limiting - site_id
    if (!checkSiteIdLimit(site_id)) {
      logRequest('rate_limited', { site_id, limit_type: 'site_id' });
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a moment.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // Rate limiting - IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkIPLimit(clientIP)) {
      logRequest('rate_limited', { site_id, ip: clientIP, limit_type: 'ip' });
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait an hour.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        }
      );
    }

    // Call Claude API
    try {
      const systemPrompt = buildSystemPrompt(context);
      const stream = await callClaude(systemPrompt, question, env.ANTHROPIC_API_KEY);

      const latency = Date.now() - startTime;
      logRequest('question', { site_id, latency_ms: latency, error: null });

      // Stream response as SSE
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      logRequest('error', { site_id, latency_ms: latency, error: error.message });

      const errorResponse = handleError(error);
      return new Response(
        JSON.stringify({ error: errorResponse }),
        {
          status: error.status || 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
