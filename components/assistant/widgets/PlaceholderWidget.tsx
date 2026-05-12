'use client';

import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

const ICONS: Record<string, string> = {
  'bank-snapshot': '🏦',
  'bi-chart': '📊',
  'comparison-table': '⚖️',
  'product-list': '🏷️',
  'news-feed': '📰',
  'management-list': '👥',
  'ai-suggestions': '💡',
  'report-preview': '📄',
  placeholder: '🧩',
};

export default function PlaceholderWidget({
  instance,
  onInlineChat,
  onPin,
  onClose,
  onMaximize,
}: WidgetProps) {
  const t = useTranslations('Assistant');

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="var(--border)"
      onInlineChat={() => onInlineChat(instance.props)}
      onPin={onPin}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.placeholderContent}>
        <div className={styles.placeholderIcon}>{ICONS[instance.type] ?? '🧩'}</div>
        <div className={styles.placeholderLabel}>
          {t('widget.comingSoon', { type: instance.type })}
        </div>
      </div>
    </WidgetShell>
  );
}
