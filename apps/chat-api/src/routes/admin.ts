import { Hono } from 'hono';
import { tenantRepository, agentConfigRepository } from '../index';
import type { TenantUIConfig } from '@exactly/types';

/**
 * Admin routes for tenant management
 * Protected by API key authentication
 */
export const adminRoutes = new Hono();

// Simple API key auth middleware for admin routes
adminRoutes.use('*', async (c, next) => {
  const apiKey = c.req.header('X-Admin-Key');
  const expectedKey = process.env.ADMIN_API_KEY;

  // In development, allow if no key is configured
  if (!expectedKey) {
    console.warn('[Admin] No ADMIN_API_KEY configured - admin routes unprotected');
    return next();
  }

  if (!apiKey || apiKey !== expectedKey) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return next();
});

// GET /admin/v1/tenants - List all tenants
adminRoutes.get('/tenants', async (c) => {
  const tenants = await tenantRepository.findAll();

  return c.json({
    tenants: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      allowedDomains: t.allowedDomains,
      isActive: t.isActive,
      createdAt: t.createdAt,
    })),
  });
});

// GET /admin/v1/tenants/:id - Get tenant details
adminRoutes.get('/tenants/:id', async (c) => {
  const id = c.req.param('id');
  const tenant = await tenantRepository.findById(id);

  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  const agentConfig = await agentConfigRepository.findByTenantId(id);

  return c.json({
    tenant: {
      id: tenant.id,
      name: tenant.name,
      allowedDomains: tenant.allowedDomains,
      uiConfig: tenant.uiConfig,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
    },
    agentConfig: agentConfig
      ? {
          id: agentConfig.id,
          model: agentConfig.model,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
          systemPrompt: agentConfig.systemPrompt,
          instructions: agentConfig.instructions,
        }
      : null,
  });
});

// POST /admin/v1/tenants - Create a new tenant
adminRoutes.post('/tenants', async (c) => {
  const body = await c.req.json();
  const { id, name, allowedDomains, uiConfig, agentConfig } = body;

  // Validate required fields
  if (!id || typeof id !== 'string') {
    return c.json({ error: 'id is required and must be a string' }, 400);
  }
  if (!name || typeof name !== 'string') {
    return c.json({ error: 'name is required and must be a string' }, 400);
  }
  if (!allowedDomains || !Array.isArray(allowedDomains)) {
    return c.json({ error: 'allowedDomains is required and must be an array' }, 400);
  }

  // Check if tenant already exists
  const existing = await tenantRepository.findById(id);
  if (existing) {
    return c.json({ error: 'Tenant with this ID already exists' }, 409);
  }

  // Default UI config
  const defaultUiConfig: TenantUIConfig = {
    theme: {
      primaryColor: '#0066FF',
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      borderRadius: 12,
      position: 'bottom-right',
    },
    greeting: 'Hi! How can I help you today?',
    placeholderText: 'Type a message...',
    suggestedPrompts: [],
    components: {
      suggestions: true,
      quickActions: false,
      feedbackButtons: true,
      typingIndicator: true,
      fileUpload: false,
    },
  };

  try {
    // Create tenant
    const tenant = await tenantRepository.create({
      id,
      name,
      allowedDomains,
      uiConfig: uiConfig || defaultUiConfig,
      isActive: true,
    });

    // Create agent config if provided
    if (agentConfig) {
      await agentConfigRepository.create({
        id: `${id}-agent`,
        tenantId: id,
        model: agentConfig.model || 'gpt-4o-mini',
        temperature: agentConfig.temperature || '0.7',
        maxTokens: agentConfig.maxTokens || 1024,
        systemPrompt: agentConfig.systemPrompt || 'You are a helpful assistant.',
        instructions: agentConfig.instructions || [],
      });
    }

    return c.json({ tenant, created: true }, 201);
  } catch (error) {
    console.error('Failed to create tenant:', error);
    return c.json({ error: 'Failed to create tenant' }, 500);
  }
});

// PUT /admin/v1/tenants/:id - Update a tenant
adminRoutes.put('/tenants/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const tenant = await tenantRepository.findById(id);
  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  const { name, allowedDomains, uiConfig, isActive } = body;

  try {
    const updated = await tenantRepository.update(id, {
      name: name ?? tenant.name,
      allowedDomains: allowedDomains ?? tenant.allowedDomains,
      uiConfig: uiConfig ?? tenant.uiConfig,
      isActive: isActive ?? tenant.isActive,
    });

    return c.json({ tenant: updated });
  } catch (error) {
    console.error('Failed to update tenant:', error);
    return c.json({ error: 'Failed to update tenant' }, 500);
  }
});

// DELETE /admin/v1/tenants/:id - Soft delete (deactivate) a tenant
adminRoutes.delete('/tenants/:id', async (c) => {
  const id = c.req.param('id');

  const tenant = await tenantRepository.findById(id);
  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  try {
    await tenantRepository.update(id, { isActive: false });
    return c.json({ success: true, message: 'Tenant deactivated' });
  } catch (error) {
    console.error('Failed to deactivate tenant:', error);
    return c.json({ error: 'Failed to deactivate tenant' }, 500);
  }
});

// GET /admin/v1/tenants/:id/embed - Get embed code for a tenant
adminRoutes.get('/tenants/:id/embed', async (c) => {
  const id = c.req.param('id');
  const tenant = await tenantRepository.findById(id);

  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404);
  }

  const apiUrl = process.env.PUBLIC_API_URL || 'https://api.exactly.ai';
  const cdnUrl = process.env.PUBLIC_CDN_URL || 'https://exactly.ai';

  const embedCode = `<script
  src="${cdnUrl}/embed/chat-widget.js"
  data-tenant-id="${id}"
  data-api-url="${apiUrl}"
  async>
</script>`;

  return c.json({
    tenantId: id,
    embedCode,
    apiUrl,
    cdnUrl,
  });
});
