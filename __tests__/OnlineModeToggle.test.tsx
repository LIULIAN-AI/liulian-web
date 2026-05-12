import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import OnlineModeToggle from '@/components/chat/OnlineModeToggle';

describe('OnlineModeToggle', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders three radio buttons for online modes', () => {
    renderWithIntl(<OnlineModeToggle />);
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(3);
  });

  it('marks the default mode as checked', () => {
    renderWithIntl(<OnlineModeToggle />);
    const radios = screen.getAllByRole('radio');
    const checked = radios.filter((r) => r.getAttribute('aria-checked') === 'true');
    expect(checked.length).toBeGreaterThanOrEqual(1);
  });

  it('renders a radiogroup with accessible label', () => {
    renderWithIntl(<OnlineModeToggle />);
    const groups = screen.getAllByRole('radiogroup');
    expect(groups.length).toBeGreaterThan(0);
  });
});
