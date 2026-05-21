'use client';

import { useTranslations } from 'next-intl';
import type { WidgetProps } from '../types';
import { useLeadership } from '../hooks/useAssistantData';
import { getSelectedBankSortId } from '../data/assistantDataService';
import type { LeaderEntry } from '../data/assistantDataService';
import WidgetShell from './WidgetShell';
import styles from '../assistant.module.css';

interface Leader extends LeaderEntry {
  education?: string;
}

export default function LeadershipWidget({ instance, onInlineChat, onPin, onClose, onMaximize }: WidgetProps) {
  const t = useTranslations('Assistant');
  const { leaders: fetchedLeaders } = useLeadership(instance.props?.bankSortId ?? getSelectedBankSortId());
  const leaders: Leader[] = instance.props?.leaders ?? fetchedLeaders;

  return (
    <WidgetShell
      title={instance.title}
      widgetType={instance.type}
      pinned={instance.pinned}
      accentColor="#64748b"
      onInlineChat={() => onInlineChat({ component: 'leadership', count: leaders.length })}
      onPin={onPin}
      onMaximize={onMaximize}
      onClose={onClose}
    >
      <div className={styles.leadershipBody}>
        {leaders.map((leader) => (
          <div key={leader.name} className={styles.leaderCard}>
            <div className={styles.leaderAvatar}>
              {leader.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={styles.leaderInfo}>
              <div className={styles.leaderName}>{leader.name}</div>
              <div className={styles.leaderTitle}>{leader.title}</div>
              <div className={styles.leaderTenure}>{leader.tenure}</div>
              <div className={styles.leaderBg}>{leader.background}</div>
              {leader.education && (
                <div className={styles.leaderEdu}>{leader.education}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </WidgetShell>
  );
}
