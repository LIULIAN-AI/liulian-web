'use client';

import { useCallback, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Minimize2 } from 'lucide-react';
import { useCanvasContext } from './hooks/useCanvasContext';
import { getWidgetEntry } from './widgets/registry';
import type { WidgetInstance } from './types';
import CanvasToolbar from './CanvasToolbar';
import WidgetConfigPanel from './WidgetConfigPanel';
import ReportBuilder from './ReportBuilder';
import InlineChat from '@/components/chat/InlineChat';
import styles from './assistant.module.css';

interface InlineChatState {
  widgetId: string;
  context: Record<string, any>;
  title: string;
}

export default function DynamicCanvas() {
  const t = useTranslations('Assistant');
  const { state, dispatch } = useCanvasContext();
  const [inlineChatState, setInlineChatState] = useState<InlineChatState | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportAiTitle, setReportAiTitle] = useState<string | undefined>();
  const [reportAutoSelect, setReportAutoSelect] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setReportAiTitle(detail?.title);
      setReportAutoSelect(!!detail?.autoSelect);
      setReportOpen(true);
    };
    window.addEventListener('openReportBuilder', handler);
    return () => window.removeEventListener('openReportBuilder', handler);
  }, []);

  const configWidget = state.configPanelWidgetId
    ? state.activeWidgets.find((w) => w.id === state.configPanelWidgetId) ?? null
    : null;

  const renderWidget = useCallback(
    (instance: WidgetInstance) => {
      const entry = getWidgetEntry(instance.type);
      const Component = entry.component;

      return (
        <div key={instance.id} className={styles.canvasGridItem}>
          <Component
            instance={instance}
            onInlineChat={(ctx: Record<string, any>) =>
              setInlineChatState({ widgetId: instance.id, context: ctx, title: instance.title })
            }
            onPin={() => {
              if (instance.pinned) {
                dispatch({ type: 'UNPIN_WIDGET', widgetId: instance.id });
              } else {
                dispatch({ type: 'PIN_WIDGET', widgetId: instance.id });
              }
            }}
            onClose={() => dispatch({ type: 'REMOVE_WIDGET', widgetId: instance.id })}
            onMaximize={() => {
              if (state.maximizedWidgetId === instance.id) {
                dispatch({ type: 'RESTORE_WIDGET' });
              } else {
                dispatch({ type: 'MAXIMIZE_WIDGET', widgetId: instance.id });
              }
            }}
            onConfigure={() => dispatch({ type: 'OPEN_CONFIG_PANEL', widgetId: instance.id })}
            isActive={state.maximizedWidgetId === instance.id}
          />
          {inlineChatState?.widgetId === instance.id && (
            <InlineChat
              widgetContext={inlineChatState.context}
              widgetTitle={inlineChatState.title}
              onClose={() => setInlineChatState(null)}
            />
          )}
        </div>
      );
    },
    [dispatch, inlineChatState],
  );

  const maximizedWidget = state.maximizedWidgetId
    ? state.activeWidgets.find((w) => w.id === state.maximizedWidgetId) ?? null
    : null;

  const gridClassName =
    state.canvasLayout === 'list' ? styles.canvasGridList : styles.canvasGrid;

  if (state.activeWidgets.length === 0) {
    return (
      <div className={styles.canvasArea}>
        <CanvasToolbar onOpenReport={() => setReportOpen(true)} />
        <div className={styles.canvasEmpty}>
          <span className={styles.canvasEmptyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </span>
          <span className={styles.canvasEmptyLabel}>
            {t('canvas.empty')}
          </span>
        </div>
        <ReportBuilder open={reportOpen} onClose={() => setReportOpen(false)} aiTitle={reportAiTitle} aiAutoSelect={reportAutoSelect} />
      </div>
    );
  }

  return (
    <div className={styles.canvasArea}>
      <CanvasToolbar onOpenReport={() => setReportOpen(true)} />
      <div className={styles.canvasContent}>
        {maximizedWidget ? (
          <div className={styles.canvasMaximized}>
            <button
              className={styles.canvasRestoreBtn}
              onClick={() => dispatch({ type: 'RESTORE_WIDGET' })}
              title="Restore to grid"
            >
              <Minimize2 size={14} />
              <span>Restore</span>
            </button>
            <div className={styles.canvasMaximizedWidget}>
              {renderWidget(maximizedWidget)}
            </div>
          </div>
        ) : (
          <div className={gridClassName}>
            {state.activeWidgets.map(renderWidget)}
          </div>
        )}
        {configWidget && (
          <WidgetConfigPanel widget={configWidget} />
        )}
      </div>
      <ReportBuilder open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
