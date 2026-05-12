import { describe, it, expect } from 'vitest';
import { resolveAssetUrl } from '@/utils/resolveAssetUrl';

describe('resolveAssetUrl', () => {
  const base = 'https://cdn.example.com';

  it('returns empty string for null', () => {
    expect(resolveAssetUrl(null, base)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(resolveAssetUrl(undefined, base)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(resolveAssetUrl('', base)).toBe('');
  });

  it('returns empty string for whitespace-only', () => {
    expect(resolveAssetUrl('   ', base)).toBe('');
  });

  it('passes through absolute https URL', () => {
    const url = 'https://other.com/image.png';
    expect(resolveAssetUrl(url, base)).toBe(url);
  });

  it('passes through absolute http URL', () => {
    const url = 'http://other.com/image.png';
    expect(resolveAssetUrl(url, base)).toBe(url);
  });

  it('passes through data: URI', () => {
    const url = 'data:image/png;base64,abc123';
    expect(resolveAssetUrl(url, base)).toBe(url);
  });

  it('passes through blob: URI', () => {
    const url = 'blob:https://example.com/uuid';
    expect(resolveAssetUrl(url, base)).toBe(url);
  });

  it('adds https: to protocol-relative URL', () => {
    const result = resolveAssetUrl('//other.com/img.png', base);
    expect(result).toBe('https://other.com/img.png');
  });

  it('resolves relative path against baseUrl', () => {
    const result = resolveAssetUrl('/images/logo.png', base);
    expect(result).toBe('https://cdn.example.com/images/logo.png');
  });

  it('rewrites known asset host', () => {
    const url = 'http://124.193.170.132:9000/bucket/logo.png';
    const result = resolveAssetUrl(url, base);
    expect(result).not.toContain('124.193.170.132');
    expect(result).toContain('/bucket/logo.png');
  });

  it('returns raw input for unparseable relative URL', () => {
    const result = resolveAssetUrl('not-a-url', ':::invalid-base');
    expect(result).toBe('not-a-url');
  });
});
