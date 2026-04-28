import { Hono } from 'hono';
import { cors } from 'hono/cors';
import jobs from './routes/jobs.js';
import poll from './routes/poll.js';
import complete from './routes/complete.js';
import gallery from './routes/gallery.js';

const app = new Hono();

app.use('*', cors({ origin: '*' }));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/', jobs);
app.route('/', poll);
app.route('/', complete);
app.route('/', gallery);

export default app;
