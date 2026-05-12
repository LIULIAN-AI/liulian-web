import { describe, it, expect } from 'vitest';
import {
  filterHomepageHotSearchWords,
  type HomepageHotSearchWord,
} from '@/utils/homepageHotSearchFilter';

function makeItem(overrides: Partial<HomepageHotSearchWord> = {}): HomepageHotSearchWord {
  return {
    keyword: 'test',
    searchType: 'company',
    searchCount: 100,
    logoUrl: '',
    iconType: 'company',
    displayName: 'Test Bank',
    description: 'A test bank',
    ...overrides,
  };
}

describe('filterHomepageHotSearchWords', () => {
  it('returns empty array for non-array input', () => {
    expect(filterHomepageHotSearchWords(null as any)).toEqual([]);
    expect(filterHomepageHotSearchWords(undefined as any)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(filterHomepageHotSearchWords([])).toEqual([]);
  });

  it('keeps valid company items', () => {
    const items = [makeItem({ displayName: 'HSBC', keyword: 'hsbc' })];
    expect(filterHomepageHotSearchWords(items)).toHaveLength(1);
  });

  it('filters out Bank Cler by displayName', () => {
    const items = [
      makeItem({ displayName: 'Bank Cler (formerly Bank Coop)', iconType: 'company' }),
      makeItem({ displayName: 'Good Bank', keyword: 'good' }),
    ];
    const result = filterHomepageHotSearchWords(items);
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('Good Bank');
  });

  it('filters out Bank Cler by keyword', () => {
    const items = [
      makeItem({ keyword: 'bank cler', iconType: 'company', displayName: 'Something' }),
    ];
    expect(filterHomepageHotSearchWords(items)).toHaveLength(0);
  });

  it('only filters when iconType is company', () => {
    const items = [
      makeItem({ keyword: 'bank cler', iconType: 'person', displayName: 'Bank Cler' }),
    ];
    expect(filterHomepageHotSearchWords(items)).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    const items = [
      makeItem({ keyword: 'BANK CLER', iconType: 'COMPANY', displayName: 'X' }),
    ];
    expect(filterHomepageHotSearchWords(items)).toHaveLength(0);
  });

  it('handles items with missing fields gracefully', () => {
    const items = [makeItem({ displayName: '', keyword: '', iconType: '' })];
    expect(filterHomepageHotSearchWords(items)).toHaveLength(1);
  });
});
