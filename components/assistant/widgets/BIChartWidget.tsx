'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import type { ChartSpec } from './chartTypes';
import ChartRenderer from './ChartRenderer';
import { ALL_DEMO_CHARTS } from './chartMockData';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

const CHART_TYPE_LABELS: Record<string, string> = {
  bar: 'Bar',
  'grouped-bar': 'Grouped Bar',
  line: 'Line',
  area: 'Area',
  radar: 'Radar',
  donut: 'Donut',
};

export default function BIChartWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
  onConfigure,
}: WidgetProps) {
  const t = useTranslations('Assistant');
  const [showTable, setShowTable] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const chartSpec: ChartSpec | undefined = instance.props?.chart_spec;
  const isDemo = !chartSpec;
  const activeSpec = chartSpec ?? ALL_DEMO_CHARTS[demoIndex % ALL_DEMO_CHARTS.length];

  const series = useMemo(() => {
    if (activeSpec.series) return activeSpec.series;
    const yKey = activeSpec.yKey ?? 'value';
    return [{ dataKey: yKey, label: yKey, color: activeSpec.color ?? '#ef4444' }];
  }, [activeSpec]);

  const xKey = activeSpec.xKey ?? 'name';
  const hasData = activeSpec.data.length > 0;

  return (
    <WidgetShell
      title={activeSpec.title ?? instance.title}
      accentColor="var(--accent)"
      widgetType={instance.type}
      pinned={instance.pinned}
      onInlineChat={() => onInlineChat({ component: 'bi-chart', chart_spec: activeSpec })}
      onPin={onPin}
      onConfigure={onConfigure}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      {!hasData ? (
        <div className={styles.biChartEmpty}>
          <div className={styles.biChartEmptyIcon}>📊</div>
          <div className={styles.biChartEmptyLabel}>{t('widget.biChart.noData')}</div>
        </div>
      ) : (
        <div className={styles.biChartBody}>
          <div className={styles.biChartToolbar}>
            {isDemo && (
              <div className={styles.biChartChipRow}>
                {ALL_DEMO_CHARTS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.biChartChip} ${i === demoIndex ? styles.biChartChipActive : ''}`}
                    onClick={() => setDemoIndex(i)}
                  >
                    {CHART_TYPE_LABELS[c.type] ?? c.type}
                  </button>
                ))}
              </div>
            )}
            <button
              className={styles.biChartToggleBtn}
              onClick={() => setShowTable((v) => !v)}
              type="button"
              aria-label={showTable ? t('widget.biChart.chartView') : t('widget.biChart.tableView')}
              title={showTable ? t('widget.biChart.chartView') : t('widget.biChart.tableView')}
            >
              {showTable ? '📊' : '📋'}
            </button>
          </div>

          {showTable ? (
            <div className={styles.biChartTableWrapper}>
              <table className={styles.biChartTable}>
                <thead>
                  <tr>
                    <th className={styles.biChartTh}>{xKey}</th>
                    {series.map((s) => (
                      <th key={s.dataKey} className={styles.biChartTh}>{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSpec.data.map((row, idx) => (
                    <tr
                      key={String(row[xKey]) + idx}
                      className={idx % 2 === 0 ? styles.biChartTrEven : styles.biChartTrOdd}
                    >
                      <td className={styles.biChartTd}>{String(row[xKey] ?? '')}</td>
                      {series.map((s) => (
                        <td key={s.dataKey} className={styles.biChartTd}>
                          {row[s.dataKey] != null ? String(row[s.dataKey]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.biChartContainer}>
              <ChartRenderer spec={activeSpec} />
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
