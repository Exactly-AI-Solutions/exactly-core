import { Hono } from 'hono';
import type { SessionEnv } from '../middleware/index.js';
import { handoffRepository } from '../index.js';
import type {
  CreateHandoffRequest,
  CreateHandoffResponse,
  ValidateHandoffResponse,
} from '@exactly/types';

// Default expiration: 7 days in seconds
const DEFAULT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

/**
 * Protected handoff routes (require tenant auth)
 */
export const handoffRoutes = new Hono<SessionEnv>();

// POST /api/v1/handoffs - Create a new handoff
handoffRoutes.post('/', async (c) => {
  const tenantId = c.get('tenantId');

  const body = await c.req.json<CreateHandoffRequest>();
  const { context, metadata, expiresInSeconds, maxUses } = body;

  // Validate required fields
  if (!context || typeof context !== 'string' || context.trim().length === 0) {
    return c.json({ error: 'context is required and must be a non-empty string' }, 400);
  }

  // Calculate expiration
  const expiresIn = expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS;
  if (expiresIn < 60 || expiresIn > 30 * 24 * 60 * 60) {
    return c.json({ error: 'expiresInSeconds must be between 60 and 2592000 (30 days)' }, 400);
  }

  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Validate maxUses if provided
  if (maxUses !== undefined && maxUses !== null) {
    if (!Number.isInteger(maxUses) || maxUses < 1) {
      return c.json({ error: 'maxUses must be a positive integer' }, 400);
    }
  }

  try {
    const handoff = await handoffRepository.create({
      tenantId,
      context: context.trim(),
      metadata: metadata ?? {},
      expiresAt,
      maxUses: maxUses ?? null,
    });

    // Construct share URL using the public homepage URL
    const baseUrl = process.env.PUBLIC_HOMEPAGE_URL || 'https://exactly.ai';
    const shareUrl = `${baseUrl}?handoff=${handoff.shareToken}`;

    const response: CreateHandoffResponse = {
      id: handoff.id,
      shareToken: handoff.shareToken,
      shareUrl,
      expiresAt: handoff.expiresAt.toISOString(),
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Failed to create handoff:', error);
    return c.json({ error: 'Failed to create handoff' }, 500);
  }
});

// DELETE /api/v1/handoffs/:id - Deactivate a handoff
handoffRoutes.delete('/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');

  try {
    // Verify handoff belongs to tenant
    const handoff = await handoffRepository.findById(id);
    if (!handoff) {
      return c.json({ error: 'Handoff not found' }, 404);
    }
    if (handoff.tenantId !== tenantId) {
      return c.json({ error: 'Handoff not found' }, 404);
    }

    await handoffRepository.deactivate(id);
    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to deactivate handoff:', error);
    return c.json({ error: 'Failed to deactivate handoff' }, 500);
  }
});

/**
 * Public handoff validation route (no auth required)
 * Used by widget to validate token before establishing session
 */
export const publicHandoffRoutes = new Hono();

// GET /api/v1/handoffs/validate/:token - Validate a handoff token
publicHandoffRoutes.get('/validate/:token', async (c) => {
  const token = c.req.param('token');

  if (!token || token.length !== 32) {
    const response: ValidateHandoffResponse = {
      valid: false,
      error: 'Invalid token format',
    };
    return c.json(response, 400);
  }

  try {
    const handoff = await handoffRepository.findValidByToken(token);

    if (!handoff) {
      const response: ValidateHandoffResponse = {
        valid: false,
        error: 'Token is invalid, expired, or has reached maximum uses',
      };
      return c.json(response, 404);
    }

    const response: ValidateHandoffResponse = {
      valid: true,
      handoffId: handoff.id,
      tenantId: handoff.tenantId,
    };
    return c.json(response);
  } catch (error) {
    console.error('Failed to validate handoff:', error);
    const response: ValidateHandoffResponse = {
      valid: false,
      error: 'Failed to validate token',
    };
    return c.json(response, 500);
  }
});
