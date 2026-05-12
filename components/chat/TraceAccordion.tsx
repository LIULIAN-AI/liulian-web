'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spin } from 'antd';
import {
  SearchOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  DownOutlined,
  RightOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons';
import type { TraceStep } from './types';
import styles from './chat.module.css';

const TRACE_ICONS: Record<string, React.ReactNode> = {
  thinking: <SearchOutlined />,
  intent: <BulbOutlined />,
  tool_call: <ToolOutlined />,
  tool_result: <CheckCircleOutlined />,
};

type ThinkingPattern = [RegExp, string];

const THINKING_PATTERNS: ThinkingPattern[] = [
  [/^Classifying your question/i, 'trace.classifying'],
  [/^Calling LLM for intent/i, 'trace.callingLLMIntent'],
  [/^Generating conversational response/i, 'trace.generatingConversation'],
  [/^Planning next action/i, 'trace.planningNext'],
  [/^Generating follow-up suggestions/i, 'trace.generatingSuggestions'],
  [/^Answered directly from injected context/i, 'trace.answeredFromContext'],
  [/^Sending request/i, 'trace.sendingRequest'],
  [/^Cross-verifying/i, 'trace.crossVerifying'],
  [/^Processing/i, 'trace.processing'],
  [/^Matched .+ shortcut$/i, 'trace.matchedShortcut'],
];

function translateThinking(t: ReturnType<typeof useTranslations<'Chat'>>, msg: string): string {
  for (const [pattern, key] of THINKING_PATTERNS) {
    if (pattern.test(msg)) return t(key as any);
  }
  return msg;
}

function createTraceLabel(t: ReturnType<typeof useTranslations<'Chat'>>) {
  return (step: TraceStep): string => {
    switch (step.event) {
      case 'thinking': {
        const msg = step.data?.message;
        if (!msg) return t('trace.thinking');
        return translateThinking(t, msg);
      }
      case 'intent':
        return t('trace.intent', { intent: step.data?.intent ?? 'classifying' });
      case 'tool_call':
        return t('trace.callingTool', { tool: step.data?.tool ?? 'tool' });
      case 'tool_result':
        return t('trace.gotResult', { tool: step.data?.tool ?? 'tool' });
      default:
        return step.event;
    }
  };
}

type Mode = 'collapsed' | 'scroll' | 'expanded';

const NEXT_MODE: Record<Mode, Mode> = {
  scroll: 'expanded',
  expanded: 'collapsed',
  collapsed: 'scroll',
};

const MODE_LABEL_KEY: Record<Mode, string> = {
  scroll: 'trace.compact',
  expanded: 'trace.expanded',
  collapsed: 'trace.hidden',
};

interface TraceAccordionProps {
  traces: TraceStep[];
  isStreaming?: boolean;
}

export default function TraceAccordion({ traces, isStreaming }: TraceAccordionProps) {
  const t = useTranslations('Chat');
  const traceLabel = createTraceLabel(t);
  // Compact (scroll) by default — the user wants to *see* the harness
  // working in a fixed-height window without it dominating the panel.
  // Cycle order: scroll → expanded → collapsed → scroll, so a single
  // click can hide the panel if it ever gets in the way.
  const [mode, setMode] = useState<Mode>('scroll');
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // While streaming, keep the panel pinned to the latest step so the
  // user always sees what's happening NOW (only relevant once the user
  // has opened it into scroll mode).
  useEffect(() => {
    if (mode !== 'scroll') return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [traces.length, mode]);

  // Continuous scroll-chain: when the inner scroller hits an edge, redirect
  // any further wheel motion straight into the outer .messagesArea in the
  // same frame. CSS `overscroll-behavior-y: auto` alone causes a brief
  // hand-off pause at the edge — R8 feedback wanted no pause.
  useEffect(() => {
    if (mode !== 'scroll') return;
    const inner = scrollRef.current;
    if (!inner) return;
    const handleWheel = (e: WheelEvent) => {
      const atTop = inner.scrollTop <= 0;
      const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;
      if ((goingDown && atBottom) || (goingUp && atTop)) {
        const outer = inner.closest<HTMLElement>(`.${styles.messagesArea}`);
        if (outer) {
          outer.scrollTop += e.deltaY;
          e.preventDefault();
        }
      }
    };
    inner.addEventListener('wheel', handleWheel, { passive: false });
    return () => inner.removeEventListener('wheel', handleWheel);
  }, [mode]);

  // While streaming we render the panel even before the first trace
  // event arrives so the user sees the harness immediately on send (R8
  // feedback: turn 2+ was missing the orchestration during thinking).
  // Once streaming ends with no traces we collapse cleanly.
  if (traces.length === 0 && !isStreaming) return null;

  const cycleMode = () => setMode((m) => NEXT_MODE[m]);
  const toggleStep = (i: number) =>
    setOpenSteps((prev) => ({ ...prev, [i]: !prev[i] }));

  // We surface this as "Orchestration" rather than "thinking" because
  // the harness is precisely controlling the data-flow steps (intent →
  // tool calls → tool results), not narrating a model's stream of
  // consciousness.
  const headerLabel = isStreaming
    ? traces.length === 0
      ? t('trace.orchestratingStarting')
      : t('trace.orchestrating', { count: traces.length })
    : t('trace.orchestration', { count: traces.length });

  return (
    <div
      className={`${styles.thinkingPanel} ${
        isStreaming ? styles.thinkingPanelStreaming : ''
      }`}
    >
      <button
        type="button"
        className={styles.thinkingHeader}
        onClick={cycleMode}
        aria-label={t('trace.toggleView', { mode: t(MODE_LABEL_KEY[mode]) })}
      >
        <span className={styles.thinkingHeaderTitle}>
          {mode === 'collapsed' ? <RightOutlined /> : <DownOutlined />}
          <span>{headerLabel}</span>
          {isStreaming && <Spin size="small" />}
        </span>
        <span className={styles.thinkingModeBtn}>
          <ColumnHeightOutlined /> {t(MODE_LABEL_KEY[mode])}
        </span>
      </button>
      {mode !== 'collapsed' && (
        <div
          ref={scrollRef}
          className={`${styles.thinkingBody} ${
            mode === 'scroll' ? styles.thinkingBodyScroll : ''
          }`}
        >
          {traces.length === 0 && isStreaming && (
            <div className={styles.thinkingStep}>
              <span className={styles.thinkingStepLabel}>
                <Spin size="small" />
                <span>{t('trace.startingOrchestration')}</span>
              </span>
            </div>
          )}
          {traces.map((step, i) => (
            <div key={`${step.event}-${i}`} className={styles.thinkingStep}>
              <span
                className={styles.thinkingStepLabel}
                role="button"
                tabIndex={0}
                onClick={() => toggleStep(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleStep(i);
                  }
                }}
              >
                {TRACE_ICONS[step.event] ?? <ToolOutlined />}
                <span>{traceLabel(step)}</span>
                {isStreaming && i === traces.length - 1 && <Spin size="small" />}
              </span>
              {openSteps[i] && (
                <pre className={styles.thinkingStepDetail}>
                  {JSON.stringify(step.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
