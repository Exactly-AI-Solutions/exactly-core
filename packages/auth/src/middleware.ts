import type { Context, Next, MiddlewareHandler } from 'hono';
import type { AuthStrategy, AuthContext } from './types.js';

// Environment type for auth context
export type AuthEnv = {
  Variables: {
    auth: AuthContext;
    tenantId: string;
  };
};

/**
 * Create auth middleware for Hono
 * Returns a middleware function that validates requests using the provided strategy
 */
export function createAuthMiddleware(strategy: AuthStrategy): MiddlewareHandler<AuthEnv> {
  return async (c: Context<AuthEnv>, next: Next) => {
    const tenantId = c.req.header('X-Tenant-Id');

    if (!tenantId) {
      return c.json({ error: 'Missing required header: X-Tenant-Id' }, 400);
    }

    const result = await strategy.validate(c.req.raw, tenantId);

    if (!result.valid) {
      return c.json({ error: result.error || 'Unauthorized' }, 403);
    }

    // Attach auth context and tenant ID to request
    c.set('auth', result.context as AuthContext);
    c.set('tenantId', tenantId);

    await next();
  };
}
