import { Hono } from 'hono';

export const healthRoutes = new Hono();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

healthRoutes.get('/ready', (c) => {
  // TODO: Check database connection
  return c.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});
