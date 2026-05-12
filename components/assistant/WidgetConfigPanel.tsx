'use client';

import { X, BarChart3, LineChart, PieChart, Radar, Activity } from 'lucide-react';
import { useCanvasContext } from './hooks/useCanvasContext';
import type { WidgetInstance } from './types';
import styles from './assistant.module.css';

const CHART_TYPE_OPTIONS = [
  { value: 'bar', label: 'Bar', icon: BarChart3 },
  { value: 'line', label: 'Line', icon: LineChart },
  { value: 'area', label: 'Area', icon: Activity },
  { value: 'radar', label: 'Radar', icon: Radar },
  { value: 'donut', label: 'Donut', icon: PieChart },
];

const TIME_RANGE_OPTIONS = [
  { value: 'all', label: 'All Years' },
  { value: '3y', label: 'Last 3 Years' },
  { value: '5y', label: 'Last 5 Years' },
  { value: 'custom', label: 'Custom Range' },
];

const PRODUCT_TYPES = ['All', 'Account', 'Card', 'Deposit', 'Loan', 'Insurance'];

const SORT_OPTIONS = [
  { value: 'name', label: 'By Name' },
  { value: 'value', label: 'By Value' },
  { value: 'type', label: 'By Type' },
];

interface WidgetConfigPanelProps {
  widget: WidgetInstance;
}

export default function WidgetConfigPanel({ widget }: WidgetConfigPanelProps) {
  const { dispatch } = useCanvasContext();

  const updateProp = (key: string, value: unknown) => {
    dispatch({
      type: 'UPDATE_WIDGET',
      widgetId: widget.id,
      updates: { props: { ...widget.props, [key]: value } },
    });
  };

  const close = () => dispatch({ type: 'CLOSE_CONFIG_PANEL' });

  return (
    <div className={styles.configPanel}>
      <div className={styles.configPanelHeader}>
        <span className={styles.configPanelTitle}>Configure: {widget.title}</span>
        <button className={styles.configPanelClose} onClick={close}>
          <X size={14} />
        </button>
      </div>

      <div className={styles.configPanelBody}>
        {(widget.type === 'bi-chart') && (
          <>
            <ConfigSection title="Chart Type">
              <div className={styles.configChipGroup}>
                {CHART_TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      className={`${styles.configChip} ${
                        (widget.props.chartType ?? 'bar') === opt.value ? styles.configChipActive : ''
                      }`}
                      onClick={() => updateProp('chartType', opt.value)}
                    >
                      <Icon size={12} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            <ConfigSection title="Time Range">
              <div className={styles.configChipGroup}>
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.configChip} ${
                      (widget.props.timeRange ?? 'all') === opt.value ? styles.configChipActive : ''
                    }`}
                    onClick={() => updateProp('timeRange', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </ConfigSection>

            <ConfigSection title="Sort By">
              <div className={styles.configChipGroup}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.configChip} ${
                      (widget.props.sortBy ?? 'name') === opt.value ? styles.configChipActive : ''
                    }`}
                    onClick={() => updateProp('sortBy', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </ConfigSection>
          </>
        )}

        {widget.type === 'comparison-table' && (
          <>
            <ConfigSection title="Highlight Mode">
              <div className={styles.configChipGroup}>
                {['best', 'threshold', 'none'].map((mode) => (
                  <button
                    key={mode}
                    className={`${styles.configChip} ${
                      (widget.props.highlightMode ?? 'best') === mode ? styles.configChipActive : ''
                    }`}
                    onClick={() => updateProp('highlightMode', mode)}
                  >
                    {mode === 'best' ? 'Best Value' : mode === 'threshold' ? 'Threshold' : 'None'}
                  </button>
                ))}
              </div>
            </ConfigSection>

            <ConfigSection title="Sort By">
              <div className={styles.configChipGroup}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.configChip} ${
                      (widget.props.sortBy ?? 'name') === opt.value ? styles.configChipActive : ''
                    }`}
                    onClick={() => updateProp('sortBy', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </ConfigSection>
          </>
        )}

        {widget.type === 'product-list' && (
          <>
            <ConfigSection title="Product Type">
              <div className={styles.configChipGroup}>
                {PRODUCT_TYPES.map((pt) => (
                  <button
                    key={pt}
                    className={`${styles.configChip} ${
                      (widget.props.productFilter ?? 'All') === pt ? styles.configChipActive : ''
                    }`}
                    onClick={() => updateProp('productFilter', pt)}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </ConfigSection>

            <ConfigSection title="Sort By">
              <div className={styles.configChipGroup}>
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'type', label: 'Type' },
                  { value: 'segment', label: 'Segment' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.configChip} ${
                      (widget.props.sortBy ?? 'name') === opt.value ? styles.configChipActive : ''
                    }`}
                    onClick={() => updateProp('sortBy', opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </ConfigSection>
          </>
        )}

        {widget.type === 'watchlist' && (
          <ConfigSection title="Alert Threshold">
            <div className={styles.configRow}>
              <label className={styles.configLabel}>NPL Ratio Alert (%)</label>
              <input
                className={styles.configInput}
                type="number"
                step="0.1"
                value={widget.props.nplThreshold ?? 3.0}
                onChange={(e) => updateProp('nplThreshold', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.configRow}>
              <label className={styles.configLabel}>ROE Alert (%)</label>
              <input
                className={styles.configInput}
                type="number"
                step="0.1"
                value={widget.props.roeThreshold ?? 5.0}
                onChange={(e) => updateProp('roeThreshold', parseFloat(e.target.value))}
              />
            </div>
          </ConfigSection>
        )}

        {!['bi-chart', 'comparison-table', 'product-list', 'watchlist'].includes(widget.type) && (
          <div className={styles.configEmptyState}>
            No configurable options for this widget type.
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.configSection}>
      <div className={styles.configSectionTitle}>{title}</div>
      {children}
    </div>
  );
}
