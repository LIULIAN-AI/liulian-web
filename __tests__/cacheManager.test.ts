import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/config/environment', () => ({
  config: {
    cacheDuration: 300000,
    cacheCleanupInterval: 60000,
  },
}));

const { cacheManager, cacheKeys } = await import('@/utils/cacheManager');

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.clear();
  });

  afterEach(() => {
    cacheManager.clear();
  });

  it('set + get returns cached value', () => {
    cacheManager.set('key1', { name: 'test' });
    expect(cacheManager.get('key1')).toEqual({ name: 'test' });
  });

  it('get returns null for missing key', () => {
    expect(cacheManager.get('nonexistent')).toBeNull();
  });

  it('has returns true for existing key', () => {
    cacheManager.set('key1', 'value');
    expect(cacheManager.has('key1')).toBe(true);
  });

  it('has returns false for missing key', () => {
    expect(cacheManager.has('nonexistent')).toBe(false);
  });

  it('returns null for expired entry', () => {
    vi.useFakeTimers();
    cacheManager.set('key1', 'value', 100);
    vi.advanceTimersByTime(101);
    expect(cacheManager.get('key1')).toBeNull();
    vi.useRealTimers();
  });

  it('has returns false for expired entry', () => {
    vi.useFakeTimers();
    cacheManager.set('key1', 'value', 100);
    vi.advanceTimersByTime(101);
    expect(cacheManager.has('key1')).toBe(false);
    vi.useRealTimers();
  });

  it('delete removes entry', () => {
    cacheManager.set('key1', 'value');
    expect(cacheManager.delete('key1')).toBe(true);
    expect(cacheManager.get('key1')).toBeNull();
  });

  it('delete returns false for missing key', () => {
    expect(cacheManager.delete('nonexistent')).toBe(false);
  });

  it('clear removes all entries', () => {
    cacheManager.set('a', 1);
    cacheManager.set('b', 2);
    cacheManager.clear();
    expect(cacheManager.size()).toBe(0);
  });

  it('size returns number of entries', () => {
    cacheManager.set('a', 1);
    cacheManager.set('b', 2);
    expect(cacheManager.size()).toBe(2);
  });

  it('cleanup removes expired entries only', () => {
    vi.useFakeTimers();
    cacheManager.set('short', 'value', 50);
    cacheManager.set('long', 'value', 5000);
    vi.advanceTimersByTime(100);
    cacheManager.cleanup();
    expect(cacheManager.has('short')).toBe(false);
    expect(cacheManager.has('long')).toBe(true);
    vi.useRealTimers();
  });

  it('setPromise + getPromise round-trips', async () => {
    const p = Promise.resolve('result');
    cacheManager.setPromise('pkey', p);
    expect(cacheManager.getPromise('pkey')).toBe(p);
  });

  it('getPromise returns null for missing key', () => {
    expect(cacheManager.getPromise('nope')).toBeNull();
  });

  it('updatePromiseResult replaces data and removes promise', () => {
    const p = Promise.resolve('initial');
    cacheManager.setPromise('pkey', p);
    cacheManager.updatePromiseResult('pkey', 'resolved');
    expect(cacheManager.get('pkey')).toBe('resolved');
    expect(cacheManager.getPromise('pkey')).toBeNull();
  });
});

describe('cacheKeys', () => {
  it('generates header key', () => {
    expect(cacheKeys.header('abc')).toBe('header-abc');
  });

  it('generates management key with pagination', () => {
    expect(cacheKeys.management('abc', 1, 10)).toBe('management-abc-1-10');
  });

  it('generates overview key', () => {
    expect(cacheKeys.overview('xyz')).toBe('overview-xyz');
  });
});
