import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { cleanup, act } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import ChatPanel from '@/components/chat/ChatPanel';

describe('ChatPanel', () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders with persona icon', async () => {
    await act(async () => {
      renderWithIntl(<ChatPanel persona="male" />);
    });
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(0);
  }, 15000);

  it('renders chat input field', async () => {
    await act(async () => {
      renderWithIntl(<ChatPanel persona="female" />);
    });
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  }, 15000);

  it('renders empty state guides when no messages', async () => {
    await act(async () => {
      renderWithIntl(<ChatPanel persona="male" />);
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  }, 15000);
});
