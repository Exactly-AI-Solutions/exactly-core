import type { AuthStrategy, AuthResult } from '../types';

/**
 * JWT authentication strategy (placeholder for future implementation)
 * Will validate JWTs from the API Gateway
 */
export class JWTAuthStrategy implements AuthStrategy {
  // private secret: string;

  constructor(_config: { secret: string }) {
    // this.secret = config.secret;
  }

  async validate(_request: Request, tenantId: string): Promise<AuthResult> {
    // TODO: Implement JWT validation
    // const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return { valid: false, error: 'Missing authorization header' };
    // }
    // const decoded = await verifyJWT(token, this.secret);
    // return {
    //   valid: true,
    //   context: {
    //     tenantId,
    //     userId: decoded.sub,
    //     roles: decoded.roles,
    //   },
    // };

    // For now, just return valid (placeholder)
    return {
      valid: true,
      context: { tenantId },
    };
  }
}
