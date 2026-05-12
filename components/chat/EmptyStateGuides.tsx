'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { springSnappy } from './motion';
import styles from './chat.module.css';

interface EmptyStateGuidesProps {
  onPick: (text: string) => void;
}

const STARTER_KEYS = [
  { titleKey: 'guides.bankOverview', descKey: 'guides.bankOverviewDesc', promptKey: 'guides.bankOverviewPrompt' },
  { titleKey: 'guides.compareBanks', descKey: 'guides.compareBanksDesc', promptKey: 'guides.compareBanksPrompt' },
  { titleKey: 'guides.findCard', descKey: 'guides.findCardDesc', promptKey: 'guides.findCardPrompt' },
  { titleKey: 'guides.explainProcess', descKey: 'guides.explainProcessDesc', promptKey: 'guides.explainProcessPrompt' },
] as const;

export default function EmptyStateGuides({ onPick }: EmptyStateGuidesProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  return (
    <div className={styles.emptyStateGrid}>
      {STARTER_KEYS.map((s) => (
        <motion.button
          type="button"
          key={s.titleKey}
          className={styles.emptyStateCard}
          onClick={() => onPick(t(s.promptKey))}
          whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={springSnappy}
        >
          <span className={styles.emptyStateCardTitle}>{t(s.titleKey)}</span>
          <span className={styles.emptyStateCardDesc}>{t(s.descKey)}</span>
        </motion.button>
      ))}
    </div>
  );
}
