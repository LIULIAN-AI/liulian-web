'use client';

import { useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useChatContext } from './useChatContext';
import type {
  Message,
  ChatAction,
  InteractionStep,
  OnlineMode,
  Reference,
} from '@/components/chat/types';
import { isDemoModeActive } from '../demo-mode';

export type ChatTransport = 'agent' | 'backend';

interface ChatEndpointOptions {
  transport?: string;
  agentBaseUrl?: string;
  backendBaseUrl?: string;
}

interface ChatHistoryEntry {
  role: string;
  content: string;
}

interface ChatRequestBodyOptions {
  transport: ChatTransport;
  conversationId: string;
  message: string;
  history: ChatHistoryEntry[];
}

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/\/+$/, '');
}

export function resolveChatTransport(transport: string | undefined): ChatTransport {
  if (transport?.trim().toLowerCase() === 'backend') {
    return 'backend';
  }
  return 'agent';
}

export function resolveChatEndpoint(
  options: ChatEndpointOptions = {},
): { transport: ChatTransport; url: string } {
  const transport = resolveChatTransport(
    options.transport ?? process.env.NEXT_PUBLIC_CHAT_TRANSPORT,
  );
  const backendBaseUrl = normalizeBaseUrl(
    options.backendBaseUrl ?? process.env.NEXT_PUBLIC_BACKEND_API_URL,
    'http://localhost:8080',
  );
  const agentBaseUrl = normalizeBaseUrl(
    options.agentBaseUrl ?? process.env.NEXT_PUBLIC_AGENT_BASE_URL,
    'http://localhost:8000',
  );

  if (transport === 'backend') {
    return { transport, url: `${backendBaseUrl}/api/chat/stream` };
  }
  return { transport, url: `${agentBaseUrl}/agent/chat` };
}

export function buildChatRequestBody({
  transport,
  conversationId,
  message,
  history,
}: ChatRequestBodyOptions):
  | { conversationId: string; message: string; history: ChatHistoryEntry[] }
  | { conversation_id: string; message: string; history: ChatHistoryEntry[] } {
  if (transport === 'backend') {
    return {
      conversationId,
      message,
      history,
    };
  }

  return {
    conversation_id: conversationId,
    message,
    history,
  };
}

export interface SSEParseState {
  currentEvent: string;
  currentData: string;
}

export function buildSSERequestHeaders(
  demoModeActive: boolean,
  onlineMode: OnlineMode = 'ask',
  locale?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (demoModeActive) {
    headers['X-Demo-Mode'] = '1';
  }
  // X-Online-Mode tells the agent how to handle the web_search tool:
  //   - "always":   force a parallel web_search alongside DB lookups
  //   - "fallback": auto-call web_search when DB returns nothing
  //   - "ask":      legacy — surface an offer chip and wait for the user
  // Default "ask" preserves prior behaviour when the header is absent.
  headers['X-Online-Mode'] = onlineMode;
  if (locale) {
    headers['Accept-Language'] = locale;
  }
  return headers;
}

export function parseSSELine(line: string, state: SSEParseState): void {
  if (line.startsWith(':')) return; // comment
  if (line.startsWith('event: ')) {
    state.currentEvent = line.slice(7);
  } else if (line.startsWith('data: ')) {
    state.currentData = line.slice(6);
  }
  // empty lines and other lines are no-ops on the state object
}

export function buildHistory(
  messages: Message[],
  interactionPath: InteractionStep[] = [],
): { role: string; content: string }[] {
  const indexed = messages.map((msg, index) => ({ msg, index }));
  const selectedIndexes = new Set<number>();

  for (const item of indexed.slice(-36)) {
    selectedIndexes.add(item.index);
  }
  for (const item of indexed.filter((entry) => entry.msg.type === 'context').slice(-8)) {
    selectedIndexes.add(item.index);
  }

  const selected = indexed
    .filter((entry) => selectedIndexes.has(entry.index))
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.msg);

  const history = selected.map((msg) => {
    if (msg.type === 'user') return { role: 'user', content: msg.content };
    if (msg.type === 'assistant') return { role: 'assistant', content: msg.content };
    // context
    return {
      role: 'context',
      content: JSON.stringify({ component: msg.component, data: msg.data }),
    };
  });

  if (interactionPath.length > 0) {
    history.push({
      role: 'context',
      content: JSON.stringify({
        component: 'interaction_path',
        data: { events: interactionPath.slice(-10) },
      }),
    });
  }

  return history;
}

function sseEventToAction(event: string, data: string): ChatAction | null {
  try {
    const parsed = JSON.parse(data);
    switch (event) {
      case 'trace':
        return traceToAction(parsed);
      case 'thinking':
        return { type: 'SSE_THINKING', data: parsed };
      case 'intent':
        return { type: 'SSE_INTENT', data: parsed };
      case 'tool_call':
        return { type: 'SSE_TOOL_CALL', data: parsed };
      case 'tool_result':
        return { type: 'SSE_TOOL_RESULT', data: parsed };
      case 'response':
        return { type: 'SSE_RESPONSE', data: parsed };
      case 'suggestions':
        return { type: 'SSE_SUGGESTIONS', suggestions: parsed };
      case 'error':
        return { type: 'SSE_ERROR', message: parsed?.message ?? 'Unknown error' };
      case 'done':
        return { type: 'SSE_DONE' };
      default:
        return null;
    }
  } catch {
    if (event === 'done') return { type: 'SSE_DONE' };
    return null;
  }
}

