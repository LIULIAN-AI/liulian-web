import { describe, it, expect, vi } from 'vitest';
import { renderWithIntl, screen } from './test-utils';
import { fireEvent } from '@testing-library/react';
import SuggestedChips from '@/components/chat/SuggestedChips';

describe('SuggestedChips', () => {
  it('renders chips', () => {
    renderWithIntl(<SuggestedChips chips={['Chip A', 'Chip B']} onChipClick={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: 'Chip A' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Chip B' }).length).toBeGreaterThan(0);
  });

  it('calls onChipClick with chip text and rect', () => {
    const onClick = vi.fn();
    renderWithIntl(<SuggestedChips chips={['Chip A']} onChipClick={onClick} />);
    const buttons = screen.getAllByRole('button', { name: 'Chip A' });
    fireEvent.click(buttons[buttons.length - 1]);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toBe('Chip A');
    expect(onClick.mock.calls[0][1]).toBeDefined();
  });

  it('renders nothing when chips array is empty', () => {
    const { container } = renderWithIntl(<SuggestedChips chips={[]} onChipClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
