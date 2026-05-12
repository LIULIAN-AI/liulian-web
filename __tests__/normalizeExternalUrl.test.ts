import { describe, it, expect } from 'vitest';
import { normalizeExternalUrl } from '@/utils/normalizeExternalUrl';

describe('normalizeExternalUrl', () => {
  it('returns empty string for null', () => {
    expect(normalizeExternalUrl(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(normalizeExternalUrl(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(normalizeExternalUrl('')).toBe('');
  });

  it('returns empty string for whitespace-only string', () => {
    expect(normalizeExternalUrl('   ')).toBe('');
  });

  it('adds https:// to bare domain', () => {
    const result = normalizeExternalUrl('example.com');
    expect(result).toBe('https://example.com/');
  });

  it('preserves existing https://', () => {
    const result = normalizeExternalUrl('https://example.com/path');
    expect(result).toBe('https://example.com/path');
  });

  it('preserves existing http://', () => {
    const result = normalizeExternalUrl('http://example.com');
    expect(result).toBe('http://example.com/');
  });

  it('returns empty for protocol-relative URL (no base to resolve against)', () => {
    expect(normalizeExternalUrl('//example.com/page')).toBe('');
  });

  it('returns empty string for invalid URL', () => {
    expect(normalizeExternalUrl('not a url at all :::')).toBe('');
  });

  it('trims whitespace before processing', () => {
    const result = normalizeExternalUrl('  example.com  ');
    expect(result).toBe('https://example.com/');
  });

  it('preserves query parameters', () => {
    const result = normalizeExternalUrl('https://example.com/search?q=test&page=1');
    expect(result).toBe('https://example.com/search?q=test&page=1');
  });

  it('preserves fragment', () => {
    const result = normalizeExternalUrl('https://example.com/page#section');
    expect(result).toBe('https://example.com/page#section');
  });
});
