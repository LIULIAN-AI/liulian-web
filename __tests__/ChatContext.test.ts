import { describe, it, expect } from 'vitest';
import { chatReducer, initialChatState } from '@/contexts/ChatContext';
import type { ChatState, ChatAction } from '@/components/chat/types';

describe('chatReducer', () => {
  it('SEND_MESSAGE appends user message and sets streaming', () => {
    const state = { ...initialChatState, status: 'idle' as const };
    const action: ChatAction = { type: 'SEND_MESSAGE', content: 'Hello' };
    const next = chatReducer(state, action);
    expect(next.messages).toHaveLength(1);
    expect(next.messages[0]).toMatchObject({ type: 'user', content: 'Hello' });
    expect(next.messages[0]).toHaveProperty('id');
    expect(next.status).toBe('streaming');
    expect(next.suggestions).toEqual([]);
  });

  it('INJECT_CONTEXT appends context message and opens panel', () => {
    const state = { ...initialChatState, panelState: 'closed' as const };
    const action: ChatAction = {
      type: 'INJECT_CONTEXT',
      component: 'about',
      data: { ceo: 'John', revenue: '1B' },
    };
    const next = chatReducer(state, action);
    expect(next.messages).toHaveLength(1);
    expect(next.messages[0]).toMatchObject({
      type: 'context',
      component: 'about',
      data: { ceo: 'John', revenue: '1B' },
    });
    expect(next.panelState).toBe('default');
  });

  it('INJECT_CONTEXT generates chips when idle', () => {
    const state = { ...initialChatState, status: 'idle' as const };
    const action: ChatAction = {
      type: 'INJECT_CONTEXT',
      component: 'about',
      data: { ceo: 'John', revenue: '1B' },
    };
    const next = chatReducer(state, action);
    expect(next.suggestions.length).toBeGreaterThan(0);
  });

  it('INJECT_CONTEXT does NOT generate chips when streaming', () => {
    const state = { ...initialChatState, status: 'streaming' as const };
    const action: ChatAction = {
      type: 'INJECT_CONTEXT',
      component: 'about',
      data: { ceo: 'John' },
    };
    const next = chatReducer(state, action);
    expect(next.suggestions).toEqual([]);
  });

  it('SSE_THINKING adds trace step', () => {
    const state = { ...initialChatState, status: 'streaming' as const };
    const action: ChatAction = {
      type: 'SSE_THINKING',
      data: { message: 'Classifying...' },
    };
    const next = chatReducer(state, action);
    expect(next.activeTraces.length).toBeGreaterThanOrEqual(1);
    expect(next.activeTraces[next.activeTraces.length - 1].event).toBe('thinking');
  });

  it('SSE_RESPONSE bundles traces into assistant message', () => {
    const state: ChatState = {
      ...initialChatState,
      status: 'streaming',
      activeTraces: [
        { event: 'thinking', data: { message: 'Classifying...' }, timestamp: 1 },
        { event: 'tool_call', data: { tool: 'db_reader' }, timestamp: 2 },
      ],
    };
    const action: ChatAction = {
      type: 'SSE_RESPONSE',
      data: { text: 'The answer is 42.', references: [{ tool: 'db_reader', table: 'financials' }] },
    };
    const next = chatReducer(state, action);
    expect(next.messages).toHaveLength(1);
    const msg = next.messages[0];
    expect(msg.type).toBe('assistant');
    if (msg.type === 'assistant') {
      expect(msg.content).toBe('The answer is 42.');
      expect(msg.traces).toHaveLength(2);
      expect(msg.references).toHaveLength(1);
    }
    expect(next.activeTraces).toEqual([]);
  });

  it('SSE_DONE sets idle', () => {
    const state = { ...initialChatState, status: 'streaming' as const };
    const next = chatReducer(state, { type: 'SSE_DONE' });
    expect(next.status).toBe('idle');
  });

  it('SSE_ERROR sets error status and appends error message', () => {
    const state = { ...initialChatState, status: 'streaming' as const };
    const next = chatReducer(state, { type: 'SSE_ERROR', message: 'Network fail' });
    expect(next.status).toBe('error');
    expect(next.messages).toHaveLength(1);
    expect(next.messages[0].type).toBe('assistant');
    if (next.messages[0].type === 'assistant') {
      expect(next.messages[0].error).toBe(true);
      expect(next.messages[0].errorRaw).toBe('Network fail');
    }
  });

  it('SET_PANEL_STATE updates panel', () => {
    const next = chatReducer(initialChatState, {
      type: 'SET_PANEL_STATE',
      panelState: 'expanded',
    });
    expect(next.panelState).toBe('expanded');
  });

  it('ABORT resets to idle', () => {
    const state = { ...initialChatState, status: 'streaming' as const };
    const next = chatReducer(state, { type: 'ABORT' });
    expect(next.status).toBe('idle');
    expect(next.activeTraces).toEqual([]);
  });
});
