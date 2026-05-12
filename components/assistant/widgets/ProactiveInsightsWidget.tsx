'use client';

import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

interface Insight {
  id: string;
  severity: 'info' | 'warning' | 'alert';
  title: string;
  description: string;
  bank?: string;
  metric?: string;
  actionLabel?: string;
}

const DEMO_INSIGHTS: Insight[] = [
  {
    id: '1',
    severity: 'alert',
    title: 'NPL Ratio Approaching Threshold',
    description: 'Airstar Bank NPL ratio has increased 0.7% this quarter to 3.5%, exceeding the 3% threshold. Historical trend suggests continued deterioration.',
    bank: 'Airstar Bank',
    metric: 'NPL Ratio',
    actionLabel: 'View Trend',
  },
  {
    id: '2',
    severity: 'warning',
    title: 'Revenue Growth Deceleration',
    description: 'ZA Bank revenue growth has slowed from 18.5% to 12.3% YoY. However, ARPU is increasing — suggesting a shift from scale to value strategy.',
    bank: 'ZA Bank',
    metric: 'Revenue',
    actionLabel: 'Compare Peers',
  },
  {
    id: '3',
    severity: 'info',
    title: 'Product Gap Opportunity',
    description: 'SME lending products have low coverage across HK virtual banks (only 2 of 8 offer them). This represents a potential market entry opportunity.',
    actionLabel: 'View Products',
  },
  {
    id: '4',
    severity: 'info',
    title: 'Cost Efficiency Leader Change',
    description: 'Mox Bank has overtaken ZA Bank as the most cost-efficient HK virtual bank (C/I ratio: 52% vs 58%). Driven by reduced customer acquisition costs.',
    bank: 'Mox Bank',
    metric: 'Cost/Income',
    actionLabel: 'View Details',
  },
];

const SEVERITY_STYLES: Record<string, { indicator: string }> = {
  alert: { indicator: 'var(--error, #dc2626)' },
  warning: { indicator: 'var(--warning, #d97706)' },
  info: { indicator: 'var(--success, #0d9488)' },
};

export default function ProactiveInsightsWidget({ instance, onInlineChat, onPin, onClose, onMaximize }: WidgetProps) {
  const t = useTranslations('Assistant');
  const insights: Insight[] = instance.props?.insights ?? DEMO_INSIGHTS;

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#7c3aed"
      onInlineChat={() => onInlineChat({ component: 'proactive-insights', count: insights.length })}
      onPin={onPin}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.insightsBody}>
        {insights.map((insight) => (
          <div key={insight.id} className={styles.insightCard}>
            <div className={styles.insightHeader}>
              <span
                className={styles.insightIndicator}
                style={{ background: SEVERITY_STYLES[insight.severity]?.indicator }}
              />
              <span className={styles.insightTitle}>{insight.title}</span>
            </div>
            <div className={styles.insightDesc}>{insight.description}</div>
            {insight.actionLabel && (
              <button className={styles.insightAction}>{insight.actionLabel}</button>
            )}
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
