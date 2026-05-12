import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { cleanup, fireEvent, act, within } from '@testing-library/react';
import { renderWithIntl } from './test-utils';
import ChatBubble from '@/components/chat/ChatBubble';

describe('ChatBubble', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders a button element after mount', async () => {
    await act(async () => {
      renderWithIntl(<ChatBubble />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const allButtons = document.querySelectorAll('button');
    const toggleBtn = Array.from(allButtons).find((b) => {
      const label = (b.getAttribute('aria-label') ?? '').toLowerCase();
      return label.includes('chat') || label.includes('toggle');
    });
    expect(toggleBtn).toBeTruthy();
  }, 15000);

  it('can be clicked without errors', async () => {
    await act(async () => {
      renderWithIntl(<ChatBubble />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const allButtons = document.querySelectorAll('button');
    const toggleBtn = Array.from(allButtons).find((b) => {
      const label = (b.getAttribute('aria-label') ?? '').toLowerCase();
      return label.includes('chat') || label.includes('toggle');
    });
    if (toggleBtn) {
      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);
    }
  }, 15000);
});
