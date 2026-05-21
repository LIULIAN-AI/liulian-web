'use client';

import { useMemo } from 'react';
import { useCanvasContext } from './hooks/useCanvasContext';
import { getWidgetEntry } from './widgets/registry';
import { getSelectedBankSortId } from './data/assistantDataService';
import type { WidgetType, WidgetInstance } from './types';
import styles from './assistant.module.css';

const WIDGET_ICONS: Record<string, string> = {
  'product-list': '📦',
  'bi-chart': '📊',
  'leadership': '👥',
  'comparison-table': '⚖️',
  'bank-snapshot': '🏦',
  'watchlist': '👁',
  'proactive-insights': '💡',
  'platform-embed': '🖥️',
  'fluent-about': 'ℹ️',
};

interface SmartSwitcherDockProps {
  widgetType: WidgetType;
  visible: boolean;
}

export default function SmartSwitcherDock({ widgetType, visible }: SmartSwitcherDockProps) {
  const { state, dispatch, showToast } = useCanvasContext();

  const relatedWidgets = useMemo(() => {
    const entry = getWidgetEntry(widgetType);
    return entry.relatedTypes
      .filter((rt) => !state.activeWidgets.some((w) => w.type === rt))
      .slice(0, 4)
      .map((rt) => ({
        type: rt,
        entry: getWidgetEntry(rt),
      }));
  }, [widgetType, state.activeWidgets]);

  if (!visible || relatedWidgets.length === 0) return null;

  const handleAdd = (type: WidgetType, title: string) => {
    const bankSortId = getSelectedBankSortId();
    const newWidget: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      props: bankSortId ? { bankSortId } : {},
      pinned: false,
      priority: 'contextual',
    };
    dispatch({ type: 'ADD_WIDGET', widget: newWidget });
    showToast(`Added ${title} to Canvas`);
  };

  return (
    <div className={styles.switcherDock}>
      {relatedWidgets.map(({ type, entry }) => (
        <button
          key={type}
          className={styles.switcherDockItem}
          onClick={() => handleAdd(type, entry.defaultTitle)}
          title={entry.defaultTitle}
        >
          <span className={styles.switcherDockItemIcon}>{WIDGET_ICONS[type] ?? '📋'}</span>
          <span className={styles.switcherDockItemTitle}>{entry.defaultTitle}</span>
        </button>
      ))}
    </div>
  );
}
