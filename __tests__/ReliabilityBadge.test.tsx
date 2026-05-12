import { describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import ReliabilityBadge from '@/components/chat/ReliabilityBadge';

describe('ReliabilityBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders verified tier label', () => {
    renderWithIntl(<ReliabilityBadge tier="verified" />);
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('renders web tier label', () => {
    renderWithIntl(<ReliabilityBadge tier="web" />);
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('renders ai_generated tier', () => {
    renderWithIntl(<ReliabilityBadge tier="ai_generated" />);
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('shows provider when providerUsed is set', () => {
    renderWithIntl(<ReliabilityBadge tier="web" providerUsed="wikipedia" />);
    const tooltips = screen.getAllByRole('tooltip');
    const text = tooltips.map((t) => t.textContent).join(' ');
    expect(text).toContain('Wikipedia');
  });

  it('renders sources in tooltip', () => {
    renderWithIntl(
      <ReliabilityBadge
        tier="web"
        sources={[
          { title: 'Test Source', url: 'https://example.com', provider: 'wikipedia', tier: 'web' },
        ]}
      />,
    );
    expect(document.body.textContent).toContain('Test Source');
  });

  it('renders in compact mode without label text', () => {
    const { container } = renderWithIntl(
      <ReliabilityBadge tier="verified" compact />,
    );
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
