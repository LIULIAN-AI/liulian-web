'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchBankHeader,
  fetchComparisonBanks,
  fetchWatchlist,
  fetchLeadership,
  fetchProducts,
  fetchQuarterlyResults,
  fetchAllBankSortIds,
  getSelectedBankSortId,
  setSelectedBankSortId,
  type BankComparisonRow,
  type WatchedBank,
  type LeaderEntry,
  type ProductEntry,
} from '../data/assistantDataService';
import type { CompanyHeader } from '@/app/model/company/company';

export function useSelectedBank() {
  const [sortId, setSortId] = useState<string>(() => getSelectedBankSortId());
  const [bankList, setBankList] = useState<{ sortId: string; name: string }[]>([]);

  useEffect(() => {
    fetchAllBankSortIds().then(setBankList);
  }, []);

  const selectBank = useCallback((newSortId: string) => {
    setSortId(newSortId);
    setSelectedBankSortId(newSortId);
  }, []);

  return { sortId, bankList, selectBank };
}

export function useBankHeader(sortId: string) {
  const [header, setHeader] = useState<CompanyHeader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBankHeader(sortId).then((h) => {
      setHeader(h);
      setLoading(false);
    });
  }, [sortId]);

  return { header, loading };
}

export function useComparisonBanks(sortIds?: string[]) {
  const [banks, setBanks] = useState<BankComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchComparisonBanks(sortIds).then((b) => {
      setBanks(b);
      setLoading(false);
    });
  }, [sortIds?.join(',')]);

  return { banks, loading };
}

export function useWatchlist(sortIds?: string[]) {
  const [watchlist, setWatchlist] = useState<WatchedBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWatchlist(sortIds).then((w) => {
      setWatchlist(w);
      setLoading(false);
    });
  }, [sortIds?.join(',')]);

  return { watchlist, loading };
}

export function useLeadership(sortId: string) {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeadership(sortId).then((l) => {
      setLeaders(l);
      setLoading(false);
    });
  }, [sortId]);

  return { leaders, loading };
}

export function useProducts(sortId: string) {
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProducts(sortId).then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, [sortId]);

  return { products, loading };
}

export function useQuarterlyResults(sortId: string) {
  const [results, setResults] = useState<{ period: string; revenue: string; opex: string; netIncome: string; roe: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchQuarterlyResults(sortId).then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, [sortId]);

  return { results, loading };
}
