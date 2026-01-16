import type { Context, Next, MiddlewareHandler } from 'hono';
import type { AuthEnv } from '@exactly/auth';

// Extended environment including session
export type SessionEnv = AuthEnv & {
  Variables: AuthEnv['Variables'] & {
    sessionId: string;
  };
};

/**
 * Session middleware for chat API
 * Extracts and validates session ID from headers, or generates a new one
 */
export function sessionMiddleware(): MiddlewareHandler<SessionEnv> {
  return async (c: Context<SessionEnv>, next: Next) => {
    let sessionId = c.req.header('X-Session-Id');

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Validate session ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return c.json({ error: 'Invalid session ID format' }, 400);
    }

    c.set('sessionId', sessionId);

    // Set session ID in response header for client to track
    await next();

    // Add session ID to response headers after route handler
    c.header('X-Session-Id', sessionId);
  };
}
