import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import EmptyStateGuides from '@/components/chat/EmptyStateGuides';

describe('EmptyStateGuides', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders four starter guide cards', () => {
    renderWithIntl(<EmptyStateGuides onPick={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('calls onPick when a guide card is clicked', () => {
    const onPick = vi.fn();
    renderWithIntl(<EmptyStateGuides onPick={onPick} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(typeof onPick.mock.calls[0][0]).toBe('string');
    expect(onPick.mock.calls[0][0].length).toBeGreaterThan(0);
  });
});
