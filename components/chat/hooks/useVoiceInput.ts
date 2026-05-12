'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceErrorReason =
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | 'unsupported'
  | 'unknown';

interface UseVoiceInputOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  /** BCP-47 tag passed straight to the recognition engine. */
  lang?: string;
  /** Called when recognition fails so the caller can surface a toast. */
  onError?: (reason: VoiceErrorReason, raw?: string) => void;
}

interface VoiceInputState {
  supported: boolean;
  listening: boolean;
  start: () => void;
  stop: () => void;
}

const ERROR_MAP: Record<string, VoiceErrorReason> = {
  'not-allowed': 'not-allowed',
  'service-not-allowed': 'not-allowed',
  'permission-denied': 'not-allowed',
  'no-speech': 'no-speech',
  'audio-capture': 'audio-capture',
  network: 'network',
  aborted: 'aborted',
};

/** Thin wrapper around the Web Speech API. Streams interim transcripts
 *  to `onTranscript` so the input field can update live. The recognition
 *  object is created exactly once per mount — callbacks are routed through
 *  refs so the engine is not torn down on every render. */
export function useVoiceInput(options: UseVoiceInputOptions): VoiceInputState {
  const { onTranscript, onError, lang } = options;
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef(onTranscript);
  const errorRef = useRef(onError);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    transcriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      errorRef.current?.('unsupported');
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang || navigator?.language || 'en-US';
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) transcriptRef.current(final.trim(), true);
      else if (interim) transcriptRef.current(interim.trim(), false);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event: any) => {
      setListening(false);
      const code = String(event?.error ?? 'unknown');
      const reason = ERROR_MAP[code] ?? 'unknown';
      // 'aborted' fires whenever we programmatically stop — don't surface it.
      if (reason !== 'aborted') errorRef.current?.(reason, code);
    };
    recognitionRef.current = recognition;
    setSupported(true);
    return () => {
      try {
        recognition.abort();
      } catch {
        // recognition may already be torn down
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      errorRef.current?.('unsupported');
      return;
    }
    if (listening) return;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
      errorRef.current?.('unknown');
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // already stopped
    }
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}
