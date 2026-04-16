/**
 * AI Service Abstraction Layer
 *
 * Provides a simple interface for AI chat with automatic provider routing:
 * 1. Primary (default): Workers AI (@cf/meta/llama-2-7b-chat-int8)
 *    - Fast, free tier: 10,000 API calls/day
 *    - On Cloudflare edge, no cold starts
 *    - Perfect for: prompts, summaries, simple generation tasks
 *
 * 2. Fallback (automatic on error): Anthropic Claude
 *    - Only used if:
 *      a) Workers AI fails (quota exceeded, rate limit, error)
 *      b) ANTHROPIC_API_KEY is provided in .env
 *    - More powerful for complex reasoning tasks
 *
 * Error Handling Strategy:
 * - Workers AI errors include: "quota_exceeded", "rate_limit_exceeded", "429"
 * - When detected, automatically try Claude if API key exists
 * - If both fail, return clear error message with setup instructions
 *
 * Usage:
 * import { ai } from './ai';
 * const response = await ai.chat('Summarize this: ...');
 */

interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
}

interface AIServiceEnv {
  AI?: {
    run: (model: string, options: { prompt: string; max_tokens?: number }) => Promise<{ response: string }>;
  };
}

/**
 * Simple AI chat function with automatic provider routing
 *
 * @param prompt The user prompt/question
 * @param options Optional configuration (max_tokens, temperature)
 * @param env Cloudflare environment bindings
 * @returns Promise resolving to the AI response text
 *
 * @example
 * const response = await ai.chat('What is 2+2?', { maxTokens: 100 });
 */
async function chat(
  prompt: string,
  options: ChatOptions = {},
  env?: AIServiceEnv
): Promise<string> {
  const maxTokens = options.maxTokens || 512;

  // Try Workers AI first (primary provider)
  try {
    if (!env?.AI) {
      throw new Error('Workers AI binding not found. Make sure AI binding is configured in wrangler.toml');
    }

    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      prompt,
      max_tokens: maxTokens,
    });

    return response.response;
  } catch (error) {
    // Check if error is quota/rate limit related (fallback worthy)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isQuotaError =
      errorMessage.includes('quota_exceeded') ||
      errorMessage.includes('rate_limit_exceeded') ||
      errorMessage.includes('429') ||
      errorMessage.includes('quota');

    if (isQuotaError) {
      // Workers AI quota exceeded - try Claude fallback
      return claudeChat(prompt, options);
    }

    // If error is not quota/rate-limit related, still try Claude as fallback
    // This handles temporary outages or other transient errors
    return claudeChat(prompt, options);
  }
}

/**
 * Claude chat fallback function
 * Only called if Workers AI fails OR if explicitly requested
 *
 * Requires ANTHROPIC_API_KEY in .env file
 *
 * @param prompt The user prompt/question
 * @param options Optional configuration
 * @returns Promise resolving to Claude's response
 * @throws Error if ANTHROPIC_API_KEY is not set
 *
 * @private This is internal - use ai.chat() instead
 */
async function claudeChat(prompt: string, options: ChatOptions = {}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Clear, actionable error message
    throw new Error(
      'Workers AI quota exceeded. Add ANTHROPIC_API_KEY to .env for Claude fallback. ' +
        'Get key: https://console.anthropic.com/account/keys'
    );
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20250305', // Fast, cost-effective model
        max_tokens: options.maxTokens || 512,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorBody}`);
    }

    interface ContentBlock {
      type: string;
      text?: string;
    }

    interface AnthropicResponse {
      content: ContentBlock[];
    }

    const data = (await response.json()) as AnthropicResponse;
    const textContent = data.content.find((block) => block.type === 'text');

    if (!textContent || !textContent.text) {
      throw new Error('No text content in Anthropic response');
    }

    return textContent.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      'Both Workers AI and Claude failed. ' +
        'Check your configuration and API keys. ' +
        `Error: ${errorMessage}`
    );
  }
}

/**
 * Export the ai service as a simple interface
 * This is the primary export - use this in your application
 */
export const ai = {
  /**
   * Chat with AI - simple interface
   * Automatically routes to Workers AI (primary) or Claude (fallback)
   *
   * @param prompt The question or prompt
   * @param options Optional config
   * @param env Cloudflare environment (automatically provided by Hono context)
   * @returns Promise resolving to response text
   *
   * @example
   * const response = await ai.chat('What is TypeScript?');
   */
  chat,
};

export default ai;
