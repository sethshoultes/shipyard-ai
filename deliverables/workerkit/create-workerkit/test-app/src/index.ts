import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
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

export default app;
