import type { AuthStrategy, AuthResult, TenantLookup } from '../types.js';
import { isAllowedDomain } from '../utils.js';

/**
 * Domain-based authentication strategy
 * Validates that the request origin matches the tenant's allowed domains
 */
export class DomainAuthStrategy implements AuthStrategy {
  private getTenant: TenantLookup;

  constructor(getTenant: TenantLookup) {
    this.getTenant = getTenant;
  }

  async validate(request: Request, tenantId: string): Promise<AuthResult> {
    // Get origin header
    const origin = request.headers.get('origin');

    // Allow requests without origin (e.g., server-to-server)
    // You may want to make this configurable
    if (!origin) {
      // Check referer as fallback
      const referer = request.headers.get('referer');
      if (!referer) {
        return {
          valid: false,
          error: 'Missing Origin or Referer header',
        };
      }
    }

    // Lookup tenant
    const tenant = await this.getTenant(tenantId);

    if (!tenant) {
      return {
        valid: false,
        error: 'Tenant not found',
      };
    }

    // Check if origin is allowed
    const originToCheck = origin || request.headers.get('referer');
    if (!isAllowedDomain(originToCheck, tenant.allowedDomains)) {
      return {
        valid: false,
        error: 'Domain not authorized for this tenant',
      };
    }

    return {
      valid: true,
      context: {
        tenantId: tenant.id,
      },
    };
  }
}
