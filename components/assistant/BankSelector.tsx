'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Building2, X } from 'lucide-react';
import { useBankContext } from '@/contexts/BankContext';
import { useCanvasContext } from './hooks/useCanvasContext';
import { getAllMockBanks } from './data/mockBanks';
import { setSelectedBankSortId, getSelectedBankSortId } from './data/assistantDataService';
import type { WidgetInstance } from './types';
import styles from './assistant.module.css';

export default function BankSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loadHeaderInfo } = useBankContext();
  const { dispatch, showToast } = useCanvasContext();

  const banks = useMemo(() => {
    return getAllMockBanks().map((b) => ({
      sortId: b.sortId,
      name: b.header.companyName,
      swift: b.about.bankSwift,
      region: b.about.location,
      status: b.header.status,
    }));
  }, []);

  const [selectedSortId, setSelectedSortId] = useState(() => getSelectedBankSortId());
  const selected = banks.find((b) => b.sortId === selectedSortId) ?? banks[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const sortId = (e as CustomEvent<string>).detail;
      setSelectedSortId(sortId);
      loadHeaderInfo(sortId);
    };
    window.addEventListener('bankSortIdChanged', handler);
    return () => window.removeEventListener('bankSortIdChanged', handler);
  }, [loadHeaderInfo]);

  const filtered = banks.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.swift.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectBank = (bank: typeof banks[number]) => {
    setSelectedSortId(bank.sortId);
    setSelectedBankSortId(bank.sortId);
    loadHeaderInfo(bank.sortId);
    setIsOpen(false);
    setSearch('');

    const snapshotWidget: WidgetInstance = {
      id: `bank-snapshot-${Date.now()}`,
      type: 'bank-snapshot',
      title: `${bank.name} Overview`,
      props: { bankSortId: bank.sortId },
      pinned: false,
      priority: 'active',
    };
    const aboutWidget: WidgetInstance = {
      id: `fluent-about-${Date.now()}`,
      type: 'fluent-about',
      title: `${bank.name} About`,
      props: { bankSortId: bank.sortId },
      pinned: false,
      priority: 'active',
    };

    dispatch({ type: 'RESET_CANVAS' });
    dispatch({ type: 'ADD_WIDGET', widget: snapshotWidget });
    dispatch({ type: 'ADD_WIDGET', widget: aboutWidget });
    showToast(`Switched to ${bank.name}`);
  };

  return (
    <div className={styles.bankSelector} ref={dropdownRef}>
      <button className={styles.bankSelectorTrigger} onClick={() => setIsOpen(!isOpen)}>
        <Building2 size={14} />
        <span className={styles.bankSelectorName}>{selected.name}</span>
        <span className={styles.bankSelectorStatus} data-status={selected.status?.toLowerCase()}>{selected.status}</span>
        <ChevronDown size={14} className={isOpen ? styles.bankSelectorChevronOpen : ''} />
      </button>
      {isOpen && (
        <div className={styles.bankSelectorDropdown}>
          <div className={styles.bankSelectorSearchRow}>
            <Search size={14} />
            <input
              className={styles.bankSelectorSearchInput}
              placeholder="Search bank name or SWIFT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className={styles.bankSelectorClearBtn} onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>
          <div className={styles.bankSelectorList}>
            {filtered.map((bank) => (
              <button
                key={bank.sortId}
                className={`${styles.bankSelectorItem} ${
                  selected.sortId === bank.sortId ? styles.bankSelectorItemActive : ''
                }`}
                onClick={() => handleSelectBank(bank)}
              >
                <div className={styles.bankSelectorItemName}>{bank.name}</div>
                <div className={styles.bankSelectorItemMeta}>{bank.swift} · {bank.region}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className={styles.bankSelectorEmpty}>No banks found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
