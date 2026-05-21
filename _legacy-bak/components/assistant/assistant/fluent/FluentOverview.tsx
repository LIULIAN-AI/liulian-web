'use client';

import { useEffect } from 'react';
import { useBankContext } from '@/contexts/BankContext';
import FluentAbout from './FluentAbout';
import { getMockBank } from '../data/mockBanks';
import { getSelectedBankSortId } from '../data/assistantDataService';
import styles from './fluent.module.css';

interface FluentOverviewProps {
  bankSortId?: string;
}

export default function FluentOverview({ bankSortId }: FluentOverviewProps) {
  const sortId = bankSortId ?? getSelectedBankSortId();
  const bankData = getMockBank(sortId);
  const { loadHeaderInfo } = useBankContext();

  useEffect(() => {
    loadHeaderInfo(sortId);
  }, [sortId, loadHeaderInfo]);

  if (!bankData) {
    return <div className={styles.overviewRoot}>Bank not found: {sortId}</div>;
  }

  const { about, header, owners: bankOwners } = bankData;
  const owners = bankOwners ?? [];

  return (
    <div className={styles.overviewRoot}>
      <div className={styles.overviewAboutAndApplication}>
        <div className={styles.overviewAboutSection}>
          <FluentAbout
            sortId={sortId}
            companyId={sortId}
            bankName={header.companyName}
            ceo={about.ceo}
            companySize={about.companySize}
            establishedTime={about.establishedTime}
            founder={about.founder}
            revenue={about.revenue}
            location={about.location}
            bankSwift={about.bankSwift}
            bankCode={about.bankCode}
            owners={owners}
          />
        </div>
      </div>
    </div>
  );
}
