import { MOCK_BANKS, getMockBank, type MockBankData } from './mockBanks';
import type { CompanyHeader } from '@/app/model/company/company';

const USE_MOCK = true;

export interface BankComparisonRow {
  name: string;
  location: string;
  status: string;
  revenue: string;
  assets: string;
  employees: string;
  founded: string;
  users: string;
  roe: string;
  costToIncome: string;
  nplRatio: string;
  license: string;
}

export interface WatchedBank {
  name: string;
  metrics: {
    label: string;
    value: number;
    unit: string;
    change: number;
    threshold?: number;
    breached?: boolean;
  }[];
}

export interface LeaderEntry {
  name: string;
  title: string;
  tenure: string;
  background: string;
}

export interface ProductEntry {
  productName: string;
  productType: string;
  productDescription: string;
  clientTag: string;
  customerSegment: 'retail' | 'corporate';
  productLink?: string;
}

function bankToComparisonRow(b: MockBankData): BankComparisonRow {
  return {
    name: b.header.companyName,
    location: b.about.location,
    status: b.header.status,
    revenue: b.about.revenue,
    assets: b.financials.assets,
    employees: b.about.companySize,
    founded: b.about.establishedTime,
    users: b.about.numberOfUser,
    roe: b.financials.roe,
    costToIncome: b.financials.costToIncome,
    nplRatio: b.financials.nplRatio,
    license: 'Virtual Bank',
  };
}

function bankToWatched(b: MockBankData): WatchedBank {
  return { name: b.header.companyName, metrics: b.watchMetrics };
}

function bankToLeaders(b: MockBankData): LeaderEntry[] {
  return b.management.map((m) => ({
    name: m.name,
    title: m.title,
    tenure: `Since ${m.joinedAt.split('-')[0]}`,
    background: m.background,
  }));
}

// --- Public API (swap USE_MOCK → false + implement real fetchers) ---

export async function fetchBankHeader(sortId: string): Promise<CompanyHeader | null> {
  if (USE_MOCK) {
    const bank = getMockBank(sortId);
    return bank?.header ?? null;
  }
  // TODO: return await getNewHeader({ companySortId: sortId, userId: null });
  return null;
}

export async function fetchComparisonBanks(sortIds?: string[]): Promise<BankComparisonRow[]> {
  if (USE_MOCK) {
    const banks = sortIds
      ? MOCK_BANKS.filter((b) => sortIds.includes(b.sortId))
      : MOCK_BANKS;
    return banks.map(bankToComparisonRow);
  }
  return [];
}

export async function fetchWatchlist(sortIds?: string[]): Promise<WatchedBank[]> {
  if (USE_MOCK) {
    const banks = sortIds
      ? MOCK_BANKS.filter((b) => sortIds.includes(b.sortId))
      : MOCK_BANKS;
    return banks.map(bankToWatched);
  }
  return [];
}

export async function fetchLeadership(sortId: string): Promise<LeaderEntry[]> {
  if (USE_MOCK) {
    const bank = getMockBank(sortId);
    return bank ? bankToLeaders(bank) : [];
  }
  return [];
}

export async function fetchProducts(sortId: string): Promise<ProductEntry[]> {
  if (USE_MOCK) {
    const bank = getMockBank(sortId);
    return bank?.products ?? [];
  }
  return [];
}

export async function fetchQuarterlyResults(sortId: string) {
  if (USE_MOCK) {
    const bank = getMockBank(sortId);
    return bank?.quarterlyResults ?? [];
  }
  return [];
}

export async function fetchAllBankSortIds(): Promise<{ sortId: string; name: string }[]> {
  if (USE_MOCK) {
    return MOCK_BANKS.map((b) => ({ sortId: b.sortId, name: b.header.companyName }));
  }
  return [];
}

export function getSelectedBankSortId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('assistant_selected_bank') ?? 'demo-bank';
  }
  return 'demo-bank';
}

export function setSelectedBankSortId(sortId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('assistant_selected_bank', sortId);
    window.dispatchEvent(new CustomEvent('bankSortIdChanged', { detail: sortId }));
  }
}
