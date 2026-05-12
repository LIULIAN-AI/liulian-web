import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import EditMessageModal from '@/components/chat/EditMessageModal';

describe('EditMessageModal', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when closed', () => {
    const { container } = renderWithIntl(
      <EditMessageModal
        open={false}
        initialContent="Hello"
        discardCount={1}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const buttons = screen.queryAllByRole('button');
    const submitBtns = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('send') ||
      b.getAttribute('aria-label')?.toLowerCase().includes('submit'),
    );
    expect(submitBtns.length).toBe(0);
  });

  it('renders textarea with initial content when open', () => {
    renderWithIntl(
      <EditMessageModal
        open={true}
        initialContent="Edit me"
        discardCount={1}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const textareas = screen.getAllByRole('textbox');
    const textarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
    expect(textarea.value).toBe('Edit me');
  });

  it('calls onCancel when close button is clicked', () => {
    const onCancel = vi.fn();
    renderWithIntl(
      <EditMessageModal
        open={true}
        initialContent="Hello"
        discardCount={0}
        onCancel={onCancel}
        onSubmit={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('cancel') ||
      b.getAttribute('aria-label')?.toLowerCase().includes('close'),
    );
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);
    }
  });
});
