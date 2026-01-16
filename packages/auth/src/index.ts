export type { AuthStrategy, AuthResult, AuthContext, TenantLookup } from './types';
export type { AuthEnv } from './middleware';
export { DomainAuthStrategy } from './strategies/domain';
// Future: export { JWTAuthStrategy } from './strategies/jwt';
export { createAuthMiddleware } from './middleware';
export { isAllowedDomain } from './utils';
