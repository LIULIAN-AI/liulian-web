import { describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import MarkdownView from '@/components/chat/MarkdownView';

describe('MarkdownView', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders plain text', () => {
    renderWithIntl(<MarkdownView content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bold markdown', () => {
    renderWithIntl(<MarkdownView content="This is **bold** text" />);
    const boldEl = screen.getByText('bold');
    expect(boldEl.tagName).toBe('STRONG');
  });

  it('renders links with target _blank', () => {
    renderWithIntl(<MarkdownView content="[Click here](https://example.com)" />);
    const link = screen.getByText('Click here');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('renders GFM tables', () => {
    const table = '| A | B |\n| --- | --- |\n| 1 | 2 |';
    renderWithIntl(<MarkdownView content={table} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders inline code', () => {
    renderWithIntl(<MarkdownView content="Use `npm install` to install" />);
    const code = screen.getByText('npm install');
    expect(code.tagName).toBe('CODE');
  });
});
