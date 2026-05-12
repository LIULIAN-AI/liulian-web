'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { easeIOS } from './motion';
import styles from './chat.module.css';

export interface ChipFlyPayload {
  text: string;
  from: { x: number; y: number; width: number; height: number };
  to: { x: number; y: number };
}

interface ChipFlyOverlayProps {
  payload: ChipFlyPayload | null;
  onComplete: () => void;
}

/** Ghost chip that falls DOWNWARD from a source rect into the input
 *  field. The chip is deliberately not arced — R8 feedback: the old
 *  upward hop read as a "bounce" rather than a hand-off. Pairs with
 *  ChatInput's receiveChip text-drop animation so the two motions read
 *  as a single transfer. Portalled to body so the panel overflow never
 *  clips the flight. */
export default function ChipFlyOverlay({ payload, onComplete }: ChipFlyOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !payload) return null;

  const { text, from, to } = payload;

  return createPortal(
    <motion.div
      className={styles.chipFlyGhost}
      initial={{
        left: from.x,
        top: from.y,
        width: from.width,
        height: from.height,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        // Direct downward/lateral slide — no arcLift. The chip "falls"
        // into the input.
        left: to.x,
        top: to.y + 6,
        width: Math.max(from.width * 0.78, 120),
        height: from.height * 0.9,
        // Gentle squash at the end to suggest landing.
        scaleY: [1, 1, 0.85],
        opacity: [1, 1, 0],
      }}
      transition={{
        // R8 v2: stretched from 0.32 → 0.6s so the trail is unmistakably
        // visible. Opacity holds full alpha until 75% of the flight then
        // fades out, letting the user follow the chip almost all the way
        // into the input before it dissolves.
        duration: 0.6,
        ease: easeIOS,
        opacity: { duration: 0.6, ease: easeIOS, times: [0, 0.75, 1] },
        scaleY: { duration: 0.6, ease: easeIOS, times: [0, 0.85, 1] },
      }}
      onAnimationComplete={onComplete}
    >
      <span>{text}</span>
    </motion.div>,
    document.body,
  );
}
