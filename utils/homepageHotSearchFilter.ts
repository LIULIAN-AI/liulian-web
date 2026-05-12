export interface HomepageHotSearchWord {
  keyword: string;
  searchType: string;
  searchCount: number;
  logoUrl: string;
  iconType: string;
  displayName: string;
  description: string;
}

function isInvalidCompanyExampleBank(item: HomepageHotSearchWord): boolean {
  const normalizedDisplayName = (item.displayName || '').trim().toLowerCase();
  const normalizedKeyword = (item.keyword || '').trim().toLowerCase();
  const normalizedIconType = (item.iconType || '').trim().toLowerCase();

  return (
    normalizedIconType === 'company' &&
    (
      normalizedDisplayName === 'bank cler (formerly bank coop)' ||
      normalizedKeyword === 'bank cler'
    )
  );
}

export function filterHomepageHotSearchWords(items: HomepageHotSearchWord[]): HomepageHotSearchWord[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item) => !isInvalidCompanyExampleBank(item));
}
