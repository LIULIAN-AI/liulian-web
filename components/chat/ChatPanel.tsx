'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExpandOutlined,
  FileTextOutlined,
  MessageOutlined,
  MinusOutlined,
  PlusOutlined,
  PushpinFilled,
  PushpinOutlined,
  SearchOutlined,
  ShrinkOutlined,
  ThunderboltOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Input, Modal, Tooltip, message as antdMessage } from 'antd';
import { useChatContext } from './hooks/useChatContext';
import { useSSE } from './hooks/useSSE';
import { ProfessionalPersonaIcon, type PersonaType } from './ProfessionalPersonaIcon';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import SuggestedChips from './SuggestedChips';
import OnlineModeToggle from './OnlineModeToggle';
import ChipFlyOverlay, { type ChipFlyPayload } from './ChipFlyOverlay';
import EditMessageModal from './EditMessageModal';
import EmptyStateGuides from './EmptyStateGuides';
import CommandPalette from './CommandPalette';
import {
  COMMANDS,
  parseSlashInput,
  type CommandContext,
  type CommandDef,
} from './commands';
import {
  backdrop,
  panelSlide,
  pressableIcon,
  springSilky,
  springSnappy,
  tweenIOSFast,
} from './motion';
import type { Message } from './types';
import styles from './chat.module.css';

interface ChatPanelProps {
  persona: PersonaType;
  standalone?: boolean;
}

function messageMatchesQuery(message: Message, query: string): boolean {
  if (!query) return true;
  if (message.type === 'user' || message.type === 'assistant') {
    return message.content.toLowerCase().includes(query);
  }
  const contextText = `${message.component} ${JSON.stringify(message.data)}`.toLowerCase();
  return contextText.includes(query);
}

function buildTranscript(messages: Message[], t: ReturnType<typeof useTranslations<'Chat'>>): string {
  const lines: string[] = [`# ${t('panel.transcriptTitle')}`, ''];
  for (const m of messages) {
    if (m.supersededAt) continue;
    if (m.type === 'user') {
      if (m.hidden) continue;
      lines.push(`**${t('panel.transcriptYou')}**: ${m.content}`, '');
    } else if (m.type === 'assistant') {
      lines.push(`**${t('panel.transcriptAssistant')}**: ${m.content}`, '');
    } else {
      lines.push(`> ${t('panel.transcriptContext', { component: m.component })}`, '');
    }
  }
  return lines.join('\n');
}

