import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import MessageBubble from '@/components/chat/MessageBubble';
import type { Message } from '@/components/chat/types';

describe('MessageBubble', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders user message content', () => {
    const msg: Message = { id: '1', type: 'user', content: 'Hello' };
    renderWithIntl(<MessageBubble message={msg} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    const msg: Message = {
      id: '2',
      type: 'assistant',
      content: 'Hi there!',
      references: [],
      traces: [],
    };
    renderWithIntl(<MessageBubble message={msg} />);
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders context message with ContextCard', () => {
    const msg: Message = {
      id: '3',
      type: 'context',
      component: 'about',
      data: { ceo: 'John Doe', bankName: 'ZA Bank' },
    };
    renderWithIntl(<MessageBubble message={msg} />);
    expect(screen.getByText(/ZA Bank/)).toBeInTheDocument();
  });

  it('shows export button for table content with references', () => {
    const msg: Message = {
      id: '4',
      type: 'assistant',
      content: '| Bank | Revenue |\n| --- | --- |\n| ZA | 1B |',
      references: [{ tool: 'db_reader', table: 'financials' }],
      traces: [],
    };
    renderWithIntl(<MessageBubble message={msg} />);
    const exportButtons = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-label')?.match(/export/i),
    );
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('shows copy action for every assistant response', () => {
    const msg: Message = {
      id: '5',
      type: 'assistant',
      content: 'Answer here.',
      references: [],
      traces: [],
    };
    renderWithIntl(<MessageBubble message={msg} />);
    const buttons = screen.getAllByRole('button');
    const copyBtn = buttons.find((b) => b.getAttribute('aria-label')?.match(/copy/i));
    expect(copyBtn).toBeTruthy();
  });

  it('does not show export for plain text responses', () => {
    const plainMessage: Message = {
      id: '6',
      type: 'assistant',
      content: 'This is plain text without any table.',
      references: [],
      traces: [],
    };
    renderWithIntl(<MessageBubble message={plainMessage} />);
    const exportBtns = screen.queryAllByLabelText(/export/i);
    expect(exportBtns).toHaveLength(0);
  });

  it('shows export for responses with markdown table', () => {
    const tableMessage: Message = {
      id: '7',
      type: 'assistant',
      content: '| Bank | CEO |\n| --- | --- |\n| ZA Bank | Ada Lee |',
      references: [],
      traces: [],
    };
    renderWithIntl(<MessageBubble message={tableMessage} />);
    const allButtons = screen.getAllByRole('button');
    const exportBtn = allButtons.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('export'),
    );
    expect(exportBtn).toBeTruthy();
  });

  it('shows error state for failed assistant messages', () => {
    const msg: Message = {
      id: '8',
      type: 'assistant',
      content: 'Error occurred',
      references: [],
      traces: [],
      error: true,
      errorRaw: 'Connection timeout',
    };
    renderWithIntl(<MessageBubble message={msg} />);
    expect(document.body.textContent).toContain('Connection timeout');
  });
});
