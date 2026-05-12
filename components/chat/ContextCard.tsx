'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  PaperClipOutlined,
  RightOutlined,
  PushpinFilled,
  AimOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { message as antdMessage, Tooltip } from 'antd';
import { cardInject, collapse, pressableIcon, springSnappy, tweenIOSFast } from './motion';
import { componentLabel, fieldLabel, fieldValue } from './contextI18n';
import styles from './chat.module.css';

interface ContextCardProps {
  component: string;
  data: Record<string, any>;
  sourceId?: string;
  sourcePath?: string;
  onInsertToInput?: (text: string) => void;
}

const FLASH_CLASS = 'nbk-context-source-flash';
const FLASH_DURATION_MS = 1600;
const PENDING_REVEAL_KEY = 'nbk_pending_reveal_v1';

function highlight(node: HTMLElement) {
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  node.classList.remove(FLASH_CLASS);
  // Force reflow so the animation can replay if the user clicks twice.
  void node.offsetWidth;
  node.classList.add(FLASH_CLASS);
  window.setTimeout(() => node.classList.remove(FLASH_CLASS), FLASH_DURATION_MS);
}

function findSourceTarget(sourceId: string): HTMLElement | null {
  const node = document.querySelector(`[data-inject-source-id="${sourceId}"]`);
  if (!node) return null;
  // CSS-modules hash the class name (chat_botIconContainer__xxxx) so we
  // match by substring rather than the literal class.
  return (
    (node.closest('[class*="botIconContainer"]') as HTMLElement | null) ??
    (node.closest('[data-bot-icon-container]') as HTMLElement | null) ??
    (node.parentElement as HTMLElement | null) ??
    (node as HTMLElement)
  );
}

function attemptReveal(sourceId: string): boolean {
  const target = findSourceTarget(sourceId);
  if (!target) return false;
  highlight(target);
  return true;
}

function pollForSource(sourceId: string, deadlineMs: number) {
  const start = Date.now();
  const tick = () => {
    if (attemptReveal(sourceId)) return;
    if (Date.now() - start > deadlineMs) return;
    window.requestAnimationFrame(tick);
  };
  tick();
}

export default function ContextCard({ component, data, sourceId, sourcePath, onInsertToInput }: ContextCardProps) {
  const t = useTranslations('Chat');
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  const bankName = data.bankName ?? data.bank_name ?? '';
  const compLabel = componentLabel(t, component);
  const label = bankName ? `${compLabel} — ${bankName}` : compLabel;

  const displayEntries = Object.entries(data ?? {}).filter(
    ([, v]) => typeof v !== 'object' || v === null,
  );
  // Some pages inject only nested objects (chart data, arrays); without
  // a fallback the expanded view would be a blank panel.
  const hasDetails = displayEntries.length > 0;

  const handleReveal = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!sourceId) return;

    if (attemptReveal(sourceId)) return;

    // Source isn't on the current page. If we know where it lives, route
    // there and let the post-mount poll do the highlight pulse.
    if (sourcePath) {
      const here = `${window.location.pathname}${window.location.search}`;
      if (sourcePath !== here) {
        try {
          window.sessionStorage.setItem(
            PENDING_REVEAL_KEY,
            JSON.stringify({ sourceId, ts: Date.now() }),
          );
        } catch {
          /* private mode / quota — best-effort */
        }
        antdMessage.loading({
          content: t('context.jumpingBack'),
          duration: 1.2,
        });
        router.push(sourcePath);
        // Try again as the new route mounts (gives React up to ~1.5s).
        pollForSource(sourceId, 1500);
        return;
      }
    }

    antdMessage.info({
      content: t('context.sourceNotOnPage'),
      duration: 2.5,
    });
  };

  return (
    <motion.div
      variants={reduceMotion ? undefined : cardInject}
      initial="initial"
      animate="animate"
    >
      <div className={styles.contextCardHeader}>
        <PushpinFilled />
        <span>{t('context.attached')}</span>
        {onInsertToInput && (
          <Tooltip title={t('context.insertToInput')} placement="top">
            <motion.button
              type="button"
              className={styles.contextRevealBtn}
              onClick={(e) => {
                e.stopPropagation();
                const summary = displayEntries.map(([k, v]) => `${fieldLabel(t, k)}: ${fieldValue(t, k, v)}`).join(', ');
                onInsertToInput(`[${label}] ${summary}`);
              }}
              aria-label={t('context.insertToInput')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <ImportOutlined />
            </motion.button>
          </Tooltip>
        )}
        {sourceId && (
          <Tooltip title={t('context.jumpBack')} placement="top">
            <motion.button
              type="button"
              className={styles.contextRevealBtn}
              onClick={handleReveal}
              aria-label={t('context.revealSource')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <AimOutlined />
            </motion.button>
          </Tooltip>
        )}
      </div>
      <div className={styles.contextCardBody}>
        <motion.div
          className={styles.contextSummary}
          onClick={() => setExpanded(!expanded)}
          whileHover={reduceMotion ? undefined : { x: 1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={springSnappy}
        >
          <PaperClipOutlined />
          <span>{label}</span>
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={tweenIOSFast}
            style={{ display: 'inline-flex' }}
          >
            <RightOutlined style={{ fontSize: 10 }} />
          </motion.span>
        </motion.div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              className={styles.contextDetail}
              variants={reduceMotion ? undefined : collapse}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ overflow: 'hidden' }}
            >
              {hasDetails ? (
                displayEntries.map(([key, val]) => (
                  <div key={key} className={styles.contextDetailRow}>
                    <span className={styles.contextDetailKey}>{fieldLabel(t, key)}</span>
                    <span>{fieldValue(t, key, val)}</span>
                  </div>
                ))
              ) : (
                <div className={styles.contextDetailRow}>
                  <span className={styles.contextDetailKey}>{t('context.fieldComponent')}</span>
                  <span>{compLabel}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
