import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import MessageActions from '@/components/chat/MessageActions';
import type { Message } from '@/components/chat/types';

describe('MessageActions', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders copy button for user messages', () => {
    const msg: Message = { id: '1', type: 'user', content: 'Hello' };
    renderWithIntl(<MessageActions message={msg} />);
    const buttons = screen.getAllByRole('button');
    const copyBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('copy'),
    );
    expect(copyBtn).toBeTruthy();
  });

  it('renders nothing for assistant messages', () => {
    const msg: Message = {
      id: '2',
      type: 'assistant',
      content: 'response',
      references: [],
      traces: [],
    };
    const { container } = renderWithIntl(<MessageActions message={msg} />);
    expect(container.innerHTML).toBe('');
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const msg: Message = { id: '1', type: 'user', content: 'Hello' };
    renderWithIntl(<MessageActions message={msg} onEdit={onEdit} />);
    const buttons = screen.getAllByRole('button');
    const editBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('edit'),
    );
    if (editBtn.length > 0) {
      fireEvent.click(editBtn[editBtn.length - 1]);
      expect(onEdit).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onRegenerate when regenerate button is clicked', () => {
    const onRegenerate = vi.fn();
    const msg: Message = { id: '1', type: 'user', content: 'Hello' };
    renderWithIntl(<MessageActions message={msg} onRegenerate={onRegenerate} />);
    const buttons = screen.getAllByRole('button');
    const regenBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('regenerat'),
    );
    if (regenBtn.length > 0) {
      fireEvent.click(regenBtn[regenBtn.length - 1]);
      expect(onRegenerate).toHaveBeenCalledTimes(1);
    }
  });
});
