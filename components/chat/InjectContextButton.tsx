'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Tooltip } from 'antd';
import { useChatContext } from '@/components/chat/hooks/useChatContext';
import {
  ProfessionalPersonaIcon,
  pickRandomPersona,
  type PersonaType,
} from '@/components/chat/ProfessionalPersonaIcon';
import { springSnappy } from '@/components/chat/motion';
import chatStyles from '@/components/chat/chat.module.css';

export type InjectContextButtonProps = {
  component: string;
  data: Record<string, unknown>;
  ariaLabel?: string;
  className?: string;
  tooltip?: string;
};

const ONBOARD_KEY = 'nbk_inject_seen_v1';

type Visibility = 'always' | 'hover' | 'quiet';

function resolveVisibility(): Visibility {
  if (typeof window === 'undefined') return 'quiet';
  if (new URLSearchParams(window.location.search).get('inject') === 'always') {
    return 'always';
  }
  const fromEnv = (process.env.NEXT_PUBLIC_CHAT_INJECT_VISIBILITY ?? '').toLowerCase();
  if (fromEnv === 'always' || fromEnv === 'hover' || fromEnv === 'quiet') {
    return fromEnv;
  }
  return 'quiet';
}

/** Stable id derived from the card's component + data so the same logical
 *  card mounted on a different page render is recognised by the chat
 *  history's reveal button. Falls back to a random id if hashing fails. */
function deriveSourceId(component: string, data: Record<string, unknown>): string {
  try {
    const identifier =
      (data?.bankCode as string) ??
      (data?.bank_code as string) ??
      (data?.id as string) ??
      (data?.bankName as string) ??
      (data?.bank_name as string) ??
      '';
    let hash = 0;
    const seed = `${component}::${identifier}::${JSON.stringify(data ?? {})}`;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    return `nbk-src-${component}-${(hash >>> 0).toString(36)}`;
  } catch {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `nbk-src-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** Shared "ask the agent about this card" button. Three visibility modes:
 *   - quiet (default): a discreet dot that expands into a full persona on
 *     hover of the parent `.botIconContainer`. Avoids demo-surface clutter.
 *   - hover: hidden until the parent is hovered. Cleanest, but needs
 *     onboarding to be discoverable.
 *   - always: full persona visible at rest — good for screenshots and
 *     demos. Auto-selected via ?inject=always or env flag.
 *  First-visit onboarding pulse plays twice so new demo viewers learn the
 *  affordance without us shouting. */
export function InjectContextButton({
  component,
  data,
  ariaLabel,
  className,
  tooltip,
}: InjectContextButtonProps) {
  const t = useTranslations('Chat');
  const { injectContext } = useChatContext();
  const [persona] = useState<PersonaType>(() => pickRandomPersona());
  const [visibility, setVisibility] = useState<Visibility>('quiet');
  const [showPulse, setShowPulse] = useState(false);
  const reduceMotion = useReducedMotion();
  const sourceId = useMemo(() => deriveSourceId(component, data), [component, data]);

  useEffect(() => {
    setVisibility(resolveVisibility());
    if (typeof window !== 'undefined' && !window.localStorage.getItem(ONBOARD_KEY)) {
      setShowPulse(true);
      const timer = window.setTimeout(() => {
        setShowPulse(false);
        try {
          window.localStorage.setItem(ONBOARD_KEY, '1');
        } catch {
          /* quota — not critical */
        }
      }, 1800);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  const visibilityClass = useMemo(() => {
    if (visibility === 'always') return chatStyles.botIconVisible;
    if (visibility === 'hover') return chatStyles.botIconHoverOnly;
    return chatStyles.botIconQuiet;
  }, [visibility]);

  const handleClick = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(ONBOARD_KEY, '1');
      }
    } catch {
      /* noop */
    }
    const sourcePath =
      typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : undefined;
    injectContext(
      component,
      data as Record<string, unknown> as Record<string, any>,
      sourceId,
      sourcePath,
    );
  };

  const resolvedTooltip = tooltip ?? t('context.askTooltip');

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
    const sourcePath =
      typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : undefined;
    const payload = JSON.stringify({
      component,
      data,
      sourceId: sourceId,
      sourcePath,
    });
    event.dataTransfer.setData('application/x-neobanker-context', payload);
    event.dataTransfer.setData('text/plain', `[Context: ${component}]`);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <span
      className={chatStyles.botIconHost}
      data-inject-source-id={sourceId}
    >
      <Tooltip title={resolvedTooltip} placement="top">
        <span draggable onDragStart={handleDragStart} style={{ display: 'inline-flex' }}>
          <motion.button
            type="button"
            className={`${className ?? chatStyles.botIcon} ${visibilityClass} ${
              showPulse ? chatStyles.botIconPulse : ''
            }`}
            aria-label={ariaLabel ?? t('context.askAbout', { component })}
            onClick={handleClick}
            whileHover={reduceMotion ? undefined : { scale: 1.12, rotate: -6 }}
            whileTap={reduceMotion ? undefined : { scale: 0.9, rotate: -10 }}
            transition={springSnappy}
          >
            <ProfessionalPersonaIcon persona={persona} />
          </motion.button>
        </span>
      </Tooltip>
    </span>
  );
}

export default InjectContextButton;
