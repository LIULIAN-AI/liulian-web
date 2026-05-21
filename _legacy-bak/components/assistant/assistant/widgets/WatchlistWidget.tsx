'use client';

import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import { useWatchlist } from '../hooks/useAssistantData';
import type { WatchedBank } from '../data/assistantDataService';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

export default function WatchlistWidget({ instance, onInlineChat, onPin, onClose, onMaximize, onConfigure }: WidgetProps) {
  const t = useTranslations('Assistant');
  const { watchlist: fetchedWatchlist } = useWatchlist(instance.props?.bankSortIds);
  const watchlist: WatchedBank[] = instance.props?.watchlist ?? fetchedWatchlist;

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#1e40af"
      onInlineChat={() => onInlineChat({ component: 'watchlist', banks: watchlist.map(w => w.name) })}
      onPin={onPin}
      onConfigure={onConfigure}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.watchlistBody}>
        {watchlist.map((bank) => (
          <div key={bank.name} className={styles.watchlistBank}>
            <div className={styles.watchlistBankName}>{bank.name}</div>
            <div className={styles.watchlistMetrics}>
              {bank.metrics.map((m) => (
                <div
                  key={m.label}
                  className={`${styles.watchlistMetric} ${m.breached ? styles.watchlistMetricBreached : ''}`}
                >
                  <span className={styles.watchlistMetricLabel}>{m.label}</span>
                  <span className={styles.watchlistMetricValue}>
                    {m.unit === 'M' ? `$${m.value}M` : `${m.value}${m.unit}`}
                  </span>
                  <span
                    className={styles.watchlistMetricChange}
                    data-direction={m.change >= 0 ? 'up' : 'down'}
                  >
                    {m.change >= 0 ? '+' : ''}{m.change}%
                  </span>
                  {m.threshold !== undefined && (
                    <span className={styles.watchlistThreshold}>
                      Threshold: {m.threshold}{m.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
