import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ChatContext } from '@/contexts/ChatContext';
import type { ChatContextValue, ChatState } from '@/components/chat/types';
import { vi } from 'vitest';
import en from '@/messages/en.json';

const defaultState: ChatState = {
  panelState: 'default',
  status: 'idle',
  conversationId: 'test-conv-1',
  messages: [],
  suggestions: [],
  activeTraces: [],
  interactionPath: [],
  archives: [],
  onlineMode: 'fallback',
};

const defaultContext: ChatContextValue = {
  state: defaultState,
  dispatch: vi.fn(),
  sendMessage: vi.fn(),
  injectContext: vi.fn(),
  abort: vi.fn(),
  setPanelState: vi.fn(),
  setOnlineMode: vi.fn(),
  startNewChat: vi.fn(),
  loadArchive: vi.fn(),
  renameSession: vi.fn(),
  truncateFrom: vi.fn(),
  setFeedback: vi.fn(),
  togglePin: vi.fn(),
  renameArchive: vi.fn(),
  deleteArchive: vi.fn(),
};

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <ChatContext.Provider value={defaultContext}>
        {children}
      </ChatContext.Provider>
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { render, screen, waitFor, act, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
