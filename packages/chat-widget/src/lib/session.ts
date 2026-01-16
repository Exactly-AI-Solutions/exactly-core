const SESSION_KEY_PREFIX = 'exactly-chat-session-';

/**
 * Get or create a session ID for a tenant
 * Stored in localStorage, scoped per tenant
 */
export function getOrCreateSession(tenantId: string): string {
  const key = `${SESSION_KEY_PREFIX}${tenantId}`;

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Get the current session ID for a tenant
 * Returns null if no session exists
 */
export function getSession(tenantId: string): string | null {
  const key = `${SESSION_KEY_PREFIX}${tenantId}`;
  return localStorage.getItem(key);
}

/**
 * Clear the session for a tenant
 */
export function clearSession(tenantId: string): void {
  const key = `${SESSION_KEY_PREFIX}${tenantId}`;
  localStorage.removeItem(key);
}
