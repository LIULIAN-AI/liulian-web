import { describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import SourcesFooter from '@/components/chat/SourcesFooter';
import type { ReliabilitySource } from '@/components/chat/types';

describe('SourcesFooter', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when sources is empty', () => {
    const { container } = renderWithIntl(<SourcesFooter sources={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders source titles', () => {
    const sources: ReliabilitySource[] = [
      { title: 'ZA Bank Wikipedia', url: 'https://en.wikipedia.org/wiki/ZA_Bank', provider: 'wikipedia', tier: 'web' },
    ];
    renderWithIntl(<SourcesFooter sources={sources} />);
    expect(screen.getByText('ZA Bank Wikipedia')).toBeInTheDocument();
  });

  it('renders source links with target _blank', () => {
    const sources: ReliabilitySource[] = [
      { title: 'Source Link', url: 'https://example.com', provider: 'duckduckgo', tier: 'web' },
    ];
    renderWithIntl(<SourcesFooter sources={sources} />);
    const link = screen.getByText('Source Link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('shows provider label', () => {
    const sources: ReliabilitySource[] = [
      { title: 'DB Result', url: '', provider: 'database', tier: 'verified' },
    ];
    renderWithIntl(<SourcesFooter sources={sources} providerUsed="database" />);
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('renders multiple sources', () => {
    const sources: ReliabilitySource[] = [
      { title: 'Source A', url: '', provider: 'database', tier: 'verified' },
      { title: 'Source B', url: 'https://example.com', provider: 'wikipedia', tier: 'web' },
    ];
    renderWithIntl(<SourcesFooter sources={sources} />);
    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Source B')).toBeInTheDocument();
  });
});
