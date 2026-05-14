'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SearchOutlined } from '@ant-design/icons';
import {
  COMMANDS,
  matchPaletteCommands,
  type CommandDef,
} from './commands';
import { backdrop, panelSlide, tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onRun: (cmd: CommandDef) => void;
}

export default function CommandPalette({ open, onClose, onRun }: CommandPaletteProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const matches = useMemo(() => (open ? matchPaletteCommands(query) : []), [open, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((i) => (matches.length === 0 ? 0 : (i + 1) % matches.length));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((i) =>
          matches.length === 0 ? 0 : (i - 1 + matches.length) % matches.length,
        );
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const target = matches[activeIndex];
        if (target) {
          onRun(target);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, matches, activeIndex, onRun, onClose]);

  // Keep the highlighted row scrolled into view as ↑/↓ moves the
  // selection — without this the cursor walks past the visible area
  // (R8 feedback against SlashAutocomplete; same bug here).
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  useEffect(() => {
    if (!open) return;
    const node = itemRefs.current[activeIndex];
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  // Group by category for visual sectioning when no query.
  const grouped = useMemo(() => {
    const general: CommandDef[] = [];
    const banking: CommandDef[] = [];
    for (const cmd of matches) (cmd.category === 'general' ? general : banking).push(cmd);
    return { general, banking };
  }, [matches]);

  // Portal to document.body so the palette is centered against the
  // viewport, not the chat panel. The panel uses framer-motion transforms
  // which create a containing block, breaking `position: fixed` centering
  // when the palette is rendered as a child.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className={styles.commandPaletteBackdrop}
            aria-label={t('commands.closeCommandPalette')}
            onClick={onClose}
            variants={reduceMotion ? undefined : backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />
          {/* Centering wrapper. The motion.div writes its own
              `transform` for the entrance variant, which overrides the
              old `translate(-50%, -50%)` centering on `.commandPalette`
              and pulls the panel off-center. Use a non-transformed
              fixed-inset grid wrapper to centre, then let motion own
              the transform. */}
          <div className={styles.commandPaletteCentering}>
          <motion.div
            className={styles.commandPalette}
            role="dialog"
            aria-modal="true"
            aria-label={t('commands.commandPalette')}
            variants={reduceMotion ? undefined : panelSlide}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={styles.commandPaletteSearch}>
              <SearchOutlined />
              <input
                autoFocus
                type="text"
                className={styles.commandPaletteInput}
                placeholder={t('commands.searchPlaceholder')}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
              />
              <span className={styles.commandPaletteItemShortcut}>Esc</span>
            </div>
            <ul className={styles.commandPaletteList}>
              {query.trim() === '' ? (
                <>
                  {grouped.general.length > 0 && (
                    <>
                      <li className={styles.commandPaletteSection}>{t('commands.general')}</li>
                      {grouped.general.map((cmd, idx) => (
                        <PaletteRow
                          key={cmd.key}
                          cmd={cmd}
                          active={idx === activeIndex}
                          rowRef={(el) => {
                            itemRefs.current[idx] = el;
                          }}
                          onSelect={() => {
                            onRun(cmd);
                            onClose();
                          }}
                          onHover={() => setActiveIndex(idx)}
                        />
                      ))}
                    </>
                  )}
                  {grouped.banking.length > 0 && (
                    <>
                      <li className={styles.commandPaletteSection}>{t('commands.liulian')}</li>
                      {grouped.banking.map((cmd, idx) => {
                        const flatIdx = grouped.general.length + idx;
                        return (
                          <PaletteRow
                            key={cmd.key}
                            cmd={cmd}
                            active={flatIdx === activeIndex}
                            rowRef={(el) => {
                              itemRefs.current[flatIdx] = el;
                            }}
                            onSelect={() => {
                              onRun(cmd);
                              onClose();
                            }}
                            onHover={() => setActiveIndex(flatIdx)}
                          />
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                matches.map((cmd, idx) => (
                  <PaletteRow
                    key={cmd.key}
                    cmd={cmd}
                    active={idx === activeIndex}
                    rowRef={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    onSelect={() => {
                      onRun(cmd);
                      onClose();
                    }}
                    onHover={() => setActiveIndex(idx)}
                  />
                ))
              )}
              {matches.length === 0 && (
                <li className={styles.commandPaletteSection}>{t('commands.noMatches')}</li>
              )}
            </ul>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface PaletteRowProps {
  cmd: CommandDef;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
  rowRef?: (el: HTMLLIElement | null) => void;
}

function PaletteRow({ cmd, active, onSelect, onHover, rowRef }: PaletteRowProps) {
  const t = useTranslations('Chat');
  const keyTint =
    cmd.category === 'banking'
      ? styles.slashMenuItemKeyBanking
      : styles.slashMenuItemKeyGeneral;
  return (
    <li ref={rowRef}>
      <button
        type="button"
        className={`${styles.commandPaletteItem} ${active ? styles.commandPaletteItemActive : ''}`}
        onClick={onSelect}
        onMouseEnter={onHover}
      >
        <span className={`${styles.slashMenuItemKey} ${keyTint}`}>
          {cmd.label}
          {cmd.aliases && cmd.aliases.length > 0 && (
            <span className={styles.commandAliasHint}> · {cmd.aliases.find((a) => /[一-鿿]/.test(a)) ?? cmd.aliases[0]}</span>
          )}
        </span>
        <span className={styles.commandPaletteItemDesc}>{t(`commands.desc_${cmd.key}`)}</span>
        {cmd.shortcut && (
          <span className={styles.commandPaletteItemShortcut}>{cmd.shortcut}</span>
        )}
      </button>
    </li>
  );
}

export { COMMANDS };
