'use client';

import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckOutlined, CopyOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { Message } from './types';
import { useActionFeedback } from './hooks/useActionFeedback';
import { pressableIcon, springSnappy, tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface MessageActionsProps {
  message: Message;
  onEdit?: () => void;
  onRevert?: () => void;
  onRegenerate?: () => void;
}

/** Hover-revealed three-piece toolbar that floats beside a user message:
 *  Copy · Edit & resend (forks a new branch) · Regenerate the answer.
 *  Edit/Regenerate truncate the active thread (audit-preserved via
 *  `supersededAt`), so they live behind clear, distinct icons. */
export default function MessageActions({
  message,
  onEdit,
  onRevert,
  onRegenerate,
}: MessageActionsProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const copyFeedback = useActionFeedback();

  if (message.type !== 'user') return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(message.content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = message.content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      copyFeedback.fire('success');
    } catch {
      copyFeedback.fire('error');
    }
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleRegenerate = () => {
    // Regenerate = re-run from this user message → truncate everything
    // after it and let the parent re-issue the same query.
    onRevert?.();
    onRegenerate?.();
  };

  return (
    <div className={styles.userActions} role="toolbar" aria-label={t('toolbar.messageActions')}>
      <Tooltip
        title={
          copyFeedback.status === 'success'
            ? t('toolbar.copiedToClipboard')
            : copyFeedback.status === 'error'
              ? t('toolbar.copyFailed')
              : t('toolbar.copyMessage')
        }
        placement="top"
      >
        <motion.button
          type="button"
          className={`${styles.userActionBtn} ${
            copyFeedback.status === 'success' ? styles.actionBtnSuccess : ''
          }`}
          onClick={handleCopy}
          aria-label={t('toolbar.copyMessage')}
          whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
          whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
          transition={springSnappy}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copyFeedback.status === 'success' ? 'copied' : 'copy'}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={tweenIOSFast}
              style={{ display: 'inline-flex' }}
            >
              {copyFeedback.status === 'success' ? <CheckOutlined /> : <CopyOutlined />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </Tooltip>
      <Tooltip
        title={t('toolbar.editResend')}
        placement="top"
      >
        <motion.button
          type="button"
          className={styles.userActionBtn}
          onClick={handleEdit}
          aria-label={t('toolbar.editAndResend')}
          whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
          whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
          transition={springSnappy}
        >
          <EditOutlined />
        </motion.button>
      </Tooltip>
      <Tooltip
        title={t('toolbar.regenerateHint')}
        placement="top"
      >
        <motion.button
          type="button"
          className={styles.userActionBtn}
          onClick={handleRegenerate}
          aria-label={t('toolbar.regenerateResponse')}
          whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
          whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
          transition={springSnappy}
        >
          <ReloadOutlined />
        </motion.button>
      </Tooltip>
    </div>
  );
}
