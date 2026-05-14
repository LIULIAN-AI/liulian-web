'use client';

import React, { createContext, useCallback, useEffect, useReducer, ReactNode } from 'react';
import type {
  ChatAction,
  ChatContextValue,
  ChatSessionArchive,
  ChatState,
  InteractionStep,
  Message,
  MessageFeedback,
  OnlineMode,
  PanelState,
} from '@/components/chat/types';
import { CONTEXT_CHIP_KEYS } from '@/components/chat/types';

const CHAT_STORAGE_KEY = 'liulian_chat_state_v1';
const ONLINE_MODE_STORAGE_KEY = 'liulian_online_mode_v1';
const MAX_PERSISTED_MESSAGES = 200;
const MAX_ARCHIVES = 20;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function generateChipsFromContext(data: Record<string, any>): string[] {
  const chips: string[] = [];
  for (const key of Object.keys(data)) {
    const chipKey = CONTEXT_CHIP_KEYS[key];
    if (chipKey && chips.length < 5) {
      chips.push(chipKey);
    }
  }
  return chips;
}

/** Ensure a persisted message has an id; legacy entries get one assigned. */
function hydrateMessage(raw: any): Message | null {
  if (!raw || typeof raw !== 'object') return null;
  const type = raw.type;
  if (type !== 'user' && type !== 'assistant' && type !== 'context') return null;
  return { ...raw, id: typeof raw.id === 'string' && raw.id ? raw.id : generateId() } as Message;
}

function normalizePersistedMessages(input: unknown): Message[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-MAX_PERSISTED_MESSAGES)
    .map(hydrateMessage)
    .filter((item): item is Message => item !== null);
}

function normalizeInteractionPath(input: unknown): InteractionStep[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const source = item as any;
      const type = source.type;
      if (
        type !== 'context_click' &&
        type !== 'user_message' &&
        type !== 'assistant_response' &&
        type !== 'branch'
      ) {
        return null;
      }
      return {
        type,
        timestamp: Number(source.timestamp) || Date.now(),
        component: typeof source.component === 'string' ? source.component : undefined,
        summary: typeof source.summary === 'string' ? source.summary : undefined,
      } as InteractionStep;
    })
    .filter((item): item is InteractionStep => item !== null)
    .slice(-MAX_PERSISTED_MESSAGES);
}

function normalizeArchives(input: unknown): ChatSessionArchive[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const source = item as any;
      const conversationId =
        typeof source.conversationId === 'string' && source.conversationId.trim()
          ? source.conversationId
          : '';
      if (!conversationId) return null;
      return {
        conversationId,
        updatedAt: Number(source.updatedAt) || Date.now(),
        title:
          typeof source.title === 'string' && source.title.trim()
            ? source.title
            : 'Archived chat',
        messages: normalizePersistedMessages(source.messages),
        suggestions: Array.isArray(source.suggestions)
          ? source.suggestions
              .filter((entry: unknown): entry is string => typeof entry === 'string')
              .slice(0, 5)
          : [],
        interactionPath: normalizeInteractionPath(source.interactionPath),
        pinned: source.pinned === true,
      } as ChatSessionArchive;
    })
    .filter((item): item is ChatSessionArchive => item !== null)
    .slice(0, MAX_ARCHIVES);
}

function buildArchiveTitle(messages: Message[]): string {
  const firstUser = messages.find(
    (message): message is Extract<Message, { type: 'user' }> => message.type === 'user',
  );
  if (!firstUser) return 'Archived chat';
  const content = firstUser.content.trim();
  if (!content) return 'Archived chat';
  return content.length > 48 ? `${content.slice(0, 48)}...` : content;
}

function upsertArchive(archives: ChatSessionArchive[], archive: ChatSessionArchive): ChatSessionArchive[] {
  const withoutCurrent = archives.filter((item) => item.conversationId !== archive.conversationId);
  return [archive, ...withoutCurrent].slice(0, MAX_ARCHIVES);
}

export const initialChatState: ChatState = {
  panelState: 'closed',
  status: 'idle',
  conversationId: generateId(),
  messages: [],
  suggestions: [],
  activeTraces: [],
  interactionPath: [],
  archives: [],
  onlineMode: 'ask',
};

function readPersistedOnlineMode(): OnlineMode {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return 'ask';
  }
  try {
    const raw = window.localStorage.getItem(ONLINE_MODE_STORAGE_KEY);
    if (raw === 'always' || raw === 'fallback' || raw === 'ask') return raw;
  } catch {
    // Ignore — private mode/quota etc.
  }
  return 'ask';
}

