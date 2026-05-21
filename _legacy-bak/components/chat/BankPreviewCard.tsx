'use client';

import { useMemo, useCallback } from 'react';
import { useOptionalCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import { getAllMockBanks } from '@/components/assistant/data/mockBanks';
import styles from './chat.module.css';

interface BankPreviewCardProps {
  messageContent: string;
}

function detectBankInMessage(text: string) {
  const lower = text.toLowerCase();
  for (const bank of getAllMockBanks()) {
    if (lower.includes(bank.header.companyName.toLowerCase())) {
      return bank;
    }
  }
  return null;
}

export default function BankPreviewCard({ messageContent }: BankPreviewCardProps) {
  const canvasCtx = useOptionalCanvasContext();

  const bank = useMemo(() => detectBankInMessage(messageContent), [messageContent]);

  const handleViewInCanvas = useCallback(() => {
    if (!canvasCtx) return;
    if (canvasCtx.state.canvasCollapsed) {
      canvasCtx.dispatch({ type: 'SET_CANVAS_PANEL', collapsed: false });
    }
  }, [canvasCtx]);

  if (!bank) return null;

  return (
    <div className={styles.bankPreviewCard}>
      <div className={styles.bankPreviewHeader}>
        <span className={styles.bankPreviewIcon}>🏦</span>
        <div className={styles.bankPreviewInfo}>
          <span className={styles.bankPreviewName}>{bank.header.companyName}</span>
          <span className={styles.bankPreviewMeta}>
            {bank.about.location} · {bank.header.status}
          </span>
        </div>
      </div>
      <div className={styles.bankPreviewStats}>
        <div className={styles.bankPreviewStat}>
          <span className={styles.bankPreviewStatLabel}>Revenue</span>
          <span className={styles.bankPreviewStatValue}>{bank.about.revenue}</span>
        </div>
        <div className={styles.bankPreviewStat}>
          <span className={styles.bankPreviewStatLabel}>Users</span>
          <span className={styles.bankPreviewStatValue}>{bank.about.numberOfUser}</span>
        </div>
        <div className={styles.bankPreviewStat}>
          <span className={styles.bankPreviewStatLabel}>ROE</span>
          <span className={styles.bankPreviewStatValue}>{bank.financials.roe}</span>
        </div>
      </div>
      <div className={styles.bankPreviewTags}>
        {bank.header.tag.map((tag) => (
          <span key={tag} className={styles.bankPreviewTag}>{tag}</span>
        ))}
      </div>
      {canvasCtx && (
        <button className={styles.bankPreviewViewBtn} onClick={handleViewInCanvas}>
          View in Canvas
        </button>
      )}
    </div>
  );
}
