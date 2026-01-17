import app from './app.js';

// Re-export repositories for use in routes
export {
  tenantRepository,
  agentConfigRepository,
  sessionRepository,
  messageRepository,
  eventRepository,
  handoffRepository,
} from './app.js';

const port = process.env.PORT || 3001;

console.log(`Chat API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 60, // 60 seconds to accommodate slow quick wins requests (15-30s)
};
