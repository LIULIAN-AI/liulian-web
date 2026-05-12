import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import CodeBlock from '@/components/chat/CodeBlock';

describe('CodeBlock', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the code content', () => {
    renderWithIntl(<CodeBlock code="console.log('hello')" language="javascript" />);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it('displays language label', () => {
    renderWithIntl(<CodeBlock code="x = 1" language="python" />);
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('defaults language to "text" when not provided', () => {
    renderWithIntl(<CodeBlock code="raw stuff" />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('renders copy button', () => {
    renderWithIntl(<CodeBlock code="test" language="ts" />);
    const buttons = screen.getAllByRole('button');
    const copyBtn = buttons.find((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('copy'),
    );
    expect(copyBtn).toBeTruthy();
  });

  it('copies code to clipboard on button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderWithIntl(<CodeBlock code="copied-text" language="ts" />);
    const buttons = screen.getAllByRole('button');
    const copyBtn = buttons.filter((b) =>
      b.getAttribute('aria-label')?.toLowerCase().includes('copy'),
    );
    fireEvent.click(copyBtn[copyBtn.length - 1]);

    expect(writeText).toHaveBeenCalledWith('copied-text');
  });
});
