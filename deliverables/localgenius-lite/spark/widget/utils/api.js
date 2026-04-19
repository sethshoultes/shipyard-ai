/**
 * SPARK API Client
 * Handles communication with Cloudflare Worker via SSE streaming
 */

// Default to localhost for development, can be overridden
const API_ENDPOINT = window.SPARK_API_URL || 'http://localhost:8787/api/chat';

export async function sendMessage(siteId, context, question, onChunk, onComplete, onError) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_id: siteId,
        context: context,
        question: question
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Handle SSE streaming
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');

      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              onComplete();
              return;
            }

            if (data.chunk) {
              onChunk(data.chunk);
            }

            if (data.error) {
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('SPARK: Failed to parse SSE data', parseError);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    console.error('SPARK: API error', error);
    onError(error.message || 'Failed to get response. Please try again.');
  }
}