function createInitialState(_seed: ChatState = initialChatState): ChatState {
  const baseState: ChatState = {
    ...initialChatState,
    conversationId: generateId(),
    onlineMode: readPersistedOnlineMode(),
  };

  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return baseState;
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return baseState;

    const parsed = JSON.parse(raw) as Partial<ChatState>;
    const conversationId =
      typeof parsed.conversationId === 'string' && parsed.conversationId.trim()
        ? parsed.conversationId
        : baseState.conversationId;
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((item): item is string => typeof item === 'string')
          .slice(0, 5)
      : [];
    const persistedPanelState: PanelState =
      parsed.panelState === 'expanded' || parsed.panelState === 'default' || parsed.panelState === 'closed'
        ? parsed.panelState
        : 'closed';
    const conversationTitle =
      typeof parsed.conversationTitle === 'string' && parsed.conversationTitle.trim()
        ? parsed.conversationTitle
        : undefined;

    return {
      ...baseState,
      conversationId,
      conversationTitle,
      messages: normalizePersistedMessages(parsed.messages),
      suggestions,
      interactionPath: normalizeInteractionPath(parsed.interactionPath),
      archives: normalizeArchives(parsed.archives),
      status: 'idle',
      panelState: persistedPanelState,
      activeTraces: [],
    };
  } catch {
    return baseState;
  }
}

function persistChatState(state: ChatState): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    const payload = {
      conversationId: state.conversationId,
      conversationTitle: state.conversationTitle,
      panelState: state.panelState,
      messages: state.messages.slice(-MAX_PERSISTED_MESSAGES),
      suggestions: state.suggestions.slice(0, 5),
      interactionPath: state.interactionPath.slice(-MAX_PERSISTED_MESSAGES),
      archives: state.archives.slice(0, MAX_ARCHIVES),
    };
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore persistence errors (private mode/quota).
  }
}

/** Mark all messages from index `fromIdx` (inclusive) onward as superseded.
 *  Existing supersededAt values are preserved (older branches stay tagged
 *  with their original truncation timestamps). */
