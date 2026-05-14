import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithIntl, screen, act } from './test-utils';
import { cleanup } from '@testing-library/react';
import ChatMessages from '@/components/chat/ChatMessages';
import type { Message, TraceStep } from '@/components/chat/types';

describe('ChatMessages', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders user and assistant messages', () => {
    const messages: Message[] = [
      { id: '1', type: 'user', content: 'What is ZA Bank revenue?' },
      {
        id: '2',
        type: 'assistant',
        content: 'ZA Bank total revenue for 2023 is ...',
        references: [],
        traces: [],
      },
    ];

    renderWithIntl(<ChatMessages messages={messages} activeTraces={[]} isStreaming={false} />);
    expect(screen.getByText('What is ZA Bank revenue?')).toBeInTheDocument();
    expect(screen.getByText('ZA Bank total revenue for 2023 is ...')).toBeInTheDocument();
  });

  it('shows analysis notice during streaming after defer threshold', () => {
    vi.setSystemTime(new Date('2026-04-12T18:00:00.000Z'));

    const activeTraces: TraceStep[] = [
      { event: 'thinking', data: { message: 'Classifying your question...' }, timestamp: Date.now() - 5000 },
    ];

    renderWithIntl(<ChatMessages messages={[]} activeTraces={activeTraces} isStreaming />);
    const notices = screen.queryAllByText('Performing deep professional analysis and cross-verification');
    expect(notices.length).toBeGreaterThan(0);
  });

  it('updates streaming elapsed time for active traces', () => {
    vi.setSystemTime(new Date('2026-04-12T18:00:00.000Z'));

    const activeTraces: TraceStep[] = [
      { event: 'thinking', data: { message: 'Classifying your question...' }, timestamp: Date.now() - 5000 },
    ];

    renderWithIntl(<ChatMessages messages={[]} activeTraces={activeTraces} isStreaming />);
    const timers5 = screen.queryAllByText(/5s/);
    expect(timers5.length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const timers7 = screen.queryAllByText(/7s/);
    expect(timers7.length).toBeGreaterThan(0);
  });

  it('does not show notice when only generating follow-up suggestions', () => {
    vi.setSystemTime(new Date('2026-04-12T18:00:10.000Z'));

    const activeTraces: TraceStep[] = [
      {
        event: 'thinking',
        data: { message: 'Generating follow-up suggestions' },
        timestamp: Date.now() - 10000,
      },
    ];

    renderWithIntl(<ChatMessages messages={[]} activeTraces={activeTraces} isStreaming />);
    const notices = screen.queryAllByText('Performing deep professional analysis and cross-verification');
    expect(notices).toHaveLength(0);
  });

  it('shows a default self-introduction when chat is empty', () => {
    renderWithIntl(<ChatMessages messages={[]} activeTraces={[]} isStreaming={false} />);
    expect(screen.getByText(/LIULIAN Assistant/)).toBeInTheDocument();
  });
});
