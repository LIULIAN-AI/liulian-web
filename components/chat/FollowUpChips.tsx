'use client';

import { useCallback, useMemo } from 'react';
import { useChatContext } from './hooks/useChatContext';
import { useOptionalCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import { getAllMockBanks } from '@/components/assistant/data/mockBanks';
import { setSelectedBankSortId } from '@/components/assistant/data/assistantDataService';
import { useBankContext } from '@/contexts/BankContext';
import type { WidgetInstance } from '@/components/assistant/types';
import styles from './chat.module.css';

interface FollowUpChipsProps {
  messageContent: string;
}

interface ChipAction {
  label: string;
  icon: string;
  message: string;
  widgetType: 'product-list' | 'bi-chart' | 'leadership' | 'comparison-table';
  widgetTitle: string;
}

function detectBankInMessage(text: string): { sortId: string; name: string } | null {
  const lower = text.toLowerCase();
  for (const bank of getAllMockBanks()) {
    if (lower.includes(bank.header.companyName.toLowerCase())) {
      return { sortId: bank.sortId, name: bank.header.companyName };
    }
  }
  return null;
}

export default function FollowUpChips({ messageContent }: FollowUpChipsProps) {
  const { sendMessage } = useChatContext();
  const canvasCtx = useOptionalCanvasContext();
  const { loadHeaderInfo } = useBankContext();

  const detectedBank = useMemo(() => detectBankInMessage(messageContent), [messageContent]);

  const chips: ChipAction[] = useMemo(() => {
    if (!detectedBank) return [];
    return [
      {
        label: `What products does ${detectedBank.name} offer?`,
        icon: '📦',
        message: `What products does ${detectedBank.name} offer?`,
        widgetType: 'product-list' as const,
        widgetTitle: `${detectedBank.name} Products`,
      },
      {
        label: `Show ${detectedBank.name} financials`,
        icon: '📊',
        message: `Show me ${detectedBank.name} financial indicators and trends`,
        widgetType: 'bi-chart' as const,
        widgetTitle: `${detectedBank.name} Financials`,
      },
      {
        label: `Who leads ${detectedBank.name}?`,
        icon: '👥',
        message: `Who is on the leadership team at ${detectedBank.name}?`,
        widgetType: 'leadership' as const,
        widgetTitle: `${detectedBank.name} Leadership`,
      },
    ];
  }, [detectedBank]);

  const handleChipClick = useCallback(
    (chip: ChipAction) => {
      if (!detectedBank) return;

      setSelectedBankSortId(detectedBank.sortId);
      loadHeaderInfo(detectedBank.sortId);

      if (canvasCtx) {
        if (!canvasCtx.state.activeWidgets.some((w) => w.type === chip.widgetType)) {
          const widget: WidgetInstance = {
            id: `${chip.widgetType}-followup-${Date.now()}`,
            type: chip.widgetType,
            title: chip.widgetTitle,
            props: { bankSortId: detectedBank.sortId },
            pinned: false,
            priority: 'contextual',
          };
          canvasCtx.addWidget(widget);
          canvasCtx.showToast(`Added ${chip.widgetTitle} to Canvas`);
        }
        if (canvasCtx.state.canvasCollapsed) {
          canvasCtx.dispatch({ type: 'SET_CANVAS_PANEL', collapsed: false });
        }
      }

      sendMessage(chip.message);
    },
    [detectedBank, canvasCtx, sendMessage, loadHeaderInfo],
  );

  if (chips.length === 0) return null;

  return (
    <div className={styles.followUpChips}>
      {chips.map((chip) => (
        <button
          key={chip.widgetType}
          className={styles.followUpChip}
          onClick={() => handleChipClick(chip)}
        >
          <span className={styles.followUpChipIcon}>{chip.icon}</span>
          <span className={styles.followUpChipLabel}>{chip.label}</span>
        </button>
      ))}
    </div>
  );
}