function markSupersededFrom(messages: Message[], fromIdx: number): Message[] {
  if (fromIdx < 0 || fromIdx >= messages.length) return messages;
  const now = Date.now();
  return messages.map((m, i) =>
    i >= fromIdx && !m.supersededAt ? { ...m, supersededAt: now } : m,
  );
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            type: 'user',
            content: action.content,
            ...(action.hidden ? { hidden: true } : {}),
          },
        ],
        status: 'streaming',
        suggestions: [],
        // R8 v3 rework: seed a single "Sending request…" trace so the
        // Orchestration panel ALWAYS has visible content from the first
        // frame of streaming — even on turn 2+ where the agent sometimes
        // skips the `thinking` event and goes straight to `response`.
        // Real trace events from the agent append below this seed; the
        // seed is then baked into the completed assistant message
        // traces, so the embedded accordion still has at least one row.
        activeTraces: [
          { event: 'thinking', data: { message: 'Sending request…' }, timestamp: Date.now() },
        ],
        interactionPath: [
          ...state.interactionPath,
          {
            type: 'user_message' as const,
            timestamp: Date.now(),
            summary: action.content.slice(0, 120),
          },
        ].slice(-MAX_PERSISTED_MESSAGES),
      };

    case 'INJECT_CONTEXT': {
      const newMessages = [
        ...state.messages,
        {
          id: generateId(),
          type: 'context' as const,
          component: action.component,
          data: action.data,
          ...(action.sourceId ? { sourceId: action.sourceId } : {}),
          ...(action.sourcePath ? { sourcePath: action.sourcePath } : {}),
        },
      ];
      const suggestions = state.status === 'idle' ? generateChipsFromContext(action.data) : [];
      return {
        ...state,
        messages: newMessages,
        panelState: state.panelState === 'closed' ? 'default' : state.panelState,
        suggestions,
        interactionPath: [
          ...state.interactionPath,
          { type: 'context_click' as const, timestamp: Date.now(), component: action.component },
        ].slice(-MAX_PERSISTED_MESSAGES),
      };
    }

    case 'SSE_THINKING':
      return {
        ...state,
        activeTraces: [
          ...state.activeTraces,
          { event: 'thinking', data: action.data, timestamp: Date.now() },
        ],
      };

    case 'SSE_INTENT':
      return {
        ...state,
        activeTraces: [
          ...state.activeTraces,
          { event: 'intent', data: action.data, timestamp: Date.now() },
        ],
      };

    case 'SSE_TOOL_CALL':
      return {
        ...state,
        activeTraces: [
          ...state.activeTraces,
          { event: 'tool_call', data: action.data, timestamp: Date.now() },
        ],
      };

    case 'SSE_TOOL_RESULT':
      return {
        ...state,
        activeTraces: [
          ...state.activeTraces,
          { event: 'tool_result', data: action.data, timestamp: Date.now() },
        ],
      };

    case 'SSE_RESPONSE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            type: 'assistant',
            content: action.data.text,
            references: action.data.references ?? [],
            traces: [...state.activeTraces],
            reliability: action.data.reliability,
          },
        ],
        activeTraces: [],
        interactionPath: [
          ...state.interactionPath,
          {
            type: 'assistant_response' as const,
            timestamp: Date.now(),
            summary: action.data.text.slice(0, 120),
          },
        ].slice(-MAX_PERSISTED_MESSAGES),
      };

    case 'SSE_SUGGESTIONS':
      return { ...state, suggestions: action.suggestions.slice(0, 5) };

    case 'SSE_ERROR':
      return {
        ...state,
        status: 'error',
        messages: [
          ...state.messages,
          {
            id: generateId(),
            type: 'assistant',
            // Friendly Chinese-first copy. Raw payload is preserved on
            // `errorRaw` so MessageBubble can surface it inside a
            // collapsible <details> for debug/support purposes.
            content:
              '抱歉,智能助手在处理这次请求时遇到了内部错误,已经自动中止。' +
              '您可以稍等片刻后点击下方"重试"再试一次,或换一种问法。',
            references: [],
            traces: [...state.activeTraces],
            error: true,
            errorRaw: action.message,
          },
        ],
        activeTraces: [],
      };

    case 'SSE_DONE':
      return { ...state, status: 'idle' };

    case 'SET_PANEL_STATE':
      return { ...state, panelState: action.panelState };

    case 'SET_ONLINE_MODE':
      return { ...state, onlineMode: action.mode };

    case 'ABORT':
      return { ...state, status: 'idle', activeTraces: [] };

    case 'START_NEW_CHAT': {
      const currentHasMessages = state.messages.length > 0;
      const nextArchives = currentHasMessages
        ? upsertArchive(state.archives, {
            conversationId: state.conversationId,
            updatedAt: Date.now(),
            title: state.conversationTitle ?? buildArchiveTitle(state.messages),
            messages: state.messages.slice(-MAX_PERSISTED_MESSAGES),
            suggestions: state.suggestions.slice(0, 5),
            interactionPath: state.interactionPath.slice(-MAX_PERSISTED_MESSAGES),
            pinned: state.archives.find((a) => a.conversationId === state.conversationId)?.pinned ?? false,
          })
        : state.archives;

      return {
        ...state,
        conversationId: generateId(),
        conversationTitle: undefined,
        messages: [],
        suggestions: [],
        activeTraces: [],
        status: 'idle',
        interactionPath: [],
        archives: nextArchives,
      };
    }

    case 'LOAD_ARCHIVE': {
      const archive = state.archives.find((item) => item.conversationId === action.conversationId);
      if (!archive) return state;
      return {
        ...state,
        conversationId: archive.conversationId,
        conversationTitle: archive.title,
        messages: archive.messages.slice(-MAX_PERSISTED_MESSAGES),
        suggestions: archive.suggestions.slice(0, 5),
        activeTraces: [],
        status: 'idle',
        interactionPath: archive.interactionPath.slice(-MAX_PERSISTED_MESSAGES),
        panelState: state.panelState === 'closed' ? 'default' : state.panelState,
      };
    }

    case 'RENAME_SESSION':
      return { ...state, conversationTitle: action.title.trim() || undefined };

    case 'TRUNCATE_FROM': {
      const idx = state.messages.findIndex((m) => m.id === action.messageId);
      if (idx < 0) return state;
      return {
        ...state,
        messages: markSupersededFrom(state.messages, idx),
        suggestions: [],
        activeTraces: [],
        interactionPath: [
          ...state.interactionPath,
          { type: 'branch' as const, timestamp: Date.now(), summary: `Truncated from ${action.messageId.slice(0, 8)}` },
        ].slice(-MAX_PERSISTED_MESSAGES),
      };
    }

    case 'SET_FEEDBACK': {
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.messageId && m.type === 'assistant'
            ? { ...m, feedback: action.feedback }
            : m,
        ),
      };
    }

    case 'TOGGLE_PIN_ARCHIVE': {
      return {
        ...state,
        archives: state.archives.map((a) =>
          a.conversationId === action.conversationId ? { ...a, pinned: !a.pinned } : a,
        ),
      };
    }

    case 'RENAME_ARCHIVE': {
      const trimmed = action.title.trim();
      if (!trimmed) return state;
      // The currently-active session lives outside `archives` until it is
      // archived (via START_NEW_CHAT or LOAD_ARCHIVE). When the user
      // renames the *current* session we mirror to conversationTitle so
      // the change persists through the next archival snapshot.
      const isCurrent = state.conversationId === action.conversationId;
      return {
        ...state,
        conversationTitle: isCurrent ? trimmed : state.conversationTitle,
        archives: state.archives.map((a) =>
          a.conversationId === action.conversationId ? { ...a, title: trimmed } : a,
        ),
      };
    }

    case 'DELETE_ARCHIVE': {
      // R8 v3: deletion now supports the active session too. The earlier
      // guard forced users into a switch-then-delete loop that the UI
      // couldn't actually express (selecting an archive immediately
      // promoted it to active). When the deleted id matches the current
      // session we drop it from archives AND reset to a fresh empty
      // chat — equivalent to START_NEW_CHAT without the auto-archive
      // snapshot of the conversation being thrown away.
      const isCurrent = state.conversationId === action.conversationId;
      const nextArchives = state.archives.filter(
        (a) => a.conversationId !== action.conversationId,
      );
      if (!isCurrent) {
        return { ...state, archives: nextArchives };
      }
      return {
        ...state,
        conversationId: generateId(),
        conversationTitle: undefined,
        messages: [],
        suggestions: [],
        activeTraces: [],
        status: 'idle',
        interactionPath: [],
        archives: nextArchives,
      };
    }

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState, createInitialState);

  useEffect(() => {
    persistChatState(state);
  }, [state]);

  const sendMessage = useCallback(
    (text: string, options?: { hidden?: boolean }) => {
      if (!text.trim() || state.status === 'streaming') return;
      dispatch({
        type: 'SEND_MESSAGE',
        content: text.trim(),
        ...(options?.hidden ? { hidden: true } : {}),
      });
    },
    [state.status],
  );

  const injectContext = useCallback(
    (
      component: string,
      data: Record<string, any>,
      sourceId?: string,
      sourcePath?: string,
    ) => {
      dispatch({ type: 'INJECT_CONTEXT', component, data, sourceId, sourcePath });
    },
    [],
  );

  const abort = useCallback(() => {
    dispatch({ type: 'ABORT' });
  }, []);

  const setPanelState = useCallback((panelState: PanelState) => {
    dispatch({ type: 'SET_PANEL_STATE', panelState });
  }, []);

  const setOnlineMode = useCallback((mode: OnlineMode) => {
    dispatch({ type: 'SET_ONLINE_MODE', mode });
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(ONLINE_MODE_STORAGE_KEY, mode);
      } catch {
        // Ignore — private mode/quota etc.
      }
    }
  }, []);

  const startNewChat = useCallback(() => {
    dispatch({ type: 'START_NEW_CHAT' });
  }, []);

  const loadArchive = useCallback((conversationId: string) => {
    dispatch({ type: 'LOAD_ARCHIVE', conversationId });
  }, []);

  const renameSession = useCallback((title: string) => {
    dispatch({ type: 'RENAME_SESSION', title });
  }, []);

  const truncateFrom = useCallback((messageId: string) => {
    dispatch({ type: 'TRUNCATE_FROM', messageId });
  }, []);

  const setFeedback = useCallback((messageId: string, feedback: MessageFeedback) => {
    dispatch({ type: 'SET_FEEDBACK', messageId, feedback });
  }, []);

  const togglePin = useCallback((conversationId: string) => {
    dispatch({ type: 'TOGGLE_PIN_ARCHIVE', conversationId });
  }, []);

  const renameArchive = useCallback((conversationId: string, title: string) => {
    dispatch({ type: 'RENAME_ARCHIVE', conversationId, title });
  }, []);

  const deleteArchive = useCallback((conversationId: string) => {
    dispatch({ type: 'DELETE_ARCHIVE', conversationId });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        sendMessage,
        injectContext,
        abort,
        setPanelState,
        setOnlineMode,
        startNewChat,
        loadArchive,
        renameSession,
        truncateFrom,
        setFeedback,
        togglePin,
        renameArchive,
        deleteArchive,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext };
