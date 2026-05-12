import type { Transition, Variants } from 'framer-motion';

/**
 * Apple HIG iOS easing family. v10: tightened durations and stiffness so
 * the chat panel never feels heavy. Open / close / expand / collapse all
 * settle in <180ms; bubble entrances stay slightly silkier (220ms) so
 * incoming content reads as deliberate.
 */

export const easeIOS: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 38,
  mass: 0.7,
};

export const springSilky: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 34,
  mass: 0.85,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 28,
  mass: 1,
};

export const tweenIOS: Transition = {
  type: 'tween',
  ease: easeIOS,
  duration: 0.2,
};

export const tweenIOSFast: Transition = {
  type: 'tween',
  ease: easeIOS,
  duration: 0.14,
};

/** Standard hover/tap scaling for buttons and pressable surfaces. */
export const pressable = {
  whileHover: { scale: 1.04, y: -1 },
  whileTap: { scale: 0.95 },
  transition: springSnappy,
};

/** Subtler version for icon-only toolbar buttons. */
export const pressableIcon = {
  whileHover: { scale: 1.07 },
  whileTap: { scale: 0.92 },
  transition: springSnappy,
};

/** Message bubble entrance — user from right, assistant from left. */
export const bubbleEnter = (from: 'left' | 'right' = 'left'): Variants => ({
  initial: { opacity: 0, y: 8, x: from === 'right' ? 10 : -10 },
  animate: { opacity: 1, y: 0, x: 0, transition: { ...tweenIOS, duration: 0.22 } },
  exit: { opacity: 0, transition: tweenIOSFast },
});

/** Context card injection — drops down with a soft settle. */
export const cardInject: Variants = {
  initial: { opacity: 0, y: -6, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: tweenIOS },
  exit: { opacity: 0, scale: 0.96, transition: tweenIOSFast },
};

/** Accordion / collapsible content (height auto). */
export const collapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { ...tweenIOS, opacity: { duration: 0.18 } } },
  exit: { opacity: 0, height: 0, transition: { ...tweenIOSFast, opacity: { duration: 0.1 } } },
};

/** Suggested-chips container — stagger children. */
export const chipsContainer: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.035, delayChildren: 0.02 },
  },
};

export const chipItem: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1, transition: tweenIOSFast },
  exit: { opacity: 0, scale: 0.94, transition: tweenIOSFast },
};

/** Reliability badge — quick scale-in. */
export const badgePop: Variants = {
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1, transition: { ...tweenIOSFast, delay: 0.04 } },
};

/** Floating chat bubble (the closed-state launcher). */
export const launcherBubble: Variants = {
  initial: { opacity: 0, scale: 0.7, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { ...tweenIOS, delay: 0.08 } },
};

/** Side panel show/hide. v10: short fade+scale only — the size morph
 *  between default ↔ expanded is driven by a CSS transition on the
 *  .panel class, so framer-motion's `layout` prop is no longer used
 *  (it was the cause of the "everything feels slow" complaint). */
export const panelSlide: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { ...tweenIOS, duration: 0.18 } },
  exit: { opacity: 0, scale: 0.94, y: 6, transition: tweenIOSFast },
};

/** Backdrop for expanded mode. */
export const backdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: tweenIOSFast },
  exit: { opacity: 0, transition: tweenIOSFast },
};

/** Source-list rows — quick stagger entrance. */
export const sourceList: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { staggerChildren: 0.025 } },
};

export const sourceItem: Variants = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0, transition: tweenIOSFast },
};
