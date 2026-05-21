'use client';

import { useEffect, useRef } from 'react';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import { useBankContext } from '@/contexts/BankContext';
import { useCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import REGISTRY from '@/components/assistant/widgets/registry';
import { getAllMockBanks } from '@/components/assistant/data/mockBanks';
import { setSelectedBankSortId } from '@/components/assistant/data/assistantDataService';
import type { WidgetInstance, WidgetType } from '@/components/assistant/types';

function detectBankMention(text: string): { sortId: string; name: string } | null {
  const lower = text.toLowerCase();
  for (const bank of getAllMockBanks()) {
    if (lower.includes(bank.header.companyName.toLowerCase())) {
      return { sortId: bank.sortId, name: bank.header.companyName };
    }
  }
  return null;
}

function detectProductRequest(text: string): boolean {
  const lower = text.toLowerCase();
  return /product|offer|service|deposit|loan|card|account/i.test(lower);
}

function detectReportRequest(text: string): { wantReport: boolean; title?: string; format?: 'html' | 'pdf' } {
  const lower = text.toLowerCase();
  if (/generate.*report|create.*report|export.*report|build.*report|make.*report/i.test(lower)) {
    let format: 'html' | 'pdf' | undefined;
    if (/pdf/i.test(lower)) format = 'pdf';
    else if (/html/i.test(lower)) format = 'html';
    return { wantReport: true, format };
  }
  return { wantReport: false };
}

function detectReportTitleChange(text: string): string | null {
  const match = text.match(/(?:change|set|rename|update)\s+(?:the\s+)?(?:report\s+)?title\s+to\s+['""]?(.+?)['""]?\s*$/i);
  return match ? match[1] : null;
}

function detectExportCommand(text: string): 'html' | 'pdf' | null {
  if (/export\s+(?:as\s+)?pdf/i.test(text)) return 'pdf';
  if (/export\s+(?:as\s+)?html/i.test(text)) return 'html';
  return null;
}

export default function CanvasOrchestrator(): null {
  const { state: chatState } = useChatContext();
  const { loadHeaderInfo } = useBankContext();
  const { state: canvasState, addWidget, dispatch, showToast } = useCanvasContext();

  const lastProcessedIndexRef = useRef<number>(0);

  useEffect(() => {
    const hasError = chatState.status === 'error';
    if (hasError !== canvasState.aiUnavailable) {
      dispatch({ type: 'SET_AI_UNAVAILABLE', unavailable: hasError });
    }
  }, [chatState.status, canvasState.aiUnavailable, dispatch]);

  useEffect(() => {
    const messages = chatState.messages;
    const newMessages = messages.slice(lastProcessedIndexRef.current);

    lastProcessedIndexRef.current = messages.length;

    for (const msg of newMessages) {
      if (msg.type === 'user') {
        const reportReq = detectReportRequest(msg.content);
        if (reportReq.wantReport) {
          const bankMatch = detectBankMention(msg.content);
          if (bankMatch) {
            setSelectedBankSortId(bankMatch.sortId);
            loadHeaderInfo(bankMatch.sortId);
          }
          window.dispatchEvent(new CustomEvent('openReportBuilder', {
            detail: { autoSelect: true, format: reportReq.format },
          }));
          showToast('Opening Report Builder...');
          continue;
        }

        const titleChange = detectReportTitleChange(msg.content);
        if (titleChange) {
          window.dispatchEvent(new CustomEvent('reportBuilderCommand', {
            detail: { title: titleChange },
          }));
          showToast(`Report title updated to "${titleChange}"`);
          continue;
        }

        const exportCmd = detectExportCommand(msg.content);
        if (exportCmd) {
          window.dispatchEvent(new CustomEvent('reportBuilderCommand', {
            detail: { format: exportCmd, exportNow: true },
          }));
          continue;
        }

        const bankMatch = detectBankMention(msg.content);
        if (bankMatch) {
          setSelectedBankSortId(bankMatch.sortId);
          loadHeaderInfo(bankMatch.sortId);

          dispatch({ type: 'RESET_CANVAS' });

          const snapshotWidget: WidgetInstance = {
            id: `bank-snapshot-${Date.now()}`,
            type: 'bank-snapshot',
            title: `${bankMatch.name} Overview`,
            props: { bankSortId: bankMatch.sortId },
            pinned: false,
            priority: 'active',
          };
          addWidget(snapshotWidget);

          if (detectProductRequest(msg.content)) {
            const productWidget: WidgetInstance = {
              id: `product-list-${Date.now()}`,
              type: 'product-list',
              title: `${bankMatch.name} Products`,
              props: { bankSortId: bankMatch.sortId },
              pinned: false,
              priority: 'contextual',
            };
            addWidget(productWidget);
          }

          showToast(`Switched context to ${bankMatch.name}`);
          continue;
        }
      }

      if (msg.type !== 'assistant') continue;

      const lower = msg.content.toLowerCase();

      const assistantBankMatch = detectBankMention(msg.content);

      for (const [widgetType, entry] of Object.entries(REGISTRY)) {
        const { contextTriggers } = entry;
        if (!contextTriggers || contextTriggers.length === 0) continue;

        const matchedKeyword = contextTriggers.find((kw) => lower.includes(kw));
        if (!matchedKeyword) continue;

        const type = widgetType as WidgetType;

        const alreadyPresent = canvasState.activeWidgets.some((w) => w.type === type);
        if (alreadyPresent) continue;

        const newWidget: WidgetInstance = {
          id: `${type}-${Date.now()}`,
          type,
          title: entry.defaultTitle,
          props: assistantBankMatch ? { bankSortId: assistantBankMatch.sortId } : {},
          contextTrigger: matchedKeyword,
          pinned: false,
          priority: 'contextual',
        };

        addWidget(newWidget);

        if (canvasState.canvasCollapsed) {
          dispatch({
            type: 'SET_CANVAS_BADGE',
            count: canvasState.canvasBadgeCount + 1,
          });
        } else {
          showToast(`Added ${entry.defaultTitle} to Canvas`);
        }

        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatState.messages.length]);

  return null;
}