export default function ChatPanel({ persona, standalone }: ChatPanelProps) {
  const t = useTranslations('Chat');
  const {
    state,
    setPanelState,
    startNewChat,
    loadArchive,
    renameSession,
    truncateFrom,
    togglePin,
    renameArchive,
    deleteArchive,
    injectContext,
  } = useChatContext();
  const { sendMessage, abort, isStreaming } = useSSE();
  const [inputValue, setInputValue] = useState('');
  const [historyQuery, setHistoryQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [currentMatchCursor, setCurrentMatchCursor] = useState(0);
  const [flyingChip, setFlyingChip] = useState<ChipFlyPayload | null>(null);
  // Bumped each time a flying chip lands — ChatInput watches this to fire
  // a brief "catch" pulse so the chip flight reads as a single hand-off.
  const [chipCatchKey, setChipCatchKey] = useState(0);
  // Tracks the in-flight "land" timer so a back-to-back chip click can
  // cancel the pending text-drop and re-arm a fresh one.
  const chipLandTimerRef = useRef<number | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; content: string } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  // Rename-session modal state. Holds the conversationId being renamed
  // and the original title (so an unchanged save can early-exit without
  // dispatching). Null = no rename in progress. R8 v3 rework: returned
  // to a Modal popup per user preference — the picker/edit/delete trio
  // in the toolbar stays visually unchanged while the modal is open.
  const [renameTarget, setRenameTarget] = useState<
    { conversationId: string; original: string } | null
  >(null);
  const [renameDraft, setRenameDraft] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const isExpanded = state.panelState === 'expanded';
  const panelClassName = standalone
    ? `${styles.panel} ${styles.panelStandalone}`
    : `${styles.panel} ${isExpanded ? styles.panelExpanded : styles.panelDefault}`;
  const normalizedQuery = historyQuery.trim().toLowerCase();

  const matchedMessageIndexes = useMemo(() => {
    if (!normalizedQuery) return [];
    return state.messages
      .map((message, index) => (messageMatchesQuery(message, normalizedQuery) ? index : -1))
      .filter((index) => index >= 0);
  }, [normalizedQuery, state.messages]);

  const safeMatchCursor =
    matchedMessageIndexes.length === 0
      ? 0
      : Math.min(currentMatchCursor, matchedMessageIndexes.length - 1);

  const highlightedMessageIndex =
    normalizedQuery && matchedMessageIndexes.length > 0
      ? matchedMessageIndexes[safeMatchCursor] ?? matchedMessageIndexes[0]
      : null;

  const currentMatchCount = matchedMessageIndexes.length;

  useEffect(() => {
    if (isSearchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [isSearchExpanded]);

  // Cmd/Ctrl+K → open command palette. Cmd/Ctrl+/ → focus the input.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        setInputValue('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (standalone && state.panelState === 'closed') {
      setPanelState('default');
    }
  }, [standalone, state.panelState, setPanelState]);

  const selectedArchiveValue = state.archives.some(
    (archive) => archive.conversationId === state.conversationId,
  )
    ? state.conversationId
    : '__current';

  const currentIsPinned =
    state.archives.find((a) => a.conversationId === state.conversationId)?.pinned ?? false;

  const handleCopyTranscript = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildTranscript(state.messages, t));
      antdMessage.success({ content: t('panel.transcriptCopied'), duration: 2 });
    } catch {
      antdMessage.error({ content: t('panel.transcriptCopyFailed'), duration: 2 });
    }
  }, [state.messages, t]);

  const handleExportTranscript = useCallback(() => {
    const blob = new Blob([buildTranscript(state.messages, t)], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neobanker-chat-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state.messages, t]);

  const buildCommandContext = useCallback(
    (): CommandContext => ({
      sendMessage: (text: string) => sendMessage(text),
      setInputValue,
      startNewChat,
      renameSession,
      togglePinCurrent: () => togglePin(state.conversationId),
      setPanelExpanded: (expanded: boolean) => setPanelState(expanded ? 'expanded' : 'default'),
      copyTranscript: handleCopyTranscript,
      exportTranscript: handleExportTranscript,
    }),
    [
      sendMessage,
      setInputValue,
      startNewChat,
      renameSession,
      togglePin,
      state.conversationId,
      setPanelState,
      handleCopyTranscript,
      handleExportTranscript,
    ],
  );

  const runCommand = useCallback(
    (cmd: CommandDef, args?: string) => {
      cmd.run(buildCommandContext(), args);
      setInputValue('');
    },
    [buildCommandContext],
  );

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const slash = parseSlashInput(trimmed);
    if (slash) {
      const cmd = COMMANDS.find((c) => c.key === slash.key);
      if (cmd) {
        runCommand(cmd, slash.args);
        return;
      }
    }
    sendMessage(trimmed);
    setInputValue('');
  };

  const handleSlashSelect = (cmd: CommandDef) => {
    runCommand(cmd);
  };

  const handleChipClick = (chip: string, fromRect: DOMRect | null) => {
    if (reduceMotion || !fromRect || !inputAreaRef.current) {
      setInputValue(chip);
      return;
    }
    // Target the actual <input> element, not the input area row — otherwise
    // the chip flies to where the voice button sits (left of the toolbar)
    // instead of into the text field where the typed text will appear.
    const inputEl = inputAreaRef.current.querySelector('input') as HTMLElement | null;
    const targetRect = (inputEl ?? inputAreaRef.current).getBoundingClientRect();
    setFlyingChip({
      text: chip,
      from: {
        x: fromRect.left,
        y: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
      },
      to: {
        x: targetRect.left + 14,
        y: targetRect.top + targetRect.height / 2 - fromRect.height / 2,
      },
    });
    // Drop the text into the input as the chip is landing rather than
    // waiting for the chip's trailing fade to complete (R8 v4 feedback:
    // the previous "wait for onAnimationComplete" path was producing a
    // perceptible 0.5–1 s gap between visual landing and text appearance).
    // 460 ms ≈ 77% of the 600 ms ChipFlyOverlay flight, which is when the
    // chip has reached the input and starts its trailing opacity dissolve.
    if (chipLandTimerRef.current !== null) {
      window.clearTimeout(chipLandTimerRef.current);
    }
    chipLandTimerRef.current = window.setTimeout(() => {
      setInputValue(chip);
      setChipCatchKey((k) => k + 1);
      chipLandTimerRef.current = null;
    }, 460);
  };

  // Cleanup on unmount so a pending land-timer never fires after the
  // panel is gone.
  useEffect(() => {
    return () => {
      if (chipLandTimerRef.current !== null) {
        window.clearTimeout(chipLandTimerRef.current);
      }
    };
  }, []);

  const handleChipFlyComplete = () => {
    setFlyingChip(null);
  };

  const toggleExpand = () => {
    setPanelState(isExpanded ? 'default' : 'expanded');
  };

  const handleClose = () => {
    setPanelState('closed');
  };

  const hasConversation = state.messages.some(
    (msg) => (msg.type === 'user' || msg.type === 'assistant') && !msg.supersededAt,
  );

  // Most-recent-last list of user prompts for the input's ↑/↓ recall.
  const promptHistory = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const msg of state.messages) {
      if (msg.type !== 'user') continue;
      const text = msg.content?.trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      out.push(text);
    }
    return out;
  }, [state.messages]);

  const handleSummarize = () => {
    if (!hasConversation || isStreaming) return;
    sendMessage(t('panel.summarizePrompt'));
  };

  const handleArchiveSelection = (value: string) => {
    if (value === '__current') return;
    loadArchive(value);
  };

  // Resolve the session targeted by the session-picker. The select shows
  // "Current" when the active session has not been archived yet (i.e.
  // hasn't been replaced via START_NEW_CHAT or LOAD_ARCHIVE), so the
  // rename/delete buttons must fall back to the current conversation in
  // that case.
  const targetedSession = useMemo(() => {
    if (selectedArchiveValue === '__current') {
      return {
        conversationId: state.conversationId,
        title: state.conversationTitle ?? t('panel.currentChat'),
        isCurrent: true,
      };
    }
    const archive = state.archives.find(
      (a) => a.conversationId === selectedArchiveValue,
    );
    if (!archive) {
      return {
        conversationId: state.conversationId,
        title: state.conversationTitle ?? t('panel.currentChat'),
        isCurrent: true,
      };
    }
    return {
      conversationId: archive.conversationId,
      title: archive.title,
      isCurrent: archive.conversationId === state.conversationId,
    };
  }, [selectedArchiveValue, state.archives, state.conversationId, state.conversationTitle]);

  const openRenameDialog = () => {
    setRenameDraft(targetedSession.title);
    setRenameTarget({
      conversationId: targetedSession.conversationId,
      original: targetedSession.title,
    });
  };

  const closeRenameDialog = () => {
    setRenameTarget(null);
    setRenameDraft('');
  };

  const handleRenameSubmit = () => {
    if (!renameTarget) return;
    const trimmed = renameDraft.trim();
    if (!trimmed || trimmed === renameTarget.original) {
      closeRenameDialog();
      return;
    }
    if (renameTarget.conversationId === state.conversationId) {
      // Active session — also keep conversationTitle in sync. The
      // RENAME_ARCHIVE reducer mirrors this when the id matches, but
      // calling renameSession directly handles the case where the
      // session is not yet in `archives`.
      renameSession(trimmed);
    }
    renameArchive(renameTarget.conversationId, trimmed);
    closeRenameDialog();
    antdMessage.success({ content: t('panel.sessionRenamed'), duration: 1.5 });
  };

  const handleDelete = () => {
    // R8 v3: deleting the active session is now allowed. The reducer
    // resets the active conversation to a fresh empty chat in that case
    // (the to-be-deleted state is never archived). Confirmation copy
    // makes this consequence explicit.
    const isCurrent = targetedSession.isCurrent;
    Modal.confirm({
      title: isCurrent ? t('panel.deleteCurrentTitle') : t('panel.deleteTitle'),
      content: isCurrent
        ? t('panel.deleteCurrentContent', { title: targetedSession.title })
        : t('panel.deleteContent', { title: targetedSession.title }),
      okText: t('panel.delete'),
      okButtonProps: { danger: true, type: 'primary' },
      cancelText: t('panel.cancel'),
      // R8 v3 rework: chatbot-themed warm-red accent + rounded surface so
      // the destructive prompt feels like part of the assistant, not a
      // generic antd dialog. `wrapClassName` styles the outer mask + dialog
      // container (Modal.confirm doesn't accept `className`).
      wrapClassName: `${styles.brandModalWrap} ${styles.brandModalWrapDanger}`,
      centered: true,
      onOk: () => {
        deleteArchive(targetedSession.conversationId);
        antdMessage.success({ content: t('panel.sessionDeleted'), duration: 1.5 });
      },
    });
  };

  const expandSearch = () => {
    setIsSearchExpanded(true);
  };

  const collapseSearch = () => {
    if (historyQuery.trim()) return;
    searchInputRef.current?.blur();
    setIsSearchExpanded(false);
  };

  const moveToPreviousMatch = () => {
    if (matchedMessageIndexes.length === 0) return;
    setCurrentMatchCursor((previous) =>
      previous <= 0 || previous >= matchedMessageIndexes.length
        ? matchedMessageIndexes.length - 1
        : previous - 1,
    );
  };

  const moveToNextMatch = () => {
    if (matchedMessageIndexes.length === 0) return;
    setCurrentMatchCursor((previous) =>
      previous >= matchedMessageIndexes.length - 1 ? 0 : previous + 1,
    );
  };

  // ── Edit / revert / regenerate handlers ──────────────────────────
  const handleRequestEdit = (id: string, content: string) => {
    setEditTarget({ id, content });
  };

  const handleRequestRevert = (id: string) => {
    truncateFrom(id);
  };

  const handleRequestRegenerate = (id: string) => {
    // The user message is now superseded after truncate. Resend its
    // content as a fresh prompt so the assistant regenerates.
    const target = state.messages.find((m) => m.id === id);
    truncateFrom(id);
    if (target && target.type === 'user') {
      // Remove the original user message itself from the new branch by
      // also marking it superseded — truncateFrom already does that —
      // then send the same content again.
      window.setTimeout(() => sendMessage(target.content), 0);
    }
  };

  const downstreamForEdit = useMemo(() => {
    if (!editTarget) return 0;
    const idx = state.messages.findIndex((m) => m.id === editTarget.id);
    if (idx < 0) return 0;
    return state.messages.slice(idx).filter((m) => !m.supersededAt).length;
  }, [editTarget, state.messages]);

  const handleEditSubmit = (text: string) => {
    if (!editTarget) return;
    truncateFrom(editTarget.id);
    setEditTarget(null);
    window.setTimeout(() => sendMessage(text), 0);
  };

  // ── Drag-drop card injection ─────────────────────────────────────
  const handleDragOver = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes('application/x-neobanker-context')) {
      event.preventDefault();
      setIsDropping(true);
    }
  };

  const handleDragLeave = () => setIsDropping(false);

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDropping(false);
    const raw = event.dataTransfer.getData('application/x-neobanker-context');
    if (!raw) return;
    try {
      const { component, data, sourceId, sourcePath } = JSON.parse(raw);
      injectContext(component, data, sourceId, sourcePath);
    } catch {
      // ignore malformed payloads
    }
  };

  // v10: removed `layout: true` — it caused the entire panel to re-tween
  // on every state change (search expand, button hover, etc.) which is
  // why everything felt sluggish. CSS handles the size morph between
  // .panelDefault ↔ .panelExpanded directly now (see chat.module.css).
  const motionPanelProps = reduceMotion
    ? {}
    : {
        variants: panelSlide,
        initial: 'initial' as const,
        animate: 'animate' as const,
        exit: 'exit' as const,
      };

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.button
            type="button"
            className={styles.backdrop}
            aria-label={t('panel.exitExpanded')}
            onClick={() => setPanelState('default')}
            variants={reduceMotion ? undefined : backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
      </AnimatePresence>
      <motion.div
        {...motionPanelProps}
        className={panelClassName}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ProfessionalPersonaIcon persona={persona} />
            <span>{t('panel.title')}</span>
          </div>
          <Tooltip title={t('panel.commandPaletteHint')}>
            <motion.button
              className={styles.headerBtn}
              onClick={() => setPaletteOpen(true)}
              aria-label={t('commands.commandPalette')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <ThunderboltOutlined />
            </motion.button>
          </Tooltip>
          <motion.button
            className={styles.headerBtn}
            onClick={toggleExpand}
            aria-label={isExpanded ? t('panel.collapsePanel') : t('panel.expandPanel')}
            whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
            whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
            transition={springSnappy}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isExpanded ? 'shrink' : 'expand'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={tweenIOSFast}
                style={{ display: 'inline-flex' }}
              >
                {isExpanded ? <ShrinkOutlined /> : <ExpandOutlined />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <Tooltip title={t('panel.minimizeChat')}>
            <motion.button
              className={styles.headerBtn}
              onClick={handleClose}
              aria-label={t('panel.minimizeChat')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <MinusOutlined />
            </motion.button>
          </Tooltip>
        </div>

        <div className={styles.compactToolbar}>
          <Tooltip title={t('panel.newChatHint')}>
            <motion.button
              className={styles.compactNewBtn}
              onClick={startNewChat}
              disabled={isStreaming}
              aria-label={t('panel.startNewChat')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <PlusOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title={t('panel.summarizeHint')}>
            <motion.button
              className={styles.compactSummaryBtn}
              onClick={handleSummarize}
              disabled={isStreaming || !hasConversation}
              aria-label={t('panel.summarizeHint')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <FileTextOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title={currentIsPinned ? t('panel.unpinHint') : t('panel.pinHint')}>
            <motion.button
              className={`${styles.pinToggleBtn} ${currentIsPinned ? styles.pinToggleBtnActive : ''}`}
              onClick={() => togglePin(state.conversationId)}
              aria-label={currentIsPinned ? t('panel.unpinSession') : t('panel.pinSession')}
              aria-pressed={currentIsPinned}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              {currentIsPinned ? <PushpinFilled /> : <PushpinOutlined />}
            </motion.button>
          </Tooltip>
          <Tooltip title={t('panel.switchSession')}>
            <select
              className={styles.compactSessionSelect}
              value={selectedArchiveValue}
              onChange={(event) => handleArchiveSelection(event.target.value)}
              aria-label={t('panel.selectSession')}
            >
              <option value="__current">{t('panel.current')}</option>
              {[...state.archives]
                .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false))
                .map((archive) => (
                  <option key={archive.conversationId} value={archive.conversationId}>
                    {archive.pinned ? '📌 ' : ''}
                    {new Date(archive.updatedAt).toLocaleDateString()} · {archive.title}
                  </option>
                ))}
            </select>
          </Tooltip>
          <Tooltip title={t('panel.renameHintFull', { title: targetedSession.title })}>
            <motion.button
              type="button"
              className={styles.sessionEditBtn}
              onClick={openRenameDialog}
              aria-label={t('panel.renameSelected')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <EditOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip
            title={
              targetedSession.isCurrent
                ? t('panel.deleteCurrentHint', { title: targetedSession.title })
                : t('panel.deleteHint', { title: targetedSession.title })
            }
          >
            <motion.button
              type="button"
              className={styles.sessionDeleteBtn}
              onClick={handleDelete}
              aria-label={t('panel.deleteSelected')}
              whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
              whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
              transition={springSnappy}
            >
              <DeleteOutlined />
            </motion.button>
          </Tooltip>
          <div className={styles.compactSearchShell} onMouseLeave={collapseSearch}>
            <Tooltip title={t('panel.searchHint')}>
              <motion.button
                type="button"
                className={styles.compactSearchBtn}
                aria-label={t('panel.searchHistory')}
                onMouseEnter={expandSearch}
                onFocus={expandSearch}
                onClick={expandSearch}
                whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
                whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
                transition={springSnappy}
              >
                <SearchOutlined className={styles.compactSearchIcon} />
              </motion.button>
            </Tooltip>
            <motion.div
              className={`${styles.compactSearchInputWrap} ${
                isSearchExpanded ? styles.compactSearchInputWrapExpanded : ''
              }`}
              animate={{
                width: isSearchExpanded ? 180 : 0,
                opacity: isSearchExpanded ? 1 : 0,
              }}
              transition={springSilky}
              style={{ overflow: 'hidden' }}
            >
              <input
                ref={searchInputRef}
                className={styles.compactSearchInput}
                value={historyQuery}
                onChange={(event) => {
                  setCurrentMatchCursor(0);
                  setHistoryQuery(event.target.value);
                }}
                placeholder={t('panel.searchPlaceholder')}
                aria-label={t('panel.searchHistory')}
                onBlur={() => {
                  if (!historyQuery.trim()) {
                    setIsSearchExpanded(false);
                  }
                }}
              />
            </motion.div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {normalizedQuery ? (
              <motion.div
                key="nav"
                className={styles.searchNavigator}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={tweenIOSFast}
              >
                <Tooltip title={t('panel.previousMatch')}>
                  <motion.button
                    type="button"
                    className={styles.searchNavBtn}
                    onClick={moveToPreviousMatch}
                    disabled={currentMatchCount === 0}
                    aria-label={t('panel.previousMatch')}
                    whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
                    whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
                    transition={springSnappy}
                  >
                    <UpOutlined />
                  </motion.button>
                </Tooltip>
                <Tooltip title={t('panel.matchesCount', { count: currentMatchCount })}>
                  <span className={styles.compactMatchCount}>
                    {currentMatchCount === 0 ? '0/0' : `${safeMatchCursor + 1}/${currentMatchCount}`}
                  </span>
                </Tooltip>
                <Tooltip title={t('panel.nextMatch')}>
                  <motion.button
                    type="button"
                    className={styles.searchNavBtn}
                    onClick={moveToNextMatch}
                    disabled={currentMatchCount === 0}
                    aria-label={t('panel.nextMatch')}
                    whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
                    whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
                    transition={springSnappy}
                  >
                    <DownOutlined />
                  </motion.button>
                </Tooltip>
              </motion.div>
            ) : (
              <Tooltip key="meta" title={t('panel.totalMessages')}>
                <motion.span
                  className={styles.compactSessionMeta}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={tweenIOSFast}
                >
                  <MessageOutlined />
                  <span>{state.messages.length}</span>
                </motion.span>
              </Tooltip>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <ChatMessages
          messages={state.messages}
          activeTraces={state.activeTraces}
          isStreaming={isStreaming}
          highlightedMessageIndex={highlightedMessageIndex}
          onRequestEdit={handleRequestEdit}
          onRequestRevert={handleRequestRevert}
          onRequestRegenerate={handleRequestRegenerate}
          onInsertToInput={setInputValue}
        />

        {/* Empty-state guides only when no messages and no streaming */}
        {!hasConversation && !isStreaming && state.activeTraces.length === 0 && (
          <div style={{ padding: '0 16px 8px' }}>
            <EmptyStateGuides onPick={(text) => sendMessage(text)} />
          </div>
        )}

        {/* Suggested Chips */}
        <SuggestedChips chips={state.suggestions} onChipClick={handleChipClick} />

        {/* Online-search policy switch — sits flush above the input so the
            user can flip ask / fallback / always without leaving the typing
            flow. Default = ask (preserves prior behaviour). */}
        <OnlineModeToggle />

        {/* Input */}
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onStop={abort}
          isStreaming={isStreaming}
          disabled={isStreaming}
          containerRef={inputAreaRef}
          onSlashSelect={handleSlashSelect}
          history={promptHistory}
          chipCatchKey={chipCatchKey}
        />

        <AnimatePresence>
          {isDropping && (
            <motion.div
              className={styles.dropZoneOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={tweenIOSFast}
            >
              {t('panel.dropToAttach')}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <ChipFlyOverlay payload={flyingChip} onComplete={handleChipFlyComplete} />
      <EditMessageModal
        open={editTarget !== null}
        initialContent={editTarget?.content ?? ''}
        discardCount={Math.max(downstreamForEdit - 1, 0)}
        onCancel={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onRun={(cmd) => runCommand(cmd)}
      />
      <Modal
        open={renameTarget !== null}
        title={t('panel.renameSessionTitle')}
        okText={t('panel.save')}
        cancelText={t('panel.cancel')}
        okButtonProps={{ disabled: !renameDraft.trim(), type: 'primary' }}
        onOk={handleRenameSubmit}
        onCancel={closeRenameDialog}
        destroyOnClose
        centered
        // R8 v3 rework: brand-themed wrapper so the rename modal matches
        // the chatbot warm-red accent + rounded surface. `wrapClassName`
        // covers the outer mask; `className` covers the dialog box.
        className={styles.brandModal}
        wrapClassName={styles.brandModalWrap}
      >
        <Input
          value={renameDraft}
          onChange={(event) => setRenameDraft(event.target.value)}
          onPressEnter={handleRenameSubmit}
          placeholder={t('panel.sessionNamePlaceholder')}
          maxLength={80}
          autoFocus
          className={styles.brandModalInput}
        />
      </Modal>
    </>
  );
}
