import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { renderWithIntl } from './test-utils';
import ChipFlyOverlay from '@/components/chat/ChipFlyOverlay';

describe('ChipFlyOverlay', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when payload is null', () => {
    const { container } = renderWithIntl(
      <ChipFlyOverlay payload={null} onComplete={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders ghost chip when payload is provided', () => {
    const payload = {
      text: 'Tell me more',
      from: { x: 100, y: 200, width: 120, height: 36 },
      to: { x: 100, y: 400 },
    };
    renderWithIntl(
      <ChipFlyOverlay payload={payload} onComplete={vi.fn()} />,
    );
    expect(document.body.textContent).toContain('Tell me more');
  });
});
