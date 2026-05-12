import { describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import TraceAccordion from '@/components/chat/TraceAccordion';
import type { TraceStep } from '@/components/chat/types';

describe('TraceAccordion', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders trace steps', () => {
    const traces: TraceStep[] = [
      { event: 'thinking', data: { message: 'Classifying your question...' }, timestamp: Date.now() - 3000 },
      { event: 'tool_call', data: { tool: 'db_reader' }, timestamp: Date.now() - 2000 },
    ];
    renderWithIntl(<TraceAccordion traces={traces} />);
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('renders nothing for empty traces', () => {
    const { container } = renderWithIntl(<TraceAccordion traces={[]} />);
    expect(container.textContent?.trim() || '').toBe('');
  });

  it('shows tool name for tool_call events', () => {
    const traces: TraceStep[] = [
      { event: 'tool_call', data: { tool: 'calculator' }, timestamp: Date.now() },
    ];
    renderWithIntl(<TraceAccordion traces={traces} />);
    expect(document.body.textContent).toContain('calculator');
  });
});
