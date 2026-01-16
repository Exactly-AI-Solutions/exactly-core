/**
 * Authentication context attached to requests
 */
export interface AuthContext {
  tenantId: string;
  userId?: string;
  roles?: string[];
}

/**
 * Result of authentication validation
 */
export interface AuthResult {
  valid: boolean;
  error?: string;
  context?: AuthContext;
}

/**
 * Auth strategy interface - implement this for different auth methods
 */
export interface AuthStrategy {
  /**
   * Validate a request
   * @param request - The incoming request
   * @param tenantId - The tenant ID from the request
   * @returns AuthResult indicating if the request is valid
   */
  validate(request: Request, tenantId: string): Promise<AuthResult>;
}

/**
 * Tenant lookup function type
 */
export type TenantLookup = (tenantId: string) => Promise<{
  id: string;
  allowedDomains: string[];
} | null>;
