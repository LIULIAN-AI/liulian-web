'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  DislikeFilled,
  DislikeOutlined,
  LikeFilled,
  LikeOutlined,
  SoundOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { Tooltip, message as antdMessage } from 'antd';
import type { MessageFeedback } from './types';
import { detectBcp47Lang, pickVoiceForLang, splitForTts } from './tts-lang';
import { pressableIcon, springSnappy, tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface AssistantFeedbackProps {
  feedback: MessageFeedback;
  onChange: (feedback: MessageFeedback) => void;
  /** Assistant content used for read-aloud (TTS). */
  content: string;
}

export default function AssistantFeedback({
  feedback,
  onChange,
  content,
}: AssistantFeedbackProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const queueRef = useRef<SpeechSynthesisUtterance[]>([]);

  // Voices are populated asynchronously by the browser. Poll once on
  // mount and listen for voiceschanged so the lang→voice match is ready
  // by the time the user clicks the speaker.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const update = () => {
      if (synth.getVoices().length > 0) setVoicesReady(true);
    };
    update();
    synth.addEventListener?.('voiceschanged', update);
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, []);

  const toggle = (next: Exclude<MessageFeedback, null>) => {
    onChange(feedback === next ? null : next);
  };

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      antdMessage.info({ content: t('feedback.ttsUnsupported'), duration: 2.5 });
      return;
    }
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
      return;
    }

    // Split the message into language-coherent chunks so a mixed
    // CN/EN answer reads each portion with the right voice.
    const chunks = splitForTts(content);
    if (chunks.length === 0) return;

    synth.cancel();
    queueRef.current = [];

    const allVoices = synth.getVoices();
    const utterances = chunks.map((chunk, idx) => {
      const lang = detectBcp47Lang(chunk.text) ?? chunk.lang ?? 'en-US';
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      utterance.lang = lang;
      const voice = pickVoiceForLang(allVoices, lang);
      if (voice) utterance.voice = voice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        if (idx === utterances.length - 1) setIsSpeaking(false);
      };
      utterance.onerror = () => setIsSpeaking(false);
      return utterance;
    });

    queueRef.current = utterances;
    utterances.forEach((u) => synth.speak(u));
    setIsSpeaking(true);
  };

  const ttsSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  void voicesReady; // referenced to keep the effect-driven re-render

  return (
    <div className={styles.assistantFeedback} role="group" aria-label={t('feedback.responseFeedback')}>
      <Tooltip
        title={
          feedback === 'up'
            ? t('feedback.helpfulThanks')
            : t('feedback.helpfulSend')
        }
        placement="top"
      >
        <motion.button
          type="button"
          className={`${styles.assistantActionBtn} ${
            feedback === 'up' ? styles.actionBtnSuccess : ''
          }`}
          onClick={() => toggle('up')}
          aria-label={t('feedback.thumbsUp')}
          aria-pressed={feedback === 'up'}
          whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
          whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
          transition={springSnappy}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={feedback === 'up' ? 'up-filled' : 'up-outline'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={tweenIOSFast}
              style={{ display: 'inline-flex' }}
            >
              {feedback === 'up' ? <LikeFilled /> : <LikeOutlined />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </Tooltip>
      <Tooltip
        title={
          feedback === 'down'
            ? t('feedback.unhelpfulFlag')
            : t('feedback.unhelpfulSend')
        }
        placement="top"
      >
        <motion.button
          type="button"
          className={`${styles.assistantActionBtn} ${
            feedback === 'down' ? styles.actionBtnDanger : ''
          }`}
          onClick={() => toggle('down')}
          aria-label={t('feedback.thumbsDown')}
          aria-pressed={feedback === 'down'}
          whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
          whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
          transition={springSnappy}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={feedback === 'down' ? 'down-filled' : 'down-outline'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={tweenIOSFast}
              style={{ display: 'inline-flex' }}
            >
              {feedback === 'down' ? <DislikeFilled /> : <DislikeOutlined />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </Tooltip>
      {ttsSupported && (
        <Tooltip
          title={isSpeaking ? t('feedback.stopReading') : t('feedback.readAloud')}
          placement="top"
        >
          <motion.button
            type="button"
            className={`${styles.assistantActionBtn} ${
              isSpeaking ? styles.actionBtnActive : ''
            }`}
            onClick={handleReadAloud}
            aria-label={isSpeaking ? t('feedback.stopReadingLabel') : t('feedback.readAloudLabel')}
            whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
            whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
            transition={springSnappy}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isSpeaking ? 'pause' : 'play'}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={tweenIOSFast}
                style={{ display: 'inline-flex' }}
              >
                {isSpeaking ? <PauseOutlined /> : <SoundOutlined />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </Tooltip>
      )}
    </div>
  );
}
