'use client';

import { KeyboardEvent, RefObject, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AudioOutlined, PauseCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Tooltip, message as antdMessage } from 'antd';
import SlashAutocomplete from './SlashAutocomplete';
import { matchSlashCommands, normalizeSlashPrefix, type CommandDef } from './commands';
import { useVoiceInput, type VoiceErrorReason } from './hooks/useVoiceInput';
import { pressableIcon, springSnappy, tweenIOSFast } from './motion';
import styles from './chat.module.css';

// Live recording cue rendered inside the voice button while the mic is
// open — three bars beating at staggered intervals (CSS-driven).
function VoiceWaveform() {
  return (
    <span className={styles.voiceBars} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled: boolean;
  containerRef?: RefObject<HTMLDivElement>;
  /** Called when user picks a slash command from the autocomplete. */
  onSlashSelect?: (cmd: CommandDef) => void;
  /** Most-recent-last list of prior user prompts for ↑/↓ recall. */
  history?: string[];
  /** Increments each time a flying chip lands — triggers a brief catch
   *  pulse on the input field so the chip-fly reads as a hand-off. */
  chipCatchKey?: number;
}

const VOICE_ERROR_KEYS: Record<VoiceErrorReason, string | null> = {
  'not-allowed': 'voice.notAllowed',
  'no-speech': 'voice.noSpeech',
  'audio-capture': 'voice.audioCapture',
  network: 'voice.network',
  aborted: null,
  unsupported: 'voice.unsupported',
  unknown: 'voice.unknown',
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming = false,
  disabled,
  containerRef,
  onSlashSelect,
  history = [],
  chipCatchKey = 0,
}: ChatInputProps) {
  const t = useTranslations('Chat');
  const reduceMotion = useReducedMotion();
  const canSend = value.trim().length > 0 && !disabled;
  const [slashIndex, setSlashIndex] = useState(0);
  // When the user clicks outside the chat input, suppress the slash menu
  // even though the value still starts with "/". Cleared as soon as the
  // user types or focuses the input again.
  const [slashSuppressed, setSlashSuppressed] = useState(false);

  // -1 = live input, 0 = most recent prompt, 1 = one before, …
  const historyIdxRef = useRef(-1);
  const draftRef = useRef('');

  // If the user edits manually, exit history mode.
  useEffect(() => {
    if (historyIdxRef.current !== -1) {
      const recalled = history[history.length - 1 - historyIdxRef.current];
      if (value !== recalled) historyIdxRef.current = -1;
    }
  }, [value, history]);

  // Brief catching pulse synced to ChipFlyOverlay's landing — fires the
  // input border + drop-in shimmer so the chip flight reads as a single
  // transfer. Skipped on initial render (chipCatchKey starts at 0).
  const [catching, setCatching] = useState(false);
  const firstCatchRef = useRef(true);
  useEffect(() => {
    if (firstCatchRef.current) {
      firstCatchRef.current = false;
      return;
    }
    if (reduceMotion) return;
    setCatching(true);
    // R8 v2: matched to the slowed chip-fly (0.6s overall) — the pulse
    // starts as the chip lands and rings out for a moment after.
    const t = window.setTimeout(() => setCatching(false), 720);
    return () => window.clearTimeout(t);
  }, [chipCatchKey, reduceMotion]);

  const normalized = normalizeSlashPrefix(value);
  const slashQuery = normalized.startsWith('/') ? normalized.slice(1).split(/\s/)[0] : null;
  const slashOpen = slashQuery !== null && !normalized.includes(' ') && !slashSuppressed;
  const matches = slashOpen ? matchSlashCommands(slashQuery!) : [];

  // Auto-close the slash menu when the user clicks anywhere outside the
  // input area (the menu hangs off the input toolbar, so we use that
  // wrapper as the boundary).
  useEffect(() => {
    if (!slashOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const root = containerRef?.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      setSlashSuppressed(true);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [slashOpen, containerRef]);

  const voice = useVoiceInput({
    onTranscript: (text) => {
      onChange(text);
    },
    onError: (reason) => {
      const key = VOICE_ERROR_KEYS[reason];
      if (key) antdMessage.warning({ content: t(key), duration: 3 });
    },
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (slashOpen && matches.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % matches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + matches.length) % matches.length);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        const cmd = matches[Math.min(slashIndex, matches.length - 1)];
        if (cmd && onSlashSelect) onSlashSelect(cmd);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onChange('');
        return;
      }
    }
    // Prompt history recall (↑ = older, ↓ = newer). Only engages when the
    // slash menu is closed, so we don't conflict with command navigation.
    if (!slashOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && history.length > 0) {
      e.preventDefault();
      if (e.key === 'ArrowUp') {
        if (historyIdxRef.current === -1) draftRef.current = value;
        const next = Math.min(historyIdxRef.current + 1, history.length - 1);
        historyIdxRef.current = next;
        onChange(history[history.length - 1 - next]);
      } else {
        const next = historyIdxRef.current - 1;
        historyIdxRef.current = next;
        if (next < 0) {
          historyIdxRef.current = -1;
          onChange(draftRef.current);
        } else {
          onChange(history[history.length - 1 - next]);
        }
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      historyIdxRef.current = -1;
      draftRef.current = '';
      onSend();
    }
  };

  return (
    <div className={styles.inputArea} ref={containerRef} style={{ position: 'relative' }}>
      {slashOpen && (
        <SlashAutocomplete
          query={slashQuery!}
          activeIndex={slashIndex}
          onActiveIndexChange={setSlashIndex}
          onSelect={(cmd) => onSlashSelect?.(cmd)}
        />
      )}
      {voice.supported && (
        <Tooltip
          title={voice.listening ? t('voice.recordingHint') : t('voice.startHint')}
        >
          <motion.button
            type="button"
            className={`${styles.voiceBtn} ${voice.listening ? styles.voiceBtnActive : ''}`}
            onClick={voice.listening ? voice.stop : voice.start}
            aria-label={voice.listening ? t('voice.stopRecording') : t('voice.startVoiceInput')}
            whileHover={reduceMotion ? undefined : pressableIcon.whileHover}
            whileTap={reduceMotion ? undefined : pressableIcon.whileTap}
            transition={springSnappy}
          >
            {voice.listening ? <VoiceWaveform /> : <AudioOutlined />}
          </motion.button>
        </Tooltip>
      )}
      <input
        className={`${styles.inputField} ${catching ? styles.inputFieldCatching : ''}`}
        type="text"
        placeholder={t('input.placeholder')}
        value={value}
        onChange={(e) => {
          if (slashSuppressed) setSlashSuppressed(false);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (slashSuppressed) setSlashSuppressed(false);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      {/* Single morphing primary button: SendOutlined when idle, swaps
       *  to PauseCircleOutlined while a response is streaming so the user
       *  always knows where to click (one slot, two states). */}
      <Tooltip title={isStreaming ? t('input.stopResponse') : t('input.send')}>
        <motion.button
          type="button"
          className={styles.sendBtn}
          onClick={() => {
            if (isStreaming) {
              onStop?.();
              return;
            }
            historyIdxRef.current = -1;
            draftRef.current = '';
            onSend();
          }}
          disabled={isStreaming ? false : !canSend}
          aria-label={isStreaming ? t('input.stopResponse') : t('input.sendMessage')}
          animate={
            isStreaming
              ? { scale: 1, opacity: 1 }
              : canSend
                ? { scale: 1, opacity: 1 }
                : { scale: 0.94, opacity: 0.55 }
          }
          whileHover={
            !reduceMotion && (isStreaming || canSend)
              ? isStreaming
                ? { scale: 1.06 }
                : { scale: 1.08, rotate: -8 }
              : undefined
          }
          whileTap={
            !reduceMotion && (isStreaming || canSend)
              ? isStreaming
                ? { scale: 0.92 }
                : { scale: 0.9, rotate: -16 }
              : undefined
          }
          transition={springSnappy}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isStreaming ? 'stop' : 'send'}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={tweenIOSFast}
              style={{ display: 'inline-flex' }}
            >
              {isStreaming ? <PauseCircleOutlined /> : <SendOutlined />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </Tooltip>
    </div>
  );
}
