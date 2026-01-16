import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/', (c) => {
  return c.json({
    name: 'Exactly Workflows API',
    version: '0.0.1',
    status: 'ok',
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// TODO: Add workflow routes
// - POST /api/v1/workflows - Start workflow
// - GET /api/v1/workflows/:id - Get workflow status
// - POST /api/v1/workflows/:id/cancel - Cancel workflow

export default app;
