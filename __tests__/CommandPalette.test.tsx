import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import CommandPalette from '@/components/chat/CommandPalette';

describe('CommandPalette', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render command items when closed', () => {
    renderWithIntl(
      <CommandPalette open={false} onClose={vi.fn()} onRun={vi.fn()} />,
    );
    const buttons = screen.queryAllByRole('button');
    const cmdButtons = buttons.filter((b) =>
      b.getAttribute('aria-label')?.includes('command'),
    );
    expect(cmdButtons.length).toBe(0);
  });

  it('renders content when open', () => {
    renderWithIntl(
      <CommandPalette open={true} onClose={vi.fn()} onRun={vi.fn()} />,
    );
    const allText = document.body.textContent ?? '';
    expect(allText.length).toBeGreaterThan(0);
  });

  it('calls onClose when Escape is pressed while open', () => {
    const onClose = vi.fn();
    renderWithIntl(
      <CommandPalette open={true} onClose={onClose} onRun={vi.fn()} />,
    );
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    window.dispatchEvent(event);
    expect(onClose).toHaveBeenCalled();
  });
});
