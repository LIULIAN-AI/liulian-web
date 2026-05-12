import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import InjectContextButton from '@/components/chat/InjectContextButton';

describe('InjectContextButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a button with accessible label', () => {
    renderWithIntl(
      <InjectContextButton component="about" data={{ bankName: 'ZA Bank' }} />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls injectContext when clicked', () => {
    renderWithIntl(
      <InjectContextButton component="products" data={{ productName: 'Nova' }} />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
  });

  it('uses custom ariaLabel when provided', () => {
    renderWithIntl(
      <InjectContextButton
        component="about"
        data={{ bankName: 'Mox' }}
        ariaLabel="Ask about Mox Bank"
      />,
    );
    const buttons = screen.getAllByRole('button');
    const btn = buttons.find((b) =>
      b.getAttribute('aria-label') === 'Ask about Mox Bank',
    );
    expect(btn).toBeTruthy();
  });
});
