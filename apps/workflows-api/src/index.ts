import app from './app';

const port = process.env.PORT || 3002;

console.log(`Workflows API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
