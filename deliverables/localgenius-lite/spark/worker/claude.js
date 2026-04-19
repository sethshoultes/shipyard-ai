/**
 * Claude API Integration
 * Handles streaming responses from Claude 3.5 Haiku
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Call Claude API and return a streaming response
 * @param {string} systemPrompt - The system prompt with page context
 * @param {string} question - User's question
 * @param {string} apiKey - Anthropic API key
 * @returns {ReadableStream} SSE stream
 */
export async function callClaude(systemPrompt, question, apiKey) {
  const anthropic = new Anthropic({ apiKey });

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });

    clearTimeout(timeoutId);

    // Convert Anthropic stream to SSE format
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
              const data = JSON.stringify({ chunk: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Send done signal
          const doneData = JSON.stringify({ done: true });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return readableStream;
  } catch (error) {
    clearTimeout(timeoutId);

    if (controller.signal.aborted) {
      const timeoutError = new Error('Request timeout');
      timeoutError.status = 408;
      throw timeoutError;
    }

    throw error;
  }
}
