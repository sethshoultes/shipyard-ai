import { Hono } from 'hono';
import { ai } from './ai';

type Bindings = {
  
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Hello world endpoint
app.get('/', (c) => {
  return c.json({ message: 'Hello from WorkerKit!' });
});


// Example AI chat endpoint
// POST /api/chat with body: { "prompt": "Your prompt here" }
app.post('/api/chat', async (c) => {
  try {
    const { prompt } = await c.req.json() as { prompt: string };

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Use the AI abstraction - automatically uses Workers AI with Claude fallback
    const response = await ai.chat(prompt, { maxTokens: 512 }, c.env);

    return c.json({
      prompt,
      response,
      provider: 'Workers AI (or Claude fallback)',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json(
      {
        error: 'AI request failed',
        message: errorMessage,
        help: 'Make sure ANTHROPIC_API_KEY is set in .env if Workers AI quota is exceeded',
      },
      500
    );
  }
});

export default app;
