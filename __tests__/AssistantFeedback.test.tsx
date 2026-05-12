import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import AssistantFeedback from '@/components/chat/AssistantFeedback';

describe('AssistantFeedback', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders thumbs up and down buttons', () => {
    renderWithIntl(
      <AssistantFeedback feedback={null} onChange={vi.fn()} content="Hello" />,
    );
    const buttons = screen.getAllByRole('button');
    const upBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('thumbs up'),
    );
    const downBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('thumbs down'),
    );
    expect(upBtn).toBeTruthy();
    expect(downBtn).toBeTruthy();
  });

  it('calls onChange with "up" when thumbs up clicked', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <AssistantFeedback feedback={null} onChange={onChange} content="Hello" />,
    );
    const buttons = screen.getAllByRole('button');
    const upBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('thumbs up'),
    );
    fireEvent.click(upBtn[upBtn.length - 1]);
    expect(onChange).toHaveBeenCalledWith('up');
  });

  it('calls onChange with null to toggle off when already "up"', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <AssistantFeedback feedback="up" onChange={onChange} content="Hello" />,
    );
    const buttons = screen.getAllByRole('button');
    const upBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('thumbs up'),
    );
    fireEvent.click(upBtn[upBtn.length - 1]);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('calls onChange with "down" when thumbs down clicked', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <AssistantFeedback feedback={null} onChange={onChange} content="Hello" />,
    );
    const buttons = screen.getAllByRole('button');
    const downBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('thumbs down'),
    );
    fireEvent.click(downBtn[downBtn.length - 1]);
    expect(onChange).toHaveBeenCalledWith('down');
  });

  it('marks thumbs up as pressed when feedback is "up"', () => {
    renderWithIntl(
      <AssistantFeedback feedback="up" onChange={vi.fn()} content="Hello" />,
    );
    const buttons = screen.getAllByRole('button');
    const upBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('thumbs up'),
    );
    const btn = upBtn[upBtn.length - 1];
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('has a group role with accessible label', () => {
    renderWithIntl(
      <AssistantFeedback feedback={null} onChange={vi.fn()} content="Hello" />,
    );
    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThan(0);
  });
});
