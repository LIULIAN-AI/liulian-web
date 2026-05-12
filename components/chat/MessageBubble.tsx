'use client';

import { useRef, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  CheckOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useChatContext } from './hooks/useChatContext';
import { useSSE } from './hooks/useSSE';
import { useActionFeedback } from './hooks/useActionFeedback';
import type { Message, MessageFeedback, ReliabilityEnvelope } from './types';
import ContextCard from './ContextCard';
import ReliabilityBadge from './ReliabilityBadge';
import SourcesFooter from './SourcesFooter';
import MarkdownView from './MarkdownView';
import { useOptionalCanvasContext } from '@/components/assistant/hooks/useCanvasContext';
import InlineBIWidget, { type ChartSpec } from './InlineBIWidget';
import FollowUpChips from './FollowUpChips';
import BankPreviewCard from './BankPreviewCard';
import MessageActions from './MessageActions';
import AssistantFeedback from './AssistantFeedback';
import { bubbleEnter, pressable, pressableIcon, springSnappy, tweenIOSFast } from './motion';
import styles from './chat.module.css';

interface MessageBubbleProps {
  message: Message;
  onRequestRevert?: (messageId: string) => void;
  onRequestEdit?: (messageId: string, content: string) => void;
  onRequestRegenerate?: (messageId: string) => void;
  onInsertToInput?: (text: string) => void;
}

const OFFER_WEB_SEARCH_MARKER = '[offer_web_search]';
const LONG_MESSAGE_THRESHOLD = 1400;

/** Per-section source markers emitted by the planner when `auto`/`always`
 *  online-search modes mix DB + web results in a single answer. The
 *  patterns must stay in lockstep with `prompts/planner.py`'s NEXT_STEP
 *  rule. Frontend strips them from the rendered text and substitutes a
 *  small inline pill so the user can immediately see "this paragraph is
 *  from the DB" vs "this paragraph is from Wikipedia" without hunting
 *  through the SourcesFooter at the bottom. */
const SOURCE_DB_MARKER = /〔来源:DB〕/g;
const SOURCE_WEB_MARKER = /〔来源:Web(?:\s*·\s*([^〕]+))?〕/g;
function injectSourceMarkers(text: string, t: ReturnType<typeof useTranslations<'Chat'>>): string {
  return text
    .replace(
      SOURCE_DB_MARKER,
      `<span class="nbkSrcMarker nbkSrcMarker_db" data-source="db">${t('sources.markerDB')}</span>`,
    )
    .replace(SOURCE_WEB_MARKER, (_, provider) => {
      const tag = provider ? `${provider.trim()}` : t('sources.markerWeb');
      return `<span class="nbkSrcMarker nbkSrcMarker_web" data-source="web">${tag}</span>`;
    });
}

