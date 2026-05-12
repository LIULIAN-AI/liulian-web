'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { matchSlashCommands, type CommandDef } from './commands';
import { tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface SlashAutocompleteProps {
  query: string;
  /** Currently active item index — controlled from the parent so arrow
   *  keys move through the menu without losing focus on the input. */
  activeIndex: number;
  onActiveIndexChange: (idx: number) => void;
  onSelect: (cmd: CommandDef) => void;
}

export default function SlashAutocomplete({
  query,
  activeIndex,
  onActiveIndexChange,
  onSelect,
}: SlashAutocompleteProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const matches = useMemo(() => matchSlashCommands(query), [query]);
  const safeIndex = matches.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), matches.length - 1);

  useEffect(() => {
    if (matches.length > 0 && (activeIndex < 0 || activeIndex >= matches.length)) {
      onActiveIndexChange(0);
    }
  }, [matches.length, activeIndex, onActiveIndexChange]);

  // Keep the highlighted row in view as ↑/↓ moves the selection. Without
  // this the menu's internal scroll could lag the cursor and hide the
  // current selection (R8 feedback).
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (safeIndex < 0) return;
    const node = itemRefs.current[safeIndex];
    node?.scrollIntoView({ block: 'nearest' });
  }, [safeIndex]);

  if (matches.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.slashMenu}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={reduceMotion ? { duration: 0 } : tweenIOSFast}
        role="listbox"
        aria-label={t('commands.slashCommands')}
      >
        {matches.map((cmd, idx) => {
          const keyTint =
            cmd.category === 'banking'
              ? styles.slashMenuItemKeyBanking
              : styles.slashMenuItemKeyGeneral;
          const tagTint =
            cmd.category === 'banking'
              ? styles.slashMenuItemTagBanking
              : styles.slashMenuItemTagGeneral;
          return (
            <button
              type="button"
              key={cmd.key}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              className={`${styles.slashMenuItem} ${
                idx === safeIndex ? styles.slashMenuItemActive : ''
              }`}
              onMouseEnter={() => onActiveIndexChange(idx)}
              onClick={() => onSelect(cmd)}
              role="option"
              aria-selected={idx === safeIndex}
            >
              <span className={`${styles.slashMenuItemKey} ${keyTint}`}>
                {cmd.label}
                {cmd.aliases && cmd.aliases.length > 0 && (
                  <span className={styles.commandAliasHint}> · {cmd.aliases.find((a) => /[一-鿿]/.test(a)) ?? cmd.aliases[0]}</span>
                )}
              </span>
              <span className={styles.slashMenuItemDesc}>{t(`commands.desc_${cmd.key}`)}</span>
              <span className={`${styles.slashMenuItemTag} ${tagTint}`}>{cmd.category === 'banking' ? t('commands.neobanker') : t('commands.general')}</span>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
