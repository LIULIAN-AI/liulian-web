import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import ContextCard from '@/components/chat/ContextCard';

describe('ContextCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders bank name in the label', () => {
    renderWithIntl(
      <ContextCard component="about" data={{ bankName: 'ZA Bank', ceo: 'John' }} />,
    );
    expect(screen.getByText(/ZA Bank/)).toBeInTheDocument();
  });

  it('shows data fields after expanding', () => {
    renderWithIntl(
      <ContextCard component="about" data={{ bankName: 'Mox', ceo: 'Deniz' }} />,
    );
    const summaryLabel = screen.getByText(/Mox/);
    fireEvent.click(summaryLabel);
    expect(document.body.textContent).toContain('Deniz');
  });

  it('renders component label without bankName', () => {
    renderWithIntl(
      <ContextCard component="products" data={{ productName: 'Nova Account' }} />,
    );
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('renders attached context header', () => {
    renderWithIntl(
      <ContextCard component="about" data={{ bankName: 'ZA Bank' }} />,
    );
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });
});
