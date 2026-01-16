import { randomBytes } from 'crypto';

const BASE62_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a cryptographically secure, URL-safe share token
 * 32 characters in base62 = ~190 bits of entropy (brute-force resistant)
 */
export function generateShareToken(length: number = 32): string {
  const bytes = randomBytes(length);
  let token = '';

  for (let i = 0; i < length; i++) {
    token += BASE62_CHARSET[bytes[i] % 62];
  }

  return token;
}
