'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import { useOptionalCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import REGISTRY from '@/components/assistant/widgets/registry';
import type { WidgetInstance, WidgetType } from '@/components/assistant/types';
import styles from '@/components/assistant/assistant.module.css';

interface InlineChatProps {
  widgetContext: Record<string, any>;
  widgetTitle: string;
  onClose: () => void;
}

const CASCADE_MAP: Record<string, WidgetType[]> = {
  'bank-snapshot': ['bi-chart', 'product-list', 'comparison-table'],
  'bi-chart': ['comparison-table', 'watchlist'],
  'comparison-table': ['bi-chart', 'watchlist'],
  'product-list': ['bank-snapshot', 'bi-chart'],
  'watchlist': ['bi-chart', 'proactive-insights'],
  'leadership': ['bank-snapshot'],
  'platform-embed': ['bi-chart', 'product-list', 'comparison-table'],
  'proactive-insights': ['bi-chart', 'watchlist'],
};

export default function InlineChat({ widgetContext, widgetTitle, onClose }: InlineChatProps) {
  const t = useTranslations('Assistant.inlineChat');
  const { injectContext, sendMessage } = useChatContext();
  const canvasCtx = useOptionalCanvasContext();
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    injectContext('inline-chat', widgetContext);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const triggerCascade = useCallback(() => {
    if (!canvasCtx) return;
    const sourceComponent = widgetContext.component as string | undefined;
    if (!sourceComponent) return;

    const candidates = CASCADE_MAP[sourceComponent] ?? [];
    const existingTypes = new Set(canvasCtx.state.activeWidgets.map((w) => w.type));

    for (const candidateType of candidates) {
      if (existingTypes.has(candidateType)) continue;

      const entry = REGISTRY[candidateType];
      if (!entry) continue;

      const widget: WidgetInstance = {
        id: `${candidateType}-cascade-${Date.now()}`,
        type: candidateType,
        title: entry.defaultTitle,
        props: {},
        contextTrigger: `cascade-from-${sourceComponent}`,
        pinned: false,
        priority: 'contextual',
      };
      canvasCtx.addWidget(widget);
      canvasCtx.showToast(`Added ${entry.defaultTitle} (related to ${widgetTitle})`);
      break;
    }
  }, [widgetContext, widgetTitle, canvasCtx]);

  const handleSubmit = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendMessage(text);
    setInputText('');
    triggerCascade();
    onClose();
  }, [inputText, sendMessage, onClose, triggerCascade]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <>
      <div className={styles.inlineChatOverlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.inlineChatBar} onClick={(e) => e.stopPropagation()}>
        <span className={styles.inlineChatLabel}>{t('context', { title: widgetTitle })}</span>
        <div className={styles.inlineChatRow}>
          <input
            ref={inputRef}
            className={styles.inlineChatInput}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
          />
          <button
            className={styles.inlineChatSend}
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            aria-label={t('send')}
          >
            {t('send')}
          </button>
        </div>
      </div>
    </>
  );
}
