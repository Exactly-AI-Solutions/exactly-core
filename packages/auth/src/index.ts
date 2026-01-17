export type { AuthStrategy, AuthResult, AuthContext, TenantLookup } from './types.js';
export type { AuthEnv } from './middleware.js';
export { DomainAuthStrategy } from './strategies/domain.js';
// Future: export { JWTAuthStrategy } from './strategies/jwt';
export { createAuthMiddleware } from './middleware.js';
export { isAllowedDomain } from './utils.js';
