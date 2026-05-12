'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { pressableIcon, springSnappy, tweenIOSFast } from './motion';
import { useActionFeedback } from './hooks/useActionFeedback';
import styles from './chat.module.css';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const t = useTranslations('Chat');
  const [, setHover] = useState(false);
  const reduceMotion = useReducedMotion();
  const { status, fire } = useActionFeedback();

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      fire('success');
    } catch {
      fire('error');
    }
  };

  return (
    <div
      className={styles.codeBlockShell}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.codeBlockBar}>
        <span className={styles.codeBlockLang}>{language ?? 'text'}</span>
        <Tooltip
          title={
            status === 'success'
              ? t('code.copied')
              : status === 'error'
                ? t('code.copyFailed')
                : t('code.copyCode')
          }
        >
          <motion.button
            type="button"
            className={`${styles.codeBlockCopyBtn} ${
              status === 'success' ? styles.actionBtnSuccess : ''
            }`}
            onClick={handleCopy}
            aria-label={t('code.copyCode')}
            whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
            whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
            transition={springSnappy}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status === 'success' ? 'ok' : 'copy'}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={tweenIOSFast}
                style={{ display: 'inline-flex' }}
              >
                {status === 'success' ? <CheckOutlined /> : <CopyOutlined />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </Tooltip>
      </div>
      <pre className={styles.codeBlockBody}>
        <code className={language ? `language-${language}` : undefined}>{code}</code>
      </pre>
    </div>
  );
}
