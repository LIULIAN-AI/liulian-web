'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useChatContext } from './hooks/useChatContext';
import ChatPanel from './ChatPanel';
import { ProfessionalPersonaIcon, pickRandomPersona, type PersonaType } from './ProfessionalPersonaIcon';
import { launcherBubble, pressableIcon, springSnappy } from './motion';
import styles from './chat.module.css';

export default function ChatBubble() {
  const t = useTranslations('Chat');
  const { state, setPanelState } = useChatContext();
  const [mounted, setMounted] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [persona, setPersona] = useState<PersonaType>(() => pickRandomPersona());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.panelState === 'closed') {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.type === 'assistant') {
        setHasUnread(true);
      }
    } else {
      setHasUnread(false);
    }
  }, [state.messages, state.panelState]);

  const handleBubbleClick = () => {
    if (state.panelState === 'closed') {
      setPersona(pickRandomPersona());
      setPanelState('default');
      setHasUnread(false);
    } else {
      setPanelState('closed');
    }
  };

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {state.panelState !== 'closed' && (
          <ChatPanel key="chat-panel" persona={persona} />
        )}
      </AnimatePresence>
      <motion.button
        className={styles.bubble}
        onClick={handleBubbleClick}
        aria-label={t('a11y.toggleChat')}
        variants={reduceMotion ? undefined : launcherBubble}
        initial="initial"
        animate="animate"
        whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
        whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
        transition={springSnappy}
      >
        <ProfessionalPersonaIcon persona={persona} />
        <AnimatePresence>
          {hasUnread && (
            <motion.span
              className={styles.unreadDot}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={springSnappy}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
