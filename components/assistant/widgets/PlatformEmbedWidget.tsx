'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import { useBankHeader, useProducts, useLeadership, useQuarterlyResults } from '../hooks/useAssistantData';
import { getSelectedBankSortId } from '../data/assistantDataService';
import { getMockBank } from '../data/mockBanks';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

type EmbedTab = 'overview' | 'products' | 'financials' | 'staff' | 'marketing';

const TABS: { key: EmbedTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'products', label: 'Products' },
  { key: 'financials', label: 'Financials' },
  { key: 'staff', label: 'Staff' },
  { key: 'marketing', label: 'Marketing' },
];

export default function PlatformEmbedWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
  onConfigure,
}: WidgetProps) {
  const t = useTranslations('Assistant');
  const [activeTab, setActiveTab] = useState<EmbedTab>('overview');
  const bankSortId = instance.props?.bankSortId ?? getSelectedBankSortId();

  const { header } = useBankHeader(bankSortId);
  const { products } = useProducts(bankSortId);
  const { leaders } = useLeadership(bankSortId);
  const { results: quarterly } = useQuarterlyResults(bankSortId);
  const bankData = getMockBank(bankSortId);

  const bankName = header?.companyName ?? 'Bank';

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#0ea5e9"
      onInlineChat={() => onInlineChat({
        component: 'platform-embed',
        tab: activeTab,
        bankName,
      })}
      onPin={onPin}
      onConfigure={onConfigure}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.platformBody}>
        <div className={styles.platformTabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.platformTab} ${activeTab === tab.key ? styles.platformTabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.platformContent}>
          {activeTab === 'overview' && header && bankData && (
            <div className={styles.platformSection}>
              <div className={styles.platformBankHeader}>
                <span className={styles.platformBankName}>{header.companyName}</span>
                <span className={styles.platformBadge} data-status="live">{header.status}</span>
                <span className={styles.platformBadge}>Virtual Bank</span>
              </div>
              <div className={styles.platformMeta}>
                <span>{header.location}</span>
                <span>Founded {bankData.about.establishedTime}</span>
                <span>{bankData.about.numberOfUser} users</span>
              </div>
              <div className={styles.platformKpiGrid}>
                {[
                  { label: 'Total Assets', value: bankData.financials.assets },
                  { label: 'Revenue', value: bankData.about.revenue },
                  { label: 'ROE', value: bankData.financials.roe },
                  { label: 'Cost/Income', value: bankData.financials.costToIncome },
                ].map((kpi) => (
                  <div key={kpi.label} className={styles.platformKpiCard}>
                    <div className={styles.platformKpiLabel}>{kpi.label}</div>
                    <div className={styles.platformKpiValue}>{kpi.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className={styles.platformSection}>
              <table className={styles.platformTable}>
                <thead>
                  <tr><th>Product</th><th>Type</th><th>Segment</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.productName}>
                      <td className={styles.platformCellBold}>{p.productName}</td>
                      <td>{p.productType}</td>
                      <td>{p.clientTag}</td>
                      <td><span className={styles.platformBadge} data-status="active">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className={styles.platformSection}>
              <table className={styles.platformTable}>
                <thead>
                  <tr><th>Period</th><th>Revenue</th><th>OpEx</th><th>Net Income</th><th>ROE</th></tr>
                </thead>
                <tbody>
                  {quarterly.map((f) => (
                    <tr key={f.period}>
                      <td className={styles.platformCellBold}>{f.period}</td>
                      <td>{f.revenue}</td>
                      <td>{f.opex}</td>
                      <td>{f.netIncome}</td>
                      <td>{f.roe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className={styles.platformSection}>
              <div className={styles.platformStaffGrid}>
                {leaders.map((s) => (
                  <div key={s.name} className={styles.platformStaffCard}>
                    <div className={styles.platformStaffAvatar}>{s.name[0]}</div>
                    <div>
                      <div className={styles.platformStaffName}>{s.name}</div>
                      <div className={styles.platformStaffRole}>{s.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'marketing' && bankData && (
            <div className={styles.platformSection}>
              <table className={styles.platformTable}>
                <thead>
                  <tr><th>Campaign</th><th>Channel</th><th>Status</th><th>Reach</th></tr>
                </thead>
                <tbody>
                  {bankData.campaigns.map((m) => (
                    <tr key={m.name}>
                      <td className={styles.platformCellBold}>{m.name}</td>
                      <td>{m.channel}</td>
                      <td><span className={styles.platformBadge} data-status={m.status.toLowerCase()}>{m.status}</span></td>
                      <td>{m.reach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}
