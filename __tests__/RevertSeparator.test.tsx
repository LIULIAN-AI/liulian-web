import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import RevertSeparator from '@/components/chat/RevertSeparator';

describe('RevertSeparator', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when discardCount is 0', () => {
    const { container } = renderWithIntl(
      <RevertSeparator discardCount={0} onConfirm={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders separator role when discardCount > 0', () => {
    renderWithIntl(<RevertSeparator discardCount={3} onConfirm={vi.fn()} />);
    const separators = screen.getAllByRole('separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('shows hint on mouse enter, hides on mouse leave', () => {
    renderWithIntl(<RevertSeparator discardCount={2} onConfirm={vi.fn()} />);
    const separator = screen.getAllByRole('separator')[0];

    fireEvent.mouseEnter(separator);
    const hintBtns = screen.queryAllByRole('button');
    expect(hintBtns.length).toBeGreaterThan(0);

    fireEvent.mouseLeave(separator);
  });

  it('calls onConfirm after two clicks (arm then confirm)', () => {
    const onConfirm = vi.fn();
    renderWithIntl(<RevertSeparator discardCount={2} onConfirm={onConfirm} />);
    const separator = screen.getAllByRole('separator')[0];

    fireEvent.mouseEnter(separator);
    const hintBtn = screen.getAllByRole('button');
    fireEvent.click(hintBtn[hintBtn.length - 1]);

    const armedBtn = screen.getAllByRole('button');
    fireEvent.click(armedBtn[armedBtn.length - 1]);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
