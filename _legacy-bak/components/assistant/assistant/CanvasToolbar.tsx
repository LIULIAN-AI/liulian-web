'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, LayoutGrid, List, RotateCcw, PanelRightClose, FileText } from 'lucide-react';
import { useCanvasContext } from './hooks/useCanvasContext';
import { getAllWidgetTypes, getWidgetEntry } from './widgets/registry';
import type { WidgetInstance, WidgetType } from './types';
import styles from './assistant.module.css';

interface CanvasToolbarProps {
  onOpenReport: () => void;
}

export default function CanvasToolbar({ onOpenReport }: CanvasToolbarProps) {
  const t = useTranslations('Assistant');
  const { state, dispatch, toggleCanvasPanel, resetCanvas, showToast } = useCanvasContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  const handleAddWidget = (type: WidgetType) => {
    const entry = getWidgetEntry(type);
    const newWidget: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      title: entry.defaultTitle,
      props: {},
      pinned: false,
      priority: 'default',
    };
    dispatch({ type: 'ADD_WIDGET', widget: newWidget });
    setPickerOpen(false);
  };

  const handleReset = () => {
    const count = state.activeWidgets.length;
    resetCanvas();
    showToast(`Removed ${count} widgets`);
  };

  const availableTypes = getAllWidgetTypes().filter(
    (wt) => wt !== 'placeholder',
  );

  return (
    <div className={styles.canvasToolbar}>
      <span className={styles.canvasToolbarTitle}>Canvas</span>
      <div className={styles.canvasToolbarDivider} />

      <div className={styles.widgetPickerWrapper} ref={pickerRef}>
        <button
          className={styles.canvasToolbarBtn}
          onClick={() => setPickerOpen(!pickerOpen)}
          title={t('toolbar.addWidget')}
        >
          <Plus size={14} />
          <span>{t('toolbar.addWidget')}</span>
        </button>

        {pickerOpen && (
          <div className={styles.widgetPickerDropdown}>
            {availableTypes.map((wt) => {
              const entry = getWidgetEntry(wt);
              return (
                <button
                  key={wt}
                  className={styles.widgetPickerItem}
                  onClick={() => handleAddWidget(wt)}
                >
                  <span className={styles.widgetPickerItemTitle}>{entry.defaultTitle}</span>
                  <span className={styles.widgetPickerItemType}>{wt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.canvasToolbarDivider} />

      <button
        className={`${styles.canvasToolbarIconBtn} ${state.canvasLayout === 'grid' ? styles.canvasToolbarIconBtnActive : ''}`}
        onClick={() => dispatch({ type: 'SET_CANVAS_LAYOUT', layout: 'grid' })}
        title="Grid layout"
      >
        <LayoutGrid size={14} />
      </button>
      <button
        className={`${styles.canvasToolbarIconBtn} ${state.canvasLayout === 'list' ? styles.canvasToolbarIconBtnActive : ''}`}
        onClick={() => dispatch({ type: 'SET_CANVAS_LAYOUT', layout: 'list' })}
        title="List layout"
      >
        <List size={14} />
      </button>

      <div className={styles.canvasToolbarDivider} />

      <button
        className={styles.canvasToolbarIconBtn}
        onClick={handleReset}
        title="Reset canvas"
      >
        <RotateCcw size={14} />
      </button>

      <button
        className={styles.canvasToolbarBtn}
        onClick={onOpenReport}
        title="Generate Report"
      >
        <FileText size={14} />
        <span>Report</span>
      </button>

      <div style={{ flex: 1 }} />

      <span className={styles.canvasToolbarCount}>
        {t('toolbar.widgetCount', { count: state.activeWidgets.length })}
      </span>

      <button
        className={styles.canvasToolbarIconBtn}
        onClick={toggleCanvasPanel}
        title="Collapse canvas"
      >
        <PanelRightClose size={14} />
      </button>
    </div>
  );
}
