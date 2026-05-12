import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseSSELine,
  buildHistory,
  buildSSERequestHeaders,
  resolveChatTransport,
  resolveChatEndpoint,
  buildChatRequestBody,
} from '@/components/chat/hooks/useSSE';
import type { Message } from '@/components/chat/types';

describe('parseSSELine', () => {
  it('parses event line', () => {
    const state = { currentEvent: '', currentData: '' };
    parseSSELine('event: thinking', state);
    expect(state.currentEvent).toBe('thinking');
  });

  it('parses data line', () => {
    const state = { currentEvent: 'thinking', currentData: '' };
    parseSSELine('data: {"message":"hello"}', state);
    expect(state.currentData).toBe('{"message":"hello"}');
  });

  it('ignores empty lines (they signal event boundary)', () => {
    const state = { currentEvent: 'thinking', currentData: '{"message":"hi"}' };
    parseSSELine('', state);
    // Empty line doesn't change state — caller checks for complete event
    expect(state.currentEvent).toBe('thinking');
  });

  it('ignores comment lines', () => {
    const state = { currentEvent: '', currentData: '' };
    parseSSELine(': keepalive', state);
    expect(state.currentEvent).toBe('');
  });
});

describe('buildHistory', () => {
  it('returns last 20 messages formatted for API', () => {
    const messages: Message[] = [
      { id: 'u1', type: 'user', content: 'Hello' },
      { id: 'a1', type: 'assistant', content: 'Hi there', references: [], traces: [] },
      { id: 'c1', type: 'context', component: 'about', data: { ceo: 'John' } },
    ];
    const history = buildHistory(messages);
    expect(history).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
      { role: 'context', content: JSON.stringify({ component: 'about', data: { ceo: 'John' } }) },
    ]);
  });

  it('limits history to a reasonable window', () => {
    const messages: Message[] = Array.from({ length: 50 }, (_, i) => ({
      id: `u${i}`,
      type: 'user' as const,
      content: `msg-${i}`,
    }));
    const history = buildHistory(messages);
    expect(history.length).toBeLessThanOrEqual(40);
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1].content).toBe('msg-49');
  });
});

describe('buildSSERequestHeaders', () => {
  it('includes demo header when demo mode is active', () => {
    const headers = buildSSERequestHeaders(true);
    expect(headers['X-Demo-Mode']).toBe('1');
    expect(headers.Accept).toBe('text/event-stream');
  });

  it('omits demo header when demo mode is inactive', () => {
    const headers = buildSSERequestHeaders(false);
    expect(headers['X-Demo-Mode']).toBeUndefined();
    expect(headers['Content-Type']).toBe('application/json');
  });
});

describe('chat transport resolution', () => {
  it('defaults to agent transport', () => {
    expect(resolveChatTransport(undefined)).toBe('agent');
    expect(resolveChatTransport('')).toBe('agent');
    expect(resolveChatTransport('invalid')).toBe('agent');
  });

  it('uses backend transport when explicitly configured', () => {
    expect(resolveChatTransport('backend')).toBe('backend');
    expect(resolveChatTransport('BACKEND')).toBe('backend');
  });
});

describe('resolveChatEndpoint', () => {
  it('resolves direct agent endpoint by default', () => {
    const resolved = resolveChatEndpoint({
      transport: undefined,
      agentBaseUrl: 'http://localhost:8000/',
      backendBaseUrl: 'http://localhost:8080/',
    });

    expect(resolved.transport).toBe('agent');
    expect(resolved.url).toBe('http://localhost:8000/agent/chat');
  });

  it('resolves backend proxy endpoint when backend transport is set', () => {
    const resolved = resolveChatEndpoint({
      transport: 'backend',
      agentBaseUrl: 'http://localhost:8000/',
      backendBaseUrl: 'http://localhost:8080/',
    });

    expect(resolved.transport).toBe('backend');
    expect(resolved.url).toBe('http://localhost:8080/api/chat/stream');
  });
});

describe('buildChatRequestBody', () => {
  const history = [{ role: 'user', content: 'hello' }];

  it('uses snake_case conversation_id for direct agent transport', () => {
    expect(
      buildChatRequestBody({
        transport: 'agent',
        conversationId: 'conv-1',
        message: 'hi',
        history,
      }),
    ).toEqual({
      conversation_id: 'conv-1',
      message: 'hi',
      history,
    });
  });

  it('keeps backend proxy payload shape for backend transport', () => {
    expect(
      buildChatRequestBody({
        transport: 'backend',
        conversationId: 'conv-1',
        message: 'hi',
        history,
      }),
    ).toEqual({
      conversationId: 'conv-1',
      message: 'hi',
      history,
    });
  });
});
