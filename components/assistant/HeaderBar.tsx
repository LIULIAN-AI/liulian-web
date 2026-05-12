'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Settings, User } from 'lucide-react';
import BankSelector from './BankSelector';
import styles from './assistant.module.css';

export default function HeaderBar() {
  const t = useTranslations('Assistant');
  return (
    <header className={styles.headerBar}>
      <div className={styles.headerLogo}>Neobanker</div>
      <BankSelector />
      <div className={styles.headerActions}>
        <button className={styles.headerActionBtn} title="Settings">
          <Settings size={18} />
        </button>
        <button className={styles.headerActionBtn} title="User">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