function traceToAction(trace: any): ChatAction {
  const step = typeof trace?.step === 'string' ? trace.step.toLowerCase() : '';
  const detail = typeof trace?.detail === 'string' ? trace.detail : '';

  if (step === 'intent') {
    return { type: 'SSE_INTENT', data: { intent: detail || trace?.intent || 'demo' } };
  }
  if (step === 'tool') {
    return { type: 'SSE_TOOL_CALL', data: { tool: detail || trace?.tool || 'demo_tool' } };
  }
  if (step === 'tool_result') {
    return { type: 'SSE_TOOL_RESULT', data: { tool: detail || trace?.tool || 'demo_tool' } };
  }

  return { type: 'SSE_THINKING', data: { message: detail || step || 'Processing...' } };
}

function parseChunkText(data: string): string {
  try {
    const parsed = JSON.parse(data);
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed.text === 'string') return parsed.text;
  } catch {
    return '';
  }
  return '';
}

function normalizeReferences(data: string): Reference[] {
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const tool =
          typeof (item as any).tool === 'string' && (item as any).tool.trim()
            ? (item as any).tool.trim()
            : 'demo_data';
        const table =
          (typeof (item as any).table === 'string' && (item as any).table.trim()) ||
          (typeof (item as any).title === 'string' && (item as any).title.trim()) ||
          (typeof (item as any).url === 'string' && (item as any).url.trim()) ||
          'reference';
        return { tool, table };
      })
      .filter((ref): ref is Reference => ref !== null);
  } catch {
    return [];
  }
}

export function useSSE() {
  const { state, dispatch } = useChatContext();
  const locale = useLocale();
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'ABORT' });
  }, [dispatch]);

  const sendMessage = useCallback(
    async (text: string, options?: { hidden?: boolean }) => {
      if (!text.trim() || state.status === 'streaming') return;

      // Abort any previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch({
        type: 'SEND_MESSAGE',
        content: text.trim(),
        ...(options?.hidden ? { hidden: true } : {}),
      });

      const history = buildHistory(
        [
          ...state.messages,
          { id: 'pending', type: 'user', content: text.trim() } as Message,
        ],
        state.interactionPath,
      );

      try {
        let pendingDemoText = '';
        let pendingDemoReferences: Reference[] = [];
        // Track whether ANY orchestration trace event has been dispatched
        // for this turn. If the agent streams chunks directly (some
        // backends do this on subsequent turns), we synthesize a
        // single 'thinking' trace on the first chunk so the
        // Orchestration panel shows real activity instead of the empty
        // "Starting orchestration…" placeholder for the whole stream.
        // R8-7 v2 — root cause was that turn 2 onward sometimes never
        // fires thinking/intent/tool_call events.
        let orchestrationDispatched = false;

        const flushDemoResponse = () => {
          if (!pendingDemoText && pendingDemoReferences.length === 0) {
            return;
          }
          dispatch({
            type: 'SSE_RESPONSE',
            data: { text: pendingDemoText, references: pendingDemoReferences },
          });
          pendingDemoText = '';
          pendingDemoReferences = [];
        };

        const handleParsedEvent = (eventName: string, eventData: string) => {
          if (eventName === 'chunk') {
            if (!orchestrationDispatched) {
              dispatch({
                type: 'SSE_THINKING',
                data: { message: 'Generating response…' },
              });
              orchestrationDispatched = true;
            }
            pendingDemoText += parseChunkText(eventData);
            return;
          }
          if (eventName === 'references') {
            pendingDemoReferences = normalizeReferences(eventData);
            return;
          }
          if (eventName === 'done') {
            flushDemoResponse();
            dispatch({ type: 'SSE_DONE' });
            return;
          }

          const action = sseEventToAction(eventName, eventData);
          if (action) {
            dispatch(action);
            if (
              action.type === 'SSE_THINKING' ||
              action.type === 'SSE_INTENT' ||
              action.type === 'SSE_TOOL_CALL' ||
              action.type === 'SSE_TOOL_RESULT'
            ) {
              orchestrationDispatched = true;
            }
          }
        };

        const headers = buildSSERequestHeaders(isDemoModeActive(), state.onlineMode, locale);

        const endpoint = resolveChatEndpoint();
        const requestBody = buildChatRequestBody({
          transport: endpoint.transport,
          conversationId: state.conversationId,
          message: text.trim(),
          history,
        });

        const resp = await fetch(endpoint.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!resp.ok) {
          dispatch({
            type: 'SSE_ERROR',
            message: `Server error: ${resp.status}`,
          });
          dispatch({ type: 'SSE_DONE' });
          return;
        }

        const reader = resp.body?.getReader();
        if (!reader) {
          dispatch({ type: 'SSE_ERROR', message: 'No response stream' });
          dispatch({ type: 'SSE_DONE' });
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';
        const parseState: SSEParseState = { currentEvent: '', currentData: '' };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line === '' && parseState.currentEvent) {
              // Empty line = event boundary
              handleParsedEvent(parseState.currentEvent, parseState.currentData);
              parseState.currentEvent = '';
              parseState.currentData = '';
            } else {
              parseSSELine(line, parseState);
            }
          }
        }

        // Process any remaining event in buffer
        if (parseState.currentEvent) {
          handleParsedEvent(parseState.currentEvent, parseState.currentData);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          dispatch({
            type: 'SSE_ERROR',
            message: 'Connection failed. Please try again.',
          });
          dispatch({ type: 'SSE_DONE' });
        }
      }
    },
    [
      state.status,
      state.messages,
      state.interactionPath,
      state.conversationId,
      state.onlineMode,
      dispatch,
    ],
  );

  return {
    sendMessage,
    abort,
    isStreaming: state.status === 'streaming',
  };
}