export default function MessageBubble({
  message,
  onRequestRevert,
  onRequestEdit,
  onRequestRegenerate,
  onInsertToInput,
}: MessageBubbleProps) {
  const t = useTranslations('Chat');
  const { state, setFeedback } = useChatContext();
  const { sendMessage } = useSSE();
  const canvasCtx = useOptionalCanvasContext();
  const reduceMotion = useReducedMotion();
  const enterRight = reduceMotion ? undefined : bubbleEnter('right');
  const enterLeft = reduceMotion ? undefined : bubbleEnter('left');
  const assistantMessageRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(true);

  // Chart extraction is memoised here (before early returns) to satisfy the
  // Rules of Hooks. It only produces non-empty results for assistant messages
  // that contain a ```chart block; all other message types get a no-op result.
  const rawMessageContent = message.type !== 'context' ? message.content : '';
  const chartExtraction = useMemo(
    () => extractChartSpecs(rawMessageContent),
    [rawMessageContent],
  );

  if (message.type === 'user') {
    if (message.hidden) return null;
    return (
      <div
        className={`${styles.messageRow} ${styles.messageRowRight} ${styles.messageRowUser} ${styles.messageRowUserStack}`}
        data-message-id={message.id}
      >
        <motion.div
          className={`${styles.messageBubble} ${styles.messageBubbleUser}`}
          variants={enterRight}
          initial="initial"
          animate="animate"
        >
          {message.content}
        </motion.div>
        <MessageActions
          message={message}
          onRevert={() => onRequestRevert?.(message.id)}
          onEdit={() => onRequestEdit?.(message.id, message.content)}
          onRegenerate={() => onRequestRegenerate?.(message.id)}
        />
      </div>
    );
  }

  // Error bubble — synthesized from a SSE_ERROR event. Rendered with a
  // distinct skin so the user can immediately tell this is *not* a real
  // assistant answer. Provides a Retry button (resends the last user
  // prompt) and a collapsible <details> with the raw error payload for
  // debugging/support handoff.
  if (message.type === 'assistant' && message.error) {
    const handleRetry = () => {
      const userMessages = state.messages.filter(
        (m): m is Extract<Message, { type: 'user' }> => m.type === 'user',
      );
      const lastUser = userMessages[userMessages.length - 1];
      if (!lastUser) return;
      sendMessage(lastUser.content, lastUser.hidden ? { hidden: true } : undefined);
    };
    return (
      <div className={`${styles.messageRow} ${styles.messageRowLeft}`} data-message-id={message.id}>
        <motion.div
          className={`${styles.messageBubble} ${styles.messageBubbleAssistant} ${styles.messageBubbleError}`}
          variants={enterLeft}
          initial="initial"
          animate="animate"
        >
          <div className={styles.errorBubbleHeader}>
            <ExclamationCircleOutlined />
            <span>{t('message.errorHeader')}</span>
          </div>
          <div className={styles.errorBubbleBody}>{message.content}</div>
          <div className={styles.errorBubbleActions}>
            <motion.button
              type="button"
              className={styles.errorBubbleRetryBtn}
              onClick={handleRetry}
              whileHover={reduceMotion ? undefined : pressable.whileHover}
              whileTap={reduceMotion ? undefined : pressable.whileTap}
              transition={springSnappy}
              disabled={state.status === 'streaming'}
            >
              <ReloadOutlined /> {t('message.retry')}
            </motion.button>
          </div>
          {message.errorRaw && (
            <details className={styles.errorBubbleDetails}>
              <summary>{t('message.technicalDetails')}</summary>
              <pre>{message.errorRaw}</pre>
            </details>
          )}
        </motion.div>
      </div>
    );
  }

  if (message.type === 'context') {
    return (
      <div className={`${styles.messageRow} ${styles.messageRowRight}`}>
        <motion.div
          className={`${styles.messageBubble} ${styles.messageBubbleContext}`}
          variants={enterRight}
          initial="initial"
          animate="animate"
        >
          <ContextCard
            component={message.component}
            data={message.data}
            sourceId={message.sourceId}
            sourcePath={message.sourcePath}
            onInsertToInput={onInsertToInput}
          />
        </motion.div>
      </div>
    );
  }

  const offersWebSearch = message.content.includes(OFFER_WEB_SEARCH_MARKER);
  const rawVisible = offersWebSearch
    ? message.content.replace(OFFER_WEB_SEARCH_MARKER, '').trim()
    : message.content;
  // Pre-process per-section source markers (`〔来源:DB〕` / `〔来源:Web · X〕`)
  // emitted by the planner under online-search modes `auto` and `always`.
  // Replacing them upstream keeps MarkdownView agnostic of agent vocabulary.
  const visibleContent = injectSourceMarkers(rawVisible, t);

  // Time the assistant spent producing the answer, derived from the
  // first/last trace timestamps. Renders as a small badge BELOW the
  // bubble (alongside the action toolbar). Sub-second answers — common
  // for context-card injection replies — display as "<1s" so the user
  // still gets the timing affordance.
  const elapsedMs =
    message.traces.length >= 1
      ? Math.max(
          0,
          message.traces[message.traces.length - 1].timestamp -
            message.traces[0].timestamp,
        )
      : 0;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  // "Resolved in" reads as a finance-grade workflow term (the question
  // was reasoned through to a definitive answer) rather than the casual
  // "Answered in" phrasing colleagues flagged as unprofessional.
  const elapsedLabel =
    message.traces.length >= 1
      ? elapsedSeconds < 1
        ? t('message.resolvedUnder1s')
        : t('message.resolvedIn', { seconds: elapsedSeconds })
      : '';

  // Re-use chart extraction result, now applied to the fully-processed
  // visibleContent (after source-marker injection). The hook at the top of the
  // component satisfies Rules of Hooks; this is a plain function call.
  const { cleanContent, charts } = extractChartSpecs(visibleContent);

  const showExport = containsMarkdownTable(visibleContent);
  const reliability: ReliabilityEnvelope | undefined = message.reliability;

  const copyFeedback = useActionFeedback();
  const exportFeedback = useActionFeedback();

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(visibleContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = visibleContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      copyFeedback.fire('success');
    } catch (error) {
      void error;
      copyFeedback.fire('error');
    }
  };

  const handleExport = () => {
    const referencesSection =
      message.references.length > 0
        ? `\n\n## ${t('export.references')}\n${message.references.map((ref) => `- ${ref.table}`).join('\n')}`
        : '';
    const sourcesSection =
      reliability && reliability.sources.length > 0
        ? `\n\n## ${t('export.sources')}\n${reliability.sources
            .map((s) => `- ${s.title || s.url} (${s.provider}, ${s.tier})${s.url ? ` — ${s.url}` : ''}`)
            .join('\n')}`
        : '';
    const content = `# ${t('export.chatResponse')}\n\n${visibleContent}${referencesSection}${sourcesSection}\n`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-response-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    exportFeedback.fire('success');
  };

  const handleCheckOnline = () => {
    const userMessages = state.messages.filter(
      (m): m is Extract<Message, { type: 'user' }> => m.type === 'user',
    );
    const lastUser = userMessages[userMessages.length - 1];
    const previousQuery = lastUser?.content?.trim() || '';
    const followUp = previousQuery
      ? `Yes, please check online and attach the source URLs for: ${previousQuery}`
      : 'Yes, please check online and attach the source URLs.';
    sendMessage(followUp, { hidden: true });
  };

  const handleCitationJump = (n: number) => {
    if (!assistantMessageRef.current) return;
    const target = assistantMessageRef.current.querySelector(
      `[data-source-row="${n}"]`,
    ) as HTMLElement | null;
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.remove(styles.sourceRowFlash);
    void target.offsetWidth;
    target.classList.add(styles.sourceRowFlash);
    window.setTimeout(() => target.classList.remove(styles.sourceRowFlash), 1200);
  };

  // assistant
  return (
    <div
      className={`${styles.messageRow} ${styles.messageRowLeft}`}
      data-message-id={message.id}
    >
      <div className={styles.assistantMessageWrap}>
        <motion.div
          ref={assistantMessageRef}
          className={`${styles.messageBubble} ${styles.messageBubbleAssistant}`}
          variants={enterLeft}
          initial="initial"
          animate="animate"
        >
          {reliability && (
            <span className={styles.messageBubbleBadgeSlot}>
              <ReliabilityBadge
                tier={reliability.tier}
                providerUsed={reliability.provider_used}
                sources={reliability.sources}
                compact
              />
            </span>
          )}
          {visibleContent.length > LONG_MESSAGE_THRESHOLD && collapsed ? (
            <div className={`${styles.longMessageWrap} ${styles.longMessageCollapsed}`}>
              <MarkdownView
                content={cleanContent}
                withCitations
                onCitationClick={handleCitationJump}
              />
            </div>
          ) : (
            <MarkdownView
              content={cleanContent}
              withCitations
              onCitationClick={handleCitationJump}
            />
          )}
          {canvasCtx && charts.map((spec, i) => (
            <InlineBIWidget key={i} spec={spec} />
          ))}
          {canvasCtx && <BankPreviewCard messageContent={message.content} />}
          {visibleContent.length > LONG_MESSAGE_THRESHOLD && (
            <button
              type="button"
              className={styles.longMessageToggle}
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={!collapsed}
            >
              {collapsed ? t('message.showFull') : t('message.collapse')}
            </button>
          )}
          {offersWebSearch && (
            <motion.button
              type="button"
              className={styles.offerWebSearchBtn}
              onClick={handleCheckOnline}
              whileHover={reduceMotion ? undefined : pressable.whileHover}
              whileTap={reduceMotion ? undefined : pressable.whileTap}
              transition={springSnappy}
            >
              <SearchOutlined /> {t('message.checkOnline')}
            </motion.button>
          )}
          {reliability && reliability.sources.length > 0 && (
            <SourcesFooter sources={reliability.sources} providerUsed={reliability.provider_used} />
          )}
        </motion.div>
        {canvasCtx && <FollowUpChips messageContent={message.content} />}
        <div className={styles.assistantMetaRow}>
          {/* Output toolbar lives on the LEFT so it can't be visually
              confused with the input controls (send/voice/etc.) which sit
              on the right of the input bar. The elapsed badge follows on
              the right as a quiet meta tag. */}
          <div className={styles.assistantActions}>
            <Tooltip
              title={
                copyFeedback.status === 'success'
                  ? t('toolbar.copiedToClipboard')
                  : copyFeedback.status === 'error'
                    ? t('toolbar.copyFailed')
                    : t('toolbar.copyResponse')
              }
            >
              <motion.button
                className={`${styles.assistantActionBtn} ${
                  copyFeedback.status === 'success' ? styles.actionBtnSuccess : ''
                }`}
                onClick={handleCopy}
                aria-label={t('toolbar.copyResponse')}
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
            {showExport && (
              <Tooltip
                title={
                  exportFeedback.status === 'success'
                    ? t('toolbar.downloaded')
                    : exportFeedback.status === 'error'
                      ? t('toolbar.downloadFailed')
                      : t('toolbar.exportTable')
                }
              >
                <motion.button
                  className={`${styles.assistantActionBtn} ${
                    exportFeedback.status === 'success' ? styles.actionBtnSuccess : ''
                  }`}
                  onClick={handleExport}
                  aria-label={t('toolbar.exportResponse')}
                  whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
                  whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
                  transition={springSnappy}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={exportFeedback.status === 'success' ? 'done' : 'download'}
                      initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                      transition={tweenIOSFast}
                      style={{ display: 'inline-flex' }}
                    >
                      {exportFeedback.status === 'success' ? <CheckOutlined /> : <DownloadOutlined />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </Tooltip>
            )}
            <AssistantFeedback
              feedback={message.feedback ?? null}
              onChange={(next: MessageFeedback) => setFeedback(message.id, next)}
              content={visibleContent}
            />
          </div>
          {elapsedLabel && (
            <div className={styles.elapsedBadge} aria-label={elapsedLabel}>
              <ClockCircleOutlined />
              <span>{elapsedLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CHART_BLOCK_RE = /```chart\n([\s\S]*?)```/g;

function extractChartSpecs(content: string): { cleanContent: string; charts: ChartSpec[] } {
  if (!content || !content.includes('```chart')) {
    return { cleanContent: content ?? '', charts: [] };
  }
  const charts: ChartSpec[] = [];
  const cleanContent = content.replace(CHART_BLOCK_RE, (_, json: string) => {
    try {
      const spec = JSON.parse(json.trim()) as ChartSpec;
      if (Array.isArray(spec.data)) charts.push(spec);
    } catch {
      // malformed JSON — leave block in place
      return `\`\`\`chart\n${json}\`\`\``;
    }
    return '';
  });
  return { cleanContent: cleanContent.trim(), charts };
}

function containsMarkdownTable(text: string): boolean {
  if (!text.includes('|')) return false;
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  for (let index = 0; index < lines.length - 1; index += 1) {
    const header = lines[index];
    const separator = lines[index + 1];
    if (!header.includes('|')) continue;
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(separator)) {
      return true;
    }
  }
  return false;
}
