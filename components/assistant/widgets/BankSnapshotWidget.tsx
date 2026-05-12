'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBankContext } from '@/contexts/BankContext';
import { useCanvasContext } from '../hooks/useCanvasContext';
import type { WidgetProps, WidgetInstance } from '../types';
import { useBankHeader } from '../hooks/useAssistantData';
import { getSelectedBankSortId } from '../data/assistantDataService';
import { getMockBank } from '../data/mockBanks';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

type SnapshotTab = 'overview' | 'products' | 'financials' | 'leadership';

const TABS: { key: SnapshotTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '🏦' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'financials', label: 'Financials', icon: '📊' },
  { key: 'leadership', label: 'Leadership', icon: '👥' },
];

export default function BankSnapshotWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
}: WidgetProps) {
  const t = useTranslations('Assistant');
  const [activeTab, setActiveTab] = useState<SnapshotTab>('overview');
  const bankSortId = instance.props?.bankSortId ?? getSelectedBankSortId();
  const { headerInfo: bankCtxHeader } = useBankContext();
  const { header: fallbackHeader } = useBankHeader(bankSortId);
  const headerInfo = instance.props?.bankSortId ? (fallbackHeader ?? bankCtxHeader) : (bankCtxHeader ?? fallbackHeader);
  const bankData = getMockBank(bankSortId);
  const { addWidget, showToast, state: canvasState } = useCanvasContext();

  const handleTabClick = (tab: SnapshotTab) => {
    setActiveTab(tab);
    if (tab === 'products' && !canvasState.activeWidgets.some((w) => w.type === 'product-list')) {
      const widget: WidgetInstance = {
        id: `product-list-${Date.now()}`,
        type: 'product-list',
        title: `${headerInfo?.companyName ?? 'Bank'} Products`,
        props: { bankSortId },
        pinned: false,
        priority: 'contextual',
      };
      addWidget(widget);
      showToast(`Added Products to Canvas`);
    }
    if (tab === 'financials' && !canvasState.activeWidgets.some((w) => w.type === 'bi-chart')) {
      const widget: WidgetInstance = {
        id: `bi-chart-${Date.now()}`,
        type: 'bi-chart',
        title: `${headerInfo?.companyName ?? 'Bank'} Financials`,
        props: { bankSortId },
        pinned: false,
        priority: 'contextual',
      };
      addWidget(widget);
      showToast(`Added Financials to Canvas`);
    }
    if (tab === 'leadership' && !canvasState.activeWidgets.some((w) => w.type === 'leadership')) {
      const widget: WidgetInstance = {
        id: `leadership-${Date.now()}`,
        type: 'leadership',
        title: `${headerInfo?.companyName ?? 'Bank'} Leadership`,
        props: { bankSortId },
        pinned: false,
        priority: 'contextual',
      };
      addWidget(widget);
      showToast(`Added Leadership to Canvas`);
    }
  };

  const handleInlineChat = () => {
    if (headerInfo) {
      onInlineChat({
        component: 'bank-snapshot',
        companyName: headerInfo.companyName,
        location: headerInfo.location,
        tags: headerInfo.tag,
        status: headerInfo.status,
        website: headerInfo.website ?? null,
      });
    } else {
      onInlineChat(instance.props);
    }
  };

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="var(--accent)"
      onInlineChat={handleInlineChat}
      onPin={onPin}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      {headerInfo ? (
        <div className={styles.bankSnapshotContent}>
          <div className={styles.bankSnapshotTabBar}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.bankSnapshotTab} ${activeTab === tab.key ? styles.bankSnapshotTabActive : ''}`}
                onClick={() => handleTabClick(tab.key)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className={styles.bankSnapshotName}>{headerInfo.companyName}</div>

              {headerInfo.status && (
                <div className={styles.bankSnapshotStatusRow}>
                  <span className={styles.bankSnapshotStatusDot} />
                  <span className={styles.bankSnapshotStatusText}>{headerInfo.status}</span>
                </div>
              )}

              {headerInfo.tag && headerInfo.tag.length > 0 && (
                <div className={styles.bankSnapshotTags}>
                  {headerInfo.tag.map((tag) => (
                    <span key={tag} className={styles.bankSnapshotTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.bankSnapshotGrid}>
                {headerInfo.location && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>Location</span>
                    <span className={styles.bankSnapshotGridValue}>{headerInfo.location}</span>
                  </div>
                )}
                {bankData?.about.establishedTime && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>Founded</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.establishedTime}</span>
                  </div>
                )}
                {bankData?.about.ceo && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>CEO</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.ceo}</span>
                  </div>
                )}
                {bankData?.about.revenue && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>Revenue</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.revenue}</span>
                  </div>
                )}
                {bankData?.about.numberOfUser && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>Users</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.numberOfUser}</span>
                  </div>
                )}
                {bankData?.about.bankSwift && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>SWIFT</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.bankSwift}</span>
                  </div>
                )}
                {bankData?.about.companySize && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>Employees</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.companySize}</span>
                  </div>
                )}
                {bankData?.about.bankCode && (
                  <div className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>Bank Code</span>
                    <span className={styles.bankSnapshotGridValue}>{bankData.about.bankCode}</span>
                  </div>
                )}
              </div>

              {headerInfo.website && (
                <div className={styles.bankSnapshotRow}>
                  <span className={styles.bankSnapshotRowIcon}>🌐</span>
                  <a
                    href={headerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.bankSnapshotLink}
                  >
                    {headerInfo.website}
                  </a>
                </div>
              )}
            </>
          )}

          {activeTab === 'products' && bankData && (
            <div className={styles.bankSnapshotProductsTab}>
              {bankData.products.map((p) => (
                <div key={p.productName} className={styles.bankSnapshotProductItem}>
                  <div className={styles.bankSnapshotProductHeader}>
                    <span className={styles.bankSnapshotProductName}>{p.productName}</span>
                    <span className={styles.bankSnapshotProductBadge}>{p.productType}</span>
                  </div>
                  <div className={styles.bankSnapshotProductDesc}>{p.productDescription}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'financials' && bankData && (
            <div className={styles.bankSnapshotFinancialsTab}>
              <div className={styles.bankSnapshotGrid}>
                {Object.entries(bankData.financials).map(([key, value]) => (
                  <div key={key} className={styles.bankSnapshotGridItem}>
                    <span className={styles.bankSnapshotGridLabel}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                    </span>
                    <span className={styles.bankSnapshotGridValue}>{value}</span>
                  </div>
                ))}
              </div>
              {bankData.quarterlyResults.length > 0 && (
                <div className={styles.bankSnapshotQuarterly}>
                  <div className={styles.bankSnapshotQuarterlyTitle}>Quarterly Results</div>
                  <div className={styles.bankSnapshotQuarterlyTable}>
                    <div className={styles.bankSnapshotQuarterlyHeader}>
                      <span>Period</span><span>Revenue</span><span>Net Income</span><span>ROE</span>
                    </div>
                    {bankData.quarterlyResults.map((q) => (
                      <div key={q.period} className={styles.bankSnapshotQuarterlyRow}>
                        <span>{q.period}</span>
                        <span>{q.revenue}</span>
                        <span>{q.netIncome}</span>
                        <span>{q.roe}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leadership' && bankData && (
            <div className={styles.bankSnapshotLeadershipTab}>
              {bankData.management.map((m) => (
                <div key={m.name} className={styles.bankSnapshotLeaderCard}>
                  <div className={styles.bankSnapshotLeaderName}>{m.name}</div>
                  <div className={styles.bankSnapshotLeaderTitle}>{m.title}</div>
                  <div className={styles.bankSnapshotLeaderBg}>{m.background}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.bankSnapshotEmpty}>
          <div className={styles.bankSnapshotEmptyIcon}>🏦</div>
          <div className={styles.bankSnapshotEmptyLabel}>
            {t('widget.bankSnapshot.noBankSelected')}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
