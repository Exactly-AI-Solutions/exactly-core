import { describe, expect, test } from 'bun:test';
import { isAllowedDomain } from './utils.js';

describe('isAllowedDomain', () => {
  test('exact match', () => {
    expect(isAllowedDomain('https://example.com', ['example.com'])).toBe(true);
    expect(isAllowedDomain('https://example.com', ['other.com'])).toBe(false);
  });

  test('wildcard subdomain match', () => {
    expect(
      isAllowedDomain('https://app.example.com', ['*.example.com'])
    ).toBe(true);
    expect(
      isAllowedDomain('https://api.example.com', ['*.example.com'])
    ).toBe(true);
    expect(
      isAllowedDomain('https://example.com', ['*.example.com'])
    ).toBe(true);
    expect(
      isAllowedDomain('https://notexample.com', ['*.example.com'])
    ).toBe(false);
  });

  test('multiple allowed domains', () => {
    const allowed = ['example.com', '*.example.org', 'localhost'];
    expect(isAllowedDomain('https://example.com', allowed)).toBe(true);
    expect(isAllowedDomain('https://app.example.org', allowed)).toBe(true);
    expect(isAllowedDomain('http://localhost', allowed)).toBe(true);
    expect(isAllowedDomain('https://other.com', allowed)).toBe(false);
  });

  test('null origin returns false', () => {
    expect(isAllowedDomain(null, ['example.com'])).toBe(false);
  });

  test('empty allowed domains returns false', () => {
    expect(isAllowedDomain('https://example.com', [])).toBe(false);
  });
});
