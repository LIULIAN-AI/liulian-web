'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useOptionalCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import ChartRenderer from '@/components/assistant/widgets/ChartRenderer';
import type { ChartSpec, ChartType } from '@/components/assistant/widgets/chartTypes';
import type { WidgetInstance } from '@/components/assistant/types';
import styles from './chat.module.css';

export type { ChartSpec };

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'radar', label: 'Radar' },
];

interface InlineBIWidgetProps {
  spec: ChartSpec;
}

export default function InlineBIWidget({ spec }: InlineBIWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWide, setIsWide] = useState(false);
  const [localChartType, setLocalChartType] = useState<ChartType>(spec.type ?? 'bar');
  const canvasCtx = useOptionalCanvasContext();
  const canvasState = canvasCtx?.state;
  const addWidget = canvasCtx?.addWidget;
  const showToast = canvasCtx?.showToast;
  const dispatch = canvasCtx?.dispatch;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsWide(entry.contentRect.width >= 500);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleOpenInCanvas = useCallback(() => {
    if (!addWidget || !dispatch || !showToast) return;
    const widget: WidgetInstance = {
      id: `bi-chart-inline-${Date.now()}`,
      type: 'bi-chart',
      title: spec.title ?? 'Chart',
      props: { chart_spec: { ...spec, type: localChartType } },
      pinned: false,
      priority: 'contextual',
    };
    addWidget(widget);
    if (canvasState?.canvasCollapsed) {
      dispatch({ type: 'SET_CANVAS_PANEL', collapsed: false });
    }
    showToast(`Added "${spec.title ?? 'Chart'}" to Canvas`);
  }, [spec, localChartType, addWidget, showToast, canvasState?.canvasCollapsed, dispatch]);

  if (!spec.data || spec.data.length === 0) return null;

  const activeSpec: ChartSpec = { ...spec, type: localChartType };

  return (
    <div ref={containerRef} className={styles.inlineBIWidget}>
      {isWide ? (
        <>
          <div className={styles.inlineBIWidgetHeader}>
            {spec.title && <div className={styles.inlineBIWidgetTitle}>{spec.title}</div>}
            <div className={styles.inlineBIChartToolbar}>
              {CHART_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.inlineBIChartTypeBtn} ${localChartType === opt.value ? styles.inlineBIChartTypeBtnActive : ''}`}
                  onClick={() => setLocalChartType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.inlineBIWidgetChart}>
            <ChartRenderer spec={activeSpec} />
          </div>
          {canvasCtx && (
            <div className={styles.inlineBIWidgetActions}>
              <button
                type="button"
                className={styles.inlineBIWidgetBtn}
                onClick={handleOpenInCanvas}
              >
                Pin to Canvas
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.inlineBIWidgetThumbnail}>
          <div className={styles.inlineBIWidgetThumbPreview}>
            <ChartRenderer spec={activeSpec} compact />
          </div>
          <div className={styles.inlineBIWidgetThumbInfo}>
            <div className={styles.inlineBIWidgetTitle}>{spec.title ?? 'Chart'}</div>
            <div className={styles.inlineBIWidgetThumbMeta}>
              {localChartType} · {spec.data.length} items
            </div>
            {canvasCtx && (
              <div className={styles.inlineBIWidgetActions}>
                <button
                  type="button"
                  className={styles.inlineBIWidgetBtn}
                  onClick={handleOpenInCanvas}
                >
                  Open in Canvas
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
