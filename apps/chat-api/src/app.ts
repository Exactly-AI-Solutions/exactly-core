import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import {
  createAuthMiddleware,
  DomainAuthStrategy,
  type TenantLookup,
} from '@exactly/auth';
import {
  initDb,
  TenantRepository,
  AgentConfigRepository,
  SessionRepository,
  MessageRepository,
  EventRepository,
  HandoffRepository,
} from '@exactly/db';

import { chatRoutes } from './routes/chat.js';
import { tenantRoutes } from './routes/tenants.js';
import { eventRoutes } from './routes/events.js';
import { healthRoutes } from './routes/health.js';
import { handoffRoutes, publicHandoffRoutes } from './routes/handoffs.js';
import { adminRoutes } from './routes/admin.js';
import { sessionMiddleware, type SessionEnv } from './middleware/index.js';

// Combined environment type
type AppEnv = SessionEnv;

// Initialize database
const databaseUrl = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const db = initDb(databaseUrl);
export const tenantRepository = new TenantRepository(db);
export const agentConfigRepository = new AgentConfigRepository(db);
export const sessionRepository = new SessionRepository(db);
export const messageRepository = new MessageRepository(db);
export const eventRepository = new EventRepository(db);
export const handoffRepository = new HandoffRepository(db);

// Tenant lookup using database
const getTenant: TenantLookup = async (tenantId: string) => {
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant || !tenant.isActive) {
    return null;
  }
  return {
    id: tenant.id,
    allowedDomains: tenant.allowedDomains,
  };
};

// Create auth strategy
const authStrategy = new DomainAuthStrategy(getTenant);
const authMiddleware = createAuthMiddleware(authStrategy);

// Create app with typed environment
const app = new Hono<AppEnv>();

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin, // Validated by domain auth middleware
    allowHeaders: ['Content-Type', 'X-Tenant-Id', 'X-Session-Id', 'X-Admin-Key'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    exposeHeaders: ['X-Session-Id'],
  })
);

// Health routes (no auth required)
app.route('/health', healthRoutes);

// Admin routes (API key auth, separate from domain auth)
app.route('/admin/v1', adminRoutes);

// Public handoff validation (no auth required - widget validates before session)
app.route('/api/v1/handoffs', publicHandoffRoutes);

// Protected API routes with auth + session middleware
const protectedApi = new Hono<AppEnv>();
protectedApi.use('*', authMiddleware);
protectedApi.use('*', sessionMiddleware());

protectedApi.route('/chat', chatRoutes);
protectedApi.route('/tenants', tenantRoutes);
protectedApi.route('/events', eventRoutes);
protectedApi.route('/handoffs', handoffRoutes);

app.route('/api/v1', protectedApi);

// Root
app.get('/', (c) => {
  return c.json({
    name: 'Exactly Chat API',
    version: '0.0.1',
    status: 'ok',
  });
});

export default app;
