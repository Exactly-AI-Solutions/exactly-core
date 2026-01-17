/**
 * Homepage Scraper Utility
 * Fetches and preprocesses HTML from a given URL for AI analysis
 */

// Minimal Response interface to avoid DOM type dependency
interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
}

// Attributes to keep when preprocessing HTML
const SAFE_ATTRS = new Set(['href', 'src', 'alt', 'title', 'type']);

/**
 * Remove HTML tags from a string
 */
function stripTag(html: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'gi');
  return html.replace(regex, '');
}

/**
 * Remove HTML comments from a string
 */
function stripComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Remove unwanted attributes from HTML tags, keeping only safe ones
 */
function stripAttributes(html: string): string {
  // Match opening tags with attributes
  return html.replace(/<(\w+)([^>]*)>/g, (match, tagName, attrs) => {
    if (!attrs.trim()) return match;

    // Extract and filter attributes
    const safeAttrs: string[] = [];
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const [, attrName, attrValue] = attrMatch;
      if (SAFE_ATTRS.has(attrName.toLowerCase())) {
        safeAttrs.push(`${attrName}="${attrValue}"`);
      }
    }

    return safeAttrs.length > 0 ? `<${tagName} ${safeAttrs.join(' ')}>` : `<${tagName}>`;
  });
}

/**
 * Preprocess HTML by removing scripts, styles, comments, and unnecessary attributes
 * This produces clean, AI-friendly HTML for analysis
 */
export function preprocessHtml(html: string): string {
  // Remove script tags
  let cleaned = stripTag(html, 'script');

  // Remove style tags
  cleaned = stripTag(cleaned, 'style');

  // Remove noscript tags
  cleaned = stripTag(cleaned, 'noscript');

  // Remove HTML comments
  cleaned = stripComments(cleaned);

  // Remove unwanted attributes
  cleaned = stripAttributes(cleaned);

  // Normalize whitespace (collapse multiple spaces/newlines)
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * User agents to rotate for scraping
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

/**
 * Get a random user agent
 */
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Fetch and preprocess HTML from a given URL
 * @param url - The URL to fetch
 * @param timeout - Timeout in milliseconds (default: 20000)
 * @returns Preprocessed HTML content
 */
export async function scrapeHomepage(url: string, timeout = 20000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = (await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal as AbortSignal,
    })) as unknown as FetchResponse;

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return preprocessHtml(html);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Normalize a URL to ensure it has a protocol
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
