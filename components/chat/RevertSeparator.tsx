'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExclamationCircleFilled, UndoOutlined } from '@ant-design/icons';
import { springSnappy, tweenIOS, tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface RevertSeparatorProps {
  /** Messages that would be discarded if the user reverts here. */
  discardCount: number;
  /** Invoked when the user confirms the revert. The parent is expected to
   *  cascade a dissolve animation on the downstream messages. */
  onConfirm: () => void;
}

type Phase = 'idle' | 'hinted' | 'armed';

/**
 * Hover-revealed revert affordance. Phase machine is fully event-driven
 * (no time-based promotions): hover → 'hinted' (Click to revert),
 * click → 'armed' (Click to confirm), click again → onConfirm. Mouse
 * leave or Esc returns to idle. The earlier 900ms auto-arm timer was
 * removed because R8 feedback explicitly asked for "hover only, no
 * delay".
 */
export default function RevertSeparator({ discardCount, onConfirm }: RevertSeparatorProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (phase === 'idle') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhase('idle');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  if (discardCount <= 0) return null;

  const handleEnter = () => {
    // Only promote idle→hinted on hover. If we're already in 'armed'
    // (the user clicked once), don't drop back to 'hinted' — they're
    // mid-confirm.
    if (phase === 'idle') setPhase('hinted');
  };

  const handleLeave = () => {
    // Drop back to idle on leave from either phase. The user can rehover
    // to start over; they never get stuck in armed because they walked
    // away from the strip.
    setPhase('idle');
  };

  const handleClick = () => {
    if (phase !== 'armed') {
      setPhase('armed');
      return;
    }
    setPhase('idle');
    onConfirm();
  };

  const handleHintClick = () => {
    handleClick();
  };

  const label =
    discardCount === 1
      ? t('revert.discardOne')
      : t('revert.discardMany', { count: discardCount });

  return (
    <div
      className={styles.revertSeparator}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-phase={phase}
      role="separator"
      aria-label={t('revert.revertAffordance', { count: discardCount })}
    >
      <AnimatePresence initial={false}>
        {phase === 'hinted' && (
          <motion.button
            type="button"
            key="hinted"
            className={styles.revertSeparatorHint}
            onClick={handleHintClick}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.6 }}
            transition={reduceMotion ? { duration: 0 } : tweenIOSFast}
            aria-label={t('revert.revealRevert')}
          >
            <span className={styles.revertSeparatorHintLabel}>
              <UndoOutlined /> {t('revert.clickToRevert')}
            </span>
          </motion.button>
        )}
        {phase === 'armed' && (
          <motion.button
            type="button"
            key="armed"
            className={styles.revertSeparatorArmed}
            onClick={handleClick}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={reduceMotion ? { duration: 0 } : { ...tweenIOS, ...springSnappy }}
            aria-label={label}
          >
            <ExclamationCircleFilled className={styles.revertSeparatorArmedIcon} />
            <span>{label}</span>
            <span className={styles.revertSeparatorHintText}>
              {t('revert.clickToConfirm')}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
