'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CloseOutlined, SendOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { backdrop, panelSlide, pressable, pressableIcon, springSnappy, tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface EditMessageModalProps {
  open: boolean;
  initialContent: string;
  /** Number of downstream messages that will be superseded if the user
   *  confirms — surfaced explicitly so the action never feels invisible. */
  discardCount: number;
  onCancel: () => void;
  onSubmit: (content: string) => void;
}

export default function EditMessageModal({
  open,
  initialContent,
  discardCount,
  onCancel,
  onSubmit,
}: EditMessageModalProps) {
  const t = useTranslations('Chat');
  const [value, setValue] = useState(initialContent);
  const reduceMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setValue(initialContent);
      // Defer focus so the modal animation has settled.
      window.requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open, initialContent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, value, onCancel, onSubmit]);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && trimmed !== initialContent.trim();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className={styles.editModalBackdrop}
            aria-label={t('edit.cancelEdit')}
            onClick={onCancel}
            variants={reduceMotion ? undefined : backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('edit.editAndResend')}
            className={styles.editModal}
            variants={reduceMotion ? undefined : panelSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springSnappy}
          >
            <div className={styles.editModalHeader}>
              <span className={styles.editModalTitle}>{t('edit.title')}</span>
              <Tooltip title={t('edit.cancelHint')}>
                <motion.button
                  type="button"
                  className={styles.editModalCloseBtn}
                  onClick={onCancel}
                  aria-label={t('panel.cancel')}
                  whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
                  whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
                  transition={springSnappy}
                >
                  <CloseOutlined />
                </motion.button>
              </Tooltip>
            </div>
            <p className={styles.editModalNote}>
              {discardCount > 0
                ? t('edit.forkNote', { count: discardCount })
                : t('edit.resendNote')}
            </p>
            <textarea
              ref={textareaRef}
              className={styles.editModalTextarea}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={5}
              placeholder={t('edit.placeholder')}
            />
            <div className={styles.editModalFooter}>
              <span className={styles.editModalHint}>{t('edit.shortcutHint')}</span>
              <motion.button
                type="button"
                className={styles.editModalSendBtn}
                onClick={() => canSend && onSubmit(trimmed)}
                disabled={!canSend}
                whileHover={!reduceMotion && canSend ? pressable.whileHover : undefined}
                whileTap={!reduceMotion && canSend ? pressable.whileTap : undefined}
                transition={tweenIOSFast}
              >
                <SendOutlined /> {t('edit.sendNewBranch')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
