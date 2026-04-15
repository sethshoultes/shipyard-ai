/**
 * LocalGenius Chat API Endpoint
 * Cloudflare Workers handler for chat requests
 *
 * Architecture:
 * 1. Check FAQ cache first (D1)
 * 2. Fall back to OpenAI if no cache hit
 * 3. Return response in <2 seconds or timeout
 */

import { FAQCache } from './faq-cache.js';
import { OpenAIClient } from '../utils/openai-client.js';
import { ResponseFormatter } from '../utils/response-formatter.js';

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify(ResponseFormatter.error('Method not allowed', 'METHOD_NOT_ALLOWED')),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    try {
      // Parse request
      const body = await request.json();
      const { question, businessId } = body;

      // Validate API key
      const apiKey = request.headers.get('X-API-Key');
      if (!apiKey) {
        return new Response(
          JSON.stringify(ResponseFormatter.error('API key required', 'UNAUTHORIZED')),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sanitize question
      const sanitizedQuestion = ResponseFormatter.sanitizeQuestion(question);
      if (!sanitizedQuestion) {
        return new Response(
          JSON.stringify(ResponseFormatter.error('Invalid question', 'INVALID_INPUT')),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get business info
      const business = await env.DB.prepare(
        'SELECT * FROM businesses WHERE id = ? AND api_key = ?'
      )
        .bind(businessId, apiKey)
        .first();

      if (!business) {
        return new Response(
          JSON.stringify(ResponseFormatter.error('Invalid business or API key', 'UNAUTHORIZED')),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Initialize cache
      const cache = new FAQCache(env.DB);

      // Try cache first
      const cachedFAQ = await cache.search(businessId, sanitizedQuestion);

      if (cachedFAQ) {
        const responseTime = Date.now() - startTime;

        // Log chat
        await cache.logChat(businessId, sanitizedQuestion, cachedFAQ.answer, responseTime, true);

        return new Response(
          JSON.stringify(ResponseFormatter.success(cachedFAQ.answer, {
            cached: true,
            similarity: cachedFAQ.similarity,
            responseTime
          })),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Cache miss - use OpenAI
      const openai = new OpenAIClient(env.OPENAI_API_KEY);
      const faqs = await cache.getAllFAQs(businessId);

      const answer = await openai.generateResponse(sanitizedQuestion, faqs, {
        name: business.name,
        type: business.type,
        email: business.email
      });

      const responseTime = Date.now() - startTime;

      // Handle timeout or error
      if (!answer) {
        await cache.logChat(businessId, sanitizedQuestion, 'Timeout fallback', responseTime, false);

        return new Response(
          JSON.stringify(ResponseFormatter.timeout(business.email)),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log chat
      await cache.logChat(businessId, sanitizedQuestion, answer, responseTime, false);

      // Optionally cache this response for future use
      if (responseTime < 1500) {
        await cache.upsertFAQ(businessId, sanitizedQuestion, answer, true);
      }

      return new Response(
        JSON.stringify(ResponseFormatter.success(answer, {
          cached: false,
          responseTime
        })),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Chat endpoint error:', error);

      return new Response(
        JSON.stringify(ResponseFormatter.error('Internal server error', 'SERVER_ERROR')),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};
