import { Hono } from 'hono';
import type { SessionEnv } from '../middleware/index.js';
import { tenantRepository } from '../index.js';

export const tenantRoutes = new Hono<SessionEnv>();

// GET /api/v1/tenants/:id/config - Get tenant UI configuration
tenantRoutes.get('/:id/config', async (c) => {
  const requestedTenantId = c.req.param('id');
  const authTenantId = c.get('tenantId');

  // Verify the requested tenant matches the authenticated tenant
  if (requestedTenantId !== authTenantId) {
    return c.json({ error: 'Unauthorized: tenant ID mismatch' }, 403);
  }

  // Fetch from database
  const tenant = await tenantRepository.findById(authTenantId);
  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  // Return UI config from database
  const config = {
    tenantId: tenant.id,
    ...tenant.uiConfig,
  };

  return c.json(config);
});
