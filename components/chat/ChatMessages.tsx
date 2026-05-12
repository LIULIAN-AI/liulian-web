'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import type { Message, TraceStep } from './types';
import MessageBubble from './MessageBubble';
import RevertSeparator from './RevertSeparator';
import TraceAccordion from './TraceAccordion';
import { tweenIOSFast } from './motion';
import styles from './chat.module.css';

function calculateElapsedSeconds(traces: TraceStep[]): number {
  if (traces.length === 0) return 0;
  const first = traces[0]?.timestamp;
  if (typeof first !== 'number') return 0;
  return Math.max(0, Math.round((Date.now() - first) / 1000));
}

interface ResponseNoticeProps {
  traces: TraceStep[];
  isStreaming: boolean;
  /** Show the notice only after this many elapsed seconds. Undefined = never. */
  deferAfterSeconds?: number;
}

/**
 * Standalone "Performing deep professional analysis..." banner. Renders only
 * once the orchestration has been streaming for >deferAfterSeconds, so quick
 * answers don't get a noisy hint. Sits ABOVE the streaming TraceAccordion.
 */
function ResponseNotice({ traces, isStreaming, deferAfterSeconds }: ResponseNoticeProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const [, setTick] = useState(0);
  const elapsedSeconds = calculateElapsedSeconds(traces);

  useEffect(() => {
    if (!isStreaming) return;
    if (typeof deferAfterSeconds !== 'number') return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [isStreaming, deferAfterSeconds]);

  if (!isStreaming) return null;
  if (typeof deferAfterSeconds !== 'number') return null;
  if (elapsedSeconds < deferAfterSeconds) return null;

  return (
    <motion.div
      className={`${styles.analysisNotice} ${styles.analysisNoticeStreaming}`}
      role="status"
      initial={reduceMotion ? false : { opacity: 0, y: -4 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : tweenIOSFast}
    >
      <span className={styles.analysisNoticeTitle}>
        <InfoCircleOutlined />
        <span>{t('intro.analysisTitle')}</span>
        <Spin size="small" />
      </span>
      <span className={styles.analysisNoticeMeta}>
        <span>{t('intro.analysisHint')}</span>
        <span className={styles.analysisNoticeTimer}>{t('intro.elapsed', { seconds: elapsedSeconds })}</span>
      </span>
    </motion.div>
  );
}

interface ChatMessagesProps {
  messages: Message[];
  activeTraces: TraceStep[];
  isStreaming: boolean;
  highlightedMessageIndex?: number | null;
  onRequestRevert?: (messageId: string) => void;
  onRequestEdit?: (messageId: string, content: string) => void;
  onRequestRegenerate?: (messageId: string) => void;
  onInsertToInput?: (text: string) => void;
}

function isSuggestionsOnlyStep(traces: TraceStep[]): boolean {
  if (traces.length === 0) return false;
  const latestTrace = traces[traces.length - 1];
  const message =
    typeof latestTrace?.data?.message === 'string' ? latestTrace.data.message.toLowerCase() : '';

  return (
    message.includes('generating follow-up suggestions') ||
    message.includes('generate follow-up suggestions') ||
    message.includes('generating following suggestions') ||
    message.includes('generate following suggestions')
  );
}

const NEAR_BOTTOM_THRESHOLD_PX = 80;

export default function ChatMessages({
  messages,
  activeTraces,
  isStreaming,
  highlightedMessageIndex = null,
  onRequestRevert,
  onRequestEdit,
  onRequestRegenerate,
  onInsertToInput,
}: ChatMessagesProps) {
  const t = useTranslations('Chat');
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const [pendingNewCount, setPendingNewCount] = useState(0);
  const reduceMotion = useReducedMotion();

  // Filter out superseded messages from the visible thread (they remain
  // in state for audit replay).
  const visibleMessages = useMemo(
    () =>
      messages
        .map((msg, originalIndex) => ({ msg, originalIndex }))
        .filter(({ msg }) => !msg.supersededAt),
    [messages],
  );

  useEffect(() => {
    if (isPinnedToBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setPendingNewCount(0);
    } else {
      setPendingNewCount((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMessages.length, activeTraces.length]);

  useEffect(() => {
    if (highlightedMessageIndex === null) return;
    messageRefs.current[highlightedMessageIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [highlightedMessageIndex]);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX;
    setIsPinnedToBottom(atBottom);
    if (atBottom) setPendingNewCount(0);
  };

  const jumpToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsPinnedToBottom(true);
    setPendingNewCount(0);
  };

  // The separator sits ABOVE a user message and "discards from this point
  // down" — including that user message itself plus everything that
  // follows. So the count is total visible minus visibleIdx (inclusive).
  const discardFromHere = (visibleIdx: number) =>
    visibleMessages.length - visibleIdx;

  return (
    <div
      className={styles.messagesArea}
      ref={scrollAreaRef}
      onScroll={handleScroll}
    >
      {visibleMessages.length === 0 && activeTraces.length === 0 && !isStreaming && (
        <div className={styles.introCard}>
          <p className={styles.introTitle}>👋 {t('intro.title')}</p>
          <p className={styles.introText}>{t('intro.text')}</p>
        </div>
      )}
      {visibleMessages.map(({ msg, originalIndex }, visibleIdx) => {
        const isHighlighted = highlightedMessageIndex === originalIndex;
        const wrapperClassName = isHighlighted
          ? `${styles.searchMatchItem} ${styles.searchMatchActive}`
          : styles.searchMatchItem;

        // The separator sits ABOVE every user turn that is not the first
        // — hovering it offers to discard that turn and every message
        // beneath it. We skip the first user turn because there's nothing
        // earlier to keep, so a "revert above this" affordance there
        // would just clear the whole thread.
        const discardCount = discardFromHere(visibleIdx);
        const showRevertHere =
          msg.type === 'user' && visibleIdx > 0 && discardCount > 0;

        return (
          <React.Fragment key={msg.id ?? originalIndex}>
            {showRevertHere && (
              <RevertSeparator
                discardCount={discardCount}
                onConfirm={() => onRequestRevert?.(msg.id)}
              />
            )}
            <div
              ref={(element) => {
                messageRefs.current[originalIndex] = element;
              }}
              className={wrapperClassName}
            >
              {/* Completed assistant messages no longer carry the deep-analysis
                  banner — the elapsed time is embedded inside the bubble
                  itself. We keep the trace accordion for users who want to
                  inspect the steps. */}
              {msg.type === 'assistant' && msg.traces.length > 0 && (
                <TraceAccordion
                  key={`completed-${msg.id ?? originalIndex}`}
                  traces={msg.traces}
                />
              )}
              <MessageBubble
                message={msg}
                onRequestRevert={onRequestRevert}
                onRequestEdit={onRequestEdit}
                onRequestRegenerate={onRequestRegenerate}
                onInsertToInput={onInsertToInput}
              />
            </div>
          </React.Fragment>
        );
      })}

      {/* Active (in-progress) orchestration. We render the panel as soon as
          streaming starts — even before the first trace event lands — so the
          user always sees the harness reacting to their send. The deep-
          analysis hint is a sibling notice that appears ONLY after >4s, and
          the panel below carries `data-with-notice` so its own top spacing
          can grow to keep the two from visually crowding each other. */}
      {isStreaming && (
        <>
          <ResponseNotice
            traces={activeTraces}
            isStreaming={isStreaming}
            deferAfterSeconds={isSuggestionsOnlyStep(activeTraces) ? undefined : 4}
          />
          <TraceAccordion
            key={`streaming-${visibleMessages[visibleMessages.length - 1]?.msg.id ?? visibleMessages.length}`}
            traces={activeTraces}
            isStreaming={isStreaming}
          />
        </>
      )}

      <div ref={bottomRef} />

      <AnimatePresence>
        {!isPinnedToBottom && pendingNewCount > 0 && (
          <motion.button
            type="button"
            className={styles.newMessagesIndicator}
            onClick={jumpToBottom}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={reduceMotion ? { duration: 0 } : tweenIOSFast}
          >
            <ArrowDownOutlined /> {pendingNewCount === 1
              ? t('intro.newMessage', { count: pendingNewCount })
              : t('intro.newMessages', { count: pendingNewCount })}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
