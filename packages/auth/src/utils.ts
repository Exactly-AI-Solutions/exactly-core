/**
 * Check if an origin is allowed for a tenant
 * Supports exact matches and wildcard subdomains (*.example.com)
 */
export function isAllowedDomain(
  origin: string | null,
  allowedDomains: string[]
): boolean {
  if (!origin) {
    return false;
  }

  let hostname: string;
  try {
    const url = new URL(origin);
    hostname = url.hostname;
  } catch {
    // If origin is not a valid URL, try using it as hostname directly
    hostname = origin;
  }

  return allowedDomains.some((pattern) => {
    if (pattern.startsWith('*.')) {
      // Wildcard pattern: *.example.com matches sub.example.com
      const baseDomain = pattern.slice(2); // Remove "*."

      // Check if hostname ends with the base domain
      // and either equals it or has a subdomain
      if (hostname === baseDomain) {
        return true;
      }

      if (hostname.endsWith(`.${baseDomain}`)) {
        return true;
      }

      return false;
    }

    // Exact match
    return hostname === pattern;
  });
}

/**
 * Extract hostname from origin or referer header
 */
export function extractHostname(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).hostname;
    } catch {
      return null;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).hostname;
    } catch {
      return null;
    }
  }

  return null;
}
