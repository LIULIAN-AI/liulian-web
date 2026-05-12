'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { chipsContainer, chipItem, springSnappy } from './motion';
import styles from './chat.module.css';

interface SuggestedChipsProps {
  chips: string[];
  /** Receives the chip text plus its on-screen rect so the parent can
   *  animate a flying ghost from the chip's position to the input box. */
  onChipClick: (chip: string, rect: DOMRect | null) => void;
}

const CONTEXT_CHIP_PREFIX = 'context.chip';

export default function SuggestedChips({ chips, onChipClick }: SuggestedChipsProps) {
  const reduceMotion = useReducedMotion();
  const t = useTranslations('Chat');
  if (chips.length === 0) return null;

  const resolveChip = (chip: string): string => {
    if (chip.startsWith(CONTEXT_CHIP_PREFIX)) return t(chip as any);
    return chip;
  };

  const handleClick = (chip: string, event: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChipClick(resolveChip(chip), rect);
  };

  return (
    <motion.div
      className={styles.chipsContainer}
      variants={reduceMotion ? undefined : chipsContainer}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            type="button"
            key={chip}
            className={styles.suggestionChip}
            onClick={(event) => handleClick(chip, event)}
            variants={reduceMotion ? undefined : chipItem}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            transition={springSnappy}
          >
            {resolveChip(chip)}
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
