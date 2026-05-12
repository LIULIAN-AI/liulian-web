'use client';

import { useTranslations } from 'next-intl';
import { Tooltip } from 'antd';
import { GlobalOutlined, ThunderboltOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import { useChatContext } from './hooks/useChatContext';
import { pressable, springSnappy } from './motion';
import type { OnlineMode } from './types';
import styles from './chat.module.css';

interface OptionDef {
  mode: OnlineMode;
  labelKey: string;
  glyph: React.ReactNode;
  hintKey: string;
}

const OPTIONS: OptionDef[] = [
  { mode: 'always', labelKey: 'online.always', glyph: <ThunderboltOutlined />, hintKey: 'online.alwaysHint' },
  { mode: 'fallback', labelKey: 'online.fallback', glyph: <GlobalOutlined />, hintKey: 'online.fallbackHint' },
  { mode: 'ask', labelKey: 'online.ask', glyph: <QuestionCircleOutlined />, hintKey: 'online.askHint' },
];

export default function OnlineModeToggle() {
  const t = useTranslations('Chat');
  const { state, setOnlineMode } = useChatContext();
  const reduceMotion = useReducedMotion();
  const current = state.onlineMode;

  return (
    <div className={styles.onlineModeToggle} role="radiogroup" aria-label={t('online.searchMode')}>
      <span className={styles.onlineModeLabel}>{t('online.label')}</span>
      {OPTIONS.map((opt) => {
        const active = current === opt.mode;
        return (
          <Tooltip key={opt.mode} title={t(opt.hintKey)} mouseEnterDelay={0.15}>
            <motion.button
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.onlineModeBtn} ${active ? styles.onlineModeBtnActive : ''}`}
              onClick={() => setOnlineMode(opt.mode)}
              whileHover={reduceMotion || active ? undefined : pressable.whileHover}
              whileTap={reduceMotion ? undefined : pressable.whileTap}
              transition={springSnappy}
            >
              <span className={styles.onlineModeBtnGlyph}>{opt.glyph}</span>
              <span className={styles.onlineModeBtnLabel}>{t(opt.labelKey)}</span>
            </motion.button>
          </Tooltip>
        );
      })}
    </div>
  );
}
